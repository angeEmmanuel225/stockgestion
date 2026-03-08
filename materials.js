/* ════════════════════════════════════════════════════════ */
/*  MATERIALS PAGE */
/* ════════════════════════════════════════════════════════ */

function renderMaterials() {
  const view = document.getElementById('view-materials');
  view.innerHTML = `
    <div class="cmd-bar">
      <div class="search-input">
        🔍 <input type="text" id="matSearch" placeholder="Rechercher une matière..." oninput="renderMaterials()">
      </div>
      <div class="filter-pills">
        <div class="filter-pill active" onclick="filterMat(this,'all')">Tout</div>
        <div class="filter-pill" onclick="filterMat(this,'ok')">✅ Normal</div>
        <div class="filter-pill" onclick="filterMat(this,'low')">⚠️ Faible</div>
        <div class="filter-pill" onclick="filterMat(this,'critical')">🔴 Critique</div>
      </div>
      <div class="spacer"></div>
      <button class="btn-sm btn-amber admin-only" onclick="showView('add-material')" style="display:none;">+ Nouvelle Matière</button>
    </div>
    <div class="mat-grid" id="matGrid"></div>
  `;

  const query = document.getElementById('matSearch')?.value.toLowerCase() || '';
  let mats = APP.materials.filter(m => {
    if (query && !m.name.toLowerCase().includes(query) && !m.code.toLowerCase().includes(query)) return false;
    if (APP.currentFilter === 'ok') return getStockStatus(m) === 'ok';
    if (APP.currentFilter === 'low') return getStockStatus(m) === 'warning';
    if (APP.currentFilter === 'critical') return getStockStatus(m) === 'critical';
    return true;
  });

  const grid = document.getElementById('matGrid');
  if (!mats.length) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">📦</div><p>Aucune matière trouvée</p></div>';
    return;
  }

  grid.innerHTML = mats.map(m => {
    const s = getStockStatus(m);
    const alertColor = s === 'critical' ? 'var(--red)' : s === 'warning' ? 'var(--amber)' : 'transparent';
    const pct = getStockPct(m);
    const barColor = s === 'critical' ? 'var(--red)' : s === 'warning' ? 'var(--amber)' : 'var(--green)';
    return `<div class="mat-card" style="--mat-color:${m.color};position:relative;">
      ${s !== 'ok' ? `<div class="mat-card-alert" style="background:${alertColor};box-shadow:0 0 8px ${alertColor};"></div>` : ''}
      ${APP.currentUser.role === 'DG' ? `<div style="position:absolute;top:8px;right:8px;display:flex;gap:4px;z-index:10;">
        <button class="btn-xs" style="background:rgba(33,150,243,0.8);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px;" onclick="event.stopPropagation(); showEditMatModal('${m.id}')">✏️</button>
        <button class="btn-xs" style="background:rgba(244,67,54,0.8);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px;" onclick="event.stopPropagation(); deleteMaterial('${m.id}')">🗑️</button>
      </div>` : ''}
      <div class="mat-card-top" onclick="showMatDetail('${m.id}')">
        <div class="mat-icon" style="border-color:${m.color}22;color:${m.color};">${m.icon}</div>
        <div>
          <h4>${m.name}</h4>
          <div class="mat-cat">${m.cat} · ${m.code}</div>
        </div>
      </div>
      <div class="mat-stock-info" onclick="showMatDetail('${m.id}')">
        <span style="color:var(--text-muted);font-size:12px;">Stock actuel</span>
        <span class="badge badge-${s === 'ok' ? 'green' : s === 'warning' ? 'amber' : 'red'}">${s === 'ok' ? '✅ Normal' : s === 'warning' ? '⚠️ Faible' : '🔴 Critique'}</span>
      </div>
      <div class="mat-stock-num" style="color:${m.color};margin-bottom:10px;cursor:pointer;" onclick="showMatDetail('${m.id}')">${fmtNum(m.stock)} <span style="font-size:13px;color:var(--text-muted);">${m.unit}</span></div>
      <div class="stock-bar-wrap" onclick="showMatDetail('${m.id}')">
        <div class="stock-bar-bg"><div class="stock-bar-fill" style="width:${pct}%;background:${barColor};"></div></div>
        <div class="stock-bar-pct" style="color:${barColor}">${pct}%</div>
      </div>
      <div style="margin-top:10px;font-size:11px;color:var(--text-muted);cursor:pointer;" onclick="showMatDetail('${m.id}')">Min: ${fmtNum(m.minStock)} ${m.unit}</div>
    </div>`;
  }).join('');
}

function filterMat(el, filter) {
  APP.currentFilter = filter;
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  renderMaterials();
}

// ─── EXPOSE TO WINDOW ───
window.renderMaterials = renderMaterials;
window.filterMat = filterMat;

