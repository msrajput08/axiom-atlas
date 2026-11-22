"""Editorially verified, calculator-specific SEO content for canonical tool pages.

Do not copy these descriptions to aliases or invent capabilities not implemented by the solver.
"""
import json

SEO_FOCUS = json.loads(r'''{
  "prime-checker": {
    "title": "Prime Number Checker – Prime Test & Factorization",
    "heading": "Prime Number Checker",
    "description": "Check if a whole number is prime or composite. See prime factors, divisor count and Euler's totient for integers up to 1 trillion, free.",
    "intro": "Check whether a number is prime or composite, then examine its prime factorization, divisor count and Euler's totient. Enter an integer up to 1 trillion; 0 and 1 are neither prime nor composite.",
    "answer": "A prime number is a positive integer greater than 1 with exactly two positive divisors: 1 and itself. To check a number, test possible divisors up to its square root.",
    "steps": [
      "Enter a whole number, such as 97 or 360, in the Number Theory prime mode.",
      "The calculator tests primality and factors the number using trial division.",
      "Read the classification, prime-power decomposition, divisor count and Euler's totient."
    ],
    "examples": [
      [
        "Is 97 prime?",
        "Yes. √97 is about 9.85, and 97 has no divisor among 2, 3, 5 or 7."
      ],
      [
        "Factor 360",
        "360 = 2³ × 3² × 5; it has (3+1)(2+1)(1+1) = 24 positive divisors and φ(360) = 96."
      ],
      [
        "What about 1?",
        "1 is neither prime nor composite: it has only one positive divisor. The smallest prime is 2."
      ]
    ],
    "questions": [
      [
        "Is 2 a prime number?",
        "Yes. Its only positive divisors are 1 and 2; it is also the only even prime."
      ],
      [
        "Can the calculator test a trillion?",
        "The supported input range for factorization and primality is 0 through 10¹², inclusive. Larger integers are not supported by the solver."
      ]
    ],
    "related": [
      [
        "Number Theory Calculator",
        "number-theory-calculator"
      ],
      [
        "Scientific Calculator",
        "scientific-calculator"
      ]
    ]
  },
  "slope-calculator": {
    "title": "Slope Calculator – Rise, Run, Distance & Midpoint",
    "heading": "Slope Calculator",
    "description": "Find the slope between two coordinate points using rise over run. Also calculate distance, midpoint and inclination angle with worked examples.",
    "intro": "Enter two points (x₁, y₁) and (x₂, y₂) to calculate slope, rise, run, midpoint, distance and line angle in degrees.",
    "answer": "Slope m = (y₂ − y₁) / (x₂ − x₁): the vertical change (rise) divided by the horizontal change (run). The slope is undefined if the run is zero.",
    "steps": [
      "Enter x₁, y₁, x₂ and y₂.",
      "Subtract coordinates to find rise (y₂−y₁) and run (x₂−x₁).",
      "Use rise/run for slope, and review the distance, midpoint and angle outputs."
    ],
    "examples": [
      [
        "Slope from (2, 3) to (6, 11)",
        "Rise = 11−3 = 8 and run = 6−2 = 4, so slope = 8/4 = 2."
      ],
      [
        "Distance and midpoint for those points",
        "Distance = √(4² + 8²) = √80 ≈ 8.9443. Midpoint = ((2+6)/2, (3+11)/2) = (4, 7)."
      ]
    ],
    "questions": [
      [
        "What is the slope of a vertical line?",
        "Undefined, because x₂−x₁ = 0 would require division by zero."
      ],
      [
        "Is a horizontal line's slope zero?",
        "Yes. When y₂ = y₁ and the two points differ, rise is zero and slope is 0."
      ]
    ],
    "related": [
      [
        "Midpoint Calculator",
        "midpoint-calculator"
      ],
      [
        "Linear Equation Calculator",
        "linear-equation"
      ]
    ]
  },
  "recipe-scaler": {
    "title": "Recipe Scaling Calculator – Adjust Servings & Ingredients",
    "heading": "Recipe Scaling Calculator",
    "description": "Scale recipe ingredient quantities up or down for a new serving count. Enter original servings, target servings and one ingredient amount.",
    "intro": "Scale an ingredient quantity when you increase or decrease a recipe's serving count. Enter the original amount, original servings and new servings.",
    "answer": "New ingredient amount = original amount × (new servings ÷ original servings). The tool reports the multiplier and the rescaled quantity in the same unit.",
    "steps": [
      "Enter the amount of one ingredient and the number of servings in the original recipe.",
      "Enter how many servings you want to make.",
      "Apply the displayed multiplier to other ingredients, keeping each ingredient's units consistent."
    ],
    "examples": [
      [
        "Scale 250 g from 4 servings to 7",
        "Multiplier = 7/4 = 1.75; new amount = 250 × 1.75 = 437.5 g."
      ],
      [
        "Reduce 300 mL from 6 servings to 2",
        "Multiplier = 2/6 = 1/3; new amount = 300 ÷ 3 = 100 mL."
      ]
    ],
    "questions": [
      [
        "Do I need to change the ingredient units?",
        "No. A quantity entered in grams returns a proportional quantity in grams; a quantity in millilitres remains in millilitres."
      ],
      [
        "Does doubling ingredients double baking time?",
        "Not necessarily. Cooking time, oven temperature, pan geometry and some ingredients may require separate adjustments. This is a proportional quantity calculator, not a cooking-time predictor."
      ]
    ],
    "related": [
      [
        "Paint Coverage Calculator",
        "paint-coverage"
      ],
      [
        "Percentage Calculator",
        "percentage-calculator"
      ]
    ]
  },
  "attendance-planner": {
    "title": "Attendance Calculator – Classes Needed & Can Skip",
    "heading": "Attendance Calculator & Planner",
    "description": "Calculate attendance percentage, how many consecutive classes you need to reach your target, and how many classes you can afford to miss.",
    "intro": "Track classes attended versus classes held, then calculate your current attendance percentage, classes needed for a target and how many future classes you can miss.",
    "answer": "Current attendance = attended ÷ total × 100. To reach a target, the calculator assumes you attend every additional class until you meet that percentage.",
    "steps": [
      "Enter classes attended and total classes held (attended cannot exceed held).",
      "Set your target attendance percentage between 0% and 100%.",
      "Read the current percentage, consecutive classes required and permissible future absences."
    ],
    "examples": [
      [
        "56 attended out of 75, target 75%",
        "Current attendance = 56/75 × 100 ≈ 74.67%. Attend the next class to reach 57/76 = 75%; one consecutive class is needed."
      ],
      [
        "90 attended out of 100, target 75%",
        "With no further attendance, 90/(100+20) = 75%; up to 20 additional missed classes are possible before dropping below the target."
      ]
    ],
    "questions": [
      [
        "Does the calculator count future classes?",
        "The classes-needed result assumes all additional classes are attended. The classes-you-can-skip result assumes you miss the next classes while the attended count stays fixed."
      ],
      [
        "Can I enter a target of exactly 100%?",
        "No. The solver requires a target strictly between 0% and 100%, because the classes-needed formula divides by (100−target)."
      ]
    ],
    "related": [
      [
        "Grade Calculator",
        "grade-calculator"
      ],
      [
        "Percentage Calculator",
        "percentage-calculator"
      ]
    ]
  },
  "paint-coverage": {
    "title": "Paint Coverage Calculator – Estimate Litres & Coats",
    "heading": "Paint Coverage Calculator",
    "description": "Estimate litres of wall paint using area in square metres, coverage in m² per litre and number of coats. Includes a simple worked example.",
    "intro": "Estimate the paint needed for a specified wall area and coat count. Supply the product's coverage rate in square metres per litre for a practical material estimate.",
    "answer": "Paint required (L) = wall area (m²) × number of coats ÷ coverage rate (m²/L). The result is a theoretical quantity before spillage or other losses.",
    "steps": [
      "Measure the area you intend to paint in square metres.",
      "Enter the manufacturer's coverage per litre and the number of coats.",
      "Review the theoretical litres required; consider a separate allowance for waste and surface absorption."
    ],
    "examples": [
      [
        "65 m², 2 coats, 10 m²/L",
        "Paint required = (65 × 2) ÷ 10 = 13 L; total coated area = 130 m²."
      ],
      [
        "40 m², 1 coat, 8 m²/L",
        "Paint required = 40 ÷ 8 = 5 L, before waste or absorption allowances."
      ]
    ],
    "questions": [
      [
        "Does this include paint wastage?",
        "No. The calculation is based only on area, coat count and declared coverage. Porous surfaces, overspray, spillage and leftover paint are not automatically added."
      ],
      [
        "Should I subtract doors and windows?",
        "Enter the net area to be painted. If you want to exclude openings, subtract their areas from the gross wall area before calculating."
      ]
    ],
    "related": [
      [
        "Unit Converter",
        "unit-converter"
      ],
      [
        "Recipe Scaling Calculator",
        "recipe-scaler"
      ]
    ]
  },
  "linear-equation": {
    "title": "Linear Equation Calculator – Solve ax + b = c",
    "heading": "Linear Equation Solver",
    "description": "Solve a single-variable linear equation in the form ax + b = c. Enter coefficients to calculate x and review the formula and constraints.",
    "intro": "Solve an equation in the form ax + b = c for x, using the coefficient a, constant b and right-hand side c.",
    "answer": "For a ≠ 0, subtract b from both sides and divide by a: x = (c − b) / a. The equation is linear in one unknown.",
    "steps": [
      "Identify the coefficient a, constant b and right-hand side c.",
      "Enter all three numbers, with a non-zero coefficient.",
      "The calculator returns x = (c − b)/a and the related constant difference."
    ],
    "examples": [
      [
        "Solve 3x + 5 = 20",
        "Subtract 5: 3x = 15. Divide by 3: x = 5. Check: 3×5+5 = 20."
      ],
      [
        "Solve −2x + 7 = 1",
        "Subtract 7: −2x = −6. Divide by −2: x = 3."
      ]
    ],
    "questions": [
      [
        "What if a = 0?",
        "The standard x = (c−b)/a formula is undefined. If b = c, every x is a solution; otherwise there is no solution. This particular calculator requires a ≠ 0."
      ],
      [
        "Can it solve two simultaneous linear equations?",
        "No. This page solves one equation of the form ax+b=c. Use the linear-system calculator for simultaneous equations."
      ]
    ],
    "related": [
      [
        "Linear System Calculator",
        "linear-system"
      ],
      [
        "Slope Calculator",
        "slope-calculator"
      ]
    ]
  },
  "arc-length": {
    "title": "Arc Length Calculator – Sector Area & Chord",
    "heading": "Arc Length Calculator",
    "description": "Calculate circular arc length, sector area, chord length and circular segment area from radius and central angle in degrees.",
    "intro": "Calculate the length of a circular arc and the areas of its sector and segment using a radius and central angle in degrees.",
    "answer": "Arc length s = rθ when θ is in radians. For degrees: s = r × π × angle / 180. The sector area is πr² × angle / 360.",
    "steps": [
      "Enter the circle radius and central angle in degrees.",
      "Convert the central angle to radians within the arc formula.",
      "Read arc length, sector area, chord length and segment area with their respective units."
    ],
    "examples": [
      [
        "Radius 7 m, central angle 90°",
        "Arc length = 7π/2 ≈ 10.9956 m. Sector area = 49π/4 ≈ 38.4845 m²."
      ],
      [
        "Chord for the same arc",
        "Chord length = 2×7×sin(45°) = 7√2 ≈ 9.8995 m. Segment area ≈ 13.9845 m²."
      ]
    ],
    "questions": [
      [
        "Do I enter degrees or radians?",
        "The input uses degrees. The tool converts degrees to radians for the standard s = rθ relation."
      ],
      [
        "What is the difference between a sector and a segment?",
        "A sector is the area bounded by two radii and an arc. A circular segment is the area between the chord and its arc."
      ]
    ],
    "related": [
      [
        "2D Geometry Calculator",
        "2d-geometry-calculator"
      ],
      [
        "Triangle Trigonometry Solver",
        "triangle-trigonometry-solver"
      ]
    ]
  },
  "image-resolution-calculator": {
    "title": "PPI Calculator – Pixel Density & Screen Resolution",
    "heading": "PPI Calculator & Pixel Density",
    "description": "Calculate screen PPI from pixel width, height and diagonal inches. Also estimate megapixels, pixel pitch and uncompressed image size.",
    "intro": "Find a display's pixels per inch (PPI) from horizontal resolution, vertical resolution and screen diagonal, plus megapixels, pixel pitch and raw image size.",
    "answer": "PPI = √(width² + height²) ÷ diagonal inches. Resolution alone does not determine pixel density: physical screen size also matters.",
    "steps": [
      "Enter horizontal and vertical pixel counts and the physical diagonal in inches.",
      "Enter bits per pixel if you also need an uncompressed-size estimate.",
      "Read pixel density, megapixels, dot pitch and uncompressed bytes expressed in decimal MB."
    ],
    "examples": [
      [
        "1920×1080 pixels on a 15.6-inch display",
        "Diagonal pixels = √(1920²+1080²) ≈ 2202.91; PPI ≈ 2202.91/15.6 ≈ 141.21."
      ],
      [
        "Uncompressed 1920×1080 at 24 bits per pixel",
        "Raw size = 1920×1080×24/8 = 6,220,800 bytes = 6.2208 decimal MB, without compression or file headers."
      ]
    ],
    "questions": [
      [
        "Is PPI the same as DPI?",
        "PPI describes pixel density on a display; DPI typically describes print or output dots per inch. They are not interchangeable for all use cases."
      ],
      [
        "Does this give a compressed JPEG file size?",
        "No. The memory estimate assumes uncompressed pixels at the specified bits per pixel, not JPEG, PNG or display-buffer overhead."
      ]
    ],
    "related": [
      [
        "Unit Converter",
        "unit-converter"
      ],
      [
        "Scientific Calculator",
        "scientific-calculator"
      ]
    ]
  },
  "percentage-calculator": {
    "title": "Percentage Calculator – Change, Difference & Percent",
    "heading": "Percentage Calculator",
    "description": "Calculate a percent of a number, percentage increase or decrease, percent difference between values and what fraction one value is of another.",
    "intro": "Choose a mode to calculate percentages of a value, relative changes from old to new, symmetric percentage differences or what percent a part is of a whole.",
    "answer": "Percentage change = (new−old)/old × 100. Percentage difference compares two values to the average of their absolute magnitudes; they answer different questions.",
    "steps": [
      "Choose Percentage of a Number, Percentage Change, Percentage Difference or What % is X of Y.",
      "Enter the relevant values in the calculator's selected mode.",
      "Read the numerical result and use Explain Calculation for the substituted equation."
    ],
    "examples": [
      [
        "Find 15% of 240",
        "15/100 × 240 = 36."
      ],
      [
        "Percent difference between 64 and 80",
        "|64−80| / ((|64|+|80|)/2) × 100 = 16/72 × 100 ≈ 22.22%."
      ],
      [
        "Percent increase from 80 to 100",
        "(100−80)/80 × 100 = 25%, a different quantity from symmetric percent difference."
      ]
    ],
    "questions": [
      [
        "Are percent change and percent difference identical?",
        "No. Percent change uses an original baseline and can be positive or negative. Percent difference is symmetric in the two inputs."
      ],
      [
        "What happens if the baseline is zero?",
        "Percentage change with an original value of zero is undefined because its formula divides by the original value."
      ]
    ],
    "related": [
      [
        "Attendance Calculator",
        "attendance-planner"
      ],
      [
        "Recipe Scaling Calculator",
        "recipe-scaler"
      ]
    ]
  }
}''')
