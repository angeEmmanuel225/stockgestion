/* ════════════════════════════════════════════════════════ */
/*  DASHBOARD PAGE */
/* ════════════════════════════════════════════════════════ */

function renderDashboard() {
  const totalMats = APP.materials.length;
  const lowStock = APP.materials.filter(m => getStockPct(m) < APP.settings.alertThreshold).length;
  const critical = APP.materials.filter(m => getStockPct(m) < 10).length;
  const today30 = getDaysBefore(30);
  const txToday = APP.transactions.filter(t => t.date >= today30);
  const totalEntries = txToday.filter(t => t.type === 'entry').reduce((s, t) => s + t.qty, 0);
  const totalExits = txToday.filter(t => t.type === 'exit').reduce((s, t) => s + t.qty, 0);

  const view = document.getElementById('view-dashboard');
  view.innerHTML = `
    <div class="kpi-grid" id="kpiGrid"></div>
    <div class="dash-grid">
      <div class="card">
        <div class="card-header">
          <h3>📈 Mouvements — 30 derniers jours</h3>
          <span class="card-tag">ENTRÉES / SORTIES</span>
        </div>
        <div class="card-body">
          <div class="chart-container"><canvas id="chartMovements"></canvas></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>🔔 Alertes Actives</h3>
          <span class="card-tag" id="alertCountTag">0</span>
        </div>
        <div class="card-body no-pad" id="alertPanel"></div>
      </div>
    </div>
    <div class="dash-grid">
      <div class="card">
        <div class="card-header"><h3>📦 État des Stocks</h3><span class="card-tag">NIVEAUX ACTUELS</span></div>
        <div class="card-body no-pad">
          <div id="stockLevelList"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>🥧 Répartition par Catégorie</h3></div>
        <div class="card-body">
          <div class="chart-container"><canvas id="chartCategory"></canvas></div>
        </div>
      </div>
    </div>
  `;

  // KPIs
  document.getElementById('kpiGrid').innerHTML = `
    <div class="kpi-card" style="--kpi-color:var(--amber)">
      <div class="kpi-icon">📦</div>
      <div class="kpi-label">Matières Premières</div>
      <div class="kpi-value">${totalMats}</div>
      <div class="kpi-sub">Références actives</div>
    </div>
    <div class="kpi-card" style="--kpi-color:var(--red)">
      <div class="kpi-icon">⚠️</div>
      <div class="kpi-label">Stocks Faibles</div>
      <div class="kpi-value">${lowStock}</div>
      <div class="kpi-sub">${critical} critiques / ${totalMats} total</div>
    </div>
    <div class="kpi-card" style="--kpi-color:var(--green)">
      <div class="kpi-icon">📥</div>
      <div class="kpi-label">Entrées (30j)</div>
      <div class="kpi-value">${fmtNum(totalEntries)}</div>
      <div class="kpi-sub">Toutes unités</div>
    </div>
    <div class="kpi-card" style="--kpi-color:var(--blue)">
      <div class="kpi-icon">📤</div>
      <div class="kpi-label">Sorties (30j)</div>
      <div class="kpi-value">${fmtNum(totalExits)}</div>
      <div class="kpi-sub">Toutes unités</div>
    </div>
  `;

  renderMovementsChart();
  renderAlertsPanel();
  renderStockLevels();
  renderCategoryChart();
}

function renderMovementsChart() {
  const ctx = document.getElementById('chartMovements');
  if (!ctx) return;
  if (APP.chartsInstances.movements) APP.chartsInstances.movements.destroy();

  const days = [];
  const entries = [];
  const exits = [];
  for (let i = 13; i >= 0; i--) {
    const d = getDaysBefore(i);
    days.push(fmtDate(d).substr(0, 5));
    entries.push(APP.transactions.filter(t => t.date === d && t.type === 'entry').reduce((s, t) => s + t.qty, 0));
    exits.push(APP.transactions.filter(t => t.date === d && t.type === 'exit').reduce((s, t) => s + t.qty, 0));
  }

  APP.chartsInstances.movements = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [
        {
          label: 'Entrées',
          data: entries,
          backgroundColor: 'rgba(16,185,129,0.7)',
          borderColor: '#10b981',
          borderWidth: 1,
          borderRadius: 3
        },
        {
          label: 'Sorties',
          data: exits,
          backgroundColor: 'rgba(239,68,68,0.7)',
          borderColor: '#ef4444',
          borderWidth: 1,
          borderRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: '#475569', font: { size: 10 } }, grid: { color: '#1e3050' } },
        y: { ticks: { color: '#475569', font: { size: 10 } }, grid: { color: '#1e3050' } }
      }
    }
  });
}

function renderAlertsPanel() {
  const alerts = APP.materials.filter(m => getStockStatus(m) !== 'ok');
  const badge = document.getElementById('alertBadge');
  const countTag = document.getElementById('alertCountTag');
  badge.textContent = alerts.length;
  badge.style.display = alerts.length ? 'inline' : 'none';
  if (countTag) countTag.textContent = alerts.length;

  const panel = document.getElementById('alertPanel');
  if (!alerts.length) {
    panel.innerHTML = '<div class="empty-state"><div class="empty-icon">✅</div><p>Tous les stocks sont normaux</p></div>';
    return;
  }
  panel.innerHTML = alerts.map(m => {
    const s = getStockStatus(m);
    const pct = Math.round((m.stock / m.minStock) * 100);
    return `<div class="alert-item alert-${s === 'critical' ? 'critical' : 'warning'}" onclick="showMatDetail('${m.id}')" style="cursor:pointer;">
      <div class="alert-dot"></div>
      <div style="flex:1;">
        <div class="alert-title">${m.icon} ${m.name}</div>
        <div class="alert-desc">Stock: ${fmtNum(m.stock)} ${m.unit} — ${pct}% du seuil minimum</div>
      </div>
      <div class="alert-time">${s === 'critical' ? '🔴 CRITIQUE' : '⚠️ FAIBLE'}</div>
    </div>`;
  }).join('');
}

function renderStockLevels() {
  const el = document.getElementById('stockLevelList');
  if (!el) return;
  if (!APP.materials.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">📦</div><p>Aucune matière créée</p></div>';
    return;
  }
  el.innerHTML = APP.materials.map(m => {
    const pct = getStockPct(m);
    const s = getStockStatus(m);
    const barColor = s === 'critical' ? 'var(--red)' : s === 'warning' ? 'var(--amber)' : 'var(--green)';
    return `<div style="padding:12px 20px;border-bottom:1px solid var(--border);cursor:pointer;" onclick="showMatDetail('${m.id}')">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:13px;font-weight:500;">${m.icon} ${m.name}</span>
        <span style="font-family:var(--font-mono);font-size:12px;color:${barColor};">${fmtNum(m.stock)} ${m.unit}</span>
      </div>
      <div class="stock-bar-wrap">
        <div class="stock-bar-bg"><div class="stock-bar-fill" style="width:${pct}%;background:${barColor};"></div></div>
        <div class="stock-bar-pct">${pct}%</div>
      </div>
    </div>`;
  }).join('');
}

function renderCategoryChart() {
  const ctx = document.getElementById('chartCategory');
  if (!ctx) return;
  if (APP.chartsInstances.category) APP.chartsInstances.category.destroy();

  const catMap = {};
  APP.materials.forEach(m => { catMap[m.cat] = (catMap[m.cat] || 0) + 1; });
  const cats = Object.keys(catMap);
  const vals = cats.map(c => catMap[c]);
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899', '#64748b'];

  APP.chartsInstances.category = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: cats,
      datasets: [{
        data: vals,
        backgroundColor: colors.slice(0, cats.length),
        borderColor: '#0c1220',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12 } } }
    }
  });
}
