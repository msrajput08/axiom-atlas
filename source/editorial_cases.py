"""Human-curated benchmark examples for selected AxiomAtlas calculator guides.

Each case is an independent reproducible input, not a claim that every calculator
has been individually peer-reviewed. Maintain these cases with regression tests.
"""

EDITORIAL_CASES = {
    "kinetic-energy": {
        "purpose": "Estimate how much motion energy a moving object carries before comparing speed scenarios.",
        "inputs": "m = 10 kg; v = 6 m/s",
        "calculation": "KE = ½ × 10 × 6²",
        "result": "180 J",
        "check": "Doubling speed to 12 m/s gives 720 J (four times the original energy).",
        "limitation": "Applies to classical translational motion; near light speed use a relativistic model.",
    },
    "ohms-law": {
        "purpose": "Check the current drawn by a resistive load and the power that its electrical components must tolerate.",
        "inputs": "V = 12 V; R = 6 Ω",
        "calculation": "I = 12/6; P = 12²/6",
        "result": "I = 2 A; P = 24 W",
        "check": "The voltage drop checks out: I × R = 2 × 6 = 12 V.",
        "limitation": "For reactive AC circuits or temperature-dependent resistance, simple V/R is not a complete circuit model.",
    },
    "pythagorean-calculator": {
        "purpose": "Calculate a diagonal length, such as the straight brace across a rectangular frame.",
        "inputs": "a = 3 m; b = 4 m",
        "calculation": "c = √(3² + 4²)",
        "result": "5 m",
        "check": "The reverse test is 3² + 4² = 5² = 25.",
        "limitation": "This formula requires a right angle between the given sides; it does not solve general triangles.",
    },
    "compound-interest": {
        "purpose": "Compare savings growth under a fixed nominal annual interest rate with monthly compounding.",
        "inputs": "P = 10,000; annual rate = 8%; monthly compounding (n = 12); t = 5 years",
        "calculation": "A = 10,000 × (1 + 0.08/12)^(12 × 5)",
        "result": "14,898.457083 currency units",
        "check": "The earned interest is A − P = 4,898.457083 currency units.",
        "limitation": "This illustration assumes a constant rate, no withdrawals or fees, and excludes inflation and tax.",
    },
    "rlc-resonance-calculator": {
        "purpose": "Choose a starting resonance frequency for an ideal inductor-capacitor network before accounting for circuit losses.",
        "inputs": "L = 0.01 H; C = 0.00001 F",
        "calculation": "f₀ = 1 / (2π√(0.01 × 0.00001))",
        "result": "503.292121 Hz",
        "check": "The reciprocal period is about 1.987 ms.",
        "limitation": "Resistance affects damping and bandwidth; a real circuit's peak response may differ from ideal LC resonance.",
    },
    "schwarzschild-radius-calculator": {
        "purpose": "Estimate the event-horizon scale for a non-rotating compact object using an example solar mass.",
        "inputs": "M = 1.98847 × 10³⁰ kg; G = 6.67430 × 10⁻¹¹ SI; c = 299,792,458 m/s",
        "calculation": "Rₛ = 2GM/c²",
        "result": "2,953.339382 m (about 2.95 km)",
        "check": "Since Rₛ is proportional to M, doubling mass doubles this radius.",
        "limitation": "Assumes a non-rotating, uncharged Schwarzschild black hole; spinning or charged solutions differ.",
    },
    "lorentz-factor-calculator": {
        "purpose": "Quantify relativistic time dilation for a speed that is a substantial fraction of light speed.",
        "inputs": "v = 0.8c = 239,833,966.4 m/s",
        "calculation": "γ = 1 / √(1 − 0.8²)",
        "result": "γ = 1.666666667",
        "check": "At v = 0, γ = 1; as v approaches c from below, γ increases.",
        "limitation": "For a physical massive object, speed must remain below c; the calculator does not model acceleration.",
    },
    "gcd-calculator": {
        "purpose": "Find the largest equal-size group that divides two whole-number quantities without remainder.",
        "inputs": "a = 84; b = 30",
        "calculation": "84 = 2×30 + 24; 30 = 1×24 + 6; 24 = 4×6 + 0",
        "result": "GCD = 6",
        "check": "84/6 = 14 and 30/6 = 5 are both integers.",
        "limitation": "This is an integer algorithm; decimal inputs must be handled according to the tool's validation rules.",
    },
    "projectile-range": {
        "purpose": "Estimate an ideal projectile's ground-level horizontal range under uniform gravity.",
        "inputs": "Launch speed = 20 m/s; angle = 45°; g = 9.80665 m/s²",
        "calculation": "R = (20² × sin(90°)) / 9.80665",
        "result": "40.78864852 m",
        "check": "Under ideal level-ground motion, complementary launch angles produce the same range.",
        "limitation": "Assumes launch and landing elevations match, uniform gravity and no air resistance.",
    },
    "quadratic-equation": {
        "purpose": "Check a factorizable quadratic against the discriminant and two real roots.",
        "inputs": "a = 1; b = −5; c = 6",
        "calculation": "x² − 5x + 6 = (x − 2)(x − 3) = 0",
        "result": "x = 2 or x = 3",
        "check": "Substitution gives 4 − 10 + 6 = 0 and 9 − 15 + 6 = 0.",
        "limitation": "If a = 0 the expression is not quadratic; a negative discriminant requires complex roots.",
    },
    "normal-distribution-calculator": {
        "purpose": "Interpret the center of a standard normal curve, including density versus cumulative probability.",
        "inputs": "Mean μ = 0; standard deviation σ = 1; evaluation x = 0",
        "calculation": "f(0) = 1/√(2π); Φ(0) = 0.5",
        "result": "PDF = 0.3989422804; CDF = 0.5",
        "check": "By symmetry exactly half of a normal distribution lies below its mean.",
        "limitation": "Probability density is not probability at a point; the standard deviation must be positive.",
    },
}
