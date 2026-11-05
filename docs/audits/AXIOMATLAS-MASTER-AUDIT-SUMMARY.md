# AXIOMATLAS — MASTER PRODUCT AUDIT & UPGRADE PLANNING SUMMARY

**Live Website:** [AxiomAtlas](https://axiomatlas.netlify.app/)
**Repository Inspected:** `msrajput08/axiom-atlas` (commit `74dad9d7344109a68afc6bbfb192083942227ec2`)
**Audit Status:** Phase 0 Complete — **100% Read-Only Audit.** Zero calculators, categories, routes, or production files were modified, deleted, merged, or deployed.
**Companion Audit Reports Generated in `docs/audits/`:**
1. `docs/audits/axiomatlas-existing-system-audit.md` — Verified 14-category & 136-calculator inventory + redundancy & merge audit.
2. `docs/audits/axiomatlas-ux-and-input-audit.md` — Trigonometric notation disambiguation, 3-tier mathematical input system, and per-calculator UX/unit/validation audit.
3. `docs/audits/axiomatlas-explain-calculation-audit.md` — Deterministic `Explain Calculation` trace architecture, subject templates, and 136-calculator readiness matrix.
4. `docs/audits/axiomatlas-advanced-calculator-roadmap.md` — 16 high-value advanced STEM calculator specifications (17-point template per tool).
5. `docs/audits/axiomatlas-mathematical-quality-audit.md` — 18 reproducible mathematical/engine bugs with root causes + 5-layer testing & NIST benchmark strategy.
6. `docs/audits/axiomatlas-product-and-technical-audit.md` — Search/discovery, WCAG 2.1 contrast, SEO/JSON-LD, privacy/AdSense compliance, and zero-budget architecture audit.

## A. Verified Existing Category Inventory (14 Categories, 136 Calculators)

Source-code verification of `source/make_catalog.py` and `site/assets/catalog.json` confirms **14 active categories** (the 11 preliminary categories from the prompt, with `Computing` verified at **11 tools**, plus **3 additional categories**: `Education` [5], `Date & time` [2], and `Everyday` [6]):

| Cat ID | Category Name | Route | Verified Count | Specialized (`s`) | Formula (`f`) | Proposed Category Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CAT-01** | [Math & numbers](https://axiomatlas.netlify.app/categories/math-numbers/) | `/categories/math-numbers/` | **21** | 4 | 17 | **KEEP** (Add visual subcategory filter chips) |
| **CAT-02** | [Algebra](https://axiomatlas.netlify.app/categories/algebra/) | `/categories/algebra/` | **12** | 4 | 8 | **KEEP** (Cross-link 2D coordinate tools with Geometry) |
| **CAT-03** | [Graphing & calculus](https://axiomatlas.netlify.app/categories/graphing-calculus/) | `/categories/graphing-calculus/` | **4** | 4 | 0 | **KEEP & EXPAND** (Add ODE Solver & Taylor/Gradient) |
| **CAT-04** | [Geometry](https://axiomatlas.netlify.app/categories/geometry/) | `/categories/geometry/` | **18** | 0 | 18 | **KEEP** (Group into 2D Plane Shapes vs. 3D Solids) |
| **CAT-05** | [Trigonometry](https://axiomatlas.netlify.app/categories/trigonometry/) | `/categories/trigonometry/` | **5** | 1 | 4 | **KEEP & EXPAND** (Add Complete Triangle Solver) |
| **CAT-06** | [Physics](https://axiomatlas.netlify.app/categories/physics/) | `/categories/physics/` | **27** | 0 | 27 | **KEEP & REORGANIZE** (Add subtopic groupings + absorb 3 physics tools from Computing) |
| **CAT-07** | [Linear algebra](https://axiomatlas.netlify.app/categories/linear-algebra/) | `/categories/linear-algebra/` | **2** | 2 | 0 | **KEEP & EXPAND** (Cross-link `linear-system` + add Eigenvalue/RREF calculator) |
| **CAT-08** | [Statistics](https://axiomatlas.netlify.app/categories/statistics/) | `/categories/statistics/` | **7** | 3 | 4 | **KEEP & EXPAND** (Cross-link means/combinatorics + add Hypothesis Testing) |
| **CAT-09** | [Finance](https://axiomatlas.netlify.app/categories/finance/) | `/categories/finance/` | **15** | 0 | 15 | **KEEP** (Add NPV/IRR & Loan Prepayment tools) |
| **CAT-10** | [Converters](https://axiomatlas.netlify.app/categories/converters/) | `/categories/converters/` | **1** | 1 | 0 | **KEEP & ENRICH** (Cross-list all 6 conversion tools on `/categories/converters/`) |
| **CAT-11** | [Computing](https://axiomatlas.netlify.app/categories/computing/) | `/categories/computing/` | **11** | 2 | 9 | **REORGANIZE** (Move 4 misclassified physics/utility tools out; add Bitwise/IEEE-754 & Subnet tools) |
| **CAT-12** | [Education](https://axiomatlas.netlify.app/categories/education/) | `/categories/education/` | **5** | 0 | 5 | **KEEP** |
| **CAT-13** | [Date & time](https://axiomatlas.netlify.app/categories/date-time/) | `/categories/date-time/` | **2** | 2 | 0 | **KEEP** |
| **CAT-14** | [Everyday](https://axiomatlas.netlify.app/categories/everyday/) | `/categories/everyday/` | **6** | 0 | 6 | **KEEP** (Absorb `electricity-cost` from Computing) |

## B. Complete Calculator Inventory Summary (136 Calculators)

All **136 calculators** (`23` specialized custom renderers + `113` declarative formula calculators) are verified in `docs/audits/axiomatlas-existing-system-audit.md` (Section 2) and listed row-by-row in the **Individual Approval Matrix (Section T)** below.

## C. Categories to Keep (All 14 Categories Preserved)

All 14 existing category URLs (`/categories/<slug>/`) should be **kept** so zero indexed category landing pages break. `Education`, `Date & time`, `Everyday`, `Finance`, `Geometry`, `Algebra`, and `Math & numbers` have clear user mental models.

## D. Categories to Reorganize

1. **`Computing` (`/categories/computing/`):** Currently contains 4 non-computing tools that were placed there by mistake:
   - `resistor-series` (`Series Resistors Calculator`) → Reclassify to **`Physics`** (Electricity & Circuits).
   - `resistor-parallel` (`Parallel Resistors Calculator`) → Reclassify to **`Physics`** (Electricity & Circuits).
   - `frequency-wavelength` (`Frequency to Wavelength`) → Reclassify to **`Physics`** (Waves & Optics, alongside `wave-speed` and `frequency-period`).
   - `electricity-cost` (`Electricity Cost Calculator`) → Reclassify to **`Everyday`** (alongside `fuel-cost`, and cross-link in `Physics`).
2. **`Converters` (`/categories/converters/`):** Currently displays only **1 tool** (`unit-converter`), while 5 other conversion tools (`number-base-converter`, `color-converter`, `degree-radian`, `data-size-calculator`, `cgpa-percentage`) are scattered across other categories. Cross-listing all 6 converters on `/categories/converters/` eliminates the 1-tool category bottleneck without changing any tool's primary category.
3. **`Physics` (`/categories/physics/`):** Organize the 27+ tools into 6 visual subtopic sections (`Kinematics & Motion`, `Forces & Dynamics`, `Energy, Work & Power`, `Fluids & Thermodynamics`, `Waves & Optics`, `Electricity & Circuits`).

## E. Exact Duplicates

- **Zero slug or title duplicates exist.**
- **One exact mathematical formula sub-output duplicate exists:** [Arc Length Calculator](https://axiomatlas.netlify.app/tools/arc-length/) (`/tools/arc-length/`, `r*pi*deg/180`) computes the exact same formula from the exact same inputs (`r`, `angle` in degrees) as the second output of [Circle Sector Calculator](https://axiomatlas.netlify.app/tools/sector-calculator/) (`/tools/sector-calculator/`, `2*pi*r*angle/360`).

## F. Functional Overlaps

1. **`arc-length` vs. `sector-calculator`:** `arc-length` is a 1-output subset of `sector-calculator`.
2. **`degree-radian` vs. `unit-converter` (Angle):** `degree-radian` is a one-way (`Degrees → Radians, Turns`) subset of `unit-converter`.
3. **`data-size-calculator` vs. `unit-converter` (Data):** `data-size-calculator` is a one-way (`GB → MB, kB, B`) subset of `unit-converter`.
4. **`arithmetic-mean` vs. `statistics-calculator`:** `arithmetic-mean` is a fixed 4-input subset of `statistics-calculator`.
5. **`resistor-series` vs. `resistor-parallel`:** Companion 3-resistor calculators.
6. **`slope-calculator`, `midpoint-calculator`, `distance-between-points`:** All 3 collect the exact same inputs `(x1, y1, x2, y2)`.
7. **`gcd-calculator` vs. `lcm-calculator`:** Companion 2-integer number theory tools.
8. **`speed-calculator` vs. `distance-calculator`:** Algebraic rearrangements of $d = v \cdot t$.

## G. Proposed Calculator Merges (URL-Safe Shared Renderers)

We recommend **5 shared multi-mode upgrades (M-01 to M-05)** that unify overlapping functionality while **keeping all existing `/tools/<slug>/` URLs active** (or optionally 301-redirecting only if you prefer fewer URLs):
- **M-01 (`resistor-series` + `resistor-parallel`):** Unified Series & Parallel Resistor Network Calculator with dynamic resistor count ($2..10$).
- **M-02 (`sector-calculator` + `arc-length`):** Unified Circle Sector, Arc Length, Chord & Segment Calculator with Degrees/Radians toggle.
- **M-03 (`speed-calculator` + `distance-calculator`):** Unified Speed, Distance & Time Calculator with 3-way `Solve for: Speed / Distance / Time` toggle.
- **M-04 (`slope-calculator` + `midpoint-calculator` + `distance-between-points`):** Co-display Slope, Midpoint, 2D Distance, and Line Equation $y = mx + b$ across all 3 pages from the single $(x_1, y_1, x_2, y_2)$ input set.
- **M-05 (`gcd-calculator` + `lcm-calculator`):** Co-display both GCD and LCM (plus Bézout identity and prime factorizations) on both pages for $2+$ integers.

## H. Calculators to Deprecate (Zero Forced Deletions)

- **We recommend ZERO hard deletions without redirect.** Every existing `/tools/<slug>/` URL is already indexed in `site/sitemap.xml` and costs `< 10 KB` of static HTML.
- If you explicitly wish to reduce the catalog count from 136 to 132 by retiring the 4 strictest subsets (`arc-length`, `degree-radian`, `data-size-calculator`, `arithmetic-mean`), they are marked as **`DUPLICATE CANDIDATE`** in the Approval Matrix and must use 301 redirects in `site/_redirects` (`/tools/arc-length/* /tools/sector-calculator/ 301!`, etc.). Otherwise, upgrading them in place is safer for SEO.

## I. Calculators to Improve (92 Calculators Identified)

1. **Critical Bug Fixes & Feature Fulfillments (11 calculators):** `gravitational-force`, `limit-calculator`, `modulo-calculator`, `scientific-calculator`, `trigonometry-calculator`, `prime-checker`, `equation-solver`, `integral-calculator`, `derivative-calculator`, `graphing-calculator`, `nth-root`.
2. **Functional UX & Multi-Input Upgrades (12 calculators):** `expression-simplifier`, `matrix-calculator`, `linear-system`, `number-base-converter`, `color-converter`, `fraction-calculator`, `probability-calculator`, `weighted-average`, `arithmetic-mean`, `geometric-mean`, `degree-radian`, `data-size-calculator`.
3. **Domain Validation & Interactive Unit Selector Rollout (69 formula calculators):** Add physical/mathematical domain constraints (`m > 0`, `T >= 0 K`, `sd > 0`, `h <= s` in `parallelogram-calculator`, integer `people >= 1` in `tip-calculator`, etc.) and interactive unit selectors across Physics, Geometry, Finance, Statistics, Computing, Education, and Everyday tools.

## J. Calculator-Specific UX Problems

1. **Global `/` Key Hijacking (`site/assets/app.js` line 90):** Pressing `/` to type a division sign or fraction inside any calculator opens the global search modal instead of typing `/`!
2. **Parser Rejects Standard Notation (`site/assets/engine.js` lines 4–8):** Typing `√9` throws `Unknown variable: sqrt9`; typing `x(x+1)` throws `Unknown function: x`; typing `sin^2(x)` or `arcsin(x)` or `cot(x)` or `sec(x)` fails.
3. **Destructive Pre-Hydration DOM Overwrite (`site/assets/app.js` line 54):** `form()` overwrites `#calculator-app.innerHTML` after fetching `catalog.json` (63.8 KB), wiping out user focus/input on slow connections.
4. **Inaccessible Inputs in `color-converter` & `number-base-converter`:** `color-converter` lacks text inputs for HEX/RGB/HSL; `number-base-converter` only offers 5 bases instead of 2–36.

## K. Mathematical Input-System Recommendations

Implement a **3-Tier Input Architecture** (detailed in `docs/audits/axiomatlas-ux-and-input-audit.md`):
- **Tier 1 (7 Expression Calculators):** Shared collapsible Math Keypad (`sin`, `cos`, `tan`, `sin⁻¹`, `cos⁻¹`, `tan⁻¹`, `x²`, `√`, `ⁿ√`, `π`, `e`, `ln`, `log`, `|x|`), Live Rendered Math Preview bar (explicitly distinguishing $\sin^{-1}(x)$, $\csc(x) = 1/\sin(x)$, $\sin^2(x) = (\sin x)^2$, and $\sin(x^2)$), and parser upgrades for `√9`, `x(x+1)`, `sec/csc/cot`, `asinh/acosh/atanh`.
- **Tier 2 (18 Grid/List Calculators):** State-preserving matrix grids with 2D bracketed output tables, dynamic `+ Add row` inputs for averages/resistors, and bidirectional text inputs for colors/fractions/bases.
- **Tier 3 (111 Formula Calculators):** Keep fast numeric inputs, upgraded with interactive `.unit-pill` dropdowns wired to `unitGroups` in `engine.js`.

## L. Explain Calculation Readiness Summary

- **113 Calculators (83.1%):** **Ready with existing logic** via a single 60-line `traceCalculate()` AST walker in `site/assets/engine.js`.
- **7 Calculators (5.1%):** **Minor changes required** in `site/assets/app.js`.
- **6 Calculators (4.4%):** **Major calculation-engine changes required** (instrumenting `gaussian`, `matrixOp`, `solveRoots`, `integrate`, `descriptive`, `regression`).
- **7 Calculators (5.1%):** **Manual implementation required** (`quadratic`, `fraction`, `prime`, `base`, `converter`, `dates`, `age`).
- **3 Calculators (2.2%):** **Not suitable for step-by-step explanation** (`graphing-calculator`, `random-number-generator`, `color-converter`).

## M. Mathematical Accuracy Issues (18 Verified Bugs)

All 18 reproducible bugs are documented with exact inputs and fixes in `docs/audits/axiomatlas-mathematical-quality-audit.md`, led by:
- **BUG-01 (Critical):** `engine.js` line 15 (`Math.abs(v)<1e-13?0:v`) zeroes out all results $< 10^{-13}$ (breaking `gravitational-force` and small powers).
- **BUG-02 (Critical):** `limit-calculator` averages `left` and `right` without checking agreement (`1/x` and `abs(x)/x` at `x=0` output `Estimated common limit: 0`).
- **BUG-03 (High):** `modulo-calculator` pairs Euclidean `mod(a,b)` with `floor(a/b)`, violating $a = qb + r$ for all negative divisors $b < 0$.
- **BUG-04 & BUG-05 (High):** `x(x+1)` throws `Unknown function: x` and `√9` throws `Unknown variable: sqrt9`.
- **BUG-06 & BUG-07 (High):** `tan(90°)` in `scientific-calculator` outputs `1.633e16`; `trigonometry-calculator` outputs `6.123e-17` for `cos(90°)` and omits `cot θ` and inverse trig.
- **BUG-08 (High):** `prime-checker` never lists factors despite its description promising `"list its small factors"`.
- **BUG-09 & BUG-10 (High):** `solveRoots` misses off-grid even-multiplicity roots like `(x-2.003)^2=0`; `integrate` returns finite numbers on divergent improper integrals like `1/x^2` on `[-1, 1.001]`.

## N. Advanced Calculator Recommendations (16 High-Value Additions)

Prioritized in `docs/audits/axiomatlas-advanced-calculator-roadmap.md`:
- **P0 Core Additions (7):** `Complex Number Calculator`, `Error Propagation & Uncertainty Calculator`, `Polynomial Roots, Factoring & Division Calculator`, `ODE Initial-Value Solver (RK4 + Slope Field)`, `Complete Triangle Solver (SSS/SAS/ASA/AAS/SSA)`, `Complete SUVAT 1D & 2D Projectile Kinematics Solver`, `Matrix Eigenvalue, Eigenvector, Rank & RREF Calculator`, `Probability Distributions & Hypothesis Testing Calculator`, `NPV, IRR & XIRR Cash-Flow Valuation Calculator`.
- **P1 Additions (7):** `Modular Congruence & CRT Solver`, `Partial Fraction Decomposition Calculator`, `Taylor Series & Multivariable Gradient Calculator`, `AC RLC Circuit Impedance & Resonance Calculator`, `Loan Amortization & Prepayment Schedule Calculator`, `Bitwise, Two's Complement & IEEE-754 Float Calculator`, `IPv4 / CIDR Subnet Calculator`.

## O. Search and Discovery Improvements

1. Fix global `/` key hijack when typing in inputs (`ID: SYS-01`).
2. Index `formula`, `slug`, and domain synonyms in `searchSetup()`, and implement `ArrowUp`/`ArrowDown`/`Enter` keyboard navigation in `#search-modal` (`ID: SYS-02`).
3. Replace `.slice(0, 5)` in `#related-tools` with subtopic-matched related calculators (`ID: SYS-03`).
4. Fix topbar breadcrumb (`header-crumb`) in `source/build.py` to use actual tool/category `title` instead of `path.split('/')[-2]` (`ID: SYS-04`).

## P. Website Accessibility and Responsiveness Issues

1. Fix Light Mode WCAG 2.1 AA contrast failures in `site/assets/styles.css` (`--muted: #5b6078`, `#result-status: #1f7a5c`, `.side-section-title`, `.side-link small`) (`ID: SYS-05`).
2. Add `@media (prefers-reduced-motion: reduce)` and modal focus trapping (`ID: SYS-06`).
3. Increase `.result-copy` touch target to `36×36px` and add horizontal scroll wrapper on 3×3/4×4 matrix rows for `<390px` screens (`ID: SYS-07`).

## Q. SEO, Privacy, and Performance Improvements

1. Resolve the **AdSense vs. Privacy Policy contradiction** (`build.py` loads `adsbygoogle.js` on all 155 pages while `/privacy/` states `"We do not currently display ads"`) (`ID: SYS-08`).
2. Fix `"url": null` in `site/index.html` JSON-LD by setting default `SITE_URL = "https://axiomatlas.netlify.app"` in `source/build.py` and `scripts/rebuild.py`, and set `noindex` on `404.html` (`ID: SYS-09`).
3. Eliminate redundant `catalog.json` critical-path blocking and DOM overwrite on tool pages by pre-rendering interactive attributes (`data-field`, `.unit-pill`) and worked examples in `source/build.py` (`ID: SYS-10`).
4. Add `package.json` (`"type": "module"`) so `node source/test_formulas.mjs` runs cleanly (`ID: SYS-11`).

## R. Zero-Budget Architecture Recommendations

All improvements and new calculators run **100% client-side in native ES modules** (`engine.js`, `app.js`, and an on-demand `advanced.js` module) with **zero backend servers, zero paid APIs, and zero npm runtime dependencies**, plus an optional 35-line `sw.js` Service Worker for full offline PWA support (`ID: SYS-12`).

## S. Prioritized Implementation Roadmap (Phases 0–7)

- **PHASE 0 (Current — Completed):** Complete read-only repository inspection, mathematical verification, and 7-document master audit. **Stop and wait for explicit approval.**
- **PHASE 1 — Critical Bug Fixes, Category Cleanup & Calculator Consolidation:** Fix `BUG-01` through `BUG-18`, fix `/` shortcut hijack, reclassify the 4 misplaced `Computing` tools, and implement approved shared multi-mode calculators (`M-01`–`M-05`).
- **PHASE 2 — Calculator Input UX, Interactive Units & Mathematical Editor:** Roll out the 3-tier input system, parser syntax improvements (`√9`, `x(x+1)`, `sec/csc/cot`, `sin^2(x)`), live math preview, and interactive unit selectors across all formula tools.
- **PHASE 3 — `Explain Calculation` Engine & Integration:** Add `traceCalculate()` to `engine.js`, build the accessible `#explain-drawer` UI, and enable deterministic step-by-step explanations across 133 calculators.
- **PHASE 4 — Approved Advanced Calculator Additions:** Implement approved P0 and P1 advanced calculators (`ADV-01` through `ADV-16`).
- **PHASE 5 — Mathematical Accuracy, Benchmark & Regression Verification:** Fix `package.json` ESM config and implement the 5-layer automated test and NIST benchmark suite (`900+` assertions).
- **PHASE 6 — Navigation, Discovery, Accessibility & SEO Upgrades:** Upgrade search indexing, topic-clustered related tools, WCAG AA contrast colors, static SEO content enrichment, JSON-LD fix, and AdSense/Privacy alignment.
- **PHASE 7 — Final Product Verification & Release Preparation:** Full cross-browser, mobile viewport, Lighthouse (Performance/A11y/SEO $\ge 98$), and regression sign-off before deployment approval.

## T. Individual Approval Matrix (Section 13)

Every category, existing calculator, system/engine fix, and proposed new calculator is listed with a unique ID so you can approve, reject, or modify any item individually (`KEEP`, `REMOVE`, `MERGE`, `RECLASSIFY`, `IMPROVE`, `ADD`, `DEFER`).

### T.1 Category Architecture Decisions (`CAT-01` to `CAT-14`)

| ID | Existing item | Proposed action | Reason | Priority | Risk | My decision |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CAT-01** | Category: `Math & numbers` (21 tools) | **KEEP** | High-traffic core category; add visual subtopic filter pills on category page | P1 | Low | |
| **CAT-02** | Category: `Algebra` (12 tools) | **KEEP** | Cohesive algebra collection; cross-link 2D coordinate tools with Geometry | P1 | Low | |
| **CAT-03** | Category: `Graphing & calculus` (4 tools) | **KEEP** | Core STEM category; expand with ODE Solver and Taylor/Gradient tools | P0 | Low | |
| **CAT-04** | Category: `Geometry` (18 tools) | **KEEP** | Strong 2D/3D shape collection; visually group 2D Plane vs 3D Solids | P1 | Low | |
| **CAT-05** | Category: `Trigonometry` (5 tools) | **KEEP** | Core STEM category; expand with Complete Triangle Solver | P0 | Low | |
| **CAT-06** | Category: `Physics` (27 tools) | **KEEP** | Largest category; organize into 6 subtopic sections and absorb 3 physics tools from Computing | P0 | Low | |
| **CAT-07** | Category: `Linear algebra` (2 tools) | **KEEP** | Core STEM category; cross-link `linear-system` and add Eigenvalues/RREF calculator | P0 | Low | |
| **CAT-08** | Category: `Statistics` (7 tools) | **KEEP** | Core STEM category; cross-link means/combinatorics and add Hypothesis Testing | P0 | Low | |
| **CAT-09** | Category: `Finance` (15 tools) | **KEEP** | Strong financial suite; add NPV/IRR and Loan Prepayment calculators | P0 | Low | |
| **CAT-10** | Category: `Converters` (1 tool) | **IMPROVE** | Currently shows only 1 tool (`unit-converter`); cross-list all 6 converter tools on `/categories/converters/` | P1 | Low | |
| **CAT-11** | Category: `Computing` (11 tools) | **IMPROVE** | Move 4 misclassified physics/utility tools to Physics/Everyday; add Bitwise/IEEE-754 & Subnet tools | P1 | Low | |
| **CAT-12** | Category: `Education` (5 tools) | **KEEP** | Cohesive student utility category | P2 | Low | |
| **CAT-13** | Category: `Date & time` (2 tools) | **KEEP** | High-utility calendar arithmetic category | P2 | Low | |
| **CAT-14** | Category: `Everyday` (6 tools) | **KEEP** | Practical daily tools; absorb `electricity-cost` from Computing | P2 | Low | |

### T.2 Existing Calculators Decisions (`CALC-001` to `CALC-136`)

| ID | Existing item | Proposed action | Reason | Priority | Risk | My decision |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CALC-001** | `scientific-calculator` (Scientific Calculator — Math & numbers) | **IMPROVE** | Fix <1e-13 zero-clamping in engine.js, fix √ without parens, fix % key UX, fix tan(90°), add inverse trig keys | P0 | Low | |
| **CALC-002** | `equation-solver` (Equation Solver — Algebra) | **IMPROVE** | Add derivative/secant root detection for even-multiplicity roots like (x-2.003)^2=0 and fix x(x+1) implicit mul | P0 | Low | |
| **CALC-003** | `quadratic-equation` (Quadratic Equation Solver — Algebra) | **KEEP** | Numerically stable Citardauq implementation with complex roots; optionally add vertex & axis of symmetry outputs | P2 | Low | |
| **CALC-004** | `linear-system` (Simultaneous Equation Solver — Algebra) | **IMPROVE** | Distinguish 'No solution' vs 'Infinitely many solutions' when matrix is singular; cross-list in Linear algebra | P1 | Low | |
| **CALC-005** | `expression-simplifier` (Expression Evaluator — Algebra) | **IMPROVE** | Support multi-variable substitution (x, y, z, a, b) to match description, or rename title/description clearly | P1 | Low | |
| **CALC-006** | `graphing-calculator` (Function Graphing Calculator — Graphing & calculus) | **IMPROVE** | Do not fail result card when f(0) is undefined (e.g. 1/x); add mobile touch pinch-zoom and hover coordinates | P0 | Low | |
| **CALC-007** | `derivative-calculator` (Derivative Calculator — Graphing & calculus) | **IMPROVE** | Add tangent line canvas plot promised in description and detect non-differentiable corners (e.g. abs(x) at x=0) | P0 | Low | |
| **CALC-008** | `integral-calculator` (Definite Integral Calculator — Graphing & calculus) | **IMPROVE** | Add singularity/NaN subinterval check so divergent integrals like 1/x^2 on [-1, 1.001] do not return bogus finite sums | P0 | Low | |
| **CALC-009** | `limit-calculator` (Numerical Limit Calculator — Graphing & calculus) | **IMPROVE** | CRITICAL: Check |left - right| convergence across decreasing h steps instead of outputting (left+right)/2 when limit DNE | P0 | Low | |
| **CALC-010** | `matrix-calculator` (Matrix Calculator — Linear algebra) | **IMPROVE** | Render result matrix as a 2D visual grid instead of flat pipe-separated text; preserve cell values on size/op change | P1 | Low | |
| **CALC-011** | `statistics-calculator` (Statistics Calculator — Statistics) | **IMPROVE** | Add IQR, geometric/harmonic mean, and guard against thousand-separator comma misparsing | P1 | Low | |
| **CALC-012** | `correlation-calculator` (Correlation & Regression — Statistics) | **IMPROVE** | Add scatter plot with regression line preview and standard error of estimate | P1 | Low | |
| **CALC-013** | `probability-calculator` (Binomial Probability — Statistics) | **IMPROVE** | Add cumulative probabilities P(X <= k), P(X < k), P(X >= k), P(X > k) alongside exact P(X = k) | P1 | Low | |
| **CALC-014** | `unit-converter` (Universal Unit Converter — Converters) | **IMPROVE** | Show multi-unit conversion overview table alongside primary target unit | P1 | Low | |
| **CALC-015** | `number-base-converter` (Number Base Converter — Computing) | **IMPROVE** | Allow all bases 2–36 in dropdown (as promised in description) instead of only 2, 8, 10, 16, 36 | P1 | Low | |
| **CALC-016** | `fraction-calculator` (Fraction Calculator — Math & numbers) | **IMPROVE** | Support mixed-number input/output (e.g. 1 3/4) and safe BigInt-to-decimal scaling for >308-digit fractions | P1 | Low | |
| **CALC-017** | `prime-checker` (Prime Number Checker — Math & numbers) | **IMPROVE** | CRITICAL: Implement prime factorization & divisor listing promised in description ('list its small factors') | P0 | Low | |
| **CALC-018** | `date-difference` (Date Difference Calculator — Date & time) | **KEEP** | Clean UTC day/week calculation; optionally add Y/M/D breakdown and business days | P2 | Low | |
| **CALC-019** | `age-calculator` (Age Calculator — Date & time) | **KEEP** | Accurate UTC calendar month/leap-year calculation | P2 | Low | |
| **CALC-020** | `random-number-generator` (Random Number Generator — Math & numbers) | **IMPROVE** | Allow generating N numbers at once with optional 'no duplicates' toggle | P1 | Low | |
| **CALC-021** | `trigonometry-calculator` (Trigonometry Calculator — Trigonometry) | **IMPROVE** | CRITICAL: Add cot θ and inverse trig (arcsin, arccos, arctan) promised in description; snap cos(90°)/sin(180°) to 0 | P0 | Low | |
| **CALC-022** | `vector-calculator` (Vector Calculator — Linear algebra) | **IMPROVE** | Handle zero vectors gracefully for dot/cross/magnitude before angle division; add unit vectors | P1 | Low | |
| **CALC-023** | `color-converter` (HEX / RGB Color Converter — Computing) | **IMPROVE** | Add editable text inputs for HEX, RGB, and HSL in addition to native <input type='color'> picker | P1 | Low | |
| **CALC-024** | `percentage-calculator` (Percentage Calculator — Math & numbers) | **IMPROVE** | Add modes for 'X is what % of Y?' and 'X is Y% of what?' alongside 'X% of Y' | P1 | Low | |
| **CALC-025** | `percent-change` (Percentage Change Calculator — Math & numbers) | **IMPROVE** | Validate old != 0 with clear error message | P1 | Low | |
| **CALC-026** | `percent-difference` (Percentage Difference Calculator — Math & numbers) | **IMPROVE** | Validate !(a == 0 && b == 0) with clear error message | P1 | Low | |
| **CALC-027** | `ratio-calculator` (Ratio Calculator — Math & numbers) | **IMPROVE** | Add simplified integer ratio (A/gcd : B/gcd) output and validate a+b != 0 | P1 | Low | |
| **CALC-028** | `proportion-calculator` (Proportion Calculator — Math & numbers) | **IMPROVE** | Allow solving for any of the 4 terms (a, b, c, or x) in a/b = c/x | P1 | Low | |
| **CALC-029** | `weighted-average` (Weighted Average Calculator — Math & numbers) | **IMPROVE** | Allow dynamic rows (2 to 20 items) instead of hardcoded 3 items; validate sum of weights > 0 | P1 | Low | |
| **CALC-030** | `nth-root` (Nth Root Calculator — Math & numbers) | **IMPROVE** | Support real odd roots of negative numbers (e.g. (-8)^(1/3) = -2) instead of throwing NaN error | P0 | Low | |
| **CALC-031** | `power-calculator` (Power & Exponent Calculator — Math & numbers) | **IMPROVE** | Fix engine.js <1e-13 zero-clamping so 10^-14 evaluates to 1e-14 instead of 0 | P1 | Low | |
| **CALC-032** | `logarithm-calculator` (Logarithm Calculator — Math & numbers) | **KEEP** | Well-validated (x>0, b>0, b!=1); add quick base preset buttons (e, 2, 10) | P2 | Low | |
| **CALC-033** | `factorial-calculator` (Factorial Calculator — Math & numbers) | **KEEP** | Well-validated (0..170); optionally support n > 170 via BigInt | P2 | Low | |
| **CALC-034** | `permutation-calculator` (Permutation Calculator — Math & numbers) | **KEEP** | Well-validated (0<=r<=n<=170); cross-link with combination-calculator | P2 | Low | |
| **CALC-035** | `combination-calculator` (Combination Calculator — Math & numbers) | **KEEP** | Well-validated (0<=r<=n<=1024); cross-link with permutation-calculator | P2 | Low | |
| **CALC-036** | `gcd-calculator` (GCD Calculator — Math & numbers) | **MERGE** | Co-display both GCD and LCM (and support 2+ integers) while keeping /tools/gcd-calculator/ URL active | P1 | Low | |
| **CALC-037** | `lcm-calculator` (LCM Calculator — Math & numbers) | **MERGE** | Co-display both LCM and GCD (and validate a=0, b=0) while keeping /tools/lcm-calculator/ URL active | P1 | Low | |
| **CALC-038** | `modulo-calculator` (Modulo Calculator — Math & numbers) | **IMPROVE** | CRITICAL: Fix quotient/remainder mismatch for negative divisors (floor(a/b) vs Euclidean mod(a,b)) | P0 | Low | |
| **CALC-039** | `arithmetic-mean` (Arithmetic Mean Calculator — Math & numbers) | **MERGE** | Hardcoded 4-number subset of statistics-calculator; upgrade to dynamic list or merge/redirect to statistics-calculator | P1 | Low | |
| **CALC-040** | `geometric-mean` (Geometric Mean Calculator — Math & numbers) | **IMPROVE** | Upgrade from hardcoded 3 inputs to dynamic comma-separated list or dynamic rows | P1 | Low | |
| **CALC-041** | `linear-equation` (Linear Equation Calculator — Algebra) | **IMPROVE** | Handle a = 0 gracefully ('Infinite solutions' if b=c, 'No solution' if b!=c) | P1 | Low | |
| **CALC-042** | `polynomial-evaluation` (Polynomial Value Calculator — Algebra) | **IMPROVE** | Allow arbitrary-degree polynomial coefficients or Horner evaluation | P1 | Low | |
| **CALC-043** | `arithmetic-sequence` (Arithmetic Sequence Calculator — Algebra) | **KEEP** | Well-validated (integer n >= 1) | P2 | Low | |
| **CALC-044** | `geometric-sequence` (Geometric Sequence Calculator — Algebra) | **KEEP** | Well-validated (integer n >= 1 and r=1 fallback); optionally add infinite sum for |r|<1 | P2 | Low | |
| **CALC-045** | `slope-calculator` (Slope Calculator — Algebra) | **MERGE** | Co-display Slope, Midpoint, Distance, and Line Equation for (x1,y1,x2,y2) and handle vertical line x1=x2 cleanly | P1 | Low | |
| **CALC-046** | `midpoint-calculator` (Midpoint Calculator — Algebra) | **MERGE** | Co-display Midpoint, Distance, and Slope for (x1,y1,x2,y2) while keeping URL active | P1 | Low | |
| **CALC-047** | `distance-between-points` (2D Distance Calculator — Algebra) | **MERGE** | Co-display Distance, Midpoint, and Slope for (x1,y1,x2,y2) and cross-list in Geometry | P1 | Low | |
| **CALC-048** | `exponential-growth` (Exponential Growth Calculator — Algebra) | **IMPROVE** | Add continuous (Pe^(rt)) vs discrete (P(1+r)^t) toggle | P1 | Low | |
| **CALC-049** | `rectangle-calculator` (Rectangle Calculator — Geometry) | **IMPROVE** | Keep route active; add interactive unit selector and Explain Calculation trace support | P1 | Low | |
| **CALC-050** | `square-calculator` (Square Calculator — Geometry) | **IMPROVE** | Keep route active; add interactive unit selector and Explain Calculation trace support | P1 | Low | |
| **CALC-051** | `triangle-calculator` (Triangle Area Calculator — Geometry) | **IMPROVE** | Keep route active; add interactive unit selector and Explain Calculation trace support | P1 | Low | |
| **CALC-052** | `herons-formula` (Heron’s Formula Calculator — Geometry) | **IMPROVE** | Keep route active; add interactive unit selector and Explain Calculation trace support | P1 | Low | |
| **CALC-053** | `circle-calculator` (Circle Calculator — Geometry) | **IMPROVE** | Keep route active; add interactive unit selector and Explain Calculation trace support | P1 | Low | |
| **CALC-054** | `ellipse-calculator` (Ellipse Calculator — Geometry) | **IMPROVE** | Keep route active; add interactive unit selector and Explain Calculation trace support | P1 | Low | |
| **CALC-055** | `trapezoid-calculator` (Trapezoid Area Calculator — Geometry) | **IMPROVE** | Keep route active; add interactive unit selector and Explain Calculation trace support | P1 | Low | |
| **CALC-056** | `parallelogram-calculator` (Parallelogram Area Calculator — Geometry) | **IMPROVE** | Validate geometric constraint h <= s (altitude cannot exceed slant side length) | P1 | Low | |
| **CALC-057** | `sector-calculator` (Circle Sector Calculator — Geometry) | **MERGE** | Combine with arc-length to include degrees/radians toggle, chord length, and segment area | P1 | Low | |
| **CALC-058** | `pythagorean-calculator` (Pythagorean Theorem Calculator — Geometry) | **IMPROVE** | Allow solving for missing leg a or b in addition to hypotenuse c | P1 | Low | |
| **CALC-059** | `cube-calculator` (Cube Calculator — Geometry) | **IMPROVE** | Keep route active; add interactive unit selector and Explain Calculation trace support | P1 | Low | |
| **CALC-060** | `cuboid-calculator` (Rectangular Prism Calculator — Geometry) | **IMPROVE** | Keep route active; add interactive unit selector and Explain Calculation trace support | P1 | Low | |
| **CALC-061** | `sphere-calculator` (Sphere Calculator — Geometry) | **IMPROVE** | Keep route active; add interactive unit selector and Explain Calculation trace support | P1 | Low | |
| **CALC-062** | `cylinder-calculator` (Cylinder Calculator — Geometry) | **IMPROVE** | Keep route active; add interactive unit selector and Explain Calculation trace support | P1 | Low | |
| **CALC-063** | `cone-calculator` (Cone Calculator — Geometry) | **IMPROVE** | Keep route active; add interactive unit selector and Explain Calculation trace support | P1 | Low | |
| **CALC-064** | `pyramid-calculator` (Square Pyramid Calculator — Geometry) | **IMPROVE** | Keep route active; add interactive unit selector and Explain Calculation trace support | P1 | Low | |
| **CALC-065** | `torus-calculator` (Torus Calculator — Geometry) | **IMPROVE** | Keep route active; add interactive unit selector and Explain Calculation trace support | P1 | Low | |
| **CALC-066** | `regular-polygon` (Regular Polygon Calculator — Geometry) | **IMPROVE** | Keep route active; add interactive unit selector and Explain Calculation trace support | P1 | Low | |
| **CALC-067** | `degree-radian` (Degree to Radian Converter — Trigonometry) | **MERGE** | One-way subset of unit-converter (Angle); upgrade to bidirectional Degrees <-> Radians/DMS/Turns | P1 | Low | |
| **CALC-068** | `arc-length` (Arc Length Calculator — Trigonometry) | **MERGE** | Strict 1-output subset of sector-calculator; share unified Sector & Arc Length renderer | P1 | Low | |
| **CALC-069** | `law-of-cosines` (Law of Cosines Calculator — Trigonometry) | **IMPROVE** | Validate a,b > 0 and 0 < C < 180°; add mode to solve for unknown angle C given sides (a, b, c) | P1 | Low | |
| **CALC-070** | `law-of-sines` (Law of Sines Calculator — Trigonometry) | **IMPROVE** | Validate a > 0; add mode to solve for unknown angle B given (a, b, A) including ambiguous SSA case | P1 | Low | |
| **CALC-071** | `speed-calculator` (Speed Calculator — Physics) | **MERGE** | Add Solve-for (Speed / Distance / Time) toggle and validate t > 0, d >= 0 | P1 | Low | |
| **CALC-072** | `distance-calculator` (Distance Calculator — Physics) | **MERGE** | Share Solve-for (Distance / Speed / Time) component with speed-calculator and validate t >= 0 | P1 | Low | |
| **CALC-073** | `acceleration-calculator` (Acceleration Calculator — Physics) | **IMPROVE** | Validate elapsed time t > 0 | P1 | Low | |
| **CALC-074** | `displacement-calculator` (Displacement Calculator — Physics) | **IMPROVE** | Validate time t >= 0 | P1 | Low | |
| **CALC-075** | `force-calculator` (Force Calculator — Physics) | **IMPROVE** | Validate mass m > 0 | P1 | Low | |
| **CALC-076** | `work-calculator` (Work Calculator — Physics) | **IMPROVE** | Validate distance d >= 0 | P1 | Low | |
| **CALC-077** | `kinetic-energy` (Kinetic Energy Calculator — Physics) | **IMPROVE** | Validate mass m > 0 | P1 | Low | |
| **CALC-078** | `potential-energy` (Gravitational Potential Energy — Physics) | **IMPROVE** | Validate mass m > 0 and gravity g >= 0 | P1 | Low | |
| **CALC-079** | `momentum-calculator` (Momentum Calculator — Physics) | **IMPROVE** | Validate mass m > 0 | P1 | Low | |
| **CALC-080** | `density-calculator` (Density Calculator — Physics) | **IMPROVE** | Validate mass m > 0 and volume V > 0; add Solve-for (Density / Mass / Volume) toggle | P1 | Low | |
| **CALC-081** | `pressure-calculator` (Pressure Calculator — Physics) | **IMPROVE** | Validate area A > 0; add Solve-for (Pressure / Force / Area) toggle | P1 | Low | |
| **CALC-082** | `mechanical-power` (Power Calculator — Physics) | **IMPROVE** | Validate time t > 0 | P1 | Low | |
| **CALC-083** | `ohms-law` (Ohm’s Law Calculator — Physics) | **IMPROVE** | Validate R > 0; allow entering any 2 of (V, I, R, P) to solve for the other 2 | P1 | Low | |
| **CALC-084** | `electrical-power` (Electrical Power Calculator — Physics) | **IMPROVE** | Validate t >= 0 | P1 | Low | |
| **CALC-085** | `wave-speed` (Wave Speed Calculator — Physics) | **IMPROVE** | Validate f > 0 and wavelength l > 0 | P1 | Low | |
| **CALC-086** | `frequency-period` (Frequency & Period Calculator — Physics) | **IMPROVE** | Validate frequency f > 0 | P1 | Low | |
| **CALC-087** | `pendulum-period` (Simple Pendulum Calculator — Physics) | **IMPROVE** | Validate length L > 0 and gravity g > 0 | P1 | Low | |
| **CALC-088** | `projectile-range` (Projectile Motion Calculator — Physics) | **IMPROVE** | Validate v >= 0, g > 0, 0 <= angle <= 180°; optionally add initial height h0 | P1 | Low | |
| **CALC-089** | `gravitational-force` (Universal Gravitation Calculator — Physics) | **IMPROVE** | CRITICAL: Remove <1e-13 zero-clamping in engine.js so small gravitational forces are not zeroed out; validate m1,m2,r > 0 | P0 | Low | |
| **CALC-090** | `heat-energy` (Heat Energy Calculator — Physics) | **IMPROVE** | Validate mass m > 0 and specific heat c > 0 | P1 | Low | |
| **CALC-091** | `ideal-gas` (Ideal Gas Law Calculator — Physics) | **IMPROVE** | Validate moles n >= 0, absolute temperature T >= 0 K, and volume V > 0; add Solve-for (P, V, n, T) | P1 | Low | |
| **CALC-092** | `buoyant-force` (Buoyant Force Calculator — Physics) | **IMPROVE** | Validate fluid density rho >= 0, displaced volume V >= 0, and g >= 0 | P1 | Low | |
| **CALC-093** | `torque-calculator` (Torque Calculator — Physics) | **IMPROVE** | Validate lever arm r >= 0 | P1 | Low | |
| **CALC-094** | `spring-force` (Hooke’s Law Calculator — Physics) | **IMPROVE** | Validate spring constant k > 0 | P1 | Low | |
| **CALC-095** | `centripetal-force` (Centripetal Force Calculator — Physics) | **IMPROVE** | Validate mass m > 0 and radius r > 0 | P1 | Low | |
| **CALC-096** | `snells-law` (Snell’s Law Calculator — Physics) | **IMPROVE** | Validate n1 >= 1, n2 >= 1; report 'Total Internal Reflection' with critical angle when n1*sin(θ1)/n2 > 1 | P1 | Low | |
| **CALC-097** | `thin-lens` (Thin Lens Equation Calculator — Physics) | **IMPROVE** | Report 'Image at infinity' cleanly when object distance o equals focal length f | P1 | Low | |
| **CALC-098** | `z-score` (Z-Score Calculator — Statistics) | **IMPROVE** | Validate standard deviation sd > 0 | P1 | Low | |
| **CALC-099** | `standard-error` (Standard Error Calculator — Statistics) | **IMPROVE** | Validate sd >= 0 and integer sample size n >= 1 | P1 | Low | |
| **CALC-100** | `confidence-interval` (95% Confidence Interval Calculator — Statistics) | **IMPROVE** | Validate sd >= 0 and integer n >= 2; add confidence level selector (90%, 95%, 99%) | P1 | Low | |
| **CALC-101** | `probability-calculator-basic` (Basic Probability Calculator — Statistics) | **IMPROVE** | Handle p = 1 cleanly (Complement = 0, Odds = Infinity / Undefined) | P1 | Low | |
| **CALC-102** | `simple-interest` (Simple Interest Calculator — Finance) | **IMPROVE** | Validate principal p >= 0 and time t >= 0 | P1 | Low | |
| **CALC-103** | `compound-interest` (Compound Interest Calculator — Finance) | **IMPROVE** | Add compounding frequency dropdown preset (Monthly, Quarterly, Yearly, Daily, Continuous) | P1 | Low | |
| **CALC-104** | `emi-calculator` (Loan EMI Calculator — Finance) | **KEEP** | Well-validated with r=0 fallback; candidate for Amortization Schedule & Prepayment expansion | P2 | Low | |
| **CALC-105** | `sip-calculator` (SIP Investment Calculator — Finance) | **KEEP** | Well-validated with r=0 fallback; add Beginning-of-Month vs End-of-Month toggle | P2 | Low | |
| **CALC-106** | `roi-calculator` (ROI Calculator — Finance) | **IMPROVE** | Validate initial cost > 0 | P1 | Low | |
| **CALC-107** | `cagr-calculator` (CAGR Calculator — Finance) | **IMPROVE** | Validate initial > 0, final >= 0, years > 0 | P1 | Low | |
| **CALC-108** | `discount-calculator` (Discount Calculator — Finance) | **IMPROVE** | Validate price >= 0 and 0 <= discount <= 100 | P1 | Low | |
| **CALC-109** | `tax-calculator` (GST / Sales Tax Calculator — Finance) | **IMPROVE** | Validate price >= 0; add Tax-Exclusive vs Tax-Inclusive mode toggle | P1 | Low | |
| **CALC-110** | `profit-margin` (Profit Margin Calculator — Finance) | **IMPROVE** | Validate cost > 0 and sell > 0 | P1 | Low | |
| **CALC-111** | `break-even` (Break-Even Calculator — Finance) | **KEEP** | Well-validated (price > variable); validate fixed >= 0 | P2 | Low | |
| **CALC-112** | `inflation-calculator` (Inflation Calculator — Finance) | **IMPROVE** | Validate price >= 0 and years >= 0 | P1 | Low | |
| **CALC-113** | `present-value` (Present Value Calculator — Finance) | **IMPROVE** | Validate years >= 0 and r > -100% | P1 | Low | |
| **CALC-114** | `future-value-annuity` (Future Value of Annuity — Finance) | **KEEP** | Well-validated with r=0 fallback | P2 | Low | |
| **CALC-115** | `rule-of-72` (Rule of 72 Calculator — Finance) | **IMPROVE** | Validate r > 0 and show exact logarithmic doubling time alongside Rule of 72 estimate | P1 | Low | |
| **CALC-116** | `tip-calculator` (Tip & Bill Split Calculator — Finance) | **IMPROVE** | Validate bill >= 0, tip >= 0, and integer people >= 1 | P1 | Low | |
| **CALC-117** | `attendance-calculator` (Attendance Calculator — Education) | **KEEP** | Well-validated; add 'Classes you can skip' output when current attendance >= target | P2 | Low | |
| **CALC-118** | `cgpa-percentage` (CGPA to Percentage Calculator — Education) | **IMPROVE** | Validate cgpa >= 0 and factor > 0; add common university scale presets (9.5, 10.0) | P1 | Low | |
| **CALC-119** | `grade-percentage` (Marks Percentage Calculator — Education) | **KEEP** | Well-validated (0 <= obtained <= maxmarks); high student search value | P2 | Low | |
| **CALC-120** | `target-grade` (Target Exam Score Calculator — Education) | **IMPROVE** | Validate 0 <= completed weight < 100% | P1 | Low | |
| **CALC-121** | `study-time-calculator` (Study Time Calculator — Education) | **IMPROVE** | Validate minutes > 0, days > 0, weeks > 0 | P1 | Low | |
| **CALC-122** | `download-time` (Download Time Calculator — Computing) | **IMPROVE** | Validate file size >= 0 and speed > 0; add KB/MB/GB/TB and Mbps/Gbps unit selectors | P1 | Low | |
| **CALC-123** | `data-size-calculator` (Data Storage Calculator — Computing) | **MERGE** | One-way GB-only subset of unit-converter (Data); upgrade to bidirectional SI (kB/MB/GB/TB) + binary IEC (KiB/MiB/GiB/TiB) table | P1 | Low | |
| **CALC-124** | `pixel-density` (PPI Calculator — Computing) | **IMPROVE** | Validate w > 0, h > 0, diagonal d > 0 | P1 | Low | |
| **CALC-125** | `aspect-ratio` (Aspect Ratio Calculator — Computing) | **IMPROVE** | Validate w > 0, h > 0 and output simplified integer ratio (e.g. 16:9) via GCD | P1 | Low | |
| **CALC-126** | `electricity-cost` (Electricity Cost Calculator — Computing) | **RECLASSIFY** | Reclassify from Computing to Everyday (or Physics) and validate non-negative inputs | P1 | Low | |
| **CALC-127** | `resistor-series` (Series Resistors Calculator — Computing) | **RECLASSIFY** | Reclassify from Computing to Physics and merge/share renderer with resistor-parallel (validate R >= 0) | P1 | Low | |
| **CALC-128** | `resistor-parallel` (Parallel Resistors Calculator — Computing) | **RECLASSIFY** | Reclassify from Computing to Physics and merge/share renderer with resistor-series (validate R > 0) | P1 | Low | |
| **CALC-129** | `frequency-wavelength` (Frequency to Wavelength — Computing) | **RECLASSIFY** | Reclassify from Computing to Physics (alongside wave-speed) and validate f > 0 | P1 | Low | |
| **CALC-130** | `compression-ratio` (Compression Ratio Calculator — Computing) | **IMPROVE** | Validate original > 0 and compressed >= 0 | P1 | Low | |
| **CALC-131** | `fuel-cost` (Fuel Cost Calculator — Everyday) | **IMPROVE** | Validate distance >= 0, efficiency > 0, price >= 0 | P1 | Low | |
| **CALC-132** | `bmi-calculator` (BMI Calculator — Everyday) | **IMPROVE** | Validate kg > 0, cm > 0; add WHO category label and Imperial (lb, ft/in) unit option | P1 | Low | |
| **CALC-133** | `recipe-scaler` (Recipe Scaling Calculator — Everyday) | **IMPROVE** | Validate q > 0, old > 0, new > 0 | P1 | Low | |
| **CALC-134** | `pace-calculator` (Running Pace Calculator — Everyday) | **IMPROVE** | Validate distance > 0, minutes > 0; clean up dead ternary in source/make_catalog.py line 154 | P1 | Low | |
| **CALC-135** | `paint-coverage` (Paint Coverage Calculator — Everyday) | **IMPROVE** | Validate area > 0, coverage > 0, coats > 0 | P1 | Low | |
| **CALC-136** | `tile-calculator` (Tile Quantity Calculator — Everyday) | **IMPROVE** | Validate floor > 0, tilew > 0, tileh > 0, waste >= 0 | P1 | Low | |

### T.3 Engine, UX, Explainability, SEO & Architecture Decisions (`SYS-01` to `SYS-15`)

| ID | Existing item | Proposed action | Reason | Priority | Risk | My decision |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SYS-01** | `engine.js` line 15 `< 1e-13` zero-clamping (`BUG-01`) | **IMPROVE** | Remove blanket `< 1e-13` clamp that zeroes out `gravitational-force` and small scientific numbers; snap only trig multiples of $\pi/2$ | P0 | Low | |
| **SYS-02** | `engine.js` parser syntax (`BUG-04`, `BUG-05`, `BUG-06`, `BUG-18`) | **IMPROVE** | Support `x(x+1)` implicit multiplication, `√9` without parens, `sec/csc/cot`, `asinh/acosh/atanh`, `sin^2(x)`, `tan(90°)` asymptote check, and `atan2` degrees conversion | P0 | Low | |
| **SYS-03** | Global `/` keyboard shortcut in `app.js` line 90 | **IMPROVE** | Ignore `/` when focus is inside `<input>`, `<textarea>`, or `<select>` so users can type division slashes `/` in calculators | P0 | Low | |
| **SYS-04** | Tier 1 Reusable Math Keypad & Live Preview Bar | **ADD** | Add collapsible math keypad + live mathematical preview strip (`sin⁻¹` vs `csc` vs `sin²(x)` vs `sin(x²)`) across all 7 expression calculators | P0 | Low | |
| **SYS-05** | Interactive Unit Selectors (`unitGroups` integration) | **ADD** | Replace static `.unit-pill` spans on formula calculators with interactive unit dropdowns wired to `unitGroups` in `engine.js` | P1 | Low | |
| **SYS-06** | Declarative Domain Validation (`BUG-12`, `BUG-13`) | **IMPROVE** | Add domain validation rules (`m > 0`, `T >= 0 K`, `sd > 0`, `h <= s`, integer `people >= 1`) to the 69 currently unvalidated formula tools | P0 | Low | |
| **SYS-07** | `Explain Calculation` Deterministic Trace Engine | **ADD** | Add `traceCalculate()` AST step-walker to `engine.js` and expandable `#explain-drawer` UI across 133 calculators (zero AI hallucination) | P1 | Low | |
| **SYS-08** | Multi-Field Search & Keyboard Navigation (`#search-modal`) | **IMPROVE** | Index `formula`, `slug`, and synonyms in search; add `ArrowUp`/`ArrowDown`/`Enter` keyboard navigation and inline filter empty states | P1 | Low | |
| **SYS-09** | Subtopic-Clustered Related Calculators (`#related-tools`) | **IMPROVE** | Replace static `.slice(0, 5)` with subtopic-matched related tools so Physics/Geometry tools show relevant companions | P1 | Low | |
| **SYS-10** | Topbar Breadcrumb Title (`source/build.py` line 18) | **IMPROVE** | Render actual calculator/category `title` instead of `path.split('/')[-2].replace('-',' ').title()` | P1 | Low | |
| **SYS-11** | Light Mode WCAG 2.1 AA Contrast (`site/assets/styles.css`) | **IMPROVE** | Update `--muted` (`#5b6078`) and `#result-status` (`#1f7a5c`) in light mode so all text meets $\ge 4.5:1$ contrast | P1 | Low | |
| **SYS-12** | AdSense Script vs. Privacy Policy Alignment (`source/build.py`) | **IMPROVE** | Remove unused `ADSENSE_TAG` from `build.py` (or disclose AdSense in `/privacy/` and add consent controls) | P0 | Low | |
| **SYS-13** | Homepage JSON-LD `"url": null` & `404.html` `noindex` | **IMPROVE** | Pass `SITE_URL="https://axiomatlas.netlify.app"` during `build.py` so `WebSite` JSON-LD has valid URL, and set `noindex` on `404.html` | P1 | Low | |
| **SYS-14** | Build-Time Pre-Rendered Inputs & Lazy `catalog.json` | **IMPROVE** | Pre-render `data-field`, `.unit-pill`, and worked examples in `build.py` so calculators work before `catalog.json` loads | P1 | Low | |
| **SYS-15** | ESM `package.json` & 5-Layer Automated Test Suite (`BUG-15`) | **ADD** | Add root `package.json` (`"type": "module"`) to fix `node source/test_formulas.mjs` and expand to 900+ automated unit/benchmark tests | P0 | Low | |

### T.4 Proposed Advanced STEM Calculators (`ADV-01` to `ADV-16`)

| ID | Existing item | Proposed action | Reason | Priority | Risk | My decision |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ADV-01** | *New:* `complex-number-calculator` (Complex Number Calculator — Math & numbers) | **ADD** | Eliminates manual rationalizing of complex denominators and quadrant-error-prone atan2 conversions between rectangular and polar phasor forms. | P0 | Low | |
| **ADV-02** | *New:* `error-propagation-calculator` (Error Propagation & Uncertainty Calculator — Math & numbers) | **ADD** | Computes both absolute uncertainty (±Δf) and relative/percentage uncertainty (Δf/|f| %) using exact partial-derivative variance propagation. | P0 | Low | |
| **ADV-03** | *New:* `modular-congruence-solver` (Modular Arithmetic & Linear Congruence Solver — Math & numbers) | **ADD** | Computes huge modular powers (e.g. RSA exponentiation) and modular inverses instantaneously using exact BigInt arithmetic without overflow. | P1 | Low | |
| **ADV-04** | *New:* `polynomial-solver` (Polynomial Roots, Factoring & Division Calculator — Algebra) | **ADD** | Finds exact rational roots via the Rational Root Theorem and all remaining real & complex roots of polynomials up to degree 10 via the Durand-Kerner / Aberth-Ehrlich method. | P0 | Low | |
| **ADV-05** | *New:* `partial-fractions-calculator` (Partial Fraction Decomposition Calculator — Algebra) | **ADD** | Decomposes proper and improper rational functions into linear and irreducible quadratic partial fractions with full Heaviside cover-up and linear system steps. | P1 | Low | |
| **ADV-06** | *New:* `ode-solver` (Ordinary Differential Equation (ODE) Initial-Value Solver — Graphing & calculus) | **ADD** | Computes high-accuracy RK45 numerical solutions, plots the solution curve y(x) alongside a 2D slope/direction field, and outputs a step-by-step table. | P0 | Low | |
| **ADV-07** | *New:* `taylor-series-gradient-calculator` (Taylor Series & Multivariable Gradient Calculator — Graphing & calculus) | **ADD** | Computes up to 4th-order Taylor approximation and multivariable partial derivatives ∂f/∂x, ∂f/∂y, ∂²f/∂x², ∂²f/∂y², ∂²f/∂x∂y with 2D local extremum/saddle-point classification. | P1 | Low | |
| **ADV-08** | *New:* `triangle-solver` (Complete Triangle Solver (SSS, SAS, ASA, AAS, SSA) — Trigonometry) | **ADD** | Enter any 3 valid parameters (out of sides a, b, c and angles A, B, C, with at least 1 side) and immediately obtain all 6 triangle elements, area, heights, medians, inradius, circumradius, and a scaled 2D SVG/Canvas triangle drawing, including both solutions when the SSA ambiguous case occurs. | P0 | Low | |
| **ADV-09** | *New:* `suvat-kinematics-solver` (Complete SUVAT 1D & 2D Projectile Kinematics Solver — Physics) | **ADD** | 1) In 1D SUVAT mode: enter ANY 3 of (s, u, v, a, t) and automatically solve for the remaining 2 using the exact matching kinematic equations; 2) In 2D Projectile mode: supports non-zero launch elevation h₀ ≥ 0 and optional quadratic air drag comparison. | P0 | Low | |
| **ADV-10** | *New:* `rlc-circuit-calculator` (AC RLC Circuit Impedance, Resonance & Transfer Calculator — Physics) | **ADD** | Computes full AC phasor impedance, resonant frequency, bandwidth, quality factor Q, and active/reactive/apparent power (P, Q, S, power factor cos φ). | P1 | Low | |
| **ADV-11** | *New:* `eigenvalue-decomposition-calculator` (Matrix Eigenvalue, Eigenvector, Rank & Decomposition Calculator — Linear algebra) | **ADD** | Computes characteristic polynomial, exact/numerical eigenvalues λ_i, eigenvectors v_i, matrix rank, nullity, trace, RREF (Reduced Row Echelon Form), and LU decomposition. | P0 | Low | |
| **ADV-12** | *New:* `hypothesis-test-calculator` (Probability Distributions & Hypothesis Testing Calculator (Normal, t, Chi-Square, F) — Statistics) | **ADD** | Computes exact CDF/p-values and critical values for Normal ($Z$), Student's $t$, $\chi^2$, Poisson, and $F$ distributions, plus 1-sample and 2-sample $t$-tests with confidence intervals at any $lpha$. | P0 | Low | |
| **ADV-13** | *New:* `npv-irr-calculator` (NPV, IRR & XIRR Cash-Flow Valuation Calculator — Finance) | **ADD** | Evaluates multi-year or date-stamped cash flows ($CF_0, CF_1, \dots, CF_n$) to compute NPV, IRR, XIRR, Payback Period, Discounted Payback Period, and Profitability Index. | P0 | Low | |
| **ADV-14** | *New:* `loan-amortization-prepayment-calculator` (Loan Amortization & Prepayment Schedule Calculator — Finance) | **ADD** | Computes exact interest saved and months shaved off a loan from extra monthly payments, annual lump-sum prepayments, or EMI step-ups, with a full downloadable/collapsible yearly & monthly amortization schedule. | P1 | Low | |
| **ADV-15** | *New:* `bitwise-ieee754-calculator` (Bitwise Operations, Two's Complement & IEEE-754 Float Inspector — Computing) | **ADD** | Provides interactive bit-toggling and instant simultaneous binary, hex, unsigned decimal, signed two's complement, and IEEE-754 float bit inspection. | P1 | Low | |
| **ADV-16** | *New:* `subnet-calculator` (IPv4 / IPv6 Subnet & CIDR Network Calculator — Computing) | **ADD** | Instantly computes network address, broadcast address, usable IP range, total/usable hosts, netmask, wildcard mask, and binary IP breakdown for any IPv4 CIDR block. | P1 | Low | |

## U. Next Step — Explicit Approval Gate

Per Section 0 (**ABSOLUTE RULES**):
- **Zero implementation, deletion, merge, rename, route change, or deployment has been performed.**
- Please review the findings and the Individual Approval Matrix above and share your decisions (`KEEP`, `REMOVE`, `MERGE`, `RECLASSIFY`, `IMPROVE`, `ADD`, `DEFER`) by ID or phase before any Phase 1 implementation begins.
