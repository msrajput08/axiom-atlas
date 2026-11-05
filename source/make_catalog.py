import json
from pathlib import Path
from collections import Counter

# ==============================================================================
# AXIOMATLAS 2.0 — MASTER 8-CATEGORY & SUBCATEGORY REGISTRY
# ==============================================================================
CATEGORIES = [
    {
        "name": "Mathematics",
        "slug": "mathematics",
        "icon": "hash",
        "glyph": "#",
        "description": "Arithmetic, number theory, fractions, percentages, ratios, exponents, sequences and combinatorics",
        "subcategories": [
            "Arithmetic",
            "Number Theory",
            "Numbers & Fractions",
            "Percentages",
            "Ratios & Proportions",
            "Exponents & Roots",
            "Sequences",
            "Combinatorics"
        ]
    },
    {
        "name": "Algebra",
        "slug": "algebra",
        "icon": "sigma",
        "glyph": "Σ",
        "description": "Equations, inequalities, polynomials, complex numbers, matrices, vectors and linear algebra decompositions",
        "subcategories": [
            "Basic Algebra",
            "Equations",
            "Inequalities",
            "Polynomials",
            "Matrices",
            "Vectors",
            "Linear Algebra",
            "Systems of Equations"
        ]
    },
    {
        "name": "Calculus & Graphing",
        "slug": "calculus-graphing",
        "icon": "chart",
        "glyph": "⌁",
        "description": "Limits, symbolic and numerical differentiation, single and multiple integration, ODEs, transforms, series and vector calculus",
        "subcategories": [
            "Limits",
            "Differentiation",
            "Integration",
            "Multivariable Calculus",
            "Differential Equations",
            "Fourier & Laplace Transforms",
            "Series & Convergence",
            "Function Graphing",
            "Numerical Methods",
            "Vector Calculus"
        ]
    },
    {
        "name": "Geometry & Trigonometry",
        "slug": "geometry-trigonometry",
        "icon": "shapes",
        "glyph": "⬡",
        "description": "2D plane shapes, 3D solids, complete triangle solving, trigonometric identities, coordinate geometry and mensuration",
        "subcategories": [
            "2D Geometry",
            "3D Geometry",
            "Triangles",
            "Trigonometry",
            "Coordinate Geometry",
            "Mensuration"
        ]
    },
    {
        "name": "Physics & Engineering",
        "slug": "physics-engineering",
        "icon": "atom",
        "glyph": "⚛",
        "description": "Mechanics, kinematics, rotational dynamics, AC/DC circuits, electronics, waves, optics, thermodynamics and fluid mechanics",
        "subcategories": [
            "Mechanics",
            "Kinematics",
            "Work & Energy",
            "Rotational Mechanics",
            "Electricity",
            "Electrical Circuits",
            "Electronics",
            "Electromagnetism",
            "Waves & Oscillations",
            "Optics",
            "Thermodynamics",
            "Fluid Mechanics",
            "Engineering Calculations"
        ]
    },
    {
        "name": "Statistics & Probability",
        "slug": "statistics-probability",
        "icon": "bars",
        "glyph": "▥",
        "description": "Descriptive statistics, probability distributions, hypothesis testing, ANOVA, regression, inference and Bayesian analysis",
        "subcategories": [
            "Descriptive Statistics",
            "Probability",
            "Probability Distributions",
            "Statistical Testing",
            "Regression",
            "Correlation",
            "Statistical Inference",
            "Bayesian Statistics"
        ]
    },
    {
        "name": "Finance",
        "slug": "finance",
        "icon": "wallet",
        "glyph": "₹",
        "description": "Simple and compound interest, loans, investments, NPV/IRR/XIRR valuation, bonds, options, portfolio risk and taxation",
        "subcategories": [
            "Interest",
            "Loans & EMI",
            "Investments",
            "Returns & Valuation",
            "Bonds",
            "Portfolio Analysis",
            "Taxation",
            "Financial Planning"
        ]
    },
    {
        "name": "Converters & Everyday Tools",
        "slug": "converters-everyday-tools",
        "icon": "arrows",
        "glyph": "⇄",
        "description": "Universal unit conversion, digital computing utilities, date & time arithmetic, academic planners and everyday life calculators",
        "subcategories": [
            "Unit Converters",
            "Computing Utilities",
            "Date & Time",
            "Academic Tools",
            "Daily Life Calculations"
        ]
    }
]

LEGACY_CATEGORY_REDIRECTS = {
    "math-numbers": "/categories/mathematics/",
    "algebra": "/categories/algebra/",
    "graphing-calculus": "/categories/calculus-graphing/",
    "geometry": "/categories/geometry-trigonometry/",
    "trigonometry": "/categories/geometry-trigonometry/",
    "physics": "/categories/physics-engineering/",
    "linear-algebra": "/categories/algebra/",
    "statistics": "/categories/statistics-probability/",
    "finance": "/categories/finance/",
    "converters": "/categories/converters-everyday-tools/",
    "computing": "/categories/converters-everyday-tools/",
    "education": "/categories/converters-everyday-tools/",
    "date-time": "/categories/converters-everyday-tools/",
    "everyday": "/categories/converters-everyday-tools/"
}

C = []

def parse_fields(fields_str):
    ins = []
    for x in fields_str.split(';'):
        if not x:
            continue
        p = x.split('|')
        ins.append({
            'key': p[0],
            'label': p[1],
            'default': p[2] if len(p) > 2 else '',
            'unit': p[3] if len(p) > 3 else ''
        })
    return ins

def parse_outputs(outputs_str):
    outs = []
    for x in outputs_str.split(';'):
        if not x:
            continue
        p = x.split('|')
        outs.append({
            'label': p[0],
            'expr': p[1],
            'unit': p[2] if len(p) > 2 else ''
        })
    return outs

def f(cat, subcat, slug, title, desc, fields, outputs, formula='', note='', keywords='', is_alias=False, canonical_slug='', default_mode=''):
    C.append({
        'category': cat,
        'subcategory': subcat,
        'slug': slug,
        'title': title,
        'description': desc,
        'type': 'formula',
        'fields': parse_fields(fields),
        'outputs': parse_outputs(outputs),
        'formula': formula,
        'note': note,
        'keywords': keywords,
        'isAlias': is_alias,
        'canonicalSlug': canonical_slug or slug,
        'defaultMode': default_mode
    })

def s(cat, subcat, slug, title, desc, typ, formula='', note='', keywords='', is_alias=False, canonical_slug='', default_mode=''):
    C.append({
        'category': cat,
        'subcategory': subcat,
        'slug': slug,
        'title': title,
        'description': desc,
        'type': typ,
        'fields': [],
        'outputs': [],
        'formula': formula,
        'note': note,
        'keywords': keywords,
        'isAlias': is_alias,
        'canonicalSlug': canonical_slug or slug,
        'defaultMode': default_mode
    })

def m(cat, subcat, slug, title, desc, modes, formula='', note='', keywords=''):
    parsed_modes = []
    for md in modes:
        parsed_modes.append({
            'id': md['id'],
            'label': md['label'],
            'formula': md.get('formula', ''),
            'note': md.get('note', ''),
            'fields': parse_fields(md['fields']),
            'outputs': parse_outputs(md['outputs'])
        })
    first = parsed_modes[0]
    C.append({
        'category': cat,
        'subcategory': subcat,
        'slug': slug,
        'title': title,
        'description': desc,
        'type': 'multimode',
        'modes': parsed_modes,
        'fields': first['fields'],
        'outputs': first['outputs'],
        'formula': formula or first['formula'],
        'note': note or first['note'],
        'keywords': keywords,
        'isAlias': False,
        'canonicalSlug': slug,
        'defaultMode': first['id']
    })

def alias_mode(cat, subcat, slug, title, desc, canonical_slug, default_mode, fields, outputs, formula='', note=''):
    f(cat, subcat, slug, title, desc, fields, outputs, formula, note, is_alias=True, canonical_slug=canonical_slug, default_mode=default_mode)

# ==============================================================================
# CATEGORY 1: MATHEMATICS
# Subcategories: Arithmetic, Number Theory, Numbers & Fractions, Percentages,
#                Ratios & Proportions, Exponents & Roots, Sequences, Combinatorics
# ==============================================================================
s('Mathematics', 'Arithmetic', 'scientific-calculator', 'Scientific Calculator',
  'Evaluate scientific expressions, trigonometry, inverse trig, roots, logarithms, factorials and constants with live math preview.',
  'scientific', 'PEMDAS expression parser with sin, cos, tan, asin, acos, atan, sec, csc, cot, ln, log, nthroot, fact, perm, comb.',
  'Supports Degrees and Radians, implicit multiplication x(x+1), and prefix radicals √9.', 'scientific expression PEMDAS trig log')

s('Mathematics', 'Numbers & Fractions', 'fraction-calculator', 'Fraction Calculator',
  'Add, subtract, multiply, divide and simplify proper, improper and mixed fractions exactly using BigInt.',
  'fraction', 'a/b ± c/d = (ad ± bc)/(bd), reduced via Euclidean GCD.',
  'Supports mixed numbers such as 1 3/4 as well as exact improper fractions.', 'fraction mixed number rational LCD')

s('Mathematics', 'Number Theory', 'prime-checker', 'Prime Number & Factorization Calculator',
  'Determine whether an integer is prime, compute its prime factorization, and list its positive divisors.',
  'prime', 'Trial division up to √n and prime power decomposition n = p₁^a₁ × … × p_k^a_k.',
  'Supports integers from 0 up to 10¹².', 'prime checker prime factors divisors composite')

s('Mathematics', 'Number Theory', 'random-number-generator', 'Random Number Generator',
  'Generate cryptographically unbiased random integers in a chosen interval.',
  'random', 'Rejection sampling over window.crypto.getRandomValues(Uint32Array).',
  'Eliminates modulo bias across arbitrary integer intervals.', 'random integer generator crypto rng')

# 1.3 Consolidated: Percentage Calculator
m('Mathematics', 'Percentages', 'percentage-calculator', 'Percentage Calculator',
  'Calculate percentage of a number, percentage change (increase/decrease), percentage difference, and percentage share in one tool.',
  [
      {'id': 'of', 'label': 'Percentage of a Number (P% of N)', 'fields': 'p|Percentage|15|%;n|Number|240',
       'outputs': 'Result|p*n/100;Increased value|n*(1+p/100);Decreased value|n*(1-p/100)', 'formula': 'Result = (p / 100) × n'},
      {'id': 'change', 'label': 'Percentage Change (Old → New)', 'fields': 'old|Original value|80;new|New value|100',
       'outputs': 'Change|new-old;Percent change|100*(new-old)/old|%', 'formula': 'Percent change = ((New − Old) / Old) × 100'},
      {'id': 'difference', 'label': 'Percentage Difference (|A − B| / Average)', 'fields': 'a|First value|64;b|Second value|80',
       'outputs': 'Difference|abs(a-b);Average|(abs(a)+abs(b))/2;Percent difference|200*abs(a-b)/(abs(a)+abs(b))|%', 'formula': 'Percent difference = |a − b| / ((|a| + |b|)/2) × 100'},
      {'id': 'what_pct', 'label': 'What % is X of Y?', 'fields': 'x|Part X|36;y|Whole Y|240',
       'outputs': 'Percentage|100*x/y|%;Ratio X/Y|x/y', 'formula': 'Percentage = (X / Y) × 100'}
  ],
  'P = (p/100)×n | Δ% = ((new−old)/old)×100 | Diff% = 200|a−b|/(|a|+|b|)',
  'Percentage Change requires a non-zero original value; Percentage Difference compares two peers symmetrically.',
  'percentage change percentage difference percent increase decrease')

alias_mode('Mathematics', 'Percentages', 'percent-change', 'Percentage Change Calculator',
           'Compare an old and a new value with percentage change.', 'percentage-calculator', 'change',
           'old|Original value|80;new|New value|100', 'Change|new-old;Percent change|100*(new-old)/old|%', '((new − old) / old) × 100')
alias_mode('Mathematics', 'Percentages', 'percent-difference', 'Percentage Difference Calculator',
           'Compare two values relative to their average.', 'percentage-calculator', 'difference',
           'a|First value|64;b|Second value|80', 'Difference|abs(a-b);Percent difference|200*abs(a-b)/(abs(a)+abs(b))|%', '|a − b| / ((|a|+|b|)/2) × 100')

# 1.3 Consolidated: Ratio & Proportion Calculator
m('Mathematics', 'Ratios & Proportions', 'ratio-proportion-calculator', 'Ratio & Proportion Calculator',
  'Simplify ratios, compute fractional percentage shares, and solve proportions a/b = c/x for any unknown term.',
  [
      {'id': 'ratio', 'label': 'Ratio & Part Shares (A : B)', 'fields': 'a|First part A|3;b|Second part B|5',
       'outputs': 'A/B|a/b;Simplified A|a/gcd(a,b);Simplified B|b/gcd(a,b);A share|100*a/(a+b)|%;B share|100*b/(a+b)|%', 'formula': 'A : B = (A/gcd) : (B/gcd); A share = A/(A+B)'},
      {'id': 'proportion', 'label': 'Solve Proportion (a / b = c / x)', 'fields': 'a|Numerator a|3;b|Denominator b|4;c|Numerator c|9',
       'outputs': 'Unknown x|b*c/a;Cross product (b × c)|b*c;Ratio value (a / b)|a/b', 'formula': 'a / b = c / x  ⇒  x = (b × c) / a'},
      {'id': 'scale', 'label': 'Scale Ratio to Total Sum', 'fields': 'a|Ratio part A|3;b|Ratio part B|5;total|Target total sum|240',
       'outputs': 'Allocated A|total*a/(a+b);Allocated B|total*b/(a+b)', 'formula': 'Allocated A = Total × A / (A + B)'}
  ],
  'a:b share = a/(a+b); Proportion x = b·c/a', '', 'ratio proportion cross multiply share')

alias_mode('Mathematics', 'Ratios & Proportions', 'ratio-calculator', 'Ratio Calculator',
           'Calculate a ratio and the share represented by each part.', 'ratio-proportion-calculator', 'ratio',
           'a|First part|3;b|Second part|5', 'A/B|a/b;A share|100*a/(a+b)|%;B share|100*b/(a+b)|%', 'a:b; A share = a/(a+b)')
alias_mode('Mathematics', 'Ratios & Proportions', 'proportion-calculator', 'Proportion Calculator',
           'Solve a/b = c/x for an unknown fourth value.', 'ratio-proportion-calculator', 'proportion',
           'a|a|3;b|b|4;c|c|9', 'x|b*c/a', 'a/b = c/x → x = bc/a')

# 1.3 Consolidated: Mean Calculator (Dynamic list of numbers)
s('Mathematics', 'Arithmetic', 'mean-calculator', 'Mean Calculator (Arithmetic, Geometric, Harmonic & RMS)',
  'Compute Arithmetic Mean, Geometric Mean, Harmonic Mean, and Root Mean Square (RMS) for a dynamic list of numbers.',
  'mean_suite', 'Arithmetic = (Σx)/n; Geometric = (Πx)^(1/n); Harmonic = n / Σ(1/x); RMS = √(Σx²/n)',
  'Accepts any list of comma- or space-separated numbers; Geometric and Harmonic means require positive values.',
  'arithmetic mean geometric mean harmonic mean average rms')

alias_mode('Mathematics', 'Arithmetic', 'arithmetic-mean', 'Arithmetic Mean Calculator',
           'Calculate the mean of values.', 'mean-calculator', 'arithmetic',
           'a|Number 1|10;b|Number 2|15;c|Number 3|25;d|Number 4|30', 'Mean|(a+b+c+d)/4;Sum|a+b+c+d', 'Mean = sum / count')
alias_mode('Mathematics', 'Arithmetic', 'geometric-mean', 'Geometric Mean Calculator',
           'Calculate the geometric mean of positive numbers.', 'mean-calculator', 'geometric',
           'a|Value 1|2;b|Value 2|8;c|Value 3|32', 'Geometric mean|(a*b*c)^(1/3)', '(a×b×c)^(1/3)', 'Inputs should be positive.')

f('Mathematics', 'Arithmetic', 'weighted-average', 'Weighted Average Calculator',
  'Find the weighted average using values and weights.',
  'a|Value 1|80;wa|Weight 1|2;b|Value 2|90;wb|Weight 2|3;c|Value 3|70;wc|Weight 3|1',
  'Weighted average|(a*wa+b*wb+c*wc)/(wa+wb+wc);Total weight|wa+wb+wc',
  'Σ(value × weight) / Σ(weight)', 'Sum of weights must be non-zero.', 'weighted average mean weights')

# 1.3 Consolidated: Number Theory Calculator (GCD, LCM, Modulo)
s('Mathematics', 'Number Theory', 'number-theory-calculator', 'Number Theory Calculator (GCD, LCM & Modulo)',
  'Calculate GCD and LCM of multiple integers, Bézout linear combinations, and Euclidean division quotient and remainder.',
  'number_theory', 'GCD via Euclidean algorithm; LCM(a,b) = |ab|/GCD(a,b); Euclidean division a = q·b + r with 0 ≤ r < |b|.',
  'Supports 2 or more integers and handles zero and negative integers under strict Euclidean conventions.',
  'gcd lcm greatest common divisor least common multiple modulo remainder bezout')

alias_mode('Mathematics', 'Number Theory', 'gcd-calculator', 'GCD Calculator',
           'Find the greatest common divisor of two integers.', 'number-theory-calculator', 'gcd',
           'a|First integer|84;b|Second integer|30', 'GCD|gcd(a,b);LCM|lcm(a,b)', 'Euclidean algorithm')
alias_mode('Mathematics', 'Number Theory', 'lcm-calculator', 'LCM Calculator',
           'Find the lowest common multiple of two integers.', 'number-theory-calculator', 'lcm',
           'a|First integer|12;b|Second integer|18', 'LCM|lcm(a,b);GCD|gcd(a,b)', 'LCM(a,b) = |ab|/GCD(a,b)')
f('Mathematics', 'Number Theory', 'modulo-calculator', 'Modulo Calculator',
  'Find the Euclidean remainder and quotient after division.',
  'a|Dividend|29;b|Divisor|6',
  'Remainder|mod(a,b);Quotient|(a-mod(a,b))/b',
  'a = q·b + r (0 ≤ r < |b|)', 'Satisfies the Euclidean division identity a = q·b + r for all positive and negative divisors b ≠ 0.',
  'modulo remainder euclidean division')

# 1.3 Consolidated: Exponents & Logarithms Calculator
m('Mathematics', 'Exponents & Roots', 'exponents-logarithms-calculator', 'Exponents, Roots & Logarithms Calculator',
  'Raise bases to any exponent, compute real nth roots (including odd roots of negative numbers), and evaluate logarithms to any base.',
  [
      {'id': 'power', 'label': 'Power & Exponent (a^b)', 'fields': 'a|Base a|2;b|Exponent b|8',
       'outputs': 'Result (a^b)|pow(a,b);Reciprocal (a^−b)|pow(a,-b)', 'formula': 'Result = a^b'},
      {'id': 'root', 'label': 'Nth Root (ⁿ√x)', 'fields': 'x|Radicand x|256;n|Root degree n|4',
       'outputs': 'Nth Root|nthroot(x,n);Verification (Root^n)|pow(nthroot(x,n),n)', 'formula': 'ⁿ√x = x^(1/n) (supports negative x for odd integer n)'},
      {'id': 'log', 'label': 'Logarithm (log_b x)', 'fields': 'x|Number x|1000;b|Base b|10',
       'outputs': 'Logarithm log_b(x)|log(x,b);Natural log ln(x)|ln(x);Common log log₁₀(x)|log10(x);Binary log log₂(x)|log2(x)', 'formula': 'log_b(x) = ln(x) / ln(b) (x > 0, b > 0, b ≠ 1)'}
  ],
  'a^b | ⁿ√x = nthroot(x, n) | log_b(x) = ln(x)/ln(b)',
  'Preserves strict domain checks: x > 0 and b > 0, b ≠ 1 for logarithms; even root degree n requires x ≥ 0.',
  'exponent power nth root radical logarithm ln log10 log2')

alias_mode('Mathematics', 'Exponents & Roots', 'power-calculator', 'Power & Exponent Calculator',
           'Raise a base to any power.', 'exponents-logarithms-calculator', 'power',
           'a|Base|2;b|Exponent|8', 'Result|pow(a,b)', 'a^b')
alias_mode('Mathematics', 'Exponents & Roots', 'nth-root', 'Nth Root Calculator',
           'Find the nth root of a number.', 'exponents-logarithms-calculator', 'root',
           'x|Number|256;n|Root degree|4', 'Root|nthroot(x,n)', 'x^(1/n). For even n, x must be nonnegative.')
alias_mode('Mathematics', 'Exponents & Roots', 'logarithm-calculator', 'Logarithm Calculator',
           'Calculate a logarithm with an arbitrary base.', 'exponents-logarithms-calculator', 'log',
           'x|Number|1000;b|Base|10', 'Logarithm|log(x)/log(b)', 'log_b(x) = ln(x) / ln(b)')

# 1.3 Consolidated: Sequence & Series Calculator
m('Mathematics', 'Sequences', 'sequence-series-calculator', 'Sequence & Series Calculator',
  'Calculate the nth term, finite partial sum, and infinite sum of Arithmetic and Geometric progressions.',
  [
      {'id': 'arithmetic', 'label': 'Arithmetic Sequence (AP)', 'fields': 'a|First term a₁|4;d|Common difference d|3;n|Term count n|12',
       'outputs': 'nth term (a_n)|a+(n-1)*d;Sum of n terms (S_n)|n*(2*a+(n-1)*d)/2;Mean of terms|a+(n-1)*d/2',
       'formula': 'a_n = a₁ + (n − 1)d;  S_n = (n/2)[2a₁ + (n − 1)d]'},
      {'id': 'geometric', 'label': 'Geometric Sequence (GP)', 'fields': 'a|First term a₁|2;r|Common ratio r|1.5;n|Term count n|8',
       'outputs': 'nth term (a_n)|a*r^(n-1);Sum of n terms (S_n)|a*(1-r^n)/(1-r)',
       'formula': 'a_n = a₁·r^(n−1);  S_n = a₁(1 − rⁿ)/(1 − r) (or n·a₁ if r = 1)'},
      {'id': 'infinite_gp', 'label': 'Infinite Geometric Series (|r| < 1)', 'fields': 'a|First term a₁|10;r|Common ratio r (abs(r) < 1)|0.5',
       'outputs': 'Infinite sum S_∞|a/(1-r);Second term a₂|a*r;Third term a₃|a*r^2',
       'formula': 'S_∞ = a₁ / (1 − r) for |r| < 1'}
  ],
  'AP: a_n = a+(n−1)d | GP: a_n = ar^(n−1), S_n = a(1−r^n)/(1−r)',
  'Number of terms n must be a positive integer.', 'arithmetic sequence geometric sequence progression series sum')

alias_mode('Mathematics', 'Sequences', 'arithmetic-sequence', 'Arithmetic Sequence Calculator',
           'Calculate the nth term and sum of an arithmetic progression.', 'sequence-series-calculator', 'arithmetic',
           'a|First term|4;d|Common difference|3;n|Term count|12', 'nth term|a+(n-1)*d;Sum|n*(2*a+(n-1)*d)/2', 'a_n = a+(n−1)d; S_n = n(2a+(n−1)d)/2')
alias_mode('Mathematics', 'Sequences', 'geometric-sequence', 'Geometric Sequence Calculator',
           'Calculate the nth term and finite sum of a geometric progression.', 'sequence-series-calculator', 'geometric',
           'a|First term|2;r|Common ratio|1.5;n|Term count|8', 'nth term|a*r^(n-1);Sum|a*(1-r^n)/(1-r)', 'a_n = ar^(n−1); S_n = a(1−r^n)/(1−r)')

# 1.3 Consolidated: Counting & Combinatorics Calculator
m('Mathematics', 'Combinatorics', 'combinatorics-calculator', 'Counting & Combinatorics Calculator',
  'Compute factorials (n!), ordered permutations P(n,r), unordered combinations C(n,r), and arrangements with repetition.',
  [
      {'id': 'combination', 'label': 'Combinations C(n, r) & Permutations P(n, r)', 'fields': 'n|Total items n|8;r|Items chosen r|3',
       'outputs': 'Combinations C(n, r)|comb(n,r);Permutations P(n, r)|perm(n,r);Combinations with repetition C(n+r−1, r)|comb(n+r-1,r);Permutations with repetition (n^r)|n^r',
       'formula': 'C(n,r) = n! / (r!(n−r)!);  P(n,r) = n! / (n−r)!'},
      {'id': 'factorial', 'label': 'Factorial (n!)', 'fields': 'n|Nonnegative integer n (0–170)|6',
       'outputs': 'Factorial n!|fact(n);Log₁₀(n!)|lgamma(n+1)/ln(10)',
       'formula': 'n! = n × (n − 1) × … × 1 (0! = 1)'},
      {'id': 'permutation', 'label': 'Permutations P(n, r)', 'fields': 'n|Total items n|8;r|Items selected r|3',
       'outputs': 'Permutations P(n, r)|perm(n,r);Combinations C(n, r)|comb(n,r)',
       'formula': 'P(n,r) = n! / (n − r)!'}
  ],
  'n! | P(n,r) = n!/(n−r)! | C(n,r) = n!/(r!(n−r)!)',
  'Requires nonnegative integers with 0 ≤ r ≤ n.', 'factorial permutation combination nCr nPr counting')

alias_mode('Mathematics', 'Combinatorics', 'factorial-calculator', 'Factorial Calculator',
           'Calculate factorial of a nonnegative integer.', 'combinatorics-calculator', 'factorial',
           'n|Nonnegative integer|6', 'Factorial|fact(n)', 'n! = n×(n−1)×…×1')
alias_mode('Mathematics', 'Combinatorics', 'permutation-calculator', 'Permutation Calculator',
           'Count ordered arrangements of r objects chosen from n.', 'combinatorics-calculator', 'permutation',
           'n|Total items n|8;r|Items selected r|3', 'Permutations|perm(n,r)', 'P(n,r) = n!/(n−r)!')
alias_mode('Mathematics', 'Combinatorics', 'combination-calculator', 'Combination Calculator',
           'Count ways to choose r items from n without ordering.', 'combinatorics-calculator', 'combination',
           'n|Total items n|8;r|Items selected r|3', 'Combinations|comb(n,r)', 'C(n,r) = n!/(r!(n−r)!)')

# ==============================================================================
# CATEGORY 2: ALGEBRA (including moved Linear Algebra)
# Subcategories: Basic Algebra, Equations, Inequalities, Polynomials,
#                Matrices, Vectors, Linear Algebra, Systems of Equations
# ==============================================================================
s('Algebra', 'Basic Algebra', 'expression-simplifier', 'Expression Evaluator & Simplifier',
  'Evaluate and simplify algebraic expressions with multi-variable substitution and live mathematical notation preview.',
  'expression', 'Symbolic simplification + numeric AST evaluation across detected variables.',
  'Automatically detects all variables (x, y, z, a, b) in your expression.', 'expression evaluator simplifier substitute variables')

f('Algebra', 'Basic Algebra', 'exponential-growth', 'Exponential Growth & Decay Calculator',
  'Model continuous and discrete exponential growth or decay over time.',
  'p|Initial value P₀|1000;r|Rate r (% per unit time)|5|%;t|Time elapsed t|3',
  'Continuous final value (P₀e^(rt))|p*e^(r*t/100);Continuous change|p*(e^(r*t/100)-1);Discrete final value (P₀(1+r)^t)|p*(1+r/100)^t',
  'Continuous: A = P₀ e^(rt); Discrete: A = P₀(1 + r)^t', '', 'exponential growth decay continuous compounding')

f('Algebra', 'Equations', 'linear-equation', 'Linear Equation Calculator',
  'Solve linear equations ax + b = c for x and find the x- and y-intercepts.',
  'a|Coefficient a|3;b|Constant b|5;c|Right-hand side c|20',
  'Solution x|(c-b)/a;Net constant (b − c)|b-c',
  'ax + b = c  ⇒  x = (c − b) / a', 'Requires non-zero coefficient a ≠ 0 for a unique solution.', 'linear equation solver ax+b=c')

s('Algebra', 'Equations', 'quadratic-equation', 'Quadratic Equation Solver',
  'Solve ax² + bx + c = 0 exactly for real or complex roots, discriminant, vertex and axis of symmetry.',
  'quadratic', 'x = (−b ± √(b² − 4ac)) / (2a) using numerically stable Citardauq formula.',
  'Computes complex conjugate roots when discriminant Δ < 0.', 'quadratic equation roots discriminant vertex')

s('Algebra', 'Equations', 'equation-solver', 'Equation Solver (Root Finder)',
  'Solve linear, polynomial and transcendental single-variable equations f(x) = g(x) numerically on any interval.',
  'equation', 'Combines sign-change bisection with golden-section local-minimum search to find both odd- and even-multiplicity real roots.',
  'Supports Degrees and Radians and live mathematical expression preview.', 'equation solver root finder bisection numerical roots')

s('Algebra', 'Basic Algebra', 'complex-number-calculator', 'Complex Number Calculator',
  'Add, subtract, multiply, divide, raise to powers, take roots, and convert complex numbers between rectangular (a + bi) and polar (r∠θ) forms.',
  'complex_calc', 'z₁ ± z₂, z₁·z₂, z₁/z₂, |z| = √(a²+b²), θ = atan2(b,a), De Moivre zⁿ = rⁿ e^(inθ).',
  'Includes rectangular, polar, and exponential forms.', 'complex numbers imaginary polar phasor argand de moivre')

s('Algebra', 'Inequalities', 'inequality-solver', 'Algebraic Inequality Solver',
  'Solve linear and quadratic inequalities (>, ≥, <, ≤) and express the solution set in interval notation.',
  'inequality_calc', 'Analyzes sign intervals around critical roots of ax + b ⋛ c and ax² + bx + c ⋛ 0.',
  'Displays exact interval notation and root boundary behavior.', 'inequality solver quadratic inequality interval notation')

f('Algebra', 'Polynomials', 'polynomial-evaluation', 'Polynomial Value & Derivative Calculator',
  'Evaluate a cubic polynomial P(x) = ax³ + bx² + cx + d and its first and second derivatives at any point x.',
  'a|Cubic coeff a (x³)|2;b|Quadratic coeff b (x²)|-3;c|Linear coeff c (x)|4;d|Constant term d|-7;x|Evaluation point x|2',
  'P(x)|a*x^3+b*x^2+c*x+d;First derivative P\'(x)|3*a*x^2+2*b*x+c;Second derivative P\'\'(x)|6*a*x+2*b',
  'P(x) = ax³ + bx² + cx + d; P\'(x) = 3ax² + 2bx + c', '', 'polynomial evaluation horner cubic')

s('Algebra', 'Polynomials', 'polynomial-solver', 'Polynomial Roots & Factoring Calculator',
  'Find real and complex roots, rational root candidates, factored form, and polynomial division for polynomials.',
  'poly_solver', 'Rational Root Theorem (±p/q) + Horner deflation + quadratic/cubic analytical & numerical root solver.',
  '', 'polynomial roots factoring synthetic division rational root theorem')

s('Algebra', 'Polynomials', 'partial-fractions-calculator', 'Partial Fraction Decomposition Calculator',
  'Decompose rational functions P(x)/Q(x) into partial fraction terms for distinct linear, repeated linear, or quadratic factors.',
  'partial_fractions', 'Heaviside residue method and linear coefficient matching via Gaussian elimination.',
  '', 'partial fractions decomposition rational function heaviside')

# Phase 2.4 Advanced Linear Algebra (inside Algebra category)
s('Algebra', 'Matrices', 'matrix-calculator', 'Matrix Calculator',
  'Add, subtract, multiply, transpose, invert, and find trace and determinant of 2×2, 3×3 and 4×4 matrices.',
  'matrix', 'Gauss-Jordan elimination with partial pivoting and 2D bracketed matrix display.',
  'Preserves matrix entries when switching dimensions or operations.', 'matrix addition multiplication inverse determinant transpose')

s('Algebra', 'Vectors', 'vector-calculator', 'Vector Calculator (2D & 3D)',
  'Compute dot products, cross products, magnitudes, unit vectors, projections, and inter-vector angle.',
  'vector', 'a·b = Σa_i b_i = |a||b|cos θ; a×b = (a_y b_z − a_z b_y, a_z b_x − a_x b_z, a_x b_y − a_y b_x).',
  '', 'vector dot product cross product magnitude angle unit vector')

s('Algebra', 'Systems of Equations', 'linear-system', 'Simultaneous Equation Solver',
  'Solve 2×2, 3×3 and 4×4 systems of linear equations Ax = b with step-by-step Gaussian elimination.',
  'system', 'Gaussian elimination with partial pivoting, distinguishing unique, inconsistent, and infinite solutions.',
  '', 'simultaneous equations linear system gaussian elimination cramer')

s('Algebra', 'Systems of Equations', 'system-of-linear-equations-solver', 'System of Linear Equations Solver (Ax = b)',
  'Solve linear systems Ax = b, compute determinant, RREF, Cramer determinants, and solution residual ||Ax − b||.',
  'system', 'Gauss-Jordan reduction with pivot tracking and residual verification.',
  '', 'system of linear equations Ax=b RREF residual')

s('Algebra', 'Linear Algebra', 'eigenvalues-eigenvectors-calculator', 'Eigenvalues & Eigenvectors Calculator',
  'Compute characteristic polynomial, real and complex eigenvalues, normalized eigenvectors, trace and determinant.',
  'linalg_eigen', 'det(A − λI) = 0; analytical 2×2 solver and shifted QR iteration + inverse iteration for 3×3 and 4×4 matrices.',
  '', 'eigenvalues eigenvectors characteristic polynomial spectral')

s('Algebra', 'Linear Algebra', 'lu-decomposition-calculator', 'LU Decomposition Calculator',
  'Factor a square matrix into PA = LU (Permutation P, Lower-triangular L, Upper-triangular U) with step-by-step pivot trace.',
  'linalg_lu', 'Gaussian elimination with partial pivoting PA = LU and Frobenius residual ||PA − LU||_F.',
  '', 'LU decomposition PLU factorization gaussian elimination')

s('Algebra', 'Linear Algebra', 'qr-decomposition-calculator', 'QR Decomposition Calculator',
  'Decompose a matrix A = QR into an orthogonal matrix Q and upper-triangular matrix R via Modified Gram-Schmidt.',
  'linalg_qr', 'Modified Gram-Schmidt orthogonalization A = QR with QᵀQ = I.',
  '', 'QR decomposition gram schmidt orthogonal matrix')

s('Algebra', 'Linear Algebra', 'svd-calculator', 'Singular Value Decomposition (SVD) Calculator',
  'Compute A = UΣVᵀ singular values σ_i, orthogonal matrices U and V, matrix rank, and condition number κ(A).',
  'linalg_svd', 'One-sided Jacobi symmetric eigenvalue decomposition of AᵀA for singular values σ_i = √λ_i(AᵀA).',
  '', 'SVD singular value decomposition condition number pseudoinverse')

s('Algebra', 'Linear Algebra', 'matrix-rank-nullity-calculator', 'Matrix Rank & Nullity Calculator',
  'Compute Reduced Row Echelon Form (RREF), pivot columns, matrix rank, nullity, and verify the Rank-Nullity Theorem.',
  'linalg_rank', 'Gauss-Jordan RREF reduction; rank(A) + nullity(A) = number of columns n.',
  '', 'matrix rank nullity RREF row echelon pivot columns')

s('Algebra', 'Linear Algebra', 'matrix-exponential-calculator', 'Matrix Exponential Calculator (e^A)',
  'Compute the matrix exponential e^A = Σ A^k / k! and verify Jacobi\'s identity det(e^A) = e^tr(A).',
  'linalg_exp', 'Scaling and squaring with Taylor/Padé approximation e^A = (e^(A/2^s))^(2^s).',
  '', 'matrix exponential exp(A) state transition matrix')

s('Algebra', 'Linear Algebra', 'least-squares-calculator', 'Least Squares Calculator (Ax ≈ b)',
  'Solve overdetermined linear systems Ax ≈ b via normal equations AᵀAx̂ = Aᵀb, reporting fitted values, residuals, RMSE and R².',
  'linalg_ols', 'x̂ = (AᵀA)⁻¹Aᵀb; residual r = b − Ax̂; RMSE = √(||r||²/m).',
  '', 'least squares linear regression normal equations overdetermined system')

# ==============================================================================
# CATEGORY 3: CALCULUS & GRAPHING
# Subcategories: Limits, Differentiation, Integration, Multivariable Calculus,
#                Differential Equations, Fourier & Laplace Transforms,
#                Series & Convergence, Function Graphing, Numerical Methods, Vector Calculus
# ==============================================================================
s('Calculus & Graphing', 'Function Graphing', 'graphing-calculator', 'Function Graphing Calculator',
  'Plot up to three functions y = f(x) interactively with pan, zoom, coordinate readout, and PNG export.',
  'graph', 'Adaptive Cartesian sampling with discontinuity detection and high-DPI canvas rendering.',
  '', 'function graphing plotter cartesian graph')

# 2.1 Limits
s('Calculus & Graphing', 'Limits', 'limit-calculator', 'Numerical Limit Calculator',
  'Estimate left-hand, right-hand, and two-sided limits lim_{x→a} f(x) with multi-step convergence and discontinuity detection.',
  'limit', 'Evaluates shrinking offsets h = 10⁻² … 10⁻⁶ from both sides and verifies |L⁻ − L⁺| convergence.',
  'Explicitly detects jump discontinuities and vertical asymptotes where the two-sided limit does not exist.',
  'limit calculator left hand right hand limit discontinuity')

s('Calculus & Graphing', 'Limits', 'multivariable-limit-calculator', 'Multivariable Limit Calculator',
  'Analyze 2D multivariable limits lim_{(x,y)→(x₀,y₀)} f(x, y) along linear paths y = m(x−x₀), parabolic paths, and polar rings.',
  'multivar_limit', 'Compares directional path limits along y−y₀ = m(x−x₀) (m = 0, ±1, ±2, ∞) and y−y₀ = (x−x₀)².',
  'If two paths yield different values, proves that the multivariable limit does not exist (DNE).',
  'multivariable limit two variable limit path dependence')

# 2.1 Differentiation (8 tools)
s('Calculus & Graphing', 'Differentiation', 'derivative-calculator', 'Derivative Calculator (Symbolic & Numerical)',
  'Compute exact symbolic derivatives f\'(x), evaluate numerical derivatives at x₀, and plot the function and tangent line.',
  'derivative', 'Symbolic AST differentiation (Power, Product, Quotient, Chain rules) + central finite difference & tangent plot.',
  'Detects non-differentiable corners/cusps such as |x| at x = 0.', 'derivative calculator symbolic differentiation tangent line')

s('Calculus & Graphing', 'Differentiation', 'symbolic-derivative-calculator', 'Symbolic Derivative Calculator',
  'Differentiate mathematical expressions symbolically step-by-step using power, product, quotient, and chain rules.',
  'derivative', 'Exact AST symbolic differentiation with rule-by-rule step trace, numerical point evaluation, and tangent plot.',
  '', 'symbolic derivative differentiation rules chain rule product rule')

s('Calculus & Graphing', 'Differentiation', 'higher-order-derivative-calculator', 'Higher-Order Derivative Calculator',
  'Compute 1st, 2nd, 3rd, and nth symbolic and numerical derivatives f⁽ⁿ⁾(x) with concavity and inflection analysis.',
  'higher_derivative', 'Iterated symbolic AST differentiation dⁿf/dxⁿ and high-order central finite-difference stencils.',
  '', 'higher order derivative second derivative third derivative concavity')

s('Calculus & Graphing', 'Differentiation', 'partial-derivative-calculator', 'Partial Derivative Calculator',
  'Compute symbolic and numerical first- and second-order partial derivatives ∂f/∂x, ∂f/∂y, ∂²f/∂x², ∂²f/∂y², and ∂²f/∂x∂y.',
  'partial_derivative', 'Symbolic partial differentiation holding orthogonal variables constant + Hessian evaluation.',
  '', 'partial derivative multivariable ∂f/∂x mixed partials')

s('Calculus & Graphing', 'Differentiation', 'implicit-differentiation-calculator', 'Implicit Differentiation Calculator',
  'Find dy/dx and d²y/dx² for implicit curves F(x, y) = 0 symbolically and at a given point (x₀, y₀).',
  'implicit_diff', 'Implicit Function Theorem: dy/dx = −(∂F/∂x) / (∂F/∂y) where ∂F/∂y ≠ 0.',
  '', 'implicit differentiation dy/dx implicit curve tangent')

s('Calculus & Graphing', 'Differentiation', 'parametric-differentiation-calculator', 'Parametric Differentiation Calculator',
  'Calculate first and second derivatives dy/dx and d²y/dx², speed ds/dt, and tangent slope for parametric curves x(t), y(t).',
  'parametric_diff', 'dy/dx = (dy/dt)/(dx/dt);  d²y/dx² = [x\'(t)y\'\'(t) − y\'(t)x\'\'(t)] / (x\'(t))³.',
  '', 'parametric derivative dx/dt dy/dt parametric curve')

s('Calculus & Graphing', 'Differentiation', 'logarithmic-differentiation-calculator', 'Logarithmic Differentiation Calculator',
  'Differentiate variable-exponent functions y = u(x)^v(x) and complex products via logarithmic differentiation d/dx[ln|y|].',
  'log_diff', 'ln|y| = v(x)·ln|u(x)|  ⇒  y\' = u(x)^v(x) · [v\'(x)·ln(u(x)) + v(x)·u\'(x)/u(x)].',
  '', 'logarithmic differentiation x^x variable exponent')

s('Calculus & Graphing', 'Multivariable Calculus', 'directional-derivative-calculator', 'Directional Derivative Calculator',
  'Compute the directional derivative D_u f(x, y, z) = ∇f · û in the direction of vector u and find maximum rate of change.',
  'directional_diff', 'D_u f = ∇f · (u / ||u||); maximum directional derivative equals ||∇f||.',
  '', 'directional derivative gradient unit vector rate of change')

s('Calculus & Graphing', 'Multivariable Calculus', 'gradient-calculator', 'Gradient & Hessian Calculator',
  'Compute the gradient vector ∇f(x, y, z), Hessian matrix H, and classify critical points (local min, max, or saddle point).',
  'gradient_calc', '∇f = (∂f/∂x, ∂f/∂y, ∂f/∂z); Second Derivative Test D = f_xx f_yy − (f_xy)².',
  '', 'gradient vector nabla hessian critical point saddle')

# 2.2 Integration (8 tools)
s('Calculus & Graphing', 'Integration', 'integral-calculator', 'Definite Integral Calculator',
  'Evaluate definite integrals ∫_a^b f(x) dx using symbolic antiderivatives (when available) and high-precision Simpson / Gauss-Legendre quadrature with area plot.',
  'integral', 'Fundamental Theorem of Calculus F(b) − F(a) + Composite Simpson & 160-point Gauss-Legendre quadrature.',
  'Verifies convergence and flags interior singularities.', 'definite integral area under curve simpson quadrature')

s('Calculus & Graphing', 'Integration', 'definite-integral-calculator', 'Definite Integral Calculator (Symbolic & Quadrature)',
  'Compute exact symbolic definite integrals and numerical quadrature approximations with shaded area visualization.',
  'integral', 'F(b) − F(a) symbolic evaluation + Simpson 1/3 and Gauss-Legendre verification.',
  '', 'definite integral calculator fundamental theorem of calculus')

s('Calculus & Graphing', 'Integration', 'indefinite-integral-calculator', 'Indefinite Integral (Antiderivative) Calculator',
  'Find symbolic indefinite integrals ∫ f(x) dx = F(x) + C and verify by differentiating F\'(x) = f(x).',
  'indefinite_integral', 'Symbolic antiderivative rule engine (Power, Exponential, Logarithmic, Trigonometric, Integration by Parts).',
  'Clearly distinguishes exact symbolic antiderivatives from non-elementary integrals.',
  'indefinite integral antiderivative symbolic integration')

s('Calculus & Graphing', 'Integration', 'double-integral-calculator', 'Double Integral Calculator',
  'Evaluate double integrals ∬_R f(x, y) dy dx over rectangular or variable-limit regions [a, b] × [g₁(x), g₂(x)].',
  'double_integral', '2D iterated 8×8 Gauss-Legendre cubature over general normal domains.',
  '', 'double integral 2D integral iterated integral volume under surface')

s('Calculus & Graphing', 'Integration', 'triple-integral-calculator', 'Triple Integral Calculator',
  'Evaluate triple integrals ∭_B f(x, y, z) dz dy dx over 3D rectangular regions [a,b] × [c,d] × [e,f].',
  'triple_integral', '3D tensor-product Gauss-Legendre cubature (512 nodes).',
  '', 'triple integral 3D volume integral hypervolume')

s('Calculus & Graphing', 'Integration', 'improper-integral-calculator', 'Improper Integral Calculator',
  'Evaluate improper integrals over infinite intervals [a, ∞), (−∞, ∞) or singular endpoints with strict convergence verification.',
  'improper_integral', 'Rational coordinate transformation x = a + t/(1−t) + p-exponent asymptotic tail & pole divergence test.',
  'Never returns a finite number for a divergent improper integral.',
  'improper integral infinite limits singularity convergence')

s('Calculus & Graphing', 'Integration', 'integration-by-parts-calculator', 'Integration by Parts Calculator',
  'Apply ∫ u dv = u·v − ∫ v du using the LIATE rule with symbolic step-by-step breakdown and definite evaluation.',
  'ibp_calculator', '∫ u dv = u·v − ∫ v du (LIATE priority: Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential).',
  '', 'integration by parts LIATE uv - integral v du')

s('Calculus & Graphing', 'Integration', 'trigonometric-integration-calculator', 'Trigonometric Integration Calculator',
  'Evaluate trigonometric integrals ∫ sin^m(ax) cos^n(ax) dx, ∫ tan^m(x) sec^n(x) dx, and product-to-sum integrals.',
  'trig_integral', 'Half-angle power reduction, Pythagorean substitution, and Wallis / reduction formulas.',
  '', 'trigonometric integral sin^m cos^n wallis formula')

s('Calculus & Graphing', 'Numerical Methods', 'numerical-integration-calculator', 'Numerical Integration Calculator (Trapezoidal, Simpson & Gauss)',
  'Compare Trapezoidal Rule, Simpson\'s 1/3 Rule, Simpson\'s 3/8 Rule, and Gauss-Legendre Quadrature side-by-side.',
  'num_integration', 'Trapezoidal O(h²), Simpson 1/3 O(h⁴), Simpson 3/8 O(h⁴), and 8-point composite Gauss-Legendre O(h¹⁶).',
  '', 'numerical integration trapezoidal rule simpson 1/3 3/8 gaussian quadrature')

# 2.3 Advanced Mathematical Analysis (Fourier, Laplace, Taylor, ODEs, Series, Vector Calculus)
s('Calculus & Graphing', 'Fourier & Laplace Transforms', 'fourier-series-calculator', 'Fourier Series Calculator',
  'Compute Fourier coefficients a₀, a_n, b_n for any periodic function f(x) of period T and plot the harmonic reconstruction.',
  'fourier_series', 'f(x) ≈ a₀/2 + Σ [a_n cos(nω₀x) + b_n sin(nω₀x)], ω₀ = 2π/T.',
  'Includes interactive Canvas comparing original f(x) against the N-harmonic partial sum.',
  'fourier series harmonics a0 an bn periodic waveform')

s('Calculus & Graphing', 'Fourier & Laplace Transforms', 'fourier-transform-calculator', 'Fourier Transform Calculator',
  'Compute symbolic Fourier Transform pairs F(ω) = ∫ f(t)e^(−iωt) dt and evaluate continuous magnitude and phase spectra.',
  'fourier_transform', 'F(ω) = ∫_{−∞}^{∞} f(t) e^(−iωt) dt (Symbolic transform table + numerical quadrature spectrum).',
  '', 'fourier transform frequency spectrum magnitude phase')

s('Calculus & Graphing', 'Fourier & Laplace Transforms', 'inverse-fourier-transform-calculator', 'Inverse Fourier Transform Calculator',
  'Compute Inverse Fourier Transforms f(t) = (1/2π) ∫ F(ω)e^(iωt) dω from frequency-domain expressions.',
  'inv_fourier_transform', 'f(t) = (1/(2π)) ∫_{−∞}^{∞} F(ω) e^(iωt) dω.',
  '', 'inverse fourier transform time domain reconstruction')

s('Calculus & Graphing', 'Fourier & Laplace Transforms', 'laplace-transform-calculator', 'Laplace Transform Calculator',
  'Compute unilateral Laplace transforms L{f(t)}(s) = ∫₀^∞ f(t)e^(−st) dt symbolically and numerically with Region of Convergence.',
  'laplace_transform', 'L{f(t)}(s) = ∫₀^∞ f(t) e^(−st) dt (Symbolic pattern matching + numerical s-domain quadrature).',
  '', 'laplace transform s-domain region of convergence ROC')

s('Calculus & Graphing', 'Fourier & Laplace Transforms', 'inverse-laplace-transform-calculator', 'Inverse Laplace Transform Calculator',
  'Compute Inverse Laplace Transforms L⁻¹{F(s)}(t) for rational transfer functions P(s)/Q(s) via partial fraction expansion.',
  'inv_laplace_transform', 'Residue / partial fraction expansion over real, repeated, and complex conjugate poles + time response plot.',
  '', 'inverse laplace transform transfer function impulse response poles')

s('Calculus & Graphing', 'Series & Convergence', 'taylor-series-calculator', 'Taylor Series Calculator',
  'Expand any smooth function f(x) into a degree-n Taylor polynomial around center x = a with remainder error and graph.',
  'taylor_series', 'P_n(x) = Σ_{k=0}^n [f⁽ᵏ⁾(a) / k!] (x − a)^k.',
  '', 'taylor series polynomial expansion remainder approximation')

s('Calculus & Graphing', 'Series & Convergence', 'maclaurin-series-calculator', 'Maclaurin Series Calculator',
  'Expand functions around a = 0 into Maclaurin polynomials P_n(x) = Σ f⁽ᵏ⁾(0) x^k / k! and compare against exact f(x).',
  'maclaurin_series', 'P_n(x) = f(0) + f\'(0)x + f\'\'(0)x²/2! + … + f⁽ⁿ⁾(0)xⁿ/n!.',
  '', 'maclaurin series power series expansion around zero')

s('Calculus & Graphing', 'Series & Convergence', 'series-convergence-calculator', 'Series Convergence Calculator',
  'Test infinite series Σ a_n for convergence using the Divergence Test, Ratio Test, Root Test, Integral Test, and partial sums.',
  'series_convergence', 'Ratio L = lim |a_{n+1}/a_n|; Root L = lim |a_n|^(1/n); p-series power estimation; partial sums S_10..S_1000.',
  '', 'series convergence ratio test root test p-series partial sum')

s('Calculus & Graphing', 'Differential Equations', 'differential-equation-solver', 'Differential Equation Solver (1st & 2nd Order ODEs)',
  'Solve first-order linear/separable ODEs and second-order constant-coefficient ODEs ay\'\' + by\' + cy = g(x) analytically and numerically.',
  'ode_general', 'Characteristic equation ar² + br + c = 0 (overdamped, critically damped, underdamped) + particular solution & RK4 plot.',
  'Clearly labels exact analytical closed-form solutions versus numerical RK4 trajectories.',
  'differential equation solver 2nd order ODE characteristic equation')

s('Calculus & Graphing', 'Differential Equations', 'ode-ivp-solver', 'ODE Initial Value Problem (IVP) Solver',
  'Solve dy/dx = f(x, y) with initial condition y(x₀) = y₀ using RK4, Heun, and Euler methods with a 2D direction field plot.',
  'ode_ivp', 'Classical 4th-order Runge-Kutta (RK4), Heun (RK2), and Euler step tables + slope field visualization.',
  '', 'ODE IVP initial value problem runge kutta RK4 euler slope field')

s('Calculus & Graphing', 'Differential Equations', 'ode-bvp-solver', 'ODE Boundary Value Problem (BVP) Solver',
  'Solve second-order boundary value problems y\'\' = p(x)y\' + q(x)y + r(x) with y(a) = α, y(b) = β via finite differences.',
  'ode_bvp', 'Second-order central finite-difference discretization solved via Thomas tridiagonal matrix algorithm.',
  '', 'ODE BVP boundary value problem finite difference thomas algorithm')

# Vector Calculus
s('Calculus & Graphing', 'Vector Calculus', 'jacobian-calculator', 'Jacobian Matrix & Determinant Calculator',
  'Compute the 2×2 or 3×3 Jacobian matrix J = ∂(f₁, f₂, …)/∂(x, y, …) and Jacobian determinant det(J) symbolically and numerically.',
  'jacobian_calc', 'J_{ij} = ∂f_i / ∂x_j;  det(J) local area/volume scaling factor.',
  '', 'jacobian matrix determinant coordinate transformation')

s('Calculus & Graphing', 'Vector Calculus', 'divergence-calculator', 'Divergence Calculator (∇ · F)',
  'Calculate the symbolic and numerical divergence ∇ · F = ∂F_x/∂x + ∂F_y/∂y + ∂F_z/∂z of a 3D vector field.',
  'divergence_calc', 'div(F) = ∇ · F = ∂F_x/∂x + ∂F_y/∂y + ∂F_z/∂z (checks solenoidal/incompressible condition ∇·F = 0).',
  '', 'divergence vector field nabla dot F solenoidal flux density')

s('Calculus & Graphing', 'Vector Calculus', 'curl-calculator', 'Curl Calculator (∇ × F)',
  'Calculate the symbolic and numerical 3D curl vector ∇ × F and test whether a vector field is conservative (irrotational).',
  'curl_calc', 'curl(F) = ∇ × F = (∂F_z/∂y − ∂F_y/∂z, ∂F_x/∂z − ∂F_z/∂x, ∂F_y/∂x − ∂F_x/∂y).',
  '', 'curl vector field nabla cross F rotation conservative irrotational')

s('Calculus & Graphing', 'Vector Calculus', 'line-integral-calculator', 'Line Integral Calculator',
  'Evaluate scalar line integrals ∫_C f(x,y,z) ds and vector work integrals ∫_C F · dr along a parameterized curve r(t).',
  'line_integral', 'Scalar: ∫_a^b f(r(t)) ||r\'(t)|| dt;  Vector Work: ∫_a^b F(r(t)) · r\'(t) dt.',
  '', 'line integral work integral curve parameterization path integral')

s('Calculus & Graphing', 'Vector Calculus', 'surface-integral-calculator', 'Surface Integral & Flux Calculator',
  'Evaluate scalar surface integrals ∬_S f(x,y,z) dS and vector flux ∬_S F · n dS over an explicit surface z = g(x, y).',
  'surface_integral', 'dS = √(1 + (∂g/∂x)² + (∂g/∂y)²) dx dy;  Upward normal flux dS_vec = (−∂g/∂x, −∂g/∂y, 1) dx dy.',
  '', 'surface integral flux integral surface area normal vector')

s('Calculus & Graphing', 'Numerical Methods', 'error-propagation-calculator', 'Error & Uncertainty Propagation Calculator',
  'Propagate measurement uncertainties (x ± Δx, y ± Δy, z ± Δz) through any formula f(x, y, z) using partial derivatives.',
  'error_prop', 'Δf = √[(∂f/∂x · Δx)² + (∂f/∂y · Δy)² + (∂f/∂z · Δz)²].',
  '', 'error propagation uncertainty analysis partial derivative variance')

# ==============================================================================
# CATEGORY 4: GEOMETRY & TRIGONOMETRY
# Subcategories: 2D Geometry, 3D Geometry, Triangles, Trigonometry,
#                Coordinate Geometry, Mensuration
# ==============================================================================

# 1.4 Consolidated: 2D Geometry Calculator
m('Geometry & Trigonometry', '2D Geometry', '2d-geometry-calculator', '2D Geometry Calculator (All Shapes)',
  'Calculate area, perimeter, circumference, diagonal, arc length, and interior angles for Circle, Square, Rectangle, Triangle, Trapezoid, Parallelogram, Ellipse, Polygon, and Sector.',
  [
      {'id': 'circle', 'label': 'Circle (Radius → Area, Circumference, Diameter)', 'fields': 'r|Radius r|7|m',
       'outputs': 'Area|pi*r^2|m²;Circumference|2*pi*r|m;Diameter|2*r|m', 'formula': 'A = πr²;  C = 2πr;  d = 2r'},
      {'id': 'square', 'label': 'Square (Side → Area, Perimeter, Diagonal)', 'fields': 's|Side length s|8|m',
       'outputs': 'Area|s^2|m²;Perimeter|4*s|m;Diagonal|s*sqrt(2)|m', 'formula': 'A = s²;  P = 4s;  d = s√2'},
      {'id': 'rectangle', 'label': 'Rectangle (Length & Width → Area, Perimeter, Diagonal)', 'fields': 'l|Length l|12|m;w|Width w|8|m',
       'outputs': 'Area|l*w|m²;Perimeter|2*(l+w)|m;Diagonal|sqrt(l^2+w^2)|m', 'formula': 'A = l·w;  P = 2(l + w);  d = √(l² + w²)'},
      {'id': 'triangle', 'label': 'Triangle (Base & Height → Area)', 'fields': 'b|Base b|12|m;h|Height h|7|m',
       'outputs': 'Area|b*h/2|m²', 'formula': 'A = ½ b·h'},
      {'id': 'trapezoid', 'label': 'Trapezoid (Parallel Bases & Height → Area, Median)', 'fields': 'a|Upper base a|6|m;b|Lower base b|12|m;h|Height h|5|m',
       'outputs': 'Area|(a+b)*h/2|m²;Midsegment (Median)|(a+b)/2|m', 'formula': 'A = ½(a + b)h;  m = ½(a + b)'},
      {'id': 'parallelogram', 'label': 'Parallelogram (Base, Height & Side → Area, Perimeter)', 'fields': 'b|Base b|10|m;h|Height h|6|m;s|Slant side s|7|m',
       'outputs': 'Area|b*h|m²;Perimeter|2*(b+s)|m;Interior acute angle|asin(h/s)*180/pi|°', 'formula': 'A = b·h;  P = 2(b + s) (requires h ≤ s)'},
      {'id': 'ellipse', 'label': 'Ellipse (Semimajor & Semiminor Axes → Area, Perimeter, Eccentricity)', 'fields': 'a|Semimajor axis a|8|m;b|Semiminor axis b|5|m',
       'outputs': 'Area|pi*a*b|m²;Perimeter (Ramanujan)|pi*(3*(a+b)-sqrt((3*a+b)*(a+3*b)))|m;Linear eccentricity c|sqrt(abs(a^2-b^2))|m;Eccentricity e|sqrt(abs(a^2-b^2))/max(a,b)', 'formula': 'A = πab;  P ≈ π[3(a+b) − √((3a+b)(a+3b))]'},
      {'id': 'polygon', 'label': 'Regular Polygon (n Sides & Side Length → Area, Perimeter, Angles)', 'fields': 'n|Number of sides n (≥ 3)|6;s|Side length s|5|m',
       'outputs': 'Area|n*s^2/(4*tan(pi/n))|m²;Perimeter|n*s|m;Apothem|s/(2*tan(pi/n))|m;Interior angle|(n-2)*180/n|°;Exterior angle|360/n|°', 'formula': 'A = n·s² / (4 tan(π/n));  P = n·s (n ≥ 3)'},
      {'id': 'sector', 'label': 'Circle Sector, Arc Length & Chord', 'fields': 'r|Radius r|10|m;angle|Central angle θ|60|°',
       'outputs': 'Sector area|pi*r^2*angle/360|m²;Arc length|2*pi*r*angle/360|m;Chord length|2*r*sin(angle*pi/360)|m;Segment area|r^2*(angle*pi/180-sin(angle*pi/180))/2|m²', 'formula': 'A_sector = πr²(θ/360°);  s = 2πr(θ/360°);  c = 2r sin(θ/2)'}
  ],
  'Comprehensive 2D Euclidean mensuration suite with positive dimension & feasibility validation.',
  'Select any 2D shape above; inputs and formulas update dynamically.',
  '2d geometry area perimeter circle square rectangle triangle trapezoid parallelogram ellipse polygon sector')

# Aliases for 2D Geometry
alias_mode('Geometry & Trigonometry', '2D Geometry', 'rectangle-calculator', 'Rectangle Calculator',
           'Find area, perimeter and diagonal of a rectangle.', '2d-geometry-calculator', 'rectangle',
           'l|Length|12|m;w|Width|8|m', 'Area|l*w|m²;Perimeter|2*(l+w)|m;Diagonal|sqrt(l^2+w^2)|m', 'A = lw; P = 2(l+w)')
alias_mode('Geometry & Trigonometry', '2D Geometry', 'square-calculator', 'Square Calculator',
           'Calculate square area, perimeter and diagonal.', '2d-geometry-calculator', 'square',
           's|Side|8|m', 'Area|s^2|m²;Perimeter|4*s|m;Diagonal|s*sqrt(2)|m', 'A=s²; P=4s; d=s√2')
alias_mode('Geometry & Trigonometry', '2D Geometry', 'triangle-calculator', 'Triangle Area Calculator',
           'Find the area of a triangle from base and height.', '2d-geometry-calculator', 'triangle',
           'b|Base|12|m;h|Height|7|m', 'Area|b*h/2|m²', 'A = ½bh')
alias_mode('Geometry & Trigonometry', '2D Geometry', 'circle-calculator', 'Circle Calculator',
           'Find area and circumference from radius.', '2d-geometry-calculator', 'circle',
           'r|Radius|7|m', 'Area|pi*r^2|m²;Circumference|2*pi*r|m;Diameter|2*r|m', 'A=πr²; C=2πr')
alias_mode('Geometry & Trigonometry', '2D Geometry', 'ellipse-calculator', 'Ellipse Calculator',
           'Calculate area and approximate perimeter of an ellipse.', '2d-geometry-calculator', 'ellipse',
           'a|Semimajor axis|8|m;b|Semiminor axis|5|m', 'Area|pi*a*b|m²;Perimeter estimate|pi*(3*(a+b)-sqrt((3*a+b)*(a+3*b)))|m', 'Area = πab; perimeter uses Ramanujan approximation.')
alias_mode('Geometry & Trigonometry', '2D Geometry', 'trapezoid-calculator', 'Trapezoid Area Calculator',
           'Calculate trapezoid area from parallel sides and height.', '2d-geometry-calculator', 'trapezoid',
           'a|Upper base|6|m;b|Lower base|12|m;h|Height|5|m', 'Area|(a+b)*h/2|m²', 'A = (a+b)h/2')
alias_mode('Geometry & Trigonometry', '2D Geometry', 'parallelogram-calculator', 'Parallelogram Area Calculator',
           'Find area and perimeter of a parallelogram.', '2d-geometry-calculator', 'parallelogram',
           'b|Base|10|m;h|Height|6|m;s|Other side|7|m', 'Area|b*h|m²;Perimeter|2*(b+s)|m', 'A = bh; P = 2(b+s)')
alias_mode('Geometry & Trigonometry', '2D Geometry', 'sector-calculator', 'Circle Sector Calculator',
           'Calculate sector area and arc length in degrees.', '2d-geometry-calculator', 'sector',
           'r|Radius|10|m;angle|Central angle|60|°', 'Sector area|pi*r^2*angle/360|m²;Arc length|2*pi*r*angle/360|m', 'A = πr²θ/360; arc = 2πrθ/360')
alias_mode('Geometry & Trigonometry', '2D Geometry', 'regular-polygon', 'Regular Polygon Calculator',
           'Find area and perimeter of a regular polygon.', '2d-geometry-calculator', 'polygon',
           'n|Number of sides|6;s|Side length|5|m', 'Perimeter|n*s|m;Area|n*s^2/(4*tan(pi/n))|m²', 'A = ns²/(4tan(π/n)), n≥3')

# 1.4 Consolidated: 3D Geometry Calculator
m('Geometry & Trigonometry', '3D Geometry', '3d-geometry-calculator', '3D Geometry Calculator (Solids Volume & Surface Area)',
  'Compute volume, total surface area, lateral area, and space diagonals for Cube, Sphere, Cylinder, Cone, Rectangular Prism, Pyramid, and Torus.',
  [
      {'id': 'cube', 'label': 'Cube (Side a)', 'fields': 'a|Side length a|6|m',
       'outputs': 'Volume|a^3|m³;Surface area|6*a^2|m²;Space diagonal|a*sqrt(3)|m;Face diagonal|a*sqrt(2)|m', 'formula': 'V = a³;  A = 6a²;  d = a√3'},
      {'id': 'sphere', 'label': 'Sphere (Radius r)', 'fields': 'r|Radius r|5|m',
       'outputs': 'Volume|4*pi*r^3/3|m³;Surface area|4*pi*r^2|m²;Diameter|2*r|m', 'formula': 'V = (4/3)πr³;  A = 4πr²'},
      {'id': 'cylinder', 'label': 'Cylinder (Radius r & Height h)', 'fields': 'r|Radius r|4|m;h|Height h|10|m',
       'outputs': 'Volume|pi*r^2*h|m³;Total surface area|2*pi*r*(r+h)|m²;Lateral surface area|2*pi*r*h|m²;Base area|pi*r^2|m²', 'formula': 'V = πr²h;  A_total = 2πr(r + h);  A_lat = 2πrh'},
      {'id': 'cone', 'label': 'Right Circular Cone (Radius r & Height h)', 'fields': 'r|Radius r|3|m;h|Height h|8|m',
       'outputs': 'Volume|pi*r^2*h/3|m³;Slant height l|sqrt(r^2+h^2)|m;Total surface area|pi*r*(r+sqrt(r^2+h^2))|m²;Lateral surface area|pi*r*sqrt(r^2+h^2)|m²', 'formula': 'V = (1/3)πr²h;  l = √(r² + h²);  A = πr(r + l)'},
      {'id': 'prism', 'label': 'Rectangular Prism / Cuboid (l × w × h)', 'fields': 'l|Length l|8|m;w|Width w|4|m;h|Height h|3|m',
       'outputs': 'Volume|l*w*h|m³;Total surface area|2*(l*w+l*h+w*h)|m²;Space diagonal|sqrt(l^2+w^2+h^2)|m', 'formula': 'V = l·w·h;  A = 2(lw + lh + wh);  d = √(l² + w² + h²)'},
      {'id': 'pyramid', 'label': 'Square Pyramid (Base Side s & Height h)', 'fields': 's|Base side s|6|m;h|Vertical height h|8|m',
       'outputs': 'Volume|s^2*h/3|m³;Total surface area|s^2+2*s*sqrt(h^2+s^2/4)|m²;Slant height|sqrt(h^2+s^2/4)|m;Base area|s^2|m²', 'formula': 'V = (1/3)s²h;  A = s² + 2s√(h² + s²/4)'},
      {'id': 'torus', 'label': 'Ring Torus (Tube Radius r & Major Radius R)', 'fields': 'r|Tube radius r|2|m;R|Major radius R (R > r)|6|m',
       'outputs': 'Volume|2*pi^2*R*r^2|m³;Surface area|4*pi^2*R*r|m²;Outer radius (R + r)|R+r|m;Inner hole radius (R − r)|R-r|m', 'formula': 'V = 2π²Rr²;  A = 4π²Rr (requires R > r)'}
  ],
  'Complete 3D solid mensuration suite.',
  'All dimensions must be positive; Torus requires Major Radius R > Tube Radius r.',
  '3d geometry volume surface area cube sphere cylinder cone cuboid prism pyramid torus')

alias_mode('Geometry & Trigonometry', '3D Geometry', 'cube-calculator', 'Cube Calculator',
           'Find cube volume, surface area and space diagonal.', '3d-geometry-calculator', 'cube',
           'a|Side|6|m', 'Volume|a^3|m³;Surface area|6*a^2|m²;Space diagonal|a*sqrt(3)|m', 'V=a³; A=6a²')
alias_mode('Geometry & Trigonometry', '3D Geometry', 'cuboid-calculator', 'Rectangular Prism Calculator',
           'Calculate volume, surface area and diagonal of a box.', '3d-geometry-calculator', 'prism',
           'l|Length|8|m;w|Width|4|m;h|Height|3|m', 'Volume|l*w*h|m³;Surface area|2*(l*w+l*h+w*h)|m²;Diagonal|sqrt(l^2+w^2+h^2)|m', 'V=lwh; A=2(lw+lh+wh)')
alias_mode('Geometry & Trigonometry', '3D Geometry', 'sphere-calculator', 'Sphere Calculator',
           'Compute sphere volume and surface area.', '3d-geometry-calculator', 'sphere',
           'r|Radius|5|m', 'Volume|4*pi*r^3/3|m³;Surface area|4*pi*r^2|m²', 'V = 4πr³/3; A=4πr²')
alias_mode('Geometry & Trigonometry', '3D Geometry', 'cylinder-calculator', 'Cylinder Calculator',
           'Calculate cylinder volume and total surface area.', '3d-geometry-calculator', 'cylinder',
           'r|Radius|4|m;h|Height|10|m', 'Volume|pi*r^2*h|m³;Surface area|2*pi*r*(r+h)|m²', 'V=πr²h; A=2πr(r+h)')
alias_mode('Geometry & Trigonometry', '3D Geometry', 'cone-calculator', 'Cone Calculator',
           'Calculate cone volume, slant height and total area.', '3d-geometry-calculator', 'cone',
           'r|Radius|3|m;h|Height|8|m', 'Volume|pi*r^2*h/3|m³;Slant height|sqrt(r^2+h^2)|m;Surface area|pi*r*(r+sqrt(r^2+h^2))|m²', 'V=πr²h/3; A=πr(r+l)')
alias_mode('Geometry & Trigonometry', '3D Geometry', 'pyramid-calculator', 'Square Pyramid Calculator',
           'Find volume and total surface area of a square pyramid.', '3d-geometry-calculator', 'pyramid',
           's|Base side|6|m;h|Vertical height|8|m', 'Volume|s^2*h/3|m³;Surface area|s^2+2*s*sqrt(h^2+s^2/4)|m²', 'V=s²h/3; A=s²+2sl')
alias_mode('Geometry & Trigonometry', '3D Geometry', 'torus-calculator', 'Torus Calculator',
           'Compute a torus volume and surface area.', '3d-geometry-calculator', 'torus',
           'r|Tube radius|2|m;R|Major radius|6|m', 'Volume|2*pi^2*R*r^2|m³;Surface area|4*pi^2*R*r|m²', 'V=2π²Rr²; A=4π²Rr')

# 1.4 Consolidated: Triangle & Trigonometry Solver
s('Geometry & Trigonometry', 'Triangles', 'triangle-trigonometry-solver', 'Triangle & Trigonometry Solver',
  'Solve any triangle (SSS, SAS, ASA, AAS, SSA ambiguous case), Pythagorean right triangles, Sine/Cosine rules, Heron\'s formula, and all 6 trig & inverse trig ratios.',
  'triangle_trig_suite', 'Law of Sines a/sin A = b/sin B = c/sin C; Law of Cosines c² = a²+b²−2ab cos C; Heron A = √(s(s−a)(s−b)(s−c)).',
  'Validates triangle existence and explicitly displays both solutions when SSA produces two valid triangles.',
  'triangle solver SSS SAS ASA AAS SSA law of sines cosines pythagorean heron trig')

s('Geometry & Trigonometry', 'Trigonometry', 'trigonometry-calculator', 'Trigonometry Calculator (Forward & Inverse Ratios)',
  'Compute sin, cos, tan, cot, sec, csc and inverse trig functions (arcsin, arccos, arctan) in Degrees or Radians.',
  'trig', 'Forward ratios sin, cos, tan, cot, sec, csc and inverse functions sin⁻¹, cos⁻¹, tan⁻¹.',
  'Angles can be in Degrees or Radians; exact asymptotes are guarded.',
  'trigonometry sin cos tan cot sec csc arcsin arccos arctan',
  is_alias=True, canonical_slug='triangle-trigonometry-solver', default_mode='trig_ratios')

alias_mode('Geometry & Trigonometry', 'Triangles', 'pythagorean-calculator', 'Pythagorean Theorem Calculator',
           'Find the hypotenuse or missing leg of a right triangle.', 'triangle-trigonometry-solver', 'pythagorean',
           'a|Leg a|3|m;b|Leg b|4|m', 'Hypotenuse|sqrt(a^2+b^2)|m;Area|a*b/2|m²;Perimeter|a+b+sqrt(a^2+b^2)|m', 'c = √(a²+b²)')
alias_mode('Geometry & Trigonometry', 'Triangles', 'herons-formula', 'Heron’s Formula Calculator',
           'Find triangle area, inradius, circumradius and angles from three side lengths.', 'triangle-trigonometry-solver', 'heron',
           'a|Side a|5|m;b|Side b|6|m;c|Side c|7|m', 'Semiperimeter|(a+b+c)/2|m;Area|sqrt(((a+b+c)/2)*((a+b+c)/2-a)*((a+b+c)/2-b)*((a+b+c)/2-c))|m²', 'A = √(s(s−a)(s−b)(s−c))')
alias_mode('Geometry & Trigonometry', 'Triangles', 'law-of-cosines', 'Law of Cosines Calculator',
           'Calculate the third side or unknown angles of a triangle using the Law of Cosines.', 'triangle-trigonometry-solver', 'cosine_rule',
           'a|Side a|7|m;b|Side b|9|m;C|Included angle|60|°', 'Opposite side c|sqrt(a^2+b^2-2*a*b*cos(C*pi/180))|m', 'c² = a²+b²−2ab cos(C)')
alias_mode('Geometry & Trigonometry', 'Triangles', 'law-of-sines', 'Law of Sines Calculator',
           'Find unknown triangle sides or angles using the Law of Sines.', 'triangle-trigonometry-solver', 'sine_rule',
           'a|Known side a|7|m;A|Angle A|30|°;B|Angle B|45|°', 'Side b|a*sin(B*pi/180)/sin(A*pi/180)|m', 'a/sin(A) = b/sin(B)')
f('Geometry & Trigonometry', 'Mensuration', 'arc-length', 'Arc Length & Circular Mensuration Calculator',
  'Find circular arc length, sector area, chord length, and segment area from radius and central angle.',
  'r|Radius|7|m;angle|Central angle|90|°',
  'Arc length|r*pi*angle/180|m;Sector area|pi*r^2*angle/360|m²;Chord length|2*r*sin(angle*pi/360)|m;Segment area|r^2*(angle*pi/180-sin(angle*pi/180))/2|m²',
  's = r·θ (θ in rad);  A_sector = ½r²θ;  c = 2r·sin(θ/2)',
  'Requires radius r > 0 and central angle 0° < θ ≤ 360°.',
  'arc length calculator circular mensuration sector chord segment')

f('Geometry & Trigonometry', 'Trigonometry', 'degree-radian', 'Angle & Degree-Radian Converter',
  'Convert angles between degrees, radians, turns, gradians, arcminutes and arcseconds.',
  'd|Angle in degrees|180|°',
  'Radians|d*pi/180|rad;Turns|d/360|turn;Gradians|d*200/180|grad;Arcminutes|d*60|arcmin',
  'radians = degrees × π / 180;  turns = degrees / 360', '', 'degree to radian converter turns gradians angle')

# Coordinate Geometry
f('Geometry & Trigonometry', 'Coordinate Geometry', 'slope-calculator', 'Slope, Distance & Midpoint Calculator',
  'Find the slope, rise/run, inclination angle, distance and midpoint between two 2D points (x₁, y₁) and (x₂, y₂).',
  'x1|Point 1 x₁|2;y1|Point 1 y₁|3;x2|Point 2 x₂|6;y2|Point 2 y₂|11',
  'Slope|(y2-y1)/(x2-x1);Rise|y2-y1;Run|x2-x1;Distance|sqrt((x2-x1)^2+(y2-y1)^2);Midpoint x|(x1+x2)/2;Midpoint y|(y1+y2)/2;Angle|atan2(y2-y1,x2-x1)*180/pi|°',
  'm = (y₂−y₁)/(x₂−x₁);  d = √((x₂−x₁)²+(y₂−y₁)²);  M = ((x₁+x₂)/2, (y₁+y₂)/2)',
  'If x₁ = x₂, the line is vertical and the slope is undefined.', 'slope calculator rise over run coordinate geometry')

f('Geometry & Trigonometry', 'Coordinate Geometry', 'midpoint-calculator', 'Midpoint Calculator',
  'Calculate the midpoint, distance and slope of a line segment between (x₁, y₁) and (x₂, y₂).',
  'x1|x₁|2;y1|y₁|6;x2|x₂|8;y2|y₂|10',
  'Midpoint x|(x1+x2)/2;Midpoint y|(y1+y2)/2;Distance|sqrt((x2-x1)^2+(y2-y1)^2)',
  'M = ((x₁+x₂)/2, (y₁+y₂)/2)', '', 'midpoint calculator line segment')

f('Geometry & Trigonometry', 'Coordinate Geometry', 'distance-between-points', '2D Distance Calculator',
  'Find the Euclidean distance and midpoint between two coordinate points (x₁, y₁) and (x₂, y₂).',
  'x1|x₁|2;y1|y₁|1;x2|x₂|8;y2|y₂|9',
  'Distance|sqrt((x2-x1)^2+(y2-y1)^2);Horizontal Δx|x2-x1;Vertical Δy|y2-y1;Midpoint x|(x1+x2)/2;Midpoint y|(y1+y2)/2',
  'd = √((x₂−x₁)² + (y₂−y₁)²)', '', '2d distance calculator euclidean distance between points')

# ==============================================================================
# CATEGORY 5: PHYSICS & ENGINEERING
# Subcategories: Mechanics, Kinematics, Work & Energy, Rotational Mechanics,
#                Electricity, Electrical Circuits, Electronics, Electromagnetism,
#                Waves & Oscillations, Optics, Thermodynamics, Fluid Mechanics,
#                Engineering Calculations
# ==============================================================================

# 1.5 Consolidated: Universal Motion Calculator
m('Physics & Engineering', 'Kinematics', 'universal-motion-calculator', 'Universal Motion Calculator (Speed, Distance & Time)',
  'Solve uniform motion problems for Speed (v = d/t), Distance (d = v × t), or Time (t = d/v) with multi-unit conversions.',
  [
      {'id': 'speed', 'label': 'Find Speed (v = d / t)', 'fields': 'd|Distance d|150|m;t|Time elapsed t|12|s',
       'outputs': 'Speed (m/s)|d/t|m/s;Speed (km/h)|3.6*d/t|km/h;Speed (mph)|2.23693629*d/t|mph', 'formula': 'v = d / t'},
      {'id': 'distance', 'label': 'Find Distance (d = v × t)', 'fields': 'v|Speed v|16|m/s;t|Time elapsed t|30|s',
       'outputs': 'Distance (m)|v*t|m;Distance (km)|v*t/1000|km', 'formula': 'd = v × t'},
      {'id': 'time', 'label': 'Find Time (t = d / v)', 'fields': 'd|Distance d|480|m;v|Speed v|16|m/s',
       'outputs': 'Time (seconds)|d/v|s;Time (minutes)|d/(v*60)|min;Time (hours)|d/(v*3600)|h', 'formula': 't = d / v'}
  ],
  'v = d / t  |  d = v × t  |  t = d / v',
  'Uniform motion model assuming constant speed.',
  'speed calculator distance calculator time calculator uniform motion')

alias_mode('Physics & Engineering', 'Kinematics', 'speed-calculator', 'Speed Calculator',
           'Find average speed from distance and elapsed time.', 'universal-motion-calculator', 'speed',
           'd|Distance|150|m;t|Time|12|s', 'Speed|d/t|m/s;Speed km/h|3.6*d/t|km/h', 'v=d/t')
alias_mode('Physics & Engineering', 'Kinematics', 'distance-calculator', 'Distance Calculator',
           'Calculate distance traveled at constant speed.', 'universal-motion-calculator', 'distance',
           'v|Speed|16|m/s;t|Time|30|s', 'Distance|v*t|m', 'd=vt')

# 1.5 Consolidated: Kinematics Calculator (SUVAT)
s('Physics & Engineering', 'Kinematics', 'kinematics-calculator', 'Kinematics Calculator (SUVAT Equations)',
  'Solve uniformly accelerated motion problems from any 3 known SUVAT variables (Initial velocity u, Final velocity v, Acceleration a, Displacement s, Time t).',
  'kinematics_suvat', 'v = u + at;  s = ut + ½at²;  v² = u² + 2as;  s = ½(u + v)t.',
  'Automatically selects the governing kinematic equation from your supplied inputs.',
  'kinematics calculator suvat acceleration displacement velocity time')

alias_mode('Physics & Engineering', 'Kinematics', 'acceleration-calculator', 'Acceleration Calculator',
           'Calculate acceleration from initial and final velocities.', 'kinematics-calculator', 'find_a_s',
           'u|Initial velocity|5|m/s;v|Final velocity|25|m/s;t|Elapsed time|4|s', 'Acceleration|(v-u)/t|m/s²;Displacement|(u+v)*t/2|m', 'a=(v−u)/t')
alias_mode('Physics & Engineering', 'Kinematics', 'displacement-calculator', 'Displacement Calculator',
           'Find displacement with constant acceleration.', 'kinematics-calculator', 'find_s_v',
           'u|Initial speed|10|m/s;t|Time|5|s;a|Acceleration|2|m/s²', 'Displacement|u*t+a*t^2/2|m;Final speed|u+a*t|m/s', 's=ut+½at²')

# Separate Projectile Motion Calculator (per Section 1.5 requirement)
f('Physics & Engineering', 'Kinematics', 'projectile-range', 'Projectile Motion Calculator',
  'Calculate projectile horizontal range, flight time, maximum height, and velocity components.',
  'v|Launch speed v₀|20|m/s;angle|Launch angle θ|45|°;g|Gravity g|9.80665|m/s²',
  'Range|v^2*sin(2*angle*pi/180)/g|m;Flight time|2*v*sin(angle*pi/180)/g|s;Maximum height|v^2*sin(angle*pi/180)^2/(2*g)|m;Horizontal velocity v_x|v*cos(angle*pi/180)|m/s;Initial vertical velocity v_y0|v*sin(angle*pi/180)|m/s',
  'R = v₀²sin(2θ)/g;  T = 2v₀sin(θ)/g;  H = v₀²sin²(θ)/(2g)',
  'Ideal vacuum trajectory at equal launch and landing elevation.',
  'projectile motion range flight time max height trajectory')

# Retained Mechanics & Work/Energy
f('Physics & Engineering', 'Mechanics', 'force-calculator', 'Force Calculator (Newton’s Second Law)',
  'Calculate net force, mass or acceleration using Newton’s second law F = ma.',
  'm|Mass m|12|kg;a|Acceleration a|3|m/s²',
  'Force|m*a|N',
  'F = m · a', '', 'force calculator newtons second law F=ma')

f('Physics & Engineering', 'Work & Energy', 'work-calculator', 'Work Calculator',
  'Find mechanical work done by a constant force at an angle θ to displacement.',
  'F|Force F|100|N;d|Displacement d|5|m;deg|Angle θ|30|°',
  'Work|F*d*cos(deg*pi/180)|J;Effective parallel force|F*cos(deg*pi/180)|N',
  'W = F · d · cos(θ)', '', 'work calculator mechanical work force displacement')

f('Physics & Engineering', 'Work & Energy', 'kinetic-energy', 'Kinetic Energy Calculator',
  'Find translational kinetic energy and momentum from mass and speed.',
  'm|Mass m|10|kg;v|Speed v|6|m/s',
  'Kinetic energy|m*v^2/2|J;Momentum|m*v|kg·m/s',
  'KE = ½ m v²', '', 'kinetic energy calculator KE=1/2mv^2')

f('Physics & Engineering', 'Work & Energy', 'potential-energy', 'Gravitational Potential Energy',
  'Calculate gravitational potential energy near a planetary surface U = mgh.',
  'm|Mass m|5|kg;g|Gravity g|9.80665|m/s²;h|Height h|10|m',
  'Potential energy|m*g*h|J;Weight (m·g)|m*g|N',
  'PE = m · g · h', '', 'gravitational potential energy PE=mgh')

f('Physics & Engineering', 'Work & Energy', 'mechanical-power', 'Mechanical Power Calculator',
  'Find mechanical power from work done over elapsed time.',
  'W|Work done W|1000|J;t|Time elapsed t|20|s',
  'Power|W/t|W;Power (Horsepower)|W/(t*745.699872)|hp',
  'P = W / t', '', 'mechanical power calculator watts horsepower')

f('Physics & Engineering', 'Work & Energy', 'spring-force', 'Hooke’s Law & Spring Energy Calculator',
  'Find restoring spring force magnitude and elastic potential energy stored in a spring.',
  'k|Spring constant k|300|N/m;x|Displacement x|0.05|m',
  'Force magnitude|k*abs(x)|N;Stored elastic energy|k*x^2/2|J',
  '|F| = k|x|;  E_s = ½ k x²', '', 'hookes law spring force elastic potential energy')

f('Physics & Engineering', 'Mechanics', 'momentum-calculator', 'Momentum Calculator',
  'Calculate linear momentum and kinetic energy from mass and velocity.',
  'm|Mass m|8|kg;v|Velocity v|4|m/s',
  'Momentum|m*v|kg·m/s;Kinetic energy|m*v^2/2|J',
  'p = m · v', '', 'momentum calculator linear momentum p=mv')

f('Physics & Engineering', 'Mechanics', 'density-calculator', 'Density Calculator',
  'Find material density from mass and volume.',
  'm|Mass m|600|kg;V|Volume V|0.3|m³',
  'Density (kg/m³)|m/V|kg/m³;Density (g/cm³)|m/(V*1000)|g/cm³',
  'ρ = m / V', '', 'density calculator mass volume')

f('Physics & Engineering', 'Mechanics', 'pressure-calculator', 'Pressure Calculator',
  'Calculate normal pressure from applied force and contact area.',
  'F|Force F|800|N;A|Area A|0.4|m²',
  'Pressure (Pa)|F/A|Pa;Pressure (kPa)|F/(A*1000)|kPa;Pressure (bar)|F/(A*100000)|bar',
  'P = F / A', '', 'pressure calculator pascals force area')

f('Physics & Engineering', 'Mechanics', 'gravitational-force', 'Universal Gravitation Calculator',
  'Calculate gravitational attraction force between two masses using Newton’s law of universal gravitation.',
  'm1|Mass one m₁|1000|kg;m2|Mass two m₂|500|kg;r|Center distance r|2|m',
  'Force|6.6743e-11*m1*m2/r^2|N;Acceleration of m₁|6.6743e-11*m2/r^2|m/s²;Acceleration of m₂|6.6743e-11*m1/r^2|m/s²',
  'F = G·m₁·m₂ / r²  (G = 6.67430 × 10⁻¹¹ N·m²/kg²)', '', 'universal gravitation newton gravity G*m1*m2/r^2')

f('Physics & Engineering', 'Rotational Mechanics', 'torque-calculator', 'Torque Calculator',
  'Calculate rotational torque from lever arm radius, applied force, and angle.',
  'r|Lever arm r|0.5|m;F|Force F|80|N;angle|Angle θ|90|°',
  'Torque|r*F*sin(angle*pi/180)|N·m;Perpendicular force|F*sin(angle*pi/180)|N',
  'τ = r · F · sin(θ)', '', 'torque calculator moment of force lever arm')

f('Physics & Engineering', 'Rotational Mechanics', 'centripetal-force', 'Centripetal Force Calculator',
  'Calculate inward centripetal force, acceleration, and angular velocity in uniform circular motion.',
  'm|Mass m|2|kg;v|Tangential speed v|10|m/s;r|Radius r|5|m',
  'Centripetal force|m*v^2/r|N;Centripetal acceleration|v^2/r|m/s²;Angular velocity ω|v/r|rad/s',
  'F_c = m v² / r;  a_c = v² / r', '', 'centripetal force circular motion')

# 3.2 Phase 3 Advanced Mechanics (11 tools)
m('Physics & Engineering', 'Rotational Mechanics', 'rotational-motion-calculator', 'Rotational Motion Calculator',
  'Solve angular kinematics (ω₀, ω, α, θ, t), rotational kinetic energy, and rotational power.',
  [
      {'id': 'kinematics', 'label': 'Angular Kinematics (ω = ω₀ + αt, θ = ω₀t + ½αt²)', 'fields': 'w0|Initial angular velocity ω₀|2|rad/s;alpha|Angular acceleration α|1.5|rad/s²;t|Time elapsed t|4|s',
       'outputs': 'Final angular velocity ω|w0+alpha*t|rad/s;Angular displacement θ|w0*t+0.5*alpha*t^2|rad;Revolutions completed|(w0*t+0.5*alpha*t^2)/(2*pi)|rev',
       'formula': 'ω = ω₀ + αt;  θ = ω₀t + ½αt²'},
      {'id': 'energy_power', 'label': 'Rotational Kinetic Energy & Power', 'fields': 'I|Moment of inertia I|4|kg·m²;w|Angular velocity ω|10|rad/s;tau|Applied torque τ|15|N·m',
       'outputs': 'Rotational kinetic energy (½Iω²)|0.5*I*w^2|J;Angular momentum (Iω)|I*w|kg·m²/s;Rotational power (τ·ω)|tau*w|W;Angular acceleration (τ/I)|tau/I|rad/s²',
       'formula': 'KE_rot = ½Iω²;  L = Iω;  P = τω'}
  ],
  'ω = ω₀ + αt;  θ = ω₀t + ½αt²;  KE_rot = ½Iω²', '', 'rotational motion angular velocity acceleration kinematics')

m('Physics & Engineering', 'Rotational Mechanics', 'moment-of-inertia-calculator', 'Moment of Inertia Calculator',
  'Calculate mass moment of inertia I for standard rigid body geometries and apply the Parallel Axis Theorem I = I_cm + md².',
  [
      {'id': 'cylinder', 'label': 'Solid Cylinder / Disk (I = ½mr²)', 'fields': 'm|Mass m|5|kg;r|Radius r|0.4|m;d|Parallel axis offset d|0|m',
       'outputs': 'I_cm (about center)|0.5*m*r^2|kg·m²;I_parallel (I_cm + md²)|0.5*m*r^2+m*d^2|kg·m²;Radius of gyration k|sqrt(0.5*r^2+d^2)|m', 'formula': 'I_cm = ½ m r²;  I = I_cm + m d²'},
      {'id': 'hollow_cyl', 'label': 'Hollow Cylinder / Annular Ring (I = ½m(r₁² + r₂²))', 'fields': 'm|Mass m|5|kg;r1|Inner radius r₁|0.2|m;r2|Outer radius r₂|0.4|m',
       'outputs': 'Moment of inertia I|0.5*m*(r1^2+r2^2)|kg·m²;Thin hoop limit (mr₂²)|m*r2^2|kg·m²', 'formula': 'I = ½ m (r₁² + r₂²)'},
      {'id': 'sphere', 'label': 'Solid & Thin Hollow Sphere', 'fields': 'm|Mass m|5|kg;r|Radius r|0.4|m',
       'outputs': 'Solid sphere (2/5 mr²)|0.4*m*r^2|kg·m²;Thin spherical shell (2/3 mr²)|(2/3)*m*r^2|kg·m²', 'formula': 'I_solid = (2/5)mr²;  I_shell = (2/3)mr²'},
      {'id': 'rod', 'label': 'Uniform Slender Rod (Length L)', 'fields': 'm|Mass m|3|kg;L|Length L|1.2|m',
       'outputs': 'About center (1/12 mL²)|m*L^2/12|kg·m²;About one end (1/3 mL²)|m*L^2/3|kg·m²', 'formula': 'I_center = (1/12)mL²;  I_end = (1/3)mL²'},
      {'id': 'plate', 'label': 'Rectangular Plate (a × b)', 'fields': 'm|Mass m|4|kg;a|Length a|0.8|m;b|Width b|0.5|m',
       'outputs': 'About perpendicular center (1/12 m(a²+b²))|m*(a^2+b^2)/12|kg·m²;About central axis parallel to b (1/12 ma²)|m*a^2/12|kg·m²', 'formula': 'I_z = (1/12)m(a² + b²)'}
  ],
  'I_cm + m d² (Parallel Axis Theorem)', '', 'moment of inertia rotational inertia cylinder sphere rod parallel axis')

m('Physics & Engineering', 'Rotational Mechanics', 'angular-momentum-calculator', 'Angular Momentum Calculator',
  'Calculate rigid-body angular momentum (L = Iω) and point-mass orbital angular momentum (L = mvr sin θ).',
  [
      {'id': 'rigid', 'label': 'Rigid Body (L = I · ω)', 'fields': 'I|Moment of inertia I|2.5|kg·m²;w|Angular velocity ω|12|rad/s',
       'outputs': 'Angular momentum L|I*w|kg·m²/s;Rotational kinetic energy|0.5*I*w^2|J', 'formula': 'L = I · ω;  KE = L² / (2I)'},
      {'id': 'point', 'label': 'Point Mass (L = m · v · r · sin θ)', 'fields': 'm|Mass m|2|kg;v|Speed v|8|m/s;r|Radius r|1.5|m;angle|Angle θ|90|°',
       'outputs': 'Angular momentum L|m*v*r*sin(angle*pi/180)|kg·m²/s;Moment of inertia (mr²)|m*r^2|kg·m²', 'formula': 'L = m · v · r · sin(θ)'}
  ],
  'L = Iω  |  L = r × p = mvr sin(θ)', '', 'angular momentum rotational momentum')

f('Physics & Engineering', 'Rotational Mechanics', 'centripetal-acceleration-calculator', 'Centripetal Acceleration Calculator',
  'Calculate centripetal acceleration a_c = v²/r = ω²r, orbital period, and g-force multiple.',
  'v|Tangential speed v|15|m/s;r|Radius of curvature r|9|m',
  'Centripetal acceleration a_c|v^2/r|m/s²;In g-units (a_c / g₀)|v^2/(r*9.80665)|g;Angular speed ω|v/r|rad/s;Rotation period T|2*pi*r/v|s',
  'a_c = v² / r = ω² r', '', 'centripetal acceleration radial acceleration circular motion')

f('Physics & Engineering', 'Mechanics', 'conservation-of-momentum-calculator', 'Conservation of Momentum Calculator',
  'Calculate total initial momentum, post-interaction velocity, and impulse for two interacting bodies.',
  'm1|Mass 1 (m₁)|4|kg;u1|Initial velocity u₁|6|m/s;m2|Mass 2 (m₂)|2|kg;u2|Initial velocity u₂|-3|m/s;v1|Final velocity v₁|2|m/s',
  'Required final velocity v₂|(m1*u1+m2*u2-m1*v1)/m2|m/s;Total conserved momentum|m1*u1+m2*u2|kg·m/s;Impulse on m₁|m1*(v1-u1)|N·s;Center-of-mass velocity|(m1*u1+m2*u2)/(m1+m2)|m/s',
  'm₁u₁ + m₂u₂ = m₁v₁ + m₂v₂', 'Assumes an isolated system with zero external net impulse.', 'conservation of momentum impulse collision')

m('Physics & Engineering', 'Mechanics', 'elastic-inelastic-collision-calculator', 'Elastic & Inelastic Collision Calculator',
  'Calculate post-collision velocities v₁, v₂ and kinetic energy loss for 1D Elastic, Perfectly Inelastic, and Restitution (e) collisions.',
  [
      {'id': 'elastic', 'label': '1D Perfectly Elastic Collision (e = 1)', 'fields': 'm1|Mass m₁|4|kg;u1|Initial velocity u₁|6|m/s;m2|Mass m₂|2|kg;u2|Initial velocity u₂|-2|m/s',
       'outputs': 'Final velocity v₁|((m1-m2)*u1+2*m2*u2)/(m1+m2)|m/s;Final velocity v₂|((m2-m1)*u2+2*m1*u1)/(m1+m2)|m/s;Total momentum|m1*u1+m2*u2|kg·m/s;Total kinetic energy|0.5*m1*u1^2+0.5*m2*u2^2|J',
       'formula': 'v₁ = [(m₁−m₂)u₁ + 2m₂u₂]/(m₁+m₂);  v₂ = [(m₂−m₁)u₂ + 2m₁u₁]/(m₁+m₂)'},
      {'id': 'inelastic', 'label': 'General Restitution / Inelastic Collision (0 ≤ e ≤ 1)', 'fields': 'm1|Mass m₁|4|kg;u1|Initial velocity u₁|6|m/s;m2|Mass m₂|2|kg;u2|Initial velocity u₂|-2|m/s;e|Coeff. of restitution e (0–1)|0',
       'outputs': 'Final velocity v₁|(m1*u1+m2*u2+m2*e*(u2-u1))/(m1+m2)|m/s;Final velocity v₂|(m1*u1+m2*u2+m1*e*(u1-u2))/(m1+m2)|m/s;Kinetic energy lost ΔKE|0.5*(m1*m2/(m1+m2))*(1-e^2)*(u1-u2)^2|J',
       'formula': 'v₁ = [m₁u₁ + m₂u₂ + m₂e(u₂−u₁)]/(m₁+m₂);  ΔKE = ½ μ (1 − e²)(u₁ − u₂)²'}
  ],
  'Conservation of momentum + Newton\'s law of restitution v₂ − v₁ = e(u₁ − u₂).',
  'Set e = 1 for perfectly elastic or e = 0 for perfectly inelastic (coalescing) collisions.',
  'elastic collision inelastic collision coefficient of restitution')

f('Physics & Engineering', 'Work & Energy', 'work-energy-theorem-calculator', 'Work-Energy Theorem Calculator',
  'Relate net mechanical work W_net to change in kinetic energy ΔKE = ½mv_f² − ½mv_i² and stopping/accelerating distance.',
  'm|Mass m|1200|kg;vi|Initial speed v_i|20|m/s;vf|Final speed v_f|30|m/s;d|Distance d|100|m',
  'Net work W_net (ΔKE)|0.5*m*(vf^2-vi^2)|J;Initial KE|0.5*m*vi^2|J;Final KE|0.5*m*vf^2|J;Average net force (W_net / d)|0.5*m*(vf^2-vi^2)/d|N',
  'W_net = ΔKE = ½ m v_f² − ½ m v_i² = F_net · d', '', 'work energy theorem delta KE net work')

f('Physics & Engineering', 'Mechanics', 'circular-orbit-calculator', 'Circular Orbit Calculator',
  'Calculate circular orbital speed, orbital period, and centripetal acceleration around a central mass M.',
  'M|Central mass M|5.972e24|kg;r|Orbital radius r (from center)|6.771e6|m',
  'Orbital speed v_orb|sqrt(6.6743e-11*M/r)|m/s;Orbital speed (km/s)|sqrt(6.6743e-11*M/r)/1000|km/s;Orbital period T|2*pi*sqrt(r^3/(6.6743e-11*M))|s;Orbital period (minutes)|2*pi*sqrt(r^3/(6.6743e-11*M))/60|min;Gravitational acceleration g(r)|6.6743e-11*M/r^2|m/s²',
  'v_orb = √(GM / r);  T = 2π√(r³ / GM)', 'Default values correspond to Low Earth Orbit (~400 km altitude).',
  'circular orbit velocity satellite speed orbital mechanics')

f('Physics & Engineering', 'Mechanics', 'escape-velocity-calculator', 'Escape Velocity Calculator',
  'Calculate minimum escape velocity v_e = √(2GM/R) from the surface or orbit of a celestial body.',
  'M|Body mass M|5.972e24|kg;R|Radius from center R|6.371e6|m',
  'Escape velocity (m/s)|sqrt(2*6.6743e-11*M/R)|m/s;Escape velocity (km/s)|sqrt(2*6.6743e-11*M/R)/1000|km/s;Surface gravity g|6.6743e-11*M/R^2|m/s²;Circular orbit speed (v_e/√2)|sqrt(6.6743e-11*M/R)|m/s',
  'v_e = √(2GM / R)', 'Neglects atmospheric drag and planetary rotation.', 'escape velocity gravitational escape speed')

f('Physics & Engineering', 'Mechanics', 'orbital-period-calculator', 'Orbital Period Calculator (Kepler’s Third Law)',
  'Compute orbital period T from semi-major axis a and system masses (M₁ + M₂) using Kepler’s Third Law.',
  'a|Semi-major axis a|1.4959787e11|m;M1|Primary mass M₁|1.9885e30|kg;M2|Secondary mass M₂|5.972e24|kg',
  'Orbital period (seconds)|2*pi*sqrt(a^3/(6.6743e-11*(M1+M2)))|s;Orbital period (days)|2*pi*sqrt(a^3/(6.6743e-11*(M1+M2)))/86400|days;Orbital period (Julian years)|2*pi*sqrt(a^3/(6.6743e-11*(M1+M2)))/31557600|years',
  'T = 2π √[a³ / (G(M₁ + M₂))]', 'Defaults represent the Earth–Sun orbit (1 AU).', 'orbital period keplers third law semi-major axis')

f('Physics & Engineering', 'Mechanics', 'gravitational-potential-calculator', 'Gravitational Potential Calculator',
  'Calculate gravitational potential V = −GM/r, gravitational potential energy U = −GMm/r, and binding energy.',
  'M|Source mass M|5.972e24|kg;m|Test mass m|1000|kg;r|Radial distance r|6.371e6|m',
  'Gravitational potential V|-6.6743e-11*M/r|J/kg;Gravitational potential energy U|-6.6743e-11*M*m/r|J;Gravitational field g|6.6743e-11*M/r^2|m/s²',
  'V = −GM / r;  U = −GMm / r (zero reference at r = ∞)', '', 'gravitational potential energy binding energy')

# 1.5 & 3.1 Consolidated + Expanded Electrical Engineering & Circuit Analysis
m('Physics & Engineering', 'Electrical Circuits', 'circuit-calculator', 'Circuit Calculator (Ohm’s Law, Power & Energy)',
  'Calculate DC/AC resistive Voltage (V), Current (I), Resistance (R), Instantaneous Power (P), and Electrical Energy (E = P × t).',
  [
      {'id': 'current_power', 'label': 'Find Current & Power (from V & R)', 'fields': 'V|Voltage V|12|V;R|Resistance R|6|Ω',
       'outputs': 'Current (I = V/R)|V/R|A;Electrical Power (P = V²/R)|V^2/R|W;Conductance (G = 1/R)|1/R|S', 'formula': 'I = V / R;  P = V² / R = V · I'},
      {'id': 'voltage_power', 'label': 'Find Voltage & Power (from I & R)', 'fields': 'I|Current I|2|A;R|Resistance R|6|Ω',
       'outputs': 'Voltage (V = I·R)|I*R|V;Electrical Power (P = I²R)|I^2*R|W', 'formula': 'V = I · R;  P = I² · R'},
      {'id': 'resistance_power', 'label': 'Find Resistance & Power (from V & I)', 'fields': 'V|Voltage V|12|V;I|Current I|2|A',
       'outputs': 'Resistance (R = V/I)|V/I|Ω;Electrical Power (P = V·I)|V*I|W', 'formula': 'R = V / I;  P = V · I'},
      {'id': 'energy', 'label': 'Electrical Power & Energy Consumption (P = VI, E = Pt)', 'fields': 'V|Voltage V|230|V;I|Current I|2|A;t|Operating time t|5|h',
       'outputs': 'Instantaneous Power P|V*I|W;Energy consumed (kWh)|V*I*t/1000|kWh;Energy consumed (Joules)|V*I*t*3600|J;Charge transferred Q|I*t*3600|C',
       'formula': 'P = V · I (Watts);  E = P · t (Watt-hours or Joules)'}
  ],
  'V = I·R  |  P = V·I = I²R = V²/R  |  E = P·t',
  'Distinguishes instantaneous electrical power P (Watts) from cumulative electrical energy E (kWh / Joules).',
  'ohms law circuit calculator voltage current resistance electrical power energy')

alias_mode('Physics & Engineering', 'Electrical Circuits', 'ohms-law', 'Ohm’s Law Calculator',
           'Calculate current and power from voltage and resistance.', 'circuit-calculator', 'current_power',
           'V|Voltage|12|V;R|Resistance|6|Ω', 'Current|V/R|A;Power|V^2/R|W', 'I=V/R; P=V²/R')
alias_mode('Physics & Engineering', 'Electrical Circuits', 'electrical-power', 'Electrical Power Calculator',
           'Find electrical power and energy use.', 'circuit-calculator', 'energy',
           'V|Voltage|230|V;I|Current|2|A;t|Hours|5|h', 'Power|V*I|W;Energy|V*I*t/1000|kWh', 'P=VI; E=P×t')

# 1.5 Consolidated: Resistance Network Calculator (Series, Parallel, Mixed)
m('Physics & Engineering', 'Electrical Circuits', 'resistance-network-calculator', 'Resistance Network Calculator (Series, Parallel & Mixed)',
  'Compute equivalent resistance R_eq, total current, and branch drops for Series, Parallel, and Mixed Series-Parallel networks.',
  [
      {'id': 'series', 'label': 'Series Resistor Network (R₁ + R₂ + R₃)', 'fields': 'a|Resistor R₁|100|Ω;b|Resistor R₂|220|Ω;c|Resistor R₃|330|Ω;V|Source Voltage V (optional)|12|V',
       'outputs': 'Equivalent resistance R_eq|a+b+c|Ω;Series current I|V/(a+b+c)|A;Voltage drop V₁|V*a/(a+b+c)|V;Voltage drop V₂|V*b/(a+b+c)|V;Voltage drop V₃|V*c/(a+b+c)|V;Total power P|V^2/(a+b+c)|W',
       'formula': 'R_eq = R₁ + R₂ + R₃'},
      {'id': 'parallel', 'label': 'Parallel Resistor Network (R₁ ∥ R₂ ∥ R₃)', 'fields': 'a|Resistor R₁|100|Ω;b|Resistor R₂|220|Ω;c|Resistor R₃|330|Ω;V|Source Voltage V (optional)|12|V',
       'outputs': 'Equivalent resistance R_eq|1/(1/a+1/b+1/c)|Ω;Total current I_total|V*(1/a+1/b+1/c)|A;Branch current I₁|V/a|A;Branch current I₂|V/b|A;Branch current I₃|V/c|A;Total conductance G|1/a+1/b+1/c|S',
       'formula': '1 / R_eq = 1/R₁ + 1/R₂ + 1/R₃'},
      {'id': 'mixed_sp', 'label': 'Mixed Topology A: (R₁ ∥ R₂) in Series with R₃', 'fields': 'a|Parallel R₁|100|Ω;b|Parallel R₂|200|Ω;c|Series R₃|150|Ω;V|Source Voltage V|12|V',
       'outputs': 'Equivalent resistance R_eq|(a*b)/(a+b)+c|Ω;Parallel stage R₁∥R₂|(a*b)/(a+b)|Ω;Total current I|V/((a*b)/(a+b)+c)|A;Voltage across R₁∥R₂|V*((a*b)/(a+b))/((a*b)/(a+b)+c)|V',
       'formula': 'R_eq = (R₁·R₂)/(R₁ + R₂) + R₃'},
      {'id': 'mixed_ps', 'label': 'Mixed Topology B: R₁ in Parallel with (R₂ + R₃)', 'fields': 'a|Parallel branch R₁|100|Ω;b|Series branch R₂|120|Ω;c|Series branch R₃|180|Ω;V|Source Voltage V|12|V',
       'outputs': 'Equivalent resistance R_eq|1/(1/a+1/(b+c))|Ω;Series branch (R₂ + R₃)|b+c|Ω;Total current I|V*(1/a+1/(b+c))|A',
       'formula': 'R_eq = [R₁ · (R₂ + R₃)] / [R₁ + R₂ + R₃]'}
  ],
  'Series: R_eq = ΣR_i  |  Parallel: R_eq = (Σ R_i⁻¹)⁻¹  |  Explicit mixed series-parallel topologies',
  'All resistances must be positive (R > 0).', 'series resistors parallel resistors equivalent resistance voltage divider')

alias_mode('Physics & Engineering', 'Electrical Circuits', 'resistor-series', 'Series Resistors Calculator',
           'Find equivalent resistance for series resistors.', 'resistance-network-calculator', 'series',
           'a|Resistor 1|100|Ω;b|Resistor 2|220|Ω;c|Resistor 3|330|Ω', 'Equivalent resistance|a+b+c|Ω', 'R_eq=R₁+R₂+R₃')
alias_mode('Physics & Engineering', 'Electrical Circuits', 'resistor-parallel', 'Parallel Resistors Calculator',
           'Find equivalent resistance for parallel resistors.', 'resistance-network-calculator', 'parallel',
           'a|Resistor 1|100|Ω;b|Resistor 2|220|Ω;c|Resistor 3|330|Ω', 'Equivalent resistance|1/(1/a+1/b+1/c)|Ω', '1/R_eq=1/R₁+1/R₂+1/R₃')

# 3.1 Electrical Engineering & Circuit Analysis (16 new tools)
m('Physics & Engineering', 'Electrical Circuits', 'rlc-resonance-calculator', 'RLC Resonance Calculator',
  'Calculate resonant frequency f₀ = 1/(2π√LC), angular resonance ω₀, characteristic impedance, and impedance at any operating frequency f for Series and Parallel RLC circuits.',
  [
      {'id': 'series', 'label': 'Series RLC Resonance & Impedance', 'fields': 'R|Resistance R|10|Ω;L|Inductance L|0.01|H;C|Capacitance C|0.00001|F;f|Operating frequency f|500|Hz',
       'outputs': 'Resonant frequency f₀|1/(2*pi*sqrt(L*C))|Hz;Angular resonance ω₀|1/sqrt(L*C)|rad/s;Inductive reactance X_L (at f)|2*pi*f*L|Ω;Capacitive reactance X_C (at f)|1/(2*pi*f*C)|Ω;Net impedance Z (at f)|sqrt(R^2+(2*pi*f*L-1/(2*pi*f*C))^2)|Ω;Phase angle φ (at f)|atan2(2*pi*f*L-1/(2*pi*f*C),R)*180/pi|°',
       'formula': 'f₀ = 1/(2π√(LC));  Z_series = R + j(X_L − X_C)'},
      {'id': 'parallel', 'label': 'Ideal Parallel RLC Resonance & Admittance', 'fields': 'R|Parallel Resistance R|1000|Ω;L|Inductance L|0.01|H;C|Capacitance C|0.00001|F;f|Operating frequency f|500|Hz',
       'outputs': 'Resonant frequency f₀|1/(2*pi*sqrt(L*C))|Hz;Inductive susceptance B_L|1/(2*pi*f*L)|S;Capacitive susceptance B_C|2*pi*f*C|S;Net impedance Z_p (at f)|1/sqrt((1/R)^2+(2*pi*f*C-1/(2*pi*f*L))^2)|Ω;Phase angle φ (at f)|atan2(1/(2*pi*f*L)-2*pi*f*C,1/R)*180/pi|°',
       'formula': 'f₀ = 1/(2π√(LC));  Y_parallel = 1/R + j(ωC − 1/(ωL))'}
  ],
  'f₀ = 1 / (2π√(LC))', 'Distinguishes Series RLC impedance minimum from Parallel RLC impedance maximum at resonance.',
  'RLC resonance resonant frequency inductive capacitive reactance')

m('Physics & Engineering', 'Electrical Circuits', 'quality-factor-calculator', 'Quality Factor (Q) Calculator',
  'Calculate circuit Quality Factor Q, resonant frequency f₀, damping ratio ζ, and −3 dB bandwidth for Series and Parallel RLC resonators.',
  [
      {'id': 'series', 'label': 'Series RLC Quality Factor (Q = (1/R)√(L/C))', 'fields': 'R|Series Resistance R|10|Ω;L|Inductance L|0.01|H;C|Capacitance C|0.00001|F',
       'outputs': 'Quality factor Q_series|(1/R)*sqrt(L/C);Resonant frequency f₀|1/(2*pi*sqrt(L*C))|Hz;Bandwidth Δf (f₀/Q)|R/(2*pi*L)|Hz;Damping ratio ζ (1/(2Q))|(R/2)*sqrt(C/L)',
       'formula': 'Q_series = (1/R)√(L/C);  Δf = f₀ / Q = R / (2πL)'},
      {'id': 'parallel', 'label': 'Parallel RLC Quality Factor (Q = R√(C/L))', 'fields': 'R|Parallel Shunt Resistance R|1000|Ω;L|Inductance L|0.01|H;C|Capacitance C|0.00001|F',
       'outputs': 'Quality factor Q_parallel|R*sqrt(C/L);Resonant frequency f₀|1/(2*pi*sqrt(L*C))|Hz;Bandwidth Δf (f₀/Q)|1/(2*pi*R*C)|Hz;Damping ratio ζ|1/(2*R*sqrt(C/L))',
       'formula': 'Q_parallel = R√(C/L);  Δf = f₀ / Q = 1 / (2πRC)'}
  ],
  'Series: Q = (1/R)√(L/C)  |  Parallel: Q = R√(C/L)',
  'Series and parallel topologies have reciprocal Q formulas; select the topology matching your circuit.',
  'quality factor Q factor RLC damping ratio bandwidth')

f('Physics & Engineering', 'Electrical Circuits', 'rlc-circuit-calculator', 'RLC Circuit Calculator',
  'Analyze full AC Series RLC circuit current, component voltage phasors (V_R, V_L, V_C), power factor, and active/reactive power.',
  'V|Source RMS Voltage V|120|V;f|Frequency f|60|Hz;R|Resistance R|20|Ω;L|Inductance L|0.08|H;C|Capacitance C|0.0001|F',
  'Inductive reactance X_L|2*pi*f*L|Ω;Capacitive reactance X_C|1/(2*pi*f*C)|Ω;Total impedance Z|sqrt(R^2+(2*pi*f*L-1/(2*pi*f*C))^2)|Ω;RMS Current I|V/sqrt(R^2+(2*pi*f*L-1/(2*pi*f*C))^2)|A;Phase angle φ|atan2(2*pi*f*L-1/(2*pi*f*C),R)*180/pi|°;Power factor cos(φ)|R/sqrt(R^2+(2*pi*f*L-1/(2*pi*f*C))^2);Real power P|V^2*R/(R^2+(2*pi*f*L-1/(2*pi*f*C))^2)|W',
  '|Z| = √(R² + (X_L − X_C)²);  I = V/|Z|;  φ = atan2(X_L − X_C, R)', '', 'RLC circuit phasor impedance voltage drop')

f('Physics & Engineering', 'Electrical Circuits', 'ac-circuit-calculator', 'AC Circuit Calculator (RMS, Peak, Phasor & Power)',
  'Compute RMS, Peak, Peak-to-Peak voltage/current, angular frequency, impedance, and Real (P), Reactive (Q), and Apparent (S) power.',
  'Vrms|RMS Voltage V_rms|120|V;Irms|RMS Current I_rms|5|A;f|Frequency f|60|Hz;phi|Phase angle φ (V leads I)|30|°',
  'Peak voltage V_peak|Vrms*sqrt(2)|V;Peak-to-peak voltage V_pp|2*Vrms*sqrt(2)|V;Angular frequency ω|2*pi*f|rad/s;Impedance magnitude Z|Vrms/Irms|Ω;Real power P (Watts)|Vrms*Irms*cos(phi*pi/180)|W;Reactive power Q (VAR)|Vrms*Irms*sin(phi*pi/180)|VAR;Apparent power S (VA)|Vrms*Irms|VA;Power factor PF|cos(phi*pi/180)',
  'V_peak = √2 V_rms;  S = V_rms I_rms;  P = S cos φ;  Q = S sin φ',
  'Assumes sinusoidal steady-state AC waveforms.', 'AC circuit RMS peak voltage real reactive apparent power')

f('Physics & Engineering', 'Electrical Circuits', 'transformer-calculator', 'Transformer Calculator',
  'Calculate primary/secondary voltages, currents, turns ratio, and practical power efficiency for step-up and step-down transformers.',
  'Vp|Primary voltage V_p|240|V;Np|Primary turns N_p|1000;Ns|Secondary turns N_s|100;Is|Secondary load current I_s|10|A;eff|Efficiency η|96|%',
  'Secondary voltage V_s (ideal)|Vp*Ns/Np|V;Turns ratio a (N_p/N_s)|Np/Ns;Output power P_out|Vp*(Ns/Np)*Is|W;Ideal primary current I_p (ideal)|Is*Ns/Np|A;Practical input power P_in|(Vp*(Ns/Np)*Is)/(eff/100)|W;Practical primary current I_p|((Vp*(Ns/Np)*Is)/(eff/100))/Vp|A;Power loss (heat)|((Vp*(Ns/Np)*Is)/(eff/100))-(Vp*(Ns/Np)*Is)|W',
  'Ideal: V_p / V_s = N_p / N_s = I_s / I_p;  Practical: P_out = η · P_in',
  'Clearly separates ideal lossless transformer ratios from practical efficiency losses.',
  'transformer turns ratio primary secondary voltage current efficiency')

f('Physics & Engineering', 'Electronics', 'capacitor-calculator', 'Capacitor Calculator (Charge, Energy & Reactance)',
  'Calculate stored charge Q = CV, electrostatic energy E = ½CV², and AC capacitive reactance X_C = 1/(2πfC).',
  'C|Capacitance C|0.0001|F;V|Voltage V|24|V;f|AC Frequency f|60|Hz',
  'Stored charge Q|C*V|C;Stored energy E|0.5*C*V^2|J;Capacitive reactance X_C|1/(2*pi*f*C)|Ω;AC RMS current at V|V*2*pi*f*C|A',
  'Q = C·V;  E = ½ C·V²;  X_C = 1 / (2πfC)', '', 'capacitor charge energy capacitive reactance')

m('Physics & Engineering', 'Electronics', 'capacitor-network-calculator', 'Capacitor Network Calculator (Series & Parallel)',
  'Calculate equivalent capacitance C_eq, total stored charge, and energy for Parallel and Series capacitor banks.',
  [
      {'id': 'parallel', 'label': 'Parallel Capacitors (C_eq = C₁ + C₂ + C₃)', 'fields': 'c1|Capacitor C₁|10|µF;c2|Capacitor C₂|22|µF;c3|Capacitor C₃|47|µF;V|Applied Voltage V|12|V',
       'outputs': 'Equivalent capacitance C_eq|c1+c2+c3|µF;Total charge Q_total|(c1+c2+c3)*V|µC;Total stored energy|0.5*(c1+c2+c3)*1e-6*V^2|J',
       'formula': 'C_eq = C₁ + C₂ + C₃'},
      {'id': 'series', 'label': 'Series Capacitors (1/C_eq = 1/C₁ + 1/C₂ + 1/C₃)', 'fields': 'c1|Capacitor C₁|10|µF;c2|Capacitor C₂|22|µF;c3|Capacitor C₃|47|µF;V|Applied Voltage V|12|V',
       'outputs': 'Equivalent capacitance C_eq|1/(1/c1+1/c2+1/c3)|µF;Series charge Q|(1/(1/c1+1/c2+1/c3))*V|µC;Voltage V₁ (Q/C₁)|((1/(1/c1+1/c2+1/c3))*V)/c1|V;Voltage V₂ (Q/C₂)|((1/(1/c1+1/c2+1/c3))*V)/c2|V;Voltage V₃ (Q/C₃)|((1/(1/c1+1/c2+1/c3))*V)/c3|V',
       'formula': '1 / C_eq = 1/C₁ + 1/C₂ + 1/C₃'}
  ],
  'Parallel: C_eq = ΣC_i  |  Series: C_eq = (Σ C_i⁻¹)⁻¹', '', 'capacitor network series parallel equivalent capacitance')

f('Physics & Engineering', 'Electrical Circuits', 'rc-circuit-calculator', 'RC Circuit Calculator (Time Constant & Filter)',
  'Calculate RC time constant τ = RC, charging and discharging voltages at time t, and −3 dB filter cutoff frequency f_c.',
  'R|Resistance R|10000|Ω;C|Capacitance C|0.0001|F;V0|Source / Initial Voltage V₀|10|V;t|Time elapsed t|1|s',
  'Time constant τ (R·C)|R*C|s;Charging voltage V_c(t)|V0*(1-exp(-t/(R*C)))|V;Charging current I(t)|(V0/R)*exp(-t/(R*C))|A;Discharging voltage V_d(t)|V0*exp(-t/(R*C))|V;Cutoff frequency f_c|1/(2*pi*R*C)|Hz;Settling time (5τ)|5*R*C|s',
  'τ = R·C;  V_charge(t) = V₀(1 − e^(−t/RC));  f_c = 1/(2πRC)', '', 'RC circuit time constant charging discharging cutoff frequency')

f('Physics & Engineering', 'Electrical Circuits', 'rl-circuit-calculator', 'RL Circuit Calculator (Time Constant & Transient)',
  'Calculate RL time constant τ = L/R, current buildup and decay at time t, magnetic energy, and cutoff frequency.',
  'R|Resistance R|50|Ω;L|Inductance L|0.2|H;V0|Source Voltage V₀|20|V;t|Time elapsed t|0.004|s',
  'Time constant τ (L/R)|L/R|s;Steady-state current I_max (V₀/R)|V0/R|A;Energizing current I(t)|(V0/R)*(1-exp(-R*t/L))|A;Decay current I_decay(t)|(V0/R)*exp(-R*t/L)|A;Cutoff frequency f_c|R/(2*pi*L)|Hz',
  'τ = L / R;  I(t) = (V₀/R)(1 − e^(−Rt/L));  f_c = R / (2πL)', '', 'RL circuit time constant inductor current buildup')

f('Physics & Engineering', 'Electronics', 'inductor-calculator', 'Inductor Calculator (Energy, EMF & Reactance)',
  'Calculate stored magnetic energy E = ½LI², induced voltage V = L(dI/dt), and inductive reactance X_L = 2πfL.',
  'L|Inductance L|0.05|H;I|Current I|3|A;dIdt|Current rate of change dI/dt|100|A/s;f|AC Frequency f|60|Hz',
  'Stored magnetic energy (½LI²)|0.5*L*I^2|J;Induced EMF magnitude (L·dI/dt)|L*abs(dIdt)|V;Inductive reactance X_L|2*pi*f*L|Ω;Magnetic flux linkage (L·I)|L*I|Wb',
  'E = ½ L I²;  |V| = L |dI/dt|;  X_L = 2πfL', '', 'inductor magnetic energy inductive reactance')

f('Physics & Engineering', 'Electrical Circuits', 'resonance-bandwidth-calculator', 'Resonance Bandwidth Calculator',
  'Calculate −3 dB bandwidth Δf = f₀/Q and exact lower/upper half-power cutoff frequencies f₁ and f₂.',
  'f0|Resonant frequency f₀|1000|Hz;Q|Quality factor Q|20',
  'Bandwidth Δf (f₀/Q)|f0/Q|Hz;Lower cutoff frequency f₁|f0*(sqrt(1+1/(4*Q^2))-1/(2*Q))|Hz;Upper cutoff frequency f₂|f0*(sqrt(1+1/(4*Q^2))+1/(2*Q))|Hz;Fractional bandwidth (1/Q)|100/Q|%',
  'Δf = f₀ / Q;  f₁,₂ = f₀ [√(1 + 1/(4Q²)) ∓ 1/(2Q)]', '', 'resonance bandwidth half power frequencies Q factor')

f('Physics & Engineering', 'Electricity', 'power-factor-calculator', 'Power Factor & Correction Calculator',
  'Calculate power factor PF = P/S, reactive power Q, apparent power S, phase angle, and capacitor size needed for power factor correction.',
  'P|Real Power P|5000|W;pf1|Existing Power Factor PF₁|0.75;pf2|Target Power Factor PF₂|0.95;V|Line RMS Voltage V|230|V;f|AC Frequency f|50|Hz',
  'Initial Apparent Power S₁|P/pf1|VA;Initial Reactive Power Q₁|P*tan(acos(pf1))|VAR;Target Reactive Power Q₂|P*tan(acos(pf2))|VAR;Required Reactive Compensation ΔQ|P*(tan(acos(pf1))-tan(acos(pf2)))|VAR;Required Correction Capacitance C|(P*(tan(acos(pf1))-tan(acos(pf2))))/(2*pi*f*V^2)*1e6|µF',
  'PF = cos φ = P / S;  Q_c = P(tan φ₁ − tan φ₂);  C = Q_c / (2πfV²)', '', 'power factor correction reactive power capacitor bank')

m('Physics & Engineering', 'Electronics', 'decibel-converter', 'Decibel (dB, dBm & dBW) Converter',
  'Convert between decibels (dB) and linear power ratios (10 log₁₀), voltage/amplitude ratios (20 log₁₀), and absolute power levels (dBm, dBW).',
  [
      {'id': 'power_to_db', 'label': 'Power Ratio (P₂ / P₁) ↔ dB', 'fields': 'P1|Reference power P₁|1|W;P2|Measured power P₂|100|W',
       'outputs': 'Power gain (dB)|10*log10(P2/P1)|dB;Linear power ratio (P₂/P₁)|P2/P1;Equivalent equal-impedance voltage ratio|sqrt(P2/P1)',
       'formula': 'dB = 10 log₁₀(P₂ / P₁)'},
      {'id': 'voltage_to_db', 'label': 'Voltage / Amplitude Ratio (V₂ / V₁) ↔ dB', 'fields': 'V1|Reference voltage V₁|1|V;V2|Measured voltage V₂|10|V',
       'outputs': 'Voltage gain (dB)|20*log10(abs(V2/V1))|dB;Linear voltage ratio (|V₂/V₁|)|abs(V2/V1);Equal-impedance power ratio|(V2/V1)^2',
       'formula': 'dB = 20 log₁₀(|V₂ / V₁|) (assumes equal load impedance R₁ = R₂)'},
      {'id': 'db_to_ratio', 'label': 'Decibels (dB) → Linear Power & Voltage Ratios', 'fields': 'db|Decibel value|20|dB',
       'outputs': 'Linear power ratio (10^(dB/10))|10^(db/10);Linear voltage ratio (10^(dB/20))|10^(db/20)',
       'formula': 'P₂/P₁ = 10^(dB/10);  |V₂/V₁| = 10^(dB/20)'},
      {'id': 'dbm_dbw', 'label': 'Absolute Power: dBm ↔ Watts / mW / dBW', 'fields': 'dbm|Power level (dBm, ref 1 mW)|30|dBm',
       'outputs': 'Power in milliwatts (mW)|10^(dbm/10)|mW;Power in Watts (W)|10^((dbm-30)/10)|W;Level in dBW (ref 1 W)|dbm-30|dBW',
       'formula': 'P(mW) = 10^(dBm/10);  dBW = dBm − 30'}
  ],
  'Power: dB = 10 log₁₀(P₂/P₁)  |  Voltage (equal Z): dB = 20 log₁₀(|V₂/V₁|)  |  0 dBm = 1 mW',
  'Voltage-ratio decibel conversions assume equal input and output impedances.',
  'decibel converter dB dBm dBW power ratio voltage ratio gain')

f('Physics & Engineering', 'Electronics', 'decibel-change-calculator', 'Decibel Gain & Change Calculator',
  'Calculate output power and voltage after a dB gain/attenuation stage and cascaded amplifier/filter stages.',
  'Pin|Input power P_in|2|W;Vin|Input voltage V_in|10|V;db1|Stage 1 gain/loss|6|dB;db2|Stage 2 gain/loss|-3|dB',
  'Net cascaded gain|db1+db2|dB;Output power P_out|Pin*10^((db1+db2)/10)|W;Output voltage V_out (equal Z)|Vin*10^((db1+db2)/20)|V;Power multiplier|10^((db1+db2)/10);Voltage multiplier|10^((db1+db2)/20)',
  'dB_total = dB₁ + dB₂;  P_out = P_in × 10^(dB/10);  V_out = V_in × 10^(dB/20)', '', 'decibel change calculator gain attenuation cascade')

m('Physics & Engineering', 'Engineering Calculations', 'three-phase-power-calculator', 'Three-Phase Power Calculator (Wye & Delta)',
  'Calculate Real (P), Reactive (Q), and Apparent (S) power plus phase voltages and currents for balanced 3-phase Wye (Y) and Delta (Δ) loads.',
  [
      {'id': 'wye', 'label': 'Balanced Wye (Star / Y) Connection', 'fields': 'VL|Line-to-Line Voltage V_L|400|V;IL|Line Current I_L|25|A;pf|Power Factor cos(φ)|0.85',
       'outputs': 'Real Power P (√3 V_L I_L cos φ)|sqrt(3)*VL*IL*pf|W;Real Power (kW)|sqrt(3)*VL*IL*pf/1000|kW;Reactive Power Q|sqrt(3)*VL*IL*sqrt(1-pf^2)|VAR;Apparent Power S|sqrt(3)*VL*IL|VA;Phase Voltage V_ph (V_L / √3)|VL/sqrt(3)|V;Phase Current I_ph (= I_L)|IL|A',
       'formula': 'Wye: V_ph = V_L / √3, I_ph = I_L;  P = √3 V_L I_L cos φ'},
      {'id': 'delta', 'label': 'Balanced Delta (Δ) Connection', 'fields': 'VL|Line-to-Line Voltage V_L|400|V;IL|Line Current I_L|25|A;pf|Power Factor cos(φ)|0.85',
       'outputs': 'Real Power P (√3 V_L I_L cos φ)|sqrt(3)*VL*IL*pf|W;Real Power (kW)|sqrt(3)*VL*IL*pf/1000|kW;Reactive Power Q|sqrt(3)*VL*IL*sqrt(1-pf^2)|VAR;Apparent Power S|sqrt(3)*VL*IL|VA;Phase Voltage V_ph (= V_L)|VL|V;Phase Current I_ph (I_L / √3)|IL/sqrt(3)|A',
       'formula': 'Delta: V_ph = V_L, I_ph = I_L / √3;  P = √3 V_L I_L cos φ'}
  ],
  'P = √3 V_L I_L cos(φ);  S = √3 V_L I_L', '', 'three phase power calculator wye star delta kVA kW')

f('Physics & Engineering', 'Engineering Calculations', 'wire-resistance-calculator', 'Wire Resistance & Voltage Drop Calculator',
  'Calculate conductor electrical resistance R = ρL/A, conductance, and 2-wire round-trip voltage drop.',
  'rho|Resistivity ρ (Copper = 1.68e-8)|1.68e-8|Ω·m;L|One-way wire length L|50|m;d|Wire diameter d|2.053|mm;I|Load current I|15|A',
  'Cross-sectional area A|pi*(d/2)^2|mm²;One-way wire resistance R|rho*L/(pi*(d/2000)^2)|Ω;Round-trip (2-wire) resistance|2*rho*L/(pi*(d/2000)^2)|Ω;Round-trip voltage drop ΔV|2*I*rho*L/(pi*(d/2000)^2)|V;Power dissipated in wire I²R|2*I^2*rho*L/(pi*(d/2000)^2)|W',
  'R = ρ · L / A;  A = π(d/2)²', 'Default diameter 2.053 mm corresponds to 12 AWG copper wire.',
  'wire resistance calculator resistivity voltage drop AWG copper')

# 3.3 Thermodynamics (9 tools + retained heat-energy and ideal-gas)
f('Physics & Engineering', 'Thermodynamics', 'heat-energy', 'Heat Energy Calculator (Sensible Heat)',
  'Estimate sensible heat energy Q = mcΔT required to change temperature without phase change.',
  'm|Mass m|2|kg;c|Specific heat capacity c|4184|J/(kg·K);dT|Temperature change ΔT|10|K',
  'Heat energy Q|m*c*dT|J;Heat energy (kJ)|m*c*dT/1000|kJ;Heat capacity C (m·c)|m*c|J/K',
  'Q = m · c · ΔT', '', 'heat energy specific heat calorimetry Q=mcΔT')

f('Physics & Engineering', 'Thermodynamics', 'ideal-gas', 'Ideal Gas Law Calculator',
  'Calculate pressure, molar volume, and internal energy for an ideal gas PV = nRT.',
  'n|Amount of substance n|1|mol;T|Absolute temperature T|300|K;V|Volume V|0.025|m³',
  'Pressure P|n*8.314462618*T/V|Pa;Pressure (kPa)|n*8.314462618*T/(V*1000)|kPa;Pressure (atm)|n*8.314462618*T/(V*101325)|atm;Translational internal energy (3/2 nRT)|1.5*n*8.314462618*T|J',
  'P·V = n·R·T  (R = 8.314462618 J/(mol·K))', 'Temperature T must be non-negative absolute Kelvin.',
  'ideal gas law PV=nRT pressure volume moles')

f('Physics & Engineering', 'Thermodynamics', 'first-law-thermodynamics-calculator', 'First Law of Thermodynamics Calculator',
  'Calculate change in internal energy ΔU = Q − W (heat added minus work done by the system).',
  'Q|Heat added to system Q|500|J;W|Work done BY system W|200|J',
  'Internal energy change ΔU (Q − W)|Q-W|J;Work in Chemistry sign convention (w = −W)|-W|J;Thermal efficiency if cyclic (W/Q)|100*W/Q|%',
  'ΔU = Q − W  (Clausius/Engineering convention: +Q heat in, +W work out)',
  'In IUPAC chemistry convention ΔU = q + w where w = −W is work done on the system.',
  'first law of thermodynamics internal energy heat work')

f('Physics & Engineering', 'Thermodynamics', 'heat-capacity-calculator', 'Heat Capacity & Calorimetry Calculator',
  'Compute total heat capacity C = Q/ΔT, specific heat c = Q/(mΔT), and molar heat capacity C_m = Q/(nΔT).',
  'Q|Heat transferred Q|8368|J;m|Mass m|0.5|kg;dT|Temperature change ΔT|4|K;M|Molar mass M|0.018015|kg/mol',
  'Total heat capacity C (Q/ΔT)|Q/dT|J/K;Specific heat capacity c (Q/(m·ΔT))|Q/(m*dT)|J/(kg·K);Moles n (m/M)|m/M|mol;Molar heat capacity C_m|Q/((m/M)*dT)|J/(mol·K)',
  'C = Q / ΔT;  c = Q / (m·ΔT);  C_m = Q / (n·ΔT)', '', 'heat capacity specific heat molar heat capacity')

f('Physics & Engineering', 'Thermodynamics', 'latent-heat-calculator', 'Latent Heat & Phase Change Calculator',
  'Calculate heat energy Q = mL absorbed or released during melting/freezing (fusion) or boiling/condensing (vaporization).',
  'm|Mass m|1.5|kg;L|Specific latent heat L (Water fusion = 334000)|334000|J/kg;T|Phase transition temperature T|273.15|K',
  'Latent heat energy Q (m·L)|m*L|J;Latent heat energy (kJ)|m*L/1000|kJ;Phase transition entropy ΔS (Q/T)|m*L/T|J/K',
  'Q = m · L;  ΔS_phase = m · L / T_transition', '', 'latent heat of fusion vaporization phase change')

f('Physics & Engineering', 'Thermodynamics', 'thermal-expansion-calculator', 'Thermal Expansion Calculator (Linear, Area & Volume)',
  'Calculate linear expansion ΔL = αL₀ΔT, area expansion, volumetric expansion, and constrained thermal stress.',
  'L0|Original length L₀|10|m;alpha|Linear expansion coeff α (Steel = 1.2e-5)|1.2e-5|1/K;dT|Temperature change ΔT|50|K;E|Youngs modulus E (Steel = 2e11)|2e11|Pa',
  'Length change ΔL|alpha*L0*dT|m;Length change (mm)|alpha*L0*dT*1000|mm;Final length L|L0*(1+alpha*dT)|m;Thermal strain ε (α·ΔT)|alpha*dT;Constrained thermal stress σ (E·α·ΔT)|E*alpha*dT/1e6|MPa',
  'ΔL = α · L₀ · ΔT;  ΔA ≈ 2α A₀ ΔT;  ΔV ≈ 3α V₀ ΔT', '', 'thermal expansion linear expansion coefficient thermal stress')

f('Physics & Engineering', 'Thermodynamics', 'carnot-efficiency-calculator', 'Carnot Efficiency Calculator',
  'Calculate maximum theoretical Carnot heat engine efficiency η_max = 1 − T_C/T_H and Carnot refrigerator/heat-pump COP.',
  'TH|Hot reservoir temperature T_H|600|K;TC|Cold reservoir temperature T_C|300|K',
  'Carnot efficiency η_max|100*(1-TC/TH)|%;Temperature ratio (T_C / T_H)|TC/TH;Carnot Refrigerator COP_R|TC/(TH-TC);Carnot Heat Pump COP_HP|TH/(TH-TC)',
  'η_Carnot = 1 − T_C / T_H  (Temperatures must be in absolute Kelvin with 0 < T_C < T_H)',
  '', 'carnot efficiency heat engine COP refrigerator second law')

f('Physics & Engineering', 'Thermodynamics', 'heat-engine-efficiency-calculator', 'Heat Engine Efficiency Calculator',
  'Calculate thermal efficiency η = W_out/Q_H, waste heat Q_C, and compare against the Carnot thermodynamic limit.',
  'QH|Heat input from hot reservoir Q_H|1000|J;QC|Heat rejected to cold reservoir Q_C|600|J;TH|Hot reservoir T_H|600|K;TC|Cold reservoir T_C|300|K',
  'Useful work output W_out (Q_H − Q_C)|QH-QC|J;Actual thermal efficiency η|100*(QH-QC)/QH|%;Maximum Carnot efficiency η_Carnot|100*(1-TC/TH)|%;Second-law efficiency (η / η_Carnot)|100*((QH-QC)/QH)/(1-TC/TH)|%',
  'W_out = Q_H − Q_C;  η = W_out / Q_H = 1 − Q_C / Q_H ≤ 1 − T_C / T_H', '', 'heat engine efficiency thermal work waste heat')

f('Physics & Engineering', 'Thermodynamics', 'entropy-change-calculator', 'Entropy Change Calculator',
  'Calculate entropy change ΔS for isothermal heat transfer and finite-temperature heating of a substance.',
  'm|Mass m|2|kg;c|Specific heat c|4184|J/(kg·K);T1|Initial temperature T₁|293.15|K;T2|Final temperature T₂|353.15|K',
  'Entropy change ΔS (mc ln(T₂/T₁))|m*c*ln(T2/T1)|J/K;Heat transferred Q (mc(T₂−T₁))|m*c*(T2-T1)|J;Average temperature|0.5*(T1+T2)|K',
  'ΔS = m · c · ln(T₂ / T₁)  (T₁, T₂ > 0 K)', '', 'entropy change calculator thermodynamics reversible heating')

m('Physics & Engineering', 'Thermodynamics', 'gas-process-calculator', 'Gas Process Calculator (Isothermal, Isobaric, Isochoric & Adiabatic)',
  'Calculate work W, heat Q, internal energy change ΔU, and entropy change ΔS for ideal gas thermodynamic processes.',
  [
      {'id': 'isothermal', 'label': 'Isothermal Process (Constant Temperature T)', 'fields': 'n|Moles n|1|mol;T|Temperature T|300|K;V1|Initial volume V₁|0.01|m³;V2|Final volume V₂|0.02|m³',
       'outputs': 'Work done by gas W (nRT ln(V₂/V₁))|n*8.314462618*T*ln(V2/V1)|J;Heat added Q (= W)|n*8.314462618*T*ln(V2/V1)|J;Internal energy change ΔU|0|J;Entropy change ΔS (nR ln(V₂/V₁))|n*8.314462618*ln(V2/V1)|J/K;Initial pressure P₁|n*8.314462618*T/V1|Pa;Final pressure P₂|n*8.314462618*T/V2|Pa',
       'formula': 'Isothermal (ΔT = 0): ΔU = 0,  W = Q = nRT ln(V₂/V₁)'},
      {'id': 'isobaric', 'label': 'Isobaric Process (Constant Pressure P)', 'fields': 'P|Pressure P|101325|Pa;V1|Initial volume V₁|0.01|m³;V2|Final volume V₂|0.02|m³;gamma|Heat capacity ratio γ (C_p/C_v)|1.4',
       'outputs': 'Work done by gas W (P(V₂−V₁))|P*(V2-V1)|J;Internal energy change ΔU (W/(γ−1))|P*(V2-V1)/(gamma-1)|J;Heat added Q (γ/(γ−1) PΔV)|gamma*P*(V2-V1)/(gamma-1)|J',
       'formula': 'Isobaric (ΔP = 0): W = P(V₂ − V₁),  ΔU = nC_VΔT = PΔV/(γ−1),  Q = nC_PΔT'},
      {'id': 'isochoric', 'label': 'Isochoric Process (Constant Volume V)', 'fields': 'n|Moles n|1|mol;T1|Initial temperature T₁|300|K;T2|Final temperature T₂|450|K;gamma|Heat capacity ratio γ (C_p/C_v)|1.4',
       'outputs': 'Work done by gas W|0|J;Heat added Q (= ΔU)|n*(8.314462618/(gamma-1))*(T2-T1)|J;Internal energy change ΔU|n*(8.314462618/(gamma-1))*(T2-T1)|J;Entropy change ΔS|n*(8.314462618/(gamma-1))*ln(T2/T1)|J/K',
       'formula': 'Isochoric (ΔV = 0): W = 0,  Q = ΔU = n C_V (T₂ − T₁)'},
      {'id': 'adiabatic', 'label': 'Reversible Adiabatic (Isentropic) Process (PV^γ = const)', 'fields': 'P1|Initial pressure P₁|101325|Pa;V1|Initial volume V₁|0.01|m³;V2|Final volume V₂|0.02|m³;gamma|Adiabatic index γ (C_p/C_v)|1.4',
       'outputs': 'Final pressure P₂ (P₁(V₁/V₂)^γ)|P1*(V1/V2)^gamma|Pa;Work done by gas W|(P1*V1-(P1*(V1/V2)^gamma)*V2)/(gamma-1)|J;Internal energy change ΔU (−W)|-(P1*V1-(P1*(V1/V2)^gamma)*V2)/(gamma-1)|J;Heat transferred Q|0|J',
       'formula': 'Adiabatic (Q = 0): P₁V₁^γ = P₂V₂^γ,  W = (P₁V₁ − P₂V₂)/(γ − 1),  ΔU = −W'}
  ],
  'Isothermal (T=const) | Isobaric (P=const) | Isochoric (V=const) | Adiabatic (Q=0)',
  '', 'gas process isothermal isobaric isochoric adiabatic work heat')

f('Physics & Engineering', 'Thermodynamics', 'thermal-conductivity-calculator', 'Thermal Conductivity Calculator (Fourier’s Law)',
  'Calculate steady-state conductive heat transfer rate q = kAΔT/d, heat flux, and thermal resistance R_th.',
  'k|Thermal conductivity k|0.8|W/(m·K);A|Surface area A|12|m²;dT|Temperature difference ΔT|25|K;d|Wall thickness d|0.15|m',
  'Heat transfer rate q|k*A*dT/d|W;Heat flux (q / A)|k*dT/d|W/m²;Thermal resistance R_th (d/(kA))|d/(k*A)|K/W',
  'q = k · A · ΔT / d;  R_th = d / (k · A)', '', 'thermal conductivity fouriers law heat conduction R-value')

# 3.4 Fluid Mechanics (8 tools + retained buoyant-force)
f('Physics & Engineering', 'Fluid Mechanics', 'buoyant-force', 'Buoyant Force Calculator (Archimedes’ Principle)',
  'Find upward buoyant force and displaced fluid mass based on Archimedes’ principle.',
  'rho|Fluid density ρ|1000|kg/m³;V|Displaced volume V|0.002|m³;g|Gravity g|9.80665|m/s²',
  'Buoyant force F_b|rho*V*g|N;Displaced fluid mass|rho*V|kg',
  'F_b = ρ_fluid · g · V_displaced', '', 'buoyant force archimedes principle fluid buoyancy')

f('Physics & Engineering', 'Fluid Mechanics', 'bernoulli-equation-calculator', 'Bernoulli Equation Calculator',
  'Solve downstream pressure P₂, dynamic pressure, and total head along a streamline of inviscid incompressible flow.',
  'rho|Fluid density ρ|1000|kg/m³;P1|Upstream pressure P₁|200000|Pa;v1|Upstream speed v₁|2|m/s;h1|Upstream elevation h₁|5|m;v2|Downstream speed v₂|6|m/s;h2|Downstream elevation h₂|2|m',
  'Downstream pressure P₂|P1+0.5*rho*(v1^2-v2^2)+rho*9.80665*(h1-h2)|Pa;Upstream dynamic pressure (½ρv₁²)|0.5*rho*v1^2|Pa;Downstream dynamic pressure (½ρv₂²)|0.5*rho*v2^2|Pa;Total Bernoulli head H|P1/(rho*9.80665)+v1^2/(2*9.80665)+h1|m',
  'P₁ + ½ρv₁² + ρgh₁ = P₂ + ½ρv₂² + ρgh₂',
  'Assumes steady, incompressible, frictionless flow along a streamline.',
  'bernoulli equation fluid pressure velocity head')

f('Physics & Engineering', 'Fluid Mechanics', 'reynolds-number-calculator', 'Reynolds Number Calculator',
  'Calculate dimensionless Reynolds number Re = ρvD/μ and kinematic viscosity ν to determine laminar vs. turbulent flow.',
  'rho|Fluid density ρ|1000|kg/m³;v|Flow velocity v|1.5|m/s;D|Characteristic diameter D|0.05|m;mu|Dynamic viscosity μ|0.001|Pa·s',
  'Reynolds number Re|rho*v*D/mu;Kinematic viscosity ν (μ/ρ)|mu/rho|m²/s;Laminar friction factor (64/Re)|64/(rho*v*D/mu)',
  'Re = (ρ · v · D) / μ = (v · D) / ν',
  'In circular pipe flow: Re < 2,300 is Laminar; 2,300 ≤ Re ≤ 4,000 is Transitional; Re > 4,000 is Turbulent.',
  'reynolds number laminar turbulent viscosity pipe flow')

f('Physics & Engineering', 'Fluid Mechanics', 'viscosity-calculator', 'Viscosity & Shear Stress Calculator',
  'Convert between dynamic viscosity μ and kinematic viscosity ν = μ/ρ, and compute Newtonian shear stress τ = μ(du/dy).',
  'mu|Dynamic viscosity μ|0.001|Pa·s;rho|Fluid density ρ|1000|kg/m³;dudy|Velocity gradient du/dy|500|1/s',
  'Kinematic viscosity ν (μ/ρ)|mu/rho|m²/s;Dynamic viscosity in centipoise (cP)|mu*1000|cP;Kinematic viscosity in centistokes (cSt)|(mu/rho)*1e6|cSt;Shear stress τ (μ·du/dy)|mu*dudy|Pa',
  'ν = μ / ρ;  τ = μ (du / dy)', '', 'viscosity calculator dynamic kinematic centipoise centistokes shear stress')

f('Physics & Engineering', 'Fluid Mechanics', 'flow-rate-calculator', 'Flow Rate Calculator (Volumetric & Mass Flow)',
  'Calculate volumetric flow rate Q = Av and mass flow rate ṁ = ρQ in a circular pipe or channel.',
  'D|Pipe inner diameter D|0.1|m;v|Flow velocity v|2.5|m/s;rho|Fluid density ρ|1000|kg/m³',
  'Cross-sectional area A|pi*(D/2)^2|m²;Volumetric flow rate Q (m³/s)|pi*(D/2)^2*v|m³/s;Volumetric flow rate (L/s)|pi*(D/2)^2*v*1000|L/s;Mass flow rate ṁ (ρ·Q)|rho*pi*(D/2)^2*v|kg/s',
  'Q = A · v = π(D/2)² · v;  ṁ = ρ · Q', '', 'flow rate calculator volumetric mass flow pipe velocity')

f('Physics & Engineering', 'Engineering Calculations', 'pipe-pressure-drop-calculator', 'Pipe Pressure Drop Calculator (Darcy-Weisbach)',
  'Calculate frictional pressure drop ΔP and head loss h_f in a pipe using the Darcy-Weisbach equation.',
  'fD|Darcy friction factor f_D|0.02;L|Pipe length L|50|m;D|Pipe diameter D|0.1|m;rho|Fluid density ρ|1000|kg/m³;v|Flow velocity v|2|m/s',
  'Pressure drop ΔP|fD*(L/D)*0.5*rho*v^2|Pa;Pressure drop (kPa)|fD*(L/D)*0.5*rho*v^2/1000|kPa;Head loss h_f|fD*(L/D)*v^2/(2*9.80665)|m;Velocity head (v²/2g)|v^2/(2*9.80665)|m',
  'ΔP = f_D · (L / D) · (ρ v² / 2);  h_f = ΔP / (ρ g)', '', 'pipe pressure drop darcy weisbach head loss friction factor')

f('Physics & Engineering', 'Engineering Calculations', 'hydraulic-power-calculator', 'Hydraulic & Pump Power Calculator',
  'Calculate fluid hydraulic power P_hyd = Q·ΔP = ρgQH and required pump shaft input power at efficiency η.',
  'Q|Volumetric flow rate Q|0.05|m³/s;H|Total dynamic head H|30|m;rho|Fluid density ρ|1000|kg/m³;eff|Pump efficiency η|80|%',
  'Hydraulic power P_hyd (ρgQH)|rho*9.80665*Q*H|W;Hydraulic power (kW)|rho*9.80665*Q*H/1000|kW;Required shaft power P_shaft|(rho*9.80665*Q*H)/(eff/100)|W;Pressure differential ΔP (ρgH)|rho*9.80665*H|Pa',
  'P_hyd = ρ · g · Q · H = Q · ΔP;  P_shaft = P_hyd / η', '', 'hydraulic power pump shaft power head flow rate')

f('Physics & Engineering', 'Fluid Mechanics', 'continuity-equation-calculator', 'Continuity Equation Calculator (A₁v₁ = A₂v₂)',
  'Calculate downstream fluid velocity v₂ and flow rate from pipe diameters D₁ and D₂ for incompressible flow.',
  'D1|Upstream pipe diameter D₁|0.12|m;v1|Upstream velocity v₁|2|m/s;D2|Downstream pipe diameter D₂|0.06|m',
  'Downstream velocity v₂|v1*(D1/D2)^2|m/s;Volumetric flow rate Q|pi*(D1/2)^2*v1|m³/s;Upstream area A₁|pi*(D1/2)^2|m²;Downstream area A₂|pi*(D2/2)^2|m²',
  'A₁ v₁ = A₂ v₂  ⇒  v₂ = v₁ (D₁ / D₂)²', 'Assumes steady, incompressible fluid flow.', 'continuity equation fluid mechanics pipe constriction')

f('Physics & Engineering', 'Fluid Mechanics', 'hydrostatic-pressure-calculator', 'Hydrostatic Pressure Calculator',
  'Calculate gauge hydrostatic pressure P_gauge = ρgh and absolute pressure P_abs = P₀ + ρgh at depth h.',
  'rho|Fluid density ρ|1025|kg/m³;h|Depth below surface h|20|m;P0|Surface atmospheric pressure P₀|101325|Pa;g|Gravity g|9.80665|m/s²',
  'Gauge pressure (ρgh)|rho*g*h|Pa;Absolute pressure (P₀ + ρgh)|P0+rho*g*h|Pa;Absolute pressure (atm)|(P0+rho*g*h)/101325|atm;Absolute pressure (bar)|(P0+rho*g*h)/1e5|bar',
  'P_gauge = ρ · g · h;  P_abs = P₀ + ρ · g · h', '', 'hydrostatic pressure depth fluid pressure gauge absolute')

# 1.5 & 3.5 Waves, Optics & Electromagnetism
m('Physics & Engineering', 'Waves & Oscillations', 'frequency-period-calculator', 'Frequency, Period & Angular Frequency Calculator',
  'Convert between frequency (f), oscillation period (T = 1/f), and angular frequency (ω = 2πf).',
  [
      {'id': 'from_f', 'label': 'From Frequency f (Hz)', 'fields': 'f|Frequency f|50|Hz',
       'outputs': 'Period T (1/f)|1/f|s;Period (ms)|1000/f|ms;Angular frequency ω (2πf)|2*pi*f|rad/s;RPM (60·f)|60*f|rpm',
       'formula': 'T = 1 / f;  ω = 2πf'},
      {'id': 'from_T', 'label': 'From Period T (seconds)', 'fields': 'T|Period T|0.02|s',
       'outputs': 'Frequency f (1/T)|1/T|Hz;Angular frequency ω (2π/T)|2*pi/T|rad/s',
       'formula': 'f = 1 / T;  ω = 2π / T'},
      {'id': 'from_omega', 'label': 'From Angular Frequency ω (rad/s)', 'fields': 'w|Angular frequency ω|314.159265|rad/s',
       'outputs': 'Frequency f (ω/(2π))|w/(2*pi)|Hz;Period T (2π/ω)|2*pi/w|s',
       'formula': 'f = ω / (2π);  T = 2π / ω'}
  ],
  'T = 1 / f;  ω = 2πf = 2π / T', '', 'frequency period angular frequency hertz')

alias_mode('Physics & Engineering', 'Waves & Oscillations', 'frequency-period', 'Frequency & Period Calculator',
           'Find the period for any positive frequency.', 'frequency-period-calculator', 'from_f',
           'f|Frequency|50|Hz', 'Period|1/f|s;Angular frequency|2*pi*f|rad/s', 'T=1/f; ω=2πf')

m('Physics & Engineering', 'Waves & Oscillations', 'wave-calculator', 'Wave Calculator (Wave Speed, Wavelength & Frequency)',
  'Solve the fundamental wave relationship v = fλ for Wave Speed, Wavelength, or Frequency.',
  [
      {'id': 'speed', 'label': 'Find Wave Speed (v = f × λ)', 'fields': 'f|Frequency f|440|Hz;l|Wavelength λ|0.78|m',
       'outputs': 'Wave speed v|f*l|m/s;Period T (1/f)|1/f|s;Wave number k (2π/λ)|2*pi/l|rad/m',
       'formula': 'v = f · λ'},
      {'id': 'wavelength', 'label': 'Find Wavelength (λ = v / f)', 'fields': 'v|Wave propagation speed v|343|m/s;f|Frequency f|440|Hz',
       'outputs': 'Wavelength λ (v/f)|v/f|m;Period T (1/f)|1/f|s',
       'formula': 'λ = v / f'},
      {'id': 'frequency', 'label': 'Find Frequency (f = v / λ)', 'fields': 'v|Wave propagation speed v|343|m/s;l|Wavelength λ|0.78|m',
       'outputs': 'Frequency f (v/λ)|v/l|Hz;Period T (λ/v)|l/v|s',
       'formula': 'f = v / λ'}
  ],
  'v = f · λ  |  λ = v / f  |  f = v / λ', '', 'wave speed wavelength frequency wave equation')

alias_mode('Physics & Engineering', 'Waves & Oscillations', 'wave-speed', 'Wave Speed Calculator',
           'Find wave velocity from frequency and wavelength.', 'wave-calculator', 'speed',
           'f|Frequency|440|Hz;l|Wavelength|0.78|m', 'Wave speed|f*l|m/s', 'v=fλ')
alias_mode('Physics & Engineering', 'Electromagnetism', 'frequency-wavelength', 'Frequency to Wavelength',
           'Convert electromagnetic wave frequency to wavelength in vacuum.', 'electromagnetic-wave-calculator', 'from_f',
           'f|Frequency|100000000|Hz', 'Wavelength|299792458/f|m', 'λ = c/f (in vacuum)')

f('Physics & Engineering', 'Waves & Oscillations', 'pendulum-period', 'Simple Pendulum Calculator',
  'Estimate small-angle simple pendulum oscillation period T ≈ 2π√(L/g) and natural frequency.',
  'L|Pendulum length L|1|m;g|Gravity g|9.80665|m/s²',
  'Period T|2*pi*sqrt(L/g)|s;Frequency f|1/(2*pi*sqrt(L/g))|Hz;Angular frequency ω|sqrt(g/L)|rad/s',
  'T ≈ 2π √(L / g)', 'Valid for small oscillation amplitudes (θ₀ ≪ 1 rad).', 'simple pendulum period frequency length')

m('Physics & Engineering', 'Waves & Oscillations', 'standing-wave-calculator', 'Standing Wave Calculator (Strings & Pipes)',
  'Calculate harmonic resonant frequencies f_n and wavelengths λ_n for vibrating strings, open pipes, and closed-end pipes.',
  [
      {'id': 'string_open', 'label': 'Stretched String or Open-Open Pipe (f_n = n·v/(2L))', 'fields': 'L|Length L|0.65|m;v|Wave speed v|429|m/s;n|Harmonic number n (1, 2, 3…)|1',
       'outputs': 'Harmonic frequency f_n|n*v/(2*L)|Hz;Wavelength λ_n (2L/n)|2*L/n|m;Fundamental frequency f₁|v/(2*L)|Hz',
       'formula': 'f_n = n · v / (2L);  λ_n = 2L / n  (n = 1, 2, 3, …)'},
      {'id': 'closed_pipe', 'label': 'One-End-Closed Pipe (Odd Harmonics m = 1, 3, 5…)', 'fields': 'L|Pipe length L|0.85|m;v|Speed of sound v|343|m/s;m|Odd harmonic index k (m = 2k−1)|1',
       'outputs': 'Harmonic number (2k−1)|2*m-1;Resonant frequency f|((2*m-1)*v)/(4*L)|Hz;Wavelength λ (4L/(2k−1))|4*L/(2*m-1)|m;Fundamental f₁ (v/(4L))|v/(4*L)|Hz',
       'formula': 'f_{2k−1} = (2k − 1) · v / (4L)  (only odd harmonics exist)'}
  ],
  'String/Open Pipe: f_n = nv/(2L)  |  Closed Pipe: f = (2k−1)v/(4L)', '', 'standing wave harmonics resonant frequency string pipe')

f('Physics & Engineering', 'Waves & Oscillations', 'doppler-effect-calculator', 'Doppler Effect Calculator',
  'Calculate observed frequency f_obs and wavelength shift for a moving wave source and/or moving observer.',
  'f0|Emitted source frequency f₀|500|Hz;v|Wave speed in medium v|343|m/s;vo|Observer speed toward source v_o|15|m/s;vs|Source speed toward observer v_s|25|m/s',
  'Observed frequency f_obs|f0*(v+vo)/(v-vs)|Hz;Frequency shift Δf|f0*(v+vo)/(v-vs)-f0|Hz;Observed wavelength λ_obs|(v-vs)/f0|m',
  'f_obs = f₀ · (v + v_o) / (v − v_s)  (positive v_o, v_s toward each other; requires v_s < v)',
  'Use negative v_o or v_s if receding.', 'doppler effect frequency shift moving source observer')

f('Physics & Engineering', 'Waves & Oscillations', 'sound-intensity-level-calculator', 'Sound Intensity & Decibel Level Calculator',
  'Calculate sound pressure/intensity level in dB SPL (β = 10 log₁₀(I/I₀)) and inverse-square intensity I = P/(4πr²).',
  'P|Acoustic source power P|0.1|W;r|Distance from source r|5|m',
  'Sound intensity I (P/(4πr²))|P/(4*pi*r^2)|W/m²;Sound intensity level β (ref 10⁻¹² W/m²)|10*log10((P/(4*pi*r^2))/1e-12)|dB;Level at double distance (2r)|10*log10((P/(4*pi*(2*r)^2))/1e-12)|dB',
  'I = P / (4πr²);  β = 10 log₁₀(I / I₀) with I₀ = 10⁻¹² W/m²', '', 'sound intensity level decibels SPL inverse square law')

m('Physics & Engineering', 'Electromagnetism', 'electromagnetic-wave-calculator', 'Electromagnetic Wave & Photon Energy Calculator',
  'Calculate vacuum wavelength λ = c/f, photon energy E = hf (in Joules and eV), photon momentum, and E/B field amplitudes.',
  [
      {'id': 'from_f', 'label': 'From Frequency f (Hz) → Wavelength & Photon Energy', 'fields': 'f|Frequency f|5e14|Hz',
       'outputs': 'Wavelength λ (c/f)|299792458/f|m;Wavelength in nm|(299792458/f)*1e9|nm;Photon energy E (h·f)|6.62607015e-34*f|J;Photon energy (eV)|(6.62607015e-34*f)/1.602176634e-19|eV;Wave number k (2π/λ)|2*pi*f/299792458|rad/m',
       'formula': 'λ = c / f;  E = h · f  (c = 299,792,458 m/s, h = 6.62607015×10⁻³⁴ J·s)'},
      {'id': 'fields', 'label': 'EM Field Amplitudes (E₀ = c·B₀ & Poynting Intensity)', 'fields': 'E0|Electric field amplitude E₀|100|V/m',
       'outputs': 'Magnetic field amplitude B₀ (E₀/c)|E0/299792458|T;Average intensity I (½ c ε₀ E₀²)|0.5*299792458*8.8541878188e-12*E0^2|W/m²;Radiation pressure (I/c)|0.5*8.8541878188e-12*E0^2|Pa',
       'formula': 'B₀ = E₀ / c;  I_avg = ½ c ε₀ E₀²'}
  ],
  'c = f·λ  |  E = h·f = hc/λ  |  E₀ = c·B₀', '', 'electromagnetic wave wavelength frequency photon energy poynting')

f('Physics & Engineering', 'Electromagnetism', 'electric-field-calculator', 'Electric Field & Coulomb’s Law Calculator',
  'Calculate electric field strength E = k|q|/r² and electrostatic Coulomb force F = kq₁q₂/r².',
  'q1|Source charge q₁|2e-6|C;q2|Test charge q₂|1e-6|C;r|Separation distance r|0.5|m',
  'Electric field E at r (k|q₁|/r²)|8.9875517923e9*abs(q1)/r^2|N/C;Coulomb force F (k·q₁·q₂/r²)|8.9875517923e9*q1*q2/r^2|N;Force magnitude|8.9875517923e9*abs(q1*q2)/r^2|N',
  'E = k_e |q₁| / r²;  F = k_e q₁ q₂ / r²  (k_e = 8.98755 × 10⁹ N·m²/C²)', '', 'electric field coulombs law point charge')

f('Physics & Engineering', 'Electromagnetism', 'electric-potential-calculator', 'Electric Potential & Potential Energy Calculator',
  'Calculate electrostatic potential V = kq/r and electrostatic potential energy U = kq₁q₂/r.',
  'q1|Source charge q₁|5e-6|C;q2|Test charge q₂|2e-6|C;r|Radial distance r|0.25|m',
  'Electric potential V (k·q₁/r)|8.9875517923e9*q1/r|V;Electrostatic potential energy U (k·q₁q₂/r)|8.9875517923e9*q1*q2/r|J;Electric field magnitude E|8.9875517923e9*abs(q1)/r^2|V/m',
  'V = k_e q₁ / r;  U = q₂ V = k_e q₁ q₂ / r', '', 'electric potential voltage electrostatic energy')

m('Physics & Engineering', 'Electromagnetism', 'magnetic-force-calculator', 'Magnetic Force Calculator (Lorentz & Wire Force)',
  'Calculate magnetic Lorentz force on a moving charge (F = |q|vB sin θ) and Laplace force on a current-carrying wire (F = ILB sin θ).',
  [
      {'id': 'charge', 'label': 'Moving Charge in Magnetic Field (F = |q|vB sin θ)', 'fields': 'q|Charge magnitude q|1.602176634e-19|C;v|Particle speed v|2e6|m/s;B|Magnetic field B|0.5|T;angle|Angle θ (between v & B)|90|°',
       'outputs': 'Magnetic Lorentz force F|abs(q)*v*B*sin(angle*pi/180)|N;Force in eV/m|(abs(q)*v*B*sin(angle*pi/180))/1.602176634e-19|eV/m',
       'formula': 'F = |q| · v · B · sin(θ)'},
      {'id': 'wire', 'label': 'Current-Carrying Conductor (F = I·L·B sin θ)', 'fields': 'I|Current I|12|A;L|Wire length L|1.5|m;B|Magnetic field B|0.8|T;angle|Angle θ (between wire & B)|90|°',
       'outputs': 'Magnetic force on wire F|I*L*B*sin(angle*pi/180)|N;Force per unit length (F/L)|I*B*sin(angle*pi/180)|N/m',
       'formula': 'F = I · L · B · sin(θ)'}
  ],
  'F_charge = |q|vB sin θ  |  F_wire = ILB sin θ', '', 'magnetic force lorentz force current wire magnetic field')

f('Physics & Engineering', 'Electromagnetism', 'magnetic-flux-calculator', 'Magnetic Flux Calculator',
  'Calculate magnetic flux Φ_B = B·A·cos(θ) and N-turn coil flux linkage.',
  'B|Magnetic field B|0.4|T;A|Loop area A|0.05|m²;angle|Angle θ (between B and area normal)|30|°;N|Number of coil turns N|100',
  'Single-loop magnetic flux Φ_B|B*A*cos(angle*pi/180)|Wb;Total flux linkage (N·Φ_B)|N*B*A*cos(angle*pi/180)|Wb·turns',
  'Φ_B = B · A · cos(θ);  Λ = N · Φ_B', '', 'magnetic flux webers coil flux linkage')

f('Physics & Engineering', 'Electromagnetism', 'faradays-law-calculator', 'Faraday’s Law of Induction Calculator',
  'Calculate induced electromotive force (EMF) ε = −N(ΔΦ_B/Δt) using Faraday’s law and Lenz’s law.',
  'N|Number of coil turns N|200;dPhi|Change in magnetic flux ΔΦ_B|0.03|Wb;dt|Time interval Δt|0.05|s',
  'Induced EMF magnitude ε|N*abs(dPhi)/dt|V;Signed induced EMF (−N ΔΦ/Δt)|-N*dPhi/dt|V;Rate of flux change (ΔΦ/Δt)|dPhi/dt|Wb/s',
  'ε = −N · (ΔΦ_B / Δt)', 'Minus sign reflects Lenz\'s law (induced EMF opposes the change in magnetic flux).',
  'faradays law electromagnetic induction induced EMF lenz law')

# Optics
f('Physics & Engineering', 'Optics', 'snells-law', 'Snell’s Law & Critical Angle Calculator',
  'Calculate angle of refraction θ₂ using Snell’s law n₁sinθ₁ = n₂sinθ₂.',
  'n1|Refractive index n₁|1;n2|Refractive index n₂|1.5;ang|Incident angle θ₁|30|°',
  'Refracted angle θ₂|asin(n1*sin(ang*pi/180)/n2)*180/pi|°;Brewster polarization angle|atan(n2/n1)*180/pi|°',
  'n₁ sin(θ₁) = n₂ sin(θ₂)', 'If n₁ sin(θ₁) > n₂, total internal reflection occurs.',
  'snells law refraction angle refractive index')

f('Physics & Engineering', 'Optics', 'thin-lens', 'Thin Lens Equation Calculator',
  'Find image distance d_i, linear magnification m, and optical power in Diopters for a thin lens.',
  'f|Focal length f|10|cm;o|Object distance d_o|30|cm',
  'Image distance d_i|1/(1/f-1/o)|cm;Linear magnification m|-1/(o*(1/f-1/o));Optical power P (100/f)|100/f|D',
  '1/f = 1/d_o + 1/d_i;  m = −d_i / d_o', 'Requires d_o ≠ f; positive d_i indicates a real image.',
  'thin lens equation focal length image distance magnification')

f('Physics & Engineering', 'Optics', 'combined-lens-mirror-calculator', 'Combined Two-Lens Optical System Calculator',
  'Calculate equivalent focal length f_eq, optical power in Diopters, and back focal length for two thin lenses separated by distance d.',
  'f1|Focal length of Lens 1 (f₁)|15|cm;f2|Focal length of Lens 2 (f₂)|20|cm;d|Separation distance d|5|cm',
  'Equivalent focal length f_eq|(f1*f2)/(f1+f2-d)|cm;Equivalent optical power P_eq|100*(f1+f2-d)/(f1*f2)|D;Contact limit focal length (d=0)|(f1*f2)/(f1+f2)|cm;Back focal length BFL|f2*(f1-d)/(f1+f2-d)|cm',
  '1 / f_eq = 1/f₁ + 1/f₂ − d/(f₁f₂)', '', 'combined lens focal length gullstrand optical power diopters')

f('Physics & Engineering', 'Optics', 'optical-magnification-calculator', 'Optical Magnification Calculator',
  'Calculate linear magnification m = h_i/h_o = −d_i/d_o, image height, and simple magnifier angular magnification.',
  'ho|Object height h_o|4|cm;do_d|Object distance d_o|20|cm;di_d|Image distance d_i|40|cm',
  'Linear magnification m (−d_i/d_o)|-di_d/do_d;Image height h_i|ho*(-di_d/do_d)|cm;Magnification magnitude|abs(di_d/do_d);Equivalent focal length f|(do_d*di_d)/(do_d+di_d)|cm',
  'm = h_i / h_o = −d_i / d_o', '', 'optical magnification image height object distance')

m('Physics & Engineering', 'Optics', 'interference-diffraction-calculator', 'Interference & Diffraction Calculator',
  'Calculate fringe spacing and diffraction angles for Young’s Double-Slit Interference, Single-Slit Diffraction, and Bragg X-Ray Diffraction.',
  [
      {'id': 'double_slit', 'label': 'Young’s Double-Slit Interference (Fringe Spacing)', 'fields': 'lam|Wavelength λ|550|nm;d|Slit separation d|0.25|mm;L|Screen distance L|1.5|m;m|Fringe order m|1',
       'outputs': 'Bright fringe position y_m|m*(lam*1e-9)*L/(d*1e-3)*1000|mm;Fringe spacing Δy (λL/d)|(lam*1e-9)*L/(d*1e-3)*1000|mm;Diffraction angle θ_m|asin(m*(lam*1e-9)/(d*1e-3))*180/pi|°',
       'formula': 'd sin θ = mλ;  y_m ≈ m λ L / d'},
      {'id': 'single_slit', 'label': 'Single-Slit Diffraction (Dark Minima & Central Maximum)', 'fields': 'lam|Wavelength λ|632.8|nm;a|Slit width a|0.15|mm;L|Screen distance L|2|m;m|Dark minimum order m (≥1)|1',
       'outputs': 'First minimum angle θ_m|asin(m*(lam*1e-9)/(a*1e-3))*180/pi|°;Distance to m-th dark fringe y_m|L*tan(asin(m*(lam*1e-9)/(a*1e-3)))*1000|mm;Central bright maximum width (2y₁)|2*L*tan(asin((lam*1e-9)/(a*1e-3)))*1000|mm',
       'formula': 'a sin θ = mλ  (dark minima for m = ±1, ±2, …)'},
      {'id': 'bragg', 'label': 'Bragg Crystal Diffraction (2d sin θ = mλ)', 'fields': 'd|Lattice plane spacing d|0.282|nm;theta|Glancing angle θ|15|°;m|Diffraction order m|1',
       'outputs': 'Diffracted wavelength λ (2d sin θ / m)|2*d*sin(theta*pi/180)/m|nm;Scattering angle (2θ)|2*theta|°',
       'formula': '2 d sin θ = m λ'}
  ],
  'Double-Slit: d sin θ = mλ  |  Single-Slit Minima: a sin θ = mλ  |  Bragg: 2d sin θ = mλ',
  '', 'interference diffraction youngs double slit single slit bragg law')

# ==============================================================================
# CATEGORY 6: STATISTICS & PROBABILITY
# Subcategories: Descriptive Statistics, Probability, Probability Distributions,
#                Statistical Testing, Regression, Correlation,
#                Statistical Inference, Bayesian Statistics
# ==============================================================================
s('Statistics & Probability', 'Descriptive Statistics', 'statistics-calculator', 'Statistics Calculator (15 Metrics)',
  'Compute count, sum, mean, median, mode, population/sample variance and standard deviation, range, Q1, Q3, and IQR.',
  'stats', 'Sample variance s² = Σ(x−x̄)²/(n−1) and population variance σ² = Σ(x−μ)²/n.',
  'Accepts up to 10,000 numbers separated by commas or spaces.', 'descriptive statistics mean median mode variance standard deviation quartiles IQR')

s('Statistics & Probability', 'Correlation', 'correlation-calculator', 'Correlation & Linear Regression Calculator',
  'Calculate Pearson correlation coefficient r, R², and least-squares regression line y = mx + b.',
  'regression', 'Pearson r = S_xy / √(S_xx S_yy); slope m = S_xy / S_xx; intercept b = ȳ − mx̄.',
  'Association does not establish causation.', 'correlation pearson r linear regression least squares R squared')

s('Statistics & Probability', 'Correlation', 'covariance-calculator', 'Covariance Calculator (Sample & Population)',
  'Compute sample covariance Cov_s(X, Y), population covariance Cov_p(X, Y), and Pearson correlation from matched X/Y observations.',
  'covariance_calc', 'Sample Cov(X,Y) = Σ(x_i − x̄)(y_i − ȳ) / (n − 1);  Population Cov = Σ(x_i − μ_x)(y_i − μ_y) / n.',
  '', 'covariance calculator sample covariance population covariance')

f('Statistics & Probability', 'Statistical Inference', 'z-score', 'Z-Score Calculator',
  'Find how many standard deviations an observed value x differs from the mean μ.',
  'x|Observed value x|85;mean|Mean μ|70;sd|Standard deviation σ|10',
  'Z-score|(x-mean)/sd;Deviation from mean (x − μ)|x-mean',
  'z = (x − μ) / σ  (requires σ > 0)', '', 'z score standard score normal deviate')

f('Statistics & Probability', 'Statistical Inference', 'standard-error', 'Standard Error Calculator',
  'Estimate the standard error of the sample mean SE = s / √n.',
  'sd|Sample standard deviation s|12;n|Sample size n|64',
  'Standard error SE|sd/sqrt(n);Sample variance s²|sd^2',
  'SE = s / √n', '', 'standard error of the mean SEM sample size')

f('Statistics & Probability', 'Statistical Inference', 'confidence-interval', 'Confidence Interval Calculator',
  'Estimate a 95% confidence interval for a mean using sample mean, standard deviation, and sample size.',
  'mean|Sample mean x̄|120;sd|Sample standard deviation s|20;n|Sample size n|100',
  'Lower bound (95%)|mean-1.96*sd/sqrt(n);Upper bound (95%)|mean+1.96*sd/sqrt(n);Margin of error (±)|1.96*sd/sqrt(n);Standard error SE|sd/sqrt(n)',
  'CI = x̄ ± z_{α/2} · (s / √n)', '', 'confidence interval margin of error 95% CI')

f('Statistics & Probability', 'Probability', 'probability-calculator-basic', 'Basic Probability & Odds Calculator',
  'Calculate event complement P(not A), odds in favor, and odds against an event.',
  'p|Event probability P(A) (0 to <1)|0.25',
  'Complement P(not A)|1-p;Odds in favor (p / (1−p))|p/(1-p);Odds against ((1−p) / p)|(1-p)/p;Percentage probability|100*p|%',
  'P(not A) = 1 − P(A);  Odds for = P(A) / (1 − P(A))', '', 'basic probability complement odds in favor')

# 4.1 Phase 4 Statistics & Probability Expansion (14 tools)
s('Statistics & Probability', 'Probability Distributions', 'normal-distribution-calculator', 'Normal Distribution Calculator',
  'Compute exact Gaussian probability density f(x), cumulative probabilities P(X ≤ x), P(X ≥ x), and inverse quantiles.',
  'normal_dist', 'f(x) = (1/(σ√(2π))) e^(−½((x−μ)/σ)²);  Φ(z) = ½[1 + erf(z/√2)].',
  '', 'normal distribution gaussian bell curve CDF PDF quantile')

s('Statistics & Probability', 'Probability Distributions', 'binomial-distribution-calculator', 'Binomial Distribution Calculator',
  'Calculate exact binomial PMF P(X = k) and cumulative probabilities P(X ≤ k), P(X < k), P(X ≥ k), P(X > k).',
  'binomial', 'P(X = k) = C(n, k) p^k (1 − p)^(n − k);  E[X] = np;  Var(X) = np(1 − p).',
  '', 'binomial distribution bernoulli trials cumulative binomial probability')

s('Statistics & Probability', 'Probability Distributions', 'probability-calculator', 'Binomial Probability Calculator',
  'Calculate exact and cumulative binomial probabilities with n trials and success rate p.',
  'binomial', 'P(X=k) = C(n,k)p^k(1−p)^(n−k).', '', 'binomial probability calculator', is_alias=True, canonical_slug='binomial-distribution-calculator')

s('Statistics & Probability', 'Probability Distributions', 'poisson-distribution-calculator', 'Poisson Distribution Calculator',
  'Calculate exact Poisson probability P(X = k) = λ^k e^(−λ) / k! and cumulative tail probabilities.',
  'poisson_dist', 'P(X = k) = (λ^k e^(−λ)) / k!;  Mean = Variance = λ.',
  '', 'poisson distribution arrival rate rare event probability')

s('Statistics & Probability', 'Probability Distributions', 't-distribution-calculator', 'Student’s t-Distribution Calculator',
  'Compute one-tailed and two-tailed p-values and critical t-values for Student’s t-distribution with ν degrees of freedom.',
  't_dist', 'Regularized incomplete beta function I_{ν/(ν+t²)}(ν/2, 1/2).',
  '', 'students t distribution t critical value t table degrees of freedom')

s('Statistics & Probability', 'Probability Distributions', 'chi-square-calculator', 'Chi-Square (χ²) Distribution Calculator',
  'Compute Chi-Square right-tail p-values, cumulative probabilities, and critical χ² values for ν degrees of freedom.',
  'chi2_dist', 'Regularized lower incomplete gamma function P(ν/2, χ²/2).',
  '', 'chi square calculator goodness of fit p value critical value')

s('Statistics & Probability', 'Statistical Testing', 'hypothesis-testing-calculator', 'Hypothesis Testing Calculator (t-Test & z-Test)',
  'Perform 1-sample and 2-sample hypothesis tests for a mean, computing test statistic, degrees of freedom, p-value, confidence interval, and Cohen’s d.',
  'hypothesis_test', 't = (x̄ − μ₀) / (s / √n);  Two-sample Welch t-test with Welch-Satterthwaite df.',
  'Statistical significance measures compatibility with H₀ and does not prove causation.',
  'hypothesis testing t test z test p value null hypothesis')

s('Statistics & Probability', 'Statistical Testing', 'p-value-calculator', 'P-Value Calculator (from Z, t, χ² & F)',
  'Convert any Z-score, t-statistic, Chi-Square (χ²), or F-statistic into exact left-tailed, right-tailed, and two-tailed p-values.',
  'pvalue_calc', 'Exact tail integrals via erf(), incomplete beta I_x(a,b), and incomplete gamma P(a,x).',
  '', 'p value calculator from z score t statistic chi square F statistic')

s('Statistics & Probability', 'Statistical Inference', 'sample-size-calculator', 'Sample Size Calculator',
  'Determine minimum required sample size n for estimating a population proportion or mean with finite-population correction.',
  'sample_size', 'n₀ = z² p(1−p) / E²;  Finite population corrected n = n₀ / (1 + (n₀ − 1)/N).',
  '', 'sample size calculator margin of error confidence level survey')

s('Statistics & Probability', 'Statistical Testing', 'anova-calculator', 'One-Way ANOVA Calculator',
  'Perform One-Way Analysis of Variance across multiple groups, reporting SS_B, SS_W, MS_B, MS_W, F-statistic, p-value, and η².',
  'anova_calc', 'F = MS_between / MS_within with df₁ = k − 1 and df₂ = N − k.',
  '', 'one way ANOVA analysis of variance F test between within groups')

s('Statistics & Probability', 'Regression', 'multiple-linear-regression-calculator', 'Multiple Linear Regression Calculator',
  'Fit an Ordinary Least Squares model y = β₀ + β₁x₁ + β₂x₂, reporting coefficients, R², Adjusted R², and RMSE.',
  'multi_regression', 'β̂ = (XᵀX)⁻¹Xᵀy;  R² = 1 − RSS / TSS.',
  '', 'multiple linear regression OLS two predictors R squared')

s('Statistics & Probability', 'Regression', 'logistic-regression-calculator', 'Logistic Regression & Log-Odds Calculator',
  'Evaluate binary logistic regression log-odds z = β₀ + β₁x₁ + β₂x₂, sigmoid probability P(Y=1) = 1/(1+e^(−z)), and odds ratios e^β.',
  'logistic_reg', 'p = σ(z) = 1 / (1 + e^(−(β₀ + β₁x₁ + β₂x₂)));  Odds Ratio OR_i = e^(β_i).',
  '', 'logistic regression sigmoid probability log odds logit odds ratio')

f('Statistics & Probability', 'Bayesian Statistics', 'bayesian-probability-calculator', 'Bayesian Probability Calculator (Bayes’ Theorem)',
  'Compute posterior probability P(A|B), prior/posterior odds, and likelihood ratios using Bayes’ Theorem.',
  'pA|Prior probability P(A)|0.01;pBA|Sensitivity / Likelihood P(B given A)|0.95;pBnotA|False positive rate P(B given not A)|0.05',
  'Marginal probability P(B)|pBA*pA+pBnotA*(1-pA);Posterior probability P(A given B)|(pBA*pA)/(pBA*pA+pBnotA*(1-pA));Posterior percentage|100*(pBA*pA)/(pBA*pA+pBnotA*(1-pA))|%;Positive likelihood ratio LR+|pBA/pBnotA;Posterior odds|(pBA*pA)/(pBnotA*(1-pA))',
  'P(A|B) = [P(B|A) · P(A)] / [P(B|A)P(A) + P(B|¬A)P(¬A)]', '', 'bayes theorem bayesian probability prior posterior sensitivity specificity')

s('Statistics & Probability', 'Statistical Testing', 'statistical-power-calculator', 'Statistical Power & Effect Size Calculator',
  'Compute statistical power (1 − β) and Type II error rate β from effect size Cohen’s d, sample size n, and α.',
  'stat_power', 'Power = 1 − Φ(z_{crit} − d√n) + Φ(−z_{crit} − d√n).',
  '', 'statistical power type II error beta cohens d effect size')

# ==============================================================================
# CATEGORY 7: FINANCE
# Subcategories: Interest, Loans & EMI, Investments, Returns & Valuation,
#                Bonds, Portfolio Analysis, Taxation, Financial Planning
# ==============================================================================

# 1.6 Consolidated: Interest Calculator
m('Finance', 'Interest', 'interest-calculator', 'Interest Calculator (Simple & Compound Interest)',
  'Calculate Simple Interest and periodic Compound Interest with effective annual rate (EAR) and total interest earned.',
  [
      {'id': 'compound', 'label': 'Compound Interest (Periodic Compounding)', 'fields': 'p|Initial principal P|10000;r|Annual interest rate r|8|%;n|Compounds per year n|12;t|Time period t|5|years',
       'outputs': 'Final balance A|p*(1+r/(100*n))^(n*t);Total interest earned|p*((1+r/(100*n))^(n*t)-1);Effective Annual Rate (EAR)|100*((1+r/(100*n))^n-1)|%',
       'formula': 'A = P(1 + r/(100n))^(n·t)'},
      {'id': 'simple', 'label': 'Simple Interest (I = P·r·t)', 'fields': 'p|Principal P|10000;r|Annual interest rate r|8|%;t|Time period t|3|years',
       'outputs': 'Interest earned I|p*r*t/100;Final balance A|p*(1+r*t/100)',
       'formula': 'I = P · (r/100) · t;  A = P + I'}
  ],
  'Simple: A = P(1 + rt)  |  Compound: A = P(1 + r/n)^(nt)',
  'Constant nominal annual rate assumed; excludes taxes and fees.',
  'simple interest compound interest calculator EAR')

alias_mode('Finance', 'Interest', 'simple-interest', 'Simple Interest Calculator',
           'Calculate straightforward simple interest and final balance.', 'interest-calculator', 'simple',
           'p|Principal|10000;r|Annual rate|8|%;t|Time|3|years', 'Interest|p*r*t/100;Final balance|p*(1+r*t/100)', 'I=Prt')
alias_mode('Finance', 'Interest', 'compound-interest', 'Compound Interest Calculator',
           'Grow a principal with periodic compounding.', 'interest-calculator', 'compound',
           'p|Initial principal|10000;r|Annual rate|8|%;n|Compounds per year|12;t|Years|5', 'Final balance|p*(1+r/(100*n))^(n*t);Interest|p*((1+r/(100*n))^(n*t)-1)', 'A=P(1+r/n)^(nt)')

# 1.6 Consolidated: Investment Returns Calculator (ROI, CAGR, Rule of 72)
m('Finance', 'Returns & Valuation', 'investment-returns-calculator', 'Investment Returns Calculator (ROI, CAGR & Doubling Time)',
  'Calculate total Return on Investment (ROI), Compound Annual Growth Rate (CAGR), and Rule of 72 doubling time.',
  [
      {'id': 'cagr', 'label': 'CAGR (Compound Annual Growth Rate) & ROI', 'fields': 'initial|Beginning value|10000;final|Ending value|18000;years|Investment period|5|years',
       'outputs': 'CAGR (Annualized return)|100*((final/initial)^(1/years)-1)|%;Total ROI|100*(final-initial)/initial|%;Net gain|final-initial;Investment multiple (x)|final/initial',
       'formula': 'CAGR = [(Ending / Beginning)^(1/years) − 1] × 100'},
      {'id': 'roi', 'label': 'Simple ROI (Return on Investment)', 'fields': 'cost|Initial investment cost|12000;value|Final investment value|15000',
       'outputs': 'Net gain|value-cost;ROI|100*(value-cost)/cost|%',
       'formula': 'ROI = [(Final Value − Cost) / Cost] × 100'},
      {'id': 'rule72', 'label': 'Rule of 72 & Exact Logarithmic Doubling Time', 'fields': 'r|Annual growth rate r|8|%',
       'outputs': 'Rule of 72 estimate (72/r)|72/r|years;Exact doubling time (ln 2 / ln(1+r))|ln(2)/ln(1+r/100)|years',
       'formula': 'Years_72 = 72 / r;  Years_exact = ln(2) / ln(1 + r/100)'}
  ],
  'ROI = (Gain/Cost)×100  |  CAGR = (FV/PV)^(1/n) − 1  |  Doubling ≈ 72/r', '',
  'investment returns ROI CAGR compound annual growth rate rule of 72')

alias_mode('Finance', 'Returns & Valuation', 'roi-calculator', 'ROI Calculator',
           'Calculate percentage return on an investment.', 'investment-returns-calculator', 'roi',
           'cost|Initial cost|12000;value|Final value|15000', 'Net gain|value-cost;ROI|100*(value-cost)/cost|%', 'ROI=(value−cost)/cost×100')
alias_mode('Finance', 'Returns & Valuation', 'cagr-calculator', 'CAGR Calculator',
           'Find the annualized compound growth rate.', 'investment-returns-calculator', 'cagr',
           'initial|Beginning value|10000;final|Ending value|18000;years|Number of years|5', 'CAGR|100*((final/initial)^(1/years)-1)|%', 'CAGR=(ending/beginning)^(1/years)−1')
alias_mode('Finance', 'Financial Planning', 'rule-of-72', 'Rule of 72 Calculator',
           'Estimate doubling time from an annual percentage growth rate.', 'investment-returns-calculator', 'rule72',
           'r|Annual growth rate|8|%', 'Estimated years to double|72/r', 'Years ≈ 72 / annual percentage rate')

# 1.6 Consolidated: Time Value of Money Calculator
m('Finance', 'Returns & Valuation', 'time-value-of-money-calculator', 'Time Value of Money (TVM) Calculator',
  'Discount future cash flows to Present Value (PV), project Future Value (FV), and evaluate ordinary and due annuities.',
  [
      {'id': 'pv', 'label': 'Present Value of Future Lump Sum (PV)', 'fields': 'future|Future value FV|10000;r|Annual discount rate r|8|%;years|Years away n|5|years',
       'outputs': 'Present value PV|future/(1+r/100)^years;Total discount (FV − PV)|future-future/(1+r/100)^years;Discount factor|1/(1+r/100)^years',
       'formula': 'PV = FV / (1 + r)^n'},
      {'id': 'fv_annuity', 'label': 'Future Value of Ordinary Annuity (FV)', 'fields': 'p|Contribution per period P|200;r|Rate per period i|1|%;n|Number of periods n|24',
       'outputs': 'Future value FV (Ordinary)|p*((1+r/100)^n-1)/(r/100);Future value (Annuity Due)|p*((1+r/100)^n-1)/(r/100)*(1+r/100);Total contributions|p*n',
       'formula': 'FV_ordinary = P · [(1 + i)^n − 1] / i'},
      {'id': 'pv_annuity', 'label': 'Present Value of Ordinary Annuity (PV)', 'fields': 'p|Payment per period P|1000;r|Discount rate per period i|1|%;n|Number of periods n|24',
       'outputs': 'Present value of annuity PV|p*(1-(1+r/100)^(-n))/(r/100);Total undiscounted payments|p*n',
       'formula': 'PV_annuity = P · [1 − (1 + i)^(−n)] / i'}
  ],
  'PV = FV/(1+r)^n  |  FV_ann = P((1+i)^n − 1)/i  |  PV_ann = P(1 − (1+i)^(−n))/i',
  'Documents ordinary (end-of-period) vs. annuity-due (beginning-of-period) timing.',
  'time value of money present value future value annuity discount')

alias_mode('Finance', 'Returns & Valuation', 'present-value', 'Present Value Calculator',
           'Discount a future cash flow to its present equivalent.', 'time-value-of-money-calculator', 'pv',
           'future|Future value|10000;r|Discount rate|8|%;years|Years away|5', 'Present value|future/(1+r/100)^years', 'PV=FV/(1+r)^n')
alias_mode('Finance', 'Investments', 'future-value-annuity', 'Future Value of Annuity',
           'Calculate ordinary annuity growth from periodic contributions.', 'time-value-of-money-calculator', 'fv_annuity',
           'p|Contribution per period|200;r|Rate per period|1|%;n|Number of periods|24', 'Future value|p*((1+r/100)^n-1)/(r/100)', 'FV=P((1+i)^n−1)/i')

# 1.6 Consolidated: Investment Growth Calculator (SIP & Periodic)
m('Finance', 'Investments', 'investment-growth-calculator', 'Investment Growth & SIP Calculator',
  'Project wealth growth from monthly SIP investments (beginning-of-month), end-of-month periodic investments, or combined Lump Sum + SIP.',
  [
      {'id': 'sip', 'label': 'Monthly SIP (Beginning-of-Month Annuity Due)', 'fields': 'p|Monthly SIP contribution P|5000;r|Expected annual return r|12|%;t|Investment tenure t|10|years',
       'outputs': 'Future value|p*((1+r/1200)^(12*t)-1)/(r/1200)*(1+r/1200);Total invested|p*12*t;Estimated wealth gain|p*((1+r/1200)^(12*t)-1)/(r/1200)*(1+r/1200)-p*12*t',
       'formula': 'FV_SIP = P × [((1 + i)^n − 1) / i] × (1 + i),  i = r/1200, n = 12t'},
      {'id': 'combined', 'label': 'Initial Lump Sum + Monthly SIP Growth', 'fields': 'lump|Initial lump sum L₀|100000;p|Monthly SIP P|5000;r|Expected annual return r|12|%;t|Years t|10|years',
       'outputs': 'Total future value|lump*(1+r/1200)^(12*t)+p*((1+r/1200)^(12*t)-1)/(r/1200)*(1+r/1200);Total principal invested|lump+p*12*t;Total investment gain|lump*(1+r/1200)^(12*t)+p*((1+r/1200)^(12*t)-1)/(r/1200)*(1+r/1200)-(lump+p*12*t)',
       'formula': 'FV_total = L₀(1 + i)^n + P[((1 + i)^n − 1)/i](1 + i)'}
  ],
  'SIP assumes beginning-of-month contributions and constant nominal compounding; not a guarantee of future market performance.',
  '', 'investment growth calculator SIP mutual fund calculator periodic investment')

alias_mode('Finance', 'Investments', 'sip-calculator', 'SIP Investment Calculator',
           'Project monthly contributions with a constant assumed return.', 'investment-growth-calculator', 'sip',
           'p|Monthly investment|5000;r|Annual return|12|%;t|Years|10', 'Future value|p*((1+r/1200)^(12*t)-1)/(r/1200)*(1+r/1200);Contributions|p*12*t;Estimated growth|p*((1+r/1200)^(12*t)-1)/(r/1200)*(1+r/1200)-p*12*t', 'FV=P×((1+i)^n−1)/i×(1+i)')

# 1.6 Consolidated: Price & Tax Calculator
m('Finance', 'Taxation', 'price-tax-calculator', 'Price, GST & Discount Calculator',
  'Calculate GST/sales tax (inclusive and exclusive), promotional percentage discounts, and combined net-to-final checkout price.',
  [
      {'id': 'gst_add', 'label': 'Add GST / Sales Tax (Net → Gross)', 'fields': 'price|Net price|1000;rate|GST / Tax rate|18|%',
       'outputs': 'Tax amount|price*rate/100;Total with tax (Gross)|price*(1+rate/100);CGST (half rate)|price*rate/200;SGST (half rate)|price*rate/200',
       'formula': 'Tax = Net × (rate/100);  Gross = Net × (1 + rate/100)'},
      {'id': 'gst_remove', 'label': 'Remove GST / Reverse Tax (Gross → Net)', 'fields': 'gross|Tax-inclusive gross price|1180;rate|GST / Tax rate|18|%',
       'outputs': 'Pre-tax net price|gross/(1+rate/100);Extracted tax amount|gross-gross/(1+rate/100)',
       'formula': 'Net = Gross / (1 + rate/100);  Tax = Gross − Net'},
      {'id': 'discount', 'label': 'Discount Calculator (Original → Sale Price)', 'fields': 'price|Original price|1500;off|Discount percentage|20|%',
       'outputs': 'You save|price*off/100;Final sale price|price*(1-off/100)',
       'formula': 'Sale Price = Original × (1 − discount/100)'},
      {'id': 'combined', 'label': 'Combined Discount + GST Checkout Price', 'fields': 'price|List price|2000;off|Discount|15|%;rate|GST / Sales tax|18|%',
       'outputs': 'Discounted net price|price*(1-off/100);Tax on discounted price|price*(1-off/100)*rate/100;Final payable price|price*(1-off/100)*(1+rate/100);Total savings vs list|price-price*(1-off/100)',
       'formula': 'Final = List × (1 − off/100) × (1 + tax/100)'}
  ],
  'Gross = Net(1 + tax);  Sale = Price(1 − discount)', '', 'GST calculator sales tax calculator discount calculator reverse GST')

alias_mode('Finance', 'Taxation', 'tax-calculator', 'GST / Sales Tax Calculator',
           'Calculate a tax-inclusive price from net price.', 'price-tax-calculator', 'gst_add',
           'price|Net price|1000;rate|Tax rate|18|%', 'Tax|price*rate/100;Total with tax|price*(1+rate/100)', 'Gross=Net×(1+rate/100)')
alias_mode('Finance', 'Financial Planning', 'discount-calculator', 'Discount Calculator',
           'Calculate final price after a percentage discount.', 'price-tax-calculator', 'discount',
           'price|Original price|1500;off|Discount|20|%', 'You save|price*off/100;Final price|price*(1-off/100)', 'Final=price×(1−discount/100)')

# Retained Distinct Finance Tools (per Section 1.6)
f('Finance', 'Loans & EMI', 'emi-calculator', 'Loan EMI Calculator',
  'Estimate equal monthly payments (EMI), total interest payable, and total repayment on an amortizing loan.',
  'p|Loan amount P|500000;r|Annual interest rate r|9|%;years|Loan term|5|years',
  'Monthly EMI|p*(r/1200)*(1+r/1200)^(years*12)/((1+r/1200)^(years*12)-1);Total paid|years*12*p*(r/1200)*(1+r/1200)^(years*12)/((1+r/1200)^(years*12)-1);Total interest|years*12*p*(r/1200)*(1+r/1200)^(years*12)/((1+r/1200)^(years*12)-1)-p',
  'EMI = P · i(1 + i)^n / ((1 + i)^n − 1),  i = r/1200, n = 12×years',
  'Excludes processing fees, insurance and prepayments.', 'loan EMI calculator monthly payment mortgage')

f('Finance', 'Returns & Valuation', 'profit-margin', 'Profit Margin & Markup Calculator',
  'Calculate gross profit, gross profit margin %, and cost markup % from cost and selling price.',
  'cost|Unit cost|120;sell|Selling price|180',
  'Gross profit|sell-cost;Gross margin|100*(sell-cost)/sell|%;Markup on cost|100*(sell-cost)/cost|%',
  'Margin = (Sell − Cost)/Sell × 100;  Markup = (Sell − Cost)/Cost × 100', '', 'profit margin markup gross profit')

f('Finance', 'Financial Planning', 'break-even', 'Break-Even Calculator',
  'Find how many units must sell to cover fixed and variable costs.',
  'fixed|Total fixed costs|50000;price|Selling price per unit|400;variable|Variable cost per unit|250',
  'Break-even units|ceil(fixed/(price-variable));Break-even revenue|ceil(fixed/(price-variable))*price;Contribution margin per unit|price-variable;Contribution margin ratio|100*(price-variable)/price|%',
  'Units = ⌈Fixed Costs / (Price − Variable Cost)⌉', '', 'break even point contribution margin fixed costs')

f('Finance', 'Financial Planning', 'inflation-calculator', 'Inflation & Purchasing Power Calculator',
  'Estimate future inflated cost and real purchasing power erosion under constant annual inflation.',
  'price|Current amount|1000;infl|Annual inflation rate|5|%;years|Years ahead|10|years',
  'Future equivalent cost|price*(1+infl/100)^years;Real purchasing power of amount|price/(1+infl/100)^years',
  'Future Cost = Present × (1 + i)^n;  Purchasing Power = Present / (1 + i)^n', '', 'inflation calculator purchasing power CPI')

f('Finance', 'Financial Planning', 'tip-calculator', 'Tip & Bill Split Calculator',
  'Calculate gratuity tip and split a restaurant bill equally among guests.',
  'bill|Bill subtotal|850;tip|Tip percentage|10|%;people|People splitting|3',
  'Total tip|bill*tip/100;Total bill with tip|bill*(1+tip/100);Amount per person|bill*(1+tip/100)/people',
  'Total = Subtotal × (1 + Tip/100);  Per Person = Total / People', '', 'tip calculator bill split gratuity')

# 4.2 Phase 4 Finance Expansion (13 tools)
s('Finance', 'Returns & Valuation', 'npv-calculator', 'NPV (Net Present Value) Calculator',
  'Evaluate multi-period investment cash flows for Net Present Value (NPV), Profitability Index (PI), and Payback Period.',
  'finance_npv', 'NPV = CF₀ + Σ_{t=1}^n CF_t / (1 + r)^t;  PI = PV(Inflows) / |CF₀|.',
  'Financial estimates are informational and not guaranteed investment outcomes.',
  'NPV calculator net present value cash flow profitability index')

s('Finance', 'Returns & Valuation', 'irr-calculator', 'IRR (Internal Rate of Return) Calculator',
  'Calculate Internal Rate of Return (IRR) where NPV = 0 across multi-year cash flows.',
  'finance_irr', 'Solves Σ_{t=0}^n CF_t / (1 + IRR)^t = 0 via bracketed bisection-secant iteration.',
  '', 'IRR calculator internal rate of return capital budgeting')

s('Finance', 'Returns & Valuation', 'xirr-calculator', 'XIRR (Irregular Date Cash-Flow) Calculator',
  'Compute annualized Internal Rate of Return (XIRR) for cash flows occurring on arbitrary calendar dates.',
  'finance_xirr', 'Solves Σ CF_i / (1 + XIRR)^((d_i − d₀)/365) = 0 using exact UTC day counts.',
  '', 'XIRR calculator irregular cash flows date aware return')

s('Finance', 'Bonds', 'bond-pricing-yield-calculator', 'Bond Pricing, YTM & Duration Calculator',
  'Calculate bond clean price, Current Yield, Macaulay Duration, Modified Duration, and Convexity.',
  'finance_bond', 'P = Σ C/(1+y)^t + F/(1+y)^n;  Macaulay Duration D = (1/P) Σ (t/k)·PV(CF_t).',
  '', 'bond pricing calculator yield to maturity YTM macaulay modified duration convexity')

s('Finance', 'Loans & EMI', 'mortgage-amortization-calculator', 'Mortgage Amortization Schedule Calculator',
  'Compute monthly mortgage payment, total interest, and a year-by-year principal vs. interest amortization schedule.',
  'finance_mortgage', 'M = P · [i(1+i)^n] / [(1+i)^n − 1] with full period-by-period balance reduction table.',
  '', 'mortgage amortization calculator amortization schedule home loan')

f('Finance', 'Portfolio Analysis', 'portfolio-return-calculator', 'Portfolio Return & Sharpe Ratio Calculator',
  'Calculate weighted expected portfolio return E[R_p] = Σ w_i R_i and risk-adjusted Sharpe Ratio.',
  'w1|Asset 1 weight w₁|60|%;r1|Asset 1 return R₁|12|%;w2|Asset 2 weight w₂|30|%;r2|Asset 2 return R₂|7|%;w3|Asset 3 weight w₃|10|%;r3|Asset 3 return R₃|4|%;rf|Risk-free rate R_f|4.5|%;sd|Portfolio std. deviation σ_p|11|%',
  'Expected portfolio return E[R_p]|(w1*r1+w2*r2+w3*r3)/(w1+w2+w3)|%;Excess return over R_f|((w1*r1+w2*r2+w3*r3)/(w1+w2+w3))-rf|%;Sharpe Ratio|(((w1*r1+w2*r2+w3*r3)/(w1+w2+w3))-rf)/sd',
  'E[R_p] = Σ w_i R_i / Σ w_i;  Sharpe = (E[R_p] − R_f) / σ_p', '', 'portfolio return calculator weighted return sharpe ratio')

f('Finance', 'Portfolio Analysis', 'portfolio-risk-calculator', 'Portfolio Risk, Variance & VaR Calculator',
  'Compute 2-asset portfolio standard deviation σ_p, variance, diversification benefit, and 95% Parametric Value at Risk (VaR).',
  'w1|Weight of Asset 1 (w₁)|60|%;sd1|Volatility of Asset 1 (σ₁)|18|%;sd2|Volatility of Asset 2 (σ₂)|10|%;rho|Correlation ρ (−1 to +1)|0.2;val|Portfolio value|100000',
  'Portfolio volatility σ_p|sqrt((w1/100)^2*sd1^2+(1-w1/100)^2*sd2^2+2*(w1/100)*(1-w1/100)*rho*sd1*sd2)|%;Portfolio variance σ_p²|(w1/100)^2*sd1^2+(1-w1/100)^2*sd2^2+2*(w1/100)*(1-w1/100)*rho*sd1*sd2;Undiversified weighted volatility|(w1/100)*sd1+(1-w1/100)*sd2|%;Diversification reduction|((w1/100)*sd1+(1-w1/100)*sd2)-sqrt((w1/100)^2*sd1^2+(1-w1/100)^2*sd2^2+2*(w1/100)*(1-w1/100)*rho*sd1*sd2)|%;95% 1-Year Parametric VaR (1.645·σ_p)|val*1.64485*(sqrt((w1/100)^2*sd1^2+(1-w1/100)^2*sd2^2+2*(w1/100)*(1-w1/100)*rho*sd1*sd2)/100)',
  'σ_p = √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂)', '', 'portfolio risk variance standard deviation correlation VaR')

f('Finance', 'Portfolio Analysis', 'capm-calculator', 'CAPM (Capital Asset Pricing Model) Calculator',
  'Calculate expected asset return E[R_i] = R_f + β(E[R_m] − R_f), equity risk premium, and Jensen’s Alpha.',
  'rf|Risk-free rate R_f|4.25|%;rm|Expected market return E[R_m]|10.5|%;beta|Asset Beta β|1.25;actual|Actual portfolio return (optional for Alpha)|13.0|%',
  'CAPM expected return E[R_i]|rf+beta*(rm-rf)|%;Market risk premium (E[R_m] − R_f)|rm-rf|%;Asset risk premium β(E[R_m] − R_f)|beta*(rm-rf)|%;Jensen’s Alpha α (R_actual − E[R_i])|actual-(rf+beta*(rm-rf))|%',
  'E[R_i] = R_f + β_i (E[R_m] − R_f);  α = R_actual − E[R_i]', '', 'CAPM calculator capital asset pricing model beta alpha')

s('Finance', 'Returns & Valuation', 'black-scholes-calculator', 'Black-Scholes Option Pricing Calculator',
  'Calculate European Call and Put option prices, d₁, d₂, intrinsic value, and put-call parity using the Black-Scholes-Merton model.',
  'finance_bs', 'C = S e^(−qT) N(d₁) − K e^(−rT) N(d₂);  P = K e^(−rT) N(−d₂) − S e^(−qT) N(−d₁).',
  '', 'black scholes option pricing call put d1 d2 volatility')

s('Finance', 'Returns & Valuation', 'option-greeks-calculator', 'Option Greeks Calculator (Delta, Gamma, Theta, Vega, Rho)',
  'Compute first- and second-order Black-Scholes option sensitivities (Δ, Γ, Θ, Vega, ρ) for Calls and Puts.',
  'finance_greeks', 'Δ_call = e^(−qT)N(d₁);  Γ = e^(−qT)φ(d₁)/(Sσ√T);  Vega = S e^(−qT)φ(d₁)√T.',
  '', 'option greeks delta gamma theta vega rho')

s('Finance', 'Financial Planning', 'depreciation-calculator', 'Depreciation Calculator (Straight-Line, DDB & SYD)',
  'Compute asset depreciation schedules under Straight-Line, Double Declining Balance, and Sum-of-the-Years’-Digits methods.',
  'finance_depreciation', 'Straight-Line = (Cost − Salvage)/Life;  DDB rate = 2/Life;  SYD weight = (Life − t + 1) / [Life(Life+1)/2].',
  '', 'depreciation calculator straight line double declining balance SYD')

s('Finance', 'Loans & EMI', 'loan-prepayment-calculator', 'Loan Prepayment & Interest Savings Calculator',
  'Calculate how much total interest and loan tenure you save by making extra monthly or lump-sum prepayments.',
  'finance_prepayment', 'Iterative monthly amortization comparing baseline loan schedule against accelerated principal reduction.',
  '', 'loan prepayment calculator extra payment mortgage savings')

s('Finance', 'Taxation', 'tax-slab-calculator', 'Progressive Tax Slab Calculator',
  'Calculate total income tax, bracket-by-bracket tax breakdown, marginal tax rate, and effective tax rate.',
  'finance_taxslab', 'Marginal progressive bracket taxation Σ max(0, min(Income, Upper_i) − Lower_i) × Rate_i.',
  '', 'tax slab calculator income tax brackets marginal effective tax rate')

# ==============================================================================
# CATEGORY 8: CONVERTERS & EVERYDAY TOOLS
# Subcategories: Unit Converters, Computing Utilities, Date & Time,
#                Academic Tools, Daily Life Calculations
# ==============================================================================
s('Converters & Everyday Tools', 'Unit Converters', 'unit-converter', 'Universal Unit Converter (27 Measurement Domains)',
  'Convert length, mass, area, volume, speed, acceleration, time, temperature, pressure, energy, power, data, angle, frequency, force, density, torque, voltage, current, resistance, capacitance, inductance, magnetic field/flux, flow rate and viscosity.',
  'converter', 'Exact SI scaling and affine temperature conversions with multi-unit simultaneous readout.',
  'Covers 27 engineering and scientific measurement categories.', 'unit converter metric imperial SI conversion')

# 4.3 Computing & Digital Mathematics (10 tools + retained number-base & compression)
s('Converters & Everyday Tools', 'Computing Utilities', 'number-base-converter', 'Number Base Converter (Bases 2–36)',
  'Convert arbitrary-precision integers between Binary (2), Octal (8), Decimal (10), Hexadecimal (16), and any base from 2 to 36.',
  'base', 'Exact integer radix conversion via BigInt across all bases 2–36.',
  'Simultaneously displays Binary, Octal, Decimal, and Hexadecimal readouts.',
  'number base converter binary octal decimal hexadecimal radix')

s('Converters & Everyday Tools', 'Computing Utilities', 'binary-arithmetic-calculator', 'Binary Arithmetic & Two’s Complement Calculator',
  'Perform exact binary addition, subtraction, multiplication, division, and inspect 8/16/32/64-bit signed Two’s Complement representations.',
  'comp_binary', 'Exact BigInt binary arithmetic and signed Two\'s Complement bit representation.',
  '', 'binary arithmetic calculator twos complement signed binary')

s('Converters & Everyday Tools', 'Computing Utilities', 'bitwise-operations-calculator', 'Bitwise Operations Calculator (AND, OR, XOR, NOT, Shifts)',
  'Execute bitwise AND, OR, XOR, NOT, NAND, NOR, and bit shifts (<<, >>) across 8, 16, 32, and 64-bit integers.',
  'comp_bitwise', 'Bitwise boolean algebra and bitmask evaluation in Binary, Hex, and Decimal.',
  '', 'bitwise calculator AND OR XOR NOT bit shift hex')

s('Converters & Everyday Tools', 'Computing Utilities', 'floating-point-representation-calculator', 'Floating-Point Representation Calculator (IEEE-754)',
  'Inspect exact IEEE-754 32-bit Single and 64-bit Double Precision sign bit, biased exponent, mantissa bits, and rounding error.',
  'comp_ieee754', 'Value = (−1)^s × (1 + mantissa) × 2^(exponent − bias) via hardware DataView.',
  '', 'IEEE 754 floating point calculator float32 float64 sign exponent mantissa')

m('Converters & Everyday Tools', 'Computing Utilities', 'data-transfer-rate-calculator', 'Data Transfer Rate & Download Time Calculator',
  'Estimate file transfer time, required network speed, or total data transferred across decimal (MB, GB) and binary (MiB, GiB) units.',
  [
      {'id': 'time', 'label': 'Find Transfer / Download Time (from Size & Speed)', 'fields': 'size|File size|1500|MB;speed|Connection speed|40|Mbps',
       'outputs': 'Estimated seconds|size*8/speed|s;Estimated minutes|size*8/(speed*60)|min;Estimated hours|size*8/(speed*3600)|h;Effective transfer rate (MB/s)|speed/8|MB/s',
       'formula': 'Time (s) = [File Size (MB) × 8 bits/byte] / Speed (Mbps)'},
      {'id': 'speed', 'label': 'Find Required Speed (from Size & Target Time)', 'fields': 'size|File size|1500|MB;sec|Target time|300|s',
       'outputs': 'Required speed (Mbps)|size*8/sec|Mbps;Required speed (MB/s)|size/sec|MB/s;Required speed (Gbps)|size*8/(sec*1000)|Gbps',
       'formula': 'Speed (Mbps) = [File Size (MB) × 8] / Time (s)'}
  ],
  'Time = Size(bits) / Speed(bps)', '', 'data transfer rate download time calculator Mbps MB/s')

alias_mode('Converters & Everyday Tools', 'Computing Utilities', 'download-time', 'Download Time Calculator',
           'Estimate time to download a file at a constant network rate.', 'data-transfer-rate-calculator', 'time',
           'size|File size|1500|MB;speed|Connection speed|40|Mbps', 'Estimated seconds|size*8/speed|s;Estimated minutes|size*8/(speed*60)|min', 'Time = file size (megabits) / speed (Mbps)')

f('Converters & Everyday Tools', 'Computing Utilities', 'network-bandwidth-calculator', 'Network Bandwidth & Throughput Calculator',
  'Calculate Bandwidth-Delay Product (BDP), maximum TCP window throughput, and effective payload throughput after protocol overhead.',
  'bw|Link bandwidth|100|Mbps;rtt|Round-Trip Time (RTT)|40|ms;win|TCP Receive Window|64|KiB;overhead|Protocol overhead|5|%',
  'Bandwidth-Delay Product (BDP)|bw*1e6*(rtt/1000)/8000|kB;BDP in KiB|bw*1e6*(rtt/1000)/(8*1024)|KiB;Max TCP Window Throughput|(win*8*1024)/(rtt/1000)/1e6|Mbps;Effective Usable Throughput|min(bw,(win*8*1024)/(rtt/1000)/1e6)*(1-overhead/100)|Mbps',
  'BDP = Bandwidth × RTT;  Max TCP Throughput ≤ Window Size / RTT', '', 'network bandwidth calculator BDP TCP throughput latency')

m('Converters & Everyday Tools', 'Computing Utilities', 'storage-capacity-calculator', 'Storage Capacity Calculator (SI vs. Binary IEC & RAID)',
  'Convert between Decimal SI (kB, MB, GB, TB) and Binary IEC (KiB, MiB, GiB, TiB) storage units and calculate usable RAID capacity.',
  [
      {'id': 'si_iec', 'label': 'Decimal SI (1000) vs. Binary IEC (1024) Capacity', 'fields': 'gb|Nominal Drive Size (Decimal GB)|1000|GB',
       'outputs': 'Megabytes (Decimal MB)|gb*1000|MB;Kilobytes (Decimal kB)|gb*1000000|kB;Bytes|gb*1000000000|B;OS Reported Gibibytes (GiB)|gb*1e9/(1024^3)|GiB;OS Reported Mebibytes (MiB)|gb*1e9/(1024^2)|MiB;Terabytes (TB)|gb/1000|TB',
       'formula': '1 GB = 10⁹ B ≈ 0.93132 GiB;  1 GiB = 2³⁰ B = 1,073,741,824 B'},
      {'id': 'raid', 'label': 'RAID Array Usable Storage Capacity (RAID 0, 1, 5, 6, 10)', 'fields': 'disks|Number of disks N (≥ 4 for RAID 6/10)|4;size|Single disk capacity|4|TB',
       'outputs': 'Raw total capacity (N × Size)|disks*size|TB;RAID 0 usable (Striping, 0 fault tolerance)|disks*size|TB;RAID 1 / 10 usable (Mirroring, N/2)|disks*size/2|TB;RAID 5 usable ((N−1)×Size, 1-disk fault tolerance)|(disks-1)*size|TB;RAID 6 usable ((N−2)×Size, 2-disk fault tolerance)|(disks-2)*size|TB',
       'formula': 'RAID 5 = (N−1)S;  RAID 6 = (N−2)S;  RAID 10 = (N/2)S'}
  ],
  'Decimal SI: 1 GB = 10⁹ B  |  Binary IEC: 1 GiB = 2³⁰ B', '', 'storage capacity calculator GB to GiB RAID calculator')

alias_mode('Converters & Everyday Tools', 'Computing Utilities', 'data-size-calculator', 'Data Storage Calculator',
           'Convert between decimal kilobytes, megabytes and gigabytes.', 'storage-capacity-calculator', 'si_iec',
           'gb|Gigabytes|4', 'Megabytes|gb*1000|MB;Kilobytes|gb*1000000|kB;Bytes|gb*1000000000|B', 'Decimal SI: 1 GB = 1000 MB')

s('Converters & Everyday Tools', 'Computing Utilities', 'cidr-subnet-calculator', 'CIDR / IPv4 Subnet Calculator',
  'Calculate network address, broadcast address, usable host IP range, total/usable hosts, subnet mask, wildcard mask, and binary IP view.',
  'comp_subnet', '32-bit IPv4 bitwise netmasking: Network = IP & Mask, Broadcast = Network | ~Mask.',
  'Includes RFC 3021 /31 point-to-point and /32 host route support.', 'CIDR subnet calculator IPv4 netmask broadcast usable hosts')

s('Converters & Everyday Tools', 'Computing Utilities', 'rgb-hsl-hex-color-converter', 'RGB / HSL / HEX Color Converter',
  'Convert colors bidirectionally between HEX, RGB, and HSL with editable text fields, live swatch, and WCAG contrast ratios.',
  'color', 'sRGB [0, 255] ↔ Hexadecimal #RRGGBB ↔ HSL (Hue 0–360°, Saturation %, Lightness %).',
  '', 'color converter HEX to RGB HSL WCAG contrast')

s('Converters & Everyday Tools', 'Computing Utilities', 'color-converter', 'HEX / RGB Color Converter',
  'Convert HEX colors to RGB and HSL with a live color swatch.', 'color',
  'RGB and HSL conversion uses sRGB values.', '', 'hex rgb color converter', is_alias=True, canonical_slug='rgb-hsl-hex-color-converter')

f('Converters & Everyday Tools', 'Computing Utilities', 'image-resolution-calculator', 'Image Resolution, PPI & Uncompressed Size Calculator',
  'Calculate display pixel density (PPI), total megapixels, dot pitch, and uncompressed image memory size.',
  'w|Width pixels W|1920|px;h|Height pixels H|1080|px;d|Screen diagonal D|15.6|in;bpp|Color depth (bits per pixel)|24|bit',
  'Pixel density (PPI)|sqrt(w^2+h^2)/d|pixels/in;Total pixels|w*h|px;Megapixels (MP)|w*h/1e6|MP;Dot pitch (mm)|25.4/(sqrt(w^2+h^2)/d)|mm;Uncompressed size (MB)|w*h*(bpp/8)/1e6|MB',
  'PPI = √(W² + H²) / D;  Dot pitch = 25.4 / PPI (mm)', '', 'image resolution calculator PPI DPI megapixels dot pitch')

alias_mode('Converters & Everyday Tools', 'Computing Utilities', 'pixel-density', 'PPI Calculator',
           'Calculate display pixel density from resolution and diagonal.', 'image-resolution-calculator', 'default',
           'w|Width pixels|1920;h|Height pixels|1080;d|Diagonal inches|15.6;bpp|Color depth|24', 'PPI|sqrt(w^2+h^2)/d|pixels/in', 'PPI=√(width²+height²)/diagonal')

f('Converters & Everyday Tools', 'Computing Utilities', 'aspect-ratio-scaling-calculator', 'Aspect Ratio & Proportional Scaling Calculator',
  'Find simplified integer aspect ratio (W:H), decimal ratio, and resize dimensions proportionally.',
  'w|Original width W₁|1920|px;h|Original height H₁|1080|px;neww|Target width W₂|1280|px',
  'Aspect ratio (W/H)|w/h;New proportional height H₂|neww*h/w|px;Simplified ratio W|w/gcd(w,h);Simplified ratio H|h/gcd(w,h);Scale factor (%)|100*neww/w|%',
  'H₂ = W₂ × (H₁ / W₁);  Simplified Ratio = (W₁/gcd) : (H₁/gcd)', '', 'aspect ratio calculator 16:9 proportional resize scaling')

alias_mode('Converters & Everyday Tools', 'Computing Utilities', 'aspect-ratio', 'Aspect Ratio Calculator',
           'Find width-to-height ratio and resize proportionally.', 'aspect-ratio-scaling-calculator', 'default',
           'w|Original width|1920;h|Original height|1080;neww|Target width|1280', 'Aspect (w/h)|w/h;New height|neww*h/w', 'H₂ = W₂×H₁/W₁')

f('Converters & Everyday Tools', 'Computing Utilities', 'compression-ratio', 'Compression Ratio Calculator',
  'Calculate file compression ratio, space savings percentage, and bytes saved.',
  'original|Original size|2000000|B;compressed|Compressed size|750000|B',
  'Compression ratio (Original/Compressed)|original/compressed;Size reduction|100*(1-compressed/original)|%;Bytes saved|original-compressed|B',
  'Ratio = Original / Compressed;  Reduction = (1 − Compressed/Original) × 100%', '', 'compression ratio file size reduction')

# 4.4 Education Tools (5 tools preserved & consolidated under Academic Tools)
f('Converters & Everyday Tools', 'Academic Tools', 'gpa-cgpa-calculator', 'GPA / CGPA to Percentage Calculator',
  'Convert CGPA to percentage using an institutional multiplier and compute equivalent 4.0-scale GPA.',
  'cgpa|CGPA (10-point scale)|8.5;factor|Institution multiplier (e.g. 9.5)|9.5',
  'Estimated percentage|cgpa*factor|%;Equivalent 4.0-scale GPA (approx)|(cgpa/10)*4',
  'Percentage ≈ CGPA × conversion factor', 'Check your institution’s official transcript conversion rule.',
  'GPA calculator CGPA to percentage 9.5 multiplier')

alias_mode('Converters & Everyday Tools', 'Academic Tools', 'cgpa-percentage', 'CGPA to Percentage Calculator',
           'Convert CGPA to a percentage with an adjustable institutional multiplier.', 'gpa-cgpa-calculator', 'default',
           'cgpa|CGPA|8.5;factor|Institution multiplier|9.5', 'Estimated percentage|cgpa*factor|%', 'Percentage ≈ CGPA × conversion factor')

f('Converters & Everyday Tools', 'Academic Tools', 'grade-calculator', 'Grade & Marks Percentage Calculator',
  'Calculate exam percentage and grade points from marks obtained and maximum marks.',
  'obtained|Marks obtained|428;maxmarks|Maximum marks|500',
  'Percentage|100*obtained/maxmarks|%;Marks lost|maxmarks-obtained;10-Point Grade Equiv.|10*obtained/maxmarks',
  'Percentage = (Obtained / Maximum) × 100', '', 'grade calculator marks percentage exam score')

alias_mode('Converters & Everyday Tools', 'Academic Tools', 'grade-percentage', 'Marks Percentage Calculator',
           'Calculate exam percentage from obtained and total marks.', 'grade-calculator', 'default',
           'obtained|Marks obtained|428;maxmarks|Maximum marks|500', 'Percentage|100*obtained/maxmarks|%', '(Obtained / Maximum) × 100')

f('Converters & Everyday Tools', 'Academic Tools', 'attendance-planner', 'Attendance Planner Calculator',
  'Calculate current class attendance %, consecutive classes needed to reach your target, and classes you can safely miss.',
  'att|Classes attended|56;total|Classes held|75;target|Target attendance|75|%',
  'Current attendance|100*att/total|%;Additional classes needed|ceil(max(0,(target*total-100*att)/(100-target)));Classes you can safely skip|floor(max(0,(100*att-target*total)/target))',
  'Needed = ⌈max(0, (target×total − 100×att)/(100 − target))⌉',
  'Requires 0 ≤ attended ≤ held and target strictly between 0% and 100%.', 'attendance calculator class attendance planner')

alias_mode('Converters & Everyday Tools', 'Academic Tools', 'attendance-calculator', 'Attendance Calculator',
           'Calculate current class attendance and how many more classes you need to reach a target.', 'attendance-planner', 'default',
           'att|Classes attended|56;total|Classes held|75;target|Target attendance|75|%', 'Current attendance|100*att/total|%;Additional classes needed|ceil(max(0,(target*total-100*att)/(100-target)))', 'n≥(target×total−100×att)/(100−target)')

f('Converters & Everyday Tools', 'Academic Tools', 'exam-target-calculator', 'Exam Target Grade Calculator',
  'Find the score needed on a remaining final exam to achieve your desired overall course grade.',
  'current|Current average|75|%;weight|Completed coursework weight|60|%;target|Desired overall grade|85|%',
  'Required remaining score|(100*target-current*weight)/(100-weight)|%;Remaining exam weight|100-weight|%',
  'Required = (100×target − current×weight) / (100 − weight)',
  'A required score above 100% indicates the target grade is unattainable without extra credit.',
  'final exam grade calculator target grade needed')

alias_mode('Converters & Everyday Tools', 'Academic Tools', 'target-grade', 'Target Exam Score Calculator',
           'Find the score needed on a remaining exam to reach an overall grade.', 'exam-target-calculator', 'default',
           'current|Current average|75|%;weight|Completed weight|60|%;target|Desired overall|85|%', 'Required remaining score|(100*target-current*weight)/(100-weight)|%', 'Required = (100×target−completed%×weight)/(100−weight)')

f('Converters & Everyday Tools', 'Academic Tools', 'study-schedule-calculator', 'Study Schedule & Time Calculator',
  'Plan total study hours, sessions, and weekly workload over multiple weeks.',
  'minutes|Minutes per session|45|min;days|Sessions per week|5;weeks|Number of weeks|8',
  'Hours total|minutes*days*weeks/60|hours;Total sessions|days*weeks;Hours per week|minutes*days/60|hours',
  'Hours = (minutes × sessions/week × weeks) / 60', '', 'study schedule calculator study hours planner')

alias_mode('Converters & Everyday Tools', 'Academic Tools', 'study-time-calculator', 'Study Time Calculator',
           'Plan total study hours for sessions over multiple weeks.', 'study-schedule-calculator', 'default',
           'minutes|Minutes per session|45;days|Sessions per week|5;weeks|Weeks|8', 'Hours total|minutes*days*weeks/60|hours;Sessions|days*weeks', 'Hours=(minutes×sessions per week×weeks)/60')

# Date & Time
s('Converters & Everyday Tools', 'Date & Time', 'date-difference', 'Date Difference Calculator',
  'Calculate the exact calendar day, week, and working-day difference between two dates in UTC.',
  'dates', 'UTC calendar day count prevents Daylight Saving Time (DST) errors.',
  '', 'date difference calculator days between dates weeks')

s('Converters & Everyday Tools', 'Date & Time', 'age-calculator', 'Age Calculator',
  'Calculate exact age in years, months, and days from a birth date to any reference date.',
  'age', 'Calendar-accurate age accounting for leap years and variable month lengths.',
  '', 'age calculator years months days lived')

# Daily Life Calculations
f('Converters & Everyday Tools', 'Daily Life Calculations', 'electricity-cost', 'Electricity Cost Calculator',
  'Calculate appliance electricity consumption (kWh) and utility bill cost over any usage period.',
  'W|Appliance power|1000|W;hours|Hours used daily|5|h;days|Number of days|30;rate|Electricity tariff per kWh|8',
  'Energy consumed|W*hours*days/1000|kWh;Estimated cost|W*hours*days/1000*rate;Daily energy|W*hours/1000|kWh',
  'E (kWh) = (W × hours × days) / 1000;  Cost = E × rate', '', 'electricity cost calculator kWh appliance bill')

f('Converters & Everyday Tools', 'Daily Life Calculations', 'fuel-cost', 'Fuel Cost Calculator',
  'Estimate trip fuel volume required and total fuel expense.',
  'km|Trip distance|350|km;kmpl|Fuel efficiency|16|km/L;price|Fuel price per litre|105',
  'Fuel required|km/kmpl|L;Total fuel cost|km/kmpl*price;Cost per km|price/kmpl',
  'Fuel = Distance / Efficiency;  Cost = Fuel × Price', '', 'fuel cost calculator trip mileage gas cost')

f('Converters & Everyday Tools', 'Daily Life Calculations', 'bmi-calculator', 'BMI Calculator',
  'Compute Body Mass Index (BMI) and Ponderal Index from body mass and height.',
  'kg|Body mass|70|kg;cm|Height|175|cm',
  'BMI|kg/(cm/100)^2|kg/m²;Ponderal Index|kg/(cm/100)^3|kg/m³;Min healthy mass (BMI 18.5)|18.5*(cm/100)^2|kg;Max healthy mass (BMI 24.9)|24.9*(cm/100)^2|kg',
  'BMI = mass (kg) / [height (m)]²', 'BMI is an informational screening index, not a clinical diagnosis.',
  'BMI calculator body mass index healthy weight')

f('Converters & Everyday Tools', 'Daily Life Calculations', 'recipe-scaler', 'Recipe Scaling Calculator',
  'Scale ingredient quantities proportionally to a new serving count.',
  'q|Ingredient amount|250;old|Original servings|4;new|New servings|7',
  'Required quantity|q*new/old;Scaling multiplier|new/old',
  'New Quantity = Old Quantity × (New Servings / Original Servings)', '', 'recipe scaler ingredient multiplier servings')

f('Converters & Everyday Tools', 'Daily Life Calculations', 'pace-calculator', 'Running Pace & Speed Calculator',
  'Calculate running pace (min/km) and average speed (km/h) from distance and elapsed time.',
  'distance|Distance|5|km;minutes|Time taken|30|min',
  'Pace|minutes/distance|min/km;Average speed|distance/(minutes/60)|km/h',
  'Pace = Time / Distance;  Speed = Distance / (Time / 60)', '', 'running pace calculator min/km marathon speed')

f('Converters & Everyday Tools', 'Daily Life Calculations', 'paint-coverage', 'Paint Coverage Calculator',
  'Estimate paint litres required based on wall area, coverage rate, and number of coats.',
  'area|Wall area|65|m²;coverage|Coverage per litre|10|m²/L;coats|Number of coats|2',
  'Paint required|area*coats/coverage|L;Total coated area|area*coats|m²',
  'Litres = (Area × Coats) / Coverage', '', 'paint coverage calculator wall paint litres')

f('Converters & Everyday Tools', 'Daily Life Calculations', 'tile-calculator', 'Tile Quantity Calculator',
  'Estimate floor or wall tiles required including a cutting/wastage allowance.',
  'floor|Total floor area|15|m²;tilew|Tile width|0.6|m;tileh|Tile length|0.6|m;waste|Waste allowance|10|%',
  'Tiles required (with waste)|ceil(floor/(tilew*tileh)*(1+waste/100));Exact net tiles|ceil(floor/(tilew*tileh));Single tile area|tilew*tileh|m²',
  'Tiles = ⌈(Floor Area / Tile Area) × (1 + Waste/100)⌉', '', 'tile calculator flooring tiles wastage')

# ==============================================================================
# VERIFICATION & SERIALIZATION
# ==============================================================================
dups = [(k, v) for k, v in Counter(t['slug'] for t in C).items() if v > 1]
if dups:
    raise RuntimeError(f"Duplicate slugs found: {dups}")

valid_cats = {c['name']: set(c['subcategories']) for c in CATEGORIES}
for t in C:
    if t['category'] not in valid_cats:
        raise RuntimeError(f"Invalid category '{t['category']}' on {t['slug']}")
    if t['subcategory'] not in valid_cats[t['category']]:
        raise RuntimeError(f"Invalid subcategory '{t['subcategory']}' in '{t['category']}' on {t['slug']}")

root = Path(__file__).resolve().parent
out_dirs = [root / 'assets', root.parent / 'site' / 'assets']
payload = {
    'categories': CATEGORIES,
    'legacyCategoryRedirects': LEGACY_CATEGORY_REDIRECTS,
    'tools': C
}
for d in out_dirs:
    if d.exists():
        (d / 'catalog.json').write_text(json.dumps(payload, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')

canonical_tools = [t for t in C if not t.get('isAlias')]
alias_tools = [t for t in C if t.get('isAlias')]
print(f"Total routes in catalog: {len(C)} ({len(canonical_tools)} canonical tools + {len(alias_tools)} legacy compatibility aliases)")
print(f"Primary categories ({len(CATEGORIES)}):", {c['name']: sum(t['category'] == c['name'] and not t.get('isAlias') for t in C) for c in CATEGORIES})
