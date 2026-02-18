/**
 * Tema día/noche: alterna entre claro y oscuro y guarda la preferencia en localStorage.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'tareasot-theme';

  function getTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'dark';
    } catch (e) {
      return 'dark';
    }
  }

  function setTheme(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {}
    var root = document.documentElement;
    if (value === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
    updateButtonIcon(value);
  }

  function updateButtonIcon(theme) {
    var btn = document.getElementById('btnTheme');
    var icon = btn && btn.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = theme === 'light' ? '🌙' : '☀️';
      btn.setAttribute('aria-label', theme === 'light' ? 'Cambiar a modo noche' : 'Cambiar a modo día');
      btn.setAttribute('title', theme === 'light' ? 'Modo noche' : 'Modo día');
    }
  }

  function toggleTheme() {
    var current = getTheme();
    var next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  function init() {
    setTheme(getTheme());
    var btn = document.getElementById('btnTheme');
    if (btn) {
      btn.addEventListener('click', toggleTheme);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
