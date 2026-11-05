# AxiomAtlas "Explain Calculation" Architecture & Readiness Audit

**Live Website:** [AxiomAtlas](https://axiomatlas.netlify.app/)
**Audit Scope:** Section 4 — Reusable `Explain Calculation` Feature Specification, Subject-Specific Pedagogical Templates, Deterministic Calculation Trace Engine Architecture, and 136-Calculator Readiness Matrix.
**Status:** Phase 0 Audit Deliverable — Architecture and design specification only (no production code modified).

## 1. Product Vision & UX Flow for "Explain Calculation"

After any valid calculation completes on a supported calculator, the `.answer-card` displays an interactive **`✦ Explain Calculation`** button below `#result-display`. Clicking **`Explain Calculation`** expands an accessible, step-by-step mathematical derivation drawer (`#explain-drawer`, `aria-expanded="true"`) containing 8 standardized, deterministic sections:

1. **Formula Used:** Symbolic mathematical formula with clear notation.
2. **Meaning of Each Variable:** Symbol, label, input value, unit, and canonical SI conversion (if applicable).
3. **Substitution of Input Values:** The governing formula with the user's exact numeric values plugged in.
4. **Step-by-Step Operations:** Ordered evaluation of sub-expressions following mathematical order of operations (PEMDAS / AST bottom-up traversal).
5. **Intermediate Results:** Exact intermediate numeric quantities computed at each stage.
6. **Final Answer:** Rounded and unrounded final result(s).
7. **Units & Dimensional Verification:** How input units combine algebraically to produce the output unit.
8. **Assumptions & Limitations:** Domain constraints, physical idealizations, or numerical approximation caveats.

### Worked Reference Example: Circle Calculator (`/tools/circle-calculator/`)
- **User Input:** Radius $r = 5	ext{ cm}$
- **Computed Output:** Area $= 78.53981634	ext{ cm}^2$, Circumference $= 31.41592654	ext{ cm}$, Diameter $= 10	ext{ cm}$
- **Generated Deterministic Explanation (for Area):**
  1. **Formula Used:** $A = \pi r^2$
  2. **Meaning of Each Variable:**
     - $r = 5	ext{ cm}$ — Radius of the circle (distance from center to edge)
     - $\pi pprox 3.141592653589793$ — Ratio of a circle's circumference to its diameter
  3. **Substitution of Input Values:** $A = \pi 	imes (5	ext{ cm})^2$
  4. **Step-by-Step Operations & 5. Intermediate Results:**
     - **Step 1 (Exponentiation):** Square the radius: $r^2 = 5^2 = 25	ext{ cm}^2$
     - **Step 2 (Multiplication):** Multiply by $\pi$: $A = 3.141592653589793 	imes 25	ext{ cm}^2 = 78.53981633974483	ext{ cm}^2$
  6. **Final Answer:** $A = 78.53981634	ext{ cm}^2$ (or $25\pi	ext{ cm}^2$ in exact terms)
  7. **Units:** $(	ext{cm})^2 = 	ext{cm}^2$ (square centimeters, a unit of 2D surface area)
  8. **Assumptions & Limitations:** Assumes a flat Euclidean plane and a positive radius ($r > 0$).

## 2. Subject-Specific Explanation Specifications (Section 4.1)

Each category in AxiomAtlas requires tailored domain pedagogy while sharing the same underlying deterministic trace structure:

| Subject Domain | Required Explanation Elements | Concrete Example from Existing AxiomAtlas Catalog |
| :--- | :--- | :--- |
| **1. Mathematics & Numbers** | Governing formula; exact integer/rational decomposition or algebraic substitution; order-of-operations simplification; intermediate arithmetic results; exact vs. decimal comparison. | **Fraction Calculator (`/tools/fraction-calculator/`):** For $rac{3}{4} + rac{2}{3}$: 1) Find common denominator $b \cdot d = 4 	imes 3 = 12$; 2) Scale numerators: $3 	imes 3 = 9$ and $2 	imes 4 = 8$; 3) Add numerators: $9 + 8 = 17 \implies rac{17}{12}$; 4) Reduce via $\gcd(17, 12) = 1 \implies rac{17}{12} = 1rac{5}{12} pprox 1.416666667$. |
| **2. Algebra** | Standard form transformation; discriminant or pivot calculation; step-by-step equation-solving or sequence substitution; back-substitution verification ($LHS = RHS$). | **Quadratic Equation Solver (`/tools/quadratic-equation/`):** For $1x^2 - 5x + 6 = 0$: 1) Identify $a=1, b=-5, c=6$; 2) Compute discriminant $\Delta = (-5)^2 - 4(1)(6) = 25 - 24 = 1 > 0$ (two distinct real roots); 3) Compute $\sqrt{\Delta} = 1$; 4) Apply $x = rac{-(-5) \pm 1}{2(1)} \implies x_1 = rac{4}{2} = 2, x_2 = rac{6}{2} = 3$; 5) Verify: $(2)^2 - 5(2) + 6 = 0\ \checkmark$. |
| **3. Graphing & Calculus** | Numerical method rule (Central Finite Difference, Composite Simpson's Rule, or Limit Sampling sequence); step size $h$ and sample points; intermediate function evaluations; truncation/discretization error note. | **Derivative Calculator (`/tools/derivative-calculator/`):** For $f(x) = x^2 + \sin(x)$ at $x = 2$: 1) Central difference rule $f'(x) pprox rac{f(x+h) - f(x-h)}{2h}$ with $h = 2 	imes 10^{-5}$; 2) Evaluate $f(2.00002) = 4.9093691003$ and $f(1.99998) = 4.9092257536$; 3) Subtract: $\Delta f = 0.0001433467$; 4) Divide by $2h = 4 	imes 10^{-5} \implies f'(2) pprox 3.58385316$; 5) Construct tangent line $y = f(2) + f'(2)(x-2) = 3.58385316x - 2.25840872$. |
| **4. Geometry** | Geometric shape relationship & diagram labels; formula selection rationale; input measurements & feasibility check (e.g. triangle inequality); intermediate values (e.g. semiperimeter $s$ or slant height $l$); area/volume unit powers ($	ext{m}, 	ext{m}^2, 	ext{m}^3$). | **Heron's Formula (`/tools/herons-formula/`):** For $a=5, b=6, c=7$: 1) Verify triangle inequality: $5+6 > 7\ \checkmark$; 2) Compute semiperimeter $s = rac{5+6+7}{2} = 9$; 3) Compute factors: $s-a = 4$, $s-b = 3$, $s-c = 2$; 4) Multiply under radical: $9 	imes 4 	imes 3 	imes 2 = 216$; 5) Take square root: $A = \sqrt{216} pprox 14.69693846$. |
| **5. Trigonometry** | Selected trigonometric ratio/identity; angle unit conversion ($	heta_{	ext{rad}} = 	heta_{	ext{deg}} 	imes rac{\pi}{180}$); trig function evaluation; quadrant sign and domain/asymptote restrictions. | **Law of Cosines (`/tools/law-of-cosines/`):** For $a=7, b=9, C=60^\circ$: 1) Formula $c = \sqrt{a^2 + b^2 - 2ab\cos(C)}$; 2) Convert $C = 60^\circ 	imes rac{\pi}{180} = 1.04719755	ext{ rad}$, $\cos(60^\circ) = 0.5$; 3) Compute $a^2 + b^2 = 49 + 81 = 130$; 4) Subtract $2ab\cos(C) = 2(7)(9)(0.5) = 63 \implies c^2 = 130 - 63 = 67$; 5) $c = \sqrt{67} pprox 8.18535277$. |
| **6. Physics** | Governing physical law (e.g., Newton's 2nd Law, Conservation of Energy, Ideal Gas Law); variable meanings & physical constants ($g = 9.80665	ext{ m/s}^2$, $G = 6.6743	imes 10^{-11}	ext{ N}\cdot	ext{m}^2/	ext{kg}^2$, $R = 8.31446	ext{ J/(mol}\cdot	ext{K)}$); conversion to canonical SI units; formula substitution; dimensional analysis check (e.g. $	ext{kg} \cdot 	ext{m}^2/	ext{s}^2 = 	ext{J}$); physical interpretation & idealization caveats. | **Projectile Motion (`/tools/projectile-range/`):** For $v=20	ext{ m/s}, 	heta=45^\circ, g=9.80665	ext{ m/s}^2$: 1) Governing kinematics under uniform gravity without air drag; 2) Convert $	heta = 45^\circ = 0.785398	ext{ rad}$, $\sin(2	heta) = \sin(90^\circ) = 1$; 3) Range $R = rac{v^2 \sin(2	heta)}{g} = rac{400 	imes 1}{9.80665} = 40.78865	ext{ m}$; 4) Dimensional check: $rac{(	ext{m/s})^2}{	ext{m/s}^2} = 	ext{m}\ \checkmark$; 5) Assumption: Flat ground ($y_0 = 0$) and zero aerodynamic drag. |
| **7. Statistics** | Statistical formula (population vs. sample); sorted sample dataset & sample size $n$; intermediate sums ($\sum x_i$, $\sum(x_i - ar{x})^2$, degrees of freedom $n-1$); substantive interpretation of result; statistical assumptions (e.g., normality, independent trials). | **95% Confidence Interval (`/tools/confidence-interval/`):** For $ar{x}=120, s=20, n=100$: 1) Formula $ar{x} \pm z_{0.975} rac{s}{\sqrt{n}}$ with $z_{0.975} = 1.96$; 2) Compute Standard Error $SE = rac{20}{\sqrt{100}} = rac{20}{10} = 2$; 3) Compute Margin of Error $ME = 1.96 	imes 2 = 3.92$; 4) Interval: $[120 - 3.92, 120 + 3.92] = [116.08, 123.92]$; 5) Assumption: Independent random sample with $n \ge 30$ (Central Limit Theorem normal approximation). |
| **8. Finance** | Financial formula; periodic interest rate conversion ($i = rac{r}{100 	imes n}$); total compounding periods ($N = n 	imes t$); cash-flow timing assumption (ordinary end-of-period vs. annuity-due beginning-of-period); step-by-step compounding breakdown; financial summary (principal vs. interest share). | **Loan EMI Calculator (`/tools/emi-calculator/`):** For $P = 500,000, r = 9\%/	ext{yr}, t = 5	ext{ yrs}$: 1) Monthly rate $i = rac{9}{1200} = 0.0075$ ($0.75\%/	ext{month}$), total months $n = 5 	imes 12 = 60$; 2) Compounding factor $(1+i)^n = (1.0075)^{60} = 1.56568103$; 3) $	ext{EMI} = 500000 	imes rac{0.0075 	imes 1.56568103}{1.56568103 - 1} = 10,379.18$; 4) Total Paid $= 60 	imes 10,379.18 = 622,750.66$; Total Interest $= 622,750.66 - 500,000 = 122,750.66$ ($19.7\%$ of total payments). |

## 3. Deterministic Technical Architecture (Section 4.2)

### 3.1 Core Architectural Principle: Zero AI Hallucination, 100% Deterministic AST Tracing

AxiomAtlas **must never** call an external LLM or generative AI to invent mathematical steps. All explanations must be produced deterministically in the browser from the actual calculation engine (`site/assets/engine.js`).

Because **113 of the 136 calculators (`83.1%`)** are already defined declaratively in `site/assets/catalog.json` as AST expression strings (`o.expr`, e.g., `p*(1+r/(100*n))^(n*t)`), we can automatically generate exact step-by-step derivations for all 113 formula calculators by adding a **50-line AST Trace Walker (`traceCalculate(expr, vars, meta)`)** to `site/assets/engine.js`!

### 3.2 Deterministic Explanation Data Schema & Engine Extension

```javascript
// Proposed deterministic trace return structure in site/assets/engine.js
export function traceCalculate(expr, vars = {}, options = {}, fieldMeta = []) {
  const ast = compile(expr);
  const steps = [];

  function formatNode(node, substitute = false) {
    if (node[0] === 'n') return fmt(node[1]);
    if (node[0] === 'v') {
      const k = node[1];
      if (!substitute) return k;
      if (Object.prototype.hasOwnProperty.call(vars, k)) return fmt(Number(vars[k]));
      return k === 'pi' || k === 'PI' ? 'π (3.14159265)' : k === 'e' ? 'e (2.71828183)' : k;
    }
    if (node[0] === 'neg') return `−(${formatNode(node[1], substitute)})`;
    if (node[0] === 'call') return `${node[1]}(${node[2].map(x => formatNode(x, substitute)).join(', ')})`;
    if (node[0] === 'op') return `(${formatNode(node[2], substitute)} ${node[1]} ${formatNode(node[3], substitute)})`;
  }

  function walkWithTrace(node) {
    if (node[0] === 'n') return node[1];
    if (node[0] === 'v') {
      const k = node[1];
      if (Object.prototype.hasOwnProperty.call(vars, k)) return Number(vars[k]);
      if (k === 'pi' || k === 'PI') return Math.PI;
      if (k === 'e') return Math.E;
      if (k === 'tau') return 2 * Math.PI;
      throw Error('Unknown variable: ' + k);
    }
    if (node[0] === 'neg') {
      const val = -walkWithTrace(node[1]);
      steps.push({ exprSymbolic: formatNode(node, false), exprSubstituted: formatNode(node, true), value: val, op: 'Negation' });
      return val;
    }
    if (node[0] === 'call') {
      const args = node[2].map(walkWithTrace);
      const val = evalFunction(node[1], args, options);
      steps.push({
        exprSymbolic: formatNode(node, false),
        exprSubstituted: `${node[1]}(${args.map(fmt).join(', ')})`,
        value: val,
        op: `Function ${node[1]}()`
      });
      return val;
    }
    if (node[0] === 'op') {
      const left = walkWithTrace(node[2]);
      const right = walkWithTrace(node[3]);
      const val = evalBinaryOp(node[1], left, right);
      steps.push({
        exprSymbolic: formatNode(node, false),
        exprSubstituted: `${fmt(left)} ${node[1]} ${fmt(right)}`,
        value: val,
        op: { '+': 'Addition', '-': 'Subtraction', '*': 'Multiplication', '/': 'Division', '^': 'Exponentiation', '%': 'Modulo' }[node[1]]
      });
      return val;
    }
  }

  const finalValue = walkWithTrace(ast);
  return {
    symbolicFormula: formatNode(ast, false),
    substitutedFormula: formatNode(ast, true),
    steps,
    finalValue
  };
}
```

### 3.3 Enriched Metadata Schema in `catalog.json`

Each tool in `source/make_catalog.py` can optionally include an `explain` object (with automatic fallback to `fields`, `outputs`, `formula`, and `note` when omitted):
- `governingLaw`: Name of theorem, law, or definition (e.g., `"Archimedes' Principle"`, `"Law of Cosines"`, `"Compound Interest Formula"`).
- `variables`: Map of `{ key: { symbol, meaning, dimension, siUnit } }`.
- `assumptions`: Array of domain/model assumptions (derived automatically from `note` + `validateFormula` rules).
- `dimensionalCheck`: Algebraic unit derivation string (e.g., `"kg × (m/s)² = kg·m²/s² = J (Joules)"`).

## 4. Complete 136-Calculator Explanation-Readiness Matrix (Section 4.2)

Every existing calculator was inspected against `site/assets/app.js` and `site/assets/engine.js` and classified into one of the five mandatory readiness tiers:

1. **`Ready with existing logic` (113 calculators):** All 113 `type: "formula"` calculators whose outputs are AST expressions evaluated by `calculate(o.expr, v)`—adding `traceCalculate()` to `engine.js` and `form()` in `app.js` immediately provides step-by-step substitution and intermediate operation traces for all 113 tools!
2. **`Minor changes required` (7 calculators):** `scientific-calculator`, `expression-simplifier`, `derivative-calculator`, `limit-calculator`, `trigonometry-calculator`, `vector-calculator`, `probability-calculator` (`binomial`)—already use `compile()`/`run()` or direct algebraic formulas in `app.js` that only need a 5–10 line trace hook.
3. **`Major calculation-engine changes required` (6 calculators):** `equation-solver` (`solveRoots`), `linear-system` (`gaussian`), `matrix-calculator` (`matrixOp`), `integral-calculator` (`integrate`), `statistics-calculator` (`descriptive`), `correlation-calculator` (`regression`)—iterative or matrix algorithms in `engine.js` that need to record pivot/elimination steps, sample quartiles/sums, or quadrature subinterval summaries.
4. **`Manual implementation required` (7 calculators):** `quadratic-equation`, `fraction-calculator`, `prime-checker`, `number-base-converter`, `unit-converter`, `date-difference`, `age-calculator`—specialized discrete/calendar/radix algorithms in `engine.js`/`app.js` that require custom pedagogical step templates (e.g., showing repeated division by target base for `number-base-converter` or LCD calculation for `fraction-calculator`).
5. **`Not suitable for step-by-step explanation` (3 calculators):** `graphing-calculator` (interactive multi-curve canvas plot), `random-number-generator` (cryptographic CSPRNG draw), `color-converter` (visual color swatch picker—though RGB-to-HSL channel math can optionally be shown as a reference note).

### Summary Count by Readiness Tier

| Readiness Classification | Calculator Count | Share of Catalog | Implementation Mechanism |
| :--- | :--- | :--- | :--- |
| **Ready with existing logic** | **113** | 83.1% | Automatic via `traceCalculate(o.expr, v)` AST walker in `engine.js` + `form()` in `app.js` |
| **Minor changes required** | **7** | 5.1% | Hook `traceCalculate()` or 5-line formula trace into specialized renderer in `app.js` |
| **Major calculation-engine changes required** | **6** | 4.4% | Instrument `gaussian()`, `matrixOp()`, `solveRoots()`, `integrate()`, `descriptive()`, `regression()` to emit trace steps |
| **Manual implementation required** | **7** | 5.1% | Custom step-by-step formatter for `solveQuadratic`, `fractionOp`, `isPrime`, `base`, `convertUnit`, `dates` |
| **Not suitable for step-by-step explanation** | **3** | 2.2% | Omit button or show static method note (`graphing-calculator`, `random-number-generator`, `color-converter`) |
| **Total** | **136** | **100.0%** | — |

### Complete Per-Calculator Explanation-Readiness Table (All 136 Calculators)

| # | Slug | Calculator Name | Category | Renderer Type | Explanation Readiness Classification | Required Technical Work for Explain Calculation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `scientific-calculator` | [Scientific Calculator](https://axiomatlas.netlify.app/tools/scientific-calculator/) | Math & numbers | `scientific` | **Minor changes required** | Pass user's compiled AST in scientific() through traceCalculate() to display bottom-up PEMDAS evaluation steps |
| 2 | `equation-solver` | [Equation Solver](https://axiomatlas.netlify.app/tools/equation-solver/) | Algebra | `equation` | **Major calculation-engine changes required** | Modify solveRoots() in engine.js to record sign-change bracket [a, b], f(a), f(b), and key bisection iterations |
| 3 | `quadratic-equation` | [Quadratic Equation Solver](https://axiomatlas.netlify.app/tools/quadratic-equation/) | Algebra | `quadratic` | **Manual implementation required** | Extend solveQuadratic() to return {a, b, c, discriminant, sqrtDiscriminant, formulaStep, roots} for step-by-step quadratic derivation |
| 4 | `linear-system` | [Simultaneous Equation Solver](https://axiomatlas.netlify.app/tools/linear-system/) | Algebra | `system` | **Major calculation-engine changes required** | Extend gaussian() in engine.js to log row swaps (R_i <-> R_k), pivot scaling (R_k / pivot), and row elimination (R_i - c*R_k) steps |
| 5 | `expression-simplifier` | [Expression Evaluator](https://axiomatlas.netlify.app/tools/expression-simplifier/) | Algebra | `expression` | **Minor changes required** | Call traceCalculate(expr, vars) in expression() renderer to show variable substitution and step-by-step arithmetic evaluation |
| 6 | `graphing-calculator` | [Function Graphing Calculator](https://axiomatlas.netlify.app/tools/graphing-calculator/) | Graphing & calculus | `graph` | **Not suitable for step-by-step explanation** | Interactive 2D canvas plotter; can optionally explain y-intercept evaluation f(0) and domain intervals |
| 7 | `derivative-calculator` | [Derivative Calculator](https://axiomatlas.netlify.app/tools/derivative-calculator/) | Graphing & calculus | `derivative` | **Minor changes required** | Record h, x-h, x+h, f(x-h), f(x+h), central difference quotient (f(x+h)-f(x-h))/(2h), and tangent line y - f(x0) = m(x - x0) |
| 8 | `integral-calculator` | [Definite Integral Calculator](https://axiomatlas.netlify.app/tools/integral-calculator/) | Graphing & calculus | `integral` | **Major calculation-engine changes required** | Extend integrate() in engine.js to return step size h=(b-a)/n, endpoint values f(a), f(b), odd/even Simpson sums, and (h/3)*total |
| 9 | `limit-calculator` | [Numerical Limit Calculator](https://axiomatlas.netlify.app/tools/limit-calculator/) | Graphing & calculus | `limit` | **Minor changes required** | Display table of left/right approaches x ± 10^-2, x ± 10^-3, x ± 10^-4, x ± 10^-5 and convergence check |L_left - L_right| |
| 10 | `matrix-calculator` | [Matrix Calculator](https://axiomatlas.netlify.app/tools/matrix-calculator/) | Linear algebra | `matrix` | **Major calculation-engine changes required** | Extend matrixOp() in engine.js to record element-wise dot products for multiplication and row operations for determinant/inverse |
| 11 | `statistics-calculator` | [Statistics Calculator](https://axiomatlas.netlify.app/tools/statistics-calculator/) | Statistics | `stats` | **Major calculation-engine changes required** | Extend descriptive() in engine.js to expose sorted array, Σx_i, median split indices, and Σ(x_i - mean)^2 table |
| 12 | `correlation-calculator` | [Correlation & Regression](https://axiomatlas.netlify.app/tools/correlation-calculator/) | Statistics | `regression` | **Major calculation-engine changes required** | Expose x̄, ȳ, Σ(x_i-x̄)(y_i-ȳ), Σ(x_i-x̄)^2, Σ(y_i-ȳ)^2, slope m = S_xy/S_xx, and intercept b = ȳ - mx̄ in regression() |
| 13 | `probability-calculator` | [Binomial Probability](https://axiomatlas.netlify.app/tools/probability-calculator/) | Statistics | `binomial` | **Minor changes required** | Display C(n,k) combination step, p^k step, (1-p)^(n-k) step, and product P(X=k) = C(n,k)*p^k*(1-p)^(n-k) in binomial() |
| 14 | `unit-converter` | [Universal Unit Converter](https://axiomatlas.netlify.app/tools/unit-converter/) | Converters | `converter` | **Manual implementation required** | Expose base SI unit conversion factor unitGroups[group][from] and target factor unitGroups[group][to] (or °C/°F/K offset steps) |
| 15 | `number-base-converter` | [Number Base Converter](https://axiomatlas.netlify.app/tools/number-base-converter/) | Computing | `base` | **Manual implementation required** | Show positional power expansion Σ d_i × base^i -> Decimal, followed by repeated Euclidean division by target base |
| 16 | `fraction-calculator` | [Fraction Calculator](https://axiomatlas.netlify.app/tools/fraction-calculator/) | Math & numbers | `fraction` | **Manual implementation required** | Extend fractionOp() in engine.js to return unreduced numerator/denominator (ad±bc)/(bd), GCD(p, q), and simplified p/gcd / q/gcd |
| 17 | `prime-checker` | [Prime Number Checker](https://axiomatlas.netlify.app/tools/prime-checker/) | Math & numbers | `prime` | **Manual implementation required** | Record trial division bound floor(√n), smallest prime divisor found (or prime factorization tree), and primality conclusion |
| 18 | `date-difference` | [Date Difference Calculator](https://axiomatlas.netlify.app/tools/date-difference/) | Date & time | `dates` | **Manual implementation required** | Show UTC Julian/epoch day numbers for Date A and Date B, subtraction Δdays, and floor(Δdays/7) weeks + (Δdays mod 7) days |
| 19 | `age-calculator` | [Age Calculator](https://axiomatlas.netlify.app/tools/age-calculator/) | Date & time | `age` | **Manual implementation required** | Show calendar year/month span (b.y-a.y)*12 + (b.m-a.m), month-end clamping date, and remaining days calculation |
| 20 | `random-number-generator` | [Random Number Generator](https://axiomatlas.netlify.app/tools/random-number-generator/) | Math & numbers | `random` | **Not suitable for step-by-step explanation** | Cryptographic random draw via window.crypto.getRandomValues(); can show rejection-sampling range note |
| 21 | `trigonometry-calculator` | [Trigonometry Calculator](https://axiomatlas.netlify.app/tools/trigonometry-calculator/) | Trigonometry | `trig` | **Minor changes required** | Show angle conversion θ_rad = θ_deg × π/180, primary ratio definitions, and reciprocal identities csc=1/sin, sec=1/cos, cot=1/tan |
| 22 | `vector-calculator` | [Vector Calculator](https://axiomatlas.netlify.app/tools/vector-calculator/) | Linear algebra | `vector` | **Minor changes required** | Show component-wise dot product a_x b_x + a_y b_y + a_z b_z, 3×3 determinant expansion for cross product, and arccos(a·b/(|a||b|)) |
| 23 | `color-converter` | [HEX / RGB Color Converter](https://axiomatlas.netlify.app/tools/color-converter/) | Computing | `color` | **Not suitable for step-by-step explanation** | Visual color picker; can optionally display hex-pair base-16 to 0..255 RGB and normalized [0,1] min/max HSL formulas |
| 24 | `percentage-calculator` | [Percentage Calculator](https://axiomatlas.netlify.app/tools/percentage-calculator/) | Math & numbers | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Result = p*n/100` |
| 25 | `percent-change` | [Percentage Change Calculator](https://axiomatlas.netlify.app/tools/percent-change/) | Math & numbers | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Change = new-old`, `Percent change = 100*(new-old)/old` |
| 26 | `percent-difference` | [Percentage Difference Calculator](https://axiomatlas.netlify.app/tools/percent-difference/) | Math & numbers | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Difference = abs(a-b)`, `Percent difference = 200*abs(a-b)/(abs(a)+abs(b))` |
| 27 | `ratio-calculator` | [Ratio Calculator](https://axiomatlas.netlify.app/tools/ratio-calculator/) | Math & numbers | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `A/B = a/b`, `A share = 100*a/(a+b)`, `B share = 100*b/(a+b)` |
| 28 | `proportion-calculator` | [Proportion Calculator](https://axiomatlas.netlify.app/tools/proportion-calculator/) | Math & numbers | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `x = b*c/a` |
| 29 | `weighted-average` | [Weighted Average Calculator](https://axiomatlas.netlify.app/tools/weighted-average/) | Math & numbers | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Weighted average = (a*wa+b*wb+c*wc)/(wa+wb+wc)` |
| 30 | `nth-root` | [Nth Root Calculator](https://axiomatlas.netlify.app/tools/nth-root/) | Math & numbers | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Root = x^(1/n)` |
| 31 | `power-calculator` | [Power & Exponent Calculator](https://axiomatlas.netlify.app/tools/power-calculator/) | Math & numbers | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Result = a^b` |
| 32 | `logarithm-calculator` | [Logarithm Calculator](https://axiomatlas.netlify.app/tools/logarithm-calculator/) | Math & numbers | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Logarithm = log(x)/log(b)` |
| 33 | `factorial-calculator` | [Factorial Calculator](https://axiomatlas.netlify.app/tools/factorial-calculator/) | Math & numbers | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Factorial = fact(n)` |
| 34 | `permutation-calculator` | [Permutation Calculator](https://axiomatlas.netlify.app/tools/permutation-calculator/) | Math & numbers | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Permutations = perm(n,r)` |
| 35 | `combination-calculator` | [Combination Calculator](https://axiomatlas.netlify.app/tools/combination-calculator/) | Math & numbers | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Combinations = comb(n,r)` |
| 36 | `gcd-calculator` | [GCD Calculator](https://axiomatlas.netlify.app/tools/gcd-calculator/) | Math & numbers | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `GCD = gcd(a,b)` |
| 37 | `lcm-calculator` | [LCM Calculator](https://axiomatlas.netlify.app/tools/lcm-calculator/) | Math & numbers | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `LCM = abs(a*b)/gcd(a,b)` |
| 38 | `modulo-calculator` | [Modulo Calculator](https://axiomatlas.netlify.app/tools/modulo-calculator/) | Math & numbers | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Remainder = mod(a,b)`, `Quotient = floor(a/b)` |
| 39 | `arithmetic-mean` | [Arithmetic Mean Calculator](https://axiomatlas.netlify.app/tools/arithmetic-mean/) | Math & numbers | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Mean = (a+b+c+d)/4`, `Sum = a+b+c+d` |
| 40 | `geometric-mean` | [Geometric Mean Calculator](https://axiomatlas.netlify.app/tools/geometric-mean/) | Math & numbers | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Geometric mean = (a*b*c)^(1/3)` |
| 41 | `linear-equation` | [Linear Equation Calculator](https://axiomatlas.netlify.app/tools/linear-equation/) | Algebra | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `x = (c-b)/a` |
| 42 | `polynomial-evaluation` | [Polynomial Value Calculator](https://axiomatlas.netlify.app/tools/polynomial-evaluation/) | Algebra | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `P(x) = a*x^3+b*x^2+c*x+d` |
| 43 | `arithmetic-sequence` | [Arithmetic Sequence Calculator](https://axiomatlas.netlify.app/tools/arithmetic-sequence/) | Algebra | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `nth term = a+(n-1)*d`, `Sum = n*(2*a+(n-1)*d)/2` |
| 44 | `geometric-sequence` | [Geometric Sequence Calculator](https://axiomatlas.netlify.app/tools/geometric-sequence/) | Algebra | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `nth term = a*r^(n-1)`, `Sum = a*(1-r^n)/(1-r)` |
| 45 | `slope-calculator` | [Slope Calculator](https://axiomatlas.netlify.app/tools/slope-calculator/) | Algebra | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Slope = (y2-y1)/(x2-x1)`, `Rise = y2-y1`, `Run = x2-x1` |
| 46 | `midpoint-calculator` | [Midpoint Calculator](https://axiomatlas.netlify.app/tools/midpoint-calculator/) | Algebra | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Midpoint x = (x1+x2)/2`, `Midpoint y = (y1+y2)/2` |
| 47 | `distance-between-points` | [2D Distance Calculator](https://axiomatlas.netlify.app/tools/distance-between-points/) | Algebra | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Distance = sqrt((x2-x1)^2+(y2-y1)^2)` |
| 48 | `exponential-growth` | [Exponential Growth Calculator](https://axiomatlas.netlify.app/tools/exponential-growth/) | Algebra | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Final value = p*e^(r*t/100)`, `Change = p*(e^(r*t/100)-1)` |
| 49 | `rectangle-calculator` | [Rectangle Calculator](https://axiomatlas.netlify.app/tools/rectangle-calculator/) | Geometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Area = l*w`, `Perimeter = 2*(l+w)`, `Diagonal = sqrt(l^2+w^2)` |
| 50 | `square-calculator` | [Square Calculator](https://axiomatlas.netlify.app/tools/square-calculator/) | Geometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Area = s^2`, `Perimeter = 4*s`, `Diagonal = s*sqrt(2)` |
| 51 | `triangle-calculator` | [Triangle Area Calculator](https://axiomatlas.netlify.app/tools/triangle-calculator/) | Geometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Area = b*h/2` |
| 52 | `herons-formula` | [Heron’s Formula Calculator](https://axiomatlas.netlify.app/tools/herons-formula/) | Geometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Semiperimeter = (a+b+c)/2`, `Area = sqrt(((a+b+c)/2)*((a+b+c)/2-a)*((a+b+c)/2-b)*((a+b+c)/2-c))` |
| 53 | `circle-calculator` | [Circle Calculator](https://axiomatlas.netlify.app/tools/circle-calculator/) | Geometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Area = pi*r^2`, `Circumference = 2*pi*r`, `Diameter = 2*r` |
| 54 | `ellipse-calculator` | [Ellipse Calculator](https://axiomatlas.netlify.app/tools/ellipse-calculator/) | Geometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Area = pi*a*b`, `Perimeter estimate = pi*(3*(a+b)-sqrt((3*a+b)*(a+3*b)))` |
| 55 | `trapezoid-calculator` | [Trapezoid Area Calculator](https://axiomatlas.netlify.app/tools/trapezoid-calculator/) | Geometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Area = (a+b)*h/2` |
| 56 | `parallelogram-calculator` | [Parallelogram Area Calculator](https://axiomatlas.netlify.app/tools/parallelogram-calculator/) | Geometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Area = b*h`, `Perimeter = 2*(b+s)` |
| 57 | `sector-calculator` | [Circle Sector Calculator](https://axiomatlas.netlify.app/tools/sector-calculator/) | Geometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Sector area = pi*r^2*angle/360`, `Arc length = 2*pi*r*angle/360` |
| 58 | `pythagorean-calculator` | [Pythagorean Theorem Calculator](https://axiomatlas.netlify.app/tools/pythagorean-calculator/) | Geometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Hypotenuse = sqrt(a^2+b^2)` |
| 59 | `cube-calculator` | [Cube Calculator](https://axiomatlas.netlify.app/tools/cube-calculator/) | Geometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Volume = a^3`, `Surface area = 6*a^2`, `Space diagonal = a*sqrt(3)` |
| 60 | `cuboid-calculator` | [Rectangular Prism Calculator](https://axiomatlas.netlify.app/tools/cuboid-calculator/) | Geometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Volume = l*w*h`, `Surface area = 2*(l*w+l*h+w*h)`, `Diagonal = sqrt(l^2+w^2+h^2)` |
| 61 | `sphere-calculator` | [Sphere Calculator](https://axiomatlas.netlify.app/tools/sphere-calculator/) | Geometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Volume = 4*pi*r^3/3`, `Surface area = 4*pi*r^2` |
| 62 | `cylinder-calculator` | [Cylinder Calculator](https://axiomatlas.netlify.app/tools/cylinder-calculator/) | Geometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Volume = pi*r^2*h`, `Surface area = 2*pi*r*(r+h)` |
| 63 | `cone-calculator` | [Cone Calculator](https://axiomatlas.netlify.app/tools/cone-calculator/) | Geometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Volume = pi*r^2*h/3`, `Slant height = sqrt(r^2+h^2)`, `Surface area = pi*r*(r+sqrt(r^2+h^2))` |
| 64 | `pyramid-calculator` | [Square Pyramid Calculator](https://axiomatlas.netlify.app/tools/pyramid-calculator/) | Geometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Volume = s^2*h/3`, `Surface area = s^2+2*s*sqrt(h^2+s^2/4)` |
| 65 | `torus-calculator` | [Torus Calculator](https://axiomatlas.netlify.app/tools/torus-calculator/) | Geometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Volume = 2*pi^2*R*r^2`, `Surface area = 4*pi^2*R*r` |
| 66 | `regular-polygon` | [Regular Polygon Calculator](https://axiomatlas.netlify.app/tools/regular-polygon/) | Geometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Perimeter = n*s`, `Area = n*s^2/(4*tan(pi/n))` |
| 67 | `degree-radian` | [Degree to Radian Converter](https://axiomatlas.netlify.app/tools/degree-radian/) | Trigonometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Radians = d*pi/180`, `Turns = d/360` |
| 68 | `arc-length` | [Arc Length Calculator](https://axiomatlas.netlify.app/tools/arc-length/) | Trigonometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Arc length = r*pi*deg/180` |
| 69 | `law-of-cosines` | [Law of Cosines Calculator](https://axiomatlas.netlify.app/tools/law-of-cosines/) | Trigonometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Opposite side c = sqrt(a^2+b^2-2*a*b*cos(C*pi/180))` |
| 70 | `law-of-sines` | [Law of Sines Calculator](https://axiomatlas.netlify.app/tools/law-of-sines/) | Trigonometry | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Side b = a*sin(B*pi/180)/sin(A*pi/180)` |
| 71 | `speed-calculator` | [Speed Calculator](https://axiomatlas.netlify.app/tools/speed-calculator/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Speed = d/t`, `Speed km/h = 3.6*d/t` |
| 72 | `distance-calculator` | [Distance Calculator](https://axiomatlas.netlify.app/tools/distance-calculator/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Distance = v*t` |
| 73 | `acceleration-calculator` | [Acceleration Calculator](https://axiomatlas.netlify.app/tools/acceleration-calculator/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Acceleration = (v-u)/t` |
| 74 | `displacement-calculator` | [Displacement Calculator](https://axiomatlas.netlify.app/tools/displacement-calculator/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Displacement = u*t+a*t^2/2`, `Final speed = u+a*t` |
| 75 | `force-calculator` | [Force Calculator](https://axiomatlas.netlify.app/tools/force-calculator/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Force = m*a` |
| 76 | `work-calculator` | [Work Calculator](https://axiomatlas.netlify.app/tools/work-calculator/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Work = F*d*cos(deg*pi/180)` |
| 77 | `kinetic-energy` | [Kinetic Energy Calculator](https://axiomatlas.netlify.app/tools/kinetic-energy/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Kinetic energy = m*v^2/2` |
| 78 | `potential-energy` | [Gravitational Potential Energy](https://axiomatlas.netlify.app/tools/potential-energy/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Potential energy = m*g*h` |
| 79 | `momentum-calculator` | [Momentum Calculator](https://axiomatlas.netlify.app/tools/momentum-calculator/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Momentum = m*v` |
| 80 | `density-calculator` | [Density Calculator](https://axiomatlas.netlify.app/tools/density-calculator/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Density = m/V` |
| 81 | `pressure-calculator` | [Pressure Calculator](https://axiomatlas.netlify.app/tools/pressure-calculator/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Pressure = F/A` |
| 82 | `mechanical-power` | [Power Calculator](https://axiomatlas.netlify.app/tools/mechanical-power/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Power = W/t` |
| 83 | `ohms-law` | [Ohm’s Law Calculator](https://axiomatlas.netlify.app/tools/ohms-law/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Current = V/R`, `Power = V^2/R` |
| 84 | `electrical-power` | [Electrical Power Calculator](https://axiomatlas.netlify.app/tools/electrical-power/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Power = V*I`, `Energy = V*I*t/1000` |
| 85 | `wave-speed` | [Wave Speed Calculator](https://axiomatlas.netlify.app/tools/wave-speed/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Wave speed = f*l` |
| 86 | `frequency-period` | [Frequency & Period Calculator](https://axiomatlas.netlify.app/tools/frequency-period/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Period = 1/f`, `Angular frequency = 2*pi*f` |
| 87 | `pendulum-period` | [Simple Pendulum Calculator](https://axiomatlas.netlify.app/tools/pendulum-period/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Period = 2*pi*sqrt(L/g)`, `Frequency = 1/(2*pi*sqrt(L/g))` |
| 88 | `projectile-range` | [Projectile Motion Calculator](https://axiomatlas.netlify.app/tools/projectile-range/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Range = v^2*sin(2*angle*pi/180)/g`, `Flight time = 2*v*sin(angle*pi/180)/g`, `Maximum height = v^2*sin(angle*pi/180)^2/(2*g)` |
| 89 | `gravitational-force` | [Universal Gravitation Calculator](https://axiomatlas.netlify.app/tools/gravitational-force/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Force = 6.6743e-11*m1*m2/r^2` |
| 90 | `heat-energy` | [Heat Energy Calculator](https://axiomatlas.netlify.app/tools/heat-energy/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Heat energy = m*c*dT` |
| 91 | `ideal-gas` | [Ideal Gas Law Calculator](https://axiomatlas.netlify.app/tools/ideal-gas/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Pressure = n*8.314462618*T/V` |
| 92 | `buoyant-force` | [Buoyant Force Calculator](https://axiomatlas.netlify.app/tools/buoyant-force/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Buoyant force = rho*V*g` |
| 93 | `torque-calculator` | [Torque Calculator](https://axiomatlas.netlify.app/tools/torque-calculator/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Torque = r*F*sin(angle*pi/180)` |
| 94 | `spring-force` | [Hooke’s Law Calculator](https://axiomatlas.netlify.app/tools/spring-force/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Force magnitude = k*abs(x)`, `Stored energy = k*x^2/2` |
| 95 | `centripetal-force` | [Centripetal Force Calculator](https://axiomatlas.netlify.app/tools/centripetal-force/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Force = m*v^2/r`, `Acceleration = v^2/r` |
| 96 | `snells-law` | [Snell’s Law Calculator](https://axiomatlas.netlify.app/tools/snells-law/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Refracted angle = asin(n1*sin(ang*pi/180)/n2)*180/pi` |
| 97 | `thin-lens` | [Thin Lens Equation Calculator](https://axiomatlas.netlify.app/tools/thin-lens/) | Physics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Image distance = 1/(1/f-1/o)`, `Magnification = -1/(o*(1/f-1/o))` |
| 98 | `z-score` | [Z-Score Calculator](https://axiomatlas.netlify.app/tools/z-score/) | Statistics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Z-score = (x-mean)/sd` |
| 99 | `standard-error` | [Standard Error Calculator](https://axiomatlas.netlify.app/tools/standard-error/) | Statistics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Standard error = sd/sqrt(n)` |
| 100 | `confidence-interval` | [95% Confidence Interval Calculator](https://axiomatlas.netlify.app/tools/confidence-interval/) | Statistics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Lower bound = mean-1.96*sd/sqrt(n)`, `Upper bound = mean+1.96*sd/sqrt(n)`, `Margin = 1.96*sd/sqrt(n)` |
| 101 | `probability-calculator-basic` | [Basic Probability Calculator](https://axiomatlas.netlify.app/tools/probability-calculator-basic/) | Statistics | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Complement = 1-p`, `Odds for = p/(1-p)` |
| 102 | `simple-interest` | [Simple Interest Calculator](https://axiomatlas.netlify.app/tools/simple-interest/) | Finance | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Interest = p*r*t/100`, `Final balance = p*(1+r*t/100)` |
| 103 | `compound-interest` | [Compound Interest Calculator](https://axiomatlas.netlify.app/tools/compound-interest/) | Finance | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Final balance = p*(1+r/(100*n))^(n*t)`, `Interest = p*((1+r/(100*n))^(n*t)-1)` |
| 104 | `emi-calculator` | [Loan EMI Calculator](https://axiomatlas.netlify.app/tools/emi-calculator/) | Finance | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Monthly EMI = p*(r/1200)*(1+r/1200)^(years*12)/((1+r/1200)^(years*12)-1)`, `Total paid = years*12*p*(r/1200)*(1+r/1200)^(years*12)/((1+r/1200)^(years*12)-1)`, `Total interest = years*12*p*(r/1200)*(1+r/1200)^(years*12)/((1+r/1200)^(years*12)-1)-p` |
| 105 | `sip-calculator` | [SIP Investment Calculator](https://axiomatlas.netlify.app/tools/sip-calculator/) | Finance | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Future value = p*((1+r/1200)^(12*t)-1)/(r/1200)*(1+r/1200)`, `Contributions = p*12*t`, `Estimated growth = p*((1+r/1200)^(12*t)-1)/(r/1200)*(1+r/1200)-p*12*t` |
| 106 | `roi-calculator` | [ROI Calculator](https://axiomatlas.netlify.app/tools/roi-calculator/) | Finance | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Net gain = value-cost`, `ROI = 100*(value-cost)/cost` |
| 107 | `cagr-calculator` | [CAGR Calculator](https://axiomatlas.netlify.app/tools/cagr-calculator/) | Finance | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `CAGR = 100*((final/initial)^(1/years)-1)` |
| 108 | `discount-calculator` | [Discount Calculator](https://axiomatlas.netlify.app/tools/discount-calculator/) | Finance | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `You save = price*off/100`, `Final price = price*(1-off/100)` |
| 109 | `tax-calculator` | [GST / Sales Tax Calculator](https://axiomatlas.netlify.app/tools/tax-calculator/) | Finance | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Tax = price*rate/100`, `Total with tax = price*(1+rate/100)` |
| 110 | `profit-margin` | [Profit Margin Calculator](https://axiomatlas.netlify.app/tools/profit-margin/) | Finance | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Gross profit = sell-cost`, `Margin = 100*(sell-cost)/sell`, `Markup = 100*(sell-cost)/cost` |
| 111 | `break-even` | [Break-Even Calculator](https://axiomatlas.netlify.app/tools/break-even/) | Finance | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Break-even units = ceil(fixed/(price-variable))`, `Contribution margin = price-variable` |
| 112 | `inflation-calculator` | [Inflation Calculator](https://axiomatlas.netlify.app/tools/inflation-calculator/) | Finance | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Future equivalent = price*(1+infl/100)^years`, `Purchasing power = price/(1+infl/100)^years` |
| 113 | `present-value` | [Present Value Calculator](https://axiomatlas.netlify.app/tools/present-value/) | Finance | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Present value = future/(1+r/100)^years` |
| 114 | `future-value-annuity` | [Future Value of Annuity](https://axiomatlas.netlify.app/tools/future-value-annuity/) | Finance | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Future value = p*((1+r/100)^n-1)/(r/100)` |
| 115 | `rule-of-72` | [Rule of 72 Calculator](https://axiomatlas.netlify.app/tools/rule-of-72/) | Finance | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Estimated years to double = 72/r` |
| 116 | `tip-calculator` | [Tip & Bill Split Calculator](https://axiomatlas.netlify.app/tools/tip-calculator/) | Finance | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Total tip = bill*tip/100`, `Total bill = bill*(1+tip/100)`, `Per person = bill*(1+tip/100)/people` |
| 117 | `attendance-calculator` | [Attendance Calculator](https://axiomatlas.netlify.app/tools/attendance-calculator/) | Education | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Current attendance = 100*att/total`, `Additional classes needed = ceil(max(0,(target*total-100*att)/(100-target)))` |
| 118 | `cgpa-percentage` | [CGPA to Percentage Calculator](https://axiomatlas.netlify.app/tools/cgpa-percentage/) | Education | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Estimated percentage = cgpa*factor` |
| 119 | `grade-percentage` | [Marks Percentage Calculator](https://axiomatlas.netlify.app/tools/grade-percentage/) | Education | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Percentage = 100*obtained/maxmarks` |
| 120 | `target-grade` | [Target Exam Score Calculator](https://axiomatlas.netlify.app/tools/target-grade/) | Education | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Required remaining score = (100*target-current*weight)/(100-weight)` |
| 121 | `study-time-calculator` | [Study Time Calculator](https://axiomatlas.netlify.app/tools/study-time-calculator/) | Education | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Hours total = minutes*days*weeks/60`, `Sessions = days*weeks` |
| 122 | `download-time` | [Download Time Calculator](https://axiomatlas.netlify.app/tools/download-time/) | Computing | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Estimated seconds = size*8/speed`, `Estimated minutes = size*8/(speed*60)` |
| 123 | `data-size-calculator` | [Data Storage Calculator](https://axiomatlas.netlify.app/tools/data-size-calculator/) | Computing | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Megabytes = gb*1000`, `Kilobytes = gb*1000000`, `Bytes = gb*1000000000` |
| 124 | `pixel-density` | [PPI Calculator](https://axiomatlas.netlify.app/tools/pixel-density/) | Computing | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `PPI = sqrt(w^2+h^2)/d` |
| 125 | `aspect-ratio` | [Aspect Ratio Calculator](https://axiomatlas.netlify.app/tools/aspect-ratio/) | Computing | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Aspect (w/h) = w/h`, `New height = neww*h/w` |
| 126 | `electricity-cost` | [Electricity Cost Calculator](https://axiomatlas.netlify.app/tools/electricity-cost/) | Computing | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Energy consumed = W*hours*days/1000`, `Estimated cost = W*hours*days/1000*rate` |
| 127 | `resistor-series` | [Series Resistors Calculator](https://axiomatlas.netlify.app/tools/resistor-series/) | Computing | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Equivalent resistance = a+b+c` |
| 128 | `resistor-parallel` | [Parallel Resistors Calculator](https://axiomatlas.netlify.app/tools/resistor-parallel/) | Computing | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Equivalent resistance = 1/(1/a+1/b+1/c)` |
| 129 | `frequency-wavelength` | [Frequency to Wavelength](https://axiomatlas.netlify.app/tools/frequency-wavelength/) | Computing | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Wavelength = 299792458/f` |
| 130 | `compression-ratio` | [Compression Ratio Calculator](https://axiomatlas.netlify.app/tools/compression-ratio/) | Computing | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Ratio = original/compressed`, `Size reduction = 100*(1-compressed/original)` |
| 131 | `fuel-cost` | [Fuel Cost Calculator](https://axiomatlas.netlify.app/tools/fuel-cost/) | Everyday | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Fuel required = km/kmpl`, `Total cost = km/kmpl*price` |
| 132 | `bmi-calculator` | [BMI Calculator](https://axiomatlas.netlify.app/tools/bmi-calculator/) | Everyday | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `BMI = kg/(cm/100)^2` |
| 133 | `recipe-scaler` | [Recipe Scaling Calculator](https://axiomatlas.netlify.app/tools/recipe-scaler/) | Everyday | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Required quantity = q*new/old` |
| 134 | `pace-calculator` | [Running Pace Calculator](https://axiomatlas.netlify.app/tools/pace-calculator/) | Everyday | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Pace = minutes/distance`, `Speed = distance/(minutes/60)` |
| 135 | `paint-coverage` | [Paint Coverage Calculator](https://axiomatlas.netlify.app/tools/paint-coverage/) | Everyday | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Paint required = area*coats/coverage` |
| 136 | `tile-calculator` | [Tile Quantity Calculator](https://axiomatlas.netlify.app/tools/tile-calculator/) | Everyday | `formula` | **Ready with existing logic** | Automatically traced via `traceCalculate()` on AST expression(s): `Tiles required = ceil(floor/(tilew*tileh)*(1+waste/100))` |
