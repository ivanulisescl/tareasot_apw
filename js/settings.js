/**
 * Configuración: menú con opciones (Forzar actualización, etc.)
 */
(function () {
  'use strict';

  var DATA_URL = 'data/tablaDias.json';
  var btnSettings = document.getElementById('btnSettings');
  var dropdown = document.getElementById('settingsDropdown');
  var optionRefreshData = document.getElementById('settingsRefreshData');
  var optionForceUpdate = document.getElementById('settingsForceUpdate');

  function toggleDropdown() {
    if (!dropdown) return;
    dropdown.hidden = !dropdown.hidden;
    if (btnSettings) btnSettings.setAttribute('aria-expanded', dropdown.hidden ? 'false' : 'true');
  }

  function closeDropdown() {
    if (dropdown) dropdown.hidden = true;
    if (btnSettings) btnSettings.setAttribute('aria-expanded', 'false');
  }

  function refreshData() {
    closeDropdown();
    var url = DATA_URL + '?t=' + Date.now();
    fetch(url, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('No se pudo obtener el fichero del repositorio');
        return res.json();
      })
      .then(function (data) {
        if (!Array.isArray(data) && typeof data !== 'object') throw new Error('Formato de datos no válido');
        window.location.reload();
      })
      .catch(function (err) {
        alert(err.message || 'Error al actualizar datos. Comprueba la conexión.');
      });
  }

  function forceUpdate() {
    closeDropdown();
    if ('serviceWorker' in navigator && navigator.serviceWorker.getRegistrations) {
      navigator.serviceWorker.getRegistrations().then(function (regs) {
        return Promise.all(regs.map(function (reg) { return reg.unregister(); }));
      }).then(function () {
        window.location.reload();
      }).catch(function () {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  }

  if (btnSettings && dropdown) {
    btnSettings.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown();
    });
  }

  if (optionRefreshData) {
    optionRefreshData.addEventListener('click', function () {
      refreshData();
    });
  }

  if (optionForceUpdate) {
    optionForceUpdate.addEventListener('click', function () {
      forceUpdate();
    });
  }

  document.addEventListener('click', function () {
    if (dropdown && !dropdown.hidden) closeDropdown();
  });

  if (dropdown) {
    dropdown.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }
})();
