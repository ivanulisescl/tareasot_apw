/**
 * Flujo tareas - Panel con datos numéricos y gráficos de tareasPorMes.json
 */

(function () {
  'use strict';

  var DATA_URL = 'data/tareasPorMes.json';
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var MESES_LABEL = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  var panel = document.getElementById('panelFlujoTareas');
  var btnAbrir = document.getElementById('btnFlujoTareas');
  var btnCerrar = document.getElementById('panelFlujoClose');
  var backdrop = document.getElementById('panelFlujoBackdrop');
  var loadingEl = document.getElementById('panelFlujoLoading');
  var errorEl = document.getElementById('panelFlujoError');
  var contentEl = document.getElementById('panelFlujoContent');
  var tablaEl = document.getElementById('panelFlujoTabla');
  var selectAnio = document.getElementById('panelFlujoAnio');

  var datosGlobal = null;
  var chartsInstances = [];

  function getAccionPorNombre(dataAnio, nombre) {
    if (!dataAnio || !Array.isArray(dataAnio)) return null;
    return dataAnio.find(function (a) { return a.accion === nombre; });
  }

  function getValoresMes(accion) {
    if (!accion) return [];
    return MESES.map(function (m) { return accion[m] != null ? Number(accion[m]) : 0; });
  }

  function totalAnual(valores) {
    return valores.reduce(function (a, b) { return a + b; }, 0);
  }

  function renderTabla(dataAnio) {
    if (!dataAnio || dataAnio.length === 0) {
      tablaEl.innerHTML = '<p class="panel-flujo-tabla-empty">No hay datos para este año.</p>';
      return;
    }

    var html = '<table class="panel-flujo-table"><thead><tr><th>Acción</th>';
    MESES_LABEL.forEach(function (m) { html += '<th>' + m + '</th>'; });
    html += '<th>Total</th></tr></thead><tbody>';

    dataAnio.forEach(function (accion) {
      var vals = getValoresMes(accion);
      var total = totalAnual(vals);
      html += '<tr><td class="panel-flujo-accion">' + accion.accion + '</td>';
      vals.forEach(function (v) { html += '<td>' + v + '</td>'; });
      html += '<td class="panel-flujo-total">' + total + '</td></tr>';
    });
    html += '</tbody></table>';
    tablaEl.innerHTML = html;
  }

  function destroyCharts() {
    chartsInstances.forEach(function (c) {
      if (c && typeof c.destroy === 'function') c.destroy();
    });
    chartsInstances = [];
  }

  function createBarChart(canvasId, titulo, dataAnio, nombreAccion) {
    var accion = getAccionPorNombre(dataAnio, nombreAccion);
    var valores = getValoresMes(accion);
    var ctx = document.getElementById(canvasId);
    if (!ctx) return;

    var colorBar = 'rgba(59, 130, 246, 0.8)';
    var colorBarHover = 'rgba(59, 130, 246, 1)';

    var chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: MESES_LABEL,
        datasets: [{
          label: nombreAccion,
          data: valores,
          backgroundColor: colorBar,
          borderColor: colorBarHover,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (item) { return item.raw; }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(148, 163, 184, 0.15)' },
            ticks: { color: 'rgb(148, 163, 184)', maxRotation: 45 }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(148, 163, 184, 0.15)' },
            ticks: { color: 'rgb(148, 163, 184)' }
          }
        }
      }
    });
    chartsInstances.push(chart);
  }

  function renderCharts(dataAnio) {
    destroyCharts();
    if (!dataAnio || dataAnio.length === 0) return;

    createBarChart('chartFlujoOfertasIng', 'Ofertas Creadas Ingeniería', dataAnio, 'Ofertas Creadas Ingeniería');
    createBarChart('chartFlujoPedidosIng', 'Pedidos Creados Ingeniería', dataAnio, 'Pedidos Creados Ingeniería');
    createBarChart('chartFlujoOfertasAutom', 'Ofertas Creadas Automáticos', dataAnio, 'Ofertas Creadas Automáticos');
    createBarChart('chartFlujoPedidosAutom', 'Pedidos Creados Automáticos', dataAnio, 'Pedidos Creados Automáticos');
  }

  function actualizarVista() {
    var anio = selectAnio.value;
    var dataAnio = datosGlobal && datosGlobal.tareasPorAnio && datosGlobal.tareasPorAnio[anio]
      ? datosGlobal.tareasPorAnio[anio]
      : [];
    renderTabla(dataAnio);
    renderCharts(dataAnio);
  }

  function mostrarPanel(datos) {
    datosGlobal = datos;
    errorEl.hidden = true;
    errorEl.textContent = '';
    loadingEl.hidden = true;
    contentEl.hidden = false;

    var anios = datos.tareasPorAnio ? Object.keys(datos.tareasPorAnio).filter(function (a) {
      var arr = datos.tareasPorAnio[a];
      return Array.isArray(arr) && arr.length > 0;
    }).sort() : [];

    selectAnio.innerHTML = '';
    anios.forEach(function (a) {
      var opt = document.createElement('option');
      opt.value = a;
      opt.textContent = a;
      selectAnio.appendChild(opt);
    });

    if (anios.length > 0) {
      selectAnio.value = anios[anios.length - 1];
      actualizarVista();
    } else {
      tablaEl.innerHTML = '<p class="panel-flujo-tabla-empty">No hay datos disponibles.</p>';
    }

    panel.hidden = false;
  }

  function mostrarError(mensaje) {
    loadingEl.hidden = true;
    contentEl.hidden = true;
    errorEl.textContent = mensaje;
    errorEl.hidden = false;
    panel.hidden = false;
  }

  function cerrarPanel() {
    destroyCharts();
    if (panel) panel.hidden = true;
  }

  function abrirFlujoTareas() {
    loadingEl.hidden = false;
    contentEl.hidden = true;
    errorEl.hidden = true;
    panel.hidden = false;

    fetch(DATA_URL + '?t=' + Date.now())
      .then(function (res) {
        if (!res.ok) throw new Error('No se pudieron cargar los datos');
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.tareasPorAnio) throw new Error('Formato de datos inválido');
        mostrarPanel(data);
      })
      .catch(function (err) {
        mostrarError(err.message || 'Error al cargar. Usa un servidor local (p. ej. python -m http.server 8000).');
      });
  }

  if (btnAbrir) btnAbrir.addEventListener('click', abrirFlujoTareas);
  if (btnCerrar) btnCerrar.addEventListener('click', cerrarPanel);
  if (backdrop) backdrop.addEventListener('click', cerrarPanel);
  if (selectAnio) selectAnio.addEventListener('change', actualizarVista);
})();
