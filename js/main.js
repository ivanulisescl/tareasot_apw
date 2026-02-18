/**
 * Control de Parámetros - Departamento de Ingeniería
 * Punto de entrada: botón Estado Tareas (panel con totales) y enlace Gráficos.
 */

(function () {
  'use strict';

  var DATA_URL = 'data/tablaDias.json';
  var panel = document.getElementById('panelEstadoTareas');
  var btnAbrir = document.getElementById('btnEstadoTareas');
  var btnCerrar = document.getElementById('panelEstadoClose');
  var backdrop = document.getElementById('panelEstadoBackdrop');
  var panelError = document.getElementById('panelEstadoError');

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

  function mostrarPanel(datos) {
    if (!panel) return;
    panelError.hidden = true;
    panelError.textContent = '';

    var fecha = datos.Fecha || '—';
    document.getElementById('panelEstadoFecha').textContent = 'Datos del ' + fecha;

    document.getElementById('estadoTotal').textContent = totalTareas(datos);
    document.getElementById('estadoOfertasIng').textContent = getValor(datos, 'Ofertas Ing');
    document.getElementById('estadoOfertasAutom').textContent = getValor(datos, 'Ofertas Autom');
    document.getElementById('estadoPedidosIng').textContent = getValor(datos, 'Pedidos Ing');
    document.getElementById('estadoPedidosAutom').textContent = getValor(datos, 'Pedidos Autom');
    document.getElementById('estadoOfertasISA').textContent = getValor(datos, 'Ofertas ISA');
    document.getElementById('estadoPedidosISA').textContent = getValor(datos, 'Pedidos ISA');
    document.getElementById('estadoOfertasVE').textContent = getValor(datos, 'Ofertas VE');
    document.getElementById('estadoPedidosVE').textContent = getValor(datos, 'Pedidos VE');

    panel.hidden = false;
  }

  function mostrarError(mensaje) {
    if (panelError) {
      panelError.textContent = mensaje;
      panelError.hidden = false;
    }
    document.getElementById('estadoTotal').textContent = '—';
    document.getElementById('estadoOfertasIng').textContent = '—';
    document.getElementById('estadoOfertasAutom').textContent = '—';
    document.getElementById('estadoPedidosIng').textContent = '—';
    document.getElementById('estadoPedidosAutom').textContent = '—';
    document.getElementById('estadoOfertasISA').textContent = '—';
    document.getElementById('estadoPedidosISA').textContent = '—';
    document.getElementById('estadoOfertasVE').textContent = '—';
    document.getElementById('estadoPedidosVE').textContent = '—';
    if (panel) panel.hidden = false;
  }

  function cerrarPanel() {
    if (panel) panel.hidden = true;
  }

  function abrirEstadoTareas() {
    fetch(DATA_URL + '?t=' + Date.now())
      .then(function (res) {
        if (!res.ok) throw new Error('No se pudieron cargar los datos');
        return res.json();
      })
      .then(function (arr) {
        if (!Array.isArray(arr) || arr.length === 0) throw new Error('No hay datos');
        mostrarPanel(arr[arr.length - 1]);
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
