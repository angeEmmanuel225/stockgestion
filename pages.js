/* ════════════════════════════════════════════════════════ */
/*  STOCKPRO INDUSTRIAL v2.0 — PAGES NAVIGATION */
/* ════════════════════════════════════════════════════════ */

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const view = document.getElementById('view-' + id);
  if (view) view.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.getAttribute('onclick')?.includes(`'${id}'`)) n.classList.add('active');
  });

  const titles = {
    dashboard: '📊 Tableau de Bord',
    materials: '📦 Matières Premières',
    transactions: '🔄 Mouvements de Stock',
    reports: '📈 Rapports & Analyses',
    alerts: '🔔 Alertes & Monitoring',
    entry: '📥 Enregistrer Entrée',
    exit: '📤 Enregistrer Sortie',
    'add-material': '➕ Nouvelle Matière Première',
    settings: '⚙️ Paramètres',
    'mat-detail': '📦 Détail Matière'
  };
  
  const topbarTitle = document.getElementById('topbarTitle');
  if (topbarTitle) topbarTitle.textContent = titles[id] || id;
  
  const topbarActions = document.getElementById('topbarActions');
  if (topbarActions) topbarActions.innerHTML = '';

  // Load external page if exists
  const pageFile = `../pages/${id}.html`;
  const pageScript = `../pages/${id}.js`;

  // Try to load page - for single page app, rendering is done in JS
  switch (id) {
    case 'dashboard':
      if (window.renderDashboard) renderDashboard();
      break;
    case 'materials':
      if (window.renderMaterials) renderMaterials();
      break;
    case 'transactions':
      if (window.renderTransactions) renderTransactions();
      break;
    case 'reports':
      if (window.reportTab) reportTab(document.querySelector('.tab-btn'), 'day');
      break;
    case 'alerts':
      if (window.renderAlerts) renderAlerts();
      break;
    case 'entry':
      if (window.prepForm) prepForm('entry');
      break;
    case 'exit':
      if (window.prepForm) prepForm('exit');
      break;
    case 'add-material':
      // Load add material form
      break;
    case 'settings':
      if (window.renderSettings) renderSettings();
      break;
    case 'mat-detail':
      if (window.showMatDetail && APP.activeMat) showMatDetail(APP.activeMat.id);
      break;
  }
}

// Simple page loading for external pages
async function loadPage(pageId) {
  try {
    const response = await fetch(`../pages/${pageId}.html`);
    if (response.ok) {
      const html = await response.text();
      const view = document.getElementById(`view-${pageId}`);
      if (view) {
        view.innerHTML = html;
        // Load script if exists
        const scriptTag = document.createElement('script');
        scriptTag.src = `../pages/${pageId}.js`;
        document.body.appendChild(scriptTag);
      }
    }
  } catch (e) {
    console.warn(`Could not load page ${pageId}:`, e);
  }
}
