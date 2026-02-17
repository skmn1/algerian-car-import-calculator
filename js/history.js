/**
 * history.js — Calculation history management.
 *
 * Depends on: $() and fmt() from calculator.js,
 *             t() and currentLang from i18n.js,
 *             updatePageTranslations() from i18n.js
 */
'use strict';

let calculationHistory = [];

const STORAGE_KEY = 'calculationHistory';
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

// Expose for testing (const/let not on window in strict mode)
window._getHistory   = function() { return calculationHistory; };
window._setHistory   = function(h) { calculationHistory = h; };
window._STORAGE_KEY  = STORAGE_KEY;
window._TWENTY_FOUR_HOURS = TWENTY_FOUR_HOURS;

function openSaveDialog() {
    $('saveModal').classList.remove('hidden');
    $('carNameInput').focus();
    $('carNameInput').value = '';
}

function closeSaveDialog() {
    $('saveModal').classList.add('hidden');
}

function saveCalculation() {
    var carName = $('carNameInput').value.trim();
    if (!carName) {
        alert('Please enter a car name/model');
        return;
    }

    var carPrice = parseFloat($('itemPrice').value) || 0;
    var shipping = parseFloat($('shippingCost').value) || 0;
    var offRate  = parseFloat($('officialRate').value) || 153;
    var parRate  = parseFloat($('parallelRate').value) || 280;
    var taxPct   = parseFloat($('customsTax').value) || 0;
    var portFees = parseFloat($('portFees').value) || 0;
    var vat      = $('vatDeductible').checked;

    // Recalculate for storage
    var adjCar      = vat ? carPrice * 0.81 : carPrice;
    var carDZD      = adjCar * parRate;
    var shipDZD     = shipping * parRate;
    var customsBase = adjCar * offRate;
    var taxDZD      = customsBase * (taxPct / 100);
    var totalDZD    = carDZD + shipDZD + taxDZD + portFees;

    var now = Date.now();
    var entry = {
        id: now,
        carName: carName,
        savedAt: now,
        timestamp: new Date().toLocaleString(currentLang === 'ar' ? 'ar-DZ' : currentLang === 'es' ? 'es-DZ' : currentLang === 'fr' ? 'fr-DZ' : 'en-DZ'),
        totalDZD: totalDZD,
        centimes: totalDZD,
        totalEUR: carPrice + shipping,
        inputs: {
            carPrice: carPrice, shipping: shipping, offRate: offRate, parRate: parRate,
            taxPct: taxPct, portFees: portFees, vat: vat
        },
        breakdown: {
            carDZD: carDZD, shipDZD: shipDZD, taxDZD: taxDZD, portFees: portFees,
            customsBase: customsBase, adjCar: adjCar
        }
    };

    calculationHistory.unshift(entry);

    // Keep only 5 entries and remove entries older than 24 hours
    calculationHistory = calculationHistory
        .filter(function(e) { return (now - e.savedAt) < TWENTY_FOUR_HOURS; })
        .slice(0, 5);

    // Store to localStorage with error handling
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(calculationHistory));
    } catch (e) {
        alert('Could not save history. Please check your browser storage settings.');
        return;
    }

    closeSaveDialog();
    renderHistory();

    // Show brief success feedback on the main Save Calculation button
    var mainSaveBtn = document.querySelector('[data-i18n="saveCalculation"]');
    if (mainSaveBtn) {
        var parent = mainSaveBtn.closest('button');
        if (parent) {
            parent.style.background = '#006233';
            parent.style.color = '#fff';
            var origHTML = parent.innerHTML;
            parent.innerHTML = '\u2705 ' + t('saveBtn') + '!';
            setTimeout(function() {
                parent.innerHTML = origHTML;
                parent.style.background = '';
                parent.style.color = '';
            }, 1500);
        }
    }
}

function deleteEntry(id) {
    calculationHistory = calculationHistory.filter(function(entry) { return entry.id !== id; });
    try {
        if (calculationHistory.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(calculationHistory));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    } catch (e) { /* ignore */ }
    renderHistory();
}

function renderHistory() {
    var historyPanel = $('historyPanel');
    var historyList  = $('historyList');
    var historyCount = $('historyCount');

    if (calculationHistory.length === 0) {
        historyPanel.classList.add('hidden');
        return;
    }

    historyPanel.classList.remove('hidden');
    historyCount.textContent = calculationHistory.length;
    historyList.innerHTML = '';

    calculationHistory.forEach(function(entry) {
        var card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML =
            '<div class="history-card-header">' +
                '<div onclick="toggleDetails(' + entry.id + ')">' +
                    '<div class="history-card-title">' + escapeHtml(entry.carName) + '</div>' +
                    '<div class="history-card-date">' + entry.timestamp + '</div>' +
                '</div>' +
                '<button class="delete-btn" onclick="deleteEntry(' + entry.id + '); event.stopPropagation();" data-i18n="delete">Delete</button>' +
            '</div>' +
            '<div class="history-card-result">' +
                '<div class="result-item">' +
                    '<div class="result-label" data-i18n="amount">Amount (DZD)</div>' +
                    '<div class="result-value">' + fmt(entry.totalDZD) + '</div>' +
                '</div>' +
                '<div class="result-item">' +
                    '<div class="result-label" data-i18n="centimes">Centimes</div>' +
                    '<div class="result-value gold">' + fmt(entry.centimes, 0) + '</div>' +
                '</div>' +
                '<div class="result-item">' +
                    '<div class="result-label" data-i18n="totalEUR">Total EUR</div>' +
                    '<div class="result-value">\u20AC' + fmt(entry.totalEUR, 2) + '</div>' +
                '</div>' +
            '</div>' +
            '<button class="collapsible-toggle" id="toggle-' + entry.id + '" onclick="toggleDetails(' + entry.id + ')" data-i18n="details">Details</button>' +
            '<div class="collapsible-content" id="content-' + entry.id + '">' +
                '<div class="detail-row"><span class="detail-label" data-i18n="carPrice">Car Price (EUR)</span><span class="detail-value">\u20AC' + fmt(entry.inputs.carPrice, 2) + '</span></div>' +
                '<div class="detail-row"><span class="detail-label" data-i18n="shippingCost">Shipping Cost (EUR)</span><span class="detail-value">\u20AC' + fmt(entry.inputs.shipping, 2) + '</span></div>' +
                '<div class="detail-row"><span class="detail-label" data-i18n="officialRate">Official Rate</span><span class="detail-value">' + fmt(entry.inputs.offRate) + '</span></div>' +
                '<div class="detail-row"><span class="detail-label" data-i18n="parallelRate">Parallel Rate</span><span class="detail-value">' + fmt(entry.inputs.parRate) + '</span></div>' +
                '<div class="detail-row"><span class="detail-label" data-i18n="customsTax">Customs Tax</span><span class="detail-value">' + entry.inputs.taxPct + '%</span></div>' +
                '<div class="detail-row"><span class="detail-label" data-i18n="portFees">Port Fees</span><span class="detail-value">' + fmt(entry.inputs.portFees) + '</span></div>' +
                (entry.inputs.vat ? '<div class="detail-row"><span class="detail-label" data-i18n="tvaDeduce">TVA Deductible</span><span class="detail-value" style="color: #10b981;">\u2713 Yes (19%)</span></div>' : '') +
            '</div>';
        historyList.appendChild(card);
    });

    // Re-apply translations to new elements
    updatePageTranslations();
}

function toggleDetails(id) {
    var content = $('content-' + id);
    var toggle  = $('toggle-' + id);
    content.classList.toggle('show');
    toggle.classList.toggle('active');
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function loadHistoryFromStorage() {
    try {
        var stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {
            calculationHistory = JSON.parse(stored);

            // Auto-clean entries older than 24 hours
            var now = Date.now();
            calculationHistory = calculationHistory.filter(function(entry) {
                return (now - entry.savedAt) < TWENTY_FOUR_HOURS;
            });

            // Save cleaned history back
            if (calculationHistory.length > 0) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(calculationHistory));
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }

            renderHistory();
        }
    } catch (e) {
        calculationHistory = [];
    }
}

// Debug function — call from browser console: checkHistory()
function checkHistory() {
    console.clear();
    console.log('%c\uD83D\uDCCA HISTORY DEBUG INFO', 'font-size: 16px;font-weight:bold;color:#006233');
    console.log('Entries:', calculationHistory.length);
    if (calculationHistory.length > 0) {
        console.table(calculationHistory.map(function(e) {
            return { Car: e.carName, Total: fmt(e.totalDZD), Saved: new Date(e.savedAt).toLocaleTimeString() };
        }));
    }
}

// Clear history function — call from console: clearHistory()
function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
    calculationHistory = [];
    renderHistory();
}
