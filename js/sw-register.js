/* Registro del service worker para PWA instalable (mismo patrón que Mareo). */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(function () {});
  });
}
