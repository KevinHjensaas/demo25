if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then((registration) => {
      console.log("Service Worker registrert:", registration);
    })
    .catch((error) => {
      console.log("Service Worker feilet:", error);
    });
}
