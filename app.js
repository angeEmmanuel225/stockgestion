/* ════════════════════════════════════════════════════════ */
/*  STOCKPRO INDUSTRIAL v2.0 — APP CORE */
/* ════════════════════════════════════════════════════════ */

// Expose utility functions to window for script.js compatibility
window.fmtDate = fmtDate;
window.todayApp = today;
window.fmtNum = fmtNum;
window.getStockPct = getStockPct;
window.getStockStatus = getStockStatus;
window.showToastApp = showToast;
window.saveDataApp = saveData;
window.loadDataApp = loadData;

// Expose first login detection functions
window.getFirstLoginInfo = getFirstLoginInfo;
window.isNewUser = isNewUser;
window.getUserLoginDates = getUserLoginDates;
window.recordUserLogin = recordUserLogin;

// APP STATE
let APP = {
  currentUser: null,
  isFirstLogin: true, // Track if this is user's first login
  settings: {
    company: 'Mon Entreprise',
    country: 'TG',
    currency: 'XOF',
    currencySymbol: 'CFA',
    dateFmt: 'DD/MM/YYYY',
    alertThreshold: 20,
    lang: 'fr'
  },
  materials: [],
  transactions: [],
  currentFilter: 'all',
  txFilter: 'all',
  reportPeriod: 'day',
  activeMat: null,
  chartsInstances: {}
};

// ─── STORAGE ───
function getUserDataKeys() {
  const userId = APP.currentUser ? APP.currentUser.id : 'guest';
  return {
    settings: `stockpro:user_${userId}:settings`,
    materials: `stockpro:user_${userId}:materials`,
    transactions: `stockpro:user_${userId}:transactions`
  };
}

async function saveData() {
  try {
    const keys = getUserDataKeys();
    if (window.storage) {
      await window.storage.set(keys.settings, JSON.stringify(APP.settings), true);
      await window.storage.set(keys.materials, JSON.stringify(APP.materials), true);
      await window.storage.set(keys.transactions, JSON.stringify(APP.transactions), true);
    } else {
      localStorage.setItem(keys.settings, JSON.stringify(APP.settings));
      localStorage.setItem(keys.materials, JSON.stringify(APP.materials));
      localStorage.setItem(keys.transactions, JSON.stringify(APP.transactions));
    }
  } catch (e) {
    const keys = getUserDataKeys();
    localStorage.setItem(keys.settings, JSON.stringify(APP.settings));
    localStorage.setItem(keys.materials, JSON.stringify(APP.materials));
    localStorage.setItem(keys.transactions, JSON.stringify(APP.transactions));
  }
}

async function loadData() {
  try {
    const keys = getUserDataKeys();
    let s, m, t;
    if (window.storage) {
      try { s = await window.storage.get(keys.settings, true); } catch (e) { }
      try { m = await window.storage.get(keys.materials, true); } catch (e) { }
      try { t = await window.storage.get(keys.transactions, true); } catch (e) { }
    }
    if (!s) { try { const v = localStorage.getItem(keys.settings); if (v) s = { value: v }; } catch (e) { } }
    if (!m) { try { const v = localStorage.getItem(keys.materials); if (v) m = { value: v }; } catch (e) { } }
    if (!t) { try { const v = localStorage.getItem(keys.transactions); if (v) t = { value: v }; } catch (e) { } }

    if (s) APP.settings = { ...APP.settings, ...JSON.parse(s.value) };
    if (m) {
      const materials = JSON.parse(m.value);
      // Convert database column names to camelCase for JS
      APP.materials = materials.map(convertMaterialFromDB);
    }
    if (t) {
      const transactions = JSON.parse(t.value);
      // Convert database column names to camelCase for JS
      APP.transactions = transactions.map(convertTransactionFromDB);
    }
  } catch (e) { console.warn('Load error', e); }
}

// ─── DATABASE COLUMN CONVERSION ───
/**
 * Convert material from database column names (snake_case) to JS property names (camelCase)
 * DB columns: current_stock, min_stock, max_stock, unit_price, safety_stock, category_id, unit_id
 */
function convertMaterialFromDB(material) {
  return {
    ...material,
    // Direct aliases from DB columns
    stock: material.current_stock !== undefined ? material.current_stock : material.stock,
    minStock: material.min_stock !== undefined ? material.min_stock : material.minStock,
    maxStock: material.max_stock !== undefined ? material.max_stock : material.maxStock,
    safetyStock: material.safety_stock !== undefined ? material.safety_stock : material.safetyStock,
    unitPrice: material.unit_price !== undefined ? material.unit_price : material.unitPrice,
    categoryId: material.category_id !== undefined ? material.category_id : material.categoryId,
    unitId: material.unit_id !== undefined ? material.unit_id : material.unitId,
    createdBy: material.created_by !== undefined ? material.created_by : material.createdBy,
    isActive: material.is_active !== undefined ? material.is_active : material.isActive
  };
}

/**
 * Convert transaction from database column names to JS property names
 * DB columns: material_id, material_code, reference_no, created_by
 */
function convertTransactionFromDB(transaction) {
  return {
    ...transaction,
    materialId: transaction.material_id !== undefined ? transaction.material_id : transaction.materialId,
    materialCode: transaction.material_code !== undefined ? transaction.material_code : transaction.materialCode,
    referenceNo: transaction.reference_no !== undefined ? transaction.reference_no : transaction.referenceNo,
    createdBy: transaction.created_by !== undefined ? transaction.created_by : transaction.createdBy
  };
}

// ─── UTILITIES ───
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const [y, mo, d] = dateStr.split('-');
  const fmt = APP.settings.dateFmt || 'DD/MM/YYYY';
  return fmt.replace('DD', d).replace('MM', mo).replace('YYYY', y);
}

function today() { return new Date().toISOString().split('T')[0]; }

function getDaysBefore(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function fmtTime(ts) {
  const d = new Date(ts);
  return `${fmtDate(d.toISOString().split('T')[0])} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function getMonthYear(dateStr) {
  const [y, m] = dateStr.split('-');
  return `${m}/${y}`;
}

function fmtNum(n) {
  if (n === undefined || n === null) return '0';
  return n.toLocaleString('fr-FR');
}

function getStockPct(mat) {
  if (!mat.minStock || mat.minStock === 0) return 100;
  const full = mat.minStock * 5;
  return Math.min(100, Math.round((mat.stock / full) * 100));
}

function getStockStatus(mat) {
  const pct = (mat.stock / (mat.minStock || 1)) * 100;
  if (pct < 50) return 'critical';
  if (pct < 100) return 'warning';
  return 'ok';
}

// ─── SETUP ───
function showSetupModal() {
  populateCountries('setupCountry');
  populateCurrencies('setupCurrency');
  document.getElementById('setupModal').style.display = 'flex';
}

function saveSetup() {
  const company = document.getElementById('setupCompany').value.trim() || 'Mon Entreprise';
  const country = document.getElementById('setupCountry').value || 'TG';
  const lang = document.getElementById('setupLang').value || 'fr';
  const currency = document.getElementById('setupCurrency').value;
  const dateFmt = document.getElementById('setupDateFmt').value;
  const threshold = parseInt(document.getElementById('setupThreshold').value);
  const cur = currency ? CURRENCIES.find(c => c.code === currency) : null;
  const countryObj = COUNTRIES.find(c => c.code === country);

  APP.settings = {
    company, country, lang, dateFmt,
    currency: currency || (countryObj ? countryObj.currency : 'XOF'),
    currencySymbol: cur ? cur.symbol : (countryObj ? countryObj.symbol : 'CFA'),
    alertThreshold: threshold,
    setupDone: true
  };
  
  saveData().then(() => {
    // Mark first login as complete if this was first login
    if (APP.isFirstLogin && APP.currentUser) {
      markFirstLoginComplete(APP.currentUser.id);
    }
    document.getElementById('setupModal').style.display = 'none';
    launchApp();
  });
}

// ─── LAUNCH APP ───
function launchApp() {
  document.getElementById('loginScreen').style.display = 'none';
  const appEl = document.getElementById('app');
  appEl.classList.add('active');

  const u = APP.currentUser;
  document.getElementById('sidebarAvatar').textContent = u.initials;
  document.getElementById('sidebarName').textContent = u.name;
  document.getElementById('sidebarRole').textContent = u.role === 'DG' ? 'Directeur Général' : u.role === 'TECH' ? 'Responsable Technique' : 'Responsable de Stock';

  const isStock = u.role === 'STOCK';
  const isAdmin = u.role === 'DG';
  document.querySelectorAll('.stock-manager-only').forEach(el => el.style.display = isStock ? 'flex' : 'none');
  document.querySelectorAll('.admin-only').forEach(el => el.style.display = isAdmin ? 'flex' : 'none');

  document.getElementById('sidebarCompany').textContent = APP.settings.company;
  document.getElementById('sidebarCountry').textContent = APP.settings.country ? (COUNTRIES.find(c => c.code === APP.settings.country)?.name || '') : '';

  // Record this login
  recordUserLogin();

  // Show welcome message for first login
  if (APP.isFirstLogin) {
    showToast(`🎉 Bienvenue ${u.name}! Votre application est prête.`, 'success', 5000);
  }

  startClock();
  showView('dashboard');
  checkAlerts();
}

function startClock() {
  const el = document.getElementById('topbarTime');
  function tick() {
    const now = new Date();
    el.textContent = `${fmtDate(today())} · ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  }
  tick();
  setInterval(tick, 1000);
}

// ─── TOAST ───
function showToast(title, msg, type = 'info') {
  const colors = { success: 'var(--green)', warning: 'var(--amber)', error: 'var(--red)', info: 'var(--blue)' };
  const icons = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.setProperty('--toast-color', colors[type] || colors.info);
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
    <div class="toast-body"><div class="toast-title">${title}</div><div class="toast-msg">${msg}</div></div>
    <div class="toast-close" onclick="this.parentElement.remove()">✕</div>
  `;
  document.getElementById('toastContainer').appendChild(toast);
  setTimeout(() => toast.remove(), 4500);
}

// ─── POPULATE SELECTS ───
function populateCountries(selId) {
  const sel = document.getElementById(selId);
  if (!sel) return;
  sel.innerHTML = '<option value="">-- Sélectionner --</option>';
  COUNTRIES.sort((a, b) => a.name.localeCompare(b.name)).forEach(c => {
    sel.innerHTML += `<option value="${c.code}">${c.name}</option>`;
  });
}

function populateCurrencies(selId) {
  const sel = document.getElementById(selId);
  if (!sel) return;
  sel.innerHTML = '<option value="">-- Automatique --</option>';
  CURRENCIES.forEach(c => sel.innerHTML += `<option value="${c.code}">${c.code} — ${c.name} (${c.symbol})</option>`);
}

function onCountryChange() {
  const c = document.getElementById('setupCountry').value;
  const country = COUNTRIES.find(x => x.code === c);
  if (country) {
    const sel = document.getElementById('setupCurrency');
    for (let i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === country.currency) {
        sel.selectedIndex = i;
        break;
      }
    }
  }
}

// ─── ALERTS ───
function checkAlerts() {
  const lowMats = APP.materials.filter(m => getStockStatus(m) !== 'ok');
  const badge = document.getElementById('alertBadge');
  if (badge) {
    badge.textContent = lowMats.length;
    badge.style.display = lowMats.length ? 'inline' : 'none';
  }
}
// ─── FIRST LOGIN UTILITIES ───
/**
 * Get first login information for current user
 * @returns {Object} { isFirstLogin, firstLoginDate, daysSinceFirstLogin }
 */
function getFirstLoginInfo() {
  if (!APP.currentUser) return null;
  
  const userId = APP.currentUser.id;
  const firstLoginDateStr = localStorage.getItem(`stockpro:user_${userId}:first_login_date`);
  
  if (!firstLoginDateStr) {
    return {
      isFirstLogin: true,
      firstLoginDate: null,
      daysSinceFirstLogin: null,
      isNewUser: true
    };
  }

  const firstLoginDate = new Date(firstLoginDateStr);
  const today = new Date();
  const daysSinceFirstLogin = Math.floor((today - firstLoginDate) / (1000 * 60 * 60 * 24));

  return {
    isFirstLogin: APP.isFirstLogin,
    firstLoginDate,
    daysSinceFirstLogin,
    isNewUser: daysSinceFirstLogin === 0
  };
}

/**
 * Check if user is brand new (first login today)
 * @returns {boolean}
 */
function isNewUser() {
  const info = getFirstLoginInfo();
  return info && info.isNewUser;
}

/**
 * Get user's login history
 * @returns {Array} Array of login dates
 */
function getUserLoginDates() {
  if (!APP.currentUser) return [];
  
  const userId = APP.currentUser.id;
  const logins = localStorage.getItem(`stockpro:user_${userId}:login_dates`);
  return logins ? JSON.parse(logins) : [];
}

/**
 * Record a login (call after successful authentication)
 */
function recordUserLogin() {
  if (!APP.currentUser) return;
  
  const userId = APP.currentUser.id;
  const today = new Date().toISOString().split('T')[0];
  const logins = getUserLoginDates();
  
  // Add today if not already there
  if (!logins.includes(today)) {
    logins.push(today);
    localStorage.setItem(`stockpro:user_${userId}:login_dates`, JSON.stringify(logins));
  }
}