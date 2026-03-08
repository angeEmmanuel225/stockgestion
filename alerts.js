/* ════════════════════════════════════════════════════════ */
/*  ALERTS PAGE */
/* ════════════════════════════════════════════════════════ */

function renderAlerts() {
  const critical = APP.materials.filter(m => getStockStatus(m) === 'critical');
  const warnings = APP.materials.filter(m => getStockStatus(m) === 'warning');
  const lowMats = [...critical, ...warnings];

  const view = document.getElementById('view-alerts');
  view.innerHTML = `
    <div class="grid-2" style="margin-bottom:16px;">
      <div class="card">
        <div class="card-header"><h3>🔴 Alertes Critiques</h3><span class="card-tag" id="critCount">0</span></div>
        <div id="criticalAlerts"></div>
      </div>
      <div class="card">
        <div class="card-header"><h3>⚠️ Avertissements</h3><span class="card-tag" id="warnCount">0</span></div>
        <div id="warningAlerts"></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3>📋 Matières à Pré-commander</h3></div>
      <div class="card-body no-pad table-wrap">
        <table>
          <thead><tr><th>Matière</th><th>Stock actuel</th><th>Seuil alerte</th><th>Niveau</th><th>Action recommandée</th></tr></thead>
          <tbody id="reorderTable"></tbody>
        </table>
        <div id="noAlerts" class="empty-state" style="display:none;"><div class="empty-icon">✅</div><p>Tous les stocks sont à niveau normal</p></div>
      </div>
    </div>
  `;

  document.getElementById('critCount').textContent = critical.length;
  document.getElementById('warnCount').textContent = warnings.length;

  const renderList = (mats, containerId) => {
    const el = document.getElementById(containerId);
    if (!mats.length) { el.innerHTML = '<div class="empty-state" style="padding:24px;"><p>Aucun élément</p></div>'; return; }
    el.innerHTML = mats.map(m => `<div class="alert-item" onclick="showMatDetail('${m.id}')" style="cursor:pointer;">
      <div class="alert-dot"></div>
      <div style="flex:1;">
        <div class="alert-title">${m.icon} ${m.name} <span class="td-mono" style="font-size:11px;color:var(--text-muted);">${m.code}</span></div>
        <div class="alert-desc">Stock: <strong style="color:var(--text);">${fmtNum(m.stock)} ${m.unit}</strong> — Minimum: ${fmtNum(m.minStock)} ${m.unit}</div>
      </div>
      <div>${m.stock < m.minStock ? '<span class="badge badge-red">RÉAPPROVISIONNEMENT URGENT</span>' : '<span class="badge badge-amber">Surveiller</span>'}</div>
    </div>`).join('');
  };

  renderList(critical.map(m => ({ ...m })), 'criticalAlerts');
  renderList(warnings.map(m => ({ ...m })), 'warningAlerts');

  const reorderEl = document.getElementById('reorderTable');
  const noAlerts = document.getElementById('noAlerts');
  if (!lowMats.length) {
    reorderEl.innerHTML = '';
    noAlerts.style.display = 'block';
    return;
  }
  noAlerts.style.display = 'none';

  reorderEl.innerHTML = lowMats.map(m => {
    const s = getStockStatus(m);
    const needed = Math.max(0, (m.safetyStock || m.minStock * 2) - m.stock);
    return `<tr>
      <td>${m.icon} ${m.name}</td>
      <td class="td-mono" style="color:${s === 'critical' ? 'var(--red)' : 'var(--amber)'};">${fmtNum(m.stock)} ${m.unit}</td>
      <td class="td-mono">${fmtNum(m.minStock)} ${m.unit}</td>
      <td><span class="badge badge-${s === 'critical' ? 'red' : 'amber'}">${s === 'critical' ? '🔴 CRITIQUE' : '⚠️ FAIBLE'}</span></td>
      <td style="font-size:12px;">Commander min. <strong style="color:var(--amber);">${fmtNum(Math.ceil(needed))} ${m.unit}</strong> — Fournisseur: ${m.supplier || '—'}</td>
    </tr>`;
  }).join('');
}
