# AxiomAtlas 2.0 — Comprehensive STEM, Mathematics, Physics, Statistics & Finance Platform

**Live Website:** [https://axiomatlas.netlify.app/](https://axiomatlas.netlify.app/) · **Repository:** [msrajput08/axiom-atlas](https://github.com/msrajput08/axiom-atlas)

AxiomAtlas 2.0 is a fast, 100% client-side, zero-dependency scientific and quantitative calculation platform covering **Mathematics, Algebra, Calculus & Graphing, Geometry & Trigonometry, Physics & Engineering, Statistics & Probability, Finance, and Converters & Everyday Tools**.

---

## Key Highlights in AxiomAtlas 2.0

* **300 Total Calculator Routes (100% Backward Compatible):**
  * **231 Canonical Calculators** (`67` retained from v1 + `164` newly engineered in v2) organized across **8 Primary Categories** and **66 Domain-Specific Subcategories**.
  * **69 Legacy Compatibility Alias Routes** mapped to **21 Consolidated Multi-Mode Suites** and **12 Upgraded Canonical Calculators**, each with automatic `defaultMode` pre-selection and `<link rel="canonical">` tags so zero legacy URLs break.
  * **12 Legacy Category Redirect Pages** preserving all v1 category URLs (`/categories/math-numbers/`, `/categories/graphing-calculus/`, `/categories/physics/`, etc.).
* **Single-Pipeline `Explain Calculation` Engine:**
  * Every calculator (formula, multi-mode suite, and specialized solver) generates a step-by-step derivation trace from the exact same calculation pass that produces the primary result cards — showing the symbolic formula, unit conversion notes, variable substitutions, intermediate steps, and final formatted output.
* **Upgraded Mathematical Parser & Live Formula Preview:**
  * Standard mathematical precedence (`-2^2 = -4`, `(-2)^2 = 4`, right-associative `2^3^2 = 512`).
  * Full implicit multiplication (`2x`, `2(x+1)`, `(x+1)(x-1)`, `x(x+1)`, `2sin(x)`, `3pi`) and Unicode math operators (`√x`, `∛x`, `|x|`, `π`, `×`, `÷`, `−`).
  * Interactive trigonometric notation disambiguation (`sin⁻¹(x)` vs `sin^-1(x)` with one-click toggle between `asin(x)` and `csc(x)`, plus `sin²(x)` vs `sin(x^2)`).
* **Symbolic & High-Precision Numerical Engines (`site/assets/`):**
  * `engine.js`: Expression tokenizer/compiler, scale-aware IEEE-754 floating-point formatter (preserving small physical quantities down to $6.6743 \times 10^{-15}\text{ N}$ while snapping relative trig cancellation noise), 15-digit `erf(x)` Taylor/continued-fraction engine, Citardauq quadratic solver, Rouché-Capelli linear system solver, and unit conversion engine.
  * `symbolic.js`: AST-based symbolic differentiation (product, quotient, chain, logarithmic $f(x)^{g(x)}$, higher-order orders 1–4, partial, implicit, parametric, directional, gradient, Hessian), symbolic antiderivatives + 8-point Gauss-Legendre quadrature, 2D/3D cubature, improper integrals with 7th-degree Hermite endpoint smoothing, RK4/Heun/Euler ODE IVP solver, Thomas tridiagonal finite-difference BVP solver, Fourier series, and Laplace transforms.
  * `linalg_stats_finance.js`: RREF & Rank-Nullity, $PA=LU$, Modified Gram-Schmidt $QR$, shifted QR Eigenvalues & Eigenvectors (including $2\times 2$ complex Schur blocks), rectangular Jacobi SVD, Padé scaling-and-squaring Matrix Exponential $e^A$, Ordinary Least Squares, Normal/Student-$t$/Chi-Square/$F$/Poisson distributions, One-Way ANOVA, Logistic Regression, NPV/IRR/XIRR, Bond Duration & Convexity, and Black-Scholes Option Pricing & Greeks.

---

## 8 Primary Categories & Route Breakdown

| Primary Category | Category URL | Subcategories | Canonical Tools | Legacy Aliases | Total Routes |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **1. Mathematics** | `/categories/mathematics/` | 8 | 13 | 16 | **29** |
| **2. Algebra** | `/categories/algebra/` | 8 | 21 | 0 | **21** |
| **3. Calculus & Graphing** | `/categories/calculus-graphing/` | 10 | 38 | 0 | **38** |
| **4. Geometry & Trigonometry** | `/categories/geometry-trigonometry/` | 6 | 8 | 21 | **29** |
| **5. Physics & Engineering** | `/categories/physics-engineering/` | 13 | 81 | 11 | **92** |
| **6. Statistics & Probability** | `/categories/statistics-probability/` | 8 | 20 | 1 | **21** |
| **7. Finance** | `/categories/finance/` | 8 | 23 | 10 | **33** |
| **8. Converters & Everyday Tools** | `/categories/converters-everyday-tools/` | 5 | 27 | 10 | **37** |
| **Total** | **8 Primary Categories** | **66** | **231** | **69** | **300** |

---

## Repository Structure

```text
axiom-atlas/
├── site/                           # Deployable static website (published directly by Netlify)
│   ├── assets/
│   │   ├── app.js                  # UI controller, 21 multi-mode suites, specialized solvers & Explain drawer
│   │   ├── catalog.json            # Generated registry (8 categories, 66 subcategories, 300 tool routes)
│   │   ├── engine.js               # Expression parser, AST evaluator, unit converter & formula trace engine
│   │   ├── symbolic.js             # Symbolic differentiation, integration, ODE IVP/BVP, Fourier & Laplace engine
│   │   ├── linalg_stats_finance.js # Matrix decompositions, probability distributions & quantitative finance engine
│   │   └── styles.css              # Responsive dark/light design system
│   ├── categories/                 # 8 primary category pages + 12 legacy category redirect pages
│   ├── tools/                      # 300 static calculator pages (231 canonical + 69 legacy aliases)
│   ├── _redirects                  # Netlify redirect rules for legacy category slugs
│   ├── sitemap.xml                 # 242 canonical URLs (home, info, 8 categories, 231 canonical tools)
│   └── google3d4d24a07fe849ba.html # Google Search Console verification file (preserved)
├── source/
│   ├── make_catalog.py             # Master calculator catalog & taxonomy generator
│   ├── build.py                    # Static HTML, JSON-LD (WebApplication, BreadcrumbList, FAQPage) & SEO builder
│   └── generate_sitemap.py         # Canonical sitemap generator
├── scripts/
│   └── rebuild.py                  # Full build pipeline (runs make_catalog.py -> build.py -> generate_sitemap.py)
├── tests/
│   └── run_all_tests.mjs           # Automated QA & regression suite (6 suites, 23 test cases, 12,809 assertions)
├── docs/audits/                    # Architecture audit reports, upgrade proposals & Phase 0 baseline snapshot
├── netlify.toml                    # Netlify deployment config (publishes site/)
└── package.json                    # Build and test scripts
```

---

## Quick Start, Build & Automated Testing

### 1. Run Locally
Serve the static `site/` directory using Python or Node:

```bash
cd site
python3 -m http.server 8000
# Or: npx serve site -l 8000
```

### 2. Rebuild Static Site (`site/`)
Whenever you update `source/make_catalog.py` or `source/build.py`, regenerate the catalog, all 325 HTML pages, and `site/sitemap.xml`:

```bash
npm run build
# Equivalent to: python3 scripts/rebuild.py
```

### 3. Run the Automated Regression & QA Test Suite
Run the Node.js verification suite covering all 300 routes, all 136 original v1 baselines, symbolic/numerical calculus benchmarks, linear algebra/statistics/finance engines, expression parser & disambiguation, and calculator-level `Explain Calculation` traces:

```bash
npm test
# Equivalent to: node tests/run_all_tests.mjs
# Output: 6 suites, 23 test cases passed, 0 failed (12,809 assertions verified)
```

---

## Deployment, Analytics & Search Console Notes

* **Netlify Deployment:** `netlify.toml` publishes the `site/` folder directly (`publish = "site"`). Connect this repository to the **AxiomAtlas** Netlify project (`https://axiomatlas.netlify.app`). Never connect this repository to the PankhPages Netlify project.
* **Google Search Console:** Verification file `site/google3d4d24a07fe849ba.html` is preserved untouched across rebuilds.
* **Google Analytics 4:** `source/build.py` embeds the GA4 tag (`G-G9NPE8LWSM`) across all generated pages while keeping the site 100% free of third-party ad scripts.
