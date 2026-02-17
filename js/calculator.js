/**
 * calculator.js — Calculation engine + UI helpers.
 *
 * Exports (on window): calculate(), step(), fmt(), deb(), renderCurrencyTable()
 * Depends on: t() from i18n.js, CURRENCY_RATES from data/rates.js, $ helper
 */
'use strict';

/* ── DOM helper ──────────────────────────────────── */
const $ = id => document.getElementById(id);

/* ── Number formatting ───────────────────────────── */
function fmt(n, dec = 0) {
    return Number(n).toLocaleString('fr-DZ', {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec
    });
}

/* ── Step buttons — step by 10 (or 1 for % fields) ─ */
function step(id, dir) {
    const el = $(id);
    const s  = parseFloat(el.step) || 10;
    const v  = parseFloat(el.value) || 0;
    const min = parseFloat(el.min ?? '-Infinity');
    el.value = Math.max(min, v + dir * s);
    calculate();
}

/* ── Debounce ────────────────────────────────────── */
let _t;
function deb(fn, ms = 120) { clearTimeout(_t); _t = setTimeout(fn, ms); }

/* ── Currency rates table renderer ───────────────── */
function renderCurrencyTable() {
    const tbody = $('currencyTableBody');
    if (!tbody) return;
    tbody.innerHTML = CURRENCY_RATES.map(function(r) {
        return '<tr>' +
            '<td class="py-3 text-gray-300">' + r.flag + ' ' + r.code + ' <span class="text-xs text-gray-500">(' + r.name + ')</span></td>' +
            '<td class="py-3 text-right font-semibold text-white">' + fmt(r.official, 2) + '</td>' +
            '<td class="py-3 text-right font-semibold text-alg-gold">' + fmt(r.parallel, 2) + '</td>' +
            '</tr>';
    }).join('');
}

/* ── Main calculation ────────────────────────────── */
function calculate() {
    const carPrice     = Math.max(0, parseFloat($('itemPrice').value)    || 0);
    const shipping     = Math.max(0, parseFloat($('shippingCost').value) || 0);
    const offRate      = Math.max(1, parseFloat($('officialRate').value)  || 153);
    const parRate      = Math.max(1, parseFloat($('parallelRate').value)  || 280);
    const taxPct       = Math.max(0, parseFloat($('customsTax').value)    || 0);
    const portFees     = Math.max(0, parseFloat($('portFees').value)      || 0);
    const vat          = $('vatDeductible').checked;

    // STEP 1 — VAT deduction (if applicable)
    const adjCar       = vat ? carPrice * 0.81 : carPrice;
    const vatSaved     = vat ? carPrice * 0.19 : 0;

    // STEP 2 — Purchase costs at PARALLEL rate
    const carDZD       = adjCar   * parRate;
    const shipDZD      = shipping * parRate;

    // STEP 3 — Customs base = car price ONLY at OFFICIAL rate
    const customsBase  = adjCar * offRate;

    // STEP 4 — Customs tax
    const taxDZD       = customsBase * (taxPct / 100);

    // STEP 5 — Grand total
    const total        = carDZD + shipDZD + taxDZD + portFees;

    // millions centimes (1 centime = 1 000 000 DZD)
    const centimes     = total;

    /* ── update UI ──────────────────────────────── */

    // Big result
    $('totalDZD').textContent      = fmt(total) + ' DZD';
    $('totalMillions').textContent = fmt(centimes, 0) + ' centimes';
    $('totalEUR').textContent      = '\u20AC' + fmt(carPrice + shipping, 2);
    $('rateGap').textContent       = 'Parallel: ' + fmt(parRate) + ' | Official: ' + fmt(offRate);

    // Breakdown
    $('itemCostDZD').textContent     = fmt(carDZD);
    $('shippingCostDZD').textContent = fmt(shipDZD);
    $('customsTaxDZD').textContent   = fmt(taxDZD);
    $('portFeesDZD').textContent     = fmt(portFees);
    $('totalRow').textContent        = fmt(total);
    var customsPctEl = $('customsPct');
    if (customsPctEl) customsPctEl.textContent = taxPct;

    // Rate labels in table
    $('rateParallelLabel').textContent  = 'Parallel (' + fmt(parRate) + ')';
    $('rateParallelLabel2').textContent = 'Parallel (' + fmt(parRate) + ')';
    $('rateOfficialLabel').textContent  = 'Official (' + fmt(offRate) + ')';

    // VAT badge & savings
    $('vatBadge').classList.toggle('hidden', !vat);
    var savRow = $('vatSavingsRow');
    if (vat) {
        savRow.classList.remove('hidden');
        savRow.textContent =
            '\u2713 TVA savings: \u20AC' + fmt(vatSaved, 2) + ' saved (' + fmt(vatSaved * parRate) + ' DZD at parallel rate)';
    } else {
        savRow.classList.add('hidden');
    }

    // Pulse animation on result card
    var card = $('resultCard');
    card.classList.remove('result-pulse');
    void card.offsetWidth; // reflow
    card.classList.add('result-pulse');
}
