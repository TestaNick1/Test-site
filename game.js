(function () {
  "use strict";

  /* ---------------------------------------------------------------
   * Data
   * ------------------------------------------------------------- */
  const CARS = [
    // Toyota
    { id: "starter", name: "Toyota Yaris", price: 0, power: 92, weight: 1080, grip: 0.55, color: "#b5453f" },
    { id: "corolla", name: "Toyota Corolla", price: 6000, power: 140, weight: 1300, grip: 0.62, color: "#d64541" },
    { id: "supra", name: "Toyota GR Supra", price: 32000, power: 340, weight: 1520, grip: 0.78, color: "#ff2d3d" },
    // Honda
    { id: "jazz", name: "Honda Jazz", price: 1500, power: 96, weight: 1110, grip: 0.55, color: "#6b7fa3" },
    { id: "civic", name: "Honda Civic", price: 12000, power: 180, weight: 1350, grip: 0.65, color: "#3f6fb0" },
    { id: "civictyper", name: "Honda Civic Type R", price: 26000, power: 330, weight: 1430, grip: 0.80, color: "#f2f4f7" },
    // Volkswagen
    { id: "polo", name: "VW Polo", price: 2800, power: 105, weight: 1160, grip: 0.58, color: "#9aa0a6" },
    { id: "golf", name: "VW Golf", price: 8500, power: 150, weight: 1350, grip: 0.65, color: "#5b6470" },
    { id: "golfr", name: "VW Golf R", price: 22000, power: 320, weight: 1500, grip: 0.82, color: "#1f3a93" },
    // Nissan
    { id: "micra", name: "Nissan Micra", price: 2000, power: 100, weight: 1110, grip: 0.55, color: "#d98c3d" },
    { id: "juke", name: "Nissan Juke", price: 4200, power: 115, weight: 1260, grip: 0.60, color: "#e07b39" },
    { id: "gtr", name: "Nissan GT-R", price: 55000, power: 570, weight: 1750, grip: 0.85, color: "#7d8188" },
  ];

  // Per-model side-profile silhouettes (nose points right). viewBox is 200x90.
  const CAR_SHAPES = {
    starter: { // Toyota Yaris — small rounded city hatch
      body: [[14,70],[14,54],[34,24],[70,18],[96,32],[150,32],[172,44],[180,70]],
      windows: [[[40,30],[68,22],[92,32],[86,42],[46,42]]],
      wheels: [{ cx: 36, cy: 70, r: 15 }, { cx: 154, cy: 70, r: 15 }],
    },
    corolla: { // Toyota Corolla — 3-box sedan, longer trunk deck
      body: [[8,70],[8,58],[30,50],[52,20],[92,15],[118,34],[160,34],[182,50],[190,70]],
      windows: [[[58,26],[90,20],[112,34],[64,36]]],
      wheels: [{ cx: 34, cy: 70, r: 15 }, { cx: 164, cy: 70, r: 15 }],
    },
    supra: { // Toyota GR Supra — long hood, short fastback cabin, ducktail
      body: [[16,64],[16,50],[50,20],[86,16],[100,34],[178,42],[190,58],[190,68],[16,68]],
      windows: [[[56,22],[84,18],[96,34],[62,36]]],
      wheels: [{ cx: 40, cy: 68, r: 17 }, { cx: 164, cy: 68, r: 17 }],
      extras: [{ pts: [[14,48],[26,44],[30,50],[16,52]], fill: "#343a46" }],
    },
    jazz: { // Honda Jazz — tall boxy hatch, upright tailgate
      body: [[16,70],[16,44],[22,16],[100,12],[124,32],[158,32],[178,48],[184,70]],
      windows: [[[30,22],[96,18],[118,32],[36,36]]],
      wheels: [{ cx: 38, cy: 70, r: 15 }, { cx: 158, cy: 70, r: 15 }],
    },
    civic: { // Honda Civic — sleeker, lower sedan
      body: [[8,70],[8,56],[28,48],[54,18],[96,13],[120,32],[162,32],[184,48],[192,70]],
      windows: [[[60,24],[92,17],[114,32],[66,34]]],
      wheels: [{ cx: 34, cy: 70, r: 15 }, { cx: 168, cy: 70, r: 15 }],
    },
    civictyper: { // Honda Civic Type R — hot hatch, big wing, splitter
      body: [[16,68],[16,48],[26,42],[38,16],[92,13],[116,32],[156,32],[178,46],[184,68]],
      windows: [[[46,22],[88,17],[110,32],[52,34]]],
      wheels: [{ cx: 38, cy: 68, r: 17 }, { cx: 160, cy: 68, r: 17 }],
      extras: [
        { pts: [[14,38],[36,34],[36,41],[14,46]], fill: "#343a46" },
        { pts: [[16,34],[19,35],[19,45],[16,44]], fill: "#343a46" },
        { pts: [[176,64],[188,64],[186,70],[174,70]], fill: "#343a46" },
      ],
    },
    polo: { // VW Polo — small, flat-roofed German hatch
      body: [[14,70],[14,52],[30,26],[62,18],[92,18],[112,34],[150,34],[172,46],[180,70]],
      windows: [[[38,26],[64,20],[90,20],[104,34],[44,36]]],
      wheels: [{ cx: 36, cy: 70, r: 15 }, { cx: 154, cy: 70, r: 15 }],
    },
    golf: { // VW Golf — longer hatch, flat roofline
      body: [[12,68],[12,50],[26,28],[56,17],[100,15],[126,32],[164,32],[182,46],[188,68]],
      windows: [[[34,26],[60,19],[98,17],[118,32],[40,36]]],
      wheels: [{ cx: 34, cy: 68, r: 15 }, { cx: 168, cy: 68, r: 15 }],
    },
    golfr: { // VW Golf R — Golf hatch + roof spoiler + diffuser
      body: [[12,68],[12,50],[26,28],[56,16],[100,14],[126,32],[164,32],[182,46],[188,68]],
      windows: [[[34,25],[60,18],[98,16],[118,32],[40,36]]],
      wheels: [{ cx: 34, cy: 68, r: 16 }, { cx: 168, cy: 68, r: 16 }],
      extras: [
        { pts: [[16,26],[32,21],[34,27],[18,31]], fill: "#343a46" },
        { pts: [[12,60],[28,60],[26,68],[12,68]], fill: "#343a46" },
      ],
    },
    micra: { // Nissan Micra — round, bubbly supermini, short wheelbase
      body: [[18,68],[18,50],[36,22],[64,16],[92,22],[130,22],[152,38],[168,50],[172,68]],
      windows: [[[42,26],[66,20],[88,26],[122,26],[132,38],[48,40]]],
      wheels: [{ cx: 40, cy: 68, r: 14 }, { cx: 150, cy: 68, r: 14 }],
    },
    juke: { // Nissan Juke — crossover: higher stance, cladding, big wheels
      body: [[14,64],[14,42],[30,18],[62,13],[102,13],[124,28],[168,28],[180,44],[184,64]],
      windows: [[[36,22],[64,17],[100,17],[118,28],[42,32]]],
      wheels: [{ cx: 38, cy: 64, r: 18 }, { cx: 158, cy: 64, r: 18 }],
      extras: [{ pts: [[16,58],[182,58],[182,64],[16,64]], fill: "rgba(15,15,18,0.35)" }],
    },
    gtr: { // Nissan GT-R — low wide supercar, big rear wing, splitter
      body: [[16,62],[16,48],[36,44],[54,18],[92,14],[126,18],[146,44],[168,44],[186,56],[190,62]],
      windows: [[[60,24],[90,19],[122,24],[128,40],[64,40]]],
      wheels: [{ cx: 42, cy: 62, r: 18 }, { cx: 160, cy: 62, r: 18 }],
      extras: [
        { pts: [[10,30],[38,26],[38,33],[10,37]], fill: "#343a46" },
        { pts: [[16,32],[20,32],[20,45],[16,45]], fill: "#343a46" },
        { pts: [[30,28],[34,28],[34,42],[30,42]], fill: "#343a46" },
        { pts: [[178,58],[192,58],[190,64],[176,64]], fill: "#343a46" },
      ],
    },
    rival: { // generic silhouette for AI opponents (no purchasable model)
      body: [[14,70],[14,52],[32,26],[64,17],[100,17],[122,34],[158,34],[178,46],[184,70]],
      windows: [[[40,26],[66,20],[98,20],[116,34],[46,36]]],
      wheels: [{ cx: 36, cy: 70, r: 15 }, { cx: 160, cy: 70, r: 15 }],
    },
  };

  function shadeColor(hex, percent) {
    const num = parseInt(hex.replace("#", ""), 16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00ff) + percent;
    let b = (num & 0x0000ff) + percent;
    r = Math.max(Math.min(255, r), 0);
    g = Math.max(Math.min(255, g), 0);
    b = Math.max(Math.min(255, b), 0);
    return "#" + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
  }

  let svgGradSeq = 0;

  function carSvg(carId, color) {
    const shape = CAR_SHAPES[carId] || CAR_SHAPES.rival;
    const uid = "g" + svgGradSeq++;
    const pts = (p) => p.map((xy) => xy.join(",")).join(" ");
    const light = shadeColor(color, 50);
    const dark = shadeColor(color, -35);
    let s = `<svg viewBox="0 0 200 90" preserveAspectRatio="xMidYMid meet">`;
    s += `<defs>
      <linearGradient id="body-${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${light}"/>
        <stop offset="55%" stop-color="${color}"/>
        <stop offset="100%" stop-color="${dark}"/>
      </linearGradient>
      <linearGradient id="glass-${uid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#c3ccd9"/>
        <stop offset="50%" stop-color="#5c6b80"/>
        <stop offset="100%" stop-color="#20262f"/>
      </linearGradient>
      <radialGradient id="rim-${uid}" cx="35%" cy="35%" r="70%">
        <stop offset="0%" stop-color="#e7e9ec"/>
        <stop offset="100%" stop-color="#8a8f96"/>
      </radialGradient>
    </defs>`;
    s += `<ellipse cx="100" cy="77" rx="86" ry="5" fill="rgba(0,0,0,0.4)"/>`;
    shape.wheels.forEach((w) => { s += wheelMarkup(w, uid); });
    s += `<polygon points="${pts(shape.body)}" fill="url(#body-${uid})"/>`;
    (shape.windows || []).forEach((w) => {
      s += `<polygon points="${pts(w)}" fill="url(#glass-${uid})"/>`;
    });
    (shape.extras || []).forEach((e) => {
      s += `<polygon points="${pts(e.pts)}" fill="${e.fill}"/>`;
    });
    return s + `</svg>`;
  }

  function wheelMarkup(w, uid) {
    let s = `<circle cx="${w.cx}" cy="${w.cy}" r="${w.r}" fill="#0c0d10"/>`;
    s += `<circle cx="${w.cx}" cy="${w.cy}" r="${w.r * 0.6}" fill="url(#rim-${uid})"/>`;
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      const x1 = w.cx + Math.cos(ang) * w.r * 0.15;
      const y1 = w.cy + Math.sin(ang) * w.r * 0.15;
      const x2 = w.cx + Math.cos(ang) * w.r * 0.55;
      const y2 = w.cy + Math.sin(ang) * w.r * 0.55;
      s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#5a5e64" stroke-width="${(w.r * 0.14).toFixed(1)}"/>`;
    }
    s += `<circle cx="${w.cx}" cy="${w.cy}" r="${w.r * 0.16}" fill="#3a3d42"/>`;
    return s;
  }

  function drawWheelCanvas(ctx, w) {
    ctx.fillStyle = "#0c0d10";
    ctx.beginPath(); ctx.arc(w.cx, w.cy, w.r, 0, Math.PI * 2); ctx.fill();
    const rimGrad = ctx.createRadialGradient(w.cx - w.r * 0.2, w.cy - w.r * 0.2, w.r * 0.05, w.cx, w.cy, w.r * 0.6);
    rimGrad.addColorStop(0, "#e7e9ec");
    rimGrad.addColorStop(1, "#8a8f96");
    ctx.fillStyle = rimGrad;
    ctx.beginPath(); ctx.arc(w.cx, w.cy, w.r * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#5a5e64";
    ctx.lineWidth = w.r * 0.14;
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(w.cx + Math.cos(ang) * w.r * 0.15, w.cy + Math.sin(ang) * w.r * 0.15);
      ctx.lineTo(w.cx + Math.cos(ang) * w.r * 0.55, w.cy + Math.sin(ang) * w.r * 0.55);
      ctx.stroke();
    }
    ctx.fillStyle = "#3a3d42";
    ctx.beginPath(); ctx.arc(w.cx, w.cy, w.r * 0.16, 0, Math.PI * 2); ctx.fill();
  }

  function drawCarShape(ctx, x, y, carId, color) {
    const shape = CAR_SHAPES[carId] || CAR_SHAPES.rival;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(0.4, 0.4);
    ctx.translate(-100, -50);

    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(100, 77, 86, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    shape.wheels.forEach((w) => drawWheelCanvas(ctx, w));

    const bodyGrad = ctx.createLinearGradient(0, 0, 0, 90);
    bodyGrad.addColorStop(0, shadeColor(color, 50));
    bodyGrad.addColorStop(0.55, color);
    bodyGrad.addColorStop(1, shadeColor(color, -35));
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    shape.body.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
    ctx.closePath(); ctx.fill();

    const glassGrad = ctx.createLinearGradient(0, 0, 200, 90);
    glassGrad.addColorStop(0, "#c3ccd9");
    glassGrad.addColorStop(0.5, "#5c6b80");
    glassGrad.addColorStop(1, "#20262f");
    ctx.fillStyle = glassGrad;
    (shape.windows || []).forEach((w) => {
      ctx.beginPath();
      w.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
      ctx.closePath(); ctx.fill();
    });

    (shape.extras || []).forEach((e) => {
      ctx.fillStyle = e.fill;
      ctx.beginPath();
      e.pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
      ctx.closePath(); ctx.fill();
    });
    ctx.restore();
  }

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
  const SAVE_KEY = "dragRacingSaveV2";

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
   * Audio (synthesized — no external files)
   * ------------------------------------------------------------- */
  let audioCtx = null;
  let engine = null; // { osc1, osc2, filter, gain }

  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function startEngineSound() {
    const ctx = ensureAudio();
    if (!ctx || engine) return;
    const osc1 = ctx.createOscillator();
    osc1.type = "sawtooth";
    const osc2 = ctx.createOscillator();
    osc2.type = "square";
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 700;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc1.frequency.value = 70;
    osc2.frequency.value = 70.5;
    osc1.start();
    osc2.start();
    engine = { osc1, osc2, filter, gain };
  }

  function updateEngineSound(rpm, gear, throttleOn) {
    if (!engine || !audioCtx) return;
    const t = audioCtx.currentTime;
    const freq = 65 + gear * 16 + rpm * 130;
    engine.osc1.frequency.setTargetAtTime(freq, t, 0.03);
    engine.osc2.frequency.setTargetAtTime(freq * 1.006, t, 0.03);
    engine.filter.frequency.setTargetAtTime(450 + rpm * 2200, t, 0.05);
    const targetGain = throttleOn ? 0.13 : 0.035;
    engine.gain.gain.setTargetAtTime(targetGain, t, 0.06);
  }

  function stopEngineSound() {
    if (!engine || !audioCtx) return;
    const { osc1, osc2, gain } = engine;
    const t = audioCtx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setTargetAtTime(0, t, 0.08);
    setTimeout(() => { try { osc1.stop(); osc2.stop(); } catch (e) {} }, 300);
    engine = null;
  }

  function playShiftSound(kind) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const t = ctx.currentTime;
    const startFreq = kind === "perfect" ? 440 : kind === "bog" ? 200 : 300;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.45, t + 0.13);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    osc.start(t);
    osc.stop(t + 0.16);

    const dur = 0.04;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.12;
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);
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
      <div class="car-swatch">${carSvg(carId, car.color)}</div>
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
    stopEngineSound();
  }

  $("btnStart").addEventListener("click", () => {
    ensureAudio();
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
          startEngineSound();
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
      updateEngineSound(raceState.player.rpm, raceState.player.gear, raceState.player.throttle);

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
    if (!result) return;
    playShiftSound(result);
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
    drawCarShape(ctx, px, laneH * 0.5, state.activeCar, playerColor);
    drawCarShape(ctx, rx, laneH * 1.5, "rival", rivalColor);
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
