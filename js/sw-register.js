/* Registro del service worker para PWA instalable. Fuerza comprobación de actualización al cargar. */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js?v=1.41.0', { scope: './' }).then(function (reg) {
      reg.update();
    }).catch(function () {});
  });
}
