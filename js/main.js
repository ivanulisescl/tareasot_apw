/**
 * Control de Parámetros - Departamento de Ingeniería
 * Punto de entrada: botón Estado Tareas (panel con totales) y enlace Gráficos.
 * Carga data/tablaDias.json: usa "Actual" (momento actual) si existe, si no el último día de "dias".
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

  function mostrarPanel(datos, esActual) {
    if (!panel) return;
    panelError.hidden = true;
    panelError.textContent = '';

    var fecha = esActual ? 'Datos actuales' : (datos.Fecha || '—');
    setText('panelEstadoFecha', esActual ? fecha : 'Datos del ' + fecha);

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

    panel.hidden = false;
  }

  function mostrarError(mensaje) {
    if (panelError) {
      panelError.textContent = mensaje;
      panelError.hidden = false;
    }
    if (panelTotal) panelTotal.textContent = 'Total tareas: —';
    if (panelResumen) panelResumen.hidden = true;
    if (panelEstados) panelEstados.hidden = true;
    var t2 = ['tabla2IngOfertas', 'tabla2IngPedidos', 'tabla2AutomOfertas', 'tabla2AutomPedidos', 'tabla2ISAOfertas', 'tabla2ISAPedidos', 'tabla2VEOfertas', 'tabla2VEPedidos'];
    t2.forEach(function (id) {
      setText(id, '—');
    });
    if (panel) panel.hidden = false;
  }

  function cerrarPanel() {
    if (panel) panel.hidden = true;
  }

  function obtenerDatosParaPanel(data) {
    if (data.Actual && typeof data.Actual === 'object') {
      return { datos: data.Actual, esActual: true };
    }
    if (data.dias && Array.isArray(data.dias) && data.dias.length > 0) {
      return { datos: data.dias[data.dias.length - 1], esActual: false };
    }
    if (Array.isArray(data) && data.length > 0) {
      return { datos: data[data.length - 1], esActual: false };
    }
    return null;
  }

  function abrirEstadoTareas() {
    fetch(DATA_URL + '?t=' + Date.now())
      .then(function (res) {
        if (!res.ok) throw new Error('No se pudieron cargar los datos');
        return res.json();
      })
      .then(function (data) {
        var par = obtenerDatosParaPanel(data);
        if (!par) throw new Error('No hay datos');
        mostrarPanel(par.datos, par.esActual);
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
})();
