/* ════════════════════════════════════════════════════════ */
/*  MATERIAL DETAIL PAGE */
/* ════════════════════════════════════════════════════════ */

function showMatDetail(id) {
  APP.activeMat = APP.materials.find(m => m.id === id);
  if (!APP.activeMat) return;
  const m = APP.activeMat;

  const view = document.getElementById('view-mat-detail');
  const s = getStockStatus(m);
  const pct = Math.round((m.stock / (m.minStock || 1)) * 100);

  view.innerHTML = `
    <div class="material-header" style="--mat-color:${m.color};margin-bottom:16px;">
      <div class="mat-avatar">${m.icon}</div>
      <div class="mat-info">
        <h2>${m.name}</h2>
        <p>${m.code} · ${m.cat} · <span class="badge badge-${s === 'ok' ? 'green' : s === 'warning' ? 'amber' : 'red'}">${s === 'ok' ? '✅ Normal' : s === 'warning' ? '⚠️ Faible' : '🔴 Critique'}</span></p>
      </div>
      <div class="mat-stats">
        <div class="mat-stat"><div class="val" style="color:${m.color};">${fmtNum(m.stock)}</div><div class="lbl">Stock (${m.unit})</div></div>
        <div class="mat-stat"><div class="val">${fmtNum(m.minStock)}</div><div class="lbl">Minimum</div></div>
        <div class="mat-stat"><div class="val">${pct}%</div><div class="lbl">Du seuil</div></div>
      </div>
      <div style="display:flex;gap:8px;margin-left:16px;flex-wrap:wrap;">
        <button class="btn-sm" onclick="showView('materials')">← Retour</button>
        ${APP.currentUser.role === 'STOCK' ? `<button class="btn-sm btn-green" onclick="prepFormForMat('${m.id}','entry')">+ Entrée</button><button class="btn-sm btn-red" onclick="prepFormForMat('${m.id}','exit')">− Sortie</button>` : ''}
        ${APP.currentUser.role === 'DG' ? `<button class="btn-sm btn-blue" onclick="showEditMatModal('${m.id}')">✏️ Modifier</button><button class="btn-sm btn-red" style="opacity:0.7;" onclick="deleteMaterial('${m.id}')">🗑️ Supprimer</button>` : ''}
      </div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h3>📊 Évolution du Stock</h3></div>
        <div class="card-body"><div class="chart-container"><canvas id="chartMatHistory"></canvas></div></div>
      </div>
      <div class="card">
        <div class="card-header"><h3>📋 Informations</h3></div>
        <div class="card-body" id="matDetailInfo"></div>
      </div>
    </div>
    <div class="card" style="margin-top:16px;">
      <div class="card-header">
        <h3>🔄 Historique des Mouvements</h3>
      </div>
      <div class="card-body no-pad table-wrap" id="matTxTable"></div>
    </div>
  `;

  // Info
  document.getElementById('matDetailInfo').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;">
      <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);font-size:12px;">Fournisseur</span><span style="font-size:13px;">${m.supplier || '—'}</span></div>
      <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);font-size:12px;">Stock de sécurité</span><span style="font-family:var(--font-mono);font-size:13px;">${fmtNum(m.safetyStock || 0)} ${m.unit}</span></div>
      <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);font-size:12px;">Catégorie</span><span class="badge badge-blue">${m.cat}</span></div>
      <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);font-size:12px;">Unité</span><span style="font-size:13px;">${m.unit}</span></div>
      <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);font-size:12px;">Créé le</span><span style="font-size:13px;">${fmtDate(m.created)}</span></div>
      <div class="sep"></div>
      <div style="font-size:12px;color:var(--text-muted);">${m.desc || ''}</div>
    </div>
  `;

  const txs = APP.transactions.filter(t => t.matId === id).slice(-30);
  renderMatHistoryChart(txs, m);
  renderMatTxTable(id);

  view.classList.add('active');
  document.querySelectorAll('.view').forEach(v => { if (v.id !== 'view-mat-detail') v.classList.remove('active'); });
  const topbarTitle = document.getElementById('topbarTitle');
  if (topbarTitle) topbarTitle.textContent = `📦 ${m.name}`;
}

function renderMatHistoryChart(txs, m) {
  const ctx = document.getElementById('chartMatHistory');
  if (!ctx) return;
  if (APP.chartsInstances.matHistory) APP.chartsInstances.matHistory.destroy();

  const labels = txs.map(t => fmtDate(t.date).substr(0, 5));
  const data = txs.map((t, i) => {
    let stock = m.stock;
    for (let j = txs.length - 1; j > i; j--) {
      if (txs[j].type === 'entry') stock -= txs[j].qty;
      else stock += txs[j].qty;
    }
    return stock;
  });

  APP.chartsInstances.matHistory = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Stock',
        data,
        borderColor: m.color,
        backgroundColor: m.color + '22',
        borderWidth: 2,
        fill: true,
        tension: .4,
        pointRadius: 3,
        pointBackgroundColor: m.color
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: '#475569', font: { size: 9 } }, grid: { color: '#1e3050' } },
        y: { ticks: { color: '#475569', font: { size: 10 } }, grid: { color: '#1e3050' } }
      }
    }
  });
}

function renderMatTxTable(matId) {
  const txs = APP.transactions.filter(t => t.matId === matId).slice().reverse();
  const el = document.getElementById('matTxTable');
  if (!txs.length) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">📄</div><p>Aucun mouvement</p></div>'; return; }
  el.innerHTML = `<table>
    <thead><tr><th>Date</th><th>Type</th><th>Quantité</th><th>Référence</th><th>Responsable</th><th>Note</th></tr></thead>
    <tbody>${txs.map(t => `<tr>
      <td class="td-mono">${fmtDate(t.date)}</td>
      <td>${t.type === 'entry' ? '<span class="badge badge-green">📥 Entrée</span>' : '<span class="badge badge-red">📤 Sortie</span>'}</td>
      <td class="td-mono" style="color:${t.type === 'entry' ? 'var(--green)' : 'var(--red)'};">${t.type === 'entry' ? '+' : '−'}${fmtNum(t.qty)}</td>
      <td class="td-mono" style="color:var(--text-muted);font-size:11px;">${t.ref || '—'}</td>
      <td style="font-size:12px;">${USERS[t.user]?.name || t.user}</td>
      <td style="font-size:12px;color:var(--text-muted);">${t.note || '—'}</td>
    </tr>`).join('')}</tbody>
  </table>`;
}

function prepFormForMat(matId, type) {
  const id = typeof matId === 'string' ? parseInt(matId) : matId;
  APP.activeMat = APP.materials.find(m => m.id === id);
  prepForm(type);
}

// ─── EDIT MATERIAL ───
function showEditMatModal(matId) {
  const material = APP.materials.find(m => m.id === matId);
  if (!material) return;

  const html = `
    <div class="modal-overlay" onclick="if(event.target === this) { this.remove(); }">
      <div class="modal-box" style="width:90%;max-width:500px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h3>✏️ Modifier Matière</h3>
          <button class="btn-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        
        <form id="formEditMat" style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <label style="font-size:12px;font-weight:600;color:var(--text-muted);">Code</label>
            <input type="text" id="editCode" value="${material.code}" class="form-input" required>
          </div>
          <div>
            <label style="font-size:12px;font-weight:600;color:var(--text-muted);">Nom</label>
            <input type="text" id="editName" value="${material.name}" class="form-input" required>
          </div>
          <div>
            <label style="font-size:12px;font-weight:600;color:var(--text-muted);">Stock Initial</label>
            <input type="number" id="editStock" value="${material.stock}" class="form-input" min="0">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <label style="font-size:12px;font-weight:600;color:var(--text-muted);">Min</label>
              <input type="number" id="editMinStock" value="${material.minStock}" class="form-input" min="0">
            </div>
            <div>
              <label style="font-size:12px;font-weight:600;color:var(--text-muted);">Max</label>
              <input type="number" id="editMaxStock" value="${material.maxStock}" class="form-input" min="0">
            </div>
          </div>
          <div>
            <label style="font-size:12px;font-weight:600;color:var(--text-muted);">Fournisseur</label>
            <input type="text" id="editSupplier" value="${material.supplier || ''}" class="form-input">
          </div>
          <div style="display:flex;gap:8px;margin-top:16px;">
            <button type="submit" class="btn btn-green" style="flex:1;">💾 Enregistrer</button>
            <button type="button" class="btn btn-secondary" style="flex:1;" onclick="this.closest('.modal-overlay').remove()">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const modal = document.createElement('div');
  modal.innerHTML = html;
  document.body.appendChild(modal);

  document.getElementById('formEditMat').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const updated = {
      id: material.id,
      code: document.getElementById('editCode').value,
      name: document.getElementById('editName').value,
      current_stock: parseInt(document.getElementById('editStock').value),
      min_stock: parseInt(document.getElementById('editMinStock').value),
      max_stock: parseInt(document.getElementById('editMaxStock').value),
      supplier: document.getElementById('editSupplier').value
    };

    // Mettre à jour localement
    const idx = APP.materials.findIndex(m => m.id === material.id);
    if (idx !== -1) {
      APP.materials[idx] = { ...APP.materials[idx], ...updated };
      APP.materials[idx].stock = updated.current_stock;
      APP.materials[idx].minStock = updated.min_stock;
      APP.materials[idx].maxStock = updated.max_stock;
    }

    saveData();
    modal.remove();
    showToast('✅ Matière mise à jour', 'Modification enregistrée', 'success');
    renderMaterials();
    showMatDetail(material.id);
  });
}

// ─── DELETE MATERIAL ───
async function deleteMaterial(matId) {
  const material = APP.materials.find(m => m.id === matId);
  if (!material) return;

  const confirm = window.confirm(`⚠️ Êtes-vous sûr de vouloir supprimer "${material.name}"?\n\nCette action est irréversible.`);
  if (!confirm) return;

  // Supprimer localement
  APP.materials = APP.materials.filter(m => m.id !== matId);
  APP.transactions = APP.transactions.filter(t => t.materialId !== matId);

  saveData();
  showToast('🗑️ Matière supprimée', `${material.name} a été supprimée`, 'success');
  showView('materials');
  renderMaterials();
}

// ─── EXPOSE TO WINDOW ───
window.showMatDetail = showMatDetail;
window.prepFormForMat = prepFormForMat;
window.showEditMatModal = showEditMatModal;
window.deleteMaterial = deleteMaterial;


