# AxiomAtlas 2.0 — Comprehensive STEM, Mathematics, Physics, Astronomy, Statistics & Finance Platform

**Live Website:** [https://axiomatlas.netlify.app/](https://axiomatlas.netlify.app/) · **Repository:** [msrajput08/axiom-atlas](https://github.com/msrajput08/axiom-atlas)

AxiomAtlas 2.0 is a fast, 100% client-side, zero-dependency scientific and quantitative calculation platform covering **Mathematics, Algebra, Calculus & Graphing, Geometry & Trigonometry, Physics & Engineering, Astronomy & Astrophysics, Statistics & Probability, Finance, and Converters & Everyday Tools**.

---

## Key Highlights in AxiomAtlas 2.0

* **383 Total Calculator Routes Across 9 Primary Categories (100% Backward Compatible):**
  * **314 Canonical Calculators** (`67` retained from v1 + `164` STEM/Finance tools + `83` new Astronomy & Astrophysics tools, with `3` orbital tools upgraded into Astronomy & Astrophysics) organized across **9 Primary Categories** and **74 Domain-Specific Subcategories**.
  * **69 Legacy Compatibility Alias Routes** mapped to **21 Consolidated Multi-Mode Suites** and **12 Upgraded Canonical Calculators**, each with automatic `defaultMode` pre-selection and `<link rel="canonical">` tags so zero legacy URLs break.
  * **12 Legacy Category Redirect Pages** preserving all v1 category URLs (`/categories/math-numbers/`, `/categories/graphing-calculus/`, `/categories/physics/`, etc.).
* **Redesigned 6-Part Educational Guide + Single-Pipeline `Explain Calculation` Engine:**
  * Every calculator page features a clean, spacious, minimal 6-part reference guide: **(1) Overview**, **(2) Formula**, **(3) Variables & Constants Table (`Symbol | Meaning | Unit`)**, **(4) How It Works**, **(5) Collapsible Worked Example (`<details>`)**, and **(6) Assumptions & Limitations**.
  * Every live calculation also generates a deterministic step-by-step **Explain Calculation** trace from the exact same execution pass that produces the primary result cards.
* **Complete Astronomy & Astrophysics Suite (8 Subcategories, 86 Canonical Calculators):**
  * Covers **Orbital Mechanics & Celestial Motion** (12 tools including Newton–Raphson Kepler's Equation solver), **Planetary Science** (10 tools with NASA/IAU Celestial Body Preset selector + Kopparapu Habitable Zone estimator), **Stellar Astrophysics** (12 tools including exact Planck Blackbody solver), **Cosmology** (10 tools with configurable $\Lambda$CDM Gauss–Legendre numerical integration), **Black Holes & Relativity** (10 tools), **Observational Astronomy & Telescopes** (13 tools including CCD/CMOS SNR equation), **Exoplanets** (6 unique canonical + 2 cross-listed tools), and **Astronomy Converters & Reference Tools** (13 tools including JD, MJD, GMST/LST Sidereal Time, and Vincenty Spherical Coordinate Separation).
* **Upgraded Mathematical Parser & Live Formula Preview:**
  * Standard mathematical precedence (`-2^2 = -4`, `(-2)^2 = 4`, right-associative `2^3^2 = 512`).
  * Full implicit multiplication (`2x`, `2(x+1)`, `(x+1)(x-1)`, `x(x+1)`, `2sin(x)`, `3pi`) and Unicode math operators (`√x`, `∛x`, `|x|`, `π`, `×`, `÷`, `−`).
  * Interactive trigonometric notation disambiguation (`sin⁻¹(x)` vs `sin^-1(x)` with one-click toggle between `asin(x)` and `csc(x)`, plus `sin²(x)` vs `sin(x^2)`).

---

## 9 Primary Categories & Route Breakdown

| Primary Category | Category URL | Subcategories | Canonical Tools | Legacy Aliases | Total Routes |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **1. Mathematics** | `/categories/mathematics/` | 8 | 13 | 16 | **29** |
| **2. Algebra** | `/categories/algebra/` | 8 | 21 | 0 | **21** |
| **3. Calculus & Graphing** | `/categories/calculus-graphing/` | 10 | 38 | 0 | **38** |
| **4. Geometry & Trigonometry** | `/categories/geometry-trigonometry/` | 6 | 8 | 21 | **29** |
| **5. Physics & Engineering** | `/categories/physics-engineering/` | 13 | 78 | 11 | **89** |
| **6. Statistics & Probability** | `/categories/statistics-probability/` | 8 | 20 | 1 | **21** |
| **7. Finance** | `/categories/finance/` | 8 | 23 | 10 | **33** |
| **8. Converters & Everyday Tools** | `/categories/converters-everyday-tools/` | 5 | 27 | 10 | **37** |
| **9. Astronomy & Astrophysics** | `/categories/astronomy-astrophysics/` | 8 | 86 | 0 | **86** |
| **Total** | **9 Primary Categories** | **74** | **314** | **69** | **383** |

---

## Repository Structure

```text
axiom-atlas/
├── site/                           # Deployable static website (published directly by Netlify)
│   ├── assets/
│   │   ├── app.js                  # UI controller, multi-mode suites, specialized solvers & Explain drawer
│   │   ├── astronomy.js            # Centralized CODATA/IAU/NASA constants, celestial presets & numerical solvers
│   │   ├── catalog.json            # Generated registry (9 categories, 74 subcategories, 383 tool routes)
│   │   ├── engine.js               # Expression parser, AST evaluator, unit converter & formula trace engine
│   │   ├── symbolic.js             # Symbolic differentiation, integration, ODE IVP/BVP, Fourier & Laplace engine
│   │   ├── linalg_stats_finance.js # Matrix decompositions, probability distributions & quantitative finance engine
│   │   └── styles.css              # Responsive dark/light design system & 6-part educational guide layout
│   ├── categories/                 # 9 primary category pages + 12 legacy category redirect pages
│   ├── tools/                      # 383 static calculator pages (314 canonical + 69 legacy aliases)
│   ├── _redirects                  # Netlify redirect rules for legacy category slugs
│   ├── sitemap.xml                 # 326 canonical URLs (home, info, 9 categories, 314 canonical tools)
│   └── google3d4d24a07fe849ba.html # Google Search Console verification file (preserved)
├── source/
│   ├── make_catalog.py             # Master calculator catalog & 9-category taxonomy generator
│   ├── build.py                    # Static HTML, 6-part educational guide, JSON-LD & SEO builder
│   └── generate_sitemap.py         # Canonical sitemap generator
├── scripts/
│   └── rebuild.py                  # Full build pipeline (runs make_catalog.py -> build.py -> generate_sitemap.py)
├── tests/
│   └── run_all_tests.mjs           # Automated QA & regression suite (7 suites, 28 test cases, 16,998 assertions)
├── docs/audits/                    # Architecture audit reports, upgrade proposals & Phase 0 baseline snapshot
├── netlify.toml                    # Netlify deployment config (publishes site/)
└── package.json                    # Build and test scripts
```

---

## Quick Start, Build & Automated Testing

### 1. Run Locally
```bash
cd site
python3 -m http.server 8000
# Or: npx serve site -l 8000
```

### 2. Rebuild Static Site (`site/`)
```bash
npm run build
# Equivalent to: python3 scripts/rebuild.py
```

### 3. Run the Automated Regression & QA Test Suite
```bash
npm test
# Equivalent to: node tests/run_all_tests.mjs
# Output: 7 suites, 28 test cases passed, 0 failed (16,998 assertions verified)
```

---

## Deployment, Analytics & Search Console Notes

* **Netlify Deployment:** `netlify.toml` publishes the `site/` folder directly (`publish = "site"`). Connect this repository to the **AxiomAtlas** Netlify project (`https://axiomatlas.netlify.app`). Never connect this repository to the PankhPages Netlify project.
* **Google Search Console:** Verification file `site/google3d4d24a07fe849ba.html` is preserved untouched across rebuilds.
* **Google Analytics 4:** `source/build.py` embeds the GA4 tag (`G-G9NPE8LWSM`) across all generated pages while keeping the site 100% free of third-party ad scripts.
