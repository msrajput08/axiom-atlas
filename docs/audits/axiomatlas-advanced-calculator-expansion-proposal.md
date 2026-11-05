# AxiomAtlas Complex & Practical Calculator Expansion Proposal (Gate C)

**Repository:** `msrajput08/axiom-atlas` (Branch: `audit/optimization-and-upgrade-proposals`)
**Live Website:** [AxiomAtlas](https://axiomatlas.netlify.app/)
**Source Files Inspected:** `source/make_catalog.py`, `site/assets/engine.js`, `site/assets/app.js`, and `docs/audits/axiomatlas-advanced-calculator-roadmap.md`.
**Status:** Proposal Only — Zero new calculators have been added during this analysis phase.

## 1. Task 3A — Research & Opportunity Identification Across All STEM Categories

Inspection of `source/make_catalog.py` shows that **113 of the 136 existing calculators (`83.1%`)** are single-step algebraic formulas (`type: "formula"`), while only **23 (`16.9%`)** are specialized multi-step solvers. To transform AxiomAtlas into a premier STEM calculation studio without bloating the catalog with trivial 1-line formulas, we identified **16 high-leverage multi-step calculators and workflow extensions** across all core categories:

| Category | Existing Capability Ceiling | High-Value Multi-Step Opportunity Identified | Standalone vs. Integrated Workflow Decision |
| :--- | :--- | :--- | :--- |
| **Mathematics (`Math & numbers`)** | Real-only expression evaluation (`scientific-calculator`), trial-division primality boolean (`prime-checker`), basic modulo. | 1) **Complex Number Calculator** ($a+bi \leftrightarrow rngle	heta \leftrightarrow re^{i	heta}$); 2) **Error & Uncertainty Propagation Calculator** ($f(x,y,z) \pm \Delta f$); 3) **Modular Arithmetic, Congruence & CRT Solver**. | **3 Standalone Calculators** (`complex-number-calculator`, `error-propagation-calculator`, `modular-congruence-solver`) + **1 In-Place Upgrade** (`prime-checker` factor tree). |
| **Algebra** | Degree-2 exact quadratic (`quadratic-equation`), cubic point evaluation (`polynomial-evaluation`), 1D interval scan (`equation-solver`). | 1) **Polynomial Roots, Factoring & Division Solver** (all real/complex roots up to degree 10 + synthetic division); 2) **Partial Fraction Decomposition Calculator** ($P(x)/Q(x)$). | **2 Standalone Calculators** (`polynomial-solver`, `partial-fractions-calculator`). |
| **Graphing & Calculus** | Single-point 1st derivative (`derivative-calculator`), 1D Simpson integral (`integral-calculator`), 1D limit (`limit-calculator`). | 1) **ODE Initial-Value Solver (RK4 / Euler / Heun + 2D Slope Field)**; 2) **Taylor Series & Multivariable Gradient / Hessian Analyzer**. | **2 Standalone Calculators** (`ode-solver`, `taylor-series-gradient-calculator`). |
| **Geometry & Trigonometry** | 5 separate single-formula triangle tools (`triangle-calculator`, `herons-formula`, `pythagorean-calculator`, `law-of-cosines`, `law-of-sines`). | **Complete Triangle Solver (SSS, SAS, ASA, AAS, SSA Ambiguous Case)** computing all 3 sides, all 3 angles, area, altitudes, inradius, circumradius, and 2D scaled diagram from any 3 inputs. | **1 Flagship Standalone Calculator** (`triangle-solver`) cross-linked across both `Trigonometry` and `Geometry`. |
| **Physics** | 27 single-output formula cards (`v=d/t`, `s=ut+½at²`, flat-ground `projectile-range`, DC `ohms-law`). | 1) **Complete SUVAT 1D & Elevated 2D Projectile Kinematics Solver** (solves any 3 of $s, u, v, a, t$ + projectile with initial height $h_0$); 2) **AC RLC Circuit Impedance, Phasor & Resonance Calculator**. | **2 Standalone Calculators** (`suvat-kinematics-solver`, `rlc-circuit-calculator`). |
| **Linear Algebra** | 2×2 and 3×3 basic matrix arithmetic (`matrix-calculator`) and 3D vectors (`vector-calculator`). | **Matrix Eigenvalue, Eigenvector, Rank, RREF & LU Decomposition Calculator**. | **1 Standalone Calculator** (`eigenvalue-decomposition-calculator`) + **In-Place Upgrade** of `matrix-calculator`. |
| **Statistics** | Descriptive stats (`statistics-calculator`), OLS regression (`correlation-calculator`), Binomial PMF (`probability-calculator`), Z-score (`z-score`). | **Probability Distributions & Hypothesis Testing Calculator** (Normal $Z$, Student's $t$, $\chi^2$, $F$ exact p-values, critical values, and 1-sample / 2-sample $t$-tests). | **1 Flagship Standalone Calculator** (`hypothesis-test-calculator`) + **In-Place Upgrade** of `confidence-interval` and `probability-calculator`. |
| **Finance** | Single-period PV/FV/CAGR/ROI and basic 3-output `emi-calculator`. | 1) **NPV, IRR & XIRR Multi-Period Cash-Flow Calculator**; 2) **Loan Amortization & Prepayment Schedule Calculator**. | **2 Standalone Calculators** (`npv-irr-calculator`, `loan-amortization-prepayment-calculator`, also linked as a tab from `emi-calculator`). |
| **Computing & Converters** | Integer radix conversion (`number-base-converter`), color picker (`color-converter`), 16-group `unit-converter`. | 1) **Bitwise Operations, Two's Complement & IEEE-754 Float Inspector**; 2) **IPv4 / CIDR Subnet Calculator**; 3) **Engineering Unit Groups** in `unit-converter`. | **2 Standalone Calculators** in `Computing` (`bitwise-ieee754-calculator`, `subnet-calculator`) + **In-Place Expansion** of `unit-converter`. |

## 2. Task 3B — Complete 15-Point Evaluation for Every Proposed Calculator

Every proposed calculator is evaluated below across all 15 required dimensions:
### 2.1 ADV-01: Complex Number Calculator (`/tools/complex-number-calculator/`)
1. **Calculator Name:** Complex Number Calculator (`complex-number-calculator`)
2. **Category:** Math & numbers
3. **Problem It Solves:** Students and electrical/control engineers need to add, subtract, multiply, divide, exponentiate, and convert complex numbers between rectangular (a + bi), polar (r∠θ), and exponential (r·e^(iθ)) forms, which standard real-valued calculators cannot handle.
4. **Target Users:** High school & university STEM students, electrical engineers (AC phasor analysis), signal processing practitioners.
5. **Mathematical or Computational Method:** Multiplication: (a₁a₂ − b₁b₂) + (a₁b₂ + a₂b₁)i; Division: [(a₁a₂ + b₁b₂) + (b₁a₂ − a₁b₂)i]/(a₂² + b₂²); Modulus: r = hypot(a, b); Argument: θ = atan2(b, a); De Moivre's theorem: zⁿ = rⁿ(cos(nθ) + i sin(nθ)).
6. **Required Inputs:** z₁ = a₁ + b₁i (or r₁∠θ₁), z₂ = a₂ + b₂i (or r₂∠θ₂), Operation (+, −, ×, ÷, z₁ⁿ, √z₁, Conjugate, Polar↔Rectangular), Angle unit (° or rad).
7. **Expected Outputs:** Result in Rectangular form (a + bi), Polar form (r ∠ θ), Exponential form (r·e^(iθ)), Modulus |z|, Argument arg(z), Complex conjugate z̄, and 2D Argand plane vector diagram.
8. **Important Edge Cases:** Division by zero complex number `0 + 0i`; branch cut of `atan2(0, -x) = π` on negative real axis; `0^0` or `0^(-n)`; polar angle normalization to `(-180°, 180°]` or `[0°, 360°)`. 
9. **Example Calculation:** Input: z₁ = 3 + 4i, z₂ = 1 − 2i, Operation = ÷ → Output: −1 + 2i, |z| = √5 ≈ 2.236068, θ = 116.565° (2.0344 rad).
10. **Why It Is Better Than a Basic Single-Formula Calculator:** Eliminates manual rationalizing of complex denominators and quadrant-error-prone atan2 conversions between rectangular and polar phasor forms.
11. **Implementation Complexity:** Low–Medium
12. **Dependencies or Libraries Required:** Zero external dependencies (native Math.hypot, Math.atan2, HTML5 2D Canvas for Argand plot).
13. **Testing & Numerical Accuracy Requirements:** Verify division by zero (0 + 0i), pure imaginary numbers (0 + bi), negative real branch cut arg(-1 + 0i) = π, and De Moivre powers.
14. **Priority:** **P0**
15. **Standalone vs. Integrated Decision:** Standalone calculator (`/tools/complex-number-calculator/`) in `Math & numbers`, cross-linked from `quadratic-equation` and `rlc-circuit-calculator`.

### 2.2 ADV-02: Error Propagation & Uncertainty Calculator (`/tools/error-propagation-calculator/`)
1. **Calculator Name:** Error Propagation & Uncertainty Calculator (`error-propagation-calculator`)
2. **Category:** Math & numbers
3. **Problem It Solves:** Laboratory science and engineering students must propagate measurement uncertainties (x ± Δx, y ± Δy, z ± Δz) through addition, multiplication, powers, or general formulas f(x, y, z), which requires tedious partial derivative sums.
4. **Target Users:** Physics, chemistry, and engineering lab students and experimental researchers.
5. **Mathematical or Computational Method:** Gaussian variance propagation: Δf = √((∂f/∂x · Δx)² + (∂f/∂y · Δy)² + (∂f/∂z · Δz)² + 2(∂f/∂x)(∂f/∂y)cov(x,y)), using central finite differences on `compile(expr)`.
6. **Required Inputs:** Expression f(x, y, z) (or preset operation: x±y, x·y, x/y, x^n), Measured values (x, y, z), Uncertainties (Δx, Δy, Δz), Correlation ρ_xy (default 0).
7. **Expected Outputs:** Nominal value f, Absolute uncertainty Δf, Relative uncertainty Δf/|f|, Percentage uncertainty (%), Correctly rounded scientific result (f ± Δf), and per-variable sensitivity contribution (% of total variance).
8. **Important Edge Cases:** Nominal value `f(x,y,z) = 0` (relative uncertainty `Δf/|f|` is undefined while absolute uncertainty `Δf` remains finite); non-differentiable point or zero denominator; negative uncertainties rejected (`Δx >= 0`).
9. **Example Calculation:** Input: f = x / y (Density ρ = m / V), x = 100 ± 1 g, y = 50 ± 1 cm³ → Output: f = 2.000 ± 0.045 g/cm³ (Relative uncertainty: 2.24%; V contributes 80% of variance, m contributes 20%).
10. **Why It Is Better Than a Basic Single-Formula Calculator:** Computes both absolute uncertainty (±Δf) and relative/percentage uncertainty (Δf/|f| %) using exact partial-derivative variance propagation.
11. **Implementation Complexity:** Medium
12. **Dependencies or Libraries Required:** Zero external dependencies (uses existing `compile()` and `run()` in `engine.js`).
13. **Testing & Numerical Accuracy Requirements:** Verify against analytical rules: Δ(x+y) = √(Δx²+Δy²), Δ(xy)/(xy) = √((Δx/x)²+(Δy/y)²), and Δ(x^n)/|x^n| = |n|Δx/|x|.
14. **Priority:** **P0**
15. **Standalone vs. Integrated Decision:** Standalone calculator (`/tools/error-propagation-calculator/`) in `Math & numbers`, cross-linked in `Physics` and `Statistics`.

### 2.3 ADV-03: Modular Arithmetic & Linear Congruence Solver (`/tools/modular-congruence-solver/`)
1. **Calculator Name:** Modular Arithmetic & Linear Congruence Solver (`modular-congruence-solver`)
2. **Category:** Math & numbers
3. **Problem It Solves:** Discrete math and cryptography students need modular exponentiation (a^b mod m), modular multiplicative inverse (a⁻¹ mod m), Extended Euclidean Bézout coefficients, and Chinese Remainder Theorem (CRT) solvers, whereas the existing `modulo-calculator` only does basic remainder.
4. **Target Users:** Computer science, discrete mathematics, cryptography, and competitive programming students.
5. **Mathematical or Computational Method:** Binary exponentiation (square-and-multiply) in BigInt; Extended Euclidean Algorithm for ax + my = g.
6. **Required Inputs:** Mode (a^b mod m / Modular Inverse a⁻¹ mod m / Linear Congruence ax ≡ b (mod m) / Chinese Remainder Theorem), BigInt integer inputs.
7. **Expected Outputs:** Exact modular result, Extended GCD Bézout identity (a·x + m·y = gcd(a, m)), existence condition (gcd(a, m) | b), and all incongruent solutions modulo m.
8. **Important Edge Cases:** Non-coprime `gcd(a, m) > 1` (modular inverse does not exist; linear congruence `ax ≡ b (mod m)` has `g = gcd(a,m)` solutions iff `g | b`, else 0 solutions); modulus `m <= 0`; non-pairwise-coprime moduli in CRT.
9. **Example Calculation:** Input: 17x ≡ 1 (mod 3120) → Output: x ≡ 2753 (mod 3120), Bézout check: 17(2753) − 15(3120) = 1.
10. **Why It Is Better Than a Basic Single-Formula Calculator:** Computes huge modular powers (e.g. RSA exponentiation) and modular inverses instantaneously using exact BigInt arithmetic without overflow.
11. **Implementation Complexity:** Low–Medium
12. **Dependencies or Libraries Required:** Zero external dependencies (native JS BigInt).
13. **Testing & Numerical Accuracy Requirements:** Test coprime and non-coprime moduli, negative bases, and 100-digit BigInt exponents.
14. **Priority:** **P1**
15. **Standalone vs. Integrated Decision:** Standalone calculator (`/tools/modular-congruence-solver/`) in `Math & numbers`, cross-linked from `modulo-calculator`, `gcd-calculator`, and `prime-checker`.

### 2.4 ADV-04: Polynomial Roots, Factoring & Division Calculator (`/tools/polynomial-solver/`)
1. **Calculator Name:** Polynomial Roots, Factoring & Division Calculator (`polynomial-solver`)
2. **Category:** Algebra
3. **Problem It Solves:** The existing `polynomial-evaluation` tool only evaluates a cubic at a single point x, while `equation-solver` misses complex roots and repeated roots. Students and engineers need all real and complex roots of degree-n polynomials, synthetic division, and rational root factorization.
4. **Target Users:** Algebra, precalculus, calculus, and control-systems engineering students.
5. **Mathematical or Computational Method:** Rational Root Theorem (±divisors of a_0 / divisors of a_n) + Horner deflation + Aberth-Ehrlich simultaneous complex root iteration.
6. **Required Inputs:** Polynomial coefficients (e.g. a_n ... a_0 or expression `x^3 - 6*x^2 + 11*x - 6`), optional divisor `(x - c)` or `Q(x)` for polynomial long division.
7. **Expected Outputs:** All Real and Complex Roots (with multiplicities), Factored form, Rational Root candidates (±p/q), Quotient P(x)/D(x) and Remainder R(x), Derivative P'(x), and local extrema.
8. **Important Edge Cases:** Leading coefficient `a_n = 0` (automatic degree reduction); multiple/repeated roots where derivative `P'(r) = 0`; purely complex conjugate roots (`x^4 + 1 = 0`); division by zero polynomial.
9. **Example Calculation:** Input: x³ − 6x² + 11x − 6 = 0 → Output: Roots x = 1, 2, 3; Factored form: (x − 1)(x − 2)(x − 3).
10. **Why It Is Better Than a Basic Single-Formula Calculator:** Finds exact rational roots via the Rational Root Theorem and all remaining real & complex roots of polynomials up to degree 10 via the Durand-Kerner / Aberth-Ehrlich method.
11. **Implementation Complexity:** Medium
12. **Dependencies or Libraries Required:** Zero external dependencies (~80 lines of pure JS complex Horner + Aberth-Ehrlich solver).
13. **Testing & Numerical Accuracy Requirements:** Verify Wilkinson-style roots, complex conjugate pairs (x⁴ + 1 = 0), and repeated roots ((x-2)³ = 0).
14. **Priority:** **P0**
15. **Standalone vs. Integrated Decision:** Standalone calculator (`/tools/polynomial-solver/`) in `Algebra`, replacing the need to use separate degree-specific tools and cross-linked from `quadratic-equation` and `polynomial-evaluation`.

### 2.5 ADV-05: Partial Fraction Decomposition Calculator (`/tools/partial-fractions-calculator/`)
1. **Calculator Name:** Partial Fraction Decomposition Calculator (`partial-fractions-calculator`)
2. **Category:** Algebra
3. **Problem It Solves:** Calculus (integration of rational functions) and Engineering (inverse Laplace transforms) students constantly need partial fraction expansion of P(x)/Q(x), which is error-prone by hand.
4. **Target Users:** Calculus II, Differential Equations, and Signals & Systems students.
5. **Mathematical or Computational Method:** Polynomial long division + Heaviside residue method + Vandermonde/equating-coefficients linear system solved via existing `gaussian()` in `engine.js`.
6. **Required Inputs:** Numerator polynomial coefficients P(x), Denominator factored roots or polynomial coefficients Q(x) (up to degree 4).
7. **Expected Outputs:** Polynomial quotient (if improper) + Partial fraction terms A/(x−r₁) + B/(x−r₁)² + (Cx+D)/(x²+px+q), plus the solved linear system for coefficients A, B, C, D.
8. **Important Edge Cases:** Improper rational function `deg(P) >= deg(Q)` (requires polynomial long division quotient first); repeated linear factors `(x - r)^k`; irreducible quadratic factors `x^2 + px + q` with `p^2 - 4q < 0`; common factor cancellation between `P(x)` and `Q(x)`.
9. **Example Calculation:** Input: (5x − 3) / ((x + 1)(x − 3)) → Output: 2/(x + 1) + 3/(x − 3).
10. **Why It Is Better Than a Basic Single-Formula Calculator:** Decomposes proper and improper rational functions into linear and irreducible quadratic partial fractions with full Heaviside cover-up and linear system steps.
11. **Implementation Complexity:** Medium
12. **Dependencies or Libraries Required:** Zero external dependencies.
13. **Testing & Numerical Accuracy Requirements:** Test distinct linear roots, repeated linear roots (x-1)², irreducible quadratic factors (x²+1), and improper fractions deg(P) >= deg(Q).
14. **Priority:** **P1**
15. **Standalone vs. Integrated Decision:** Standalone calculator (`/tools/partial-fractions-calculator/`) in `Algebra`, cross-linked from `integral-calculator`.

### 2.6 ADV-06: Ordinary Differential Equation (ODE) Initial-Value Solver (`/tools/ode-solver/`)
1. **Calculator Name:** Ordinary Differential Equation (ODE) Initial-Value Solver (`ode-solver`)
2. **Category:** Graphing & calculus
3. **Problem It Solves:** Science and engineering students studying dy/dx = f(x, y) (or 2nd-order y'' = f(x, y, y')) currently have no tool on AxiomAtlas to solve initial-value problems or compare Euler vs. Runge-Kutta trajectories.
4. **Target Users:** University calculus, differential equations, physics, and engineering students.
5. **Mathematical or Computational Method:** Classical 4th-order Runge-Kutta (RK4): k₁ = f(x_n, y_n), k₂ = f(x_n + h/2, y_n + hk₁/2), k₃ = f(x_n + h/2, y_n + hk₂/2), k₄ = f(x_n + h, y_n + hk₃), y_{n+1} = y_n + (h/6)(k₁ + 2k₂ + 2k₃ + k₄).
6. **Required Inputs:** Differential equation dy/dx = f(x, y) (default `x - y`), Initial condition x₀ (0), y₀ (1), Target x_end (2), Step count N (20), Method (RK4 [default], Euler, Heun/Midpoint).
7. **Expected Outputs:** y(x_end), Interactive canvas showing slope field + solution trajectory y(x), and downloadable step table (x_k, y_k, k₁, k₂, k₃, k₄).
8. **Important Edge Cases:** Finite-time blow-up / singularity (e.g. `dy/dx = y^2` near `x = 1/y_0`); stiff equations requiring smaller step size `h`; `x_end < x_0` (backward integration with `h < 0`).
9. **Example Calculation:** Input: dy/dx = y, y(0) = 1, x_end = 1, h = 0.1 → Output: y(1) ≈ 2.7182818 (exact e¹ = 2.718281828).
10. **Why It Is Better Than a Basic Single-Formula Calculator:** Computes high-accuracy RK45 numerical solutions, plots the solution curve y(x) alongside a 2D slope/direction field, and outputs a step-by-step table.
11. **Implementation Complexity:** Medium
12. **Dependencies or Libraries Required:** Zero external dependencies (uses `compile()`/`run()` with `{x, y}` variables and HTML5 2D Canvas).
13. **Testing & Numerical Accuracy Requirements:** Benchmark against known analytical ODEs: dy/dx = y (y = e^x), dy/dx = -2xy (y = e^(-x²)), and stiff/blowup warning checks.
14. **Priority:** **P0**
15. **Standalone vs. Integrated Decision:** Standalone calculator (`/tools/ode-solver/`) in `Graphing & calculus`, reusing `compile()`/`run()` and the Canvas plotter architecture from `graphing-calculator`.

### 2.7 ADV-07: Taylor Series & Multivariable Gradient Calculator (`/tools/taylor-series-gradient-calculator/`)
1. **Calculator Name:** Taylor Series & Multivariable Gradient Calculator (`taylor-series-gradient-calculator`)
2. **Category:** Graphing & calculus
3. **Problem It Solves:** Calculus II/III students need numerical Taylor polynomial approximations P_n(x) around x = a (with remainder error) and multivariable gradient ∇f(x, y) / Hessian matrices.
4. **Target Users:** Calculus II, Multivariable Calculus, and numerical analysis students.
5. **Mathematical or Computational Method:** Higher-order finite differences with optimal step scaling h = ε^(1/(k+2)); Second Derivative Test D = f_xx f_yy − (f_xy)².
6. **Required Inputs:** Mode (Taylor Polynomial P_n(x) / Multivariable Gradient & Hessian f(x,y)), Function expression, Expansion/evaluation point (x₀, y₀), Evaluation target x.
7. **Expected Outputs:** Derivatives f'(a)..f⁽⁴⁾(a), Taylor polynomial coefficients, Approximated value vs. true f(x), Truncation error, or Gradient vector ∇f, Directional derivative, Hessian determinant D = f_xx f_yy − f_xy², and critical point classification.
8. **Important Edge Cases:** Function or higher derivatives undefined at expansion point `x_0` (e.g. `ln(x)` at `x_0 = 0`); degenerate critical point where Hessian determinant `D = f_xx * f_yy - f_xy^2 = 0` (Second Derivative Test is inconclusive).
9. **Example Calculation:** Input: f(x, y) = x² − y² at (0, 0) → Output: ∇f = (0, 0), Hessian det = −4 < 0 (Saddle point).
10. **Why It Is Better Than a Basic Single-Formula Calculator:** Computes up to 4th-order Taylor approximation and multivariable partial derivatives ∂f/∂x, ∂f/∂y, ∂²f/∂x², ∂²f/∂y², ∂²f/∂x∂y with 2D local extremum/saddle-point classification.
11. **Implementation Complexity:** Medium
12. **Dependencies or Libraries Required:** Zero external dependencies.
13. **Testing & Numerical Accuracy Requirements:** Verify ∂f/∂x, ∂f/∂y, and Hessian on polynomials, sin(x)cos(y), and exp(x²+y²).
14. **Priority:** **P1**
15. **Standalone vs. Integrated Decision:** Standalone calculator (`/tools/taylor-series-gradient-calculator/`) in `Graphing & calculus`, cross-linked from `derivative-calculator`.

### 2.8 ADV-08: Complete Triangle Solver (SSS, SAS, ASA, AAS, SSA) (`/tools/triangle-solver/`)
1. **Calculator Name:** Complete Triangle Solver (SSS, SAS, ASA, AAS, SSA) (`triangle-solver`)
2. **Category:** Trigonometry
3. **Problem It Solves:** Currently users must jump between 5 separate calculators (`triangle-calculator`, `herons-formula`, `pythagorean-calculator`, `law-of-cosines`, `law-of-sines`), none of which can solve a complete triangle (all 3 sides, all 3 angles, area, perimeter, inradius, circumradius, and the SSA ambiguous case) from any 3 known inputs!
4. **Target Users:** Geometry, trigonometry, physics, surveying, and mechanical engineering users.
5. **Mathematical or Computational Method:** Law of Cosines, Law of Sines (with SSA check: if a < b and b·sin(A) < a, two solutions B₁ = asin(b·sin(A)/a) and B₂ = 180° − B₁ exist), Heron's formula, r = A/s, R = abc/(4A).
6. **Required Inputs:** Any 3 of: Side a, Side b, Side c, Angle A (°/rad), Angle B (°/rad), Angle C (°/rad).
7. **Expected Outputs:** Sides a, b, c; Angles A, B, C; Area; Perimeter; Semiperimeter s; Altitudes h_a, h_b, h_c; Inradius r; Circumradius R; Triangle classification (Acute/Right/Obtuse & Equilateral/Isosceles/Scalene); Second valid triangle if SSA is ambiguous; Scaled visual diagram.
8. **Important Edge Cases:** 1) Triangle inequality violation (`a + b <= c` in SSS); 2) Angle sum `>= 180°` in ASA/AAS; 3) SSA no-solution case (`a < b * sin(A)`); 4) **SSA ambiguous 2-solution case** (`b * sin(A) < a < b` with `A < 90°`, requiring both acute `B₁` and obtuse `B₂ = 180° - B₁` triangles to be output!).
9. **Example Calculation:** Input: a = 7, b = 9, C = 60° (SAS) → Output: c = √67 ≈ 8.1854, A = 47.792°, B = 72.208°, Area = 27.2798, P = 24.1854, r = 2.2559, R = 4.7258.
10. **Why It Is Better Than a Basic Single-Formula Calculator:** Enter any 3 valid parameters (out of sides a, b, c and angles A, B, C, with at least 1 side) and immediately obtain all 6 triangle elements, area, heights, medians, inradius, circumradius, and a scaled 2D SVG/Canvas triangle drawing, including both solutions when the SSA ambiguous case occurs.
11. **Implementation Complexity:** Medium
12. **Dependencies or Libraries Required:** Zero external dependencies.
13. **Testing & Numerical Accuracy Requirements:** Test SSS (3-4-5), SAS, ASA, AAS, SSA 0-solution, SSA 1-solution (right/obtuse), SSA 2-solution ambiguous case, and invalid angle sum >= 180°.
14. **Priority:** **P0**
15. **Standalone vs. Integrated Decision:** Standalone flagship calculator (`/tools/triangle-solver/`) in `Trigonometry` (and cross-listed in `Geometry`), unifying the workflows of `law-of-sines`, `law-of-cosines`, `herons-formula`, `pythagorean-calculator`, and `triangle-calculator`.

### 2.9 ADV-09: Complete SUVAT 1D & 2D Projectile Kinematics Solver (`/tools/suvat-kinematics-solver/`)
1. **Calculator Name:** Complete SUVAT 1D & 2D Projectile Kinematics Solver (`suvat-kinematics-solver`)
2. **Category:** Physics
3. **Problem It Solves:** Currently kinematics is split across 5 rigid calculators (`speed`, `distance`, `acceleration`, `displacement`, `projectile-range`) that only solve for a single hardcoded output and assume zero initial launch height (h₀ = 0) for projectiles.
4. **Target Users:** High school AP/IB Physics and first-year university engineering mechanics students.
5. **Mathematical or Computational Method:** v = u + at; s = ½(u + v)t; s = ut + ½at²; v² = u² + 2as; s = vt − ½at²; Elevated projectile: t = (v₀sinθ + √((v₀sinθ)² + 2gh₀))/g.
6. **Required Inputs:** Mode (1D SUVAT Solver [any 3 of s, u, v, a, t] / 2D Projectile with Launch Height h₀), values with unit selectors.
7. **Expected Outputs:** All 5 SUVAT variables (s, u, v, a, t) + the specific equations selected for the derivation; or in 2D mode: Time of flight, Horizontal range, Max height above ground, Impact velocity (vx, vy, |v|, impact angle), and trajectory plot y(x).
8. **Important Edge Cases:** 1) Given `(s, u, a)` or `(s, v, a)` where discriminant `u^2 + 2as < 0` (target displacement is unreachable before velocity reverses!); 2) Two positive time roots `t₁, t₂ > 0` when deceleration causes object to pass displacement `s` going forward and backward; 3) `a = 0` fallback to uniform motion `s = ut`; 4) Projectile launched from `h_0 > 0` with downward angle `θ < 0`.
9. **Example Calculation:** Input (1D): u = 10 m/s, a = 2 m/s², s = 75 m → Output: v = 20 m/s (via v² = u² + 2as), t = 5 s (via t = (v − u)/a).
10. **Why It Is Better Than a Basic Single-Formula Calculator:** 1) In 1D SUVAT mode: enter ANY 3 of (s, u, v, a, t) and automatically solve for the remaining 2 using the exact matching kinematic equations; 2) In 2D Projectile mode: supports non-zero launch elevation h₀ ≥ 0 and optional quadratic air drag comparison.
11. **Implementation Complexity:** Medium
12. **Dependencies or Libraries Required:** Zero external dependencies.
13. **Testing & Numerical Accuracy Requirements:** Test all 10 combinations of 3 known SUVAT variables, including quadratic root selection when given (s, u, a) or (s, v, a).
14. **Priority:** **P0**
15. **Standalone vs. Integrated Decision:** Standalone flagship calculator (`/tools/suvat-kinematics-solver/`) in `Physics`, combining all 10 1D SUVAT variable triples and elevated 2D projectile motion into one workflow.

### 2.10 ADV-10: AC RLC Circuit Impedance, Resonance & Transfer Calculator (`/tools/rlc-circuit-calculator/`)
1. **Calculator Name:** AC RLC Circuit Impedance, Resonance & Transfer Calculator (`rlc-circuit-calculator`)
2. **Category:** Physics
3. **Problem It Solves:** AxiomAtlas has basic DC Ohm's law and 3-resistor series/parallel calculators, but lacks AC reactive circuit analysis (capacitive reactance X_C, inductive reactance X_L, total impedance Z, phase angle φ, resonant frequency f₀, and Q factor).
4. **Target Users:** Physics II, electrical engineering, and electronics students/hobbyists.
5. **Mathematical or Computational Method:** X_L = 2πfL; X_C = 1/(2πfC); Series |Z| = √(R² + (X_L − X_C)²); φ = atan2(X_L − X_C, R); f₀ = 1/(2π√(LC)); Q_series = (1/R)√(L/C).
6. **Required Inputs:** Topology (Series RLC / Parallel RLC), Resistance R (Ω), Inductance L (mH/H), Capacitance C (µF/F), Source Voltage V_rms (V), Frequency f (Hz).
7. **Expected Outputs:** Inductive Reactance X_L, Capacitive Reactance X_C, Net Impedance |Z| (Ω), Phase Angle φ (°), Current I_rms (A), Power Factor cos(φ), Resonant Frequency f₀ (Hz), Quality Factor Q, and Bandwidth Δf (Hz).
8. **Important Edge Cases:** Series resonance `X_L = X_C` (reactive part is `0`, impedance `|Z| = R`, phase `φ = 0°`); pure resistor (`L = 0, C = 0`); frequency `f <= 0` (DC limit where `X_L = 0` and `X_C = ∞`).
9. **Example Calculation:** Input: Series R = 10 Ω, L = 10 mH, C = 10 µF, V = 120 V, f = 500 Hz → Output: X_L = 31.42 Ω, X_C = 31.83 Ω, |Z| = 10.009 Ω, f₀ = 503.29 Hz, Q = 3.162.
10. **Why It Is Better Than a Basic Single-Formula Calculator:** Computes full AC phasor impedance, resonant frequency, bandwidth, quality factor Q, and active/reactive/apparent power (P, Q, S, power factor cos φ).
11. **Implementation Complexity:** Low–Medium
12. **Dependencies or Libraries Required:** Zero external dependencies.
13. **Testing & Numerical Accuracy Requirements:** Verify resonance condition X_L = X_C at f = f₀, pure resistive (L=0, C=∞), and power factor bounds [0, 1].
14. **Priority:** **P1**
15. **Standalone vs. Integrated Decision:** Standalone calculator (`/tools/rlc-circuit-calculator/`) in `Physics`, extending `ohms-law`, `resistor-series`, and `resistor-parallel` to AC reactive circuits.

### 2.11 ADV-11: Matrix Eigenvalue, Eigenvector, Rank & Decomposition Calculator (`/tools/eigenvalue-decomposition-calculator/`)
1. **Calculator Name:** Matrix Eigenvalue, Eigenvector, Rank & Decomposition Calculator (`eigenvalue-decomposition-calculator`)
2. **Category:** Linear algebra
3. **Problem It Solves:** `Linear algebra` currently has only 2 calculators (`matrix-calculator` and `vector-calculator`), and `matrix-calculator` lacks eigenvalues, eigenvectors, rank, trace, RREF, and LU/QR decompositions needed in every university linear algebra course.
4. **Target Users:** University linear algebra, data science, quantum mechanics, and structural/control engineering students.
5. **Mathematical or Computational Method:** 2×2 exact quadratic trace/det formula λ² − tr(A)λ + det(A) = 0; 3×3 Faddeev-LeVerrier characteristic polynomial + cubic/QR shift iteration; Gaussian elimination with partial pivoting for RREF/LU.
6. **Required Inputs:** Matrix size (2×2, 3×3, 4×4), Matrix A grid entries, Decomposition view (Eigenvalues & Eigenvectors / RREF & Rank / LU Decomposition).
7. **Expected Outputs:** Characteristic polynomial, Eigenvalues λ₁..λ_n (real & complex), Normalized Eigenvectors, Trace, Determinant, Rank, Nullity, and step-by-step RREF / L and U matrices.
8. **Important Edge Cases:** 1) Complex conjugate eigenvalues in real matrices (e.g. rotation matrix `[[0, -1], [1, 0]]` → `λ = ±i`); 2) Defective matrix with repeated eigenvalue and geometric multiplicity < algebraic multiplicity (`[[2, 1], [0, 2]]`); 3) Zero/singular matrix rank and nullity (`rank + nullity = n`).
9. **Example Calculation:** Input: [[4, 1], [2, 3]] → Output: Characteristic polynomial λ² − 7λ + 10 = 0; Eigenvalues λ₁ = 5 (v₁ = [1, 1]ᵀ), λ₂ = 2 (v₂ = [1, −2]ᵀ); Trace = 7, Det = 10, Rank = 2.
10. **Why It Is Better Than a Basic Single-Formula Calculator:** Computes characteristic polynomial, exact/numerical eigenvalues λ_i, eigenvectors v_i, matrix rank, nullity, trace, RREF (Reduced Row Echelon Form), and LU decomposition.
11. **Implementation Complexity:** Medium
12. **Dependencies or Libraries Required:** Zero external dependencies.
13. **Testing & Numerical Accuracy Requirements:** Test symmetric matrices, defective matrices (repeated eigenvalues), rotation matrices (complex eigenvalues ±i), and rank-deficient matrices.
14. **Priority:** **P0**
15. **Standalone vs. Integrated Decision:** Standalone calculator (`/tools/eigenvalue-decomposition-calculator/`) in `Linear algebra`, sharing the state-preserving matrix grid component with `matrix-calculator`.

### 2.12 ADV-12: Probability Distributions & Hypothesis Testing Calculator (Normal, t, Chi-Square, F) (`/tools/hypothesis-test-calculator/`)
1. **Calculator Name:** Probability Distributions & Hypothesis Testing Calculator (Normal, t, Chi-Square, F) (`hypothesis-test-calculator`)
2. **Category:** Statistics
3. **Problem It Solves:** Currently `Statistics` has `z-score` and a hardcoded `95% confidence-interval` ($z=1.96$), but cannot compute p-values from Z, Student's t, Chi-Square ($\chi^2$), or F statistics, nor perform 1-sample or 2-sample t-tests!
4. **Target Users:** University statistics, psychology, biology, economics, data science, and Six Sigma users.
5. **Mathematical or Computational Method:** Lentz continued-fraction expansion of the regularized incomplete beta function $I_x(a, b)$ and incomplete gamma function $P(a, x)$ (gives 14-digit accuracy for Student's $t$, $F$, $\chi^2$, and Binomial CDFs in <50 lines of JS!) + Abramowitz & Stegun / Cody erf() for Normal CDF.
6. **Required Inputs:** Mode (Distribution P-Value & Critical Value / 1-Sample t-Test / 2-Sample t-Test / Chi-Square Goodness-of-Fit), Test statistic or sample summary (x̄, s, n, μ₀), Degrees of freedom ν, Significance level α (0.01, 0.05, 0.10), Tail (Two-tailed / Left / Right).
7. **Expected Outputs:** Test Statistic (z, t, χ², F), p-value (two-tailed and one-tailed), Critical value(s), Confidence Interval at (1−α), Effect size (Cohen's d), and Plain-English statistical decision ('Reject H₀ at α = 0.05' vs 'Fail to reject H₀').
8. **Important Edge Cases:** 1) Sample size `n <= 1` (`df = n - 1 <= 0` invalid for t-test); 2) Zero sample standard deviation `s = 0`; 3) Unequal variances in 2-sample Welch's t-test (Welch-Satterthwaite degrees of freedom) vs. pooled variance t-test; 4) Extreme tail probabilities (`|t| > 20`, avoiding underflow below `1e-16`).
9. **Example Calculation:** Input: 1-Sample t-test with x̄ = 105, μ₀ = 100, s = 15, n = 25, α = 0.05 (two-tailed) → Output: t = 1.6667 (df = 24), two-tailed p = 0.1086, 95% CI = [98.81, 111.19] (Fail to reject H₀).
10. **Why It Is Better Than a Basic Single-Formula Calculator:** Computes exact CDF/p-values and critical values for Normal ($Z$), Student's $t$, $\chi^2$, Poisson, and $F$ distributions, plus 1-sample and 2-sample $t$-tests with confidence intervals at any $lpha$.
11. **Implementation Complexity:** Medium
12. **Dependencies or Libraries Required:** Zero external dependencies (~60 lines of pure JS incomplete beta/gamma + erf functions).
13. **Testing & Numerical Accuracy Requirements:** Benchmark against NIST StRD and R (`pt()`, `pnorm()`, `pchisq()`, `pf()`, `qt()`) to 10+ decimal places.
14. **Priority:** **P0**
15. **Standalone vs. Integrated Decision:** Standalone flagship calculator (`/tools/hypothesis-test-calculator/`) in `Statistics`, extending `z-score`, `standard-error`, and `confidence-interval` into full inferential p-value and hypothesis testing.

### 2.13 ADV-13: NPV, IRR & XIRR Cash-Flow Valuation Calculator (`/tools/npv-irr-calculator/`)
1. **Calculator Name:** NPV, IRR & XIRR Cash-Flow Valuation Calculator (`npv-irr-calculator`)
2. **Category:** Finance
3. **Problem It Solves:** Finance currently has `present-value`, `roi-calculator`, and `cagr-calculator` for a single cash flow, but lacks Net Present Value (NPV), Internal Rate of Return (IRR), and irregular-date XIRR for multi-period investments and capital budgeting.
4. **Target Users:** Finance students, MBA candidates, startup founders, real estate investors, and retail mutual-fund/SIP investors.
5. **Mathematical or Computational Method:** NPV = Σ CF_t / (1 + r)^t; IRR solved via Newton-Raphson + Brent/bisection fallback on NPV(r) = 0; XIRR uses exact day count (d_t − d_0)/365.
6. **Required Inputs:** Discount rate r (%), Initial investment CF₀ (negative), Dynamic cash-flow table (Period 1..N or Date + Cash Flow), Reinvestment rate (optional for MIRR).
7. **Expected Outputs:** Net Present Value (NPV), Internal Rate of Return (IRR %), Modified IRR (MIRR %), Payback Period (years), Discounted Payback Period, Profitability Index (PI), and Present Value breakdown per cash flow.
8. **Important Edge Cases:** 1) Cash-flow series with **no sign change** (all positive or all negative cash flows → IRR does not exist); 2) Non-conventional cash flows with **multiple sign changes** (multiple real IRRs; report primary IRR in `(-99%, +1000%)` and warn user, plus provide unambiguous MIRR); 3) Discount rate `r = -100%` singularity.
9. **Example Calculation:** Input: r = 10%, CF₀ = −10,000, CF₁ = 3,000, CF₂ = 4,000, CF₃ = 5,000, CF₄ = 3,000 → Output: NPV = +$1,838.67, IRR = 18.06%, Payback = 2.60 years, PI = 1.184.
10. **Why It Is Better Than a Basic Single-Formula Calculator:** Evaluates multi-year or date-stamped cash flows ($CF_0, CF_1, \dots, CF_n$) to compute NPV, IRR, XIRR, Payback Period, Discounted Payback Period, and Profitability Index.
11. **Implementation Complexity:** Medium
12. **Dependencies or Libraries Required:** Zero external dependencies.
13. **Testing & Numerical Accuracy Requirements:** Verify against Excel `NPV()`, `IRR()`, `MIRR()`, and `XIRR()` reference test cases, including non-conventional cash flows (multiple sign changes).
14. **Priority:** **P0**
15. **Standalone vs. Integrated Decision:** Standalone calculator (`/tools/npv-irr-calculator/`) in `Finance`, extending `present-value`, `roi-calculator`, and `cagr-calculator` to multi-period irregular cash flows.

### 2.14 ADV-14: Loan Amortization & Prepayment Schedule Calculator (`/tools/loan-amortization-prepayment-calculator/`)
1. **Calculator Name:** Loan Amortization & Prepayment Schedule Calculator (`loan-amortization-prepayment-calculator`)
2. **Category:** Finance
3. **Problem It Solves:** The existing `emi-calculator` only shows 3 numbers (`Monthly EMI`, `Total paid`, `Total interest`). Borrowers need to see month-by-month principal vs. interest amortization and how much interest and tenure they save by making monthly or annual prepayments.
4. **Target Users:** Home mortgage, auto loan, and personal loan borrowers globally.
5. **Mathematical or Computational Method:** Month-by-month iterative amortization loop: Interest_m = Balance_{m-1} × (r/1200), Principal_m = EMI − Interest_m + Extra_m, Balance_m = max(0, Balance_{m-1} − Principal_m).
6. **Required Inputs:** Loan amount P, Annual interest rate r (%), Tenure (years/months), Extra monthly prepayment, Annual lump-sum prepayment, One-time prepayment.
7. **Expected Outputs:** Baseline EMI vs. Effective Tenure, Total Interest Without Prepayment vs. With Prepayment, Total Interest Saved, Months/Years Saved, and Year-by-Year / Month-by-Month Amortization Schedule table.
8. **Important Edge Cases:** 1) Zero interest rate `r = 0%`; 2) Monthly prepayment exceeding remaining balance in final month (clamp final payment to remaining principal + final month interest); 3) Prepayment larger than loan principal in Month 1.
9. **Example Calculation:** Input: P = 5,000,000, r = 8.5%, Tenure = 20 years (240 months), Extra monthly payment = 5,000 → Output: Base EMI = 43,391; Tenure reduced from 240 to 179 months (5 years 1 month saved); Total interest saved = 1,568,420.
10. **Why It Is Better Than a Basic Single-Formula Calculator:** Computes exact interest saved and months shaved off a loan from extra monthly payments, annual lump-sum prepayments, or EMI step-ups, with a full downloadable/collapsible yearly & monthly amortization schedule.
11. **Implementation Complexity:** Low–Medium
12. **Dependencies or Libraries Required:** Zero external dependencies.
13. **Testing & Numerical Accuracy Requirements:** Verify final month partial payment adjustment, zero-interest edge case, and match against bank amortization tables.
14. **Priority:** **P1**
15. **Standalone vs. Integrated Decision:** Standalone calculator (`/tools/loan-amortization-prepayment-calculator/`) in `Finance` AND integrated via a direct 'View Amortization & Prepayment Schedule →' action on `/tools/emi-calculator/`.

### 2.15 ADV-15: Bitwise Operations, Two's Complement & IEEE-754 Float Inspector (`/tools/bitwise-ieee754-calculator/`)
1. **Calculator Name:** Bitwise Operations, Two's Complement & IEEE-754 Float Inspector (`bitwise-ieee754-calculator`)
2. **Category:** Computing
3. **Problem It Solves:** Computer science and embedded systems engineers need bitwise operations (AND, OR, XOR, NOT, <<, >>, >>>), signed 8/16/32/64-bit Two's Complement representations, and IEEE-754 single/double-precision floating-point bit breakdowns (Sign, Exponent, Mantissa).
4. **Target Users:** Computer science students, systems/embedded programmers, and digital logic engineers.
5. **Mathematical or Computational Method:** BigInt bitmasking `BigInt.asIntN(width, val)` and `BigInt.asUintN(width, val)`; `DataView` `setFloat32`/`setFloat64` for exact hardware IEEE-754 bit extraction.
6. **Required Inputs:** Mode (Bitwise Operations & Two's Complement / IEEE-754 Float Inspector), Bit width (8-bit, 16-bit, 32-bit, 64-bit), Operand A, Operand B, Bitwise operator (AND, OR, XOR, NOT, NAND, NOR, SHL <<, SHR >>, ROR).
7. **Expected Outputs:** Result in Binary (grouped in nibbles), Hexadecimal, Signed Two's Complement Decimal, Unsigned Decimal; or in IEEE-754 mode: Sign bit, Biased/Unbiased Exponent, 23/52-bit Mantissa, Exact stored value, and Rounding representation error.
8. **Important Edge Cases:** 1) Signed Two's Complement minimum value negation overflow (`-(-128)` in 8-bit); 2) Arithmetic right shift `>>` (sign-extending) vs. Logical right shift `>>>` (zero-filling); 3) IEEE-754 denormalized/subnormal numbers (`exponent bits = 0, mantissa != 0`), `-0`, `+Infinity`, `-Infinity`, and `NaN`.
9. **Example Calculation:** Input: IEEE-754 32-bit float for `0.1` → Output: Sign = 0 (+), Exponent = 01111011 (123 − 127 = −4), Mantissa = 10011001100110011001101₂, Stored value = 0.10000000149011612 (Error = +1.49e-9).
10. **Why It Is Better Than a Basic Single-Formula Calculator:** Provides interactive bit-toggling and instant simultaneous binary, hex, unsigned decimal, signed two's complement, and IEEE-754 float bit inspection.
11. **Implementation Complexity:** Low–Medium
12. **Dependencies or Libraries Required:** Zero external dependencies (native JS `BigInt`, `ArrayBuffer`, `DataView`).
13. **Testing & Numerical Accuracy Requirements:** Test Two's Complement overflow boundaries (-128..127 for 8-bit), IEEE-754 subnormals, ±0, ±Infinity, and NaN.
14. **Priority:** **P1**
15. **Standalone vs. Integrated Decision:** Standalone calculator (`/tools/bitwise-ieee754-calculator/`) in `Computing`, complementing `number-base-converter`.

### 2.16 ADV-16: IPv4 / IPv6 Subnet & CIDR Network Calculator (`/tools/subnet-calculator/`)
1. **Calculator Name:** IPv4 / IPv6 Subnet & CIDR Network Calculator (`subnet-calculator`)
2. **Category:** Computing
3. **Problem It Solves:** Networking students, DevOps engineers, and sysadmins need CIDR subnet masks, network/broadcast addresses, usable host ranges, and wildcard masks—one of the highest-volume computing calculator queries on the web.
4. **Target Users:** Computer networking students, software/cloud engineers, and IT administrators.
5. **Mathematical or Computational Method:** 32-bit unsigned integer bitwise masking: `mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0`, `net = (ip & mask) >>> 0`, `bcast = (net | (~mask >>> 0)) >>> 0`.
6. **Required Inputs:** IPv4 Address (e.g. `192.168.1.42`), Prefix / Subnet Mask selector (`/1` to `/32` or `255.255.255.0`).
7. **Expected Outputs:** Network Address, Broadcast Address, First Usable Host, Last Usable Host, Total Addresses (2^(32−p)), Usable Hosts (max(0, 2^(32−p) − 2), or 2 for /31 point-to-point RFC 3021), Subnet Mask, Wildcard Mask, IP Class/Private RFC 1918 status, and 32-bit Binary view.
8. **Important Edge Cases:** 1) `/32` single-host route (1 total address, 1 usable host); 2) `/31` point-to-point link (RFC 3021: 2 total addresses, 2 usable hosts, no broadcast overhead); 3) `/0` entire IPv4 space (`4,294,967,296` addresses); 4) Invalid octets (`> 255` or `< 0`) or malformed CIDR prefix (`> 32`).
9. **Example Calculation:** Input: 192.168.10.45 / 26 → Output: Network = 192.168.10.0, Broadcast = 192.168.10.63, Usable Range = 192.168.10.1 – 192.168.10.62, Usable Hosts = 62, Mask = 255.255.255.192.
10. **Why It Is Better Than a Basic Single-Formula Calculator:** Instantly computes network address, broadcast address, usable IP range, total/usable hosts, netmask, wildcard mask, and binary IP breakdown for any IPv4 CIDR block.
11. **Implementation Complexity:** Low
12. **Dependencies or Libraries Required:** Zero external dependencies.
13. **Testing & Numerical Accuracy Requirements:** Test `/32` single host, `/31` RFC 3021 point-to-point link, `/24`, `/8`, `/0`, and invalid octets > 255.
14. **Priority:** **P1**
15. **Standalone vs. Integrated Decision:** Standalone calculator (`/tools/subnet-calculator/`) in `Computing`, replacing the misclassified electronics tools with a core networking tool.

## 3. Task 3C — Final Prioritized Calculator Expansion Roadmap & Implementation Order

### 3.1 Dependency Graph & Modular Code Architecture

To keep `site/assets/engine.js` (`11.7 KB`) and `site/assets/app.js` (`35.7 KB`) fast on initial page load, all 16 new advanced calculators should share a clean modular architecture:
1. **Core Mathematical Primitives (`site/assets/engine.js`):**
   - Complex number class/helpers (`complexAdd`, `complexMul`, `complexDiv`, `complexPow`, `complexPolar`) — shared by `ADV-01` (Complex Number Calculator), `ADV-04` (Polynomial Aberth-Ehrlich Solver), `ADV-10` (AC RLC Phasor Calculator), and `ADV-11` (Matrix Complex Eigenvalues).
   - Enhanced `gaussian()` / `rref()` — shared by `linear-system`, `matrix-calculator`, `ADV-05` (Partial Fractions), and `ADV-11` (Eigenvalues/RREF/LU).
   - Special functions (`erf`, `incompleteBeta`, `incompleteGamma`) — powers `ADV-12` (Normal, $t$, $\chi^2$, $F$ CDFs & Hypothesis Tests) and cumulative Binomial probabilities in `probability-calculator`.
2. **Recommended 3-Wave Implementation Sequence (After Gate C Approval):**
   - **Wave C1 — Foundational Multi-Mode Solvers (P0, Zero Shared Dependencies):**
     1. `ADV-08`: **Complete Triangle Solver (`triangle-solver`)** — resolves the 5-tool geometry/trig fragmentation immediately.
     2. `ADV-09`: **Complete SUVAT 1D & 2D Projectile Kinematics Solver (`suvat-kinematics-solver`)** — resolves the 5-tool physics kinematics fragmentation.
     3. `ADV-13`: **NPV, IRR & XIRR Cash-Flow Calculator (`npv-irr-calculator`)** — highest-impact financial valuation tool.
     4. `ADV-02`: **Error & Uncertainty Propagation Calculator (`error-propagation-calculator`)** — uses existing `compile()`/`run()` partial finite differences.
   - **Wave C2 — Complex & Matrix Engine Solvers (P0):**
     5. `ADV-01`: **Complex Number Calculator (`complex-number-calculator`)** — introduces complex arithmetic helpers.
     6. `ADV-04`: **Polynomial Roots, Factoring & Division Solver (`polynomial-solver`)** — uses complex helpers + Rational Root Theorem + Aberth-Ehrlich iteration.
     7. `ADV-11`: **Matrix Eigenvalue, Eigenvector, Rank & RREF Calculator (`eigenvalue-decomposition-calculator`)** — uses RREF + characteristic polynomial root finder.
     8. `ADV-06`: **ODE Initial-Value Solver (`ode-solver`)** — uses `compile()`/`run()` + RK4 + Canvas slope-field renderer.
     9. `ADV-12`: **Probability Distributions & Hypothesis Testing Calculator (`hypothesis-test-calculator`)** — introduces Lentz continued-fraction `incompleteBeta`/`incompleteGamma`.
   - **Wave C3 — Specialized Engineering, Financial & CS Extensions (P1):**
     10. `ADV-14`: **Loan Amortization & Prepayment Schedule Calculator (`loan-amortization-prepayment-calculator`)**
     11. `ADV-10`: **AC RLC Circuit Impedance & Resonance Calculator (`rlc-circuit-calculator`)**
     12. `ADV-05`: **Partial Fraction Decomposition Calculator (`partial-fractions-calculator`)**
     13. `ADV-07`: **Taylor Series & Multivariable Gradient Calculator (`taylor-series-gradient-calculator`)**
     14. `ADV-03`: **Modular Congruence & CRT Solver (`modular-congruence-solver`)**
     15. `ADV-15`: **Bitwise, Two's Complement & IEEE-754 Float Calculator (`bitwise-ieee754-calculator`)**
     16. `ADV-16`: **IPv4 / CIDR Subnet Calculator (`subnet-calculator`)**
