/**
 * Gráficos - Equivalente a GraficoAgnosSolapados: Evolución Anual Ofertas de Ingeniería.
 * Carga data/tablaDias.json (o window.TABLA_DIAS) y construye el gráfico con Chart.js.
 */

(function () {
  'use strict';

  const DATA_URL = 'data/tablaDias.json';
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const chartsEl = document.getElementById('charts');

  var COLORS_SERIES = [
    'rgb(250, 250, 150)',  // amarillo
    'rgb(200, 200, 250)',  // azul claro
    'rgb(128, 0, 128)'     // púrpura
  ];
  var COLOR_GRID = 'rgba(148, 163, 184, 0.15)';
  var COLOR_TEXT = 'rgb(241, 245, 249)';
  var COLOR_TEXT_MUTED = 'rgb(148, 163, 184)';
  var MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  function parseFecha(str) {
    var parts = str.split('/');
    if (parts.length !== 3) return null;
    var d = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10) - 1;
    var y = parseInt(parts[2], 10);
    if (parts[2].length === 2) y += 2000;
    return new Date(y, m, d);
  }

  function dayOfYear(date) {
    var start = new Date(date.getFullYear(), 0, 1);
    var diff = date - start;
    return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1;
  }

  function getMonthStartDays(year) {
    var out = [];
    for (var mes = 1; mes <= 12; mes++) {
      var d = new Date(year, mes - 1, 1);
      out.push(dayOfYear(d));
    }
    return out;
  }

  function getValor(d, campo) {
    if (d[campo] != null) return Number(d[campo]);
    var key = Object.keys(d).find(function (k) { return k.replace(/\s/g, '') === campo.replace(/\s/g, ''); });
    return key != null ? Number(d[key]) : 0;
  }

  function generarDatasetPorAnios(listaDias, campo) {
    var seriesPorAnio = {};
    for (var i = 0; i < listaDias.length; i++) {
      var d = listaDias[i];
      var fecha = parseFecha(d.Fecha);
      if (!fecha) continue;
      var anio = fecha.getFullYear();
      var diaDelAnio = dayOfYear(fecha);
      var valor = getValor(d, campo);
      if (!seriesPorAnio[anio]) seriesPorAnio[anio] = [];
      seriesPorAnio[anio].push({ x: diaDelAnio, y: valor });
    }
    var anios = Object.keys(seriesPorAnio).sort();
    for (var a in seriesPorAnio) {
      seriesPorAnio[a].sort(function (p, q) { return p.x - q.x; });
    }
    return { seriesPorAnio: seriesPorAnio, anios: anios };
  }

  function obtenerPuntoAhora(seriesPorAnio, anioActual) {
    var serie = seriesPorAnio[anioActual];
    if (!serie || serie.length === 0) return null;
    var ultimo = serie[serie.length - 1];
    return { x: ultimo.x, y: ultimo.y };
  }

  function showLoading(show) {
    loadingEl.hidden = !show;
  }
  function showError(show) {
    errorEl.hidden = !show;
  }
  function showCharts(show) {
    chartsEl.hidden = !show;
  }

  function createChartEvolucionAnual(data, campo, titulo, canvasId, valorEquilibrio) {
    var res = generarDatasetPorAnios(data, campo);
    var seriesPorAnio = res.seriesPorAnio;
    var anios = res.anios;
    if (anios.length === 0) return;

    var anioActual = new Date().getFullYear();
    var puntoAhora = obtenerPuntoAhora(seriesPorAnio, anioActual);
    var yearForMonthTicks = anios.indexOf(String(anioActual)) >= 0 ? anioActual : parseInt(anios[anios.length - 1], 10);
    var monthStarts = getMonthStartDays(yearForMonthTicks);

    var datasets = [];
    anios.forEach(function (anio, idx) {
      var color = parseInt(anio, 10) === anioActual ? 'rgb(255, 255, 255)' : COLORS_SERIES[idx % COLORS_SERIES.length];
      datasets.push({
        label: String(anio),
        data: seriesPorAnio[anio],
        borderColor: color,
        backgroundColor: color.replace(')', ', 0.2)').replace('rgb', 'rgba'),
        fill: false,
        tension: 0.2,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2
      });
    });

    if (puntoAhora) {
      datasets.push({
        label: 'Ahora',
        data: [puntoAhora],
        borderColor: 'rgb(255, 255, 255)',
        backgroundColor: 'rgb(255, 255, 255)',
        pointStyle: 'crossRot',
        pointRadius: 8,
        pointHoverRadius: 10,
        borderWidth: 0,
        showLine: false
      });
    }

    var annotations = {
      lineaEquilibrio: {
        type: 'line',
        yMin: valorEquilibrio,
        yMax: valorEquilibrio,
        borderColor: 'rgb(100, 100, 100)',
        borderWidth: 2,
        borderDash: [5, 4]
      }
    };
    monthStarts.forEach(function (day, i) {
      annotations['v' + i] = {
        type: 'line',
        xMin: day,
        xMax: day,
        borderColor: 'rgba(200, 200, 200, 0.5)',
        borderWidth: 1
      };
    });
    if (puntoAhora) {
      annotations.labelAhora = {
        type: 'label',
        xValue: puntoAhora.x,
        yValue: puntoAhora.y,
        content: [String(puntoAhora.y)],
        position: 'right',
        color: 'rgb(255, 255, 255)',
        font: { size: 14, weight: 'bold' },
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 6
      };
    }

    var minY = Infinity, maxY = -Infinity;
    anios.forEach(function (anio) {
      seriesPorAnio[anio].forEach(function (p) {
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
    });
    if (puntoAhora) {
      if (puntoAhora.y < minY) minY = puntoAhora.y;
      if (puntoAhora.y > maxY) maxY = puntoAhora.y;
    }
    if (minY === Infinity) minY = 0;
    if (maxY === -Infinity) maxY = valorEquilibrio;
    minY = Math.min(minY, valorEquilibrio);
    maxY = Math.max(maxY, valorEquilibrio);
    var range = maxY - minY || 1;
    var yMin = minY - range * 0.05;
    var yMax = maxY + range * 0.05;

    var ctx = document.getElementById(canvasId).getContext('2d');
    var chart = new Chart(ctx, {
      type: 'line',
      data: { datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.2,
        interaction: {
          mode: 'nearest',
          intersect: false
        },
        plugins: {
          legend: {
            labels: { color: COLOR_TEXT }
          },
          tooltip: {
            callbacks: {
              label: function (item) {
                var d = item.raw;
                var fecha = new Date(yearForMonthTicks, 0, 1);
                fecha.setDate(fecha.getDate() + d.x - 1);
                var fmt = fecha.getDate() + ' de ' + MESES[fecha.getMonth()];
                return item.dataset.label + ': ' + d.y + ' (' + fmt + ')';
              }
            }
          },
          annotation: {
            annotations: annotations
          }
        },
        scales: {
          x: {
            type: 'linear',
            min: 1,
            max: 366,
            grid: { color: COLOR_GRID },
            ticks: {
              color: COLOR_TEXT_MUTED,
              callback: function (val) {
                var day = val;
                for (var i = 0; i < monthStarts.length; i++) {
                  if (Math.abs(monthStarts[i] - day) < 2) return MESES[i];
                }
                return '';
              },
              stepSize: 1,
              maxTicksLimit: 14
            }
          },
          y: {
            type: 'linear',
            min: yMin,
            max: yMax,
            grid: { color: COLOR_GRID },
            ticks: { color: COLOR_TEXT_MUTED }
          }
        }
      }
    });
  }

  function init(data) {
    showLoading(false);
    showError(false);
    showCharts(true);
    createChartEvolucionAnual(data, 'Ofertas Ing', 'Evolución Anual Ofertas de Ingeniería', 'chartOfertasIng', 100);
    createChartEvolucionAnual(data, 'Ofertas Autom', 'Evolución Anual Ofertas de Automáticos', 'chartOfertasAutom', 20);
  }

  showLoading(true);
  showError(false);
  showCharts(false);

  function tryInit(data) {
    if (!Array.isArray(data) || data.length === 0) throw new Error('Datos vacíos');
    init(data);
  }

  // Carga solo desde data/tablaDias.json (sin .js).
  // Requiere abrir la app con un servidor local (p. ej. python -m http.server 8000).
  fetch(DATA_URL + '?t=' + Date.now())
    .then(function (res) {
      if (!res.ok) throw new Error('Error al cargar ' + DATA_URL);
      return res.json();
    })
    .then(tryInit)
    .catch(function (err) {
      showLoading(false);
      showCharts(false);
      showError(true);
      errorEl.textContent = 'No se pudieron cargar los datos. Abre la app con un servidor local (p. ej. python -m http.server 8000). ' + (err.message || '');
    });
})();
