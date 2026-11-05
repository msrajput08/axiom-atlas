# AxiomAtlas Advanced STEM Calculator Expansion Roadmap

**Live Website:** [AxiomAtlas](https://axiomatlas.netlify.app/)
**Audit Scope:** Section 5 — Category-by-Category STEM Expansion Analysis and 17-Point Technical Specifications for High-Value Advanced Calculators.
**Status:** Phase 0 Audit Deliverable — Research and specification only (zero new calculators added before approval).

## 1. Strategic Expansion Principles: Depth & Problem-Solving Over Tool Sprawl

AxiomAtlas already has **136 calculators**, many of which are single-formula wrappers (`v = d/t`, `d = v*t`, `F = ma`). Adding 50 more trivial 1-line multiplication calculators would dilute discoverability without solving hard user problems. Instead, our expansion strategy focuses on **16 high-leverage multi-mode STEM solvers** (prioritized into **7 P0 Core Additions** and **9 P1 High-Value Additions**) that:
1. Solve genuinely tedious, multi-step problems where hand calculation is slow or error-prone (e.g., **Complete Triangle Solver**, **SUVAT 1D/2D Kinematics Solver**, **Eigenvalues & RREF**, **Hypothesis Testing & p-values**, **NPV/IRR/XIRR**, **ODE RK4 Solver**, **Complex Numbers**, **Error Propagation**).
2. Run **100% in the browser with zero external paid APIs and zero heavy dependencies**.
3. Use **100% deterministic mathematical algorithms** that integrate directly with the `Explain Calculation` trace engine.

## 2. Subject-by-Subject Gap Analysis (Sections 5.1–5.11)

| Subject Category | Current Count | Existing Strengths | High-Impact Capability Gaps Identified | Recommended Action |
| :--- | :--- | :--- | :--- | :--- |
| **5.1 Math & Numbers** | 21 | Scientific expression parser, BigInt fractions, trial-division primes, combinations/permutations. | No complex number arithmetic ($a+bi \leftrightarrow rngle	heta$), no measurement error propagation ($f \pm \Delta f$), no modular inverse / linear congruence / CRT solver. | Add **Complex Number Calculator (P0)**, **Error Propagation Calculator (P0)**, and **Modular Congruence Solver (P1)**; upgrade `prime-checker` with prime factorization. |
| **5.2 Algebra** | 12 | Citardauq quadratic solver, 2×2/3×3 Gaussian linear system, general interval root scanner. | `polynomial-evaluation` only evaluates a cubic at 1 point; no degree-$n$ polynomial root/factor solver, no partial fraction decomposition. | Add **Polynomial Roots, Factoring & Division Calculator (P0)** and **Partial Fraction Decomposition Calculator (P1)**. |
| **5.3 Graphing & Calculus** | 4 | Interactive 3-function Canvas plotter, central difference derivative, Simpson integral, numerical limit. | No differential equation (ODE) solver, no Taylor/Maclaurin series expansion, no multivariable gradient/Hessian critical-point analyzer. | Add **ODE Initial-Value Solver with Slope Field (P0)** and **Taylor Series & Multivariable Gradient Calculator (P1)**. |
| **5.4 Geometry & 5.5 Trigonometry** | 18 + 5 | 18 2D/3D shape calculators, Law of Sines, Law of Cosines, Heron's formula. | Fragmented across 5 separate triangle tools; cannot solve a complete triangle from arbitrary 3 inputs (SSS, SAS, ASA, AAS, SSA ambiguous case). | Add **Complete Triangle Solver (P0)** with scaled visual diagram and cross-link all 2D/3D geometry calculators. |
| **5.6 Physics** | 27 | Broad coverage of 27 introductory mechanics, optics, thermal, and DC formulas. | Cannot solve general 1D SUVAT problems when different variable triples are known; projectile motion lacks initial height $h_0$; no AC RLC impedance/resonance tool. | Add **Complete SUVAT 1D & 2D Projectile Kinematics Solver (P0)** and **AC RLC Circuit Impedance & Resonance Calculator (P1)**; reclassify 3 physics tools from Computing. |
| **5.7 Linear Algebra** | 2 | 2×2/3×3 Matrix ops (add, mul, det, inv, transpose) and 3D Vector dot/cross product. | Missing eigenvalues, eigenvectors, characteristic polynomial, matrix rank, RREF, and LU/QR decomposition. | Add **Matrix Eigenvalue, Eigenvector, Rank & Decomposition Calculator (P0)**. |
| **5.8 Statistics** | 7 | 14-metric descriptive stats, Pearson regression, exact Binomial PMF, Z-score. | Missing Normal/t/$\chi^2$/F p-value CDFs, critical values, and 1-sample/2-sample hypothesis tests. | Add **Probability Distributions & Hypothesis Testing Calculator (P0)**. |
| **5.9 Finance** | 15 | EMI, SIP, Compound Interest, CAGR, ROI, Break-Even, PV, FV Annuity. | Missing multi-period cash-flow valuation (NPV, IRR, XIRR, Payback) and loan prepayment/amortization schedule. | Add **NPV, IRR & XIRR Cash-Flow Valuation Calculator (P0)** and **Loan Amortization & Prepayment Schedule Calculator (P1)**. |
| **5.10 Converters** | 1 | Universal Unit Converter with 16 unit groups (103 units). | Lacks compound engineering units (viscosity, thermal conductivity, molar/mass flow) and multi-unit simultaneous readout table. | Upgrade `unit-converter` in place with additional engineering unit groups (`Dynamic Viscosity`, `Kinematic Viscosity`, `Magnetic Flux`, `Illuminance`, `Fuel Economy`) and all-unit readout table. |
| **5.11 Computing** | 11 | BigInt base converter, HEX/RGB color picker, storage/download estimators. | 4 of the 11 tools are misclassified physics/everyday tools; missing Bitwise / Two's Complement / IEEE-754 float inspector and IPv4 CIDR Subnet calculator. | Add **Bitwise, Two's Complement & IEEE-754 Float Calculator (P1)** and **IPv4 / CIDR Subnet Calculator (P1)**. |

## 3. Prioritized Master Table of Recommended New Calculators

| ID | Proposed Calculator Name | Target Category | Priority | Complexity | Est. Effort | Browser-Only / 0-Deps |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ADV-01** | **Complex Number Calculator** (`complex-number-calculator`) | Math & numbers | **P0** | Low–Medium | 4 hours | Yes (100% Native JS) |
| **ADV-02** | **Error Propagation & Uncertainty Calculator** (`error-propagation-calculator`) | Math & numbers | **P0** | Medium | 4 hours | Yes (100% Native JS) |
| **ADV-03** | **Modular Arithmetic & Linear Congruence Solver** (`modular-congruence-solver`) | Math & numbers | **P1** | Low–Medium | 3.5 hours | Yes (100% Native JS) |
| **ADV-04** | **Polynomial Roots, Factoring & Division Calculator** (`polynomial-solver`) | Algebra | **P0** | Medium | 5 hours | Yes (100% Native JS) |
| **ADV-05** | **Partial Fraction Decomposition Calculator** (`partial-fractions-calculator`) | Algebra | **P1** | Medium | 5 hours | Yes (100% Native JS) |
| **ADV-06** | **Ordinary Differential Equation (ODE) Initial-Value Solver** (`ode-solver`) | Graphing & calculus | **P0** | Medium | 5 hours | Yes (100% Native JS) |
| **ADV-07** | **Taylor Series & Multivariable Gradient Calculator** (`taylor-series-gradient-calculator`) | Graphing & calculus | **P1** | Medium | 4.5 hours | Yes (100% Native JS) |
| **ADV-08** | **Complete Triangle Solver (SSS, SAS, ASA, AAS, SSA)** (`triangle-solver`) | Trigonometry | **P0** | Medium | 5 hours | Yes (100% Native JS) |
| **ADV-09** | **Complete SUVAT 1D & 2D Projectile Kinematics Solver** (`suvat-kinematics-solver`) | Physics | **P0** | Medium | 5 hours | Yes (100% Native JS) |
| **ADV-10** | **AC RLC Circuit Impedance, Resonance & Transfer Calculator** (`rlc-circuit-calculator`) | Physics | **P1** | Low–Medium | 4 hours | Yes (100% Native JS) |
| **ADV-11** | **Matrix Eigenvalue, Eigenvector, Rank & Decomposition Calculator** (`eigenvalue-decomposition-calculator`) | Linear algebra | **P0** | Medium | 6 hours | Yes (100% Native JS) |
| **ADV-12** | **Probability Distributions & Hypothesis Testing Calculator (Normal, t, Chi-Square, F)** (`hypothesis-test-calculator`) | Statistics | **P0** | Medium | 6 hours | Yes (100% Native JS) |
| **ADV-13** | **NPV, IRR & XIRR Cash-Flow Valuation Calculator** (`npv-irr-calculator`) | Finance | **P0** | Medium | 4.5 hours | Yes (100% Native JS) |
| **ADV-14** | **Loan Amortization & Prepayment Schedule Calculator** (`loan-amortization-prepayment-calculator`) | Finance | **P1** | Low–Medium | 4 hours | Yes (100% Native JS) |
| **ADV-15** | **Bitwise Operations, Two's Complement & IEEE-754 Float Inspector** (`bitwise-ieee754-calculator`) | Computing | **P1** | Low–Medium | 4 hours | Yes (100% Native JS) |
| **ADV-16** | **IPv4 / IPv6 Subnet & CIDR Network Calculator** (`subnet-calculator`) | Computing | **P1** | Low | 3 hours | Yes (100% Native JS) |

## 4. Complete 17-Point Technical Specifications for Each Recommended Calculator (Section 5.12)
### 4.1 ADV-01: Complex Number Calculator (`complex-number-calculator`)
- **1. Calculator Name:** Complex Number Calculator (Route: `/tools/complex-number-calculator/`)
- **2. Category:** Math & numbers
- **3. User Problem:** Students and electrical/control engineers need to add, subtract, multiply, divide, exponentiate, and convert complex numbers between rectangular (a + bi), polar (r∠θ), and exponential (r·e^(iθ)) forms, which standard real-valued calculators cannot handle.
- **4. Target Audience:** High school & university STEM students, electrical engineers (AC phasor analysis), signal processing practitioners.
- **5. Practical Benefit:** Eliminates manual rationalizing of complex denominators and quadrant-error-prone atan2 conversions between rectangular and polar phasor forms.
- **6. Inputs:** z₁ = a₁ + b₁i (or r₁∠θ₁), z₂ = a₂ + b₂i (or r₂∠θ₂), Operation (+, −, ×, ÷, z₁ⁿ, √z₁, Conjugate, Polar↔Rectangular), Angle unit (° or rad).
- **7. Outputs:** Result in Rectangular form (a + bi), Polar form (r ∠ θ), Exponential form (r·e^(iθ)), Modulus |z|, Argument arg(z), Complex conjugate z̄, and 2D Argand plane vector diagram.
- **8. Formulas and Algorithms:** Multiplication: (a₁a₂ − b₁b₂) + (a₁b₂ + a₂b₁)i; Division: [(a₁a₂ + b₁b₂) + (b₁a₂ − a₁b₂)i]/(a₂² + b₂²); Modulus: r = hypot(a, b); Argument: θ = atan2(b, a); De Moivre's theorem: zⁿ = rⁿ(cos(nθ) + i sin(nθ)).
- **9. Concrete Worked Example:** Input: z₁ = 3 + 4i, z₂ = 1 − 2i, Operation = ÷ → Output: −1 + 2i, |z| = √5 ≈ 2.236068, θ = 116.565° (2.0344 rad).
- **10. Existing Overlap:** Complements `quadratic-equation` (which outputs complex roots) and `scientific-calculator` (real-only).
- **11. Dependency Requirements:** Zero external dependencies (native Math.hypot, Math.atan2, HTML5 2D Canvas for Argand plot).
- **12. Browser-Only Feasibility:** 100% browser-native, zero backend, works offline.
- **13. Deterministic Engine:** Deterministic complex arithmetic module in `site/assets/engine.js`.
- **14. Implementation Complexity:** Low–Medium
- **15. Testing Requirements:** Verify division by zero (0 + 0i), pure imaginary numbers (0 + bi), negative real branch cut arg(-1 + 0i) = π, and De Moivre powers.
- **16. Priority:** **P0**
- **17. Estimated Effort:** 4 hours

### 4.2 ADV-02: Error Propagation & Uncertainty Calculator (`error-propagation-calculator`)
- **1. Calculator Name:** Error Propagation & Uncertainty Calculator (Route: `/tools/error-propagation-calculator/`)
- **2. Category:** Math & numbers
- **3. User Problem:** Laboratory science and engineering students must propagate measurement uncertainties (x ± Δx, y ± Δy, z ± Δz) through addition, multiplication, powers, or general formulas f(x, y, z), which requires tedious partial derivative sums.
- **4. Target Audience:** Physics, chemistry, and engineering lab students and experimental researchers.
- **5. Practical Benefit:** Computes both absolute uncertainty (±Δf) and relative/percentage uncertainty (Δf/|f| %) using exact partial-derivative variance propagation.
- **6. Inputs:** Expression f(x, y, z) (or preset operation: x±y, x·y, x/y, x^n), Measured values (x, y, z), Uncertainties (Δx, Δy, Δz), Correlation ρ_xy (default 0).
- **7. Outputs:** Nominal value f, Absolute uncertainty Δf, Relative uncertainty Δf/|f|, Percentage uncertainty (%), Correctly rounded scientific result (f ± Δf), and per-variable sensitivity contribution (% of total variance).
- **8. Formulas and Algorithms:** Gaussian variance propagation: Δf = √((∂f/∂x · Δx)² + (∂f/∂y · Δy)² + (∂f/∂z · Δz)² + 2(∂f/∂x)(∂f/∂y)cov(x,y)), using central finite differences on `compile(expr)`.
- **9. Concrete Worked Example:** Input: f = x / y (Density ρ = m / V), x = 100 ± 1 g, y = 50 ± 1 cm³ → Output: f = 2.000 ± 0.045 g/cm³ (Relative uncertainty: 2.24%; V contributes 80% of variance, m contributes 20%).
- **10. Existing Overlap:** Zero overlap in current catalog; bridges `Math & numbers` and `Physics` lab work.
- **11. Dependency Requirements:** Zero external dependencies (uses existing `compile()` and `run()` in `engine.js`).
- **12. Browser-Only Feasibility:** 100% browser-native.
- **13. Deterministic Engine:** Deterministic numerical partial differentiation over `engine.js` AST.
- **14. Implementation Complexity:** Medium
- **15. Testing Requirements:** Verify against analytical rules: Δ(x+y) = √(Δx²+Δy²), Δ(xy)/(xy) = √((Δx/x)²+(Δy/y)²), and Δ(x^n)/|x^n| = |n|Δx/|x|.
- **16. Priority:** **P0**
- **17. Estimated Effort:** 4 hours

### 4.3 ADV-03: Modular Arithmetic & Linear Congruence Solver (`modular-congruence-solver`)
- **1. Calculator Name:** Modular Arithmetic & Linear Congruence Solver (Route: `/tools/modular-congruence-solver/`)
- **2. Category:** Math & numbers
- **3. User Problem:** Discrete math and cryptography students need modular exponentiation (a^b mod m), modular multiplicative inverse (a⁻¹ mod m), Extended Euclidean Bézout coefficients, and Chinese Remainder Theorem (CRT) solvers, whereas the existing `modulo-calculator` only does basic remainder.
- **4. Target Audience:** Computer science, discrete mathematics, cryptography, and competitive programming students.
- **5. Practical Benefit:** Computes huge modular powers (e.g. RSA exponentiation) and modular inverses instantaneously using exact BigInt arithmetic without overflow.
- **6. Inputs:** Mode (a^b mod m / Modular Inverse a⁻¹ mod m / Linear Congruence ax ≡ b (mod m) / Chinese Remainder Theorem), BigInt integer inputs.
- **7. Outputs:** Exact modular result, Extended GCD Bézout identity (a·x + m·y = gcd(a, m)), existence condition (gcd(a, m) | b), and all incongruent solutions modulo m.
- **8. Formulas and Algorithms:** Binary exponentiation (square-and-multiply) in BigInt; Extended Euclidean Algorithm for ax + my = g.
- **9. Concrete Worked Example:** Input: 17x ≡ 1 (mod 3120) → Output: x ≡ 2753 (mod 3120), Bézout check: 17(2753) − 15(3120) = 1.
- **10. Existing Overlap:** Extends `modulo-calculator` and `gcd-calculator` into university-level number theory.
- **11. Dependency Requirements:** Zero external dependencies (native JS BigInt).
- **12. Browser-Only Feasibility:** 100% browser-native.
- **13. Deterministic Engine:** Deterministic BigInt number theory module.
- **14. Implementation Complexity:** Low–Medium
- **15. Testing Requirements:** Test coprime and non-coprime moduli, negative bases, and 100-digit BigInt exponents.
- **16. Priority:** **P1**
- **17. Estimated Effort:** 3.5 hours

### 4.4 ADV-04: Polynomial Roots, Factoring & Division Calculator (`polynomial-solver`)
- **1. Calculator Name:** Polynomial Roots, Factoring & Division Calculator (Route: `/tools/polynomial-solver/`)
- **2. Category:** Algebra
- **3. User Problem:** The existing `polynomial-evaluation` tool only evaluates a cubic at a single point x, while `equation-solver` misses complex roots and repeated roots. Students and engineers need all real and complex roots of degree-n polynomials, synthetic division, and rational root factorization.
- **4. Target Audience:** Algebra, precalculus, calculus, and control-systems engineering students.
- **5. Practical Benefit:** Finds exact rational roots via the Rational Root Theorem and all remaining real & complex roots of polynomials up to degree 10 via the Durand-Kerner / Aberth-Ehrlich method.
- **6. Inputs:** Polynomial coefficients (e.g. a_n ... a_0 or expression `x^3 - 6*x^2 + 11*x - 6`), optional divisor `(x - c)` or `Q(x)` for polynomial long division.
- **7. Outputs:** All Real and Complex Roots (with multiplicities), Factored form, Rational Root candidates (±p/q), Quotient P(x)/D(x) and Remainder R(x), Derivative P'(x), and local extrema.
- **8. Formulas and Algorithms:** Rational Root Theorem (±divisors of a_0 / divisors of a_n) + Horner deflation + Aberth-Ehrlich simultaneous complex root iteration.
- **9. Concrete Worked Example:** Input: x³ − 6x² + 11x − 6 = 0 → Output: Roots x = 1, 2, 3; Factored form: (x − 1)(x − 2)(x − 3).
- **10. Existing Overlap:** Generalizes `quadratic-equation` (degree 2) and `polynomial-evaluation` (cubic evaluation).
- **11. Dependency Requirements:** Zero external dependencies (~80 lines of pure JS complex Horner + Aberth-Ehrlich solver).
- **12. Browser-Only Feasibility:** 100% browser-native.
- **13. Deterministic Engine:** Deterministic Rational Root + Aberth-Ehrlich numerical engine.
- **14. Implementation Complexity:** Medium
- **15. Testing Requirements:** Verify Wilkinson-style roots, complex conjugate pairs (x⁴ + 1 = 0), and repeated roots ((x-2)³ = 0).
- **16. Priority:** **P0**
- **17. Estimated Effort:** 5 hours

### 4.5 ADV-05: Partial Fraction Decomposition Calculator (`partial-fractions-calculator`)
- **1. Calculator Name:** Partial Fraction Decomposition Calculator (Route: `/tools/partial-fractions-calculator/`)
- **2. Category:** Algebra
- **3. User Problem:** Calculus (integration of rational functions) and Engineering (inverse Laplace transforms) students constantly need partial fraction expansion of P(x)/Q(x), which is error-prone by hand.
- **4. Target Audience:** Calculus II, Differential Equations, and Signals & Systems students.
- **5. Practical Benefit:** Decomposes proper and improper rational functions into linear and irreducible quadratic partial fractions with full Heaviside cover-up and linear system steps.
- **6. Inputs:** Numerator polynomial coefficients P(x), Denominator factored roots or polynomial coefficients Q(x) (up to degree 4).
- **7. Outputs:** Polynomial quotient (if improper) + Partial fraction terms A/(x−r₁) + B/(x−r₁)² + (Cx+D)/(x²+px+q), plus the solved linear system for coefficients A, B, C, D.
- **8. Formulas and Algorithms:** Polynomial long division + Heaviside residue method + Vandermonde/equating-coefficients linear system solved via existing `gaussian()` in `engine.js`.
- **9. Concrete Worked Example:** Input: (5x − 3) / ((x + 1)(x − 3)) → Output: 2/(x + 1) + 3/(x − 3).
- **10. Existing Overlap:** Zero overlap in current catalog; leverages `gaussian()` already in `engine.js`.
- **11. Dependency Requirements:** Zero external dependencies.
- **12. Browser-Only Feasibility:** 100% browser-native.
- **13. Deterministic Engine:** Deterministic coefficient matching via `gaussian()`.
- **14. Implementation Complexity:** Medium
- **15. Testing Requirements:** Test distinct linear roots, repeated linear roots (x-1)², irreducible quadratic factors (x²+1), and improper fractions deg(P) >= deg(Q).
- **16. Priority:** **P1**
- **17. Estimated Effort:** 5 hours

### 4.6 ADV-06: Ordinary Differential Equation (ODE) Initial-Value Solver (`ode-solver`)
- **1. Calculator Name:** Ordinary Differential Equation (ODE) Initial-Value Solver (Route: `/tools/ode-solver/`)
- **2. Category:** Graphing & calculus
- **3. User Problem:** Science and engineering students studying dy/dx = f(x, y) (or 2nd-order y'' = f(x, y, y')) currently have no tool on AxiomAtlas to solve initial-value problems or compare Euler vs. Runge-Kutta trajectories.
- **4. Target Audience:** University calculus, differential equations, physics, and engineering students.
- **5. Practical Benefit:** Computes high-accuracy RK45 numerical solutions, plots the solution curve y(x) alongside a 2D slope/direction field, and outputs a step-by-step table.
- **6. Inputs:** Differential equation dy/dx = f(x, y) (default `x - y`), Initial condition x₀ (0), y₀ (1), Target x_end (2), Step count N (20), Method (RK4 [default], Euler, Heun/Midpoint).
- **7. Outputs:** y(x_end), Interactive canvas showing slope field + solution trajectory y(x), and downloadable step table (x_k, y_k, k₁, k₂, k₃, k₄).
- **8. Formulas and Algorithms:** Classical 4th-order Runge-Kutta (RK4): k₁ = f(x_n, y_n), k₂ = f(x_n + h/2, y_n + hk₁/2), k₃ = f(x_n + h/2, y_n + hk₂/2), k₄ = f(x_n + h, y_n + hk₃), y_{n+1} = y_n + (h/6)(k₁ + 2k₂ + 2k₃ + k₄).
- **9. Concrete Worked Example:** Input: dy/dx = y, y(0) = 1, x_end = 1, h = 0.1 → Output: y(1) ≈ 2.7182818 (exact e¹ = 2.718281828).
- **10. Existing Overlap:** Extends `Graphing & calculus` beyond single-point derivatives and definite integrals.
- **11. Dependency Requirements:** Zero external dependencies (uses `compile()`/`run()` with `{x, y}` variables and HTML5 2D Canvas).
- **12. Browser-Only Feasibility:** 100% browser-native.
- **13. Deterministic Engine:** Deterministic RK4 / Euler / Heun integrator.
- **14. Implementation Complexity:** Medium
- **15. Testing Requirements:** Benchmark against known analytical ODEs: dy/dx = y (y = e^x), dy/dx = -2xy (y = e^(-x²)), and stiff/blowup warning checks.
- **16. Priority:** **P0**
- **17. Estimated Effort:** 5 hours

### 4.7 ADV-07: Taylor Series & Multivariable Gradient Calculator (`taylor-series-gradient-calculator`)
- **1. Calculator Name:** Taylor Series & Multivariable Gradient Calculator (Route: `/tools/taylor-series-gradient-calculator/`)
- **2. Category:** Graphing & calculus
- **3. User Problem:** Calculus II/III students need numerical Taylor polynomial approximations P_n(x) around x = a (with remainder error) and multivariable gradient ∇f(x, y) / Hessian matrices.
- **4. Target Audience:** Calculus II, Multivariable Calculus, and numerical analysis students.
- **5. Practical Benefit:** Computes up to 4th-order Taylor approximation and multivariable partial derivatives ∂f/∂x, ∂f/∂y, ∂²f/∂x², ∂²f/∂y², ∂²f/∂x∂y with 2D local extremum/saddle-point classification.
- **6. Inputs:** Mode (Taylor Polynomial P_n(x) / Multivariable Gradient & Hessian f(x,y)), Function expression, Expansion/evaluation point (x₀, y₀), Evaluation target x.
- **7. Outputs:** Derivatives f'(a)..f⁽⁴⁾(a), Taylor polynomial coefficients, Approximated value vs. true f(x), Truncation error, or Gradient vector ∇f, Directional derivative, Hessian determinant D = f_xx f_yy − f_xy², and critical point classification.
- **8. Formulas and Algorithms:** Higher-order finite differences with optimal step scaling h = ε^(1/(k+2)); Second Derivative Test D = f_xx f_yy − (f_xy)².
- **9. Concrete Worked Example:** Input: f(x, y) = x² − y² at (0, 0) → Output: ∇f = (0, 0), Hessian det = −4 < 0 (Saddle point).
- **10. Existing Overlap:** Extends `derivative-calculator` to higher orders and 2D multivariable functions.
- **11. Dependency Requirements:** Zero external dependencies.
- **12. Browser-Only Feasibility:** 100% browser-native.
- **13. Deterministic Engine:** Deterministic higher-order central difference stencil engine.
- **14. Implementation Complexity:** Medium
- **15. Testing Requirements:** Verify ∂f/∂x, ∂f/∂y, and Hessian on polynomials, sin(x)cos(y), and exp(x²+y²).
- **16. Priority:** **P1**
- **17. Estimated Effort:** 4.5 hours

### 4.8 ADV-08: Complete Triangle Solver (SSS, SAS, ASA, AAS, SSA) (`triangle-solver`)
- **1. Calculator Name:** Complete Triangle Solver (SSS, SAS, ASA, AAS, SSA) (Route: `/tools/triangle-solver/`)
- **2. Category:** Trigonometry
- **3. User Problem:** Currently users must jump between 5 separate calculators (`triangle-calculator`, `herons-formula`, `pythagorean-calculator`, `law-of-cosines`, `law-of-sines`), none of which can solve a complete triangle (all 3 sides, all 3 angles, area, perimeter, inradius, circumradius, and the SSA ambiguous case) from any 3 known inputs!
- **4. Target Audience:** Geometry, trigonometry, physics, surveying, and mechanical engineering users.
- **5. Practical Benefit:** Enter any 3 valid parameters (out of sides a, b, c and angles A, B, C, with at least 1 side) and immediately obtain all 6 triangle elements, area, heights, medians, inradius, circumradius, and a scaled 2D SVG/Canvas triangle drawing, including both solutions when the SSA ambiguous case occurs.
- **6. Inputs:** Any 3 of: Side a, Side b, Side c, Angle A (°/rad), Angle B (°/rad), Angle C (°/rad).
- **7. Outputs:** Sides a, b, c; Angles A, B, C; Area; Perimeter; Semiperimeter s; Altitudes h_a, h_b, h_c; Inradius r; Circumradius R; Triangle classification (Acute/Right/Obtuse & Equilateral/Isosceles/Scalene); Second valid triangle if SSA is ambiguous; Scaled visual diagram.
- **8. Formulas and Algorithms:** Law of Cosines, Law of Sines (with SSA check: if a < b and b·sin(A) < a, two solutions B₁ = asin(b·sin(A)/a) and B₂ = 180° − B₁ exist), Heron's formula, r = A/s, R = abc/(4A).
- **9. Concrete Worked Example:** Input: a = 7, b = 9, C = 60° (SAS) → Output: c = √67 ≈ 8.1854, A = 47.792°, B = 72.208°, Area = 27.2798, P = 24.1854, r = 2.2559, R = 4.7258.
- **10. Existing Overlap:** Unifies the fragmented workflows of `law-of-sines`, `law-of-cosines`, `herons-formula`, `triangle-calculator`, and `pythagorean-calculator` while keeping those 5 pages active for formula-specific queries.
- **11. Dependency Requirements:** Zero external dependencies.
- **12. Browser-Only Feasibility:** 100% browser-native.
- **13. Deterministic Engine:** Deterministic geometric branch solver.
- **14. Implementation Complexity:** Medium
- **15. Testing Requirements:** Test SSS (3-4-5), SAS, ASA, AAS, SSA 0-solution, SSA 1-solution (right/obtuse), SSA 2-solution ambiguous case, and invalid angle sum >= 180°.
- **16. Priority:** **P0**
- **17. Estimated Effort:** 5 hours

### 4.9 ADV-09: Complete SUVAT 1D & 2D Projectile Kinematics Solver (`suvat-kinematics-solver`)
- **1. Calculator Name:** Complete SUVAT 1D & 2D Projectile Kinematics Solver (Route: `/tools/suvat-kinematics-solver/`)
- **2. Category:** Physics
- **3. User Problem:** Currently kinematics is split across 5 rigid calculators (`speed`, `distance`, `acceleration`, `displacement`, `projectile-range`) that only solve for a single hardcoded output and assume zero initial launch height (h₀ = 0) for projectiles.
- **4. Target Audience:** High school AP/IB Physics and first-year university engineering mechanics students.
- **5. Practical Benefit:** 1) In 1D SUVAT mode: enter ANY 3 of (s, u, v, a, t) and automatically solve for the remaining 2 using the exact matching kinematic equations; 2) In 2D Projectile mode: supports non-zero launch elevation h₀ ≥ 0 and optional quadratic air drag comparison.
- **6. Inputs:** Mode (1D SUVAT Solver [any 3 of s, u, v, a, t] / 2D Projectile with Launch Height h₀), values with unit selectors.
- **7. Outputs:** All 5 SUVAT variables (s, u, v, a, t) + the specific equations selected for the derivation; or in 2D mode: Time of flight, Horizontal range, Max height above ground, Impact velocity (vx, vy, |v|, impact angle), and trajectory plot y(x).
- **8. Formulas and Algorithms:** v = u + at; s = ½(u + v)t; s = ut + ½at²; v² = u² + 2as; s = vt − ½at²; Elevated projectile: t = (v₀sinθ + √((v₀sinθ)² + 2gh₀))/g.
- **9. Concrete Worked Example:** Input (1D): u = 10 m/s, a = 2 m/s², s = 75 m → Output: v = 20 m/s (via v² = u² + 2as), t = 5 s (via t = (v − u)/a).
- **10. Existing Overlap:** Complements `speed-calculator`, `distance-calculator`, `acceleration-calculator`, `displacement-calculator`, and `projectile-range`.
- **11. Dependency Requirements:** Zero external dependencies.
- **12. Browser-Only Feasibility:** 100% browser-native.
- **13. Deterministic Engine:** Deterministic 10-case SUVAT combinatoric solver ($\binom{5}{3} = 10$ input combinations).
- **14. Implementation Complexity:** Medium
- **15. Testing Requirements:** Test all 10 combinations of 3 known SUVAT variables, including quadratic root selection when given (s, u, a) or (s, v, a).
- **16. Priority:** **P0**
- **17. Estimated Effort:** 5 hours

### 4.10 ADV-10: AC RLC Circuit Impedance, Resonance & Transfer Calculator (`rlc-circuit-calculator`)
- **1. Calculator Name:** AC RLC Circuit Impedance, Resonance & Transfer Calculator (Route: `/tools/rlc-circuit-calculator/`)
- **2. Category:** Physics
- **3. User Problem:** AxiomAtlas has basic DC Ohm's law and 3-resistor series/parallel calculators, but lacks AC reactive circuit analysis (capacitive reactance X_C, inductive reactance X_L, total impedance Z, phase angle φ, resonant frequency f₀, and Q factor).
- **4. Target Audience:** Physics II, electrical engineering, and electronics students/hobbyists.
- **5. Practical Benefit:** Computes full AC phasor impedance, resonant frequency, bandwidth, quality factor Q, and active/reactive/apparent power (P, Q, S, power factor cos φ).
- **6. Inputs:** Topology (Series RLC / Parallel RLC), Resistance R (Ω), Inductance L (mH/H), Capacitance C (µF/F), Source Voltage V_rms (V), Frequency f (Hz).
- **7. Outputs:** Inductive Reactance X_L, Capacitive Reactance X_C, Net Impedance |Z| (Ω), Phase Angle φ (°), Current I_rms (A), Power Factor cos(φ), Resonant Frequency f₀ (Hz), Quality Factor Q, and Bandwidth Δf (Hz).
- **8. Formulas and Algorithms:** X_L = 2πfL; X_C = 1/(2πfC); Series |Z| = √(R² + (X_L − X_C)²); φ = atan2(X_L − X_C, R); f₀ = 1/(2π√(LC)); Q_series = (1/R)√(L/C).
- **9. Concrete Worked Example:** Input: Series R = 10 Ω, L = 10 mH, C = 10 µF, V = 120 V, f = 500 Hz → Output: X_L = 31.42 Ω, X_C = 31.83 Ω, |Z| = 10.009 Ω, f₀ = 503.29 Hz, Q = 3.162.
- **10. Existing Overlap:** Extends `ohms-law`, `electrical-power`, `resistor-series`, and `resistor-parallel` into AC circuit analysis.
- **11. Dependency Requirements:** Zero external dependencies.
- **12. Browser-Only Feasibility:** 100% browser-native.
- **13. Deterministic Engine:** Deterministic AC phasor arithmetic.
- **14. Implementation Complexity:** Low–Medium
- **15. Testing Requirements:** Verify resonance condition X_L = X_C at f = f₀, pure resistive (L=0, C=∞), and power factor bounds [0, 1].
- **16. Priority:** **P1**
- **17. Estimated Effort:** 4 hours

### 4.11 ADV-11: Matrix Eigenvalue, Eigenvector, Rank & Decomposition Calculator (`eigenvalue-decomposition-calculator`)
- **1. Calculator Name:** Matrix Eigenvalue, Eigenvector, Rank & Decomposition Calculator (Route: `/tools/eigenvalue-decomposition-calculator/`)
- **2. Category:** Linear algebra
- **3. User Problem:** `Linear algebra` currently has only 2 calculators (`matrix-calculator` and `vector-calculator`), and `matrix-calculator` lacks eigenvalues, eigenvectors, rank, trace, RREF, and LU/QR decompositions needed in every university linear algebra course.
- **4. Target Audience:** University linear algebra, data science, quantum mechanics, and structural/control engineering students.
- **5. Practical Benefit:** Computes characteristic polynomial, exact/numerical eigenvalues λ_i, eigenvectors v_i, matrix rank, nullity, trace, RREF (Reduced Row Echelon Form), and LU decomposition.
- **6. Inputs:** Matrix size (2×2, 3×3, 4×4), Matrix A grid entries, Decomposition view (Eigenvalues & Eigenvectors / RREF & Rank / LU Decomposition).
- **7. Outputs:** Characteristic polynomial, Eigenvalues λ₁..λ_n (real & complex), Normalized Eigenvectors, Trace, Determinant, Rank, Nullity, and step-by-step RREF / L and U matrices.
- **8. Formulas and Algorithms:** 2×2 exact quadratic trace/det formula λ² − tr(A)λ + det(A) = 0; 3×3 Faddeev-LeVerrier characteristic polynomial + cubic/QR shift iteration; Gaussian elimination with partial pivoting for RREF/LU.
- **9. Concrete Worked Example:** Input: [[4, 1], [2, 3]] → Output: Characteristic polynomial λ² − 7λ + 10 = 0; Eigenvalues λ₁ = 5 (v₁ = [1, 1]ᵀ), λ₂ = 2 (v₂ = [1, −2]ᵀ); Trace = 7, Det = 10, Rank = 2.
- **10. Existing Overlap:** Elevates `Linear algebra` from 2 basic tools to a complete linear algebra workbench.
- **11. Dependency Requirements:** Zero external dependencies.
- **12. Browser-Only Feasibility:** 100% browser-native.
- **13. Deterministic Engine:** Deterministic Faddeev-LeVerrier + QR algorithm + Gauss-Jordan RREF engine.
- **14. Implementation Complexity:** Medium
- **15. Testing Requirements:** Test symmetric matrices, defective matrices (repeated eigenvalues), rotation matrices (complex eigenvalues ±i), and rank-deficient matrices.
- **16. Priority:** **P0**
- **17. Estimated Effort:** 6 hours

### 4.12 ADV-12: Probability Distributions & Hypothesis Testing Calculator (Normal, t, Chi-Square, F) (`hypothesis-test-calculator`)
- **1. Calculator Name:** Probability Distributions & Hypothesis Testing Calculator (Normal, t, Chi-Square, F) (Route: `/tools/hypothesis-test-calculator/`)
- **2. Category:** Statistics
- **3. User Problem:** Currently `Statistics` has `z-score` and a hardcoded `95% confidence-interval` ($z=1.96$), but cannot compute p-values from Z, Student's t, Chi-Square ($\chi^2$), or F statistics, nor perform 1-sample or 2-sample t-tests!
- **4. Target Audience:** University statistics, psychology, biology, economics, data science, and Six Sigma users.
- **5. Practical Benefit:** Computes exact CDF/p-values and critical values for Normal ($Z$), Student's $t$, $\chi^2$, Poisson, and $F$ distributions, plus 1-sample and 2-sample $t$-tests with confidence intervals at any $lpha$.
- **6. Inputs:** Mode (Distribution P-Value & Critical Value / 1-Sample t-Test / 2-Sample t-Test / Chi-Square Goodness-of-Fit), Test statistic or sample summary (x̄, s, n, μ₀), Degrees of freedom ν, Significance level α (0.01, 0.05, 0.10), Tail (Two-tailed / Left / Right).
- **7. Outputs:** Test Statistic (z, t, χ², F), p-value (two-tailed and one-tailed), Critical value(s), Confidence Interval at (1−α), Effect size (Cohen's d), and Plain-English statistical decision ('Reject H₀ at α = 0.05' vs 'Fail to reject H₀').
- **8. Formulas and Algorithms:** Lentz continued-fraction expansion of the regularized incomplete beta function $I_x(a, b)$ and incomplete gamma function $P(a, x)$ (gives 14-digit accuracy for Student's $t$, $F$, $\chi^2$, and Binomial CDFs in <50 lines of JS!) + Abramowitz & Stegun / Cody erf() for Normal CDF.
- **9. Concrete Worked Example:** Input: 1-Sample t-test with x̄ = 105, μ₀ = 100, s = 15, n = 25, α = 0.05 (two-tailed) → Output: t = 1.6667 (df = 24), two-tailed p = 0.1086, 95% CI = [98.81, 111.19] (Fail to reject H₀).
- **10. Existing Overlap:** Upgrades `z-score` and `confidence-interval` into a full inferential statistics suite.
- **11. Dependency Requirements:** Zero external dependencies (~60 lines of pure JS incomplete beta/gamma + erf functions).
- **12. Browser-Only Feasibility:** 100% browser-native.
- **13. Deterministic Engine:** Deterministic special-functions engine (`erf`, `incompleteBeta`, `incompleteGamma`).
- **14. Implementation Complexity:** Medium
- **15. Testing Requirements:** Benchmark against NIST StRD and R (`pt()`, `pnorm()`, `pchisq()`, `pf()`, `qt()`) to 10+ decimal places.
- **16. Priority:** **P0**
- **17. Estimated Effort:** 6 hours

### 4.13 ADV-13: NPV, IRR & XIRR Cash-Flow Valuation Calculator (`npv-irr-calculator`)
- **1. Calculator Name:** NPV, IRR & XIRR Cash-Flow Valuation Calculator (Route: `/tools/npv-irr-calculator/`)
- **2. Category:** Finance
- **3. User Problem:** Finance currently has `present-value`, `roi-calculator`, and `cagr-calculator` for a single cash flow, but lacks Net Present Value (NPV), Internal Rate of Return (IRR), and irregular-date XIRR for multi-period investments and capital budgeting.
- **4. Target Audience:** Finance students, MBA candidates, startup founders, real estate investors, and retail mutual-fund/SIP investors.
- **5. Practical Benefit:** Evaluates multi-year or date-stamped cash flows ($CF_0, CF_1, \dots, CF_n$) to compute NPV, IRR, XIRR, Payback Period, Discounted Payback Period, and Profitability Index.
- **6. Inputs:** Discount rate r (%), Initial investment CF₀ (negative), Dynamic cash-flow table (Period 1..N or Date + Cash Flow), Reinvestment rate (optional for MIRR).
- **7. Outputs:** Net Present Value (NPV), Internal Rate of Return (IRR %), Modified IRR (MIRR %), Payback Period (years), Discounted Payback Period, Profitability Index (PI), and Present Value breakdown per cash flow.
- **8. Formulas and Algorithms:** NPV = Σ CF_t / (1 + r)^t; IRR solved via Newton-Raphson + Brent/bisection fallback on NPV(r) = 0; XIRR uses exact day count (d_t − d_0)/365.
- **9. Concrete Worked Example:** Input: r = 10%, CF₀ = −10,000, CF₁ = 3,000, CF₂ = 4,000, CF₃ = 5,000, CF₄ = 3,000 → Output: NPV = +$1,838.67, IRR = 18.06%, Payback = 2.60 years, PI = 1.184.
- **10. Existing Overlap:** Extends `present-value` and `cagr-calculator` to multi-period cash flows.
- **11. Dependency Requirements:** Zero external dependencies.
- **12. Browser-Only Feasibility:** 100% browser-native.
- **13. Deterministic Engine:** Deterministic Newton-Raphson + bracketed bisection IRR/XIRR solver.
- **14. Implementation Complexity:** Medium
- **15. Testing Requirements:** Verify against Excel `NPV()`, `IRR()`, `MIRR()`, and `XIRR()` reference test cases, including non-conventional cash flows (multiple sign changes).
- **16. Priority:** **P0**
- **17. Estimated Effort:** 4.5 hours

### 4.14 ADV-14: Loan Amortization & Prepayment Schedule Calculator (`loan-amortization-prepayment-calculator`)
- **1. Calculator Name:** Loan Amortization & Prepayment Schedule Calculator (Route: `/tools/loan-amortization-prepayment-calculator/`)
- **2. Category:** Finance
- **3. User Problem:** The existing `emi-calculator` only shows 3 numbers (`Monthly EMI`, `Total paid`, `Total interest`). Borrowers need to see month-by-month principal vs. interest amortization and how much interest and tenure they save by making monthly or annual prepayments.
- **4. Target Audience:** Home mortgage, auto loan, and personal loan borrowers globally.
- **5. Practical Benefit:** Computes exact interest saved and months shaved off a loan from extra monthly payments, annual lump-sum prepayments, or EMI step-ups, with a full downloadable/collapsible yearly & monthly amortization schedule.
- **6. Inputs:** Loan amount P, Annual interest rate r (%), Tenure (years/months), Extra monthly prepayment, Annual lump-sum prepayment, One-time prepayment.
- **7. Outputs:** Baseline EMI vs. Effective Tenure, Total Interest Without Prepayment vs. With Prepayment, Total Interest Saved, Months/Years Saved, and Year-by-Year / Month-by-Month Amortization Schedule table.
- **8. Formulas and Algorithms:** Month-by-month iterative amortization loop: Interest_m = Balance_{m-1} × (r/1200), Principal_m = EMI − Interest_m + Extra_m, Balance_m = max(0, Balance_{m-1} − Principal_m).
- **9. Concrete Worked Example:** Input: P = 5,000,000, r = 8.5%, Tenure = 20 years (240 months), Extra monthly payment = 5,000 → Output: Base EMI = 43,391; Tenure reduced from 240 to 179 months (5 years 1 month saved); Total interest saved = 1,568,420.
- **10. Existing Overlap:** Can be deployed as a standalone tool or integrated directly into `/tools/emi-calculator/` as an expandable 'Prepayment & Amortization Schedule' mode.
- **11. Dependency Requirements:** Zero external dependencies.
- **12. Browser-Only Feasibility:** 100% browser-native.
- **13. Deterministic Engine:** Deterministic monthly cash-flow ledger engine.
- **14. Implementation Complexity:** Low–Medium
- **15. Testing Requirements:** Verify final month partial payment adjustment, zero-interest edge case, and match against bank amortization tables.
- **16. Priority:** **P1**
- **17. Estimated Effort:** 4 hours

### 4.15 ADV-15: Bitwise Operations, Two's Complement & IEEE-754 Float Inspector (`bitwise-ieee754-calculator`)
- **1. Calculator Name:** Bitwise Operations, Two's Complement & IEEE-754 Float Inspector (Route: `/tools/bitwise-ieee754-calculator/`)
- **2. Category:** Computing
- **3. User Problem:** Computer science and embedded systems engineers need bitwise operations (AND, OR, XOR, NOT, <<, >>, >>>), signed 8/16/32/64-bit Two's Complement representations, and IEEE-754 single/double-precision floating-point bit breakdowns (Sign, Exponent, Mantissa).
- **4. Target Audience:** Computer science students, systems/embedded programmers, and digital logic engineers.
- **5. Practical Benefit:** Provides interactive bit-toggling and instant simultaneous binary, hex, unsigned decimal, signed two's complement, and IEEE-754 float bit inspection.
- **6. Inputs:** Mode (Bitwise Operations & Two's Complement / IEEE-754 Float Inspector), Bit width (8-bit, 16-bit, 32-bit, 64-bit), Operand A, Operand B, Bitwise operator (AND, OR, XOR, NOT, NAND, NOR, SHL <<, SHR >>, ROR).
- **7. Outputs:** Result in Binary (grouped in nibbles), Hexadecimal, Signed Two's Complement Decimal, Unsigned Decimal; or in IEEE-754 mode: Sign bit, Biased/Unbiased Exponent, 23/52-bit Mantissa, Exact stored value, and Rounding representation error.
- **8. Formulas and Algorithms:** BigInt bitmasking `BigInt.asIntN(width, val)` and `BigInt.asUintN(width, val)`; `DataView` `setFloat32`/`setFloat64` for exact hardware IEEE-754 bit extraction.
- **9. Concrete Worked Example:** Input: IEEE-754 32-bit float for `0.1` → Output: Sign = 0 (+), Exponent = 01111011 (123 − 127 = −4), Mantissa = 10011001100110011001101₂, Stored value = 0.10000000149011612 (Error = +1.49e-9).
- **10. Existing Overlap:** Complements `number-base-converter` (which only converts unsigned/signed integers without bit-width or bitwise operators).
- **11. Dependency Requirements:** Zero external dependencies (native JS `BigInt`, `ArrayBuffer`, `DataView`).
- **12. Browser-Only Feasibility:** 100% browser-native.
- **13. Deterministic Engine:** Deterministic BigInt bitmask + DataView IEEE-754 engine.
- **14. Implementation Complexity:** Low–Medium
- **15. Testing Requirements:** Test Two's Complement overflow boundaries (-128..127 for 8-bit), IEEE-754 subnormals, ±0, ±Infinity, and NaN.
- **16. Priority:** **P1**
- **17. Estimated Effort:** 4 hours

### 4.16 ADV-16: IPv4 / IPv6 Subnet & CIDR Network Calculator (`subnet-calculator`)
- **1. Calculator Name:** IPv4 / IPv6 Subnet & CIDR Network Calculator (Route: `/tools/subnet-calculator/`)
- **2. Category:** Computing
- **3. User Problem:** Networking students, DevOps engineers, and sysadmins need CIDR subnet masks, network/broadcast addresses, usable host ranges, and wildcard masks—one of the highest-volume computing calculator queries on the web.
- **4. Target Audience:** Computer networking students, software/cloud engineers, and IT administrators.
- **5. Practical Benefit:** Instantly computes network address, broadcast address, usable IP range, total/usable hosts, netmask, wildcard mask, and binary IP breakdown for any IPv4 CIDR block.
- **6. Inputs:** IPv4 Address (e.g. `192.168.1.42`), Prefix / Subnet Mask selector (`/1` to `/32` or `255.255.255.0`).
- **7. Outputs:** Network Address, Broadcast Address, First Usable Host, Last Usable Host, Total Addresses (2^(32−p)), Usable Hosts (max(0, 2^(32−p) − 2), or 2 for /31 point-to-point RFC 3021), Subnet Mask, Wildcard Mask, IP Class/Private RFC 1918 status, and 32-bit Binary view.
- **8. Formulas and Algorithms:** 32-bit unsigned integer bitwise masking: `mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0`, `net = (ip & mask) >>> 0`, `bcast = (net | (~mask >>> 0)) >>> 0`.
- **9. Concrete Worked Example:** Input: 192.168.10.45 / 26 → Output: Network = 192.168.10.0, Broadcast = 192.168.10.63, Usable Range = 192.168.10.1 – 192.168.10.62, Usable Hosts = 62, Mask = 255.255.255.192.
- **10. Existing Overlap:** Zero overlap in current catalog; replaces the 4 misclassified physics/electronics tools in `Computing` with a core CS/networking tool.
- **11. Dependency Requirements:** Zero external dependencies.
- **12. Browser-Only Feasibility:** 100% browser-native.
- **13. Deterministic Engine:** Deterministic 32-bit bitwise network arithmetic.
- **14. Implementation Complexity:** Low
- **15. Testing Requirements:** Test `/32` single host, `/31` RFC 3021 point-to-point link, `/24`, `/8`, `/0`, and invalid octets > 255.
- **16. Priority:** **P1**
- **17. Estimated Effort:** 3 hours

