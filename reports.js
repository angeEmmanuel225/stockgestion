/* ════════════════════════════════════════════════════════ */
/*  REPORTS PAGE */
/* ════════════════════════════════════════════════════════ */

function renderReports() {
  const view = document.getElementById('view-reports');
  view.innerHTML = `
    <div class="tab-bar">
      <div class="tab-btn active" onclick="reportTab(this,'day')">📅 Journalier</div>
      <div class="tab-btn" onclick="reportTab(this,'month')">📆 Mensuel</div>
      <div class="tab-btn" onclick="reportTab(this,'year')">📊 Annuel</div>
    </div>
    <div class="kpi-grid" id="reportKpi"></div>
    <div class="dash-grid">
      <div class="card">
        <div class="card-header"><h3 id="reportChartTitle">Mouvements</h3></div>
        <div class="card-body"><div class="chart-container" style="height:240px;"><canvas id="chartReport"></canvas></div></div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Top Matières Utilisées</h3></div>
        <div class="card-body no-pad" id="reportTopMats"></div>
      </div>
    </div>
    <div class="card" style="margin-top:16px;">
      <div class="card-header">
        <h3>Détail des Mouvements</h3>
        <button class="btn-sm" onclick="exportCSV()">⬇ Exporter CSV</button>
      </div>
      <div class="card-body no-pad table-wrap"><table>
        <thead><tr><th>Date</th><th>Matière</th><th>Type</th><th>Qté</th><th>Resp.</th><th>Note</th></tr></thead>
        <tbody id="reportTable"></tbody>
      </table></div>
    </div>
  `;

  updateReportContent();
}

function reportTab(el, period) {
  APP.reportPeriod = period;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  updateReportContent();
}

function updateReportContent() {
  const p = APP.reportPeriod;
  let txs = APP.transactions;
  let labels = [], entries = [], exits = [];

  if (p === 'day') {
    for (let i = 13; i >= 0; i--) {
      const d = getDaysBefore(i);
      labels.push(fmtDate(d).substr(0, 5));
      entries.push(txs.filter(t => t.date === d && t.type === 'entry').reduce((s, t) => s + t.qty, 0));
      exits.push(txs.filter(t => t.date === d && t.type === 'exit').reduce((s, t) => s + t.qty, 0));
    }
    document.getElementById('reportChartTitle').textContent = 'Mouvements — 14 derniers jours';
  } else if (p === 'month') {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      months.push({ key, label: `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}` });
    }
    months.forEach(({ key, label }) => {
      labels.push(label);
      entries.push(txs.filter(t => t.date.startsWith(key) && t.type === 'entry').reduce((s, t) => s + t.qty, 0));
      exits.push(txs.filter(t => t.date.startsWith(key) && t.type === 'exit').reduce((s, t) => s + t.qty, 0));
    });
    document.getElementById('reportChartTitle').textContent = 'Mouvements — 6 derniers mois';
  } else {
    for (let i = 2; i >= 0; i--) {
      const y = new Date().getFullYear() - i;
      labels.push(y.toString());
      entries.push(txs.filter(t => t.date.startsWith(y) && t.type === 'entry').reduce((s, t) => s + t.qty, 0));
      exits.push(txs.filter(t => t.date.startsWith(y) && t.type === 'exit').reduce((s, t) => s + t.qty, 0));
    }
    document.getElementById('reportChartTitle').textContent = 'Mouvements — Annuel';
  }

  const totalE = entries.reduce((a, b) => a + b, 0);
  const totalS = exits.reduce((a, b) => a + b, 0);
  document.getElementById('reportKpi').innerHTML = `
    <div class="kpi-card" style="--kpi-color:var(--green)"><div class="kpi-label">Total Entrées</div><div class="kpi-value">${fmtNum(Math.round(totalE))}</div><div class="kpi-sub">Toutes matières</div></div>
    <div class="kpi-card" style="--kpi-color:var(--red)"><div class="kpi-label">Total Sorties</div><div class="kpi-value">${fmtNum(Math.round(totalS))}</div><div class="kpi-sub">Production</div></div>
    <div class="kpi-card" style="--kpi-color:var(--blue)"><div class="kpi-label">Balance</div><div class="kpi-value">${totalE - totalS >= 0 ? '+' : ''}${fmtNum(Math.round(totalE - totalS))}</div><div class="kpi-sub">Entrées − Sorties</div></div>
    <div class="kpi-card" style="--kpi-color:var(--amber)"><div class="kpi-label">Mouvements</div><div class="kpi-value">${txs.length}</div><div class="kpi-sub">Total enregistrés</div></div>
  `;

  const ctx = document.getElementById('chartReport');
  if (APP.chartsInstances.report) APP.chartsInstances.report.destroy();
  APP.chartsInstances.report = new Chart(ctx, {
    type: 'bar',
    data: {
      labels, datasets: [
        { label: 'Entrées', data: entries, backgroundColor: 'rgba(16,185,129,0.7)', borderColor: '#10b981', borderWidth: 1, borderRadius: 4 },
        { label: 'Sorties', data: exits, backgroundColor: 'rgba(239,68,68,0.7)', borderColor: '#ef4444', borderWidth: 1, borderRadius: 4 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
      scales: { x: { ticks: { color: '#475569' }, grid: { color: '#1e3050' } }, y: { ticks: { color: '#475569' }, grid: { color: '#1e3050' } } }
    }
  });

  const matUsage = {};
  txs.filter(t => t.type === 'exit').forEach(t => { matUsage[t.matId] = (matUsage[t.matId] || 0) + t.qty; });
  const sorted = Object.entries(matUsage).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topEl = document.getElementById('reportTopMats');
  if (!sorted.length) { topEl.innerHTML = '<div class="empty-state"><p>Aucune donnée</p></div>'; }
  else {
    const max = sorted[0][1];
    topEl.innerHTML = sorted.map(([id, qty]) => {
      const mat = APP.materials.find(m => m.id === id);
      const pct = Math.round((qty / max) * 100);
      return `<div style="padding:12px 20px;border-bottom:1px solid var(--border);">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="font-size:13px;">${mat ? `${mat.icon} ${mat.name}` : id}</span>
          <span class="td-mono" style="font-size:12px;color:var(--amber);">${fmtNum(Math.round(qty))} ${mat?.unit || ''}</span>
        </div>
        <div class="stock-bar-bg"><div class="stock-bar-fill" style="width:${pct}%;background:var(--amber);"></div></div>
      </div>`;
    }).join('');
  }

  const filteredTx = APP.transactions.slice().reverse();
  document.getElementById('reportTable').innerHTML = filteredTx.slice(0, 50).map(t => {
    const mat = APP.materials.find(m => m.id === t.matId);
    return `<tr>
      <td class="td-mono">${fmtDate(t.date)}</td>
      <td>${mat ? `${mat.icon} ${mat.name}` : '—'}</td>
      <td>${t.type === 'entry' ? '<span class="badge badge-green">Entrée</span>' : '<span class="badge badge-red">Sortie</span>'}</td>
      <td class="td-mono">${t.type === 'entry' ? '+' : '-'}${fmtNum(t.qty)}</td>
      <td style="font-size:12px;">${USERS[t.user]?.name || t.user}</td>
      <td style="font-size:12px;color:var(--text-muted);">${t.note || '—'}</td>
    </tr>`;
  }).join('');
}

function exportCSV() {
  const rows = [['Date', 'Matière', 'Code', 'Type', 'Quantité', 'Unité', 'Stock Après', 'Responsable', 'Note']];
  APP.transactions.forEach(t => {
    const mat = APP.materials.find(m => m.id === t.matId);
    rows.push([
      fmtDate(t.date), mat?.name || t.matId, mat?.code || '', t.type === 'entry' ? 'Entrée' : 'Sortie',
      t.qty, mat?.unit || '', t.stockAfter || '', USERS[t.user]?.name || t.user, t.note || ''
    ]);
  });
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stockpro_export_${today()}.csv`;
  a.click();
  showToast('⬇️ Export réussi', 'Fichier CSV téléchargé.', 'success');
}
