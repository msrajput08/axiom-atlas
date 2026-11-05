# AxiomAtlas Input UX, Mathematical Expression Entry & Calculator-Block Proposal (Gate B)

**Repository:** `msrajput08/axiom-atlas` (Branch: `audit/optimization-and-upgrade-proposals`)
**Live Website:** [AxiomAtlas](https://axiomatlas.netlify.app/)
**Source Files Inspected:** `site/assets/engine.js` (lines 1–52), `site/assets/app.js` (lines 1–81), `site/assets/styles.css` (lines 1–14), `source/make_catalog.py` (lines 1–191), and `source/build.py` (lines 1–56).
**Status:** Proposal Only — Zero production code or UI components modified.

## 1. Task 2A — Platform-Wide Calculator Input Audit Across All 16 Criteria

We inspected all 136 calculator definitions in `source/make_catalog.py` and all 21 UI renderers in `site/assets/app.js` against the 16 required input-audit dimensions:

| # | Audit Criterion | Source-Code Evidence (`file:line`) | Affected Calculators (IDs) | Concrete Usability Defect Identified |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Unclear Field Labels** | `source/make_catalog.py` lines 43, 59, 97, 151 | `proportion-calculator` (`a`, `b`, `c`), `polynomial-evaluation` (`a`, `b`, `c`, `d`, `x`), `wave-speed` (`l`), `recipe-scaler` (`q`, `old`, `new`), `dates` (`First date`, `Second date`) | Single-letter labels `a`, `b`, `c`, `d` in `proportion-calculator` and `polynomial-evaluation` don't explain which term or coefficient they represent (`a` = $x^3$ coefficient vs. constant term). |
| 2 | **Missing Examples & Placeholders** | `site/assets/app.js` lines 31, 33, 54 | **All 113 formula tools** (`form()`) and **19 of 20 specialized renderers** (`input()`, `textArea()`) | `input()` and `form()` set `value="${esc(def)}"` without any `placeholder` attribute! Once a user clears a field (or clears `expr` in `scientific-calculator` via `C`), the box is completely blank with no example syntax hint. Only `equation-solver` has clickable `Try:` example chips (`app.js` line 56). |
| 3 | **Ambiguous Mathematical Notation** | `site/assets/engine.js` lines 2–14; `site/assets/app.js` lines 55–66 | `scientific-calculator`, `equation-solver`, `expression-simplifier`, `graphing-calculator`, `derivative-calculator`, `integral-calculator`, `limit-calculator` | Plain `<input type="text">` gives no visual confirmation of whether `sin(x)^2` means $(\sin x)^2$ or $\sin(x^2)$, whether `log(x)` is base $10$ (`Math.log10` in `engine.js` line 2!) or base $e$ (`ln(x)`), or whether `-2^2` is $-4$ or $+4$. |
| 4 | **Unclear or Missing Units** | `source/make_catalog.py` lines 40–156 | **43 of 113 formula calculators** lack unit strings on inputs/outputs (`herons-formula`, `trapezoid-calculator`, `parallelogram-calculator`, `pythagorean-calculator`, `cube-calculator`, `cuboid-calculator`, `sphere-calculator`, `cylinder-calculator`, `cone-calculator`, `pyramid-calculator`, `torus-calculator`, `regular-polygon`, `law-of-cosines`, `law-of-sines`, `arc-length` radius, `degree-radian` input) | In `Geometry`, 5 calculators (`rectangle`, `square`, `triangle`, `circle`, `ellipse`) display `m` / `m²`, while the remaining 13 geometry calculators display **no units at all**! In `Finance`, currency fields have no currency indicator. |
| 5 | **Missing Unit Selectors** | `site/assets/app.js` line 54 (`<span class="unit-pill">`) | **All 113 formula calculators** (especially all 27 `Physics`, 18 `Geometry`, 5 `Computing`, and 6 `Everyday` calculators) | Unit pills (`.unit-pill`) are static read-only `<span>` tags! Although `unitGroups` in `site/assets/engine.js` (lines 24–40) defines 103 units across 16 physical dimensions, users on `kinetic-energy`, `force-calculator`, `ideal-gas`, or `bmi-calculator` cannot switch `km/h → m/s`, `°C → K`, or `lb/in → kg/cm`. |
| 6 | **Missing Degree / Radian Selectors** | `site/assets/app.js` lines 56, 60, 62–66; `source/make_catalog.py` lines 70, 79–81, 88, 100, 105, 108 | `equation-solver`, `expression-simplifier`, `graphing-calculator`, `derivative-calculator`, `integral-calculator`, `limit-calculator` (hardcoded to Radians); `sector-calculator`, `arc-length`, `law-of-cosines`, `law-of-sines`, `work-calculator`, `projectile-range`, `torque-calculator`, `snells-law` (hardcoded to Degrees) | Only 2 of 136 calculators (`scientific-calculator` and `trigonometry-calculator`) have a `Degrees / Radians` selector! Solving `sin(x) = 0.5` in `equation-solver` returns `0.5235988` (radians) with no way to switch to Degrees (`30°`). |
| 7 | **Unclear Input Formats** | `site/assets/app.js` lines 70, 72, 75, 76, 83 | `statistics-calculator`, `correlation-calculator`, `fraction-calculator`, `number-base-converter`, `color-converter` | `statistics-calculator` splits on `/[\s,;]+/`, so pasting thousand-formatted numbers like `1,250, 2,500` silently splits `1,250` into `1` and `250`! `fraction-calculator` rejects mixed numbers (`1 3/4`). `color-converter` provides no text input for `#HEX` or `rgb()`. |
| 8 | **Confusing Symbols & Operators** | `site/assets/app.js` line 55; `site/assets/engine.js` line 10 | `scientific-calculator` (`%` button), all expression calculators (`^` vs `**`, `!`) | On `scientific-calculator`, the `%` keypad button is styled as an arithmetic operator, so users type `50%` expecting `0.5`—instead `compile()` treats `%` as binary modulo and throws `Incomplete expression`! |
| 9 | **Unsupported Commonly Expected Expressions** | `site/assets/engine.js` lines 2–11 | All 7 expression calculators (`compile()` / `run()`) | 1) `√9` (without parens) throws `Unknown variable: sqrt9`; 2) `x(x+1)` throws `Unknown function: x`; 3) `sin^2(x)` or `sin²(x)` throws `Unexpected token: ^`; 4) `sec(x)`, `csc(x)`, `cot(x)` throw `Unknown function`; 5) `arcsin(x)`, `arccos(x)`, `arctan(x)` throw `Unknown function`; 6) `asinh(x)`, `acosh(x)`, `atanh(x)` throw `Unknown function`; 7) `|x|` throws `Unsupported character near |`. |
| 10 | **Missing Validation & Unhelpful Error Messages** | `site/assets/app.js` lines 30, 39–51; `site/assets/engine.js` line 15 | **69 of 113 formula calculators** have zero domain validation in `validateFormula()` | 1) Clearing any input field while typing immediately flashes a red error box `Check your input: Fill in every field` (`app.js` line 30); 2) Domain errors like `sqrt(-4)` or `1/0` show generic `Result is undefined or outside the supported numeric range` instead of explaining *why*; 3) 27 Physics tools accept negative mass ($m = -10	ext{ kg}$), negative Kelvin ($T = -50	ext{ K}$), and negative resistance. |
| 11 | **Suboptimal Default Values** | `source/make_catalog.py` line 33; `site/assets/app.js` line 62 | `prime-checker` (`n = 101`), `trigonometry-calculator` (`angle = 30`) | `prime-checker` defaults to prime `101` (which has no non-trivial factors to demonstrate factor listing). |
| 12 | **Unclear Required vs. Optional Fields** | `site/assets/app.js` lines 30, 65 | `graphing-calculator` (`f1`, `f2`, `f3`) vs. all other calculators | Only `f3` in `graphing-calculator` is labeled `· optional`, yet `f1` and `f2` are also optional if at least one function is entered. Conversely, on all formula calculators, every field is strictly required. |
| 13 | **Programming-Syntax Requirement** | `site/assets/app.js` lines 56, 60, 62–65 | `equation-solver`, `expression-simplifier`, `graphing-calculator`, `derivative-calculator`, `integral-calculator`, `limit-calculator` | Unlike `scientific-calculator` (which has a keypad), the other **6 expression calculators have zero keypad buttons**, forcing users to type ASCII syntax (`asin(x)`, `sqrt(x)`, `x^2`) by hand. |
| 14 | **Inconsistent Input Layouts Across Related Tools** | `source/make_catalog.py` lines 60–62; `site/assets/app.js` lines 55, 81 | `slope-calculator` (`Point 1 x`) vs. `midpoint-calculator` (`x₁`); `scientific-calculator` (segmented `Radians / Degrees` pill) vs. `trigonometry-calculator` (`<select>` dropdown for `Degrees / Radians`) | `slope-calculator` labels its inputs `Point 1 x`, `Point 1 y` while `midpoint-calculator` and `distance-between-points` label the exact same inputs `x₁`, `y₁`. `scientific-calculator` uses a segmented button for angle mode (default `Radians`), while `trigonometry-calculator` uses a `<select>` dropdown (default `Degrees`). |
| 15 | **Mobile Keyboard & Touch Usability** | `site/assets/app.js` lines 31, 55; `site/assets/styles.css` lines 8, 13 | `scientific-calculator`, `matrix-calculator`, `linear-system`, all `.result-copy` buttons | 1) Clicking any button on `scientific-calculator` calls `e.focus()` (`app.js` line 55), which **pops up the mobile OS QWERTY keyboard on top of the calculator's own on-screen keypad!** 2) `.result-copy` (`⧉`) is ~20×24px (below 44×44px touch target); 3) `graphing-calculator` lacks 2-finger touch pinch-to-zoom. |
| 16 | **Accessibility & Keyboard Navigation** | `site/assets/app.js` line 90; `site/assets/styles.css` lines 2–3 | Global `/` shortcut across all calculators; `#search-modal`; Light mode `--muted` text | **CRITICAL:** Global `keydown` listener in `app.js` line 90 intercepts `/` even when typing inside an `<input>` or `<textarea>`, making it **impossible to type `/` for division or fractions on a physical keyboard** without triggering the search modal! |

## 2. Task 2B — Beginner-Friendly Mathematical Expression Input Architecture

### 2.1 Evaluation of All 10 Expression Input Capabilities

To eliminate syntax memorization while keeping AxiomAtlas lightweight, fast, and 100% client-side, we propose a unified **`MathExpressionInput` component** in `site/assets/app.js` paired with an upgraded **Non-Ambiguous Parser (`compile` / `run`)** in `site/assets/engine.js`:

| # | Capability Evaluated | Architectural Decision & Implementation Design |
| :--- | :--- | :--- |
| **1. Visual Mathematical Input Controls** | **Include:** Render a live **Formatted Mathematical Preview Bar** (`<div class="math-preview" aria-live="polite">`) directly below the input box that converts the AST in real time into clean typeset HTML/MathML (stacked fractions $rac{a}{b}$, true superscripts $x^2$, radical signs $\sqrt{x+1}$, Greek symbols $\pi, 	heta$, and explicit function labels). |
| **2. Scientific Calculator-Style Buttons** | **Include:** Make the keypad component reusable across **all 7 expression calculators** (`scientific`, `equation`, `expression`, `graph`, `derivative`, `integral`, `limit`), collapsible via a `⌨ Math Keypad` toggle button on non-scientific pages so it never clutters the view unless needed. |
| **3. Function Selector (`sin`, `cos`, `tan`, inverse, logs, roots, powers)** | **Include:** Organize the keypad into categorized tabs/rows: **Primary (`0–9, +, −, ×, ÷, (, ), =`)**, **Trig & Inverse (`sin, cos, tan, sin⁻¹, cos⁻¹, tan⁻¹, sec, csc, cot`)**, and **Algebra & Calculus (`x, x², xⁿ, √, ⁿ√, ln, log₁₀, log_b, eˣ, |x|, !, π, e`)**. Each button inserts a cursor-positioned template and shows a plain-English tooltip on hover/focus. |
| **4. Exponent & Subscript Controls** | **Include:** Dedicated `x²`, `x³`, and `xⁿ` buttons (inserting `^2`, `^3`, `^()` with cursor placed inside `()`), plus parser normalization of Unicode superscripts (`⁰¹²³⁴⁵⁶⁷⁸⁹⁻` → `^0..^9`, `^-`) and subscripts (`₀₁₂₃₄₅₆₇₈₉` → `0..9`) so copied textbook equations work out of the box. |
| **5. Fraction & Radical Input** | **Include:** `a/b` fraction template button (inserting `()/()` with cursor in numerator) and `√(x)` / `ⁿ√(x)` buttons (inserting `sqrt()` and `nthroot(, 3)`), plus parser support for bare `√9` and `√x` without parentheses. |
| **6. Parentheses & Expression Grouping** | **Include:** Auto-pair `(` with `)` (or highlight unmatched parentheses in amber in the preview bar) and automatically close trailing unclosed parentheses during evaluation. Fix implicit multiplication so `x(x+1)`, `2(x+1)`, `(x+1)(x-1)`, and `2sin(x)` all parse identically as multiplication. |
| **7. Unified Degree / Radian Selector** | **Include:** Standardized segmented control (`Radians [rad]` / `Degrees [°]`) on **every calculator that evaluates trigonometric functions** (`scientific`, `trigonometry`, `equation`, `expression`, `graph`, `derivative`, `integral`, `limit`, plus angle-unit dropdowns on geometry/physics trig tools). |
| **8. Contextual Examples & Tooltips** | **Include:** 3–4 clickable `Try:` example chips on every expression calculator (`scientific`, `equation`, `expression`, `graph`, `derivative`, `integral`, `limit`) so users can see working examples with one click. |
| **9. Safe Interpretation of Common Notation** | **Include:** Deterministic, non-ambiguous normalization in `compile()` for universal mathematical synonyms (`arcsin` → `asin`, `arccos` → `acos`, `arctan` → `atan`, `cosec` → `csc`, `sin²(x)` / `sin^2(x)` → `(sin(x))^2`, `|x|` → `abs(x)`, `**` → `^`, `√9` → `sqrt(9)`). |
| **10. Advanced Raw-Expression Input** | **Include:** Keep the underlying input as a standard text control so power users can type, edit, select, copy, and paste raw expressions (`sin(pi/6)^2 + log(100, 10)`) at full keyboard speed—now with `/` key hijacking fixed! |

### 2.2 Mandatory Disambiguation of Trigonometric & Exponential Expressions

A central requirement of Task 2B is eliminating user confusion between `sin^-1(x)`, `asin(x)`, `csc(x)`, `sin(x)^2`, and `sin(x^2)` **without introducing ambiguous automatic conversions**.

Here is the exact parsing, UI, and preview contract proposed for `site/assets/engine.js` and `site/assets/app.js`:

| User Input / Notation | Mathematical Meaning | Parser & UI Handling Contract | Live Math Preview & Disambiguation Banner |
| :--- | :--- | :--- | :--- |
| **`asin(x)`** or **`arcsin(x)`** or **`sin⁻¹(x)`** *(inserted by `sin⁻¹` button)* | **Inverse Sine** ($rcsin x$): returns the angle $	heta$ whose sine is $x$ ($x \in [-1, 1]$). | Directly supported in `known` (`asin`, `arcsin`). Keypad button is labeled **`sin⁻¹ (arcsin)`** and inserts `asin(`. | Preview displays: **$\sin^{-1}(x)$ — Inverse sine ($rcsin x$)** |
| **`sin^-1(x)`** *(typed manually with ASCII `^-1`)* | **Ambiguous in raw ASCII** (textbooks mean $rcsin(x)$, while algebraic power rules suggest $(\sin x)^{-1} = \csc x$). | **Never silently guess!** If a user types `sin^-1(x)`, `cos^-1(x)`, or `tan^-1(x)`, display an inline 1-click disambiguation prompt directly below the input: *"Notation check: Click to use **`asin(x)` — Inverse sine ($\sin^{-1}x$)** or **`csc(x)` — Reciprocal $1/\sin(x)$**"* (defaulting to `asin(x)` with a clear badge). | Banner explicitly contrasts $\sin^{-1}(x) = rcsin(x)$ vs. $(\sin x)^{-1} = rac{1}{\sin(x)} = \csc(x)$. |
| **`csc(x)`** or **`cosec(x)`** or **`1/sin(x)`** | **Cosecant (Reciprocal Sine)**: $\csc(x) = rac{1}{\sin(x)}$ ($\sin x 
eq 0$). | Add `csc`, `cosec`, `sec`, `cot` to `known` in `site/assets/engine.js` (converting input angle when `options.degrees` is true, and throwing a clear asymptote error when $\sin x = 0$ or $\cos x = 0$). | Preview displays: **$\csc(x) = rac{1}{\sin(x)}$ — Cosecant (reciprocal of sine)** |
| **`sin(x)^2`** or **`sin^2(x)`** or **`sin²(x)`** *(for power $n \ge 2$)* | **Squared Sine**: $(\sin(x))^2 = \sin(x) 	imes \sin(x)$. | For positive integer exponents $n \ge 2$, `sin^2(x)` and `sin²(x)` have only one mathematical meaning worldwide: $(\sin(x))^2$. Normalize `/(sin|cos|tan|sec|csc|cot|sinh|cosh|tanh)\^([2-9]\d*)\(/gi` to `($1(` with `)^$2` after the closing parenthesis (or handle in `primary()`). | Preview displays: **$(\sin(x))^2$ — Sine of $x$, squared** |
| **`sin(x^2)`** or **`sin(x²)`** | **Sine of Squared Input**: $\sin(x^2)$, where the angle itself is $x^2$. | Parsed as `['call', 'sin', [['op', '^', ['v', 'x'], ['n', 2]]]]`. | Preview displays: **$\sin(x^2)$ — Sine of ($x$ squared)** |

## 3. Task 2C — Calculator-Block-Specific Implementation Guidelines (All 10+ Blocks)

### Block 1: Trigonometry (`trigonometry-calculator`, `degree-radian`, `arc-length`, `law-of-cosines`, `law-of-sines`)
- **Input Improvements:**
  - In `trigonometry-calculator` (`/tools/trigonometry-calculator/`), add a top segmented mode selector: **`Forward Trig Ratios (Given Angle θ)`** vs. **`Inverse Trig Functions (Given Ratio x)`**.
  - In `degree-radian` (`/tools/degree-radian/`), replace the single `Angle in degrees` field with two synchronized bidirectional inputs (`Degrees (°)` ↔ `Radians (rad)`, accepting symbolic $\pi$ expressions like `pi/3`, `3*pi/4`) plus `Turns` and `DMS (Degrees° Minutes' Seconds")`.
  - In `law-of-cosines` and `law-of-sines`, add a `Solve for:` mode selector (`Unknown Side` vs. `Unknown Angle`).
- **Required Mathematical Controls:** Segmented `Degrees (°)` / `Radians (rad)` toggle; quick special-angle chips (`0°`, `30° (π/6)`, `45° (π/4)`, `60° (π/3)`, `90° (π/2)`, `180° (π)`).
- **Unit Handling:** Convert degrees to radians via `d * Math.PI / 180` with exact quadrant reduction (`d % 360`) before evaluating trig ratios so `cos(90°)` and `sin(180°)` evaluate to exact `0` instead of `6.123e-17` and `1.225e-16`.
- **Validation Rules:**
  - `law-of-cosines`: Require `a > 0, b > 0`, and `0 < C < 180°` (in Side mode) or triangle inequality `a + b > c, a + c > b, b + c > a` (in Angle mode).
  - `law-of-sines`: Require `a > 0`, `A > 0, B > 0, A + B < 180°`.
  - `trigonometry-calculator` (Inverse mode): Require `-1 <= x <= 1` for `arcsin(x)` and `arccos(x)`, and `|x| >= 1` for `arcsec(x)` and `arccsc(x)`.
- **Common User Mistakes:** Confusing degrees vs. radians; entering `sin^-1` when wanting `csc` (or vice versa); entering impossible SSA triangles.
- **Missing Functionality:** `cot θ` and inverse trig on `trigonometry-calculator`; angle solving on `law-of-cosines` and `law-of-sines`.
- **Recommended Output Improvements:** Show exact symbolic surd values for special angles (e.g., $\sin(30^\circ) = rac{1}{2} = 0.5$, $\cos(30^\circ) = rac{\sqrt{3}}{2} pprox 0.8660254$) alongside decimal values.
- **Important Edge Cases:** Asymptotes at $90^\circ, 270^\circ$ ($	an, \sec 	o 	ext{Undefined}$) and $0^\circ, 180^\circ$ ($\cot, \csc 	o 	ext{Undefined}$); SSA ambiguous case ($a < b$ and $b\sin A < a \implies 2$ valid triangles).
- **Specialized Input Interface Needed?** **Yes:** Tabbed Forward/Inverse interface for `trigonometry-calculator` and angle-unit toggle across all trig tools.

### Block 2: Algebra & Equations (`equation-solver`, `quadratic-equation`, `linear-equation`, `linear-system`, `expression-simplifier`, `polynomial-evaluation`, `arithmetic-sequence`, `geometric-sequence`, `slope-calculator`, `midpoint-calculator`, `distance-between-points`, `exponential-growth`)
- **Input Improvements:**
  - Attach the collapsible `MathExpressionInput` keypad and live preview bar to `equation-solver` and `expression-simplifier`.
  - In `expression-simplifier` (`/tools/expression-simplifier/`), auto-detect all variable identifiers in the user's AST and dynamically render numeric input fields for each variable (`x`, `y`, `z`, `a`, `b`), rather than hardcoding only `x`.
  - In `polynomial-evaluation` (`/tools/polynomial-evaluation/`), label coefficients clearly as `a (x³ coefficient)`, `b (x² coefficient)`, `c (x coefficient)`, `d (constant term)` and allow degree selection up to degree 6.
  - Standardize coordinate labels across `slope-calculator`, `midpoint-calculator`, and `distance-between-points` as `x₁ (Point 1 X)`, `y₁ (Point 1 Y)`, `x₂ (Point 2 X)`, `y₂ (Point 2 Y)`.
- **Required Mathematical Controls:** Expression bar with `x`, `x²`, `x³`, `xⁿ`, `√`, `( )`, `=` buttons and `Radians / Degrees` toggle on `equation-solver` and `expression-simplifier`.
- **Unit Handling:** Dimensionless for pure algebra; rate `%` and time units for `exponential-growth`.
- **Validation Rules:**
  - `linear-equation` (`ax + b = c`): When `a = 0`, do not throw a generic division-by-zero error; check if `b === c` (`Infinite solutions (identity for all real x)`) vs. `b !== c` (`No solution (inconsistent equation)`).
  - `slope-calculator`: When `x1 === x2`, output `Slope: Undefined (vertical line x = x₁)` instead of throwing an error!
  - `linear-system`: When pivot `< 1e-12`, check augmented RHS to distinguish `No solution (inconsistent system)` from `Infinitely many solutions (dependent system)`.
- **Common User Mistakes:** Typing `x(x-5) = 0` (currently fails with `Unknown function: x`); entering a vertical line in `slope-calculator`; expecting `equation-solver` to find tangent roots like `(x - 2.003)^2 = 0`.
- **Missing Functionality:** Multi-variable evaluation in `expression-simplifier`; co-display of Slope + Midpoint + Distance + Line Equation on the 3 coordinate geometry pages; infinite geometric series sum $S_\infty = rac{a}{1-r}$ for $|r| < 1$ on `geometric-sequence`.
- **Recommended Output Improvements:** Add Vertex $(h, k) = \left(-rac{b}{2a}, c - rac{b^2}{4a}ight)$, Axis of Symmetry $x = -rac{b}{2a}$, and Y-intercept $(0, c)$ to `quadratic-equation`.
- **Important Edge Cases:** Even-multiplicity roots $(x - r)^2 = 0$ in `solveRoots()`; $r = 1$ and $|r| < 1$ in `geometric-sequence`; $a = 0$ in `linear-equation` and `quadratic-equation`.
- **Specialized Input Interface Needed?** **Yes:** `MathExpressionInput` on `equation-solver` and `expression-simplifier`; dynamic variable table on `expression-simplifier`; 2D/3D matrix grid on `linear-system`.

### Block 3: Graphing, Calculus & Limits (`graphing-calculator`, `derivative-calculator`, `integral-calculator`, `limit-calculator`)
- **Input Improvements:**
  - Equip all 4 calculators with the `MathExpressionInput` live preview bar, collapsible keypad, `Radians / Degrees` toggle, and clickable `Try:` example chips.
  - Allow symbolic constants (`pi`, `e`, `pi/2`, `2*pi`) inside the numeric point/bound inputs (`x`, `a`, `b`) on `derivative-calculator`, `integral-calculator`, and `limit-calculator` (by evaluating bound inputs with `calculate(boundStr)` instead of `Number(node.value)`!).
- **Required Mathematical Controls:** Function input bar with `sin`, `cos`, `tan`, `ln`, `e^x`, `√`, `x²`, `π`, `|x|`; zoom `+ / −` buttons and touch pinch-to-zoom on `graphing-calculator`.
- **Unit Handling:** Angle mode (`Radians` [default for Calculus] / `Degrees`).
- **Validation Rules:**
  - `limit-calculator`: Evaluate $h \in \{10^{-2}, 10^{-3}, 10^{-4}, 10^{-5}, 10^{-6}\}$ from left and right; require $|L_- - L_+| < 10^{-5}(1 + |L_+|)$ before reporting a two-sided limit.
  - `derivative-calculator`: Compare forward difference $(f(x+h)-f(x))/h$ and backward difference $(f(x)-f(x-h))/h$ to reject corners/cusps like `abs(x)` at $x=0$.
  - `integral-calculator`: Compare $n=500$ vs $n=1000$ composite Simpson sums to flag interior singularities/divergent improper integrals (such as $1/x^2$ on $[-1, 1.001]$).
  - `graphing-calculator`: Wrap `f_i(0)` evaluation in `try/catch` so functions undefined at $x=0$ (`1/x`, `ln(x)`) plot normally without showing an error alert in `.answer-card`.
- **Common User Mistakes:** Entering `pi/2` into Lower/Upper bound `<input type="number">` (which HTML `<input type="number">` rejects!); plotting `1/x` and thinking the expression is invalid because `f(0)` throws an error; trusting `Estimated common limit: 0` on `1/x` at $x=0$.
- **Missing Functionality:** Tangent line plot on `derivative-calculator` (promised in catalog description); shaded area-under-curve plot on `integral-calculator`; approach table on `limit-calculator`; hover coordinates `(x, y)` on `graphing-calculator`.
- **Recommended Output Improvements:** Add `Second derivative f''(x)` and `Tangent line equation y = mx + b` to `derivative-calculator`; add `Left/Right approach table` to `limit-calculator`; add `Trapezoidal vs. Simpson estimate` and `Estimated quadrature error` to `integral-calculator`.
- **Important Edge Cases:** Removable discontinuities ($rac{\sin x}{x}$ at $x=0$), jump discontinuities ($rac{|x|}{x}$ at $x=0$), infinite poles ($rac{1}{x}, rac{1}{x^2}$ at $x=0$), oscillatory functions ($\sin(1/x)$ near $0$), domain boundaries ($\ln x, \sqrt{x}$ at $x=0$).
- **Specialized Input Interface Needed?** **Yes:** `MathExpressionInput` + symbolic-constant-aware bound inputs (`type="text" inputmode="decimal"` parsed via `calculate()`).

### Block 4: Geometry (`rectangle-calculator` through `regular-polygon` — 18 calculators)
- **Input Improvements:**
  - Add a shared **Length Unit Selector** (`mm`, `cm`, `m` [default], `km`, `in`, `ft`, `yd`) in the card header of all 18 geometry calculators so all 18 tools display consistent units (`<unit>`, `<unit>²`, `<unit>³`).
  - Add a `Solve for:` mode selector on `pythagorean-calculator` (`Hypotenuse c = √(a² + b²)` vs. `Missing Leg a = √(c² − b²)`), `circle-calculator` (`Given Radius r` / `Given Diameter d` / `Given Circumference C` / `Given Area A`), and `sector-calculator` (`Degrees` / `Radians`).
- **Required Mathematical Controls:** Clean numeric inputs (`type="number" min="0" step="any"`) + Unit dropdown.
- **Unit Handling:** Automatically label linear outputs with `unit`, area outputs with `unit²`, and volume outputs with `unit³`.
- **Validation Rules:**
  - Keep `Object.values(v).some(x => x <= 0)` check in `validateFormula()`.
  - Add `if (t.slug === 'parallelogram-calculator' && v.h > v.s) throw Error('Perpendicular height h cannot exceed slant side length s');`.
  - Add `if (t.slug === 'pythagorean-calculator' && mode === 'leg' && v.a >= v.c) throw Error('Hypotenuse c must be strictly greater than leg a');`.
- **Common User Mistakes:** Entering height $h$ greater than slant side $s$ in `parallelogram-calculator`; entering sides that violate the triangle inequality $a + b \le c$ in `herons-formula`; wanting to find a missing leg in `pythagorean-calculator`.
- **Missing Functionality:** Interior angles $A, B, C$, inradius $r$, and circumradius $R$ in `herons-formula`; eccentricity $e$ and foci distance in `ellipse-calculator`; lateral vs. base surface area breakdown in `cylinder-calculator`, `cone-calculator`, and `pyramid-calculator`; interior angle $rac{(n-2)	imes 180^\circ}{n}$ and apothem in `regular-polygon`.
- **Specialized Input Interface Needed?** **No** equation editor needed — keep clean numeric fields with a unit selector and mode toggle.

### Block 5: Physics (`speed-calculator` through `thin-lens` — 27 calculators + 3 relocated from Computing)
- **Input Improvements:**
  - Replace static `.unit-pill` spans with **interactive `<select class="unit-pill-select">` dropdowns** wired to `unitGroups` in `site/assets/engine.js` (e.g., Mass: `mg, g, kg [default], metric ton, lb, oz`; Length: `mm, cm, m [default], km, in, ft, mi`; Speed: `m/s [default], km/h, mph, knot, ft/s`; Temperature: `K [default], °C, °F`; Force: `N, kN, lbf, dyne`; Pressure: `Pa, kPa, MPa, bar, atm, psi`).
  - Add `Solve for:` mode selectors on fundamental 3-variable physics laws (`speed-calculator`, `force-calculator`, `density-calculator`, `pressure-calculator`, `ohms-law`, `wave-speed`, `ideal-gas`).
- **Required Mathematical Controls:** Numeric inputs supporting scientific notation (`e.g. 6.67e-11` or `1.5e8`) + interactive unit selectors.
- **Unit Handling:** Convert all inputs from user-selected units to canonical SI units via `convertUnit()` before evaluating catalog expressions, and allow switching the output unit on the result card.
- **Validation Rules:** **Add strict physical domain validation to `validateFormula()` for all 30 physics tools:**
  - Positive mass `m > 0`, `m1 > 0`, `m2 > 0` (`force`, `kinetic-energy`, `potential-energy`, `momentum`, `density`, `gravitational-force`, `heat-energy`, `centripetal-force`).
  - Positive elapsed time `t > 0` (`speed`, `acceleration`, `mechanical-power`) and non-negative time `t >= 0` (`distance`, `displacement`, `electrical-power`).
  - Positive spatial dimensions: Volume `V > 0` (`density`, `ideal-gas`), Area `A > 0` (`pressure`), Length `L > 0` and gravity `g > 0` (`pendulum-period`), Radius `r > 0` (`gravitational-force`, `centripetal-force`), Wavelength `l > 0` and Frequency `f > 0` (`wave-speed`, `frequency-period`, `frequency-wavelength`).
  - Non-negative absolute temperature `T >= 0 K` and moles `n >= 0` (`ideal-gas`).
  - Positive resistance `R > 0` (`ohms-law`, `resistor-parallel`) and spring constant `k > 0` (`spring-force`).
  - Refractive indices `n1 >= 1, n2 >= 1` (`snells-law`).
- **Common User Mistakes:** Entering speed in `km/h` into a field expecting `m/s`; entering temperature in `°C` into `ideal-gas` (which expects `K`); entering small masses in `gravitational-force` and getting `0 N` due to `BUG-01`; entering an incident angle exceeding the critical angle in `snells-law` ($\sin	heta_2 > 1$).
- **Missing Functionality:** Total Internal Reflection & Critical Angle $	heta_c = rcsin(n_2/n_1)$ readout in `snells-law`; virtual vs. real / upright vs. inverted image classification in `thin-lens`; launch height $h_0$ in `projectile-range`.
- **Important Edge Cases:** `snells-law` when $n_1 \sin	heta_1 > n_2$ (report Total Internal Reflection + Critical Angle instead of generic error); `thin-lens` when $o = f$ (report `'Image formed at infinity (collimated rays)'`); `gravitational-force` when $F < 10^{-13}	ext{ N}$ (fix `BUG-01` in `engine.js`).
- **Specialized Input Interface Needed?** **No** equation editor — interactive unit dropdown pills + Solve-For selector + dynamic resistor list for `resistor-series`/`resistor-parallel`.

### Block 6: Finance (`simple-interest` through `tip-calculator` — 15 calculators)
- **Input Improvements:**
  - Add a lightweight **Currency Symbol Selector** (`₹`, `$`, `€`, `£`, `¥`, `None`) in the header (persisted in `localStorage`) for display formatting.
  - In `compound-interest` (`/tools/compound-interest/`), replace the raw numeric `Compounds per year` field (`n = 12`) with a preset dropdown: `Monthly (12/yr)`, `Quarterly (4/yr)`, `Semi-Annually (2/yr)`, `Annually (1/yr)`, `Daily (365/yr)`, `Continuous (e^(rt))`.
  - In `sip-calculator` (`/tools/sip-calculator/`), add a toggle for `Contribution Timing: Beginning of Month (Annuity Due)` vs. `End of Month (Ordinary Annuity)`.
  - In `tax-calculator` (`/tools/tax-calculator/`), add a toggle for `Add Tax (Net → Gross)` vs. `Remove Tax / Reverse GST (Gross → Net)`.
- **Validation Rules:**
  - Validate `cost > 0` in `roi-calculator` and `profit-margin` (`cost > 0, sell > 0`).
  - Validate `initial > 0, final >= 0, years > 0` in `cagr-calculator`.
  - Validate `price >= 0` and `0 <= off <= 100` in `discount-calculator`.
  - Validate `r > 0` in `rule-of-72`.
  - Validate `bill >= 0, tip >= 0`, and **integer `people >= 1`** in `tip-calculator`.
- **Recommended Output Improvements:** Add Effective Annual Rate ($	ext{EAR} = (1 + rac{r}{100n})^n - 1$) to `compound-interest`; add exact logarithmic doubling time $rac{\ln 2}{\ln(1 + r/100)}$ alongside `72/r` in `rule-of-72`; add collapsible Yearly Amortization summary to `emi-calculator`.
- **Specialized Input Interface Needed?** **No** — numeric inputs with currency symbol formatting and frequency/mode dropdowns.

### Block 7: Statistics & Averages (`statistics-calculator`, `correlation-calculator`, `probability-calculator`, `z-score`, `standard-error`, `confidence-interval`, `probability-calculator-basic`, plus `arithmetic-mean`, `geometric-mean`, `weighted-average`, `permutation-calculator`, `combination-calculator`, `factorial-calculator`, `random-number-generator`)
- **Input Improvements:**
  - In `parseNumbers()` (`site/assets/app.js` line 71), detect and strip thousand-Grouping commas when numbers are separated by newlines or semicolons, or warn if ambiguous, and display a live `Parsed count: N numbers` badge below the textarea.
  - Upgrade `weighted-average` from 3 hardcoded pairs to a dynamic table (`+ Add row`, `× Remove row`, paste from CSV/spreadsheet).
  - Upgrade `arithmetic-mean` and `geometric-mean` to accept comma/space-separated number lists (like `statistics-calculator`).
  - In `confidence-interval` (`/tools/confidence-interval/`), add a **Confidence Level Selector** (`90% (z=1.645)`, `95% (z=1.960)`, `99% (z=2.576)`, `99.9% (z=3.291)`) and a `Normal (z) vs. Student's t` toggle.
- **Validation Rules:**
  - `z-score`: Require `sd > 0`.
  - `standard-error`: Require `sd >= 0` and integer `n >= 1`.
  - `confidence-interval`: Require `sd >= 0` and integer `n >= 2`.
  - `probability-calculator-basic`: Allow `p = 1` (outputting `Complement: 0`, `Odds for: Infinity (certain event)`).
- **Recommended Output Improvements:** Add IQR ($	ext{Q3} - 	ext{Q1}$), Geometric Mean, and Harmonic Mean to `statistics-calculator`; add cumulative probabilities $P(X \le k)$, $P(X < k)$, $P(X \ge k)$, $P(X > k)$ to `probability-calculator` (`Binomial Probability`); add a 2D Canvas scatter plot with fitted regression line to `correlation-calculator`.
- **Specialized Input Interface Needed?** **Yes:** Dataset textarea with live token counter on `statistics`/`correlation`, and dynamic row builder on `weighted-average`.

### Block 8: Linear Algebra (`matrix-calculator`, `vector-calculator`, plus `linear-system`)
- **Input Improvements:**
  - Preserve entered matrix cell values in memory when switching `Matrix size` (`2×2`, `3×3`, `4×4`) or `Operation` in `matrix-calculator` and `linear-system` (currently `refresh()` in `site/assets/app.js` lines 58 & 68 wipes all cells back to defaults on every dropdown change!).
  - Add a `Dimension: 2D / 3D` toggle on `vector-calculator`.
- **Recommended Output Improvements:**
  - Replace the flat text output `M.map(r=>r.map(fmt).join(' , ')).join('  |  ')` in `matrix-calculator` (`site/assets/app.js` line 69) with a true **2D bracketed HTML matrix table** (`<table class="matrix-result">`) and add `Trace` and `Rank` operations.
  - In `vector-calculator`, output Unit Vectors $\hat{a} = ec{a}/|ec{a}|$, $\hat{b} = ec{b}/|ec{b}|$, and Scalar/Vector Projection of $ec{a}$ onto $ec{b}$, and handle the zero vector $ec{0}$ gracefully (returning Dot product $= 0$, Cross product $= (0,0,0)$, and Angle $= 	ext{Undefined}$ instead of throwing an error before showing dot/cross products).
- **Specialized Input Interface Needed?** **Yes:** State-preserving 2D matrix grid with keyboard arrow/tab cell navigation and 2D formatted matrix output.

### Block 9: Computing (`number-base-converter`, `color-converter`, `download-time`, `data-size-calculator`, `pixel-density`, `aspect-ratio`, `compression-ratio`)
- **Input Improvements:**
  - In `number-base-converter`, populate `Source base` and `Target base` selects with all bases `2` through `36` (`Array.from({length: 35}, (_, i) => String(i + 2))`).
  - In `color-converter`, add editable text boxes for `HEX` (`#6757F3`), `RGB` (`103, 87, 243`), and `HSL` (`246°, 88%, 65%`) synchronized bidirectionally with `<input type="color">`.
  - In `download-time`, add unit selectors for File Size (`MB, GB, TB, MiB, GiB`) and Connection Speed (`Mbps, Gbps, MB/s, kB/s`).
- **Validation Rules:** Validate positive inputs (`> 0`) on `pixel-density`, `aspect-ratio`, `download-time`, and `compression-ratio`.
- **Recommended Output Improvements:**
  - In `aspect-ratio`, compute `g = gcd(Math.round(w), Math.round(h))` and display the **Simplified Integer Ratio** (e.g., **`16 : 9`**) as the primary result alongside the decimal ratio `1.777777778`!
  - In `download-time`, format duration into human-readable `Xh Ym Zs` alongside total seconds and minutes.

### Block 10: Converters, Education, Date & Time, and Everyday (`unit-converter`, 5 Education, 2 Date & Time, 7 Everyday tools)
- **Input Improvements:**
  - In `unit-converter` (`/tools/unit-converter/`), display both the primary selected `From → To` conversion AND an expandable **"All units in this category"** reference table below so users can see all equivalent units at a glance.
  - In `bmi-calculator` (`/tools/bmi-calculator/`), add a `Metric (kg, cm)` vs. `Imperial (lb, ft, in)` unit toggle.
- **Validation Rules:**
  - Validate `kg > 0, cm > 0` in `bmi-calculator`; `0 <= weight < 100` in `target-grade`; `cgpa >= 0, factor > 0` in `cgpa-percentage`; positive values (`> 0`) in `fuel-cost`, `recipe-scaler`, `pace-calculator`, `paint-coverage`, `tile-calculator`, and `study-time-calculator`.
- **Recommended Output Improvements:**
  - In `bmi-calculator`, output the standard WHO BMI Category (`Underweight (< 18.5)`, `Normal weight (18.5–24.9)`, `Overweight (25.0–29.9)`, `Obesity (≥ 30.0)`) and healthy weight range for the user's height.
  - In `attendance-calculator`, when current attendance already exceeds target attendance, also output **`Classes you can safely miss (bunkable classes)`**: $\lfloor rac{100 \cdot 	ext{att} - 	ext{target} \cdot 	ext{total}}{	ext{target}} floor$.
