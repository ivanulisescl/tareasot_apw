/**
 * Visor proyectos - Carga proyectos.json, lista, filtros y detalle con 3 pestañas.
 */
(function () {
  'use strict';

  var DATA_URL = 'data/proyectos.json';
  var loadingEl = document.getElementById('visorLoading');
  var errorEl = document.getElementById('visorError');
  var contentEl = document.getElementById('visorContent');
  var listEl = document.getElementById('visorList');
  var noSelectionEl = document.getElementById('visorNoSelection');
  var detailEl = document.getElementById('visorDetail');
  var detailTitleEl = document.getElementById('visorDetailTitle');

  var datosCompletos = null;
  var proyectosFiltrados = [];
  var proyectoSeleccionado = null;

  function showLoading(show) {
    loadingEl.style.display = show ? 'block' : 'none';
  }
  function showError(show, msg) {
    errorEl.hidden = !show;
    if (msg) errorEl.textContent = msg;
  }
  function showContent(show) {
    contentEl.hidden = !show;
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

  function getUniqueValues(proyectos, key) {
    var set = { '': true };
    proyectos.forEach(function (p) {
      var val = p[key];
      if (val != null && String(val).trim() !== '') set[String(val).trim()] = true;
    });
    return Object.keys(set).filter(function (k) { return k !== ''; }).sort();
  }

  function applyFilters() {
    var search = (document.getElementById('visorSearch').value || '').toLowerCase().trim();
    var estado = (document.getElementById('visorEstado').value || '').trim();
    var tipo = (document.getElementById('visorTipo').value || '').trim();
    var plano = (document.getElementById('visorPlano').value || '').trim();

    proyectosFiltrados = (datosCompletos.proyectos || []).filter(function (p) {
      if (search) {
        var text = (v(p.numeroPedido) + ' ' + v(p.nombreProyecto)).toLowerCase();
        if (text.indexOf(search) === -1) return false;
      }
      if (estado && v(p.estado) !== estado) return false;
      if (tipo && v(p.tipoInstalacion) !== tipo) return false;
      if (plano && v(p.planoValidacion) !== plano) return false;
      return true;
    });
  }

  function renderList() {
    applyFilters();
    listEl.innerHTML = '';
    proyectosFiltrados.forEach(function (p) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'visor-list-btn' + (proyectoSeleccionado && proyectoSeleccionado.idProyecto === p.idProyecto ? ' active' : '');
      btn.textContent = v(p.numeroPedido) + ' - ' + v(p.nombreProyecto) || 'Sin nombre';
      btn.addEventListener('click', function () {
        proyectoSeleccionado = p;
        renderList();
        showDetail(p);
      });
      listEl.appendChild(btn);
    });
  }

  function fillFilterSelect(id, values) {
    var sel = document.getElementById(id);
    var current = sel.value;
    sel.innerHTML = '<option value="">Mostrar todos</option>';
    values.forEach(function (val) {
      var opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val;
      sel.appendChild(opt);
    });
    if (values.indexOf(current) >= 0) sel.value = current;
  }

  function initFilters() {
    var proyectos = datosCompletos.proyectos || [];
    fillFilterSelect('visorEstado', getUniqueValues(proyectos, 'estado'));
    fillFilterSelect('visorTipo', getUniqueValues(proyectos, 'tipoInstalacion'));
    fillFilterSelect('visorPlano', getUniqueValues(proyectos, 'planoValidacion'));

    document.getElementById('visorSearch').addEventListener('input', function () {
      renderList();
      if (proyectoSeleccionado && proyectosFiltrados.indexOf(proyectoSeleccionado) === -1) {
        proyectoSeleccionado = proyectosFiltrados[0] || null;
        if (proyectoSeleccionado) showDetail(proyectoSeleccionado);
        else hideDetail();
      }
    });
    document.getElementById('visorEstado').addEventListener('change', function () { renderList(); });
    document.getElementById('visorTipo').addEventListener('change', function () { renderList(); });
    document.getElementById('visorPlano').addEventListener('change', function () { renderList(); });
  }

  function addSection(parent, title, fields) {
    var section = document.createElement('div');
    section.className = 'visor-section';
    section.innerHTML = '<h3 class="visor-section-title">' + title + '</h3>';
    var grid = document.createElement('div');
    grid.className = 'visor-section-fields';
    fields.forEach(function (f) {
      var row = document.createElement('div');
      row.className = f.full ? 'visor-field full' : 'visor-field';
      row.innerHTML = '<span class="visor-field-label">' + f.label + '</span><span class="visor-field-value">' + v(f.value) + '</span>';
      grid.appendChild(row);
    });
    section.appendChild(grid);
    parent.appendChild(section);
  }

  function renderTabResumen(p) {
    var container = document.getElementById('visorTabResumen');
    container.innerHTML = '';

    addSection(container, '1. Datos Generales del Proyecto', [
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

    addSection(container, '2. Datos de la Instalación', [
      { label: 'Sistema:', value: p.sistema },
      { label: 'Tipo:', value: p.tipoInstalacion },
      { label: 'Número de paletas:', value: p.numeroPaletas },
      { label: 'Altura total (mm):', value: p.alturaTotalMm }
    ]);

    addSection(container, '3. Personal de Ingeniería y Diseño', [
      { label: 'Jefe de Proyecto:', value: p.jefeProyecto },
      { label: 'Delineante Principal:', value: p.delineantePrincipal },
      { label: 'Delineante Apoyo 1:', value: p.delineanteApoyo1 },
      { label: 'Delineante Apoyo 2:', value: p.delineanteApoyo2 }
    ]);

    addSection(container, '4. Logística y Montaje', [
      { label: 'Inicio Montaje:', value: p.inicioMontaje },
      { label: 'Duración del Montaje (días):', value: p.duracionMontajeDias != null ? p.duracionMontajeDias + ' días' : '—' },
      { label: 'Tipo de Transporte:', value: p.tipoTransporte },
      { label: 'Tránsito (días):', value: p.transitoDias }
    ]);

    addSection(container, '5. Estado y Seguimiento de Planos', [
      { label: 'Plano validación:', value: p.planoValidacion },
      { label: 'Fecha validación plano:', value: p.fechaValidacionPlano },
      { label: 'Entregado a producción (%):', value: p.entregadoProduccionPorc != null ? p.entregadoProduccionPorc + '%' : '—' },
      { label: 'Planos montaje realizados (%):', value: p.planosMontajeRealizadosPorc != null ? p.planosMontajeRealizadosPorc + '%' : '—' },
      { label: 'Planos montaje publicados (%):', value: p.planosMontajePublicadosPorc != null ? p.planosMontajePublicadosPorc + '%' : '—' }
    ]);

    var obsSection = document.createElement('div');
    obsSection.className = 'visor-section';
    obsSection.innerHTML = '<h3 class="visor-section-title">Observaciones Generales del Proyecto</h3><p class="visor-field-value">' + v(p.observacionesGlobal) + '</p>';
    container.appendChild(obsSection);
  }

  function renderTabEntregas(p) {
    var container = document.getElementById('visorTabEntregas');
    var entregas = p.entregasMRP || [];
    container.innerHTML = '';

    if (entregas.length === 0) {
      container.innerHTML = '<p class="visor-no-selection">No hay entregas MRP para este proyecto.</p>';
      return;
    }

    var totalPeso = 0;
    entregas.forEach(function (e) {
      totalPeso += n(e.pesoTotalEstructura) || 0;
    });
    var pesoOfertado = n(p.pesoKg) || 0;
    var desv = pesoOfertado > 0 ? (totalPeso / pesoOfertado) * 100 : 0;

    var table = '<div class="visor-table-wrap"><table class="visor-table"><thead><tr><th>Estado</th><th>Nº Entrega</th><th>Entrega</th><th class="num">Peso (kg)</th></tr></thead><tbody>';
    entregas.forEach(function (e) {
      table += '<tr><td>' + v(e.estado) + '</td><td>' + v(e.nEntrega) + '</td><td>' + v(e.entrega) + '</td><td class="num">' + fmtNum(e.pesoTotalEstructura) + '</td></tr>';
    });
    table += '<tr class="total"><td colspan="3">TOTAL</td><td class="num">' + fmtNum(totalPeso) + '</td></tr></tbody></table></div>';

    table += '<div class="visor-resumen-mrp">';
    table += '<div class="visor-field"><span class="visor-field-label">Peso Ofertado (kg):</span><span class="visor-field-value">' + fmtNum(pesoOfertado) + '</span></div>';
    table += '<div class="visor-field"><span class="visor-field-label">Peso Total Entregado (kg):</span><span class="visor-field-value">' + fmtNum(totalPeso) + '</span></div>';
    var desvClass = desv > 101 || desv < 90 ? 'desviacion-alerta' : 'desviacion-ok';
    table += '<div class="visor-field"><span class="visor-field-label">% Desviación (Total / Ofertado):</span><span class="visor-field-value ' + desvClass + '">' + fmtNum(desv, 2) + '%</span></div>';
    table += '</div>';

    container.innerHTML = table;
  }

  function renderTabTiempos(p) {
    var container = document.getElementById('visorTabTiempos');
    var tiempos = p.tiempos || [];
    container.innerHTML = '';

    if (tiempos.length === 0) {
      container.innerHTML = '<p class="visor-no-selection">No hay datos de tiempos para este proyecto.</p>';
      return;
    }

    var total = 0;
    var table = '<div class="visor-table-wrap"><table class="visor-table"><thead><tr><th>Técnico</th><th class="num">Horas dedicadas</th></tr></thead><tbody>';
    tiempos.forEach(function (t) {
      var h = n(t.horas) || 0;
      total += h;
      table += '<tr><td>' + v(t.tecnico) + '</td><td class="num">' + fmtNum(h, 1) + '</td></tr>';
    });
    table += '<tr class="total"><td>TOTAL</td><td class="num">' + fmtNum(total, 1) + '</td></tr></tbody></table></div>';
    container.innerHTML = table;
  }

  function switchTab(tabName) {
    document.querySelectorAll('.visor-tab').forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-tab') === tabName);
    });
    document.getElementById('visorTabResumen').hidden = tabName !== 'resumen';
    document.getElementById('visorTabEntregas').hidden = tabName !== 'entregas';
    document.getElementById('visorTabTiempos').hidden = tabName !== 'tiempos';
  }

  function showDetail(p) {
    contentEl.classList.remove('visor-content--no-detail');
    contentEl.classList.add('visor-content--detail-only');
    noSelectionEl.hidden = true;
    detailEl.hidden = false;
    detailTitleEl.textContent = v(p.nombreProyecto) + ' (' + v(p.numeroPedido) + ')';

    renderTabResumen(p);
    renderTabEntregas(p);
    renderTabTiempos(p);
    switchTab('resumen');
  }

  function hideDetail() {
    contentEl.classList.remove('visor-content--detail-only');
    contentEl.classList.add('visor-content--no-detail');
    noSelectionEl.hidden = false;
    detailEl.hidden = true;
    proyectoSeleccionado = null;
    renderList();
  }

  document.getElementById('visorBtnAtras').addEventListener('click', hideDetail);

  document.querySelectorAll('.visor-tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchTab(btn.getAttribute('data-tab'));
    });
  });

  function init() {
    showLoading(false);
    showError(false);
    showContent(true);
    applyFilters();
    renderList();
    initFilters();
    hideDetail();
  }

  fetch(DATA_URL + '?t=' + Date.now())
    .then(function (res) {
      if (!res.ok) throw new Error('No se pudo cargar ' + DATA_URL);
      return res.json();
    })
    .then(function (data) {
      if (!data || !Array.isArray(data.proyectos)) throw new Error('Formato de datos inválido');
      datosCompletos = data;
      init();
    })
    .catch(function (err) {
      showLoading(false);
      showContent(false);
      showError(true, 'No se pudieron cargar los proyectos. ' + (err.message || ''));
    });
})();
