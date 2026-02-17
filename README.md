# Algerian Car Import Calculator
### حاسبة استيراد السيارات للجزائر

> A modular, browser-ready web app that accurately calculates the **total landed cost** of importing a car into Algeria — accounting for the country's dual exchange rate system.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen?style=flat)
![Tests](https://img.shields.io/badge/tests-306%20passing-brightgreen?style=flat)

---

## Preview

> Open `index.html` in any browser, or serve the project directory. No server required for local use.

**[Open the live app](https://algerian-car-import-calculator.vercel.app/)** — hosted on Vercel.

---

## The Problem This Solves

Most importers miscalculate costs because Algeria operates with **two exchange rates simultaneously**:

| Rate | Value | Used For |
|------|-------|----------|
| **Official Bank Rate** (Banque d'Algérie) | ~153 DZD/EUR | Customs tax calculation |
| **Parallel Market Rate** (Square / السوق الموازية) | ~280 DZD/EUR | Actual purchase of euros |

Using a single rate leads to estimates off by **millions of dinars**.

---

## How the Calculation Works

```
STEP 1 — TVA Deduction (optional, for NIF-registered businesses)
  Adjusted Car Price = Car Price × 0.81   (removes 19% TVA)

STEP 2 — Purchase & Shipping at PARALLEL rate
  Car Cost (DZD)      = Adjusted Car Price × Parallel Rate
  Shipping Cost (DZD) = Shipping Cost      × Parallel Rate

STEP 3 — Customs base at OFFICIAL rate (car price ONLY — shipping excluded)
  Customs Base (DZD)  = Adjusted Car Price × Official Rate

STEP 4 — Apply customs tax
  Customs Tax (DZD)   = Customs Base × (Tax % / 100)

STEP 5 — Total landed cost
  TOTAL = Car Cost + Shipping Cost + Customs Tax + Port & Admin Fees
```

### Example

| Input | Value |
|-------|-------|
| Car Price | €10,000 |
| Shipping | €1,500 |
| TVA Deductible | Yes |
| Official Rate | 153 DZD/EUR |
| Parallel Rate | 280 DZD/EUR |
| Customs Tax | 20% |
| Port Fees | 90,000 DZD |

```
Adjusted car price : €10,000 × 0.81        = €8,100
Car cost (DZD)     : €8,100  × 280          = 2,268,000 DZD
Shipping (DZD)     : €1,500  × 280          =   420,000 DZD
Customs base       : €8,100  × 153          = 1,239,300 DZD
Customs tax (20%)  : 1,239,300 × 0.20       =   247,860 DZD
Port fees          :                         =    90,000 DZD
                                              ───────────────
TOTAL                                        = 3,025,860 DZD
```

---

## Features

- **Real-time calculation** — results update instantly as you type
- **Dual exchange rate logic** — parallel rate for purchases, official rate for customs
- **TVA toggle** — deduct 19% for NIF-registered businesses
- **Calculation history** — save up to 5 entries with 24-hour auto-expiry
- **8-currency exchange rate reference** — EUR, USD, GBP, CAD, CHF, TRY, AED, CNY with spread percentages
- **Multilingual** — English, French, Arabic (RTL), Spanish
- **Scroll progress bar** — visual indicator of page position
- **Go To Top button** — appears when scrolling past header
- **Custom ▲▼ steppers** — increment/decrement by 10
- **Responsive design** — mobile, tablet, desktop
- **Minimal UI** — clean, flat design with subtle accents
- **Zero runtime dependencies** — Tailwind CSS via CDN only
- **306 automated e2e tests** — comprehensive coverage

---

## Project Structure

```
algerian-car-import-calculator/
├── index.html           # Structure only — no inline JS or CSS
├── css/
│   └── styles.css       # All custom styles (stepper, tooltips, RTL, history)
├── data/
│   └── rates.js         # Currency exchange rates (single data source)
├── js/
│   ├── i18n.js          # Translations (EN/FR/AR/ES) + language switching
│   ├── calculator.js    # Calculation engine + currency table renderer
│   ├── history.js       # Save/delete/render calculation history
│   └── app.js           # App bootstrap, event wiring, scroll helpers
├── e2e-tests.js         # 306 automated tests (JSDOM-based)
└── README.md
```

### File Responsibilities

| File | Lines | Purpose |
|------|-------|---------|
| `index.html` | ~430 | Pure HTML structure, Tailwind CDN + config, external file loading |
| `css/styles.css` | ~310 | Custom components, RTL overrides, print styles, mobile overrides |
| `data/rates.js` | ~20 | `CURRENCY_RATES` array + `RATES_LAST_UPDATED` constant |
| `js/i18n.js` | ~375 | 72 translation keys × 4 languages, `setLanguage()`, `t()`, RTL direction |
| `js/calculator.js` | ~120 | `calculate()`, `fmt()`, `step()`, `deb()`, `renderCurrencyTable()` |
| `js/history.js` | ~234 | localStorage CRUD, 24h expiry, max 5 entries, test helpers |
| `js/app.js` | ~110 | `initGoToTop()`, `initSmartScroll()`, `initScrollProgress()`, DOMContentLoaded |

### Script Load Order

```html
<script src="data/rates.js"></script>     <!-- 1. Data -->
<script src="js/i18n.js"></script>        <!-- 2. Translations (uses CURRENCY_RATES) -->
<script src="js/calculator.js"></script>  <!-- 3. Engine (uses t(), CURRENCY_RATES) -->
<script src="js/history.js"></script>     <!-- 4. History (uses $, fmt, calculate) -->
<script src="js/app.js"></script>         <!-- 5. Bootstrap (uses everything) -->
```

---

## Usage

### Online
**[algerian-car-import-calculator.vercel.app](https://algerian-car-import-calculator.vercel.app/)**

### Local
```bash
# Just open the file directly:
open index.html          # macOS
xdg-open index.html      # Linux

# Or serve locally:
python3 -m http.server 8000
npx serve .
```

---

## Testing

306 automated end-to-end tests using JSDOM:

```bash
npm install   # one-time: installs jsdom
node e2e-tests.js
```

Test suites cover: core functions, save/persist, max 5 limit, 24h expiry, delete, Enter key save, empty name rejection, calculation accuracy, UI rendering, Escape closes modal, translation completeness, intro & footer, storage key consistency, browser title & favicon, header stability across languages, hero translation, currency rates table, scroll snap sections, RTL direction, clearHistory, footer position.

---

## Default Values

| Field | Default | Notes |
|-------|---------|-------|
| Car Price | €10,000 | Editable |
| Shipping Cost | €1,500 | Typical France → Algeria |
| Official Rate | 153 DZD/EUR | Update as needed |
| Parallel Rate | 280 DZD/EUR | Check daily |
| Customs Tax | 20% | Standard passenger car rate |
| Port & Admin Fees | 90,000 DZD | Varies by port |
| TVA Deductible | Off | Enable for NIF holders |

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure and semantics |
| **Tailwind CSS** (CDN) | Utility-first styling |
| **Vanilla JavaScript** (ES6+) | Calculation logic and DOM updates |
| **JSDOM** | Test environment (dev only) |

No npm runtime, no build tools, no frameworks. Open and it works.

---

## Contributing

```bash
git clone https://github.com/skmn1/algerian-car-import-calculator.git
cd algerian-car-import-calculator
# Edit files, then run tests:
node e2e-tests.js
```

Ideas for improvement:
- [ ] Car-specific customs tax presets (by engine size/category)
- [ ] Real-time parallel rate fetching from an API
- [ ] PDF export of cost breakdown
- [ ] Share calculation via URL params

---

## License

MIT License — free to use, modify, and distribute.

---

## Author

**Dr. Soulimane KAMNI** — Full-Stack Developer
Specialized in financial calculators and enterprise web applications.

---

> *"The price of the car is only half the story."*
> Built for Algerian car importers who need transparent cost calculations.
