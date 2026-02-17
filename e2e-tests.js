/**
 * E2E Tests for Algerian Car Import Calculator
 * Tests: localStorage persistence, Enter key, history limits, 24h expiration, UI rendering
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

// ─── Load HTML, strip Tailwind CDN (not available in JSDOM) ──
function createDOM() {
    let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    
    // Remove Tailwind CDN script and config (JSDOM can't execute it)
    html = html.replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/, '');
    html = html.replace(/<script>\s*tailwind\.config[\s\S]*?<\/script>/, '');
    
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

// Helper: access let/const variables (not on window in strict mode)
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
    
    // Save a calculation
    doc.getElementById('carNameInput').value = 'Toyota Corolla';
    w.saveCalculation();
    
    // Check in-memory
    const history = getHistory(w);
    assertEqual(history.length, 1, 'In-memory: 1 entry');
    assertEqual(history[0].carName, 'Toyota Corolla', 'Car name correct');
    assert(history[0].savedAt > 0, 'savedAt timestamp set');
    assert(history[0].totalDZD > 0, 'totalDZD calculated');
    assert(history[0].totalEUR > 0, 'totalEUR calculated');
    assert(history[0].inputs !== undefined, 'inputs object saved');
    assert(history[0].breakdown !== undefined, 'breakdown object saved');
    
    // Check localStorage
    const stored = ls.getItem('calculationHistory');
    assert(stored !== null, 'localStorage has data');
    const parsed = JSON.parse(stored);
    assertEqual(parsed.length, 1, 'localStorage: 1 entry');
    assertEqual(parsed[0].carName, 'Toyota Corolla', 'localStorage: name correct');
    
    // ── Simulate page refresh ──
    const savedData = ls.getItem('calculationHistory');
    const dom2 = createDOM();
    await wait(1000);
    dom2.window.localStorage.setItem('calculationHistory', savedData);
    dom2.window.loadHistoryFromStorage();
    
    const history2 = getHistory(dom2.window);
    assertEqual(history2.length, 1, 'After refresh: 1 entry persists');
    assertEqual(history2[0].carName, 'Toyota Corolla', 'After refresh: name intact');
    assertEqual(history2[0].totalDZD, history[0].totalDZD, 'After refresh: totalDZD intact');
    
    // Verify panel visible
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
    
    // Verify localStorage matches
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
    
    // Delete middle
    const middleId = getHistory(w)[1].id;
    w.deleteEntry(middleId);
    assertEqual(getHistory(w).length, 2, 'After delete: 2 remain');
    assert(!getHistory(w).some(e => e.id === middleId), 'Middle entry removed');
    
    const stored = JSON.parse(w.localStorage.getItem('calculationHistory'));
    assertEqual(stored.length, 2, 'localStorage updated');
    
    // Delete all
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
    
    // Open modal
    w.openSaveDialog();
    const modal = doc.getElementById('saveModal');
    assert(!modal.classList.contains('hidden'), 'Modal opens');
    
    // Type car name and press Enter
    const input = doc.getElementById('carNameInput');
    input.value = 'Enter Key Car';
    
    const enterEvt = new w.KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
    });
    input.dispatchEvent(enterEvt);
    
    // Verify save happened
    const stored = w.localStorage.getItem('calculationHistory');
    assert(stored !== null, 'Saved via Enter key');
    if (stored) {
        const parsed = JSON.parse(stored);
        assertEqual(parsed[0].carName, 'Enter Key Car', 'Name saved correctly via Enter');
    }
    
    // Modal should close
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
    
    // translations is a const, access via t() function or directly from script context
    // We use eval in the window context to access it
    const translations = w.eval('translations');
    
    const keys = ['saveCalculation', 'enterCarName', 'cancelBtn', 'saveBtn',
                  'calculationHistory', 'historyLimitNote', 'delete', 'details'];
    const langs = ['en', 'fr', 'ar', 'es'];
    
    for (const lang of langs) {
        for (const key of keys) {
            const val = translations[lang]?.[key];
            assert(val !== undefined && val.length > 0, `${lang}.${key} defined`);
        }
    }
    
    dom.window.close();
}

async function test_StorageKeyConsistency() {
    console.log('\n━━━ TEST 12: No Hardcoded Storage Keys ━━━');
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    
    // Get the main app script (the last, largest <script> block)
    const allScripts = html.match(/<script>[\s\S]*?<\/script>/g) || [];
    const mainScript = allScripts.reduce((a, b) => a.length > b.length ? a : b, '');
    
    assert(mainScript.length > 1000, 'Found main app script');
    assert(mainScript.includes('STORAGE_KEY'), 'STORAGE_KEY constant used');
    assert(mainScript.includes('TWENTY_FOUR_HOURS'), 'TWENTY_FOUR_HOURS constant used');
    
    // Verify no hardcoded localStorage key strings (except the constant definition)
    const lines = mainScript.split('\n');
    const hardcoded = lines.filter(l => 
        l.includes("localStorage") && 
        l.includes("'calculationHistory'") && 
        !l.includes('STORAGE_KEY')
    );
    assertEqual(hardcoded.length, 0, 'No hardcoded localStorage key strings');
}

async function test_ClearHistory() {
    console.log('\n━━━ TEST 13: clearHistory() Function ━━━');
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

// ─── RUN ALL ────────────────────────────────────────
async function runAll() {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║  🧪 E2E Tests: Algerian Car Import Calculator   ║');
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
        test_StorageKeyConsistency,
        test_ClearHistory
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
