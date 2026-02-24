/**
 * Flujo tareas - Panel con datos numéricos y gráficos de tareasPorMes.json
 * Vistas: Tabla (todas las categorías por año) y Comparador (año vs año por categoría)
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
  var vistaTabla = document.getElementById('vistaTabla');
  var vistaComparador = document.getElementById('vistaComparador');
  var tablaEl = document.getElementById('panelFlujoTabla');
  var tablaComparadorEl = document.getElementById('panelFlujoTablaComparador');
  var selectAnio = document.getElementById('panelFlujoAnio');
  var selectAnio1 = document.getElementById('panelFlujoAnio1');
  var selectAnio2 = document.getElementById('panelFlujoAnio2');
  var selectCategoria = document.getElementById('panelFlujoCategoria');
  var btnTabTabla = document.getElementById('btnFlujoTabla');
  var btnTabComparador = document.getElementById('btnFlujoComparador');

  var datosGlobal = null;
  var aniosDisponibles = [];
  var categoriasDisponibles = [];
  var chartsInstances = [];
  var modoActual = 'tabla';

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

  function getDataAnio(anio) {
    return datosGlobal && datosGlobal.tareasPorAnio && datosGlobal.tareasPorAnio[anio]
      ? datosGlobal.tareasPorAnio[anio]
      : [];
  }

  function obtenerCategorias(dataAnio) {
    if (!dataAnio || !Array.isArray(dataAnio)) return [];
    return dataAnio.map(function (a) { return a.accion; });
  }

  function renderTabla(dataAnio) {
    if (!tablaEl) return;
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

  function renderTablaComparador(anio1, anio2, categoria) {
    if (!tablaComparadorEl) return;
    var data1 = getDataAnio(anio1);
    var data2 = getDataAnio(anio2);
    var acc1 = getAccionPorNombre(data1, categoria);
    var acc2 = getAccionPorNombre(data2, categoria);
    var vals1 = getValoresMes(acc1);
    var vals2 = getValoresMes(acc2);

    var html = '<table class="panel-flujo-table panel-flujo-table-comparador"><thead><tr><th>Mes</th><th>' + anio1 + '</th><th>' + anio2 + '</th></tr></thead><tbody>';
    MESES_LABEL.forEach(function (m, i) {
      html += '<tr><td>' + m + '</td><td>' + (vals1[i] || 0) + '</td><td>' + (vals2[i] || 0) + '</td></tr>';
    });
    html += '<tr class="panel-flujo-total-row"><td>Total</td><td class="panel-flujo-total">' + totalAnual(vals1) + '</td><td class="panel-flujo-total">' + totalAnual(vals2) + '</td></tr>';
    html += '</tbody></table>';
    tablaComparadorEl.innerHTML = html;
  }

  function destroyCharts() {
    chartsInstances.forEach(function (c) {
      if (c && typeof c.destroy === 'function') c.destroy();
    });
    chartsInstances = [];
  }

  function createChartComparador(anio1, anio2, categoria) {
    var data1 = getDataAnio(anio1);
    var data2 = getDataAnio(anio2);
    var acc1 = getAccionPorNombre(data1, categoria);
    var acc2 = getAccionPorNombre(data2, categoria);
    var vals1 = getValoresMes(acc1);
    var vals2 = getValoresMes(acc2);

    var ctx = document.getElementById('chartFlujoComparador');
    if (!ctx) return;

    var chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: MESES_LABEL,
        datasets: [
          {
            label: anio1,
            data: vals1,
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          },
          {
            label: anio2,
            data: vals2,
            backgroundColor: 'rgba(34, 197, 94, 0.7)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          legend: {
            labels: { color: 'rgb(148, 163, 184)' }
          },
          tooltip: {
            callbacks: {
              label: function (item) { return item.dataset.label + ': ' + item.raw; }
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

  function actualizarVistaTabla() {
    destroyCharts();
    var anio = selectAnio.value;
    var dataAnio = getDataAnio(anio);
    renderTabla(dataAnio);
  }

  function actualizarVistaComparador() {
    var anio1 = selectAnio1.value;
    var anio2 = selectAnio2.value;
    var categoria = selectCategoria.value;
    if (!anio1 || !anio2 || !categoria) return;

    destroyCharts();
    renderTablaComparador(anio1, anio2, categoria);
    createChartComparador(anio1, anio2, categoria);
  }

  function cambiarModo(modo) {
    modoActual = modo;
    if (modo === 'tabla') {
      vistaTabla.hidden = false;
      vistaComparador.hidden = true;
      btnTabTabla.classList.add('active');
      btnTabComparador.classList.remove('active');
      actualizarVistaTabla();
    } else {
      vistaTabla.hidden = true;
      vistaComparador.hidden = false;
      btnTabTabla.classList.remove('active');
      btnTabComparador.classList.add('active');
      actualizarVistaComparador();
    }
  }

  function poblarselectsAnios(select) {
    if (!select) return;
    select.innerHTML = '';
    aniosDisponibles.forEach(function (a) {
      var opt = document.createElement('option');
      opt.value = a;
      opt.textContent = a;
      select.appendChild(opt);
    });
  }

  function poblarselectsCategorias() {
    if (!selectCategoria) return;
    selectCategoria.innerHTML = '';
    categoriasDisponibles.forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      selectCategoria.appendChild(opt);
    });
  }

  function mostrarPanel(datos) {
    datosGlobal = datos;
    errorEl.hidden = true;
    errorEl.textContent = '';
    loadingEl.hidden = true;
    contentEl.hidden = false;

    aniosDisponibles = datos.tareasPorAnio ? Object.keys(datos.tareasPorAnio).filter(function (a) {
      var arr = datos.tareasPorAnio[a];
      return Array.isArray(arr) && arr.length > 0;
    }).sort() : [];

    var dataUltimoAnio = aniosDisponibles.length > 0 ? getDataAnio(aniosDisponibles[aniosDisponibles.length - 1]) : [];
    categoriasDisponibles = obtenerCategorias(dataUltimoAnio);

    selectAnio.innerHTML = '';
    poblarselectsAnios(selectAnio);
    poblarselectsAnios(selectAnio1);
    poblarselectsAnios(selectAnio2);
    poblarselectsCategorias();

    if (aniosDisponibles.length > 0) {
      var ultimo = aniosDisponibles[aniosDisponibles.length - 1];
      var anioActual = new Date().getFullYear();
      var anioAnterior = anioActual - 1;
      var idxActual = aniosDisponibles.indexOf(String(anioActual));
      var idxAnterior = aniosDisponibles.indexOf(String(anioAnterior));
      selectAnio.value = ultimo;
      selectAnio1.value = idxActual >= 0 ? aniosDisponibles[idxActual] : ultimo;
      selectAnio2.value = idxAnterior >= 0 ? aniosDisponibles[idxAnterior] : (idxActual > 0 ? aniosDisponibles[idxActual - 1] : (aniosDisponibles.length > 1 ? aniosDisponibles[aniosDisponibles.length - 2] : ultimo));
    }
    if (categoriasDisponibles.length > 0) {
      selectCategoria.value = categoriasDisponibles[0];
    }

    cambiarModo('tabla');
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

  if (document.body.dataset.page === 'flujo-tareas') {
    var panelEl = document.getElementById('panelFlujoTareas');
    if (panelEl) panelEl.removeAttribute('hidden');
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', abrirFlujoTareas);
    } else {
      abrirFlujoTareas();
    }
  }
  if (selectAnio) selectAnio.addEventListener('change', actualizarVistaTabla);
  if (selectAnio1) selectAnio1.addEventListener('change', actualizarVistaComparador);
  if (selectAnio2) selectAnio2.addEventListener('change', actualizarVistaComparador);
  if (selectCategoria) selectCategoria.addEventListener('change', actualizarVistaComparador);
  if (btnTabTabla) btnTabTabla.addEventListener('click', function () { cambiarModo('tabla'); });
  if (btnTabComparador) btnTabComparador.addEventListener('click', function () { cambiarModo('comparador'); });
})();
