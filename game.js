(function () {
  "use strict";

  /* ---------------------------------------------------------------
   * Data
   * ------------------------------------------------------------- */
  const CARS = [
    { id: "starter", name: "Corolla Draggy", price: 0, power: 90, weight: 1200, grip: 0.60, color: "#8a93a3" },
    { id: "gt", name: "GT Turbo", price: 3000, power: 150, weight: 1250, grip: 0.65, color: "#2980b9" },
    { id: "v8", name: "Muscle V8", price: 8000, power: 220, weight: 1450, grip: 0.60, color: "#c0392b" },
    { id: "rally", name: "Rally Beast", price: 15000, power: 260, weight: 1300, grip: 0.75, color: "#27ae60" },
    { id: "tuner", name: "Import Tuner", price: 25000, power: 320, weight: 1150, grip: 0.70, color: "#f39c12" },
    { id: "hyper", name: "Hyper Dragster", price: 50000, power: 500, weight: 900, grip: 0.80, color: "#8e44ad" },
  ];

  const UPGRADES = [
    { key: "engine", name: "Κινητήρας", baseCost: 400 },
    { key: "turbo", name: "Turbo", baseCost: 600 },
    { key: "tires", name: "Ελαστικά", baseCost: 350 },
    { key: "weight", name: "Αφαίρεση Βάρους", baseCost: 500 },
  ];
  const MAX_LEVEL = 5;

  const RIVALS = [
    { id: "r1", name: "Νίκος με το Fiat", power: 80, weight: 1250, grip: 0.55, shiftSkill: 0.68, reward: 500, loseReward: 80 },
    { id: "r2", name: "Στέλιος Sedan", power: 120, weight: 1300, grip: 0.60, shiftSkill: 0.70, reward: 900, loseReward: 120 },
    { id: "r3", name: "Coupe Killer", power: 170, weight: 1250, grip: 0.65, shiftSkill: 0.73, reward: 1500, loseReward: 180 },
    { id: "r4", name: "Τούρμπο Τάκης", power: 230, weight: 1300, grip: 0.68, shiftSkill: 0.76, reward: 2500, loseReward: 300 },
    { id: "r5", name: "Rally Queen", power: 280, weight: 1200, grip: 0.78, shiftSkill: 0.80, reward: 4000, loseReward: 450 },
    { id: "r6", name: "Hyper Villain", power: 450, weight: 950, grip: 0.80, shiftSkill: 0.85, reward: 7000, loseReward: 700 },
  ];

  const DIST = 300; // meters
  const GEAR_FRACS = [0.14, 0.27, 0.42, 0.60, 0.80, 1.0];
  const GEAR_MIN_MULT = 0.55;
  const K = 140;
  const CD = 1.55;
  const SAVE_KEY = "dragRacingSaveV1";

  /* ---------------------------------------------------------------
   * State
   * ------------------------------------------------------------- */
  function defaultState() {
    return {
      cash: 1000,
      ownedCars: { starter: { engine: 0, turbo: 0, tires: 0, weight: 0 } },
      activeCar: "starter",
      rivalsBeaten: [],
      bestTimes: {},
    };
  }

  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      if (!parsed.ownedCars || !parsed.ownedCars.starter) return defaultState();
      return parsed;
    } catch (e) {
      return defaultState();
    }
  }

  function saveState() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function getCarDef(id) { return CARS.find((c) => c.id === id); }

  function upgradeCost(carDef, upKey, level) {
    const def = UPGRADES.find((u) => u.key === upKey);
    const priceFactor = 1 + carDef.price / 6000;
    return Math.round(def.baseCost * priceFactor * Math.pow(level + 1, 1.6));
  }

  function getEffectiveStats(carId) {
    const car = getCarDef(carId);
    const upg = state.ownedCars[carId];
    const power = car.power * (1 + upg.engine * 0.12 + upg.turbo * 0.18);
    const weight = car.weight * (1 - upg.weight * 0.04);
    const grip = Math.min(0.95, car.grip + upg.tires * 0.04);
    return { power, weight, grip, color: car.color, name: car.name };
  }

  /* ---------------------------------------------------------------
   * Race physics
   * ------------------------------------------------------------- */
  function torqueCurve(rpm) {
    const d = (rpm - 0.78) / 0.5;
    return Math.max(0.35, 1 - d * d * 1.6);
  }

  function gearMaxSpeeds(topSpeed) { return GEAR_FRACS.map((f) => f * topSpeed); }
  function gearMinSpeed(maxSpeeds, gear) {
    if (gear === 1) return 0;
    return maxSpeeds[gear - 2] * GEAR_MIN_MULT;
  }

  function makeRacer(stats, isPlayer) {
    const topSpeed = Math.sqrt((K * stats.power * 0.55) / CD) * 0.82;
    return {
      stats, isPlayer, topSpeed,
      maxSpeeds: gearMaxSpeeds(topSpeed),
      gear: 1, speed: 0, dist: 0, rpm: 0,
      boostT: 0, bogT: 0,
      finished: false, time: 0,
      throttle: false,
    };
  }

  function currentRpm(r) {
    const maxS = r.maxSpeeds[r.gear - 1];
    const minS = gearMinSpeed(r.maxSpeeds, r.gear);
    return Math.max(0, Math.min(1, (r.speed - minS) / (maxS - minS)));
  }

  // Returns shift feedback string or null
  function tryShift(r) {
    if (r.gear >= 6) return null;
    r.gear++;
    const newRpm = currentRpm(r);
    if (newRpm >= 0.65 && newRpm <= 0.9) { r.boostT = 0.3; return "perfect"; }
    if (newRpm < 0.35) { r.bogT = 0.4; return "bog"; }
    return "ok";
  }

  function updateRacer(r, dt, t) {
    if (r.finished) return;
    r.rpm = currentRpm(r);

    // AI auto-shift
    if (!r.isPlayer && r.gear < 6 && r.rpm >= r.aiShiftTarget) {
      tryShift(r);
    }
    // AI auto redline-safety: nothing extra needed, capped by maxS.

    const maxS = r.maxSpeeds[r.gear - 1];
    let torque = torqueCurve(r.rpm);
    if (r.boostT > 0) { torque += 0.15; r.boostT -= dt; }
    if (r.bogT > 0) { torque *= 0.55; r.bogT -= dt; }

    let traction = 1;
    if (r.gear === 1 && r.speed < 8) {
      traction = Math.max(0.35, Math.min(1, r.stats.grip * 1.3));
    }

    const throttle = r.isPlayer ? (r.throttle ? 1 : 0) : 1;
    let accel = (K * r.stats.power * torque * traction * throttle) / r.stats.weight
      - (CD * r.speed * r.speed) / r.stats.weight;

    r.speed += accel * dt;
    if (r.speed > maxS) r.speed = maxS;
    if (r.speed < 0) r.speed = 0;
    r.dist += r.speed * dt;

    if (r.dist >= DIST && !r.finished) {
      r.finished = true;
      r.dist = DIST;
      r.time = t;
    }
  }

  /* ---------------------------------------------------------------
   * UI wiring
   * ------------------------------------------------------------- */
  const $ = (id) => document.getElementById(id);

  function refreshCash() { $("cashValue").textContent = state.cash.toLocaleString("el-GR"); }

  function switchTab(name) {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === "tab-" + name));
    if (name === "garage") renderGarage();
    if (name === "shop") renderShop();
    if (name === "race") renderRivalList();
  }

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  /* ---- Rival select ---- */
  function renderRivalList() {
    const list = $("rivalList");
    list.innerHTML = "";
    RIVALS.forEach((rv, idx) => {
      const locked = idx > state.rivalsBeaten.length;
      const card = document.createElement("div");
      card.className = "rival-card" + (locked ? " locked" : "");
      const best = state.bestTimes[rv.id];
      card.innerHTML = `
        <h3>${locked ? "🔒 " : "🏁 "}${rv.name}</h3>
        <div class="stats">Ισχύς ${rv.power} · Βάρος ${rv.weight}kg · Πρόσφυση ${(rv.grip * 100).toFixed(0)}%</div>
        <div class="stats">Έπαθλο νίκης: <b style="color:var(--green)">${rv.reward}€</b></div>
        ${best ? `<div class="best-time">Καλύτερος χρόνος: ${best.toFixed(2)}s</div>` : ""}
        <button ${locked ? "disabled" : ""}>${locked ? "Κλειδωμένο" : "Πρόκληση"}</button>
      `;
      if (!locked) {
        card.querySelector("button").addEventListener("click", () => startRaceFlow(rv));
      }
      list.appendChild(card);
    });
  }

  /* ---- Garage ---- */
  function renderCarCard(carId, mode) {
    const car = getCarDef(carId);
    const owned = !!state.ownedCars[carId];
    const div = document.createElement("div");
    div.className = "car-card" + (mode === "garage" && state.activeCar === carId ? " active" : "");
    const stats = owned ? getEffectiveStats(carId) : { power: car.power, weight: car.weight, grip: car.grip };
    div.innerHTML = `
      <div class="car-swatch" style="background:${car.color}"></div>
      <h3>${car.name}</h3>
      <div class="car-stats">
        Ισχύς: ${Math.round(stats.power)}
        <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${Math.min(100, stats.power / 6)}%"></div></div>
        Βάρος: ${Math.round(stats.weight)}kg
        <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${Math.min(100, (1700 - stats.weight) / 12)}%"></div></div>
        Πρόσφυση: ${(stats.grip * 100).toFixed(0)}%
        <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${stats.grip * 100}%"></div></div>
      </div>
      ${mode === "shop" ? `<div class="price-tag">${owned ? "✅ Στην κατοχή σου" : car.price.toLocaleString("el-GR") + "€"}</div>` : ""}
    `;
    if (mode === "garage" && owned) {
      div.addEventListener("click", () => { state.activeCar = carId; saveState(); renderGarage(); });
    }
    if (mode === "shop" && !owned) {
      const btn = document.createElement("button");
      btn.className = "small-btn";
      btn.textContent = "Αγορά";
      btn.disabled = state.cash < car.price;
      btn.addEventListener("click", () => {
        if (state.cash < car.price) return;
        state.cash -= car.price;
        state.ownedCars[carId] = { engine: 0, turbo: 0, tires: 0, weight: 0 };
        saveState();
        refreshCash();
        renderShop();
      });
      div.appendChild(btn);
    }
    return div;
  }

  function renderGarage() {
    const grid = $("garageCars");
    grid.innerHTML = "";
    Object.keys(state.ownedCars).forEach((carId) => grid.appendChild(renderCarCard(carId, "garage")));

    const detail = $("garageDetail");
    const carId = state.activeCar;
    const car = getCarDef(carId);
    const upg = state.ownedCars[carId];
    detail.innerHTML = `<h3>Αναβαθμίσεις — ${car.name}</h3>`;
    UPGRADES.forEach((u) => {
      const level = upg[u.key];
      const maxed = level >= MAX_LEVEL;
      const cost = maxed ? 0 : upgradeCost(car, u.key, level);
      const row = document.createElement("div");
      row.className = "upgrade-row";
      let pips = "";
      for (let i = 0; i < MAX_LEVEL; i++) pips += `<div class="pip${i < level ? " filled" : ""}"></div>`;
      row.innerHTML = `
        <div class="upgrade-name">${u.name}</div>
        <div class="pips">${pips}</div>
        <button ${maxed || state.cash < cost ? "disabled" : ""}>${maxed ? "MAX" : cost.toLocaleString("el-GR") + "€"}</button>
      `;
      row.querySelector("button").addEventListener("click", () => {
        if (maxed || state.cash < cost) return;
        state.cash -= cost;
        upg[u.key]++;
        saveState();
        refreshCash();
        renderGarage();
      });
      detail.appendChild(row);
    });
  }

  function renderShop() {
    const grid = $("shopCars");
    grid.innerHTML = "";
    CARS.forEach((car) => grid.appendChild(renderCarCard(car.id, "shop")));
  }

  /* ---------------------------------------------------------------
   * Race flow
   * ------------------------------------------------------------- */
  let raceState = null; // { player, rival, running, started, falseStart }
  let raceRAF = null;
  let currentRival = null;

  function startRaceFlow(rival) {
    currentRival = rival;
    $("rivalSelect").classList.add("hidden");
    $("raceScreen").classList.remove("hidden");
    $("btnStart").classList.remove("hidden");
    $("btnGas").classList.add("hidden");
    $("btnShift").classList.add("hidden");
    $("btnBack").classList.remove("hidden");
    $("raceMessage").textContent = "";
    $("countdown").classList.add("hidden");
    drawTrack(0, 0);
    updateHud(null, null);
  }

  $("btnBack").addEventListener("click", () => {
    cancelRace();
    $("raceScreen").classList.add("hidden");
    $("rivalSelect").classList.remove("hidden");
    renderRivalList();
  });

  function cancelRace() {
    if (raceRAF) cancelAnimationFrame(raceRAF);
    raceRAF = null;
    raceState = null;
  }

  $("btnStart").addEventListener("click", () => {
    $("btnStart").classList.add("hidden");
    beginCountdown();
  });

  function beginCountdown() {
    const playerStats = getEffectiveStats(state.activeCar);
    const rivalStats = { power: currentRival.power, weight: currentRival.weight, grip: currentRival.grip };
    const player = makeRacer(playerStats, true);
    const rival = makeRacer(rivalStats, false);
    rival.aiShiftTarget = currentRival.shiftSkill + (Math.random() * 0.04 - 0.02);
    raceState = { player, rival, phase: "countdown", falseStart: false, t: 0 };

    const cd = $("countdown");
    const bulbs = cd.querySelectorAll(".bulb");
    bulbs.forEach((b) => b.classList.remove("lit"));
    cd.classList.remove("hidden");
    $("raceMessage").textContent = "";
    let n = 3;
    bulbs[0].classList.add("lit");
    const iv = setInterval(() => {
      n--;
      if (n > 0) { bulbs[3 - n].classList.add("lit"); }
      else if (n === 0) { bulbs[3].classList.add("lit"); }
      else {
        clearInterval(iv);
        cd.classList.add("hidden");
        if (!raceState.falseStart) {
          raceState.phase = "racing";
          $("btnGas").classList.remove("hidden");
          $("btnShift").classList.remove("hidden");
          startLoop();
        }
      }
    }, 700);
  }

  function triggerFalseStart() {
    if (!raceState || raceState.phase !== "countdown" || raceState.falseStart) return;
    raceState.falseStart = true;
    $("countdown").classList.add("hidden");
    $("raceMessage").textContent = "⛔ ΨΕΥΤΙΚΗ ΕΚΚΙΝΗΣΗ! Ξαναπροσπάθησε.";
    $("btnStart").classList.remove("hidden");
  }

  function startLoop() {
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      raceState.t += dt;
      updateRacer(raceState.player, dt, raceState.t);
      updateRacer(raceState.rival, dt, raceState.t);
      drawTrack(raceState.player.dist / DIST, raceState.rival.dist / DIST);
      updateHud(raceState.player, raceState.rival);

      if (raceState.player.finished || raceState.rival.finished) {
        finishRace();
        return;
      }
      raceRAF = requestAnimationFrame(frame);
    }
    raceRAF = requestAnimationFrame(frame);
  }

  function finishRace() {
    const p = raceState ? raceState.player : null;
    const r = raceState ? raceState.rival : null;
    cancelRace();
    $("btnGas").classList.add("hidden");
    $("btnShift").classList.add("hidden");
    if (!p) return;
    const playerWon = p.finished && (!r.finished || p.time <= r.time);

    let reward;
    if (playerWon) {
      reward = currentRival.reward;
      const idx = RIVALS.findIndex((x) => x.id === currentRival.id);
      if (!state.rivalsBeaten.includes(currentRival.id)) state.rivalsBeaten.push(currentRival.id);
      if (!state.bestTimes[currentRival.id] || p.time < state.bestTimes[currentRival.id]) {
        state.bestTimes[currentRival.id] = p.time;
      }
    } else {
      reward = currentRival.loseReward;
    }
    state.cash += reward;
    saveState();
    refreshCash();

    $("resultTitle").textContent = playerWon ? "🏆 Νίκη!" : "💥 Ήττα";
    const fmtTime = (t) => (t ? t.toFixed(2) + "s" : "δεν τερμάτισες");
    $("resultDetail").innerHTML = `Ο χρόνος σου: <b>${fmtTime(p.time)}</b><br>
      Χρόνος αντιπάλου: <b>${fmtTime(r.time)}</b><br>
      Κέρδισες: <b style="color:var(--green)">${reward}€</b>`;
    $("resultModal").classList.remove("hidden");
  }

  $("resultAgain").addEventListener("click", () => {
    $("resultModal").classList.add("hidden");
    startRaceFlow(currentRival);
  });
  $("resultClose").addEventListener("click", () => {
    $("resultModal").classList.add("hidden");
    $("raceScreen").classList.add("hidden");
    $("rivalSelect").classList.remove("hidden");
    renderRivalList();
  });

  /* ---- input ---- */
  function setThrottle(on) {
    if (!raceState) {
      if (on) triggerFalseStart();
      return;
    }
    if (raceState.phase === "countdown") { if (on) triggerFalseStart(); return; }
    if (raceState.phase !== "racing") return;
    raceState.player.throttle = on;
  }

  function doShift() {
    if (!raceState || raceState.phase !== "racing") return;
    const result = tryShift(raceState.player);
    if (result === "perfect") flashMessage("✅ ΤΕΛΕΙΑ ΑΛΛΑΓΗ!", "var(--green)");
    else if (result === "bog") flashMessage("😬 Η μηχανή κόλλησε...", "var(--red)");
  }

  let msgTimeout = null;
  function flashMessage(text, color) {
    const el = $("raceMessage");
    el.textContent = text;
    el.style.color = color || "var(--accent)";
    clearTimeout(msgTimeout);
    msgTimeout = setTimeout(() => { el.textContent = ""; }, 700);
  }

  $("btnGas").addEventListener("mousedown", () => setThrottle(true));
  $("btnGas").addEventListener("touchstart", (e) => { e.preventDefault(); setThrottle(true); }, { passive: false });
  ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach((ev) =>
    $("btnGas").addEventListener(ev, () => setThrottle(false))
  );
  $("btnShift").addEventListener("click", doShift);

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") { e.preventDefault(); setThrottle(true); }
    if (e.code === "ArrowUp") { e.preventDefault(); doShift(); }
  });
  document.addEventListener("keyup", (e) => {
    if (e.code === "Space") { e.preventDefault(); setThrottle(false); }
  });

  /* ---------------------------------------------------------------
   * HUD + rendering
   * ------------------------------------------------------------- */
  function updateHud(player, rival) {
    if (!player) {
      $("playerRpmFill").style.width = "0%";
      $("rivalRpmFill").style.width = "0%";
      $("playerSpeed").textContent = "0";
      $("rivalSpeed").textContent = "0";
      $("playerGear").textContent = "1";
      $("rivalGear").textContent = "1";
      return;
    }
    $("playerRpmFill").style.width = Math.round(player.rpm * 100) + "%";
    $("rivalRpmFill").style.width = Math.round(rival.rpm * 100) + "%";
    $("playerSpeed").textContent = Math.round(player.speed * 3.6);
    $("rivalSpeed").textContent = Math.round(rival.speed * 3.6);
    $("playerGear").textContent = player.gear;
    $("rivalGear").textContent = rival.gear;
  }

  const canvas = $("raceCanvas");
  const ctx = canvas.getContext("2d");

  function drawCar(x, laneY, color) {
    ctx.save();
    ctx.translate(x, laneY);
    // wheels
    ctx.fillStyle = "#111";
    ctx.beginPath(); ctx.arc(-22, 16, 9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(22, 16, 9, 0, Math.PI * 2); ctx.fill();
    // body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-40, 16);
    ctx.lineTo(-34, -4);
    ctx.lineTo(-16, -18);
    ctx.lineTo(18, -18);
    ctx.lineTo(34, -4);
    ctx.lineTo(40, 16);
    ctx.closePath();
    ctx.fill();
    // window
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.moveTo(-12, -15);
    ctx.lineTo(-4, -4);
    ctx.lineTo(16, -4);
    ctx.lineTo(14, -15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawTrack(playerProgress, rivalProgress) {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#23262e";
    ctx.fillRect(0, 0, w, h);

    const laneH = h / 2;
    [0, 1].forEach((i) => {
      const y0 = i * laneH;
      ctx.fillStyle = i === 0 ? "#2b2f3a" : "#262a34";
      ctx.fillRect(0, y0, w, laneH);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.setLineDash([16, 14]);
      ctx.beginPath();
      ctx.moveTo(0, y0 + laneH / 2);
      ctx.lineTo(w, y0 + laneH / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // finish line
    const finishX = w - 50;
    for (let y = 0; y < h; y += 12) {
      ctx.fillStyle = (Math.floor(y / 12) % 2 === 0) ? "#fff" : "#000";
      ctx.fillRect(finishX, y, 8, 12);
    }

    const startX = 40;
    const trackLen = finishX - startX;
    const px = startX + Math.min(1, playerProgress) * trackLen;
    const rx = startX + Math.min(1, rivalProgress) * trackLen;

    const playerColor = getEffectiveStats(state.activeCar).color;
    const rivalColor = "#95a5a6";
    drawCar(px, laneH * 0.5, playerColor);
    drawCar(rx, laneH * 1.5, rivalColor);
  }

  /* ---------------------------------------------------------------
   * Reset save
   * ------------------------------------------------------------- */
  $("resetSave").addEventListener("click", () => {
    if (!confirm("Να διαγραφούν όλα τα αποθηκευμένα δεδομένα του παιχνιδιού;")) return;
    state = defaultState();
    saveState();
    refreshCash();
    renderRivalList();
    renderGarage();
    renderShop();
  });

  /* ---------------------------------------------------------------
   * Init
   * ------------------------------------------------------------- */
  refreshCash();
  renderRivalList();
  renderGarage();
  renderShop();
  drawTrack(0, 0);
})();
