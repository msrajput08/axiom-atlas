# AxiomAtlas Existing System Optimization & Upgrade Master Plan (Gates A–E)

**Repository:** `msrajput08/axiom-atlas` (Branch: `audit/optimization-and-upgrade-proposals`, Backup: `backups/axiom-atlas-backup-pre-proposal.tar.gz`)
**Live Website:** [AxiomAtlas](https://axiomatlas.netlify.app/)
**Status:** Master Proposal for Explicit Approval — Zero production source files, routes, categories, or calculators have been modified.

## 1. Executive Summary & Evidence Base

### 1.1 What Was Inspected & Verified Against Source Code
1. **Complete Generator & Build Pipeline:** `source/make_catalog.py` (191 lines), `source/build.py` (56 lines), `source/generate_sitemap.py` (19 lines), `source/test_formulas.mjs` (7 lines), `scripts/rebuild.py` (26 lines), `netlify.toml`.
2. **Complete Client-Side Engine & UI:** `site/assets/engine.js` (11,729 bytes), `site/assets/app.js` (35,707 bytes), `site/assets/catalog.json` (63,813 bytes), `site/assets/styles.css` (20,860 bytes), `site/_headers`, `site/_redirects`, `site/robots.txt`, `site/manifest.webmanifest`, `site/sitemap.xml`, and all 155 static HTML files in `site/`.
3. **Existing Audit Corpus:** All 7 existing audit documents in `docs/audits/` (`AXIOMATLAS-MASTER-AUDIT-SUMMARY.md`, `axiomatlas-existing-system-audit.md`, `axiomatlas-ux-and-input-audit.md`, `axiomatlas-explain-calculation-audit.md`, `axiomatlas-advanced-calculator-roadmap.md`, `axiomatlas-mathematical-quality-audit.md`, `axiomatlas-product-and-technical-audit.md`).
4. **Companion Proposal Documents Created in `docs/audits/`:**
   - `docs/audits/axiomatlas-category-calculator-cleanup-proposal.md` (Task 1 / Gate A)
   - `docs/audits/axiomatlas-input-ux-and-expression-system-proposal.md` (Task 2 / Gate B)
   - `docs/audits/axiomatlas-advanced-calculator-expansion-proposal.md` (Task 3 / Gate C)
   - `docs/audits/axiomatlas-explain-calculation-implementation-proposal.md` (Task 4 / Gate D)
   - `docs/audits/axiomatlas-existing-system-upgrade-master-plan.md` (Task 5 & Consolidated Master Plan / Gate E)

## 2. Task 5 — Comprehensive Testing, Quality & Backward-Compatibility Plan

Before any approved change in Gates A–D is merged into `main`, it must pass a **12-dimension automated verification suite** (`tests/` run via Node.js native test runner `node --test` + headless Chromium):

| # | Validation Dimension | Verification Mechanism & Test Cases | Pass / Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| 1 | **Existing Functionality Regression Tests** | Fix ESM import (`package.json` with `"type": "module"`) and run `source/test_formulas.mjs` + snapshot tests across all 136 calculators at their catalog default inputs. | 100% of existing default calculations produce identical (or bug-fixed) finite outputs with zero runtime errors. |
| 2 | **Mathematical Unit Tests** | Unit tests for `compile()`, `run()`, `calculate()`, `solveQuadratic()`, `solveRoots()`, `gaussian()`, `matrixOp()`, `descriptive()`, `integrate()`, `convertUnit()`, `fractionOp()`, `isPrime()`, plus new complex/ODE/eigenvalue/distribution routines. | 250+ unit assertions passing with relative error $< 10^{-12}$ (algebraic) and $< 10^{-9}$ (quadrature/roots). |
| 3 | **Edge-Case & Domain Validation Tests** | Test all 18 discovered bugs (`BUG-01`–`BUG-18`) and boundary cases: $r = 0\%$ in loans/SIP, $x_1 = x_2$ vertical slope, $a = 0$ in linear/quadratic equations, negative divisor $b < 0$ in `modulo-calculator`, odd roots of negative numbers in `nth-root`, $1/x$ and $|x|/x$ at $x=0$ in `limit-calculator`, $(x-2.003)^2=0$ in `equation-solver`, and negative physical inputs ($m < 0$, $T < 0	ext{ K}$, $R \le 0$). | Every invalid domain input throws a clear, human-readable validation error; every valid boundary case returns the exact analytical limit. |
| 4 | **Input Parser & Notation Disambiguation Tests** | Test `compile()` and `run()` on `√9`, `2√3`, `x(x+1)`, `(x+1)(x-1)`, `2pi`, `sin^2(x)`, `sin²(x)`, `sin(x)^2`, `sin(x^2)`, `asin(0.5)`, `arcsin(0.5)`, `csc(pi/6)`, `sec(0)`, `cot(pi/4)`, `asinh(1)`, `|x|`, `-2^2 = -4`, `2^3^2 = 512`, and `tan(90°)` in Degrees mode. | 100% deterministic parsing; zero ambiguity between $\sin^{-1}(x)$, $\csc(x)$, $(\sin x)^2$, and $\sin(x^2)$. |
| 5 | **Route, URL & Redirect Compatibility Tests** | Automated crawl of all 136 existing `/tools/<slug>/` routes and 14 `/categories/<slug>/` routes. For any consolidated calculator under Option 2, verify 301 redirect rules in `site/_redirects` and `<link rel="canonical">` targets. | **Zero 404s** on any previously published URL in `site/sitemap.xml`. |
| 6 | **Category Navigation & Discovery Tests** | Verify sidebar counts, category cards, breadcrumbs (`header-crumb` exact title match), `#related-tools` subtopic clustering, `#search-modal` keyword/formula/synonym search, `ArrowDown`/`Enter` keyboard navigation, and `/` key ignored inside `<input>`/`<textarea>`. | Typing `/` inside any calculator input types `/` without opening `#search-modal`; every search query returns relevant tools. |
| 7 | **Mobile Responsiveness Tests** | Headless Chromium viewport checks at `360×640`, `375×812`, `768×1024`, and `1440×900` across formula tools, `scientific-calculator`, `matrix-calculator`, `linear-system` (3×3), and `graphing-calculator`. | Zero horizontal page overflow (`document.documentElement.scrollWidth <= window.innerWidth`); touch targets $\ge 44	imes 44	ext{px}$ (or $\ge 36	imes 36	ext{px}$ with spacing). |
| 8 | **Accessibility (WCAG 2.1 AA) Tests** | Automated contrast ratio verification (`>= 4.5:1` for all text in Light and Dark themes), `aria-live="polite"` on results, `aria-expanded` on `#explain-drawer`, focus trap in `#search-modal`, and `@media (prefers-reduced-motion: reduce)` check. | Zero WCAG 2.1 AA contrast failures; full keyboard-only operability. |
| 9 | **Performance & Bundle Budget Tests** | Verify pre-rendered `data-field` inputs work before `catalog.json` finishes loading; verify core JS (`engine.js` + `app.js`) stays `< 60 KB` uncompressed (`< 18 KB` gzipped), with advanced solvers lazy-loaded only on specialized pages. | Lighthouse Performance $\ge 98$, First Contentful Paint `< 0.8s`, Cumulative Layout Shift `0.00`. |
| 10 | **SEO & Structured-Data Validation** | Validate `<title>`, `<meta name="description">`, `<link rel="canonical">`, `og:url`, `WebSite` JSON-LD on `site/index.html` (`"url": "https://axiomatlas.netlify.app/"`, never `null`), `WebApplication` JSON-LD on all tool pages, `noindex` on `404.html`, and sorted `site/sitemap.xml`. | 100% valid Schema.org JSON-LD and canonical URLs across all 155+ HTML files. |
| 11 | **Explanation Correctness Tests** | Assert that for every calculator supporting `Explain Calculation`, the `finalValue` in the explanation trace equals the primary displayed result in `#result-display` (`trace.finalValue === primaryResult`). | 100% mathematical consistency between displayed result and step-by-step explanation trace. |
| 12 | **Numerical Precision & Stability Benchmarks** | NIST StRD (`NumAcc1`–`NumAcc4`), ill-conditioned quadratic ($b = -10^9$), Hilbert $3	imes 3$ matrix inversion, Planck/gravitational scale ($10^{-34}$ to $10^{-14}$) preservation without zero-clamping, and 500-digit `BigInt` fractions. | Matches reference analytical values within IEEE-754 double-precision tolerances. |

### 2.1 URL Preservation & SEO Migration Policy for Relocated or Consolidated Calculators

1. **Category Relocations (`resistor-series`, `resistor-parallel`, `frequency-wavelength` → `Physics`; `electricity-cost` → `Everyday`):**
   - Because AxiomAtlas uses flat tool URLs (`/tools/<slug>/`), changing a tool's `category` in `source/make_catalog.py` **does not alter its URL**. Existing bookmarks, backlinks, and Google search listings for `/tools/resistor-series/`, `/tools/resistor-parallel/`, `/tools/frequency-wavelength/`, and `/tools/electricity-cost/` continue to return `HTTP 200` at the exact same URL!
2. **Calculator Consolidations (`arc-length` ↔ `sector-calculator`, `distance-calculator` ↔ `speed-calculator`, `resistor-parallel` ↔ `resistor-series`, `arithmetic-mean` ↔ `statistics-calculator`):**
   - **Option A (Recommended — Co-Hosted Multi-Mode Component on Both URLs):** Keep both URLs active (`HTTP 200`) and render the unified multi-mode calculator on both pages, with the default mode matching the URL slug (e.g., `/tools/distance-calculator/` opens with `Solve for: Distance` selected; `/tools/speed-calculator/` opens with `Solve for: Speed` selected). This preserves 100% of long-tail keyword rankings.
   - **Option B (Strict URL Consolidation via 301 Redirects):** If you prefer retiring the secondary slug, add explicit `301!` permanent redirect rules at the top of `site/_redirects` (e.g., `/tools/arc-length/* /tools/sector-calculator/ 301!`), point `<link rel="canonical">` to the destination URL, update all internal links via `scripts/rebuild.py`, and remove retired URLs from `site/sitemap.xml`.

## 3. Implementation Phases, Dependencies & Effort Estimates

| Phase | Gate | Scope of Work | Dependencies | Est. Effort | Risk Level & Mitigation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1: Engine Accuracy & Critical Bug Fixes** | Gate B & E | Add `package.json` (`"type": "module"`), fix `BUG-01` (`<1e-13` zero-clamp), `BUG-02` (`limit-calculator`), `BUG-03` (`modulo-calculator`), `BUG-04` (`x(x+1)`), `BUG-05` (`√9`), `BUG-06` (`tan(90°)` & `atan2`), `BUG-07` (`trigonometry-calculator` `cot` & inverse trig), `BUG-08` (`prime-checker` factors), `BUG-09` (`solveRoots` even-multiplicity roots), `BUG-10` (`integrate` singularity check), `BUG-11` (`nth-root` odd negative roots), `BUG-12` (`parallelogram` $h \le s$), `BUG-13` (domain validations across 69 formula tools), `BUG-14` (`graphing-calculator` $f(0)$ try/catch), and `SYS-03` (`/` key hijack). | Approval of Gate B / Gate E | **8 hours** | **Low Risk:** Backed by automated unit tests before and after each fix. |
| **Phase 2: Category Cleanup & Calculator Consolidation** | Gate A | Relocate the 4 misplaced `Computing` tools (`resistor-series`, `resistor-parallel`, `frequency-wavelength`, `electricity-cost`); cross-list all 6 converters on `/categories/converters/`; add subtopic groupings to `Physics`, `Geometry`, `Math & numbers`, and `Finance`; implement unified multi-mode/co-displayed calculators (`sector`/`arc-length`, `resistor-series`/`parallel`, `speed`/`distance`, `slope`/`midpoint`/`distance-between-points`, `gcd`/`lcm`, `arithmetic`/`geometric`/`weighted` means, `degree-radian`, `data-size-calculator`, `number-base-converter`, `color-converter`). | Phase 1 | **10 hours** | **Low Risk:** Zero broken URLs under Co-Hosting (or verified 301 redirects). |
| **Phase 3: Input UX, Expression Preview & Interactive Units** | Gate B | Build `MathExpressionInput` (live HTML/MathML notation preview bar + collapsible math keypad + `sin^-1` vs `csc` vs `sin^2(x)` vs `sin(x^2)` disambiguation) across all 7 expression calculators; wire `.unit-pill` badges on all 113 formula calculators to `unitGroups` in `engine.js` for interactive unit switching; upgrade `matrix-calculator` to state-preserving 2D grid + 2D table output. | Phase 1 | **12 hours** | **Low–Medium Risk:** Preserve raw keyboard entry speed while adding progressive visual helpers. |
| **Phase 4: `Explain Calculation` Engine & UI Rollout** | Gate D | Implement `traceCalculate()` in `site/assets/engine.js` (`Template A` for 116 tools), instrument `Template B/C/D` solvers (`solveQuadratic`, `fractionOp`, `isPrime`, `gaussian`, `matrixOp`, `descriptive`, `regression`, `solveRoots`, `integrate`, `analytic`), and add `#explain-drawer` UI to `.answer-card`. | Phase 1 & Phase 3 | **12 hours** | **Low Risk:** Uses the exact same evaluation pipeline so explanations never diverge from results. |
| **Phase 5: Advanced STEM Calculator Expansion** | Gate C | Implement approved P0 and P1 calculators (`ADV-01` through `ADV-16`) in Waves C1, C2, and C3, complete with `Explain Calculation` traces and benchmark tests. | Phase 1, 3 & 4 | **35 hours** (modular, ~2–5 hrs per tool) | **Low Risk:** Lazy-loaded ES module keeps core bundle tiny. |
| **Phase 6: Discovery, Accessibility, SEO & Final QA** | Gate E | Multi-field search + keyboard nav in `#search-modal`, subtopic-matched `#related-tools`, topbar breadcrumb fix, WCAG AA light-mode contrast fix (`--muted: #5b6078`), AdSense/Privacy alignment, `index.html` JSON-LD URL fix, build-time pre-rendered `data-field` inputs, and full 12-dimension regression test suite. | Phases 1–5 | **8 hours** | **Low Risk:** Verified by automated build/SEO/a11y checks. |

## 4. Approval Gates A–E (Decisions Required Before Implementation)

Please review the five structured gates below and indicate your approval or preferred options:

### Gate A — Category and Calculator Cleanup (`docs/audits/axiomatlas-category-calculator-cleanup-proposal.md`)
1. **A1 (Category Structure):** Approve keeping all 14 existing category URLs while adding visual subtopic sections on large categories (`Physics`, `Math & numbers`, `Geometry`, `Finance`) and cross-listing all 6 converter tools on `/categories/converters/`? **[ Approve / Modify ]**
2. **A2 (Relocate 4 Misplaced Tools in `Computing`):** Approve moving `resistor-series`, `resistor-parallel`, and `frequency-wavelength` from `Computing` to `Physics`, and `electricity-cost` from `Computing` to `Everyday` (keeping their `/tools/<slug>/` URLs unchanged)? **[ Approve / Modify ]**
3. **A3 (Handling of 5 Overlapping Calculator Groups — Co-Host vs. 301 Redirect):** For the 5 overlapping groups (`arc-length` ↔ `sector-calculator`, `resistor-parallel` ↔ `resistor-series`, `distance-calculator` ↔ `speed-calculator`, `slope` ↔ `midpoint` ↔ `distance-between-points`, `gcd` ↔ `lcm`), do you prefer:
   - **Option A3-1 (Recommended — SEO-Safe Co-Hosting):** Keep all 136 `/tools/<slug>/` URLs active (`HTTP 200`) and render the upgraded multi-mode/multi-output component on each paired route (defaulting to the mode matching the URL)?
   - **Option A3-2 (Strict URL Consolidation):** Merge and 301-redirect the secondary slugs (`arc-length`, `resistor-parallel`, `distance-calculator`, `arithmetic-mean`) to their canonical counterparts?
   **[ Choose Option A3-1 / Choose Option A3-2 / Custom ]**
4. **A4 (Rework of Incomplete Tools):** Approve reworking `prime-checker` (add prime factorization & divisors), `trigonometry-calculator` (add `cot` & inverse trig), `derivative-calculator` (add tangent line plot & corner check), `limit-calculator` (fix convergence check), `number-base-converter` (bases 2–36), `color-converter` (editable HEX/RGB/HSL text fields), `degree-radian` (bidirectional), `data-size-calculator` (bidirectional SI vs. IEC), and `weighted-average`/`arithmetic-mean`/`geometric-mean` (dynamic N inputs)? **[ Approve / Modify ]**

### Gate B — Input UX, Mathematical Expression System & Engine Bug Fixes (`docs/audits/axiomatlas-input-ux-and-expression-system-proposal.md`)
1. **B1 (Critical Mathematical & UX Bug Fixes):** Approve fixing all 18 verified bugs (`BUG-01` `<1e-13` zero-clamping in `engine.js`, `BUG-02` limit averaging, `BUG-03` negative divisor modulo, `BUG-04` `x(x+1)` implicit multiplication, `BUG-05` `√9` without parens, `BUG-06` `tan(90°)` & `atan2` degrees, `BUG-09` even-multiplicity roots, `BUG-10` improper integral check, `BUG-11` odd roots of negative numbers, `BUG-12` parallelogram $h \le s$, `BUG-13` domain validations on 69 formula tools, `BUG-14` graphing `f(0)` error guard, and `SYS-03` global `/` shortcut hijack)? **[ Approve / Modify ]**
2. **B2 (Beginner-Friendly Expression Input & Trig Disambiguation):** Approve the `MathExpressionInput` architecture (live formatted math preview bar + collapsible math keypad + `Radians/Degrees` selector + explicit disambiguation of `asin(x)` / `sin⁻¹(x)`, `csc(x)`, `sin(x)^2`, and `sin(x^2)`) across all 7 expression calculators? **[ Approve / Modify ]**
3. **B3 (Interactive Unit Selectors):** Approve upgrading static `.unit-pill` spans on formula calculators to interactive unit dropdowns wired to `unitGroups` in `site/assets/engine.js`? **[ Approve / Modify ]**

### Gate C — Advanced Calculator Additions (`docs/audits/axiomatlas-advanced-calculator-expansion-proposal.md`)
Which of the 16 proposed advanced STEM calculators do you approve for implementation?
- **Wave C1 (P0 Multi-Mode Workflow Solvers):**
  - `ADV-08`: Complete Triangle Solver (SSS, SAS, ASA, AAS, SSA Ambiguous Case) (`/tools/triangle-solver/`) **[ Approve / Defer ]**
  - `ADV-09`: Complete SUVAT 1D & Elevated 2D Projectile Kinematics Solver (`/tools/suvat-kinematics-solver/`) **[ Approve / Defer ]**
  - `ADV-13`: NPV, IRR & XIRR Cash-Flow Valuation Calculator (`/tools/npv-irr-calculator/`) **[ Approve / Defer ]**
  - `ADV-02`: Error & Uncertainty Propagation Calculator (`/tools/error-propagation-calculator/`) **[ Approve / Defer ]**
- **Wave C2 (P0 Complex, Polynomial, Matrix, ODE & Statistical Inference Solvers):**
  - `ADV-01`: Complex Number Calculator (`/tools/complex-number-calculator/`) **[ Approve / Defer ]**
  - `ADV-04`: Polynomial Roots, Factoring & Division Calculator (`/tools/polynomial-solver/`) **[ Approve / Defer ]**
  - `ADV-11`: Matrix Eigenvalue, Eigenvector, Rank, RREF & LU Calculator (`/tools/eigenvalue-decomposition-calculator/`) **[ Approve / Defer ]**
  - `ADV-06`: ODE Initial-Value Solver (RK4 / Euler + Slope Field) (`/tools/ode-solver/`) **[ Approve / Defer ]**
  - `ADV-12`: Probability Distributions & Hypothesis Testing Calculator ($Z, t, \chi^2, F$) (`/tools/hypothesis-test-calculator/`) **[ Approve / Defer ]**
- **Wave C3 (P1 Specialized Engineering, Finance & CS Solvers):**
  - `ADV-14`: Loan Amortization & Prepayment Schedule Calculator (`/tools/loan-amortization-prepayment-calculator/`) **[ Approve / Defer ]**
  - `ADV-10`: AC RLC Circuit Impedance & Resonance Calculator (`/tools/rlc-circuit-calculator/`) **[ Approve / Defer ]**
  - `ADV-05`: Partial Fraction Decomposition Calculator (`/tools/partial-fractions-calculator/`) **[ Approve / Defer ]**
  - `ADV-07`: Taylor Series & Multivariable Gradient Calculator (`/tools/taylor-series-gradient-calculator/`) **[ Approve / Defer ]**
  - `ADV-03`: Modular Congruence & CRT Solver (`/tools/modular-congruence-solver/`) **[ Approve / Defer ]**
  - `ADV-15`: Bitwise Operations, Two's Complement & IEEE-754 Float Inspector (`/tools/bitwise-ieee754-calculator/`) **[ Approve / Defer ]**
  - `ADV-16`: IPv4 / CIDR Subnet Calculator (`/tools/subnet-calculator/`) **[ Approve / Defer ]**

### Gate D — Explain Calculation Architecture (`docs/audits/axiomatlas-explain-calculation-implementation-proposal.md`)
1. **D1 (Single-Pipeline Deterministic Trace Engine):** Approve extending `run()` in `site/assets/engine.js` and specialized solvers to emit deterministic calculation traces (`Templates A–D`) across all 133 supported calculators and displaying the expandable **`✦ Explain Calculation`** drawer in `.answer-card`? **[ Approve / Modify ]**

### Gate E — Testing, SEO, Accessibility, Privacy & Implementation Sequence
1. **E1 (Test Suite & Build Improvements):** Approve adding `package.json` (`"type": "module"`), building the 12-dimension automated test suite, fixing Light Mode WCAG 2.1 AA contrast (`--muted: #5b6078`, `#result-status: #1f7a5c`), fixing `"url": null` in `site/index.html` JSON-LD, pre-rendering `data-field` attributes at build time, and implementing the Phase 1 → Phase 6 execution sequence? **[ Approve / Modify ]**
2. **E2 (AdSense vs. Privacy Policy Resolution):** In `source/build.py` (line 12), `adsbygoogle.js` is injected into all 155 pages while `/privacy/` states *"We do not currently display ads."* Do you want to **(a) Remove `ADSENSE_TAG` from `source/build.py` until ads are used**, or **(b) Keep `ADSENSE_TAG` and update `/privacy/` to disclose Google AdSense**? **[ Choose (a) / Choose (b) ]**
