// Registreert de service worker zodat de app installeerbaar is en offline werkt
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function (err) {
      console.warn('Service worker niet geregistreerd:', err);
    });
  });
}
