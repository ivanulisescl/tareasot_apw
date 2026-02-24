/**
 * Control de Parámetros - Departamento de Ingeniería
 * Punto de entrada: botón Estado Tareas (panel con totales) y enlace Gráficos.
 * Carga data/tablaDias.json: "Actual" y/o "dias". Dos botones: Datos actuales / Última fecha (valor real).
 */

(function () {
  'use strict';

  var DATA_URL = 'data/tablaDias.json';
  var panel = document.getElementById('panelEstadoTareas');
  var btnAbrir = document.getElementById('btnEstadoTareas');
  var btnCerrar = document.getElementById('panelEstadoClose');
  var backdrop = document.getElementById('panelEstadoBackdrop');
  var panelError = document.getElementById('panelEstadoError');
  var panelTotal = document.getElementById('panelEstadoTotal');
  var panelResumen = document.getElementById('panelEstadoResumen');
  var panelEstados = document.getElementById('panelEstadoEstados');
  var panelTabs = document.getElementById('panelEstadoTabs');
  var btnActual = document.getElementById('btnEstadoActual');
  var btnUltimaFecha = document.getElementById('btnEstadoUltimaFecha');

  var datosCargados = null;
  var datosActual = null;
  var datosUltimaFecha = null;
  var ultimaFechaLabel = '';
  var fechaHoraActualizacion = null;

  function formatearFechaHora(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    var h = date.getHours();
    var min = date.getMinutes();
    return (d < 10 ? '0' : '') + d + '/' + (m < 10 ? '0' : '') + m + '/' + y + ' a las ' + (h < 10 ? '0' : '') + h + ':' + (min < 10 ? '0' : '') + min;
  }

  function parsearFechaHora(str) {
    if (!str) return null;
    var d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  function getValor(d, key) {
    if (d[key] != null) return Number(d[key]);
    var k = Object.keys(d).find(function (x) { return x.replace(/\s/g, '') === key.replace(/\s/g, ''); });
    return k != null ? Number(d[k]) : 0;
  }

  function totalTareas(d) {
    return getValor(d, 'Nuevas') + getValor(d, 'Incompletas') + getValor(d, 'Definidas') +
           getValor(d, 'Asignadas') + getValor(d, 'PdteRevComercial') + getValor(d, 'Calculadas') +
           getValor(d, 'PdteComercializados');
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function rellenarPanel(datos, esActual) {
    var textoFecha;
    if (esActual) {
      textoFecha = fechaHoraActualizacion ? 'Datos del ' + fechaHoraActualizacion : 'Datos actuales';
    } else {
      textoFecha = 'Datos del ' + (datos.Fecha || '—');
    }
    setText('panelEstadoFecha', textoFecha);

    if (panelTotal) {
      panelTotal.textContent = 'Total tareas: ' + totalTareas(datos);
    }

    if (panelResumen) {
      panelResumen.hidden = false;
      setText('panelEstadoOfertas', getValor(datos, 'Ofertas'));
      setText('panelEstadoPedidos', getValor(datos, 'Pedidos'));
      setText('panelEstadoTareasInternas', getValor(datos, 'Tareas Internas'));
    }

    if (panelEstados) {
      panelEstados.hidden = false;
      setText('panelEstadoNuevas', getValor(datos, 'Nuevas'));
      setText('panelEstadoIncompletas', getValor(datos, 'Incompletas'));
      setText('panelEstadoDefinidas', getValor(datos, 'Definidas'));
      setText('panelEstadoAsignadas', getValor(datos, 'Asignadas'));
      setText('panelEstadoPdteRevComercial', getValor(datos, 'PdteRevComercial'));
      setText('panelEstadoCalculadas', getValor(datos, 'Calculadas'));
      setText('panelEstadoPdteComercializados', getValor(datos, 'PdteComercializados'));
    }

    setText('tabla2IngOfertas', getValor(datos, 'Ofertas Ing'));
    setText('tabla2IngPedidos', getValor(datos, 'Pedidos Ing'));
    setText('tabla2AutomOfertas', getValor(datos, 'Ofertas Autom'));
    setText('tabla2AutomPedidos', getValor(datos, 'Pedidos Autom'));
    setText('tabla2ISAOfertas', getValor(datos, 'Ofertas ISA'));
    setText('tabla2ISAPedidos', getValor(datos, 'Pedidos ISA'));
    setText('tabla2VEOfertas', getValor(datos, 'Ofertas VE'));
    setText('tabla2VEPedidos', getValor(datos, 'Pedidos VE'));
  }

  function mostrarPanel(datos, esActual) {
    if (!panel) return;
    panelError.hidden = true;
    panelError.textContent = '';
    rellenarPanel(datos, esActual);
    panel.hidden = false;
  }

  function setModoActual() {
    if (!datosActual) return;
    if (btnActual) btnActual.classList.add('active');
    if (btnUltimaFecha) btnUltimaFecha.classList.remove('active');
    rellenarPanel(datosActual, true);
  }

  function setModoUltimaFecha() {
    if (!datosUltimaFecha) return;
    if (btnActual) btnActual.classList.remove('active');
    if (btnUltimaFecha) btnUltimaFecha.classList.add('active');
    rellenarPanel(datosUltimaFecha, false);
  }

  function mostrarError(mensaje) {
    if (panelError) {
      panelError.textContent = mensaje;
      panelError.hidden = false;
    }
    if (panelTotal) panelTotal.textContent = 'Total tareas: —';
    if (panelResumen) panelResumen.hidden = true;
    if (panelEstados) panelEstados.hidden = true;
    if (panelTabs) panelTabs.hidden = true;
    var t2 = ['tabla2IngOfertas', 'tabla2IngPedidos', 'tabla2AutomOfertas', 'tabla2AutomPedidos', 'tabla2ISAOfertas', 'tabla2ISAPedidos', 'tabla2VEOfertas', 'tabla2VEPedidos'];
    t2.forEach(function (id) {
      setText(id, '—');
    });
    if (panel) panel.hidden = false;
  }

  function cerrarPanel() {
    if (panel) panel.hidden = true;
  }

  function abrirEstadoTareas() {
    fetch(DATA_URL + '?t=' + Date.now())
      .then(function (res) {
        if (!res.ok) throw new Error('No se pudieron cargar los datos');
        var lastModified = res.headers.get('Last-Modified');
        return res.json().then(function (data) {
          return { data: data, lastModified: lastModified };
        });
      })
      .then(function (result) {
        var data = result.data;
        var lastModified = result.lastModified;
        datosCargados = data;
        datosActual = null;
        datosUltimaFecha = null;
        ultimaFechaLabel = '';
        var listaDias = data.dias && Array.isArray(data.dias) ? data.dias : (Array.isArray(data) ? data : []);
        if (data.Actual && typeof data.Actual === 'object') {
          datosActual = data.Actual;
        }
        if (listaDias.length > 0) {
          datosUltimaFecha = listaDias[listaDias.length - 1];
          ultimaFechaLabel = datosUltimaFecha.Fecha || '';
        }

        var fh = parsearFechaHora(data.fechaHoraActualizacion || data.fechaHoraCreacion);
        if (fh) {
          fechaHoraActualizacion = formatearFechaHora(fh);
        } else if (lastModified) {
          var d = new Date(lastModified);
          fechaHoraActualizacion = isNaN(d.getTime()) ? null : formatearFechaHora(d);
        } else if (datosUltimaFecha && datosUltimaFecha.Fecha) {
          var hora = data.Hora || datosUltimaFecha.Hora;
          fechaHoraActualizacion = datosUltimaFecha.Fecha + (hora ? ' a las ' + hora : '');
        } else {
          fechaHoraActualizacion = null;
        }

        if (datosActual && datosUltimaFecha) {
          if (panelTabs) {
            panelTabs.hidden = false;
            if (btnUltimaFecha) btnUltimaFecha.textContent = ultimaFechaLabel;
            btnActual.classList.add('active');
            btnUltimaFecha.classList.remove('active');
          }
          mostrarPanel(datosActual, true);
        } else if (datosActual) {
          if (panelTabs) panelTabs.hidden = true;
          mostrarPanel(datosActual, true);
        } else if (datosUltimaFecha) {
          if (panelTabs) panelTabs.hidden = true;
          mostrarPanel(datosUltimaFecha, false);
        } else {
          throw new Error('No hay datos');
        }
      })
      .catch(function (err) {
        mostrarError(err.message || 'Error al cargar. Usa un servidor local (p. ej. python -m http.server 8000).');
      });
  }

  if (btnAbrir) {
    btnAbrir.addEventListener('click', abrirEstadoTareas);
  }
  if (btnCerrar) {
    btnCerrar.addEventListener('click', cerrarPanel);
  }
  if (backdrop) {
    backdrop.addEventListener('click', cerrarPanel);
  }
  if (btnActual) {
    btnActual.addEventListener('click', setModoActual);
  }
  if (btnUltimaFecha) {
    btnUltimaFecha.addEventListener('click', setModoUltimaFecha);
  }

  if (document.body.dataset.page === 'estado-tareas') {
    abrirEstadoTareas();
  }
})();
