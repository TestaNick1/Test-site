(function () {
  const SITE_ID = "test-site-1";
  const TRACKER_ENDPOINT = "https://ΘΑ-ΤΟ-ΒΑΛΕΙΣ-ΜΕΤΑ.workers.dev/api/track";

  function getVisitorId() {
    try {
      let id = localStorage.getItem("_vid");
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("_vid", id);
      }
      return id;
    } catch (e) { return null; }
  }

  function send() {
    const payload = JSON.stringify({
      site_id: SITE_ID,
      page_path: window.location.pathname,
      referrer: document.referrer || "",
      visitor_id: getVisitorId(),
    });
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "text/plain;charset=UTF-8" });
      navigator.sendBeacon(TRACKER_ENDPOINT, blob);
    } else {
      fetch(TRACKER_ENDPOINT, { method: "POST", body: payload, keepalive: true,
        headers: { "Content-Type": "text/plain;charset=UTF-8" } }).catch(function(){});
    }
  }
  send();
})();
