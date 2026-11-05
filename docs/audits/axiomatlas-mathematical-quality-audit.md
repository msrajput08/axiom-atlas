# AxiomAtlas Calculation Engine & Mathematical Quality Audit

**Live Website:** [AxiomAtlas](https://axiomatlas.netlify.app/)
**Audit Scope:** Section 6 (Calculation Engine & Mathematical Accuracy Audit with Reproducible Evidence) and Section 7 (Testing & Mathematical Benchmark Strategy).
**Status:** Phase 0 Audit Deliverable — All 18 findings verified by direct execution against `site/assets/engine.js`, `site/assets/app.js`, and `site/assets/catalog.json` in Node.js v18.20.4.

## 1. Calculation Engine Architecture Inspection (Section 6)

The mathematical engine (`site/assets/engine.js`, 11,729 bytes) consists of:
1. **`compile(src)` (lines 3–11):** Regex tokenizer (`rx`) and recursive-descent parser with 5 precedence levels: `add()` (`+`, `-`) → `mul()` (`*`, `/`, `%`, implicit multiplication) → `unary()` (prefix `-`, `+`) → `pow()` (postfix `!`, right-associative `^`) → `primary()` (parentheses, numbers, function calls, variables).
2. **`run(ast, vars, options)` & `calculate(expr, vars, options)` (lines 12–16):** Tree-walk evaluator with an 800-entry AST `Map` cache, recursion/step guard (`++calls > 2000`), degree/radian conversion for `sin/cos/tan/asin/acos/atan`, and a final return statement `return Math.abs(v)<1e-13?0:v`.
3. **Specialized Numerical Solvers (lines 17–51):**
   - `fmt(v)`: Formats numbers using `toExponential(7)` for `|v| < 1e-6` or `|v| >= 1e12`, and `Intl.NumberFormat('en-US', {maximumFractionDigits: 9})` on `Number(v.toPrecision(12))` otherwise.
   - `solveQuadratic(a, b, c)`: Uses the numerically stable Citardauq/Vieta formula `q = -(b + (b < 0 ? -sq : sq)) / 2`, `roots = [q/a, c/q]` (preventing catastrophic cancellation when $b^2 \gg 4ac$!) and formats complex roots when $\Delta < 0$.
   - `solveRoots(expr, variable, lo, hi)`: 4,000-subinterval grid search + 65-step bisection on sign changes.
   - `gaussian(A, B)` & `matrixOp(A, B, operation)`: Gauss-Jordan elimination with partial pivoting (`|pivot| < 1e-12` singularity threshold).
   - `descriptive(arr)`: Sorting, mean, median, mode frequency map, population/sample variance & SD, and lower/upper half median quartiles (`Q1`, `Q3`).
   - `integrate(ast, a, b, n=1000)`: 1,000-panel composite Simpson's 1/3 rule.
   - `unitGroups` & `convertUnit(group, num, from, to)`: 16 unit groups with linear scaling and affine temperature conversions (`°C`, `°F`, `K`).
   - `parseFractions(str)` & `fractionOp(f1, f2, op)`: Exact `BigInt` rational arithmetic with Euclidean GCD reduction.
   - `isPrime(n)`: Trial division by 2 and odd integers up to $\sqrt{n}$ for safe integers $\le 10^{12}$.

## 2. Verified Mathematical & Engine Bug Report (18 Reproducible Bugs)

Every bug below was reproduced directly against the repository's `site/assets/engine.js` and `site/assets/app.js`.

| Bug ID | Severity | Affected Calculator(s) | Summary of Root Cause |
| :--- | :--- | :--- | :--- |
| **BUG-01** | **CRITICAL** | Universal Gravitation Calculator (`/tools/gravitational-force/`), Power Calculator (`/tools/power-calculator/`), Scientific Calculator (`/tools/scientific-calculator/`), and all 113 `calculate()` tools | Line 15 of `site/assets/engine.js` ends with `return Math.abs(v)<1e-13?0:v`. The author added a blanket threshold of `1e-13` on all AST eval... |
| **BUG-02** | **CRITICAL** | Numerical Limit Calculator (`/tools/limit-calculator/`) | Line 63 of `site/assets/app.js` evaluates a single fixed offset `h = 1e-4 * Math.max(1, Math.abs(x))` on each side and unconditionally repor... |
| **BUG-03** | **HIGH** | Modulo Calculator (`/tools/modulo-calculator/`) | `engine.js` defines `mod(a,b)` as the always-nonnegative Euclidean remainder `((a % b) + |b|) % |b|`, whereas `make_catalog.py` pairs it wit... |
| **BUG-04** | **HIGH** | Equation Solver (`/tools/equation-solver/`), Expression Evaluator (`/tools/expression-simplifier/`), Function Graphing Calculator (`/tools/graphing-calculator/`), Derivative/Integral/Limit Calculators, Scientific Calculator | In `primary()` (`site/assets/engine.js` line 8), whenever any identifier `v` is immediately followed by `(`, the parser unconditionally trea... |
| **BUG-05** | **HIGH** | Scientific Calculator (`/tools/scientific-calculator/`) and all 7 expression calculators | Line 4 of `site/assets/engine.js` performs a naive string replacement `.replace(/√/g, 'sqrt')` before tokenization. When `√` is followed by ... |
| **BUG-06** | **HIGH** | Scientific Calculator (`/tools/scientific-calculator/`) | 1) `90 * Math.PI / 180` is not exactly `π/2` in IEEE-754 floating point, so `Math.cos(Math.PI/2) = 6.123e-17` and `Math.tan(Math.PI/2) = 1.6... |
| **BUG-07** | **HIGH** | Trigonometry Calculator (`/tools/trigonometry-calculator/`) | `trig()` in `site/assets/app.js` calls `Math.sin(a)` and `Math.cos(a)` directly and passes them to `fmt()`, where `6.123234e-17 < 1e-6` trig... |
| **BUG-08** | **HIGH** | Prime Number Checker (`/tools/prime-checker/`) | `isPrime(n)` in `engine.js` only returns a boolean `true`/`false`, and `prime()` in `app.js` never extracts factors.... |
| **BUG-09** | **HIGH** | Equation Solver (`/tools/equation-solver/`) | `solveRoots()` divides `[lo, hi]` into 4,000 fixed steps (`step = 80 / 4000 = 0.02`) and only detects roots if either `|f(x_i)| < 1e-7` at a... |
| **BUG-10** | **HIGH** | Definite Integral Calculator (`/tools/integral-calculator/`) | `integrate()` evaluates 1,000 fixed panels without checking whether subintervals cross a pole/singularity or whether `n=500` vs `n=1000` con... |
| **BUG-11** | **MEDIUM** | Nth Root Calculator (`/tools/nth-root/`) | In IEEE-754 / JavaScript, `Math.pow(-8, 1/3)` returns `NaN` because fractional exponents on negative bases are undefined over the reals in `... |
| **BUG-12** | **MEDIUM** | Parallelogram Area Calculator (`/tools/parallelogram-calculator/`) | In any Euclidean parallelogram with base $b$ and adjacent slant side $s$, the altitude $h$ perpendicular to base $b$ satisfies $h = s \sin\t... |
| **BUG-13** | **MEDIUM** | 69 Formula Calculators across Physics (27), Finance (10), Computing (9), Statistics (3), Everyday (6), Trigonometry (2), Education (3), Math (9) | `validateFormula()` only contains rules for Geometry and 16 specific slugs, leaving 69 of the 113 formula calculators with zero domain valid... |
| **BUG-14** | **MEDIUM** | Function Graphing Calculator (`/tools/graphing-calculator/`) | `graph()` populates the `Your results` card by calling `calculate(ex, {x: 0})` inside `evalSafe()`. If any entered function has a vertical a... |
| **BUG-15** | **MEDIUM** | Automated Formula Test Suite (`source/test_formulas.mjs`) | Node.js treats `.js` files (`site/assets/engine.js`) as CommonJS unless the nearest `package.json` specifies `"type": "module"`. Because no ... |
| **BUG-16** | **MEDIUM** | Derivative Calculator (`/tools/derivative-calculator/`) | Central finite difference `(f(0+h) - f(0-h)) / (2h)` evaluates `(|h| - |-h|) / (2h) = 0` for any symmetric corner/cusp! And `analytic('deriv... |
| **BUG-17** | **LOW** | Fraction Calculator (`/tools/fraction-calculator/`) | When `num` or `den` exceeds `Number.MAX_VALUE` (`~1.797e308`, 309 digits), `Number(num)` evaluates to `Infinity`, and `Infinity / Infinity` ... |
| **BUG-18** | **LOW** | Scientific Calculator (`/tools/scientific-calculator/`) | The keypad displays `%` next to `+`, `-`, `^`, `!`, which standard calculator users expect to be unary percentage (`/ 100`), but `engine.js`... |

### Detailed Reproducible Bug Specifications
#### BUG-01 [CRITICAL] — Universal Gravitation Calculator (`/tools/gravitational-force/`), Power Calculator (`/tools/power-calculator/`), Scientific Calculator (`/tools/scientific-calculator/`), and all 113 `calculate()` tools
- **Calculator:** Universal Gravitation Calculator (`/tools/gravitational-force/`), Power Calculator (`/tools/power-calculator/`), Scientific Calculator (`/tools/scientific-calculator/`), and all 113 `calculate()` tools
- **Reproduction Input:** In `gravitational-force`: `m1 = 1 kg`, `m2 = 1 kg`, `r = 100 m` (or in `scientific-calculator` / `power-calculator`: `10^-14` or `6.626e-34`)
- **Expected Result:** `6.6743000e-15 N` (`6.6743 × 10⁻¹⁵ N`) for `gravitational-force`; `1.0000000e-14` for `10^-14`
- **Actual Result:** `0 N` (and `0` for any calculation where `|result| < 1e-13`)
- **Source File & Location:** `site/assets/engine.js` line 15 (`export function run(ast,vars={},options={})`)
- **Root Cause:** Line 15 of `site/assets/engine.js` ends with `return Math.abs(v)<1e-13?0:v`. The author added a blanket threshold of `1e-13` on all AST evaluations to mask floating-point noise like `sin(pi) = 1.2246e-16`, inadvertently wiping out every legitimate scientific, physical, or probabilistic result smaller than `10^-13`!
- **Severity:** **CRITICAL**
- **Recommended Fix:** Remove `Math.abs(v)<1e-13?0:v` from `run()`. Apply near-zero snapping (`Math.abs(r) < 1e-15 ? 0 : r`) exclusively inside trigonometric functions (`sin`, `cos`, `tan`) when the input angle is a multiple of `π/2`.

#### BUG-02 [CRITICAL] — Numerical Limit Calculator (`/tools/limit-calculator/`)
- **Calculator:** Numerical Limit Calculator (`/tools/limit-calculator/`)
- **Reproduction Input:** Case A: `fn = 1/x`, `x = 0`; Case B: `fn = abs(x)/x`, `x = 0`
- **Expected Result:** Case A: `Left-hand estimate: −∞`, `Right-hand estimate: +∞`, `Estimated common limit: Does not exist (unbounded discontinuity)`; Case B: `Left-hand estimate: −1`, `Right-hand estimate: 1`, `Estimated common limit: Does not exist (jump discontinuity, left ≠ right)`
- **Actual Result:** Case A: `Left-hand estimate: -10,000`, `Right-hand estimate: 10,000`, `Estimated common limit: 0`; Case B: `Left-hand estimate: -1`, `Right-hand estimate: 1`, `Estimated common limit: 0`
- **Source File & Location:** `site/assets/app.js` line 63 (`analytic('limit')`)
- **Root Cause:** Line 63 of `site/assets/app.js` evaluates a single fixed offset `h = 1e-4 * Math.max(1, Math.abs(x))` on each side and unconditionally reports `Estimated common limit: (left + right) / 2` without checking whether `left` and `right` converge or even agree in sign/value! Any odd function with a vertical asymptote or jump discontinuity at `x = 0` produces `left = -right`, averaging to `0`!
- **Severity:** **CRITICAL**
- **Recommended Fix:** Evaluate decreasing step sizes `h = 1e-2, 1e-3, 1e-4, 1e-5, 1e-6` on each side; check convergence of `{f(x-h)}` and `{f(x+h)}` separately; if `|L_left - L_right| > 1e-5 * (1 + Math.max(|L_left|, |L_right|))` or either side diverges, output `'Does not exist (left ≠ right)'` or `'±Infinity'`.

#### BUG-03 [HIGH] — Modulo Calculator (`/tools/modulo-calculator/`)
- **Calculator:** Modulo Calculator (`/tools/modulo-calculator/`)
- **Reproduction Input:** `a = 7` (Dividend), `b = -3` (Divisor)
- **Expected Result:** Under Euclidean division (`0 <= r < |b|`): `Quotient = -2`, `Remainder = 1` (since `7 = (-2)*(-3) + 1 = 7`); under Floored division (`q = floor(a/b)`): `Quotient = -3`, `Remainder = -2` (since `7 = (-3)*(-3) + (-2) = 7`)
- **Actual Result:** `Remainder: 1`, `Quotient: -3` — which violates the calculator's own displayed formula `a = qb + r` because `(-3)*(-3) + 1 = 10 ≠ 7`!
- **Source File & Location:** `source/make_catalog.py` line 54 (`'Remainder|mod(a,b);Quotient|floor(a/b)'`) and `site/assets/engine.js` line 2 (`mod:(a,b)=>((a%b)+Math.abs(b))%Math.abs(b)`)
- **Root Cause:** `engine.js` defines `mod(a,b)` as the always-nonnegative Euclidean remainder `((a % b) + |b|) % |b|`, whereas `make_catalog.py` pairs it with the floored quotient `floor(a/b)`. For any negative divisor `b < 0` where `b` does not divide `a`, the Euclidean quotient is `ceil(a/b) = (a - mod(a,b))/b`, NOT `floor(a/b)`!
- **Severity:** **HIGH**
- **Recommended Fix:** Change the Quotient expression in `modulo-calculator` from `floor(a/b)` to `(a - mod(a,b))/b` so that `a = q*b + r` holds identically for all positive and negative integers `a` and `b != 0`.

#### BUG-04 [HIGH] — Equation Solver (`/tools/equation-solver/`), Expression Evaluator (`/tools/expression-simplifier/`), Function Graphing Calculator (`/tools/graphing-calculator/`), Derivative/Integral/Limit Calculators, Scientific Calculator
- **Calculator:** Equation Solver (`/tools/equation-solver/`), Expression Evaluator (`/tools/expression-simplifier/`), Function Graphing Calculator (`/tools/graphing-calculator/`), Derivative/Integral/Limit Calculators, Scientific Calculator
- **Reproduction Input:** `x(x+1)` with `x = 3` (or `pi(2)` in `scientific-calculator`)
- **Expected Result:** `12` for `x(x+1)` at `x = 3`; `6.283185307` for `pi(2)`
- **Actual Result:** Throws error: `Unknown function: x` (and `Unknown function: pi`)
- **Source File & Location:** `site/assets/engine.js` line 8 (`if(/^[A-Za-z_]/.test(v)){if(eat('(')){... return ['call',v,args]}return ['v',v]}`)
- **Root Cause:** In `primary()` (`site/assets/engine.js` line 8), whenever any identifier `v` is immediately followed by `(`, the parser unconditionally treats `v(...)` as a function call `['call', v, args]`, even when `v` is a variable (`x`) or constant (`pi`, `e`, `tau`) and not a function in `known`! Meanwhile, `2(x+1)` and `(x-1)(x+1)` work via `mul()`, leading users to expect `x(x+1)` to work as implicit multiplication.
- **Severity:** **HIGH**
- **Recommended Fix:** In `primary()`, only parse `v(...)` as `['call', v, args]` if `Object.prototype.hasOwnProperty.call(known, v.toLowerCase())`; otherwise return `['v', v]` and let `mul()` handle the following `(` as implicit multiplication `['op', '*', ['v', v], unary()]`!

#### BUG-05 [HIGH] — Scientific Calculator (`/tools/scientific-calculator/`) and all 7 expression calculators
- **Calculator:** Scientific Calculator (`/tools/scientific-calculator/`) and all 7 expression calculators
- **Reproduction Input:** `√9` or `√2` (typing or pasting the radical symbol without parentheses, as shown in the website's own formula cards like `d=s√2`)
- **Expected Result:** `3` for `√9`; `1.414213562` for `√2`
- **Actual Result:** Throws error: `Unknown variable: sqrt9` (and `Unknown variable: sqrt2`)
- **Source File & Location:** `site/assets/engine.js` line 4 (`src=String(src).replace(/π/g,'pi')...replace(/√/g,'sqrt')`)
- **Root Cause:** Line 4 of `site/assets/engine.js` performs a naive string replacement `.replace(/√/g, 'sqrt')` before tokenization. When `√` is followed by digits or letters (`√9` or `√x`), it becomes `sqrt9` or `sqrtx`, which matches the identifier regex `/[A-Za-z_][A-Za-z_0-9]*/y` as a single variable name!
- **Severity:** **HIGH**
- **Recommended Fix:** Replace `/√\s*(\d+(?:\.\d*)?|[A-Za-z_][A-Za-z_0-9]*)/g` with `'sqrt($1)'` before replacing standalone `√(` with `'sqrt('`, or tokenize `√` as a unary prefix operator in `unary()`.

#### BUG-06 [HIGH] — Scientific Calculator (`/tools/scientific-calculator/`)
- **Calculator:** Scientific Calculator (`/tools/scientific-calculator/`)
- **Reproduction Input:** Angle mode = `Degrees`, Expression = `tan(90)` (or `atan2(1, 1)` in `Degrees` mode)
- **Expected Result:** `tan(90°)` → Error / `Undefined` (vertical asymptote); `atan2(1, 1)` in Degrees mode → `45`
- **Actual Result:** `tan(90°)` outputs `16,331,239,353,195,370` (`1.6331239e16`); `atan2(1, 1)` in Degrees mode outputs `0.785398163` (radians!)
- **Source File & Location:** `site/assets/engine.js` line 13 (`if(options.degrees&&['sin','cos','tan'].includes(a[1].toLowerCase()))arr[0]*=Math.PI/180;let r=fn(...arr);if(options.degrees&&['asin','acos','atan'].includes(a[1].toLowerCase()))r*=180/Math.PI`)
- **Root Cause:** 1) `90 * Math.PI / 180` is not exactly `π/2` in IEEE-754 floating point, so `Math.cos(Math.PI/2) = 6.123e-17` and `Math.tan(Math.PI/2) = 1.633e16` without an asymptote check; 2) `atan2` is excluded from the inverse trig degree conversion list `['asin','acos','atan']`.
- **Severity:** **HIGH**
- **Recommended Fix:** In `run()`, check `if (fnName === 'tan' && Math.abs(Math.cos(rad)) < 1e-12) throw Error('Tangent is undefined at ' + arr[0] + ' (vertical asymptote)')`, and include `'atan2'` in `['asin','acos','atan','atan2']` when `options.degrees` is true.

#### BUG-07 [HIGH] — Trigonometry Calculator (`/tools/trigonometry-calculator/`)
- **Calculator:** Trigonometry Calculator (`/tools/trigonometry-calculator/`)
- **Reproduction Input:** `Angle = 90`, `Angle units = Degrees` (or `Angle = 180`, `Degrees`); plus inspection of outputs against catalog description
- **Expected Result:** 1) `cos(90°) = 0`, `sin(180°) = 0`; 2) Outputs include `cot θ` and inverse trig functions (`arcsin`, `arccos`, `arctan`) as promised in the page description (`'Compute sine, cosine, tangent, inverse trig and reciprocal ratios'`)
- **Actual Result:** 1) `cos(90°)` outputs `6.1232340e-17` and `sin(180°)` outputs `1.2246468e-16`; 2) `cot θ` is completely missing; 3) Inverse trig functions are completely missing!
- **Source File & Location:** `site/assets/app.js` line 81 (`function trig()`)
- **Root Cause:** `trig()` in `site/assets/app.js` calls `Math.sin(a)` and `Math.cos(a)` directly and passes them to `fmt()`, where `6.123234e-17 < 1e-6` triggers exponential notation `6.1232340e-17`! And `trig()` only lists 5 outputs (`sin θ`, `cos θ`, `tan θ`, `cosec θ`, `sec θ`), omitting `cot θ` and inverse trig.
- **Severity:** **HIGH**
- **Recommended Fix:** Snap `|sin(a)| < 1e-12` and `|cos(a)| < 1e-12` to `0`, add `cot θ = Math.abs(sin(a)) < 1e-12 ? 'Undefined' : cos(a)/sin(a)`, and add an Inverse Trig mode (`sin⁻¹`, `cos⁻¹`, `tan⁻¹`).

#### BUG-08 [HIGH] — Prime Number Checker (`/tools/prime-checker/`)
- **Calculator:** Prime Number Checker (`/tools/prime-checker/`)
- **Reproduction Input:** `Whole number = 91` (or any composite integer)
- **Expected Result:** `Primality: Not prime`, plus small factors / prime factorization (`7 × 13`, divisors `1, 7, 13, 91`) as explicitly stated in the page subtitle and meta description: `'Determine whether an integer is prime and list its small factors.'`
- **Actual Result:** Only outputs `Primality: Not prime` and `Number tested: 91` — zero factors are ever computed or displayed!
- **Source File & Location:** `source/make_catalog.py` line 33, `site/assets/app.js` line 77 (`function prime()`), and `site/assets/engine.js` line 45 (`export function isPrime(n)`)
- **Root Cause:** `isPrime(n)` in `engine.js` only returns a boolean `true`/`false`, and `prime()` in `app.js` never extracts factors.
- **Severity:** **HIGH**
- **Recommended Fix:** Add a deterministic trial-division factorizer `primeFactors(n)` in `engine.js` (up to `10^12`, `√n <= 10^6` iterations takes `< 2 ms` in JS!) and output `Prime factorization` (e.g., `7 × 13`) and `Smallest factor` / `Divisors`.

#### BUG-09 [HIGH] — Equation Solver (`/tools/equation-solver/`)
- **Calculator:** Equation Solver (`/tools/equation-solver/`)
- **Reproduction Input:** `Equation in x = (x - 2.003)^2 = 0`, `Range minimum = -40`, `Range maximum = 40`
- **Expected Result:** `Real root 1: 2.003`
- **Actual Result:** `Search result: No real root found in this interval`
- **Source File & Location:** `site/assets/engine.js` line 19 (`export function solveRoots(expr,variable='x',lo=-40,hi=40)`)
- **Root Cause:** `solveRoots()` divides `[lo, hi]` into 4,000 fixed steps (`step = 80 / 4000 = 0.02`) and only detects roots if either `|f(x_i)| < 1e-7` at a grid sample OR `f(x_i) * f(x_{i-1}) < 0` (sign change). For any even-multiplicity root `(x - r)^2 = 0` that does not land within `0.0003` of a grid point (such as `r = 2.003`, where the nearest grid point is `x = 2.00`, `f(2.00) = 9e-6 > 1e-7`), `f(x) >= 0` everywhere so no sign change occurs and the root is completely missed!
- **Severity:** **HIGH**
- **Recommended Fix:** In `solveRoots()`, in addition to sign-change brackets `pv * v < 0`, check for local minima of `|f(x)|` where `|f(x_{i-1})| < |f(x_{i-2})|` and `|f(x_{i-1})| <= |f(x_i)|` and run 20 iterations of Golden-Section / Brent minimization or damped Newton-Raphson `x - f(x)/f'(x)` to capture even-multiplicity tangent roots.

#### BUG-10 [HIGH] — Definite Integral Calculator (`/tools/integral-calculator/`)
- **Calculator:** Definite Integral Calculator (`/tools/integral-calculator/`)
- **Reproduction Input:** `Function f(x) = 1/x^2`, `Lower bound a = -1`, `Upper bound b = 1.001`
- **Expected Result:** Error / `Integral diverges (interior singularity at x = 0)`
- **Actual Result:** Outputs `Definite integral: 7,542.557640111`
- **Source File & Location:** `site/assets/engine.js` line 23 (`export function integrate(ast,a,b,n=1000)`)
- **Root Cause:** `integrate()` evaluates 1,000 fixed panels without checking whether subintervals cross a pole/singularity or whether `n=500` vs `n=1000` converge. When `a = -1, b = 1.001`, none of the 1,001 grid points `a + i*h` land exactly on `x = 0`, so Simpson's rule samples large finite numbers near `0` and returns `7,542.56` for a divergent integral $\int_{-1}^{1.001} x^{-2} dx = +\infty$!
- **Severity:** **HIGH**
- **Recommended Fix:** Compute both `S_500 = integrate(ast, a, b, 500)` and `S_1000 = integrate(ast, a, b, 1000)`. If `!Number.isFinite(S_1000)` or `Math.abs(S_1000 - S_500) > 1e-2 * (1 + Math.abs(S_1000))`, throw an informative error flagging a singularity, discontinuity, or non-convergent integral on `[a, b]`.

#### BUG-11 [MEDIUM] — Nth Root Calculator (`/tools/nth-root/`)
- **Calculator:** Nth Root Calculator (`/tools/nth-root/`)
- **Reproduction Input:** `Number x = -8`, `Root degree n = 3`
- **Expected Result:** `Root: -2` (since $(-2)^3 = -8$)
- **Actual Result:** Error: `Check your input: Result is undefined or outside the supported numeric range`
- **Source File & Location:** `source/make_catalog.py` line 46 (`'Root|x^(1/n)'`) and `site/assets/engine.js` line 14 (`case '^': return Math.pow(x, y)`)
- **Root Cause:** In IEEE-754 / JavaScript, `Math.pow(-8, 1/3)` returns `NaN` because fractional exponents on negative bases are undefined over the reals in `Math.pow`. The catalog adds a passive note `'For negative x with odd n, use a scientific calculator'`, which also fails unless the user knows to type `cbrt(-8)`!
- **Severity:** **MEDIUM**
- **Recommended Fix:** Add `nthroot(x, n)` to `known` in `site/assets/engine.js`: `nthroot: (x, n) => { if (n === 0) throw Error('Root degree n cannot be 0'); if (x < 0) { if (!Number.isInteger(n) || Math.abs(n % 2) !== 1) throw Error('Even root of a negative number is not real'); return -Math.pow(-x, 1/n); } return Math.pow(x, 1/n); }` and use `nthroot(x, n)` in `nth-root`.

#### BUG-12 [MEDIUM] — Parallelogram Area Calculator (`/tools/parallelogram-calculator/`)
- **Calculator:** Parallelogram Area Calculator (`/tools/parallelogram-calculator/`)
- **Reproduction Input:** `Base b = 10`, `Height h = 15`, `Other side s = 7`
- **Expected Result:** Validation Error: `Perpendicular height h (15) cannot exceed slant side length s (7)`
- **Actual Result:** Outputs `Area: 150`, `Perimeter: 34` for a geometrically impossible parallelogram!
- **Source File & Location:** `site/assets/app.js` line 39 (`validateFormula(t, v)`)
- **Root Cause:** In any Euclidean parallelogram with base $b$ and adjacent slant side $s$, the altitude $h$ perpendicular to base $b$ satisfies $h = s \sin\theta \le s$. `validateFormula()` checks `x > 0` for Geometry, but omits `v.h <= v.s` for `parallelogram-calculator`.
- **Severity:** **MEDIUM**
- **Recommended Fix:** Add `if (t.slug === 'parallelogram-calculator' && v.h > v.s) throw Error('Perpendicular height h cannot exceed the slant side s');` to `validateFormula()` in `site/assets/app.js`.

#### BUG-13 [MEDIUM] — 69 Formula Calculators across Physics (27), Finance (10), Computing (9), Statistics (3), Everyday (6), Trigonometry (2), Education (3), Math (9)
- **Calculator:** 69 Formula Calculators across Physics (27), Finance (10), Computing (9), Statistics (3), Everyday (6), Trigonometry (2), Education (3), Math (9)
- **Reproduction Input:** Examples: 1) `kinetic-energy` with `m = -10 kg, v = 5 m/s` → outputs `KE = -125 J`; 2) `bmi-calculator` with `kg = -70, cm = 175` → outputs `BMI = -22.86`; 3) `resistor-parallel` with `a = 10, b = -10, c = 5` → outputs `5 Ω`; 4) `tip-calculator` with `people = 2.5` or `-3`; 5) `z-score` with `sd = -10`; 6) `ideal-gas` with `T = -50 K`
- **Expected Result:** Clear domain validation errors rejecting negative mass, negative Kelvin temperature, negative resistance, negative standard deviation, and fractional/non-positive people count.
- **Actual Result:** Computes and displays unphysical/invalid numbers with green status `'Calculated locally · private by design'`.
- **Source File & Location:** `site/assets/app.js` lines 39–51 (`validateFormula(t, v)`)
- **Root Cause:** `validateFormula()` only contains rules for Geometry and 16 specific slugs, leaving 69 of the 113 formula calculators with zero domain validation beyond `Number.isFinite()`.
- **Severity:** **MEDIUM**
- **Recommended Fix:** Add comprehensive declarative field constraints (`min`, `max`, `integer`, `nonzero`) in `catalog.json` or expand `validateFormula()` to cover all 113 formula calculators.

#### BUG-14 [MEDIUM] — Function Graphing Calculator (`/tools/graphing-calculator/`)
- **Calculator:** Function Graphing Calculator (`/tools/graphing-calculator/`)
- **Reproduction Input:** `y₁ = f(x) = 1/x` or `ln(x)` (any function undefined at `x = 0`), `y₂ = ''`, `y₃ = ''`
- **Expected Result:** Plots `y₁ = 1/x` or `ln(x)` on the canvas AND shows valid status in the `Your results` card.
- **Actual Result:** The canvas plots the curve, but the `Your results` card displays a red error banner: `Check your input: Result is undefined or outside the supported numeric range` and `#result-status` turns red (`Please revise your inputs`)!
- **Source File & Location:** `site/assets/app.js` line 66 (`function calc(){evalSafe(()=>{const r=[];for(let i=1;i<=3;i++){let ex=$(`[data-field=f${i}]`).value.trim();if(ex)r.push({label:`f${i}(0)`,value:calculate(ex,{x:0})})}updateResults(...)})}`)
- **Root Cause:** `graph()` populates the `Your results` card by calling `calculate(ex, {x: 0})` inside `evalSafe()`. If any entered function has a vertical asymptote or domain exclusion at `x = 0` (such as `1/x`, `ln(x)`, `sqrt(x-2)`, `cot(x)`), `calculate(ex, {x: 0})` throws an error and replaces the entire result card with an error alert!
- **Severity:** **MEDIUM**
- **Recommended Fix:** Wrap `calculate(ex, {x: 0})` in a per-function `try { ... } catch { return 'Undefined at x = 0'; }` inside `graph()` so functions undefined at `x = 0` display `f₁(0): Undefined (outside domain at x = 0)` without triggering an input error.

#### BUG-15 [MEDIUM] — Automated Formula Test Suite (`source/test_formulas.mjs`)
- **Calculator:** Automated Formula Test Suite (`source/test_formulas.mjs`)
- **Reproduction Input:** Run `node source/test_formulas.mjs` from the repository root
- **Expected Result:** Executes all 113 default formula checks and 10 unit assertions and exits with code 0.
- **Actual Result:** Crashes immediately with `SyntaxError: Named export 'calculate' not found. The requested module '../site/assets/engine.js' is a CommonJS module` (Exit code 1).
- **Source File & Location:** `source/test_formulas.mjs` line 2 & root directory (missing `package.json`)
- **Root Cause:** Node.js treats `.js` files (`site/assets/engine.js`) as CommonJS unless the nearest `package.json` specifies `"type": "module"`. Because no `package.json` exists in the repository, importing named ES module exports from `engine.js` inside `test_formulas.mjs` fails in Node.js.
- **Severity:** **MEDIUM**
- **Recommended Fix:** Add a minimal zero-dependency `package.json` (`{"name": "axiom-atlas", "private": true, "type": "module", "scripts": {"test": "node source/test_formulas.mjs"}}`) or run with `node --input-type=module`.

#### BUG-16 [MEDIUM] — Derivative Calculator (`/tools/derivative-calculator/`)
- **Calculator:** Derivative Calculator (`/tools/derivative-calculator/`)
- **Reproduction Input:** Case A: Any function (check for tangent line plot promised in description); Case B: `fn = abs(x)`, `x = 0`
- **Expected Result:** Case A: Displays tangent line visualization promised in `'Estimate derivatives at a point and draw tangent lines'`; Case B: Reports that `abs(x)` is not differentiable at `x = 0` (`left derivative = -1, right derivative = +1`).
- **Actual Result:** Case A: No canvas or tangent line plot exists in `analytic('derivative')`; Case B: Outputs `Derivative at x: 0` for `abs(x)` at `x = 0`!
- **Source File & Location:** `source/make_catalog.py` line 23 and `site/assets/app.js` line 62 (`analytic('derivative')`)
- **Root Cause:** Central finite difference `(f(0+h) - f(0-h)) / (2h)` evaluates `(|h| - |-h|) / (2h) = 0` for any symmetric corner/cusp! And `analytic('derivative')` only renders 3 text lines without a canvas.
- **Severity:** **MEDIUM**
- **Recommended Fix:** Compare forward difference `(f(x+h) - f(x))/h` and backward difference `(f(x) - f(x-h))/h`; if they disagree by more than `1e-3 * (1 + |f'|)`, report `'Undefined (corner/cusp: left slope ≠ right slope)'`. Add a mini tangent-line canvas preview.

#### BUG-17 [LOW] — Fraction Calculator (`/tools/fraction-calculator/`)
- **Calculator:** Fraction Calculator (`/tools/fraction-calculator/`)
- **Reproduction Input:** `Fraction A = 999...999/1` (310 digits), `Operation = +`, `Fraction B = 1/2`
- **Expected Result:** Exact simplified fraction AND valid approximate decimal (or scientific notation overflow notice).
- **Actual Result:** `Exact simplified fraction` is correct, but `Approximate decimal` displays `Undefined`.
- **Source File & Location:** `site/assets/app.js` line 76 (`Number(num)/Number(den||1)`)
- **Root Cause:** When `num` or `den` exceeds `Number.MAX_VALUE` (`~1.797e308`, 309 digits), `Number(num)` evaluates to `Infinity`, and `Infinity / Infinity` is `NaN` (`Undefined`), even if `num / den` is a modest ratio!
- **Severity:** **LOW**
- **Recommended Fix:** Compute approximate decimal for large BigInts by scaling in `BigInt` (`Number((num * 10n**12n) / den) / 1e12`) before converting to `Number`.

#### BUG-18 [LOW] — Scientific Calculator (`/tools/scientific-calculator/`)
- **Calculator:** Scientific Calculator (`/tools/scientific-calculator/`)
- **Reproduction Input:** Click `5`, `0`, `%` on the Scientific Calculator keypad (`50%`)
- **Expected Result:** Evaluates `50% = 0.5` (or labels the button `mod` so users know it is binary remainder)
- **Actual Result:** Throws error: `Check your input: Incomplete expression`
- **Source File & Location:** `site/assets/app.js` line 55 and `site/assets/engine.js` line 10
- **Root Cause:** The keypad displays `%` next to `+`, `-`, `^`, `!`, which standard calculator users expect to be unary percentage (`/ 100`), but `engine.js` parses `%` exclusively as the binary C/JS remainder operator (`50 % 3 = 2`).
- **Severity:** **LOW**
- **Recommended Fix:** In `pow()` (`site/assets/engine.js` line 9), if `%` is not followed by a primary expression (or replace the keypad button with `mod` and treat `%` as postfix `/ 100` when unary), support both `50%` (`0.5`) and `50 mod 3` (`2`).

## 3. Comprehensive Testing & Mathematical Benchmark Strategy (Section 7)

### 3.1 Five-Layer Verification Pyramid

To ensure AxiomAtlas 2.0 achieves mathematical reliability across all 136 existing and 16 proposed calculators without regressions, the test architecture should be structured into five distinct, non-destructive layers executable via `node` and headless Chromium:

| Test Layer | Scope & Target Files | Execution Environment | Target Test Count | Pass Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **1. Unit Tests (`tests/unit/engine.test.mjs`)** | `compile()`, `run()`, `calculate()`, `fmt()`, `solveQuadratic()`, `solveRoots()`, `gaussian()`, `matrixOp()`, `descriptive()`, `integrate()`, `convertUnit()`, `fractionOp()`, `isPrime()` in `site/assets/engine.js` | Node.js native test runner (`node --test`) — zero npm dependencies required! | 250+ assertions | 100% pass; relative error $< 10^{-12}$ for algebraic routines, $< 10^{-9}$ for numerical quadrature/roots. |
| **2. Catalog & Validation Integration Tests (`tests/integration/catalog.test.mjs`)** | All 136 tools in `site/assets/catalog.json` + `validateFormula()` and `overrideZeroRate()` extracted into a shared validation module | Node.js native test runner (`node --test`) | 680+ assertions (5 per calculator: default, boundary, zero, negative, invalid) | Every calculator passes valid inputs and throws specific, human-readable `Error` messages on domain violations. |
| **3. Mathematical Benchmark Suite (`tests/benchmarks/math_benchmarks.test.mjs`)** | Reference datasets from NIST StRD, Abramowitz & Stegun, IEEE-754, and exact symbolic identities | Node.js native test runner (`node --test`) | 100+ benchmark cases | Matches NIST / exact analytical reference values within specified ULP / tolerance bounds. |
| **4. UI, Mobile Viewport & Accessibility Tests (`tests/e2e/ui_a11y.spec.mjs`)** | Rendered DOM across Desktop (`1440×900`), Tablet (`768×1024`), and Mobile (`375×812`, `360×640`), keyboard navigation, ARIA roles, WCAG contrast | Headless Chromium / Playwright or Selenium in CI | 155 pages checked | Zero console errors, zero horizontal overflow, WCAG AA contrast $\ge 4.5:1$, full keyboard operability. |
| **5. Build & SEO Regression Tests (`tests/regression/build_seo.test.mjs`)** | `site/sitemap.xml`, canonical tags, JSON-LD validity, `_redirects`, broken internal links, asset bundle sizes | Python / Node CI script | All 155 HTML pages | All 136 `/tools/<slug>/` and 14 `/categories/<slug>/` routes resolve with valid JSON-LD (`url != null`) and canonical URLs. |

### 3.2 Mandatory Input Boundary Matrix for All 136 Calculators

Every calculator in `catalog.json` must be tested against 11 input classes:
1. **Normal Default Inputs:** Verify all 113 formula tools and 23 specialized tools match verified reference outputs at their catalog default values.
2. **Boundary Inputs:** Triangle inequality boundary ($a + b = c$), torus boundary ($R = r$), probability bounds ($p = 0, p = 1$), angle bounds ($0^\circ, 90^\circ, 180^\circ, 360^\circ$), correlation bounds ($r = \pm 1$).
3. **Zero Values:** Zero interest rate ($r = 0$ in `emi-calculator`, `sip-calculator`, `future-value-annuity`), zero divisor ($b = 0$ in `modulo`, `fraction`, `ratio`, `ohms-law`, `speed`), zero matrix determinant, zero vector `[0,0,0]`.
4. **Negative Values:** Negative numbers in `nth-root` (`x = -8, n = 3` vs `n = 4`), `modulo-calculator` (`a = -7, b = 3` and `a = 7, b = -3`), `quadratic-equation` ($\Delta < 0$), and rejection of negative physical quantities (mass $m < 0$, Kelvin $T < 0$, area $A \le 0$).
5. **Very Large Values (Overflow Guards):** Factorial $n = 170$ vs $n = 171$, Combinations $C(1024, 512)$, Prime checker $n = 999,999,999,989$ ($< 10^{12}$), Fraction calculator with 500-digit `BigInt` numerators, Compound interest with large $n \cdot t$.
6. **Very Small Values (Underflow & Precision Guards):** Universal gravitation with $m_1 = 1, m_2 = 1, r = 100$ ($F = 6.6743 	imes 10^{-15}	ext{ N}$), Planck-scale powers $10^{-34}$, near-zero differences.
7. **Invalid & Malformed Inputs:** Empty fields, `NaN`, `Infinity`, unbalanced parentheses `sin(x`, unknown variables `2*y`, multiple equals signs `x=1=2`.
8. **Decimal Precision & Floating-Point Cancellation:** `0.1 + 0.2 = 0.3`, quadratic equation $x^2 - 10^9 x + 1 = 0$ (Citardauq stability check).
9. **Unit Conversions:** Round-trip identity `convertUnit(g, convertUnit(g, x, u1, u2), u2, u1) === x` across all 103 units in `unitGroups`, plus absolute zero boundary $-273.15^\circ	ext{C} = 0	ext{ K} = -459.67^\circ	ext{F}$.
10. **Degree / Radian Conversions:** Exact values at $0^\circ, 30^\circ, 45^\circ, 60^\circ, 90^\circ, 180^\circ, 270^\circ, 360^\circ$ and $\pi/6, \pi/4, \pi/3, \pi/2, \pi$.
11. **Domain Restrictions:** $\ln(x \le 0)$, $\log_1(x)$, $rcsin(x > 1)$, Snell's law total internal reflection ($n_1 \sin	heta_1 / n_2 > 1$), thin lens at focal point ($o = f$).

### 3.3 Independently Verifiable Reference Benchmark Cases

| Calculator / Engine Routine | Reference Benchmark Case & Input | Independently Verifiable Expected Answer | Tolerance / Verification Standard |
| :--- | :--- | :--- | :--- |
| **`solveQuadratic` (Ill-conditioned roots)** | $a = 1, b = -10^9, c = 1$ | $x_1 = 10^{-9}$, $x_2 = 10^9$ (Naive formula gives $x_1 = 0$ due to IEEE-754 cancellation; Citardauq gives exact $10^{-9}$) | Relative error $< 10^{-15}$ |
| **`integrate` (Simpson's Rule)** | $\int_0^1 rac{4}{1 + x^2}\,dx$ | $\pi = 3.141592653589793$ | Absolute error $< 10^{-14}$ |
| **`integrate` (Transcendental)** | $\int_0^\pi \sin(x)\,dx$ | $2.000000000000000$ | Absolute error $< 10^{-12}$ |
| **`descriptive` (NIST StRD NumAcc1)** | `[10000001, 10000002, 10000003]` | Mean $= 10,000,002$, Sample SD $= 1.0$, Pop Var $= rac{2}{3} pprox 0.666666667$ | Relative error $< 10^{-11}$ |
| **`gaussian` & `matrixOp` (Hilbert $3	imes 3$)** | $H_{ij} = rac{1}{i+j-1}$ for $i,j \in \{1,2,3\}$ | $\det(H_3) = rac{1}{2160} pprox 4.62962963 	imes 10^{-4}$; $H_3^{-1} = egin{pmatrix} 9 & -36 & 30 \ -36 & 192 & -180 \ 30 & -180 & 180 \end{pmatrix}$ | Relative error $< 10^{-12}$ |
| **`isPrime` (Carmichael & Large Primes)** | $n = 561$ ($3 	imes 11 	imes 17$, Carmichael number); $n = 999,999,999,989$ | $561 	o 	ext{false}$ (Prime factors: $3, 11, 17$); $999,999,999,989 	o 	ext{true}$ | Exact boolean & factor match |
| **`fractionOp` (Exact BigInt Rational)** | $rac{1}{999999999999999999} + rac{1}{999999999999999999}$ | Exact string `"2/999999999999999999"` | Exact string equality |
| **`emi-calculator` (Standard Mortgage)** | $P = 500,000, r = 9\%, t = 5	ext{ years}$ | $	ext{EMI} = 10,379.1776$, $	ext{Total Paid} = 622,750.6568$, $	ext{Interest} = 122,750.6568$ | Absolute error $< 10^{-4}$ |
| **`herons-formula` (3-4-5 & 13-14-15)** | $(a,b,c) = (3,4,5)$ and $(13,14,15)$ | $s = 6, 	ext{Area} = 6$; $s = 21, 	ext{Area} = 84$ | Exact integer match |
