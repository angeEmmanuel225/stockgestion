/* ════════════════════════════════════════════════════════ */
/*  STOCKPRO - API & UTILITIES (API only) */
/* ════════════════════════════════════════════════════════ */

// API Configuration - Uses relative path for backend
const API_BASE = './backend/php/api/';

/**
 * Unified API call
 * @param {string} endpoint - PHP file name (e.g., 'login.php')
 * @param {string} method - GET, POST, PUT, DELETE
 * @param {object} data - Data to send
 */
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include' // Pour les sessions
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    // Construire l'URL
    let url = API_BASE + endpoint;
    
    const response = await fetch(url, options);
    
    if (!response.ok && response.status !== 401) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error.message || 'Erreur de connectivité'
    };
  }
}

/**
 * Toast notifications - Uses app.js showToast function
 */
function showToast(message, type = 'info', duration = 3000) {
  if (typeof window.showToastApp === 'function') {
    return window.showToastApp(message, type, duration);
  }
  // Fallback to console if app not loaded
  console.log(`[${type}] ${message}`);
}

function showSuccess(message, duration = 2000) {
  return showToast('✅ ' + message, 'success', duration);
}

function showError(message, duration = 3000) {
  return showToast('❌ ' + message, 'error', duration);
}

function showInfo(message, duration = 2000) {
  return showToast('ℹ️ ' + message, 'info', duration);
}

/**
 * Loader - Uses app.js functions if available
 */
function showLoader() {
  if (window.showLoaderApp) {
    window.showLoaderApp();
    return;
  }
  const loader = document.getElementById('loaderOverlay');
  if (loader) loader.style.display = 'flex';
}

function hideLoader() {
  if (window.hideLoaderApp) {
    window.hideLoaderApp();
    return;
  }
  const loader = document.getElementById('loaderOverlay');
  if (loader) loader.style.display = 'none';
}

/**
 * Utility functions - Uses app.js functions if available
 */
function formatDate(dateStr, format = 'DD/MM/YYYY') {
  if (window.fmtDate) {
    return window.fmtDate(dateStr);
  }
  if (!dateStr) return '—';
  try {
    const [y, m, d] = dateStr.split('-');
    return format.replace('DD', d).replace('MM', m).replace('YYYY', y);
  } catch (e) {
    return dateStr;
  }
}

function formatNumber(num) {
  if (window.fmtNum) {
    return window.fmtNum(num);
  }
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat('fr-FR').format(num);
}

function today() {
  if (window.todayApp) {
    return window.todayApp();
  }
  return new Date().toISOString().split('T')[0];
}

/**
 * Modal helpers
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}

/**
 * DOM utilities
 */
function show(element) {
  if (typeof element === 'string') element = document.getElementById(element);
  if (element) element.style.display = '';
}

function hide(element) {
  if (typeof element === 'string') element = document.getElementById(element);
  if (element) element.style.display = 'none';
}

/**
 * Validation
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return password && password.length >= 6;
}

/**
 * Session management
 */
async function getSession() {
  const response = await apiCall('session.php', 'GET');
  return response;
}

async function logout() {
  const response = await apiCall('logout.php', 'POST');
  if (response && response.success) {
    window.location.href = './frontend/pages/login.html';
  }
  return response;
}

// ─── DATABASE FIELD MAPPING ───
// Helper to convert API responses from database names (snake_case) to JS names (camelCase)
function normalizeAPIResponse(data) {
  if (!data) return data;
  
  // If it's an object
  if (!Array.isArray(data)) {
    return normalizeSingleObject(data);
  }
  
  // If it's an array
  return data.map(item => normalizeSingleObject(item));
}

function normalizeSingleObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const normalized = { ...obj };
  
  // Map common database column names to JS property names
  const fieldMappings = {
    'current_stock': 'stock',
    'min_stock': 'minStock',
    'max_stock': 'maxStock',
    'unit_price': 'unitPrice',
    'safety_stock': 'safetyStock',
    'category_id': 'categoryId',
    'unit_id': 'unitId',
    'material_id': 'materialId',
    'material_code': 'materialCode',
    'reference_no': 'referenceNo',
    'alert_type': 'alertType',
    'is_read': 'isRead',
    'is_active': 'isActive',
    'created_by': 'createdBy',
    'deleted_at': 'deletedAt',
    'created_at': 'createdAt',
    'updated_at': 'updatedAt',
    'last_login': 'lastLogin',
    'user_id': 'userId',
    'category_name': 'categoryName'
  };
  
  // Apply mappings
  Object.entries(fieldMappings).forEach(([dbField, jsField]) => {
    if (normalized[dbField] !== undefined) {
      normalized[jsField] = normalized[dbField];
      // Keep original DB field too for reference
    }
  });
  
  return normalized;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('StockPro v2.0 - API script loaded');
});
