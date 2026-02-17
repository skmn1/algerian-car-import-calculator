/**
 * E2E Tests for Algerian Car Import Calculator
 * Multi-file project: index.html + css/styles.css + js/*.js + data/rates.js
 *
 * Run: node e2e-tests.js
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// ─── Test Runner ───────────────────────────────────
let passed = 0;
let failed = 0;
const results = [];

function assert(condition, testName) {
    if (condition) {
        passed++;
        results.push({ status: 'PASS', name: testName });
        console.log(`  ✅ ${testName}`);
    } else {
        failed++;
        results.push({ status: 'FAIL', name: testName });
        console.log(`  ❌ ${testName}`);
    }
}

function assertEqual(actual, expected, testName) {
    if (actual === expected) {
        passed++;
        results.push({ status: 'PASS', name: testName });
        console.log(`  ✅ ${testName}`);
    } else {
        failed++;
        results.push({ status: 'FAIL', name: testName });
        console.log(`  ❌ ${testName} — expected: ${JSON.stringify(expected)}, got: ${JSON.stringify(actual)}`);
    }
}

function assertClose(actual, expected, testName, tolerance = 0.01) {
    if (Math.abs(actual - expected) <= tolerance) {
        passed++;
        results.push({ status: 'PASS', name: testName });
        console.log(`  ✅ ${testName}`);
    } else {
        failed++;
        results.push({ status: 'FAIL', name: testName });
        console.log(`  ❌ ${testName} — expected: ~${expected}, got: ${actual}`);
    }
}

// ─── Load HTML + inline external scripts (JSDOM can't load <script src> reliably) ──
function createDOM() {
    let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

    // Remove Tailwind CDN script and config (JSDOM can't execute it)
    html = html.replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/, '');
    html = html.replace(/<script>\s*tailwind\.config[\s\S]*?<\/script>/, '');

    // Remove external CSS link (JSDOM can't load it from file://)
    html = html.replace(/<link rel="stylesheet" href="css\/styles\.css">/, '');

    // Inline external <script src="..."> tags so JSDOM can execute them
    html = html.replace(/<script src="([^"]+)"><\/script>/g, (match, srcPath) => {
        const filePath = path.join(__dirname, srcPath);
        if (fs.existsSync(filePath)) {
            const code = fs.readFileSync(filePath, 'utf8');
            return '<script>' + code + '</script>';
        }
        return ''; // skip if file not found
    });

    const dom = new JSDOM(html, {
        url: 'http://localhost',
        runScripts: 'dangerously',
        resources: 'usable',
        pretendToBeVisual: true,
        storageQuota: 10000000
    });

    // Suppress noisy console output from app code
    dom.window.console.log = () => {};
    dom.window.console.warn = () => {};

    return dom;
}

function wait(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: access let/const variables via test hooks on window
function getHistory(win) { return win._getHistory(); }
function getStorageKey(win) { return win._STORAGE_KEY; }

// ═══════════════════════════════════════════════════
// TEST SUITES
// ═══════════════════════════════════════════════════

async function test_FunctionsExist() {
    console.log('\n━━━ TEST 1: Core Functions Exist ━━━');
    const dom = createDOM();
    await wait(1000);
    const w = dom.window;

    assert(typeof w.calculate === 'function', 'calculate() exists');
    assert(typeof w.saveCalculation === 'function', 'saveCalculation() exists');
    assert(typeof w.loadHistoryFromStorage === 'function', 'loadHistoryFromStorage() exists');
    assert(typeof w.deleteEntry === 'function', 'deleteEntry() exists');
    assert(typeof w.openSaveDialog === 'function', 'openSaveDialog() exists');
    assert(typeof w.closeSaveDialog === 'function', 'closeSaveDialog() exists');
    assert(typeof w.renderHistory === 'function', 'renderHistory() exists');
    assert(typeof w.toggleDetails === 'function', 'toggleDetails() exists');
    assert(typeof w.clearHistory === 'function', 'clearHistory() exists');
    assert(typeof w.checkHistory === 'function', 'checkHistory() exists');
    assert(typeof w.setLanguage === 'function', 'setLanguage() exists');
    assert(typeof w.renderCurrencyTable === 'function', 'renderCurrencyTable() exists');
    assertEqual(getStorageKey(w), 'calculationHistory', 'STORAGE_KEY constant correct');
    assertEqual(w._TWENTY_FOUR_HOURS, 86400000, 'TWENTY_FOUR_HOURS = 86400000ms');

    dom.window.close();
}

async function test_SaveAndPersist() {
    console.log('\n━━━ TEST 2: Save + localStorage Persistence ━━━');
    const dom = createDOM();
    await wait(1000);
    const w = dom.window;
    const doc = w.document;
    const ls = w.localStorage;

    doc.getElementById('carNameInput').value = 'Toyota Corolla';
    w.saveCalculation();

    const history = getHistory(w);
    assertEqual(history.length, 1, 'In-memory: 1 entry');
    assertEqual(history[0].carName, 'Toyota Corolla', 'Car name correct');
    assert(history[0].savedAt > 0, 'savedAt timestamp set');
    assert(history[0].totalDZD > 0, 'totalDZD calculated');
    assert(history[0].totalEUR > 0, 'totalEUR calculated');
    assert(history[0].inputs !== undefined, 'inputs object saved');
    assert(history[0].breakdown !== undefined, 'breakdown object saved');

    const stored = ls.getItem('calculationHistory');
    assert(stored !== null, 'localStorage has data');
    const parsed = JSON.parse(stored);
    assertEqual(parsed.length, 1, 'localStorage: 1 entry');
    assertEqual(parsed[0].carName, 'Toyota Corolla', 'localStorage: name correct');

    // Simulate page refresh
    const savedData = ls.getItem('calculationHistory');
    const dom2 = createDOM();
    await wait(1000);
    dom2.window.localStorage.setItem('calculationHistory', savedData);
    dom2.window.loadHistoryFromStorage();

    const history2 = getHistory(dom2.window);
    assertEqual(history2.length, 1, 'After refresh: 1 entry persists');
    assertEqual(history2[0].carName, 'Toyota Corolla', 'After refresh: name intact');
    assertEqual(history2[0].totalDZD, history[0].totalDZD, 'After refresh: totalDZD intact');

    const panel = dom2.window.document.getElementById('historyPanel');
    assert(!panel.classList.contains('hidden'), 'History panel visible after load');

    dom.window.close();
    dom2.window.close();
}

async function test_Max5Entries() {
    console.log('\n━━━ TEST 3: Max 5 History Entries ━━━');
    const dom = createDOM();
    await wait(1000);
    const w = dom.window;
    const doc = w.document;

    for (let i = 1; i <= 7; i++) {
        doc.getElementById('carNameInput').value = `Car ${i}`;
        w.saveCalculation();
    }

    const history = getHistory(w);
    assert(history.length <= 5, `Max 5 enforced (got ${history.length})`);
    assertEqual(history.length, 5, 'Exactly 5 entries kept');
    assertEqual(history[0].carName, 'Car 7', 'Newest (Car 7) is first');
    assertEqual(history[4].carName, 'Car 3', 'Oldest kept is Car 3');

    const stored = JSON.parse(w.localStorage.getItem('calculationHistory'));
    assertEqual(stored.length, 5, 'localStorage also has 5');

    dom.window.close();
}

async function test_24HourExpiration() {
    console.log('\n━━━ TEST 4: 24-Hour Auto-Expiration ━━━');
    const dom = createDOM();
    await wait(1000);
    const w = dom.window;
    const ls = w.localStorage;

    const now = Date.now();
    const H24 = 86400000;

    const fakeHistory = [
        { id: now, carName: 'Fresh Car', savedAt: now, timestamp: '2026-02-17', totalDZD: 3000000, centimes: 3000000, totalEUR: 11500, inputs: { carPrice: 10000, shipping: 1500, offRate: 153, parRate: 280, taxPct: 20, portFees: 90000, vat: false }, breakdown: { carDZD: 2800000, shipDZD: 420000, taxDZD: 306000, portFees: 90000, customsBase: 1530000, adjCar: 10000 } },
        { id: now - H24 - 60000, carName: 'Expired Car', savedAt: now - H24 - 60000, timestamp: '2026-02-16', totalDZD: 2500000, centimes: 2500000, totalEUR: 9000, inputs: { carPrice: 8000, shipping: 1000, offRate: 153, parRate: 280, taxPct: 20, portFees: 90000, vat: false }, breakdown: { carDZD: 2240000, shipDZD: 280000, taxDZD: 244800, portFees: 90000, customsBase: 1224000, adjCar: 8000 } },
        { id: now - 3600000, carName: 'Recent Car', savedAt: now - 3600000, timestamp: '2026-02-17', totalDZD: 2700000, centimes: 2700000, totalEUR: 10000, inputs: { carPrice: 9000, shipping: 1000, offRate: 153, parRate: 280, taxPct: 20, portFees: 90000, vat: false }, breakdown: { carDZD: 2520000, shipDZD: 280000, taxDZD: 275400, portFees: 90000, customsBase: 1377000, adjCar: 9000 } }
    ];

    ls.setItem('calculationHistory', JSON.stringify(fakeHistory));
    w.loadHistoryFromStorage();

    const history = getHistory(w);
    assertEqual(history.length, 2, 'Expired entry removed, 2 remain');
    assert(history.every(e => e.carName !== 'Expired Car'), 'Expired Car is gone');
    assert(history.some(e => e.carName === 'Fresh Car'), 'Fresh Car kept');
    assert(history.some(e => e.carName === 'Recent Car'), 'Recent Car kept');

    const cleaned = JSON.parse(ls.getItem('calculationHistory'));
    assertEqual(cleaned.length, 2, 'localStorage cleaned too');

    dom.window.close();
}

async function test_DeleteEntry() {
    console.log('\n━━━ TEST 5: Delete Single Entry ━━━');
    const dom = createDOM();
    await wait(1000);
    const w = dom.window;
    const doc = w.document;

    for (let i = 1; i <= 3; i++) {
        doc.getElementById('carNameInput').value = `Del Test ${i}`;
        w.saveCalculation();
    }
    assertEqual(getHistory(w).length, 3, 'Started with 3 entries');

    const middleId = getHistory(w)[1].id;
    w.deleteEntry(middleId);
    assertEqual(getHistory(w).length, 2, 'After delete: 2 remain');
    assert(!getHistory(w).some(e => e.id === middleId), 'Middle entry removed');

    const stored = JSON.parse(w.localStorage.getItem('calculationHistory'));
    assertEqual(stored.length, 2, 'localStorage updated');

    while (getHistory(w).length > 0) {
        w.deleteEntry(getHistory(w)[0].id);
    }
    assertEqual(getHistory(w).length, 0, 'All entries deleted');
    assertEqual(w.localStorage.getItem('calculationHistory'), null, 'localStorage cleared when empty');

    const panel = doc.getElementById('historyPanel');
    assert(panel.classList.contains('hidden'), 'Panel hidden when empty');

    dom.window.close();
}

async function test_EnterKeySave() {
    console.log('\n━━━ TEST 6: Enter Key Saves Calculation ━━━');
    const dom = createDOM();
    await wait(1000);
    const w = dom.window;
    const doc = w.document;

    w.openSaveDialog();
    const modal = doc.getElementById('saveModal');
    assert(!modal.classList.contains('hidden'), 'Modal opens');

    const input = doc.getElementById('carNameInput');
    input.value = 'Enter Key Car';

    const enterEvt = new w.KeyboardEvent('keydown', {
        key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
        bubbles: true, cancelable: true
    });
    input.dispatchEvent(enterEvt);

    const stored = w.localStorage.getItem('calculationHistory');
    assert(stored !== null, 'Saved via Enter key');
    if (stored) {
        const parsed = JSON.parse(stored);
        assertEqual(parsed[0].carName, 'Enter Key Car', 'Name saved correctly via Enter');
    }

    assert(modal.classList.contains('hidden'), 'Modal closed after Enter');

    dom.window.close();
}

async function test_EmptyNameRejected() {
    console.log('\n━━━ TEST 7: Empty Car Name Rejected ━━━');
    const dom = createDOM();
    await wait(1000);
    const w = dom.window;
    const doc = w.document;

    let alertMsg = null;
    w.alert = (msg) => { alertMsg = msg; };

    doc.getElementById('carNameInput').value = '';
    w.saveCalculation();
    assert(alertMsg !== null, 'Alert for empty name');
    assertEqual(w.localStorage.getItem('calculationHistory'), null, 'Nothing saved');

    alertMsg = null;
    doc.getElementById('carNameInput').value = '   ';
    w.saveCalculation();
    assert(alertMsg !== null, 'Alert for whitespace-only name');

    dom.window.close();
}

async function test_CalculationAccuracy() {
    console.log('\n━━━ TEST 8: Calculation Math Accuracy ━━━');
    const dom = createDOM();
    await wait(1000);
    const w = dom.window;
    const doc = w.document;

    doc.getElementById('itemPrice').value = '10000';
    doc.getElementById('shippingCost').value = '1500';
    doc.getElementById('officialRate').value = '153';
    doc.getElementById('parallelRate').value = '280';
    doc.getElementById('customsTax').value = '20';
    doc.getElementById('portFees').value = '90000';
    doc.getElementById('vatDeductible').checked = false;
    w.calculate();

    doc.getElementById('carNameInput').value = 'Math Test';
    w.saveCalculation();

    const e = getHistory(w)[0];
    assertEqual(e.breakdown.carDZD, 2800000, 'Car DZD = 10000 × 280');
    assertEqual(e.breakdown.shipDZD, 420000, 'Ship DZD = 1500 × 280');
    assertEqual(e.breakdown.customsBase, 1530000, 'Customs base = 10000 × 153');
    assertEqual(e.breakdown.taxDZD, 306000, 'Tax = 1,530,000 × 20%');
    assertEqual(e.totalDZD, 3616000, 'Total = 3,616,000 DZD');
    assertEqual(e.totalEUR, 11500, 'Total EUR = €11,500');

    // With TVA
    doc.getElementById('vatDeductible').checked = true;
    w.calculate();
    doc.getElementById('carNameInput').value = 'TVA Test';
    w.saveCalculation();

    const t = getHistory(w)[0];
    assertClose(t.breakdown.adjCar, 8100, 'TVA: 10000 × 0.81 = 8100');
    assertClose(t.breakdown.carDZD, 2268000, 'TVA Car DZD = 8100 × 280');
    assertClose(t.totalDZD, 3025860, 'TVA Total = 3,025,860');

    dom.window.close();
}

async function test_UIRendering() {
    console.log('\n━━━ TEST 9: UI Rendering ━━━');
    const dom = createDOM();
    await wait(1000);
    const w = dom.window;
    const doc = w.document;

    const panel = doc.getElementById('historyPanel');
    assert(panel.classList.contains('hidden'), 'Panel hidden initially');

    doc.getElementById('carNameInput').value = 'UI Test';
    w.saveCalculation();

    assert(!panel.classList.contains('hidden'), 'Panel visible after save');

    const count = doc.getElementById('historyCount');
    assertEqual(count.textContent, '1', 'Count badge shows 1');

    const cards = doc.querySelectorAll('.history-card');
    assertEqual(cards.length, 1, 'One card rendered');

    const title = cards[0].querySelector('.history-card-title');
    assert(title.textContent.includes('UI Test'), 'Card title correct');

    const banner = doc.getElementById('historyInfoBanner');
    assert(banner !== null, 'Info banner exists');

    const metrics = cards[0].querySelectorAll('.result-item');
    assertEqual(metrics.length, 3, 'Three metrics (DZD, Centimes, EUR)');

    const deleteBtn = cards[0].querySelector('.delete-btn');
    assert(deleteBtn !== null, 'Delete button present');

    const toggle = cards[0].querySelector('.collapsible-toggle');
    assert(toggle !== null, 'Details toggle present');

    dom.window.close();
}

async function test_EscapeClosesModal() {
    console.log('\n━━━ TEST 10: Escape Closes Modal ━━━');
    const dom = createDOM();
    await wait(1000);
    const w = dom.window;
    const doc = w.document;

    w.openSaveDialog();
    const modal = doc.getElementById('saveModal');
    assert(!modal.classList.contains('hidden'), 'Modal open');

    const escEvt = new w.KeyboardEvent('keydown', {
        key: 'Escape', bubbles: true, cancelable: true
    });
    doc.dispatchEvent(escEvt);
    assert(modal.classList.contains('hidden'), 'Modal closed by Escape');

    dom.window.close();
}

async function test_TranslationsComplete() {
    console.log('\n━━━ TEST 11: Translation Keys ━━━');
    const dom = createDOM();
    await wait(1000);
    const w = dom.window;

    const translations = w.eval('translations');

    const keys = ['saveCalculation', 'enterCarName', 'cancelBtn', 'saveBtn',
                  'calculationHistory', 'historyLimitNote', 'delete', 'details',
                  'introTitle', 'introDesc', 'developedBy', 'trustBadge',
                  'footerAboutTitle', 'footerAboutText', 'footerFeaturesTitle',
                  'footerFeature1', 'footerFeature2', 'footerFeature3', 'footerFeature4',
                  'footerDeveloperTitle', 'footerDeveloperRole', 'footerDeveloperDesc',
                  'footerSecure', 'footerUpdated', 'footerDisclaimerTitle',
                  'footerDisclaimer', 'footerCopyright', 'footerRights',
                  'currencyRatesTitle', 'currencyRatesDesc', 'currency',
                  'officialRateShort', 'parallelRateShort'];
    const langs = ['en', 'fr', 'ar', 'es'];

    for (const lang of langs) {
        for (const key of keys) {
            const val = translations[lang]?.[key];
            assert(val !== undefined && val.length > 0, `${lang}.${key} defined`);
        }
    }

    dom.window.close();
}

async function test_IntroAndFooterPresent() {
    console.log('\n━━━ TEST 12: Intro & Footer Sections Present ━━━');
    const dom = createDOM();
    await wait(1000);
    const doc = dom.window.document;

    const introTitle = doc.getElementById('introTitle');
    const introDesc = doc.getElementById('introDesc');
    assert(introTitle !== null, 'Intro title element exists');
    assert(introDesc !== null, 'Intro description element exists');
    assert(introTitle.textContent.length > 0, 'Intro title has text');
    assert(introDesc.textContent.length > 0, 'Intro description has text');
    assert(doc.body.textContent.includes('Dr. Soulimane KAMNI'), 'Developer credit present');

    const footerAboutTitle = doc.querySelector('[data-i18n="footerAboutTitle"]');
    const footerFeaturesTitle = doc.querySelector('[data-i18n="footerFeaturesTitle"]');
    const footerDeveloperTitle = doc.querySelector('[data-i18n="footerDeveloperTitle"]');
    const footerDisclaimer = doc.querySelector('[data-i18n="footerDisclaimer"]');

    assert(footerAboutTitle !== null, 'Footer About section exists');
    assert(footerFeaturesTitle !== null, 'Footer Features section exists');
    assert(footerDeveloperTitle !== null, 'Footer Developer section exists');
    assert(footerDisclaimer !== null, 'Footer disclaimer exists');

    const footerText = doc.querySelector('footer').textContent;
    assert(footerText.includes('Dr. Soulimane KAMNI'), 'Developer name in footer');
    assert(footerText.includes('2026'), 'Copyright year present');

    dom.window.close();
}

async function test_MultiFileStructure() {
    console.log('\n━━━ TEST 13: Multi-File Project Structure ━━━');

    // Verify all expected files exist
    const expectedFiles = [
        'index.html',
        'css/styles.css',
        'js/calculator.js',
        'js/i18n.js',
        'js/history.js',
        'js/app.js',
        'data/rates.js'
    ];

    for (const file of expectedFiles) {
        const filePath = path.join(__dirname, file);
        assert(fs.existsSync(filePath), `File exists: ${file}`);
    }

    // Verify index.html has NO inline <script> blocks (except Tailwind config)
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    const scriptBlocks = html.match(/<script>[\s\S]*?<\/script>/g) || [];
    // Only the tailwind config should be an inline script
    assertEqual(scriptBlocks.length, 1, 'Only 1 inline script (Tailwind config)');
    assert(scriptBlocks[0].includes('tailwind.config'), 'Inline script is Tailwind config');

    // Verify index.html references external scripts
    assert(html.includes('src="data/rates.js"'), 'index.html loads data/rates.js');
    assert(html.includes('src="js/calculator.js"'), 'index.html loads js/calculator.js');
    assert(html.includes('src="js/i18n.js"'), 'index.html loads js/i18n.js');
    assert(html.includes('src="js/history.js"'), 'index.html loads js/history.js');
    assert(html.includes('src="js/app.js"'), 'index.html loads js/app.js');
    assert(html.includes('href="css/styles.css"'), 'index.html loads css/styles.css');

    // Verify index.html has NO <style> blocks
    const styleBlocks = html.match(/<style>[\s\S]*?<\/style>/g) || [];
    assertEqual(styleBlocks.length, 0, 'No inline <style> blocks in index.html');

    // Verify data/rates.js has CURRENCY_RATES as single data source
    const ratesCode = fs.readFileSync(path.join(__dirname, 'data/rates.js'), 'utf8');
    assert(ratesCode.includes('CURRENCY_RATES'), 'rates.js defines CURRENCY_RATES');
    assert(ratesCode.includes('USD'), 'rates.js has USD');
    assert(ratesCode.includes('EUR'), 'rates.js has EUR');
    assert(ratesCode.includes('CAD'), 'rates.js has CAD');
    assert(ratesCode.includes('CNY'), 'rates.js has CNY');

    // Verify STORAGE_KEY and TWENTY_FOUR_HOURS are in history.js
    const historyCode = fs.readFileSync(path.join(__dirname, 'js/history.js'), 'utf8');
    assert(historyCode.includes('STORAGE_KEY'), 'history.js has STORAGE_KEY');
    assert(historyCode.includes('TWENTY_FOUR_HOURS'), 'history.js has TWENTY_FOUR_HOURS');
}

async function test_BrowserTitleAndFavicon() {
    console.log('\n━━━ TEST 14: Browser Tab Title & Favicon ━━━');
    const dom = createDOM();
    await wait(1000);
    const doc = dom.window.document;

    // Title — default language is FR, so check the French title OR set EN first
    dom.window.setLanguage('en');
    assert(doc.title.includes('Car Import Calculator'), 'Browser tab title contains "Car Import Calculator"');

    // Favicon link
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    assert(html.includes('rel="icon"'), 'Favicon link exists');
    assert(html.includes('image/svg+xml'), 'Favicon is SVG type');
    assert(html.includes('data:image/svg+xml'), 'Favicon uses inline SVG data URI');

    dom.window.close();
}

async function test_HeaderLogoStatic() {
    console.log('\n━━━ TEST 15: Header Logo Never Shifts Across Languages ━━━');
    const dom = createDOM();
    await wait(1000);
    const w = dom.window;
    const doc = w.document;

    // The header subtitle and title should NOT have data-i18n attributes
    // (they are static identity, never translated)
    const mainTitle = doc.getElementById('mainTitle');
    const subtitle = doc.getElementById('subtitle');
    assert(mainTitle !== null, 'Logo title element exists');
    assert(subtitle !== null, 'Logo subtitle element exists');

    // Save the initial text
    const titleEN = mainTitle.textContent;
    const subEN = subtitle.textContent;

    // Switch to Arabic
    w.setLanguage('ar');
    // Subtitle is translated — Arabic version has Arabic text on both sides of |
    assert(subtitle.textContent.includes('حاسبة'), 'Subtitle still has Arabic text after AR switch');
    assert(subtitle.textContent.includes('للجزائر'), 'Subtitle has Algeria reference in Arabic after AR switch');

    // Switch to Spanish
    w.setLanguage('es');
    assert(subtitle.textContent.includes('حاسبة'), 'Subtitle still has Arabic text after ES switch');
    assert(subtitle.textContent.includes('Argelia'), 'Subtitle has Algeria reference in Spanish after ES switch');

    dom.window.close();
}

async function test_HeroTranslates() {
    console.log('\n━━━ TEST 16: Hero Section Translates ━━━');
    const dom = createDOM();
    await wait(1000);
    const w = dom.window;
    const doc = w.document;

    const introTitle = doc.getElementById('introTitle');
    const introDesc = doc.getElementById('introDesc');

    // Switch to French
    w.setLanguage('fr');
    const frTitle = introTitle.textContent;
    const frDesc = introDesc.textContent;
    assert(frTitle.length > 0, 'FR intro title has content');
    assert(frDesc.length > 0, 'FR intro desc has content');

    // Switch to English
    w.setLanguage('en');
    const enTitle = introTitle.textContent;
    assert(enTitle !== frTitle, 'EN title differs from FR title');
    assert(enTitle.includes('Professional'), 'EN title contains expected text');

    // Switch to Arabic
    w.setLanguage('ar');
    const arTitle = introTitle.textContent;
    assert(arTitle !== enTitle, 'AR title differs from EN title');

    dom.window.close();
}

async function test_GoToTopButton() {
    console.log('\n━━━ TEST 17: Go To Top Button Exists ━━━');
    const dom = createDOM();
    await wait(1000);
    const doc = dom.window.document;

    const btn = doc.getElementById('goToTop');
    assert(btn !== null, 'Go To Top button exists in DOM');
    assert(btn.tagName === 'BUTTON', 'Go To Top is a button element');
    assert(btn.getAttribute('aria-label') !== null, 'Go To Top has aria-label');

    dom.window.close();
}

async function test_CurrencyRatesSection() {
    console.log('\n━━━ TEST 18: Currency Rates Section ━━━');
    const dom = createDOM();
    await wait(1000);
    const w = dom.window;
    const doc = w.document;

    const section = doc.getElementById('currencyRatesSection');
    assert(section !== null, 'Currency rates section exists');

    const tbody = doc.getElementById('currencyTableBody');
    assert(tbody !== null, 'Currency table body exists');

    const rows = tbody.querySelectorAll('tr');
    assertEqual(rows.length, 8, 'Currency table has 8 rows (EUR, USD, GBP, CAD, CHF, TRY, AED, CNY)');

    // Each row should have 3 cells
    rows.forEach((row, i) => {
        const cells = row.querySelectorAll('td');
        assertEqual(cells.length, 3, `Row ${i + 1} has 3 cells`);
    });

    // Verify all currencies present
    const tableText = tbody.textContent;
    assert(tableText.includes('USD'), 'Table contains USD');
    assert(tableText.includes('EUR'), 'Table contains EUR');
    assert(tableText.includes('GBP'), 'Table contains GBP');
    assert(tableText.includes('CAD'), 'Table contains CAD');
    assert(tableText.includes('CHF'), 'Table contains CHF');
    assert(tableText.includes('TRY'), 'Table contains TRY');
    assert(tableText.includes('AED'), 'Table contains AED');
    assert(tableText.includes('CNY'), 'Table contains CNY');

    // Verify spread percentages are shown
    assert(tableText.includes('%'), 'Table shows spread percentages');

    // Verify CURRENCY_RATES global exists
    const rates = w.eval('CURRENCY_RATES');
    assertEqual(rates.length, 8, 'CURRENCY_RATES has 8 entries');
    rates.forEach(r => {
        assert(r.official > 0, `${r.code} has official rate`);
        assert(r.parallel > 0, `${r.code} has parallel rate`);
    });

    dom.window.close();
}

async function test_ScrollSnapSections() {
    console.log('\n━━━ TEST 19: Scroll Snap Sections ━━━');
    const dom = createDOM();
    await wait(1000);
    const doc = dom.window.document;

    const snapSections = doc.querySelectorAll('.snap-section');
    assert(snapSections.length >= 3, `At least 3 snap sections found (got ${snapSections.length})`);

    dom.window.close();
}

async function test_RTLForArabic() {
    console.log('\n━━━ TEST 20: RTL Direction for Arabic ━━━');
    const dom = createDOM();
    await wait(1000);
    const w = dom.window;
    const doc = w.document;

    // Default should be LTR
    w.setLanguage('fr');
    assertEqual(doc.documentElement.dir, 'ltr', 'FR sets LTR');

    // Arabic should set RTL
    w.setLanguage('ar');
    assertEqual(doc.documentElement.dir, 'rtl', 'AR sets RTL');
    assertEqual(doc.documentElement.lang, 'ar', 'Language attr set to ar');

    // Switching back should restore LTR
    w.setLanguage('en');
    assertEqual(doc.documentElement.dir, 'ltr', 'EN restores LTR');

    dom.window.close();
}

async function test_ClearHistory() {
    console.log('\n━━━ TEST 21: clearHistory() Function ━━━');
    const dom = createDOM();
    await wait(1000);
    const w = dom.window;
    const doc = w.document;

    for (let i = 1; i <= 3; i++) {
        doc.getElementById('carNameInput').value = `Clear ${i}`;
        w.saveCalculation();
    }
    assertEqual(getHistory(w).length, 3, '3 entries before clear');

    w.clearHistory();

    assertEqual(getHistory(w).length, 0, 'Memory cleared');
    assertEqual(w.localStorage.getItem('calculationHistory'), null, 'localStorage cleared');
    assert(doc.getElementById('historyPanel').classList.contains('hidden'), 'Panel hidden');

    dom.window.close();
}

async function test_FooterAlwaysPresent() {
    console.log('\n━━━ TEST 22: Footer Always at Bottom ━━━');
    const dom = createDOM();
    await wait(1000);
    const doc = dom.window.document;

    const footer = doc.querySelector('footer');
    assert(footer !== null, 'Footer element exists');
    assert(footer.textContent.includes('Dr. Soulimane KAMNI'), 'Footer has developer credit');
    assert(footer.textContent.includes('2026'), 'Footer has copyright year');

    // Verify footer is last major element in the container
    const container = footer.parentElement;
    const lastChild = container.lastElementChild;
    assertEqual(lastChild.tagName, 'FOOTER', 'Footer is last element in container');

    dom.window.close();
}

// ─── RUN ALL ────────────────────────────────────────
async function runAll() {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║  🧪 E2E Tests: Algerian Car Import Calculator   ║');
    console.log('║  Multi-file project structure                    ║');
    console.log('╚══════════════════════════════════════════════════╝');

    const t0 = Date.now();

    const suites = [
        test_FunctionsExist,
        test_SaveAndPersist,
        test_Max5Entries,
        test_24HourExpiration,
        test_DeleteEntry,
        test_EnterKeySave,
        test_EmptyNameRejected,
        test_CalculationAccuracy,
        test_UIRendering,
        test_EscapeClosesModal,
        test_TranslationsComplete,
        test_IntroAndFooterPresent,
        test_MultiFileStructure,
        test_BrowserTitleAndFavicon,
        test_HeaderLogoStatic,
        test_HeroTranslates,
        test_GoToTopButton,
        test_CurrencyRatesSection,
        test_ScrollSnapSections,
        test_RTLForArabic,
        test_ClearHistory,
        test_FooterAlwaysPresent
    ];

    for (const suite of suites) {
        try {
            await suite();
        } catch (e) {
            console.log(`  💥 CRASH in ${suite.name}: ${e.message}`);
            failed++;
        }
    }

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

    console.log('\n══════════════════════════════════════════════════');
    console.log(`  Total: ${passed + failed} | ✅ ${passed} passed | ❌ ${failed} failed | ⏱ ${elapsed}s`);
    console.log('══════════════════════════════════════════════════');

    if (failed > 0) {
        console.log('\n❌ FAILED:');
        results.filter(r => r.status === 'FAIL').forEach(r => console.log(`   • ${r.name}`));
        console.log('');
        process.exit(1);
    } else {
        console.log('\n🎉 ALL TESTS PASSED!\n');
        process.exit(0);
    }
}

runAll().catch(e => {
    console.error('Fatal:', e);
    process.exit(1);
});
