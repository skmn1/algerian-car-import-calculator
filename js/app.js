/**
 * app.js — Application initialisation and event wiring.
 *
 * Loaded last. Depends on every other module being available:
 *   data/rates.js  →  CURRENCY_RATES
 *   js/i18n.js     →  setLanguage(), currentLang, translations
 *   js/calculator.js → $, calculate(), step(), deb(), fmt(), renderCurrencyTable()
 *   js/history.js  →  loadHistoryFromStorage(), openSaveDialog(), closeSaveDialog(),
 *                      saveCalculation(), deleteEntry(), clearHistory()
 */
'use strict';

/* ── Go-to-top button logic ──────────────────────── */
function initGoToTop() {
    var btn    = $('goToTop');
    var header = document.querySelector('header');
    if (!btn || !header) return;
    if (typeof IntersectionObserver === 'undefined') return; // JSDOM / old browsers

    var observer = new IntersectionObserver(function(entries) {
        btn.classList.toggle('visible', !entries[0].isIntersecting);
    }, { threshold: 0 });
    observer.observe(header);
}

/* ── Smart scroll: aggressive up = jump to top ───── */
function initSmartScroll() {
    var upAccumulator = 0;
    var THRESHOLD = 600; // px of accumulated upward wheel delta to trigger jump

    window.addEventListener('wheel', function(e) {
        if (e.deltaY < 0) {
            upAccumulator += Math.abs(e.deltaY);
            if (upAccumulator > THRESHOLD) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                upAccumulator = 0;
            }
        } else {
            upAccumulator = 0;
        }
    }, { passive: true });

    // Touch: aggressive swipe up
    var touchStartY = 0;
    window.addEventListener('touchstart', function(e) {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchend', function(e) {
        var delta = e.changedTouches[0].clientY - touchStartY;
        if (delta > 200) { // big downward finger move = scroll up intent
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, { passive: true });
}

/* ── Bootstrap ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
    // Set initial language (default: French)
    var langToLoad = localStorage.getItem('lang') || 'fr';
    setLanguage(langToLoad);

    // Highlight active language button
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.lang === langToLoad);
    });

    // Run initial calculation
    calculate();

    // Render currency table
    renderCurrencyTable();

    // Load calculation history
    loadHistoryFromStorage();

    // Initialise scroll helpers
    initGoToTop();
    initSmartScroll();

    // ── Input listeners ─────────────────────────
    ['itemPrice','shippingCost','officialRate','parallelRate','customsTax','portFees']
        .forEach(function(id) { $(id).addEventListener('input', function() { deb(calculate); }); });

    $('vatDeductible').addEventListener('change', calculate);

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeSaveDialog();
    });

    // Enter key to save in car name input
    $('carNameInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveCalculation();
        }
    });

    // Close modal when clicking outside
    $('saveModal').addEventListener('click', function(e) {
        if (e.target === $('saveModal')) closeSaveDialog();
    });
});
