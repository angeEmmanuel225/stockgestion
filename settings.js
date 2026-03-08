/* ════════════════════════════════════════════════════════ */
/*  SETTINGS PAGE & ADD MATERIAL FORM */
/* ════════════════════════════════════════════════════════ */

function renderSettings() {
  populateCountries('setCountry');
  populateCurrencies('setCurrency');
  const s = APP.settings;

  const view = document.getElementById('view-settings');
  view.innerHTML = `
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h3>🏢 Entreprise</h3></div>
        <div class="card-body">
          <div class="form-group"><label>Nom</label><input type="text" id="setCompany"></div>
          <div class="form-group"><label>Pays</label><select id="setCountry"></select></div>
          <div class="form-group"><label>Devise</label><select id="setCurrency"></select></div>
          <div class="form-group"><label>Format date</label><select id="setDateFmt">
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select></div>
          <button class="btn-sm btn-amber" onclick="saveSettings()" style="margin-top:8px;">Sauvegarder</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>🔔 Alertes & Seuils</h3></div>
        <div class="card-body">
          <div class="form-group">
            <label>Seuil d'alerte global (%)</label>
            <input type="range" id="setThreshold" min="5" max="50" value="20" oninput="document.getElementById('setThresholdVal').textContent=this.value+'%'">
            <span id="setThresholdVal" style="font-family:var(--font-mono);font-size:13px;color:var(--amber);">20%</span>
          </div>
          <div class="sep"></div>
          <div class="form-group">
            <label>Notifications par email (simulation)</label>
            <input type="text" id="setEmail" placeholder="email@entreprise.com">
          </div>
          <div class="form-group">
            <label>Fréquence des rapports automatiques</label>
            <select id="setReportFreq">
              <option>Quotidien</option><option>Hebdomadaire</option><option>Mensuel</option>
            </select>
          </div>
          <button class="btn-sm btn-amber" onclick="saveSettings()" style="margin-top:8px;">Sauvegarder</button>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:16px;">
      <div class="card-header"><h3>👥 Utilisateurs du Système</h3></div>
      <div class="card-body no-pad table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Nom</th><th>Rôle</th><th>Permissions</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td class="td-mono">DIR001</td><td>Directeur Général</td><td><span class="badge badge-amber">Administrateur</span></td><td style="font-size:12px;color:var(--text-dim);">Lecture, Rapports, Paramètres, Approbation</td><td><button class="btn-sm btn-blue" onclick="editUser('DIR001', 'Directeur Général', 'Administrateur')">✏️ Modifier</button></td></tr>
            <tr><td class="td-mono">TECH01</td><td>Directeur Technique</td><td><span class="badge badge-blue">Technique</span></td><td style="font-size:12px;color:var(--text-dim);">Lecture, Rapports, Monitoring</td><td><button class="btn-sm btn-blue" onclick="editUser('TECH01', 'Directeur Technique', 'Technique')">✏️ Modifier</button></td></tr>
            <tr><td class="td-mono">STOCK01</td><td>Responsable Stock</td><td><span class="badge badge-green">Opérateur</span></td><td style="font-size:12px;color:var(--text-dim);">Lecture, Entrées/Sorties, Gestion Stock</td><td><button class="btn-sm btn-blue" onclick="editUser('STOCK01', 'Responsable Stock', 'Opérateur')">✏️ Modifier</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('setCompany').value = s.company || '';
  document.getElementById('setCountry').value = s.country || '';
  document.getElementById('setCurrency').value = s.currency || '';
  document.getElementById('setDateFmt').value = s.dateFmt || 'DD/MM/YYYY';
  document.getElementById('setThreshold').value = s.alertThreshold || 20;
  document.getElementById('setThresholdVal').textContent = (s.alertThreshold || 20) + '%';
}

function saveSettings() {
  const company = document.getElementById('setCompany').value.trim();
  const country = document.getElementById('setCountry').value;
  const currency = document.getElementById('setCurrency').value;
  const cur = CURRENCIES.find(c => c.code === currency);
  APP.settings = {
    ...APP.settings,
    company: company || APP.settings.company,
    country: country || APP.settings.country,
    currency: currency || APP.settings.currency,
    currencySymbol: cur?.symbol || APP.settings.currencySymbol,
    dateFmt: document.getElementById('setDateFmt').value,
    alertThreshold: parseInt(document.getElementById('setThreshold').value),
    email: document.getElementById('setEmail')?.value
  };
  document.getElementById('sidebarCompany').textContent = APP.settings.company;
  saveData();
  showToast('✅ Paramètres sauvegardés', 'Configuration mise à jour.', 'success');
}

// ADD MATERIAL FORM
document.addEventListener('DOMContentLoaded', () => {
  const addMatView = document.getElementById('view-add-material');
  if (addMatView) {
    addMatView.addEventListener('click', function(e) {
      if (e.target.tagName === 'BUTTON' && e.target.textContent.includes('Créer')) {
        addMaterial();
      }
    });
  }
});

window.addEventListener('load', () => {
  // Initialize add-material view
  const addMatView = document.getElementById('view-add-material');
  if (addMatView) {
    addMatView.innerHTML = `
      <div class="card" style="max-width:640px;">
        <div class="card-header"><h3>➕ Créer une Nouvelle Matière Première</h3></div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label>Nom de la matière</label>
              <input type="text" id="newMatName" placeholder="Ex: Résine PEHD">
            </div>
            <div class="form-group">
              <label>Code / Référence</label>
              <input type="text" id="newMatCode" placeholder="Ex: MAT-001">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Catégorie</label>
              <select id="newMatCat">
                <option>Polymères</option>
                <option>Additifs</option>
                <option>Colorants</option>
                <option>Plastifiants</option>
                <option>Stabilisants</option>
                <option>Charges</option>
                <option>Emballages</option>
                <option>Consommables</option>
                <option>Autre</option>
              </select>
            </div>
            <div class="form-group">
              <label>Unité de mesure</label>
              <select id="newMatUnit">
                <option value="kg">kg (kilogramme)</option>
                <option value="t">t (tonne)</option>
                <option value="L">L (litre)</option>
                <option value="m">m (mètre)</option>
                <option value="m²">m² (mètre carré)</option>
                <option value="pcs">pcs (pièces)</option>
                <option value="sacs">sacs</option>
                <option value="fûts">fûts</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Stock initial</label>
              <input type="number" id="newMatStock" min="0" step="0.001" placeholder="0.000">
            </div>
            <div class="form-group">
              <label>Stock minimum d'alerte</label>
              <input type="number" id="newMatMin" min="0" step="0.001" placeholder="0.000">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Stock de sécurité (réapprovisionnement)</label>
              <input type="number" id="newMatSafety" min="0" step="0.001" placeholder="0.000">
            </div>
            <div class="form-group">
              <label>Fournisseur principal</label>
              <input type="text" id="newMatSupplier" placeholder="Nom du fournisseur">
            </div>
          </div>
          <div class="form-group">
            <label>Description (optionnel)</label>
            <input type="text" id="newMatDesc" placeholder="Description de la matière...">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Couleur indicateur</label>
              <select id="newMatColor">
                <option value="#f59e0b">🟡 Ambre</option>
                <option value="#3b82f6">🔵 Bleu</option>
                <option value="#10b981">🟢 Vert</option>
                <option value="#8b5cf6">🟣 Violet</option>
                <option value="#f97316">🟠 Orange</option>
                <option value="#06b6d4">🩵 Cyan</option>
                <option value="#ec4899">🩷 Rose</option>
              </select>
            </div>
            <div class="form-group">
              <label>Icône</label>
              <select id="newMatIcon">
                <option value="🧴">🧴 Liquide</option>
                <option value="⚗️">⚗️ Chimique</option>
                <option value="🔷">🔷 Granulés</option>
                <option value="🎨">🎨 Colorant</option>
                <option value="📦">📦 Solide</option>
                <option value="🧪">🧪 Additif</option>
                <option value="⚙️">⚙️ Pièce</option>
                <option value="🌀">🌀 Polymère</option>
              </select>
            </div>
          </div>
          <div style="display:flex;gap:10px;margin-top:16px;">
            <button class="btn-sm btn-amber" onclick="addMaterial()" style="flex:1;justify-content:center;padding:12px;">✅ Créer la Matière</button>
            <button class="btn-sm" onclick="showView('materials')" style="padding:12px 20px;">Annuler</button>
          </div>
        </div>
      </div>
    `;
  }
});

function addMaterial() {
  const name = document.getElementById('newMatName').value.trim();
  const code = document.getElementById('newMatCode').value.trim();
  if (!name) { showToast('⚠️ Erreur', 'Le nom est requis.', 'warning'); return; }
  if (APP.materials.find(m => m.code === code)) { showToast('⚠️ Erreur', 'Ce code existe déjà.', 'warning'); return; }

  const mat = {
    id: 'MAT' + Date.now(),
    name, code: code || 'MAT-' + Date.now(),
    cat: document.getElementById('newMatCat').value,
    unit: document.getElementById('newMatUnit').value,
    stock: parseFloat(document.getElementById('newMatStock').value) || 0,
    minStock: parseFloat(document.getElementById('newMatMin').value) || 0,
    safetyStock: parseFloat(document.getElementById('newMatSafety').value) || 0,
    supplier: document.getElementById('newMatSupplier').value,
    desc: document.getElementById('newMatDesc').value,
    color: document.getElementById('newMatColor').value,
    icon: document.getElementById('newMatIcon').value,
    created: today()
  };

  APP.materials.push(mat);
  saveData();
  showToast('✅ Matière créée', `${mat.icon} ${mat.name} ajoutée avec succès.`, 'success');

  ['newMatName', 'newMatCode', 'newMatStock', 'newMatMin', 'newMatSafety', 'newMatSupplier', 'newMatDesc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  setTimeout(() => showView('materials'), 500);
}

// EDIT USER FUNCTION
function editUser(userId, userName, userRole) {
  const roles = ['Administrateur', 'Technique', 'Opérateur'];
  const permissions = {
    'Administrateur': 'Lecture, Rapports, Paramètres, Approbation',
    'Technique': 'Lecture, Rapports, Monitoring',
    'Opérateur': 'Lecture, Entrées/Sorties, Gestion Stock'
  };

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'editUserModal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box">
      <h2>✏️ Modifier Utilisateur</h2>
      <p class="modal-sub">Modifiez les informations de l'utilisateur ${userId}</p>
      
      <div class="form-group">
        <label>ID Utilisateur</label>
        <input type="text" value="${userId}" disabled style="opacity:0.6;">
      </div>
      
      <div class="form-group">
        <label>Nom</label>
        <input type="text" id="editUserName" value="${userName}">
      </div>
      
      <div class="form-group">
        <label>Rôle</label>
        <select id="editUserRole">
          ${roles.map(r => `<option value="${r}" ${r === userRole ? 'selected' : ''}>${r}</option>`).join('')}
        </select>
      </div>
      
      <div class="form-group">
        <label>Permissions</label>
        <div style="padding:10px;background:var(--bg-light);border-radius:4px;font-size:12px;color:var(--text-muted);" id="editUserPerms">
          ${permissions[userRole]}
        </div>
      </div>
      
      <div style="display:flex;gap:10px;margin-top:20px;">
        <button class="btn-sm btn-amber" onclick="saveUserEdit('${userId}')" style="flex:1;justify-content:center;padding:10px;">💾 Sauvegarder</button>
        <button class="btn-sm" onclick="closeEditUserModal()" style="flex:1;justify-content:center;padding:10px;">Annuler</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Update permissions when role changes
  document.getElementById('editUserRole').addEventListener('change', function() {
    document.getElementById('editUserPerms').textContent = permissions[this.value];
  });
  
  // Close modal on overlay click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeEditUserModal();
  });
}

function closeEditUserModal() {
  const modal = document.getElementById('editUserModal');
  if (modal) modal.remove();
}

function saveUserEdit(userId) {
  const newName = document.getElementById('editUserName').value.trim();
  const newRole = document.getElementById('editUserRole').value;
  
  if (!newName) {
    showToast('⚠️ Erreur', 'Le nom ne peut pas être vide.', 'warning');
    return;
  }
  
  showToast('✅ Modification sauvegardée', `L'utilisateur ${userId} a été mis à jour.`, 'success');
  closeEditUserModal();
  
  // Refresh settings view
  setTimeout(() => {
    renderSettings();
  }, 300);
}
