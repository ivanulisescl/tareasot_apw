/**
 * Portada: muestra Ofertas Ing y Ofertas Autom del bloque Actual de tablaDias.json.
 */
(function () {
  'use strict';

  var DATA_URL = 'data/tablaDias.json';

  function getValor(d, key) {
    if (!d) return null;
    if (d[key] != null) return Number(d[key]);
    var k = Object.keys(d).find(function (x) {
      return x.replace(/\s/g, '') === key.replace(/\s/g, '');
    });
    return k != null ? Number(d[k]) : null;
  }

  function setNumero(id, value) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = value == null || isNaN(value) ? '—' : String(value);
  }

  function mostrarNota(texto) {
    var nota = document.getElementById('portadaOfertasNota');
    if (!nota) return;
    if (!texto) {
      nota.hidden = true;
      nota.textContent = '';
      return;
    }
    nota.textContent = texto;
    nota.hidden = false;
  }

  function cargar() {
    fetch(DATA_URL + '?t=' + Date.now())
      .then(function (res) {
        if (!res.ok) throw new Error('No se pudieron cargar las ofertas');
        return res.json();
      })
      .then(function (data) {
        var actual = data && data.Actual && typeof data.Actual === 'object' ? data.Actual : null;
        if (!actual) throw new Error('No hay datos actuales');
        setNumero('portadaOfertasIng', getValor(actual, 'Ofertas Ing'));
        setNumero('portadaOfertasAutom', getValor(actual, 'Ofertas Autom'));
        mostrarNota('');
      })
      .catch(function (err) {
        setNumero('portadaOfertasIng', null);
        setNumero('portadaOfertasAutom', null);
        mostrarNota(err.message || 'Error al cargar las ofertas.');
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cargar);
  } else {
    cargar();
  }
})();
