/**
 * Visor proyectos - Banda de filtros (Buscar | Estado) y listado ordenado de proyectos.
 */
(function () {
  'use strict';

  var basePath = document.location.pathname.replace(/[^/]+$/, '') || '/';
  var DATA_URL = document.location.origin + basePath + 'data/proyectos.json';
  var loadingEl = document.getElementById('visorLoading');
  var errorEl = document.getElementById('visorError');
  var listEl = document.getElementById('visorList');

  var datosCompletos = null;
  var proyectosFiltrados = [];

  function showLoading(show) {
    loadingEl.style.display = show ? 'block' : 'none';
  }
  function showError(show, msg) {
    errorEl.hidden = !show;
    if (msg) errorEl.textContent = msg;
  }
  function showList(show) {
    if (listEl) listEl.hidden = !show;
  }

  function v(s) {
    return s != null && s !== '' ? String(s) : '—';
  }
  function n(num) {
    return num != null ? Number(num) : null;
  }
  function fmtNum(num, decimals) {
    if (num == null) return '—';
    var d = decimals != null ? decimals : 2;
    return Number(num).toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function fmtEur(num) {
    if (num == null) return '—';
    return fmtNum(num, 2) + ' €';
  }

  function getUniqueEstados(proyectos) {
    var set = {};
    proyectos.forEach(function (p) {
      var val = p.estado;
      if (val != null && String(val).trim() !== '') set[String(val).trim()] = true;
    });
    return Object.keys(set).sort();
  }

  function applyFilters() {
    var search = (document.getElementById('visorSearch').value || '').toLowerCase().trim();
    var estado = (document.getElementById('visorEstado').value || '').trim();

    proyectosFiltrados = (datosCompletos.proyectos || []).filter(function (p) {
      if (search) {
        var text = (v(p.numeroPedido) + ' ' + v(p.nombreProyecto)).toLowerCase();
        if (text.indexOf(search) === -1) return false;
      }
      if (estado && v(p.estado) !== estado) return false;
      return true;
    });
  }

  function addSection(parent, title, fields) {
    var section = document.createElement('div');
    section.className = 'visor-card-section';
    section.innerHTML = '<h3 class="visor-card-section-title">' + title + '</h3>';
    var grid = document.createElement('div');
    grid.className = 'visor-card-fields';
    fields.forEach(function (f) {
      var row = document.createElement('div');
      row.className = f.full ? 'visor-card-field full' : 'visor-card-field';
      row.innerHTML = '<span class="visor-card-label">' + f.label + '</span><span class="visor-card-value">' + v(f.value) + '</span>';
      grid.appendChild(row);
    });
    section.appendChild(grid);
    parent.appendChild(section);
  }

  function buildDetailContent(p) {
    var frag = document.createDocumentFragment();

    var resumen = document.createElement('div');
    resumen.className = 'visor-card-tab-panel';
    addSection(resumen, '1. Datos Generales del Proyecto', [
      { label: 'Número de Pedido:', value: p.numeroPedido },
      { label: 'Oferta de referencia:', value: p.ofertaReferencia },
      { label: 'País:', value: p.pais },
      { label: 'Fecha de Venta:', value: p.fechaVenta },
      { label: 'Importe (€):', value: p.importeEur != null ? fmtEur(p.importeEur) : '—' },
      { label: 'Peso (kg):', value: p.pesoKg != null ? fmtNum(p.pesoKg) + ' kg' : '—' },
      { label: 'Nombre del Proyecto:', value: p.nombreProyecto },
      { label: 'Ratio €/Kg:', value: p.ratioEurKg != null ? fmtNum(p.ratioEurKg) + ' €/kg' : '—' },
      { label: 'Cliente:', value: p.cliente },
      { label: 'Integrador:', value: p.integrador },
      { label: 'Estado:', value: p.estado, full: true }
    ]);
    addSection(resumen, '2. Datos de la Instalación', [
      { label: 'Sistema:', value: p.sistema },
      { label: 'Tipo:', value: p.tipoInstalacion },
      { label: 'Número de paletas:', value: p.numeroPaletas },
      { label: 'Altura total (mm):', value: p.alturaTotalMm }
    ]);
    addSection(resumen, '3. Personal de Ingeniería y Diseño', [
      { label: 'Jefe de Proyecto:', value: p.jefeProyecto },
      { label: 'Delineante Principal:', value: p.delineantePrincipal },
      { label: 'Delineante Apoyo 1:', value: p.delineanteApoyo1 },
      { label: 'Delineante Apoyo 2:', value: p.delineanteApoyo2 }
    ]);
    addSection(resumen, '4. Logística y Montaje', [
      { label: 'Inicio Montaje:', value: p.inicioMontaje },
      { label: 'Duración del Montaje (días):', value: p.duracionMontajeDias != null ? p.duracionMontajeDias + ' días' : '—' },
      { label: 'Tipo de Transporte:', value: p.tipoTransporte },
      { label: 'Tránsito (días):', value: p.transitoDias }
    ]);
    addSection(resumen, '5. Estado y Seguimiento de Planos', [
      { label: 'Plano validación:', value: p.planoValidacion },
      { label: 'Fecha validación plano:', value: p.fechaValidacionPlano },
      { label: 'Entregado a producción (%):', value: p.entregadoProduccionPorc != null ? p.entregadoProduccionPorc + '%' : '—' },
      { label: 'Planos montaje realizados (%):', value: p.planosMontajeRealizadosPorc != null ? p.planosMontajeRealizadosPorc + '%' : '—' },
      { label: 'Planos montaje publicados (%):', value: p.planosMontajePublicadosPorc != null ? p.planosMontajePublicadosPorc + '%' : '—' }
    ]);
    var obsSection = document.createElement('div');
    obsSection.className = 'visor-card-section';
    obsSection.innerHTML = '<h3 class="visor-card-section-title">Observaciones Generales del Proyecto</h3><p class="visor-card-value">' + v(p.observacionesGlobal) + '</p>';
    resumen.appendChild(obsSection);

    var entregas = p.entregasMRP || [];
    var tabEntregas = document.createElement('div');
    tabEntregas.className = 'visor-card-tab-panel';
    if (entregas.length === 0) {
      tabEntregas.innerHTML = '<p class="visor-card-empty">No hay entregas MRP para este proyecto.</p>';
    } else {
      var totalPeso = 0;
      entregas.forEach(function (e) { totalPeso += n(e.pesoTotalEstructura) || 0; });
      var pesoOfertado = n(p.pesoKg) || 0;
      var desv = pesoOfertado > 0 ? (totalPeso / pesoOfertado) * 100 : 0;
      var table = '<div class="visor-card-table-wrap"><table class="visor-card-table"><thead><tr><th>Estado</th><th>Nº Entrega</th><th>Entrega</th><th class="num">Peso (kg)</th></tr></thead><tbody>';
      entregas.forEach(function (e) {
        table += '<tr><td>' + v(e.estado) + '</td><td>' + v(e.nEntrega) + '</td><td>' + v(e.entrega) + '</td><td class="num">' + fmtNum(e.pesoTotalEstructura) + '</td></tr>';
      });
      table += '<tr class="total"><td colspan="3">TOTAL</td><td class="num">' + fmtNum(totalPeso) + '</td></tr></tbody></table></div>';
      table += '<div class="visor-card-resumen-mrp">';
      table += '<div class="visor-card-field"><span class="visor-card-label">Peso Ofertado (kg):</span><span class="visor-card-value">' + fmtNum(pesoOfertado) + '</span></div>';
      table += '<div class="visor-card-field"><span class="visor-card-label">Peso Total Entregado (kg):</span><span class="visor-card-value">' + fmtNum(totalPeso) + '</span></div>';
      var desvClass = desv > 101 || desv < 90 ? 'desviacion-alerta' : 'desviacion-ok';
      table += '<div class="visor-card-field"><span class="visor-card-label">% Desviación:</span><span class="visor-card-value ' + desvClass + '">' + fmtNum(desv, 2) + '%</span></div></div>';
      tabEntregas.innerHTML = table;
    }

    var tiempos = p.tiempos || [];
    var tabTiempos = document.createElement('div');
    tabTiempos.className = 'visor-card-tab-panel';
    if (tiempos.length === 0) {
      tabTiempos.innerHTML = '<p class="visor-card-empty">No hay datos de tiempos para este proyecto.</p>';
    } else {
      var total = 0;
      var table = '<div class="visor-card-table-wrap"><table class="visor-card-table"><thead><tr><th>Técnico</th><th class="num">Horas dedicadas</th></tr></thead><tbody>';
      tiempos.forEach(function (t) {
        var h = n(t.horas) || 0;
        total += h;
        table += '<tr><td>' + v(t.tecnico) + '</td><td class="num">' + fmtNum(h, 1) + '</td></tr>';
      });
      table += '<tr class="total"><td>TOTAL</td><td class="num">' + fmtNum(total, 1) + '</td></tr></tbody></table></div>';
      tabTiempos.innerHTML = table;
    }

    return { resumen: resumen, entregas: tabEntregas, tiempos: tabTiempos };
  }

  function renderList() {
    if (!listEl) return;
    applyFilters();
    listEl.innerHTML = '';

    if (proyectosFiltrados.length === 0) {
      listEl.innerHTML = '<p class="visor-list-empty">No hay proyectos que coincidan con los filtros.</p>';
      return;
    }

    proyectosFiltrados.forEach(function (p) {
      var card = document.createElement('article');
      card.className = 'visor-card';
      card.setAttribute('data-id', p.idProyecto);

      var header = document.createElement('header');
      header.className = 'visor-card-header';
      header.innerHTML =
        '<span class="visor-card-pedido">' + v(p.numeroPedido) + '</span>' +
        '<span class="visor-card-nombre">' + v(p.nombreProyecto) + '</span>' +
        '<span class="visor-card-estado">' + v(p.estado) + '</span>';
      card.appendChild(header);

      var body = document.createElement('div');
      body.className = 'visor-card-body';
      body.hidden = true;

      var tabs = document.createElement('div');
      tabs.className = 'visor-card-tabs';
      tabs.innerHTML =
        '<button type="button" class="visor-card-tab active" data-tab="resumen">Ficha Resumen</button>' +
        '<button type="button" class="visor-card-tab" data-tab="entregas">Entregas MRP</button>' +
        '<button type="button" class="visor-card-tab" data-tab="tiempos">Tiempos</button>';
      body.appendChild(tabs);

      var panels = document.createElement('div');
      panels.className = 'visor-card-panels';
      var detail = buildDetailContent(p);
      panels.appendChild(detail.resumen);
      detail.entregas.hidden = true;
      detail.tiempos.hidden = true;
      panels.appendChild(detail.entregas);
      panels.appendChild(detail.tiempos);
      body.appendChild(panels);

      card.appendChild(body);

      header.addEventListener('click', function () {
        var isOpen = !body.hidden;
        document.querySelectorAll('.visor-card-body').forEach(function (b) { b.hidden = true; });
        document.querySelectorAll('.visor-card').forEach(function (c) { c.classList.remove('visor-card--open'); });
        if (!isOpen) {
          body.hidden = false;
          card.classList.add('visor-card--open');
        }
      });

      tabs.querySelectorAll('.visor-card-tab').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var tab = btn.getAttribute('data-tab');
          tabs.querySelectorAll('.visor-card-tab').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-tab') === tab); });
          panels.querySelectorAll('.visor-card-tab-panel').forEach(function (panel, i) {
            var names = ['resumen', 'entregas', 'tiempos'];
            panel.hidden = names[i] !== tab;
          });
        });
      });

      listEl.appendChild(card);
    });
  }

  function fillEstadoSelect() {
    var sel = document.getElementById('visorEstado');
    var valores = getUniqueEstados(datosCompletos.proyectos || []);
    var current = sel.value;
    sel.innerHTML = '<option value="">Todos los estados</option>';
    valores.forEach(function (val) {
      var opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val;
      sel.appendChild(opt);
    });
    if (valores.indexOf(current) >= 0) sel.value = current;
  }

  function initFilters() {
    fillEstadoSelect();
    document.getElementById('visorSearch').addEventListener('input', renderList);
    document.getElementById('visorSearch').addEventListener('search', renderList);
    document.getElementById('visorEstado').addEventListener('change', renderList);
  }

  function init() {
    showLoading(false);
    showError(false);
    showList(true);
    initFilters();
    renderList();
  }

  fetch(DATA_URL + '?t=' + Date.now(), { cache: 'no-store' })
    .then(function (res) {
      if (!res.ok) throw new Error('No se pudo cargar los datos ( ' + res.status + ' ). Comprueba la conexión.');
      return res.json();
    })
    .then(function (data) {
      if (!data || !Array.isArray(data.proyectos)) throw new Error('Formato de datos inválido');
      datosCompletos = data;
      init();
    })
    .catch(function (err) {
      showLoading(false);
      showList(false);
      showError(true, 'No se pudieron cargar los proyectos. ' + (err.message || ''));
    });
})();
