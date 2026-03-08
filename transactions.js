/* ════════════════════════════════════════════════════════ */
/*  TRANSACTIONS PAGE */
/* ════════════════════════════════════════════════════════ */

function renderTransactions() {
  const view = document.getElementById('view-transactions');
  view.innerHTML = `
    <div class="cmd-bar">
      <div class="filter-pills">
        <div class="filter-pill active" onclick="filterTx(this,'all')">Tous</div>
        <div class="filter-pill" onclick="filterTx(this,'entry')">📥 Entrées</div>
        <div class="filter-pill" onclick="filterTx(this,'exit')">📤 Sorties</div>
      </div>
      <div class="spacer"></div>
      <div class="topbar-time" id="txDateRange"></div>
    </div>
    <div class="card">
      <div class="card-body no-pad table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Matière</th>
              <th>Type</th>
              <th>Quantité</th>
              <th>Stock après</th>
              <th>Responsable</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody id="txTableBody"></tbody>
        </table>
        <div id="txEmpty" class="empty-state" style="display:none;"><div class="empty-icon">📄</div><p>Aucun mouvement enregistré</p></div>
      </div>
    </div>
  `;

  let txs = APP.transactions.slice().reverse();
  if (APP.txFilter !== 'all') txs = txs.filter(t => t.type === APP.txFilter);
  const tbody = document.getElementById('txTableBody');
  const empty = document.getElementById('txEmpty');

  if (!txs.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = txs.map(t => {
    const mat = APP.materials.find(m => m.id === t.matId);
    return `<tr>
      <td class="td-mono">${fmtDate(t.date)}</td>
      <td>${mat ? `${mat.icon} ${mat.name}` : '—'}</td>
      <td>${t.type === 'entry' ? '<span class="badge badge-green">📥 Entrée</span>' : '<span class="badge badge-red">📤 Sortie</span>'}</td>
      <td class="td-mono" style="color:${t.type === 'entry' ? 'var(--green)' : 'var(--red)'};">${t.type === 'entry' ? '+' : '−'}${fmtNum(t.qty)} ${mat?.unit || ''}</td>
      <td class="td-mono" style="font-size:11px;">${fmtNum(t.stockAfter || 0)}</td>
      <td style="font-size:12px;">${USERS[t.user]?.name || t.user}</td>
      <td style="font-size:12px;color:var(--text-muted);">${t.note || '—'}</td>
    </tr>`;
  }).join('');
}

function filterTx(el, f) {
  APP.txFilter = f;
  document.querySelectorAll('#view-transactions .filter-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  renderTransactions();
}

// FORM FUNCTIONS
function prepForm(type) {
  const view = document.getElementById('view-' + type);
  const selId = type === 'entry' ? 'entryMat' : 'exitMat';

  view.innerHTML = `
    <div class="card" style="max-width:600px;">
      <div class="card-header"><h3>${type === 'entry' ? '📥 Enregistrer une Entrée de Stock' : '📤 Enregistrer une Sortie de Stock'}</h3></div>
      <div class="card-body">
        <div class="form-group">
          <label>Matière Première</label>
          <select id="${selId}" class="form-input" onchange="updateEntryInfo('${type}')">
            <option value="">-- Sélectionner --</option>
          </select>
        </div>
        <div id="${type}CurrentStock" style="display:none;margin-bottom:16px;padding:12px;background:var(--bg-deep);border-radius:var(--radius);border:1px solid var(--border);">
          <span style="font-size:12px;color:var(--text-muted);">Stock actuel : </span>
          <span id="${type}CurrentVal" style="font-family:var(--font-mono);color:var(--amber);font-weight:500;"></span>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Quantité ${type === 'entry' ? 'reçue' : 'utilisée'}</label>
            <input type="number" id="${type}Qty" min="0.001" step="0.001" placeholder="0.000">
          </div>
          <div class="form-group">
            <label>Date ${type === 'entry' ? 'de réception' : "d'utilisation"}</label>
            <input type="date" id="${type}Date">
          </div>
        </div>
        ${type === 'entry' ? `
          <div class="form-group">
            <label>Fournisseur</label>
            <input type="text" id="entrySupplier" placeholder="Nom du fournisseur">
          </div>
          <div class="form-group">
            <label>Numéro de bon / Référence</label>
            <input type="text" id="entryRef" placeholder="REF-XXXXXXXX">
          </div>
        ` : `
          <div class="form-group">
            <label>Usage / Destination</label>
            <input type="text" id="exitUsage" placeholder="Production ligne A...">
          </div>
        `}
        <div class="form-group">
          <label>Note (optionnel)</label>
          <input type="text" id="${type}Note" placeholder="Commentaire...">
        </div>
        <div style="display:flex;gap:10px;margin-top:8px;">
          <button class="btn-sm btn-${type === 'entry' ? 'green' : 'red'}" onclick="submitTransaction('${type}')" style="flex:1;justify-content:center;padding:12px;">
            ${type === 'entry' ? '✅ Enregistrer l\'Entrée' : '📤 Enregistrer la Sortie'}
          </button>
          <button class="btn-sm" onclick="showView('materials')" style="padding:12px 20px;">Annuler</button>
        </div>
      </div>
    </div>
  `;

  const sel = document.getElementById(selId);
  sel.innerHTML = '<option value="">-- Sélectionner --</option>';
  APP.materials.forEach(m => sel.innerHTML += `<option value="${m.id}">${m.icon} ${m.name} (${fmtNum(m.stock)} ${m.unit})</option>`);
  const dateId = type === 'entry' ? 'entryDate' : 'exitDate';
  document.getElementById(dateId).value = today();

  if (APP.activeMat) {
    sel.value = APP.activeMat.id;
    updateEntryInfo(type);
  }
}

function updateEntryInfo(type) {
  const selId = type === 'entry' ? 'entryMat' : 'exitMat';
  const infoId = type === 'entry' ? 'entryCurrentStock' : 'exitCurrentStock';
  const valId = type === 'entry' ? 'entryCurrentVal' : 'exitCurrentVal';
  const mat = APP.materials.find(m => m.id === document.getElementById(selId).value);
  if (mat) {
    document.getElementById(infoId).style.display = 'block';
    document.getElementById(valId).textContent = `${fmtNum(mat.stock)} ${mat.unit}`;
  } else {
    document.getElementById(infoId).style.display = 'none';
  }
}

function submitTransaction(type) {
  const selId = type === 'entry' ? 'entryMat' : 'exitMat';
  const qtyId = type === 'entry' ? 'entryQty' : 'exitQty';
  const noteId = type === 'entry' ? 'entryNote' : 'exitNote';
  const dateId = type === 'entry' ? 'entryDate' : 'exitDate';

  const matId = document.getElementById(selId).value;
  const qty = parseFloat(document.getElementById(qtyId).value);
  const note = document.getElementById(noteId).value;
  const date = document.getElementById(dateId).value || today();

  if (!matId) { showToast('⚠️ Erreur', 'Sélectionnez une matière première.', 'warning'); return; }
  if (!qty || qty <= 0) { showToast('⚠️ Erreur', 'Entrez une quantité valide.', 'warning'); return; }

  const mat = APP.materials.find(m => m.id === matId);
  if (!mat) return;

  if (type === 'exit' && qty > mat.stock) {
    showToast('❌ Stock insuffisant', `Stock disponible: ${fmtNum(mat.stock)} ${mat.unit}`, 'error');
    return;
  }

  const oldStock = mat.stock;
  if (type === 'entry') mat.stock += qty;
  else mat.stock -= qty;

  const ref = type === 'entry' ? (document.getElementById('entryRef')?.value || `ENT-${Date.now()}`) : `SOR-${Date.now()}`;
  const tx = {
    id: `TX${Date.now()}`, type, matId, qty, date, note, ref,
    user: APP.currentUser.id,
    stockBefore: oldStock,
    stockAfter: mat.stock,
    supplier: type === 'entry' ? document.getElementById('entrySupplier')?.value : undefined,
    usage: type === 'exit' ? document.getElementById('exitUsage')?.value : undefined
  };

  APP.transactions.push(tx);
  saveData();
  checkAlerts();

  const icon = type === 'entry' ? '📥' : '📤';
  showToast(`${icon} Mouvement enregistré`, `${type === 'entry' ? '+' : '-'}${fmtNum(qty)} ${mat.unit} · Nouveau stock: ${fmtNum(mat.stock)} ${mat.unit}`, 'success');

  document.getElementById(qtyId).value = '';
  document.getElementById(noteId).value = '';
  if (document.getElementById('entryRef')) document.getElementById('entryRef').value = '';

  if (getStockStatus(mat) !== 'ok') {
    setTimeout(() => showToast('⚠️ Alerte Stock', `${mat.name} est en stock ${getStockStatus(mat) === 'critical' ? 'critique' : 'faible'} !`, 'warning'), 800);
  }
}

// ─── EXPOSE TO WINDOW ───
window.renderTransactions = renderTransactions;
window.prepForm = prepForm;
window.updateEntryInfo = updateEntryInfo;
window.submitTransaction = submitTransaction;

