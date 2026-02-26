/**
 * Entradas/Salidas - Carga data/EntradasSalidas.json y muestra entradas (rojo) y salidas (verde) del día.
 *
 * Formato esperado del JSON:
 * {
 *   "fechaHoraActualizacion": "2026-02-19T10:30:00",
 *   "categorias": {
 *     "Ingeniería":  { "ofertasEntradas": 3, "ofertasSalidas": 1, "pedidosEntradas": 2, "pedidosSalidas": 0 },
 *     "Automáticos": { ... },
 *     "ISAs":        { ... },
 *     "VE":          { ... }
 *   }
 * }
 */
(function () {
  'use strict';

  var DATA_URL = 'data/EntradasSalidas.json';

  var MAPA_IDS = {
    'Ingeniería':  'Ing',
    'Automáticos': 'Autom',
    'ISAs':        'ISA',
    'VE':          'VE'
  };

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function formatearFechaHora(str) {
    if (!str) return null;
    var d = new Date(str);
    if (isNaN(d.getTime())) return null;
    var dd = d.getDate();
    var mm = d.getMonth() + 1;
    var yy = d.getFullYear();
    var hh = d.getHours();
    var min = d.getMinutes();
    return (dd < 10 ? '0' : '') + dd + '/' + (mm < 10 ? '0' : '') + mm + '/' + yy +
           ' a las ' + (hh < 10 ? '0' : '') + hh + ':' + (min < 10 ? '0' : '') + min;
  }

  function val(obj, key) {
    return (obj && obj[key] != null) ? Number(obj[key]) : 0;
  }

  function fetchConReintentos(url, intentos) {
    return fetch(url).then(function (res) {
      if ((res.status === 401 || res.status >= 500) && intentos > 1) {
        return fetchConReintentos(url, intentos - 1);
      }
      return res;
    });
  }

  function cargarDatos() {
    fetchConReintentos(DATA_URL + '?t=' + Date.now(), 3)
      .then(function (res) {
        if (!res.ok) throw new Error('No se pudieron cargar los datos (' + res.status + ')');
        return res.json();
      })
      .then(function (data) {
        var cats = data.categorias || {};

        var fechaStr = formatearFechaHora(data.fechaHoraActualizacion);
        setText('esFecha', fechaStr ? 'Datos del ' + fechaStr : 'Datos actuales');

        var totalOfIn = 0, totalOfOut = 0, totalPedIn = 0, totalPedOut = 0;

        Object.keys(MAPA_IDS).forEach(function (catName) {
          var prefijo = MAPA_IDS[catName];
          var c = cats[catName] || {};
          var oIn  = val(c, 'ofertasEntradas');
          var oOut = val(c, 'ofertasSalidas');
          var pIn  = val(c, 'pedidosEntradas');
          var pOut = val(c, 'pedidosSalidas');

          setText('es' + prefijo + 'OfertasIn',  '+' + oIn);
          setText('es' + prefijo + 'OfertasOut', '-' + oOut);
          setText('es' + prefijo + 'PedidosIn',  '+' + pIn);
          setText('es' + prefijo + 'PedidosOut', '-' + pOut);

          totalOfIn  += oIn;
          totalOfOut += oOut;
          totalPedIn += pIn;
          totalPedOut += pOut;
        });

        setText('esTotalOfertasIn',  '+' + totalOfIn);
        setText('esTotalOfertasOut', '-' + totalOfOut);
        setText('esTotalPedidosIn',  '+' + totalPedIn);
        setText('esTotalPedidosOut', '-' + totalPedOut);

        var resumen = document.getElementById('esResumen');
        if (resumen) resumen.hidden = false;

        var errorEl = document.getElementById('esError');
        if (errorEl) errorEl.hidden = true;
      })
      .catch(function (err) {
        var errorEl = document.getElementById('esError');
        if (errorEl) {
          errorEl.textContent = err.message || 'Error al cargar datos.';
          errorEl.hidden = false;
        }
      });
  }

  if (document.body.dataset.page === 'entradas-salidas') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cargarDatos);
    } else {
      cargarDatos();
    }
  }
})();
