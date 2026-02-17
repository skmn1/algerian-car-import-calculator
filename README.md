# 🚗 Algerian Car Import Calculator
### حاسبة استيراد السيارات للجزائر

> A single-file, browser-ready web app that accurately calculates the **total landed cost** of importing a car into Algeria — accounting for the country's dual exchange rate system.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen?style=flat)
![Single File](https://img.shields.io/badge/single--file-yes-blue?style=flat)

---

## 📸 Preview

> Open `algerian-car-import-calculator.html` directly in any browser. No server, no install, no build step.

---

## 🧠 The Problem This Solves

Most importers miscalculate their costs because Algeria operates with **two exchange rates simultaneously**:

| Rate | Value | Used For |
|------|-------|----------|
| **Official Bank Rate** (Banque d'Algérie) | ~153 DZD/EUR | Customs tax calculation |
| **Parallel Market Rate** (Square / السوق الموازية) | ~280 DZD/EUR | Actual purchase of euros |

Using a single rate for everything leads to cost estimates that can be off by **millions of dinars**.

---

## ⚙️ How the Calculation Works

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
| TVA Deductible | ✅ Yes |
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
                                             = 3.03 millions centimes
```

---

## ✨ Features

- **Real-time calculation** — results update instantly as you type
- **Dual exchange rate logic** — parallel rate for purchases, official rate for customs
- **TVA toggle** — deduct 19% for NIF-registered businesses
- **Car-specific defaults** — parallel rate 280, customs 20%, shipping €1,500
- **Custom ▲▼ steppers** — all fields increment/decrement by 10 (no cent-level noise)
- **Centimes display** — results shown in both DZD and millions centimes (local convention)
- **Cost breakdown table** — itemized view of every cost component
- **Responsive design** — works on mobile, tablet, and desktop
- **Zero dependencies** — one HTML file, runs offline

---

## 🚀 Usage

### Option 1 — Open directly in browser
```bash
# Just double-click the file, or:
open algerian-car-import-calculator.html        # macOS
start algerian-car-import-calculator.html       # Windows
xdg-open algerian-car-import-calculator.html    # Linux
```

### Option 2 — Serve locally (to share on your network)
```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```
Then visit: `http://localhost:8000/algerian-car-import-calculator.html`

### Option 3 — Deploy publicly in 30 seconds
Drag and drop the file onto **[Netlify Drop](https://app.netlify.com/drop)** — get an instant public HTTPS URL with zero configuration.

---

## 🎛️ Default Values

| Field | Default | Notes |
|-------|---------|-------|
| Car Price | €10,000 | Editable |
| Shipping Cost | €1,500 | Typical France → Algeria |
| Official Rate | 153 DZD/EUR | Update as needed |
| Parallel Rate | 280 DZD/EUR | Check daily — fluctuates |
| Customs Tax | 20% | Standard passenger car rate |
| Port & Admin Fees | 90,000 DZD | Varies by port (Algiers / Oran) |
| TVA Deductible | Off | Enable for NIF holders |

> ⚠️ Exchange rates change daily. Always verify the parallel rate before making purchasing decisions.

---

## 🗂️ Project Structure

```
algerian-car-import-calculator/
└── algerian-car-import-calculator.html   # The entire app — HTML + CSS + JS
└── README.md                             # This file
```

---

## 🧰 Tech Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure and semantics |
| **Tailwind CSS** (CDN) | Styling and responsive layout |
| **Vanilla JavaScript** (ES6+) | Calculation logic and DOM updates |

No npm, no build tools, no frameworks. Open it and it works.

---

## 🤝 Contributing

Contributions are welcome! Some ideas for improvement:

- [ ] Add more car-specific customs tax presets (by engine size / category)
- [ ] Real-time parallel rate fetching from an API
- [ ] PDF export of the cost breakdown
- [ ] Arabic / French language toggle
- [ ] History of past calculations (localStorage)
- [ ] Share calculation via URL (encoded params)

To contribute:
```bash
git clone https://github.com/YOUR_USERNAME/algerian-car-import-calculator.git
cd algerian-car-import-calculator
# Open the HTML file in your editor and browser — no build step needed
```

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 🇩🇿 About

Built for Algerian car importers who need a reliable, transparent way to calculate the true cost of a vehicle before committing to a purchase. The dual exchange rate system is a real complexity that this tool handles correctly.

> *"The price of the car is only half the story."*