# AxiomAtlas Category & Calculator Cleanup Proposal (Gate A)

**Repository:** `msrajput08/axiom-atlas` (Branch: `audit/optimization-and-upgrade-proposals`, Backup: `backups/axiom-atlas-backup-pre-proposal.tar.gz`)
**Live Website:** [AxiomAtlas](https://axiomatlas.netlify.app/)
**Source Files Inspected:** `source/make_catalog.py` (lines 1–191), `source/build.py` (lines 1–56), `site/assets/catalog.json`, `site/assets/app.js` (lines 1–81), `site/assets/engine.js` (lines 1–52), `site/_redirects`, and existing audit reports under `docs/audits/`.
**Status:** Proposal Only — Zero calculators, categories, routes, or production files have been modified.

## 1. Executive Summary of Category & Calculator Cleanup

Direct source-code analysis of `source/make_catalog.py` and `site/assets/app.js` establishes that AxiomAtlas currently has **14 categories and 136 calculators** (`23` specialized custom-UI tools defined via `s(...)` and `113` declarative single-step formula tools defined via `f(...)`).

Rather than arbitrarily deleting useful simple calculators, our evidence-based cleanup strategy focuses on four high-impact structural improvements:
1. **Relocate 4 Misclassified Calculators (`RELOCATE`):** Move `resistor-series` (`/tools/resistor-series/`), `resistor-parallel` (`/tools/resistor-parallel/`), and `frequency-wavelength` (`/tools/frequency-wavelength/`) from `Computing` to `Physics`, and move `electricity-cost` (`/tools/electricity-cost/`) from `Computing` to `Everyday` (zero URL changes required since all tool routes use `/tools/<slug>/`).
2. **Consolidate 5 Overlapping Calculator Groups (`MERGE` — 6 redundant routes consolidated or co-hosted with 301 redirects):**
   - `arc-length` (`/tools/arc-length/`) → Merge into `sector-calculator` (`/tools/sector-calculator/`, upgraded to **Circle Sector, Arc Length & Segment Calculator**).
   - `resistor-series` (`/tools/resistor-series/`) + `resistor-parallel` (`/tools/resistor-parallel/`) → Consolidate into a unified **Series & Parallel Resistors Calculator** (keeping `/tools/resistor-series/` as canonical or co-hosting both routes with shared multi-mode tabs).
   - `distance-calculator` (`/tools/distance-calculator/`) → Consolidate into `speed-calculator` (`/tools/speed-calculator/`, upgraded to **Speed, Distance & Time Calculator** with a 3-way `Solve for: Speed / Distance / Time` selector).
   - `arithmetic-mean` (`/tools/arithmetic-mean/`) → Consolidate into `statistics-calculator` (`/tools/statistics-calculator/`) or rework from a rigid 4-field box into a dynamic N-number Mean/Harmonic/Geometric Mean tool.
   - `data-size-calculator` (`/tools/data-size-calculator/`) & `degree-radian` (`/tools/degree-radian/`) → Rework from one-way 1-field stubs (`GB → MB/kB/B` only; `Degrees → Radians` only) into full bidirectional converters cross-listed under `Converters`.
3. **Rework 18 Incomplete or Mathematically Flawed Calculators (`REWORK`):** Fix broken promises in descriptions (`prime-checker` missing factors, `trigonometry-calculator` missing `cot` and inverse trig, `derivative-calculator` missing tangent plot, `number-base-converter` missing bases 3–35), fix mathematical bugs (`gravitational-force` `<1e-13` zero-clamping, `limit-calculator` false limit `0` at asymptotes, `modulo-calculator` negative divisor bug, `nth-root` odd root of negative numbers), and upgrade `slope-calculator`, `midpoint-calculator`, and `distance-between-points` to co-display all 2D line metrics.
4. **Preserve All 14 Categories (`KEEP` / `REORGANIZE`):** Keep all 14 `/categories/<slug>/` routes live, populate the 1-tool `Converters` category page by cross-listing all 6 conversion tools, and add visual subtopic groupings to large categories (`Physics` [27], `Math & numbers` [21], `Geometry` [18], `Finance` [15]).

## 2. Task 1A — Complete Category-by-Category Analysis (All 14 Categories)

Every category in `source/make_catalog.py` (lines 162–177) was evaluated against the six mandatory criteria:

| # | Category Name & Route | Current Count | 1. Genuinely Useful & Necessary? | 2. Sufficient Coverage? | 3. Overlaps with Other Categories? | 4. Misplaced Calculators Inside It? | 5. Category Action (`KEEP` / `MERGE` / `RENAME` / `REORGANIZE`) | 6. UX Complexity Assessment & Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **[Math & numbers](https://axiomatlas.netlify.app/categories/math-numbers/)** (`/categories/math-numbers/`) | **21** | **Yes.** Essential entry point for arithmetic, percentages, fractions, exponents, logs, combinatorics, and number theory. | **Yes (21 tools).** Strong foundational breadth; needs Complex Numbers and Error Propagation in Task 3. | Overlaps with `Statistics` on `arithmetic-mean`, `geometric-mean`, `weighted-average`, `permutation-calculator`, `combination-calculator`. | `arithmetic-mean` (fixed 4 inputs) duplicates `statistics-calculator`. | **REORGANIZE (Keep route, add subtopic sections & cross-links)** | Displaying 21 ungrouped cards mixes basic percentages with combinatorics and modular arithmetic. Grouping into 4 subtopics (`Percentages & Ratios`, `Fractions, Powers & Logs`, `Number Theory`, `Combinatorics & Means`) removes visual clutter. |
| 2 | **[Algebra](https://axiomatlas.netlify.app/categories/algebra/)** (`/categories/algebra/`) | **12** | **Yes.** Core academic subject for equations, polynomials, and progressions. | **Moderate (12 tools).** Needs degree-$n$ polynomial root/factoring and partial fractions. | Overlaps with `Geometry` on 2D coordinate tools (`slope-calculator`, `midpoint-calculator`, `distance-between-points`) and `Linear algebra` on `linear-system`. | `slope-calculator`, `midpoint-calculator`, and `distance-between-points` are analytic geometry tools that users also look for under `Geometry`. | **KEEP & CROSS-LINK** | Keep all 12 tools in `Algebra`, and cross-link the 3 coordinate tools in `Geometry` and `linear-system` in `Linear algebra`. |
| 3 | **[Graphing & calculus](https://axiomatlas.netlify.app/categories/graphing-calculus/)** (`/categories/graphing-calculus/`) | **4** | **Yes.** High-value STEM differentiator (`graphing-calculator`, `derivative-calculator`, `integral-calculator`, `limit-calculator`). | **Low–Moderate (4 tools).** Needs ODE Solver and Taylor Series / Multivariable Gradient. | Minimal overlap; shares `compile()`/`run()` expression parser with `Algebra` and `Math & numbers`. | None. All 4 tools belong here. | **KEEP & EXPAND** | Clean, focused category. Expanding from 4 to 6–7 tools in Task 3 makes it a complete calculus workbench. |
| 4 | **[Geometry](https://axiomatlas.netlify.app/categories/geometry/)** (`/categories/geometry/`) | **18** | **Yes.** Essential for 2D plane shapes and 3D solid mensuration. | **Yes (18 tools).** Covers 10 2D shapes and 8 3D solids. | Overlaps with `Trigonometry` on `sector-calculator` (vs. `arc-length`) and triangle tools (`triangle-calculator`, `herons-formula`, `pythagorean-calculator`). | None misplaced, but 2D shapes and 3D solids are mixed in a flat list. | **REORGANIZE (Group into 2D Shapes vs. 3D Solids)** | Separating `2D Plane Geometry (10)` and `3D Solid Geometry (8)` makes scanning instantaneous. |
| 5 | **[Trigonometry](https://axiomatlas.netlify.app/categories/trigonometry/)** (`/categories/trigonometry/`) | **5** | **Yes.** Distinct curriculum subject (`trigonometry-calculator`, `degree-radian`, `arc-length`, `law-of-cosines`, `law-of-sines`). | **Low (5 tools, 2 of which are weak subsets).** Needs a unified **Complete Triangle Solver (SSS/SAS/ASA/AAS/SSA)**. | Overlaps with `Geometry` (`arc-length` duplicates `sector-calculator`; `pythagorean-calculator` is in Geometry) and `Converters` (`degree-radian`). | `arc-length` is redundant with `sector-calculator` unless merged/redirected. | **KEEP, CLEAN UP & EXPAND** | Keep `Trigonometry` independent (students search specifically for Trigonometry), cross-link `pythagorean-calculator` and `herons-formula`, and add Complete Triangle Solver. |
| 6 | **[Physics](https://axiomatlas.netlify.app/categories/physics/)** (`/categories/physics/`) | **27** | **Yes.** Largest STEM category on the platform. | **Yes (27 tools, growing to 30 after relocating 3 tools from Computing).** | Overlaps with `Computing` because 3 physics/electronics tools (`resistor-series`, `resistor-parallel`, `frequency-wavelength`) were mistakenly placed in `Computing`! | None inside `Physics` are misplaced, but `speed-calculator` and `distance-calculator` are trivial rearrangements of $d = vt$. | **REORGANIZE (Add 6 Subtopic Sections + Absorb 3 Physics Tools from Computing)** | 27+ tools in a flat ungrouped list is hard to scan; furthermore, `app.js` line 86 (`slice(0,5)`) shows the same 5 kinematics tools as "Related" on every optics and electricity page! Subtopic grouping fixes both navigation and related-tool relevance. |
| 7 | **[Linear algebra](https://axiomatlas.netlify.app/categories/linear-algebra/)** (`/categories/linear-algebra/`) | **2** | **Yes.** Distinct university STEM subject (`matrix-calculator`, `vector-calculator`). | **Too Small (2 tools).** `linear-system` (`Simultaneous Equation Solver`) is in `Algebra` but not listed here, and Eigenvalues/RREF are missing. | Overlaps with `Algebra` (`linear-system`) and `Physics` (3D vectors). | None misplaced inside it, but `linear-system` should be cross-listed here. | **KEEP & EXPAND** | Cross-listing `linear-system` and adding `Matrix Eigenvalue, Eigenvector, Rank & RREF Calculator` brings coverage to 4 core tools. |
| 8 | **[Statistics](https://axiomatlas.netlify.app/categories/statistics/)** (`/categories/statistics/`) | **7** | **Yes.** Core data-science and academic subject. | **Moderate (7 tools).** Strong descriptive & regression tools, but lacks p-value distributions ($t, \chi^2, F$) and hypothesis testing. | Overlaps with `Math & numbers` (`arithmetic-mean`, `geometric-mean`, `weighted-average`, `permutation-calculator`, `combination-calculator`). | None misplaced inside `Statistics`. | **KEEP, CROSS-LINK & EXPAND** | Cross-list the mean and combinatorics calculators here and add the Hypothesis Testing & Distribution Calculator. |
| 9 | **[Finance](https://axiomatlas.netlify.app/categories/finance/)** (`/categories/finance/`) | **15** | **Yes.** High-utility personal and business finance suite. | **Yes (15 tools).** Covers interest, loans, SIP, CAGR, ROI, margin, break-even, tax, inflation, PV/FV. | Minor overlap with `Everyday` on `tip-calculator` and `discount-calculator`. | `tip-calculator` is a restaurant bill splitter that users also expect in `Everyday`. | **KEEP (Cross-link `tip-calculator` in Everyday)** | Group into `Loans & Interest`, `Investments & Wealth`, `Business Metrics`, and `Shopping & Bills`. |
| 10 | **[Converters](https://axiomatlas.netlify.app/categories/converters/)** (`/categories/converters/`) | **1** | **Yes, as a discovery hub**, but **critically under-populated** as a 1-card page! | **No (only 1 tool: `unit-converter`).** Yet 5 other converters exist in other categories! | Overlaps with `Computing` (`number-base-converter`, `color-converter`, `data-size-calculator`), `Trigonometry` (`degree-radian`), and `Education` (`cgpa-percentage`). | None misplaced inside it, but missing cross-listings of the platform's other 5 converters. | **REORGANIZE (Cross-list all 6 converter tools on `/categories/converters/`)** | A category card on the homepage that says `"1 tools →"` looks unfinished (and has a grammar typo `"1 tools"` in `source/build.py` line 25!). Cross-listing all 6 converters makes `/categories/converters/` a rich 6-tool hub. |
| 11 | **[Computing](https://axiomatlas.netlify.app/categories/computing/)** (`/categories/computing/`) | **11** | **Yes**, for digital storage, networking, number bases, display math, and bitwise/floating-point tools. | **Distorted (11 nominal tools, but only 7 are actually computing).** | Heavily polluted with `Physics` / Electronics (`resistor-series`, `resistor-parallel`, `frequency-wavelength`) and `Everyday` (`electricity-cost`). | **4 misplaced calculators:** `resistor-series`, `resistor-parallel`, `frequency-wavelength` (belong in `Physics`), and `electricity-cost` (belongs in `Everyday`). | **REORGANIZE (Relocate 4 misplaced tools out; add Bitwise/IEEE-754 & IPv4 Subnet calculators)** | Cleaning out resistor and EM wave tools makes `Computing` genuinely about Computer Science & Digital Engineering. |
| 12 | **[Education](https://axiomatlas.netlify.app/categories/education/)** (`/categories/education/`) | **5** | **Yes.** High student search demand (`attendance-calculator`, `cgpa-percentage`, `grade-percentage`, `target-grade`, `study-time-calculator`). | **Yes (5 focused academic planning tools).** | Minor formula overlap with `Math & numbers` (`grade-percentage` vs `percentage-calculator`, `target-grade` vs `weighted-average`), but distinct academic workflow. | None. | **KEEP UNCHANGED** | High-value student landing category; keep all 5 tools intact. |
| 13 | **[Date & time](https://axiomatlas.netlify.app/categories/date-time/)** (`/categories/date-time/`) | **2** | **Yes.** Distinct calendar domain (`date-difference`, `age-calculator`). | **Small (2 tools)**, but both are high-utility daily tools. | Could theoretically sit inside `Everyday`, but `Date & time` is already indexed at `/categories/date-time/`. | None. | **KEEP** | Keep `/categories/date-time/` intact for SEO and sidebar clarity. |
| 14 | **[Everyday](https://axiomatlas.netlify.app/categories/everyday/)** (`/categories/everyday/`) | **6** | **Yes.** Practical real-life calculators (`fuel-cost`, `bmi-calculator`, `recipe-scaler`, `pace-calculator`, `paint-coverage`, `tile-calculator`). | **Yes (6 tools, growing to 7 with `electricity-cost`).** | Shares consumer utility focus with `tip-calculator` and `discount-calculator` in `Finance`. | None misplaced inside it; should absorb `electricity-cost` from `Computing`. | **KEEP & ABSORB `electricity-cost`** | Clean, relatable category for non-academic daily calculations. |

## 3. Task 1B — Complete Calculator-Level Analysis & 12-Point Specifications for All Proposed Changes

### 3.1 Summary Classification of All 136 Existing Calculators

1. **Exact Mathematical Sub-Output Duplicate (1 pair):**
   - `arc-length` (`/tools/arc-length/`) computes `r*pi*deg/180` from `r` and `deg (°)`, which is 100% identical to the `Arc length` output (`2*pi*r*angle/360`) of `sector-calculator` (`/tools/sector-calculator/`).
2. **Strict Functional Subsets / Near-Duplicates (4 pairs):**
   - `distance-calculator` (`d = v*t`) vs. `speed-calculator` (`v = d/t`) — single algebraic rearrangement of $d = vt$.
   - `resistor-series` (`a+b+c`) vs. `resistor-parallel` (`1/(1/a+1/b+1/c)`) — identical 3-resistor inputs solving series vs. parallel topology.
   - `degree-radian` (one-way `Degrees → Radians, Turns`) vs. `unit-converter` (bidirectional `Angle` converter with 6 angle units).
   - `data-size-calculator` (one-way `GB → MB, kB, B`) vs. `unit-converter` (bidirectional `Data` converter with 10 decimal SI and binary IEC units).
   - `arithmetic-mean` (hardcoded 4 numbers) vs. `statistics-calculator` (1 to 10,000 numbers, outputs Mean + Sum + 12 stats).
3. **Identical-Input Companion Calculators Best Served by Unified Multi-Output Display (2 groups, 5 tools):**
   - **2D Coordinate Trio:** `slope-calculator`, `midpoint-calculator`, and `distance-between-points` all take `(x1, y1, x2, y2)` (`source/make_catalog.py` lines 60–62).
   - **Integer Divisibility Pair:** `gcd-calculator` and `lcm-calculator` both take two integers `(a, b)` (`source/make_catalog.py` lines 52–53).
4. **Misclassified Calculators Requiring Category Relocation (4 tools in `Computing`):**
   - `resistor-series`, `resistor-parallel`, `frequency-wavelength` → `Physics`; `electricity-cost` → `Everyday`.
5. **Calculators Requiring Functional Rework / Bug Fixes (`REWORK`, 18 primary tools + domain validation across 69 formula tools):**
   - Detailed individually below.
6. **Calculators That Look Similar by Formula but Must Remain Separate (`KEEP`, 108 tools):**
   - `square-calculator` vs. `rectangle-calculator` and `cube-calculator` vs. `cuboid-calculator` (1-input UX vs. 2/3-input UX).
   - `percentage-calculator` vs. `percent-change` vs. `percent-difference` vs. `grade-percentage` vs. `discount-calculator` vs. `tax-calculator` vs. `roi-calculator` (distinct user mental models and high-volume search intents).
   - `simple-interest` vs. `compound-interest` vs. `present-value` vs. `cagr-calculator` vs. `inflation-calculator` (distinct financial workflows).
   - `sip-calculator` (monthly beginning-of-period investment) vs. `future-value-annuity` (general periodic ordinary end-of-period annuity).
   - `triangle-calculator` (base/height) vs. `herons-formula` (3 sides) vs. `pythagorean-calculator` (right triangle) vs. `law-of-cosines` (SAS) vs. `law-of-sines` (AAS/ASA).

### 3.2 Mandatory 12-Point Specifications for Every Proposed Merger, Relocation, or Rework (28 Affected Calculators)

Per Task 1B, every calculator proposed for `MERGE`, `RELOCATE`, or major `REWORK` is documented below across all 12 required items:
#### 3.2.1 Arc Length Calculator (`arc-length`)
1. **Calculator Name:** Arc Length Calculator
2. **Calculator ID:** `arc-length`
3. **Existing Route/URL:** [`/tools/arc-length/`](https://axiomatlas.netlify.app/tools/arc-length/)
4. **Current Category:** Trigonometry
5. **Relevant Source Files:** `source/make_catalog.py (line 79), site/assets/app.js (form renderer, line 54), site/tools/arc-length/index.html`
6. **What It Currently Does:** Takes Radius r (default 7) and Angle deg (default 90°) and computes a single output: Arc length = r*pi*deg/180.
7. **Overlapping Calculator(s):** Circle Sector Calculator (`sector-calculator`, `/tools/sector-calculator/`, Geometry, `source/make_catalog.py` line 70), which takes Radius r and Central angle (°) and computes both Sector area (`pi*r^2*angle/360`) and Arc length (`2*pi*r*angle/360`).
8. **Why It Is Overlapping, Misplaced, or Needs Rework:** `arc-length` has the exact same inputs and computes a strict 1-output subset of `sector-calculator`. Worse, despite displaying the formula `s = rθ with θ in radians`, its input field is hardcoded to degrees (`deg|Angle|90|°`)!
9. **Proposed Action:** **MERGE (or Co-Host Unified Component)**
10. **Functionality That Must Be Preserved:** Preserve the `/tools/arc-length/` URL (either via 301 redirect to `/tools/sector-calculator/` or by rendering the unified Sector, Arc Length, Chord & Segment component on both routes with Arc Length highlighted first on `/tools/arc-length/`).
11. **Recommended Destination Calculator / Category:** `sector-calculator` (`/tools/sector-calculator/`, Geometry, cross-linked in Trigonometry)
12. **Potential Impact on Routes, Internal Links, SEO & Users:** If co-hosted with shared renderer: zero broken links and 100% SEO preservation. If 301 redirected in `site/_redirects`: update internal links in `Trigonometry` category and `sitemap.xml`.

#### 3.2.2 Series Resistors Calculator (`resistor-series`)
1. **Calculator Name:** Series Resistors Calculator
2. **Calculator ID:** `resistor-series`
3. **Existing Route/URL:** [`/tools/resistor-series/`](https://axiomatlas.netlify.app/tools/resistor-series/)
4. **Current Category:** Computing
5. **Relevant Source Files:** `source/make_catalog.py (line 146), site/assets/app.js (form renderer, line 54), site/tools/resistor-series/index.html`
6. **What It Currently Does:** Takes 3 hardcoded resistor values a, b, c (100, 220, 330 Ω) and outputs `Equivalent resistance = a+b+c`.
7. **Overlapping Calculator(s):** Parallel Resistors Calculator (`resistor-parallel`, `/tools/resistor-parallel/`, Computing, `source/make_catalog.py` line 147).
8. **Why It Is Overlapping, Misplaced, or Needs Rework:** 1) Misclassified in `Computing` instead of `Physics`; 2) Hardcoded to exactly 3 resistors; 3) Users designing circuits frequently compare series and parallel combinations of the same resistors.
9. **Proposed Action:** **RELOCATE & MERGE**
10. **Functionality That Must Be Preserved:** Preserve fast series resistance calculation while adding dynamic resistor rows (2 to 10 resistors) and a mode toggle (`Series` / `Parallel` / `Compare Both`).
11. **Recommended Destination Calculator / Category:** Relocate to `Physics` category; unify with `resistor-parallel` via a shared `resistors()` renderer in `site/assets/app.js`.
12. **Potential Impact on Routes, Internal Links, SEO & Users:** Because URL `/tools/resistor-series/` is flat (not prefixed by `/categories/computing/`), relocating to `Physics` causes zero URL breakage and improves topical relevance.

#### 3.2.3 Parallel Resistors Calculator (`resistor-parallel`)
1. **Calculator Name:** Parallel Resistors Calculator
2. **Calculator ID:** `resistor-parallel`
3. **Existing Route/URL:** [`/tools/resistor-parallel/`](https://axiomatlas.netlify.app/tools/resistor-parallel/)
4. **Current Category:** Computing
5. **Relevant Source Files:** `source/make_catalog.py (line 147), site/assets/app.js (form renderer, line 54), site/tools/resistor-parallel/index.html`
6. **What It Currently Does:** Takes 3 hardcoded resistor values a, b, c (100, 220, 330 Ω) and outputs `Equivalent resistance = 1/(1/a+1/b+1/c)`.
7. **Overlapping Calculator(s):** Series Resistors Calculator (`resistor-series`, `/tools/resistor-series/`).
8. **Why It Is Overlapping, Misplaced, or Needs Rework:** 1) Misclassified in `Computing` instead of `Physics`; 2) Hardcoded to 3 resistors; 3) Lacks validation for `R > 0` (entering `a=10, b=-10, c=5` outputs `5 Ω`!).
9. **Proposed Action:** **RELOCATE & MERGE**
10. **Functionality That Must Be Preserved:** Preserve parallel resistance formula `1 / Σ(1/R_i)`, add `R_i > 0` validation, support 2–10 resistors, and co-display series resistance.
11. **Recommended Destination Calculator / Category:** Relocate to `Physics` category; share unified `resistors()` renderer with `resistor-series` (or 301 redirect to `/tools/resistor-series/` if single URL preferred).
12. **Potential Impact on Routes, Internal Links, SEO & Users:** Zero broken URLs; fixes negative-resistance validation bug.

#### 3.2.4 Frequency to Wavelength (`frequency-wavelength`)
1. **Calculator Name:** Frequency to Wavelength
2. **Calculator ID:** `frequency-wavelength`
3. **Existing Route/URL:** [`/tools/frequency-wavelength/`](https://axiomatlas.netlify.app/tools/frequency-wavelength/)
4. **Current Category:** Computing
5. **Relevant Source Files:** `source/make_catalog.py (line 148), site/assets/app.js (form renderer, line 54), site/tools/frequency-wavelength/index.html`
6. **What It Currently Does:** Takes Frequency f (default 100,000,000 Hz) and computes electromagnetic vacuum wavelength `Wavelength = 299792458/f` (m).
7. **Overlapping Calculator(s):** Wave Speed Calculator (`wave-speed`, `/tools/wave-speed/`, Physics, `v = f*l`) and Frequency & Period Calculator (`frequency-period`, `/tools/frequency-period/`, Physics, `T = 1/f`).
8. **Why It Is Overlapping, Misplaced, or Needs Rework:** Misclassified in `Computing` — electromagnetic wave relationship $\lambda = c/f$ is a core `Physics` (Waves & Optics / Electromagnetism) tool.
9. **Proposed Action:** **RELOCATE & REWORK**
10. **Functionality That Must Be Preserved:** Preserve $\lambda = c/f$ calculation, add frequency unit selector (`Hz, kHz, MHz, GHz, THz`), wavelength unit selector (`m, cm, mm, nm`), photon energy $E = hf$ output, and validate $f > 0$.
11. **Recommended Destination Calculator / Category:** Relocate from `Computing` to `Physics` (keep `/tools/frequency-wavelength/` URL unchanged).
12. **Potential Impact on Routes, Internal Links, SEO & Users:** Zero URL change; enriches `Physics` waves cluster.

#### 3.2.5 Electricity Cost Calculator (`electricity-cost`)
1. **Calculator Name:** Electricity Cost Calculator
2. **Calculator ID:** `electricity-cost`
3. **Existing Route/URL:** [`/tools/electricity-cost/`](https://axiomatlas.netlify.app/tools/electricity-cost/)
4. **Current Category:** Computing
5. **Relevant Source Files:** `source/make_catalog.py (line 145), site/assets/app.js (form renderer, line 54), site/tools/electricity-cost/index.html`
6. **What It Currently Does:** Takes appliance Power W (1000 W), Hours daily (5 h), Days (30), and Cost per kWh (8) to compute Energy consumed (`kWh`) and Estimated cost.
7. **Overlapping Calculator(s):** Electrical Power Calculator (`electrical-power`, `/tools/electrical-power/`, Physics, `P = V*I, E = V*I*t/1000`).
8. **Why It Is Overlapping, Misplaced, or Needs Rework:** Misclassified in `Computing` — household appliance electricity bill estimation is an `Everyday` utility calculation (parallel to `fuel-cost` in `Everyday`).
9. **Proposed Action:** **RELOCATE & REWORK**
10. **Functionality That Must Be Preserved:** Preserve kWh and cost calculation; validate non-negative inputs (`W >= 0, hours >= 0, days >= 0, rate >= 0`).
11. **Recommended Destination Calculator / Category:** Relocate from `Computing` to `Everyday` (and cross-link with `electrical-power` in `Physics`).
12. **Potential Impact on Routes, Internal Links, SEO & Users:** Zero URL change; makes `Everyday` and `Computing` categories more intuitive.

#### 3.2.6 Distance Calculator (`distance-calculator`)
1. **Calculator Name:** Distance Calculator
2. **Calculator ID:** `distance-calculator`
3. **Existing Route/URL:** [`/tools/distance-calculator/`](https://axiomatlas.netlify.app/tools/distance-calculator/)
4. **Current Category:** Physics
5. **Relevant Source Files:** `source/make_catalog.py (line 84), site/assets/app.js (form renderer, line 54), site/tools/distance-calculator/index.html`
6. **What It Currently Does:** Takes Speed v (16 m/s) and Time t (30 s) and outputs `Distance = v*t` (m).
7. **Overlapping Calculator(s):** Speed Calculator (`speed-calculator`, `/tools/speed-calculator/`, Physics, `source/make_catalog.py` line 83), which takes Distance d and Time t and outputs `Speed = d/t` (m/s and km/h).
8. **Why It Is Overlapping, Misplaced, or Needs Rework:** Both calculators represent the exact same 3-variable uniform motion equation $d = v \cdot t$. Separating them forces users who want to solve for time $t = d/v$ to have no calculator at all!
9. **Proposed Action:** **MERGE (Shared 3-Mode Solve-For Component)**
10. **Functionality That Must Be Preserved:** Preserve direct calculation of Distance ($d = vt$) and Speed ($v = d/t$), and add **Solve for Time ($t = d/v$)** plus unit selectors (`m, km, mi`; `s, min, h`; `m/s, km/h, mph`).
11. **Recommended Destination Calculator / Category:** Unify with `speed-calculator` (`/tools/speed-calculator/` defaults to Solve for Speed; `/tools/distance-calculator/` defaults to Solve for Distance, or 301-redirects to `/tools/speed-calculator/`).
12. **Potential Impact on Routes, Internal Links, SEO & Users:** Co-hosting the 3-mode solver on both URLs preserves 100% of SEO while adding Time solving ($t = d/v$) and unit conversions.

#### 3.2.7 Arithmetic Mean Calculator (`arithmetic-mean`)
1. **Calculator Name:** Arithmetic Mean Calculator
2. **Calculator ID:** `arithmetic-mean`
3. **Existing Route/URL:** [`/tools/arithmetic-mean/`](https://axiomatlas.netlify.app/tools/arithmetic-mean/)
4. **Current Category:** Math & numbers
5. **Relevant Source Files:** `source/make_catalog.py (line 55), site/assets/app.js (form renderer, line 54), site/tools/arithmetic-mean/index.html`
6. **What It Currently Does:** Takes 4 hardcoded numbers `a, b, c, d` (10, 15, 25, 30) and computes `Mean = (a+b+c+d)/4` and `Sum = a+b+c+d`.
7. **Overlapping Calculator(s):** Statistics Calculator (`statistics-calculator`, `/tools/statistics-calculator/`, Statistics) and Geometric Mean Calculator (`geometric-mean`, `/tools/geometric-mean/`).
8. **Why It Is Overlapping, Misplaced, or Needs Rework:** A mean calculator hardcoded to exactly 4 inputs fails whenever a user has 2, 3, 5, or 20 numbers! Meanwhile `statistics-calculator` already accepts 1–10,000 comma/space-separated numbers and computes Mean, Sum, Median, Mode, Variance, SD, and Quartiles.
9. **Proposed Action:** **REWORK (or MERGE into `statistics-calculator`)**
10. **Functionality That Must Be Preserved:** Upgrade `arithmetic-mean` and `geometric-mean` to accept a flexible comma/space-separated list (or dynamic `+ Add number` fields) and compute Arithmetic Mean, Geometric Mean, Harmonic Mean, Root Mean Square (RMS), Count, and Sum simultaneously.
11. **Recommended Destination Calculator / Category:** Keep `/tools/arithmetic-mean/` in `Math & numbers` (cross-listed in `Statistics`) using a shared multi-mean renderer.
12. **Potential Impact on Routes, Internal Links, SEO & Users:** Eliminates the 4-number limitation while keeping the high-search-volume `/tools/arithmetic-mean/` landing page active.

#### 3.2.8 Degree to Radian Converter (`degree-radian`)
1. **Calculator Name:** Degree to Radian Converter
2. **Calculator ID:** `degree-radian`
3. **Existing Route/URL:** [`/tools/degree-radian/`](https://axiomatlas.netlify.app/tools/degree-radian/)
4. **Current Category:** Trigonometry
5. **Relevant Source Files:** `source/make_catalog.py (line 78), site/assets/app.js (form renderer, line 54), site/tools/degree-radian/index.html`
6. **What It Currently Does:** Takes `d` (Angle in degrees, default 180) and outputs `Radians = d*pi/180` and `Turns = d/360`.
7. **Overlapping Calculator(s):** Universal Unit Converter (`unit-converter`, `/tools/unit-converter/`, Converters — `Angle` group).
8. **Why It Is Overlapping, Misplaced, or Needs Rework:** Currently one-way only (`Degrees → Radians`); users with an angle in radians (e.g. `1.5708` or `pi/3`) cannot convert it to degrees!
9. **Proposed Action:** **REWORK (Bidirectional + Exact π Fraction Readout)**
10. **Functionality That Must Be Preserved:** Preserve Degrees → Radians & Turns, add bidirectional Radians → Degrees (supporting `pi` expressions like `pi/6`, `2*pi/3`), Gradians, and Degrees-Minutes-Seconds (`DMS`), and cross-list under `Converters`.
11. **Recommended Destination Calculator / Category:** Primary: `Trigonometry`, Cross-listed: `Converters` (`/tools/degree-radian/`).
12. **Potential Impact on Routes, Internal Links, SEO & Users:** Turns a weak 1-way stub into a specialized angle converter that `unit-converter` does not replicate (specifically symbolic $\pi$ fractions and DMS).

#### 3.2.9 Data Storage Calculator (`data-size-calculator`)
1. **Calculator Name:** Data Storage Calculator
2. **Calculator ID:** `data-size-calculator`
3. **Existing Route/URL:** [`/tools/data-size-calculator/`](https://axiomatlas.netlify.app/tools/data-size-calculator/)
4. **Current Category:** Computing
5. **Relevant Source Files:** `source/make_catalog.py (line 141), site/assets/app.js (form renderer, line 54), site/tools/data-size-calculator/index.html`
6. **What It Currently Does:** Takes `gb` (Gigabytes, default 4) and outputs `Megabytes = gb*1000`, `Kilobytes = gb*1000000`, `Bytes = gb*1000000000`.
7. **Overlapping Calculator(s):** Universal Unit Converter (`unit-converter`, `/tools/unit-converter/`, Converters — `Data` group).
8. **Why It Is Overlapping, Misplaced, or Needs Rework:** Only accepts GB as input and only outputs decimal SI (`1000`-based) MB/kB/B, telling users in a footnote: *'For binary GiB, use the universal unit converter.'*
9. **Proposed Action:** **REWORK (or MERGE into `unit-converter`)**
10. **Functionality That Must Be Preserved:** Upgrade `/tools/data-size-calculator/` to accept any input unit (`bit, B, kB, MB, GB, TB, KiB, MiB, GiB, TiB`) and display a side-by-side **Decimal SI (10³) vs. Binary IEC (2¹⁰)** comparison table so users can immediately see why a '1 TB' drive shows as '931.32 GiB' in their OS!
11. **Recommended Destination Calculator / Category:** Primary: `Computing`, Cross-listed: `Converters` (`/tools/data-size-calculator/`).
12. **Potential Impact on Routes, Internal Links, SEO & Users:** Provides unique side-by-side SI vs. IEC value beyond `unit-converter` while preserving the `/tools/data-size-calculator/` URL.

#### 3.2.10 Slope Calculator, Midpoint Calculator & 2D Distance Calculator (`slope-calculator / midpoint-calculator / distance-between-points`)
1. **Calculator Name:** Slope Calculator, Midpoint Calculator & 2D Distance Calculator
2. **Calculator ID:** `slope-calculator / midpoint-calculator / distance-between-points`
3. **Existing Route/URL:** [`/tools/slope-calculator/, /tools/midpoint-calculator/, /tools/distance-between-points/`](https://axiomatlas.netlify.app/tools/slope-calculator/)
4. **Current Category:** Algebra
5. **Relevant Source Files:** `source/make_catalog.py (lines 60–62), site/assets/app.js (form renderer, line 54)`
6. **What It Currently Does:** All 3 calculators collect the exact same 4 inputs `(x1, y1, x2, y2)` (`Point 1` and `Point 2`), yet each page outputs only 1 piece of information (Slope on `slope-calculator`, Midpoint on `midpoint-calculator`, Distance on `distance-between-points`). Furthermore, `slope-calculator` crashes with a generic error on vertical lines (`x1 = x2`)!
7. **Overlapping Calculator(s):** 100% identical input fields `(x1, y1, x2, y2)` across all 3 calculators.
8. **Why It Is Overlapping, Misplaced, or Needs Rework:** Students solving coordinate geometry problems almost always need the slope, distance, midpoint, and line equation for the same two points.
9. **Proposed Action:** **MERGE WORKFLOW (Co-Display All Outputs on All 3 Routes)**
10. **Functionality That Must Be Preserved:** Keep all 3 URLs active for specific search intent, place the page's primary metric at the top of `.answer-card`, and automatically include the companion metrics (`Slope m`, `Angle of inclination θ`, `Line equation y = mx + b`, `Distance d`, `Midpoint (xm, ym)`, `Δx`, `Δy`) below, handling vertical lines ($x_1 = x_2 \implies 	ext{Slope: Undefined (vertical line } x = x_1	ext{)}$) cleanly.
11. **Recommended Destination Calculator / Category:** `Algebra` (cross-listed in `Geometry`).
12. **Potential Impact on Routes, Internal Links, SEO & Users:** Zero broken URLs; fixes vertical-line division-by-zero crash; 3x more useful per visit.

#### 3.2.11 GCD Calculator & LCM Calculator (`gcd-calculator / lcm-calculator`)
1. **Calculator Name:** GCD Calculator & LCM Calculator
2. **Calculator ID:** `gcd-calculator / lcm-calculator`
3. **Existing Route/URL:** [`/tools/gcd-calculator/, /tools/lcm-calculator/`](https://axiomatlas.netlify.app/tools/gcd-calculator/)
4. **Current Category:** Math & numbers
5. **Relevant Source Files:** `source/make_catalog.py (lines 52–53), site/assets/engine.js (line 2)`
6. **What It Currently Does:** Both take two integers `(a, b)` and run the Euclidean algorithm (`gcd(a,b)` and `abs(a*b)/gcd(a,b)`). `lcm-calculator` crashes on `(0, 0)`.
7. **Overlapping Calculator(s):** Identical inputs `(a, b)` and shared `gcd(a, b)` dependency.
8. **Why It Is Overlapping, Misplaced, or Needs Rework:** Users calculating GCD frequently need LCM (and vice versa), and often have 3 or more integers.
9. **Proposed Action:** **MERGE WORKFLOW (Co-Display GCD & LCM + Support 2..10 Integers)**
10. **Functionality That Must Be Preserved:** Keep both `/tools/gcd-calculator/` and `/tools/lcm-calculator/` active; co-display both GCD and LCM (with primary metric first), support 2+ integers, and handle `(0, 0)` cleanly (`LCM(0, 0) = 0`).
11. **Recommended Destination Calculator / Category:** `Math & numbers` (cross-linked).
12. **Potential Impact on Routes, Internal Links, SEO & Users:** Zero broken URLs; fixes `lcm(0,0)` crash.

#### 3.2.12 Prime Number Checker (`prime-checker`)
1. **Calculator Name:** Prime Number Checker
2. **Calculator ID:** `prime-checker`
3. **Existing Route/URL:** [`/tools/prime-checker/`](https://axiomatlas.netlify.app/tools/prime-checker/)
4. **Current Category:** Math & numbers
5. **Relevant Source Files:** `source/make_catalog.py (line 33), site/assets/app.js (line 77), site/assets/engine.js (line 45)`
6. **What It Currently Does:** Takes integer `n` (`0..10^12`) and outputs only `Primality: Prime number / Not prime` and `Number tested: n`.
7. **Overlapping Calculator(s):** None.
8. **Why It Is Overlapping, Misplaced, or Needs Rework:** Catalog description (`source/make_catalog.py` line 33) explicitly promises: `'Determine whether an integer is prime and list its small factors'`, but `prime()` in `app.js` never computes or displays any factors!
9. **Proposed Action:** **REWORK**
10. **Functionality That Must Be Preserved:** Preserve `isPrime(n)` check and add deterministic prime factorization ($n = p_1^{e_1} \cdots p_k^{e_k}$), divisor list, divisor count $	au(n)$, divisor sum $\sigma(n)$, and previous/next prime.
11. **Recommended Destination Calculator / Category:** `Math & numbers` (`/tools/prime-checker/`).
12. **Potential Impact on Routes, Internal Links, SEO & Users:** Fulfills the existing page description and meta tag promise.

#### 3.2.13 Trigonometry Calculator (`trigonometry-calculator`)
1. **Calculator Name:** Trigonometry Calculator
2. **Calculator ID:** `trigonometry-calculator`
3. **Existing Route/URL:** [`/tools/trigonometry-calculator/`](https://axiomatlas.netlify.app/tools/trigonometry-calculator/)
4. **Current Category:** Trigonometry
5. **Relevant Source Files:** `source/make_catalog.py (line 37), site/assets/app.js (line 81)`
6. **What It Currently Does:** Takes `Angle` (30) and `Angle units` (`Degrees` / `Radians`) and outputs `sin θ`, `cos θ`, `tan θ`, `cosec θ`, `sec θ`.
7. **Overlapping Calculator(s):** Scientific Calculator (`scientific-calculator`).
8. **Why It Is Overlapping, Misplaced, or Needs Rework:** 1) Description promises `'Compute sine, cosine, tangent, inverse trig and reciprocal ratios'`, but `cot θ` and all inverse trig functions (`arcsin`, `arccos`, `arctan`) are missing! 2) Outputs floating-point noise `6.1232340e-17` for `cos(90°)` and `1.2246468e-16` for `sin(180°)`. 
9. **Proposed Action:** **REWORK**
10. **Functionality That Must Be Preserved:** Preserve forward trig ratios, add `cot θ`, snap near-zero values (`|v| < 1e-12`) to `0`, and add an **Inverse Trig Mode** (`sin⁻¹`, `cos⁻¹`, `tan⁻¹`, `cot⁻¹`, `sec⁻¹`, `csc⁻¹`).
11. **Recommended Destination Calculator / Category:** `Trigonometry` (`/tools/trigonometry-calculator/`).
12. **Potential Impact on Routes, Internal Links, SEO & Users:** Fixes floating-point noise at $90^\circ/180^\circ$ and delivers the promised inverse trig functionality.

#### 3.2.14 Numerical Limit Calculator (`limit-calculator`)
1. **Calculator Name:** Numerical Limit Calculator
2. **Calculator ID:** `limit-calculator`
3. **Existing Route/URL:** [`/tools/limit-calculator/`](https://axiomatlas.netlify.app/tools/limit-calculator/)
4. **Current Category:** Graphing & calculus
5. **Relevant Source Files:** `source/make_catalog.py (line 25), site/assets/app.js (line 63)`
6. **What It Currently Does:** Evaluates `left = f(x - h)` and `right = f(x + h)` at a single step `h = 1e-4 * max(1, |x|)` and outputs `Estimated common limit = (left + right) / 2`.
7. **Overlapping Calculator(s):** None.
8. **Why It Is Overlapping, Misplaced, or Needs Rework:** CRITICAL MATHEMATICAL BUG: Averaging `left` and `right` without checking if they converge to the same value causes `1/x` at `x = 0` (`left = -10000, right = +10000`) and `abs(x)/x` at `x = 0` (`left = -1, right = +1`) to report `Estimated common limit: 0`!
9. **Proposed Action:** **REWORK**
10. **Functionality That Must Be Preserved:** Evaluate multi-step approach sequences $h \in \{10^{-2}, 10^{-3}, 10^{-4}, 10^{-5}, 10^{-6}\}$ from both sides; report a common limit only when $|L_- - L_+| < 10^{-5}(1 + |L_+|)$, otherwise explicitly report `'Does not exist (Left limit ≠ Right limit)'` or `'±Infinity (Vertical asymptote)'`.
11. **Recommended Destination Calculator / Category:** `Graphing & calculus` (`/tools/limit-calculator/`).
12. **Potential Impact on Routes, Internal Links, SEO & Users:** Eliminates false limit answers on discontinuous and divergent functions.

#### 3.2.15 Derivative Calculator (`derivative-calculator`)
1. **Calculator Name:** Derivative Calculator
2. **Calculator ID:** `derivative-calculator`
3. **Existing Route/URL:** [`/tools/derivative-calculator/`](https://axiomatlas.netlify.app/tools/derivative-calculator/)
4. **Current Category:** Graphing & calculus
5. **Relevant Source Files:** `source/make_catalog.py (line 23), site/assets/app.js (line 62)`
6. **What It Currently Does:** Computes central difference `(f(x+h) - f(x-h))/(2h)`, `f(x)`, and `Tangent intercept`.
7. **Overlapping Calculator(s):** Function Graphing Calculator (`graphing-calculator`).
8. **Why It Is Overlapping, Misplaced, or Needs Rework:** 1) Description promises `'Estimate derivatives at a point and draw tangent lines'`, but no plot is drawn; 2) Outputs `0` for non-differentiable corners like `abs(x)` at `x = 0`.
9. **Proposed Action:** **REWORK**
10. **Functionality That Must Be Preserved:** Compare left and right derivatives to detect corners/cusps, add second derivative $f''(x)$, and render a compact 2D Canvas showing $y = f(x)$ and its tangent line at $x_0$.
11. **Recommended Destination Calculator / Category:** `Graphing & calculus` (`/tools/derivative-calculator/`).
12. **Potential Impact on Routes, Internal Links, SEO & Users:** Fulfills the tangent-line visualization promise and fixes non-differentiable corner detection.

#### 3.2.16 Number Base Converter & HEX / RGB Color Converter (`number-base-converter / color-converter`)
1. **Calculator Name:** Number Base Converter & HEX / RGB Color Converter
2. **Calculator ID:** `number-base-converter / color-converter`
3. **Existing Route/URL:** [`/tools/number-base-converter/, /tools/color-converter/`](https://axiomatlas.netlify.app/tools/number-base-converter/)
4. **Current Category:** Computing
5. **Relevant Source Files:** `source/make_catalog.py (lines 31, 39), site/assets/app.js (lines 75, 83)`
6. **What It Currently Does:** `number-base-converter` converts integers between bases `[2, 8, 10, 16, 36]`; `color-converter` converts `<input type='color'>` to HEX/RGB/HSL.
7. **Overlapping Calculator(s):** None.
8. **Why It Is Overlapping, Misplaced, or Needs Rework:** `number-base-converter` description says `'bases 2–36'` but dropdown only has 5 options; `color-converter` has no text fields to type or paste a HEX, RGB, or HSL code!
9. **Proposed Action:** **REWORK**
10. **Functionality That Must Be Preserved:** In `number-base-converter`, populate all bases `2..36` and show simultaneous Binary/Octal/Decimal/Hex results. In `color-converter`, add editable HEX, RGB, and HSL text inputs alongside the color swatch.
11. **Recommended Destination Calculator / Category:** `Computing` (cross-listed in `Converters`).
12. **Potential Impact on Routes, Internal Links, SEO & Users:** Fixes major usability barriers on both tools.

### 3.3 Complete 136-Calculator Audit Table (Individual Classification)

Every one of the 136 calculators in `site/assets/catalog.json` is accounted for below with its exact ID (`slug`), route, current category, proposed action (`KEEP`, `MERGE`, `RELOCATE`, `REWORK`), and target category:

| # | Calculator ID (`slug`) | Calculator Name | Current Category | Proposed Action | Target Category | Technical & UX Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `scientific-calculator` | [Scientific Calculator](https://axiomatlas.netlify.app/tools/scientific-calculator/) | Math & numbers | **REWORK** | Math & numbers | Fix <1e-13 zero-clamping in engine.js, fix √9 without parens, fix % key, fix tan(90°), add inverse trig keys & live preview |
| 2 | `equation-solver` | [Equation Solver](https://axiomatlas.netlify.app/tools/equation-solver/) | Algebra | **REWORK** | Algebra | Fix x(x+1) implicit mul, detect even-multiplicity roots like (x-2.003)^2=0, add keypad & Degrees/Radians toggle |
| 3 | `quadratic-equation` | [Quadratic Equation Solver](https://axiomatlas.netlify.app/tools/quadratic-equation/) | Algebra | **KEEP** | Algebra | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 4 | `linear-system` | [Simultaneous Equation Solver](https://axiomatlas.netlify.app/tools/linear-system/) | Algebra | **REWORK** | Algebra | Distinguish 'No solution' vs 'Infinitely many solutions' when det(A)=0; cross-list in Linear algebra |
| 5 | `expression-simplifier` | [Expression Evaluator](https://axiomatlas.netlify.app/tools/expression-simplifier/) | Algebra | **REWORK** | Algebra | Dynamically detect and render input fields for all variables in expression (e.g. x, y, z) instead of only x |
| 6 | `graphing-calculator` | [Function Graphing Calculator](https://axiomatlas.netlify.app/tools/graphing-calculator/) | Graphing & calculus | **REWORK** | Graphing & calculus | Do not fail result card when f(0) is undefined (e.g. 1/x); add touch pinch-zoom and hover coordinates |
| 7 | `derivative-calculator` | [Derivative Calculator](https://axiomatlas.netlify.app/tools/derivative-calculator/) | Graphing & calculus | **REWORK** | Graphing & calculus | Add tangent-line plot promised in description; compare left/right slopes to flag corners like abs(x) at x=0 |
| 8 | `integral-calculator` | [Definite Integral Calculator](https://axiomatlas.netlify.app/tools/integral-calculator/) | Graphing & calculus | **REWORK** | Graphing & calculus | Compare n=500 vs n=1000 Simpson sums to detect divergent improper integrals like 1/x^2 on [-1, 1.001] |
| 9 | `limit-calculator` | [Numerical Limit Calculator](https://axiomatlas.netlify.app/tools/limit-calculator/) | Graphing & calculus | **REWORK** | Graphing & calculus | CRITICAL: Check multi-step left/right convergence instead of outputting (left+right)/2 = 0 on 1/x and abs(x)/x |
| 10 | `matrix-calculator` | [Matrix Calculator](https://axiomatlas.netlify.app/tools/matrix-calculator/) | Linear algebra | **REWORK** | Linear algebra | Render output as 2D bracketed matrix table; preserve user entries on size/op change; support 4×4 |
| 11 | `statistics-calculator` | [Statistics Calculator](https://axiomatlas.netlify.app/tools/statistics-calculator/) | Statistics | **REWORK** | Statistics | Add IQR, geometric/harmonic mean, and guard against thousand-separator comma misparsing |
| 12 | `correlation-calculator` | [Correlation & Regression](https://axiomatlas.netlify.app/tools/correlation-calculator/) | Statistics | **REWORK** | Statistics | Add scatter plot with fitted regression line canvas and standard error of slope |
| 13 | `probability-calculator` | [Binomial Probability](https://axiomatlas.netlify.app/tools/probability-calculator/) | Statistics | **REWORK** | Statistics | Add cumulative binomial probabilities P(X <= k), P(X < k), P(X >= k), P(X > k) |
| 14 | `unit-converter` | [Universal Unit Converter](https://axiomatlas.netlify.app/tools/unit-converter/) | Converters | **REWORK** | Converters | Add multi-unit simultaneous conversion table alongside single target unit |
| 15 | `number-base-converter` | [Number Base Converter](https://axiomatlas.netlify.app/tools/number-base-converter/) | Computing | **REWORK** | Computing | Populate all bases 2–36 in dropdown (as promised in description) instead of only 2, 8, 10, 16, 36 |
| 16 | `fraction-calculator` | [Fraction Calculator](https://axiomatlas.netlify.app/tools/fraction-calculator/) | Math & numbers | **REWORK** | Math & numbers | Support mixed numbers (e.g. 1 3/4) and safe BigInt decimal scaling for >308-digit fractions |
| 17 | `prime-checker` | [Prime Number Checker](https://axiomatlas.netlify.app/tools/prime-checker/) | Math & numbers | **REWORK** | Math & numbers | CRITICAL: Implement prime factorization & divisor list promised in description ('list its small factors') |
| 18 | `date-difference` | [Date Difference Calculator](https://axiomatlas.netlify.app/tools/date-difference/) | Date & time | **KEEP** | Date & time | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 19 | `age-calculator` | [Age Calculator](https://axiomatlas.netlify.app/tools/age-calculator/) | Date & time | **KEEP** | Date & time | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 20 | `random-number-generator` | [Random Number Generator](https://axiomatlas.netlify.app/tools/random-number-generator/) | Math & numbers | **KEEP** | Math & numbers | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 21 | `trigonometry-calculator` | [Trigonometry Calculator](https://axiomatlas.netlify.app/tools/trigonometry-calculator/) | Trigonometry | **REWORK** | Trigonometry | CRITICAL: Add cot θ and inverse trig (arcsin, arccos, arctan) promised in description; snap cos(90°)/sin(180°) to 0 |
| 22 | `vector-calculator` | [Vector Calculator](https://axiomatlas.netlify.app/tools/vector-calculator/) | Linear algebra | **REWORK** | Linear algebra | Handle zero vectors gracefully before angle division; add 2D/3D toggle and unit vector output |
| 23 | `color-converter` | [HEX / RGB Color Converter](https://axiomatlas.netlify.app/tools/color-converter/) | Computing | **REWORK** | Computing | Add editable HEX, RGB, and HSL text fields alongside the native <input type='color'> picker |
| 24 | `percentage-calculator` | [Percentage Calculator](https://axiomatlas.netlify.app/tools/percentage-calculator/) | Math & numbers | **KEEP** | Math & numbers | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 25 | `percent-change` | [Percentage Change Calculator](https://axiomatlas.netlify.app/tools/percent-change/) | Math & numbers | **KEEP** | Math & numbers | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 26 | `percent-difference` | [Percentage Difference Calculator](https://axiomatlas.netlify.app/tools/percent-difference/) | Math & numbers | **KEEP** | Math & numbers | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 27 | `ratio-calculator` | [Ratio Calculator](https://axiomatlas.netlify.app/tools/ratio-calculator/) | Math & numbers | **KEEP** | Math & numbers | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 28 | `proportion-calculator` | [Proportion Calculator](https://axiomatlas.netlify.app/tools/proportion-calculator/) | Math & numbers | **KEEP** | Math & numbers | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 29 | `weighted-average` | [Weighted Average Calculator](https://axiomatlas.netlify.app/tools/weighted-average/) | Math & numbers | **REWORK** | Math & numbers | Replace hardcoded 3 rows with dynamic '+ Add row' (2 to 50 rows) and validate sum of weights > 0 |
| 30 | `nth-root` | [Nth Root Calculator](https://axiomatlas.netlify.app/tools/nth-root/) | Math & numbers | **REWORK** | Math & numbers | Support real odd roots of negative numbers (e.g. (-8)^(1/3) = -2) via nthroot(x, n) |
| 31 | `power-calculator` | [Power & Exponent Calculator](https://axiomatlas.netlify.app/tools/power-calculator/) | Math & numbers | **KEEP** | Math & numbers | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 32 | `logarithm-calculator` | [Logarithm Calculator](https://axiomatlas.netlify.app/tools/logarithm-calculator/) | Math & numbers | **KEEP** | Math & numbers | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 33 | `factorial-calculator` | [Factorial Calculator](https://axiomatlas.netlify.app/tools/factorial-calculator/) | Math & numbers | **KEEP** | Math & numbers | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 34 | `permutation-calculator` | [Permutation Calculator](https://axiomatlas.netlify.app/tools/permutation-calculator/) | Math & numbers | **KEEP** | Math & numbers | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 35 | `combination-calculator` | [Combination Calculator](https://axiomatlas.netlify.app/tools/combination-calculator/) | Math & numbers | **KEEP** | Math & numbers | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 36 | `gcd-calculator` | [GCD Calculator](https://axiomatlas.netlify.app/tools/gcd-calculator/) | Math & numbers | **MERGE (Co-Display)** | Math & numbers | Co-display both GCD and LCM + Bézout identity for 2..10 integers |
| 37 | `lcm-calculator` | [LCM Calculator](https://axiomatlas.netlify.app/tools/lcm-calculator/) | Math & numbers | **MERGE (Co-Display)** | Math & numbers | Co-display both LCM and GCD for 2..10 integers; fix lcm(0,0) = 0 |
| 38 | `modulo-calculator` | [Modulo Calculator](https://axiomatlas.netlify.app/tools/modulo-calculator/) | Math & numbers | **REWORK** | Math & numbers | CRITICAL: Fix quotient/remainder mismatch for negative divisors (use q = (a - mod(a,b))/b so a = qb + r holds) |
| 39 | `arithmetic-mean` | [Arithmetic Mean Calculator](https://axiomatlas.netlify.app/tools/arithmetic-mean/) | Math & numbers | **REWORK** | Math & numbers | Replace hardcoded 4 fields with flexible comma/space-separated number list (or merge into statistics-calculator) |
| 40 | `geometric-mean` | [Geometric Mean Calculator](https://axiomatlas.netlify.app/tools/geometric-mean/) | Math & numbers | **REWORK** | Math & numbers | Replace hardcoded 3 fields with flexible comma/space-separated number list |
| 41 | `linear-equation` | [Linear Equation Calculator](https://axiomatlas.netlify.app/tools/linear-equation/) | Algebra | **KEEP** | Algebra | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 42 | `polynomial-evaluation` | [Polynomial Value Calculator](https://axiomatlas.netlify.app/tools/polynomial-evaluation/) | Algebra | **KEEP** | Algebra | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 43 | `arithmetic-sequence` | [Arithmetic Sequence Calculator](https://axiomatlas.netlify.app/tools/arithmetic-sequence/) | Algebra | **KEEP** | Algebra | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 44 | `geometric-sequence` | [Geometric Sequence Calculator](https://axiomatlas.netlify.app/tools/geometric-sequence/) | Algebra | **KEEP** | Algebra | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 45 | `slope-calculator` | [Slope Calculator](https://axiomatlas.netlify.app/tools/slope-calculator/) | Algebra | **MERGE (Co-Display)** | Algebra | Co-display Slope, Midpoint, Distance, and Line Equation for (x1,y1,x2,y2); handle vertical line x1=x2 |
| 46 | `midpoint-calculator` | [Midpoint Calculator](https://axiomatlas.netlify.app/tools/midpoint-calculator/) | Algebra | **MERGE (Co-Display)** | Algebra | Co-display Midpoint, Slope, and Distance for (x1,y1,x2,y2) |
| 47 | `distance-between-points` | [2D Distance Calculator](https://axiomatlas.netlify.app/tools/distance-between-points/) | Algebra | **MERGE (Co-Display)** | Algebra | Co-display Distance, Midpoint, and Slope for (x1,y1,x2,y2); cross-list in Geometry |
| 48 | `exponential-growth` | [Exponential Growth Calculator](https://axiomatlas.netlify.app/tools/exponential-growth/) | Algebra | **KEEP** | Algebra | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 49 | `rectangle-calculator` | [Rectangle Calculator](https://axiomatlas.netlify.app/tools/rectangle-calculator/) | Geometry | **KEEP** | Geometry | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 50 | `square-calculator` | [Square Calculator](https://axiomatlas.netlify.app/tools/square-calculator/) | Geometry | **KEEP** | Geometry | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 51 | `triangle-calculator` | [Triangle Area Calculator](https://axiomatlas.netlify.app/tools/triangle-calculator/) | Geometry | **KEEP** | Geometry | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 52 | `herons-formula` | [Heron’s Formula Calculator](https://axiomatlas.netlify.app/tools/herons-formula/) | Geometry | **KEEP** | Geometry | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 53 | `circle-calculator` | [Circle Calculator](https://axiomatlas.netlify.app/tools/circle-calculator/) | Geometry | **KEEP** | Geometry | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 54 | `ellipse-calculator` | [Ellipse Calculator](https://axiomatlas.netlify.app/tools/ellipse-calculator/) | Geometry | **KEEP** | Geometry | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 55 | `trapezoid-calculator` | [Trapezoid Area Calculator](https://axiomatlas.netlify.app/tools/trapezoid-calculator/) | Geometry | **KEEP** | Geometry | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 56 | `parallelogram-calculator` | [Parallelogram Area Calculator](https://axiomatlas.netlify.app/tools/parallelogram-calculator/) | Geometry | **REWORK** | Geometry | Add geometric feasibility validation h <= s (altitude cannot exceed slant side) |
| 57 | `sector-calculator` | [Circle Sector Calculator](https://axiomatlas.netlify.app/tools/sector-calculator/) | Geometry | **MERGE** | Geometry | Host unified Circle Sector, Arc Length, Chord & Segment calculator with Degrees/Radians toggle |
| 58 | `pythagorean-calculator` | [Pythagorean Theorem Calculator](https://axiomatlas.netlify.app/tools/pythagorean-calculator/) | Geometry | **KEEP** | Geometry | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 59 | `cube-calculator` | [Cube Calculator](https://axiomatlas.netlify.app/tools/cube-calculator/) | Geometry | **KEEP** | Geometry | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 60 | `cuboid-calculator` | [Rectangular Prism Calculator](https://axiomatlas.netlify.app/tools/cuboid-calculator/) | Geometry | **KEEP** | Geometry | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 61 | `sphere-calculator` | [Sphere Calculator](https://axiomatlas.netlify.app/tools/sphere-calculator/) | Geometry | **KEEP** | Geometry | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 62 | `cylinder-calculator` | [Cylinder Calculator](https://axiomatlas.netlify.app/tools/cylinder-calculator/) | Geometry | **KEEP** | Geometry | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 63 | `cone-calculator` | [Cone Calculator](https://axiomatlas.netlify.app/tools/cone-calculator/) | Geometry | **KEEP** | Geometry | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 64 | `pyramid-calculator` | [Square Pyramid Calculator](https://axiomatlas.netlify.app/tools/pyramid-calculator/) | Geometry | **KEEP** | Geometry | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 65 | `torus-calculator` | [Torus Calculator](https://axiomatlas.netlify.app/tools/torus-calculator/) | Geometry | **KEEP** | Geometry | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 66 | `regular-polygon` | [Regular Polygon Calculator](https://axiomatlas.netlify.app/tools/regular-polygon/) | Geometry | **KEEP** | Geometry | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 67 | `degree-radian` | [Degree to Radian Converter](https://axiomatlas.netlify.app/tools/degree-radian/) | Trigonometry | **REWORK** | Trigonometry | Upgrade from one-way Degrees->Radians to bidirectional Degrees <-> Radians/DMS/Turns with exact π fractions |
| 68 | `arc-length` | [Arc Length Calculator](https://axiomatlas.netlify.app/tools/arc-length/) | Trigonometry | **MERGE** | Geometry / Trigonometry | Exact 1-output subset of sector-calculator; share unified Sector, Arc Length & Chord renderer |
| 69 | `law-of-cosines` | [Law of Cosines Calculator](https://axiomatlas.netlify.app/tools/law-of-cosines/) | Trigonometry | **KEEP** | Trigonometry | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 70 | `law-of-sines` | [Law of Sines Calculator](https://axiomatlas.netlify.app/tools/law-of-sines/) | Trigonometry | **KEEP** | Trigonometry | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 71 | `speed-calculator` | [Speed Calculator](https://axiomatlas.netlify.app/tools/speed-calculator/) | Physics | **MERGE** | Physics | Host unified 3-mode Speed, Distance & Time solver (d = v*t) with unit selectors |
| 72 | `distance-calculator` | [Distance Calculator](https://axiomatlas.netlify.app/tools/distance-calculator/) | Physics | **MERGE** | Physics | Share unified 3-mode Speed, Distance & Time solver with speed-calculator |
| 73 | `acceleration-calculator` | [Acceleration Calculator](https://axiomatlas.netlify.app/tools/acceleration-calculator/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 74 | `displacement-calculator` | [Displacement Calculator](https://axiomatlas.netlify.app/tools/displacement-calculator/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 75 | `force-calculator` | [Force Calculator](https://axiomatlas.netlify.app/tools/force-calculator/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 76 | `work-calculator` | [Work Calculator](https://axiomatlas.netlify.app/tools/work-calculator/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 77 | `kinetic-energy` | [Kinetic Energy Calculator](https://axiomatlas.netlify.app/tools/kinetic-energy/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 78 | `potential-energy` | [Gravitational Potential Energy](https://axiomatlas.netlify.app/tools/potential-energy/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 79 | `momentum-calculator` | [Momentum Calculator](https://axiomatlas.netlify.app/tools/momentum-calculator/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 80 | `density-calculator` | [Density Calculator](https://axiomatlas.netlify.app/tools/density-calculator/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 81 | `pressure-calculator` | [Pressure Calculator](https://axiomatlas.netlify.app/tools/pressure-calculator/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 82 | `mechanical-power` | [Power Calculator](https://axiomatlas.netlify.app/tools/mechanical-power/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 83 | `ohms-law` | [Ohm’s Law Calculator](https://axiomatlas.netlify.app/tools/ohms-law/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 84 | `electrical-power` | [Electrical Power Calculator](https://axiomatlas.netlify.app/tools/electrical-power/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 85 | `wave-speed` | [Wave Speed Calculator](https://axiomatlas.netlify.app/tools/wave-speed/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 86 | `frequency-period` | [Frequency & Period Calculator](https://axiomatlas.netlify.app/tools/frequency-period/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 87 | `pendulum-period` | [Simple Pendulum Calculator](https://axiomatlas.netlify.app/tools/pendulum-period/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 88 | `projectile-range` | [Projectile Motion Calculator](https://axiomatlas.netlify.app/tools/projectile-range/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 89 | `gravitational-force` | [Universal Gravitation Calculator](https://axiomatlas.netlify.app/tools/gravitational-force/) | Physics | **REWORK** | Physics | CRITICAL: Remove <1e-13 clamp in engine.js so small gravitational forces do not output 0 N; validate m1,m2,r > 0 |
| 90 | `heat-energy` | [Heat Energy Calculator](https://axiomatlas.netlify.app/tools/heat-energy/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 91 | `ideal-gas` | [Ideal Gas Law Calculator](https://axiomatlas.netlify.app/tools/ideal-gas/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 92 | `buoyant-force` | [Buoyant Force Calculator](https://axiomatlas.netlify.app/tools/buoyant-force/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 93 | `torque-calculator` | [Torque Calculator](https://axiomatlas.netlify.app/tools/torque-calculator/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 94 | `spring-force` | [Hooke’s Law Calculator](https://axiomatlas.netlify.app/tools/spring-force/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 95 | `centripetal-force` | [Centripetal Force Calculator](https://axiomatlas.netlify.app/tools/centripetal-force/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 96 | `snells-law` | [Snell’s Law Calculator](https://axiomatlas.netlify.app/tools/snells-law/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 97 | `thin-lens` | [Thin Lens Equation Calculator](https://axiomatlas.netlify.app/tools/thin-lens/) | Physics | **KEEP** | Physics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 98 | `z-score` | [Z-Score Calculator](https://axiomatlas.netlify.app/tools/z-score/) | Statistics | **KEEP** | Statistics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 99 | `standard-error` | [Standard Error Calculator](https://axiomatlas.netlify.app/tools/standard-error/) | Statistics | **KEEP** | Statistics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 100 | `confidence-interval` | [95% Confidence Interval Calculator](https://axiomatlas.netlify.app/tools/confidence-interval/) | Statistics | **KEEP** | Statistics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 101 | `probability-calculator-basic` | [Basic Probability Calculator](https://axiomatlas.netlify.app/tools/probability-calculator-basic/) | Statistics | **KEEP** | Statistics | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 102 | `simple-interest` | [Simple Interest Calculator](https://axiomatlas.netlify.app/tools/simple-interest/) | Finance | **KEEP** | Finance | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 103 | `compound-interest` | [Compound Interest Calculator](https://axiomatlas.netlify.app/tools/compound-interest/) | Finance | **KEEP** | Finance | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 104 | `emi-calculator` | [Loan EMI Calculator](https://axiomatlas.netlify.app/tools/emi-calculator/) | Finance | **KEEP** | Finance | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 105 | `sip-calculator` | [SIP Investment Calculator](https://axiomatlas.netlify.app/tools/sip-calculator/) | Finance | **KEEP** | Finance | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 106 | `roi-calculator` | [ROI Calculator](https://axiomatlas.netlify.app/tools/roi-calculator/) | Finance | **KEEP** | Finance | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 107 | `cagr-calculator` | [CAGR Calculator](https://axiomatlas.netlify.app/tools/cagr-calculator/) | Finance | **KEEP** | Finance | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 108 | `discount-calculator` | [Discount Calculator](https://axiomatlas.netlify.app/tools/discount-calculator/) | Finance | **KEEP** | Finance | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 109 | `tax-calculator` | [GST / Sales Tax Calculator](https://axiomatlas.netlify.app/tools/tax-calculator/) | Finance | **KEEP** | Finance | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 110 | `profit-margin` | [Profit Margin Calculator](https://axiomatlas.netlify.app/tools/profit-margin/) | Finance | **KEEP** | Finance | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 111 | `break-even` | [Break-Even Calculator](https://axiomatlas.netlify.app/tools/break-even/) | Finance | **KEEP** | Finance | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 112 | `inflation-calculator` | [Inflation Calculator](https://axiomatlas.netlify.app/tools/inflation-calculator/) | Finance | **KEEP** | Finance | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 113 | `present-value` | [Present Value Calculator](https://axiomatlas.netlify.app/tools/present-value/) | Finance | **KEEP** | Finance | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 114 | `future-value-annuity` | [Future Value of Annuity](https://axiomatlas.netlify.app/tools/future-value-annuity/) | Finance | **KEEP** | Finance | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 115 | `rule-of-72` | [Rule of 72 Calculator](https://axiomatlas.netlify.app/tools/rule-of-72/) | Finance | **KEEP** | Finance | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 116 | `tip-calculator` | [Tip & Bill Split Calculator](https://axiomatlas.netlify.app/tools/tip-calculator/) | Finance | **KEEP** | Finance | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 117 | `attendance-calculator` | [Attendance Calculator](https://axiomatlas.netlify.app/tools/attendance-calculator/) | Education | **KEEP** | Education | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 118 | `cgpa-percentage` | [CGPA to Percentage Calculator](https://axiomatlas.netlify.app/tools/cgpa-percentage/) | Education | **KEEP** | Education | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 119 | `grade-percentage` | [Marks Percentage Calculator](https://axiomatlas.netlify.app/tools/grade-percentage/) | Education | **KEEP** | Education | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 120 | `target-grade` | [Target Exam Score Calculator](https://axiomatlas.netlify.app/tools/target-grade/) | Education | **KEEP** | Education | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 121 | `study-time-calculator` | [Study Time Calculator](https://axiomatlas.netlify.app/tools/study-time-calculator/) | Education | **KEEP** | Education | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 122 | `download-time` | [Download Time Calculator](https://axiomatlas.netlify.app/tools/download-time/) | Computing | **KEEP** | Computing | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 123 | `data-size-calculator` | [Data Storage Calculator](https://axiomatlas.netlify.app/tools/data-size-calculator/) | Computing | **REWORK** | Computing | Upgrade from one-way GB-only stub to full bidirectional SI (1000) vs Binary IEC (1024) comparison table |
| 124 | `pixel-density` | [PPI Calculator](https://axiomatlas.netlify.app/tools/pixel-density/) | Computing | **KEEP** | Computing | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 125 | `aspect-ratio` | [Aspect Ratio Calculator](https://axiomatlas.netlify.app/tools/aspect-ratio/) | Computing | **KEEP** | Computing | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 126 | `electricity-cost` | [Electricity Cost Calculator](https://axiomatlas.netlify.app/tools/electricity-cost/) | Computing | **RELOCATE & REWORK** | Everyday | Household appliance kWh/bill estimator misclassified in Computing; move to Everyday |
| 127 | `resistor-series` | [Series Resistors Calculator](https://axiomatlas.netlify.app/tools/resistor-series/) | Computing | **RELOCATE & MERGE** | Physics | Electronics tool misclassified in Computing; unify with resistor-parallel into multi-resistor Series/Parallel calculator |
| 128 | `resistor-parallel` | [Parallel Resistors Calculator](https://axiomatlas.netlify.app/tools/resistor-parallel/) | Computing | **RELOCATE & MERGE** | Physics | Electronics tool misclassified in Computing; unify with resistor-series and validate R > 0 |
| 129 | `frequency-wavelength` | [Frequency to Wavelength](https://axiomatlas.netlify.app/tools/frequency-wavelength/) | Computing | **RELOCATE & REWORK** | Physics | Electromagnetic wave tool (λ = c/f) misclassified in Computing; move to Physics > Waves & Optics |
| 130 | `compression-ratio` | [Compression Ratio Calculator](https://axiomatlas.netlify.app/tools/compression-ratio/) | Computing | **KEEP** | Computing | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 131 | `fuel-cost` | [Fuel Cost Calculator](https://axiomatlas.netlify.app/tools/fuel-cost/) | Everyday | **KEEP** | Everyday | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 132 | `bmi-calculator` | [BMI Calculator](https://axiomatlas.netlify.app/tools/bmi-calculator/) | Everyday | **KEEP** | Everyday | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 133 | `recipe-scaler` | [Recipe Scaling Calculator](https://axiomatlas.netlify.app/tools/recipe-scaler/) | Everyday | **KEEP** | Everyday | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 134 | `pace-calculator` | [Running Pace Calculator](https://axiomatlas.netlify.app/tools/pace-calculator/) | Everyday | **KEEP** | Everyday | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 135 | `paint-coverage` | [Paint Coverage Calculator](https://axiomatlas.netlify.app/tools/paint-coverage/) | Everyday | **KEEP** | Everyday | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |
| 136 | `tile-calculator` | [Tile Quantity Calculator](https://axiomatlas.netlify.app/tools/tile-calculator/) | Everyday | **KEEP** | Everyday | Retain route and formula; add interactive unit selector, domain validation, and Explain Calculation trace |

## 4. Task 1C — Final Cleanup Proposal & Before/After Inventory

### 4.1 Summary of Proposed Structural Changes

| Metric | Current Production State | Proposed State (Option 1: SEO-Safe Co-Hosting — Recommended) | Proposed State (Option 2: Strict URL Consolidation via 301 Redirects) |
| :--- | :--- | :--- | :--- |
| **Total Categories** | **14** | **14** (All 14 category routes preserved; 0 new categories needed) | **14** |
| **Total Active Calculator Routes** | **136** | **136 active URLs** (9 merged/co-hosted routes share upgraded multi-mode components) | **130 canonical URLs** + **6 permanent 301 redirects** (`arc-length`, `resistor-parallel`, `distance-calculator`, `arithmetic-mean`, `data-size-calculator`, `degree-radian`) |
| **Calculators Retained (`KEEP`)** | — | **95** (enhanced with unit selectors, domain validation & Explain Calculation) | **95** |
| **Calculators Reworked (`REWORK`)** | — | **28** (bugs fixed, missing promised features added, dynamic inputs added) | **26** |
| **Calculators Merged / Co-Hosted (`MERGE`)** | — | **9** (across 4 unified multi-mode components) | **9** (consolidated into 5 destination calculators) |
| **Calculators Relocated (`RELOCATE`)** | — | **4** (`resistor-series`, `resistor-parallel`, `frequency-wavelength` → `Physics`; `electricity-cost` → `Everyday`) | **4** |
| **Calculators Hard-Deleted without Redirect (`REMOVE`)** | — | **0** (Never break indexed URLs) | **0** (6 retired via 301 redirect) |

### 4.2 Proposed Category Count Breakdown (Before vs. After Relocation & Consolidation)

| Category | Current Count | After Relocation (Option 1: Keep All URLs) | After Relocation + Strict Consolidation (Option 2) | Planned New Additions (Task 3 / Gate C) | Final Target Count |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Math & numbers** | 21 | 21 | 20 (`arithmetic-mean` → `statistics-calculator`) | +3 (`complex-number-calculator`, `error-propagation-calculator`, `modular-congruence-solver`) | **23–24** |
| **Algebra** | 12 | 12 | 12 | +2 (`polynomial-solver`, `partial-fractions-calculator`) | **14** |
| **Graphing & calculus** | 4 | 4 | 4 | +2 (`ode-solver`, `taylor-series-gradient-calculator`) | **6** |
| **Geometry** | 18 | 18 | 18 | +0 (Cross-link `triangle-solver` and 2D coordinate tools) | **18** |
| **Trigonometry** | 5 | 5 | 3 (`arc-length` → `sector-calculator`, `degree-radian` → `unit-converter`) | +1 (`triangle-solver`) | **4–6** |
| **Physics** | 27 | **30** (+3 from `Computing`) | **28** (`resistor-parallel` → `resistor-series`, `distance-calculator` → `speed-calculator`) | +2 (`suvat-kinematics-solver`, `rlc-circuit-calculator`) | **30–32** |
| **Linear algebra** | 2 | 2 (+1 cross-listed `linear-system`) | 2 (+1 cross-listed) | +1 (`eigenvalue-decomposition-calculator`) | **3 (+1 cross-listed)** |
| **Statistics** | 7 | 7 | 7 | +1 (`hypothesis-test-calculator`) | **8** |
| **Finance** | 15 | 15 | 15 | +2 (`npv-irr-calculator`, `loan-amortization-prepayment-calculator`) | **17** |
| **Converters** | 1 | **1 primary + 5 cross-listed** (`6` visible on page) | **1 primary + 3 cross-listed** | +0 (`unit-converter` expanded in place with engineering unit groups) | **1 primary (6 visible)** |
| **Computing** | 11 | **7** (−4 relocated to `Physics`/`Everyday`) | **6** (`data-size-calculator` → `unit-converter`) | +2 (`bitwise-ieee754-calculator`, `subnet-calculator`) | **8–9** |
| **Education** | 5 | 5 | 5 | +0 | **5** |
| **Date & time** | 2 | 2 | 2 | +0 | **2** |
| **Everyday** | 6 | **7** (+1 `electricity-cost` from `Computing`) | **7** | +0 | **7** |
| **Total** | **136** | **136** | **130 (+6 redirects)** | **+16 Advanced Calculators** | **146–152** |
