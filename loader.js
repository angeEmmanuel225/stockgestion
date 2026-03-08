/* ════════════════════════════════════════════════════════ */
/*  STOCKPRO INDUSTRIAL v2.0 — LOADER & INITIALIZATION */
/* ════════════════════════════════════════════════════════ */

function showLoader() {
  document.getElementById('loaderOverlay')?.style && (document.getElementById('loaderOverlay').style.display = 'flex');
}

function hideLoader() {
  document.getElementById('loaderOverlay')?.style && (document.getElementById('loaderOverlay').style.display = 'none');
}

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  // Populate countries on startup
  populateCountries('setupCountry');
  populateCurrencies('setupCurrency');
  document.getElementById('setupCountry').value = 'TG';
  onCountryChange();


}
