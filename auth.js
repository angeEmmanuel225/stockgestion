/* ════════════════════════════════════════════════════════ */
/*  STOCKPRO INDUSTRIAL v2.0 — AUTH MODULE */
/* ════════════════════════════════════════════════════════ */

// Check if this is user's first login
function isFirstLogin(userId) {
  try {
    const firstLoginKey = `stockpro:user_${userId}:first_login`;
    const hasVisited = localStorage.getItem(firstLoginKey);
    return !hasVisited; // true if never visited
  } catch (e) {
    return true; // Assume first login if error
  }
}

// Mark first login as complete
function markFirstLoginComplete(userId) {
  try {
    const firstLoginKey = `stockpro:user_${userId}:first_login`;
    localStorage.setItem(firstLoginKey, 'true');
    localStorage.setItem(`stockpro:user_${userId}:first_login_date`, new Date().toISOString());
  } catch (e) {
    console.warn('Could not mark first login:', e);
  }
}

function doLogin() {
  const uid = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  const user = USERS[uid];
  const err = document.getElementById('loginError');
  err.style.display = 'none';

  if (!user || user.password !== pass) {
    err.textContent = '❌ Identifiant ou mot de passe incorrect.';
    err.style.display = 'block';
    document.getElementById('loginPass').value = '';
    return;
  }

  APP.currentUser = { id: uid, ...user };
  APP.isFirstLogin = isFirstLogin(uid);
  
  loadData().then(() => {
    // If first login OR no setup done, show setup modal
    if (APP.isFirstLogin || !APP.settings.setupDone) {
      document.getElementById('loginScreen').style.display = 'none';
      showSetupModal();
    } else {
      launchApp();
    }
  });
}

function doLogout() {
  APP.currentUser = null;
  document.getElementById('app').classList.remove('active');
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  Object.values(APP.chartsInstances).forEach(c => {
    try { c.destroy(); } catch (e) { }
  });
  APP.chartsInstances = {};
}

// Expose auth functions globally
window.isFirstLogin = isFirstLogin;
window.markFirstLoginComplete = markFirstLoginComplete;
window.doLogin = doLogin;
window.doLogout = doLogout;

