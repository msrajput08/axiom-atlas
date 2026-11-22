"""Additional calculator-specific, fact-checked SEO guides backed by observed Search Console interest."""
import json

SEO_EXPANSION = json.loads(r'''{
  "midpoint-calculator": {
    "title": "Midpoint Calculator – Find Coordinates & Distance",
    "heading": "Midpoint Calculator",
    "description": "Calculate the midpoint between two coordinate points, plus straight-line distance. Enter x and y coordinates and see formulas with examples.",
    "intro": "Enter the endpoints of a line segment to find its midpoint coordinates and the straight-line distance between the points.",
    "answer": "The midpoint of (x₁, y₁) and (x₂, y₂) is ((x₁+x₂)/2, (y₁+y₂)/2). The Euclidean distance is √((x₂−x₁)²+(y₂−y₁)²).",
    "steps": [
      "Enter the x and y coordinates of the first endpoint.",
      "Enter the coordinates of the second endpoint.",
      "Read the midpoint's x and y coordinates and the distance between endpoints."
    ],
    "examples": [
      [
        "Between (2, 6) and (8, 10)",
        "Midpoint = ((2+8)/2, (6+10)/2) = (5, 8). Distance = √((8−2)²+(10−6)²) = √52 ≈ 7.2111."
      ],
      [
        "Between (−4, 2) and (6, 8)",
        "Midpoint = ((−4+6)/2, (2+8)/2) = (1, 5)."
      ]
    ],
    "questions": [
      [
        "How do you find a midpoint?",
        "Average the two x coordinates to obtain the midpoint x; separately average the two y coordinates for the midpoint y."
      ],
      [
        "Does switching the endpoints change the midpoint?",
        "No. The midpoint and distance are symmetric, so swapping the two endpoints produces identical results."
      ]
    ],
    "related": [
      [
        "Slope Calculator",
        "slope-calculator"
      ],
      [
        "Linear Equation Calculator",
        "linear-equation"
      ]
    ]
  },
  "torque-calculator": {
    "title": "Torque Calculator – Force, Lever Arm & Angle",
    "heading": "Torque Calculator",
    "description": "Calculate torque in newton-metres from lever arm length, applied force and angle. Learn τ = rF sin θ with precise worked examples.",
    "intro": "Calculate the magnitude of torque produced by a force acting at a distance from a pivot. Enter the lever arm, force and their relative angle.",
    "answer": "Torque magnitude τ = r × F × sin(θ), where r is the lever arm in metres, F is applied force in newtons, and θ is the angle between the two vectors.",
    "steps": [
      "Enter the pivot-to-force distance (lever arm) in metres.",
      "Enter the force in newtons and the angle in degrees relative to the lever arm.",
      "Read the torque in N·m and the perpendicular component of applied force."
    ],
    "examples": [
      [
        "0.5 m lever and 80 N at 90°",
        "Torque = 0.5 × 80 × sin(90°) = 40 N·m; the whole 80 N is perpendicular."
      ],
      [
        "0.5 m lever and 80 N at 30°",
        "Torque = 0.5 × 80 × sin(30°) = 20 N·m; perpendicular force = 40 N."
      ]
    ],
    "questions": [
      [
        "Why is torque zero at 0°?",
        "The force is parallel to the lever arm, so sin(0°)=0 and its perpendicular component produces no turning moment."
      ],
      [
        "Is a newton-metre of torque the same as a joule?",
        "They share dimensional units, but torque is a rotational moment while a joule measures energy; they are not interchangeable physical quantities."
      ]
    ],
    "related": [
      [
        "Kinetic Energy Calculator",
        "kinetic-energy"
      ],
      [
        "Unit Converter",
        "unit-converter"
      ]
    ]
  },
  "solar-radius-converter": {
    "title": "Solar Radius Converter – R☉ to km, Earth Radii & AU",
    "heading": "Solar Radius Converter",
    "description": "Convert solar radii into kilometres, metres, Earth radii, Jupiter radii and AU using the IAU nominal solar radius of exactly 695,700 km.",
    "intro": "Convert stellar radii expressed in nominal solar radii (R☉) into SI and astronomical units using the IAU nominal solar radius of 695,700 km.",
    "answer": "One nominal solar radius is exactly 6.957 × 10⁸ m = 695,700 km (IAU 2015 nominal solar radius). It is approximately 109.20 Earth radii and 0.00465047 AU.",
    "steps": [
      "Enter a radius expressed in nominal solar radii (R☉).",
      "Multiply by 695,700 km per nominal solar radius.",
      "Compare the converted metres, kilometres, Jupiter radii, Earth radii and AU."
    ],
    "examples": [
      [
        "Convert 1 R☉ into kilometres",
        "1 × 695,700 = 695,700 km, or 695,700,000 m."
      ],
      [
        "Convert 2 R☉ into kilometres",
        "2 × 695,700 = 1,391,400 km."
      ]
    ],
    "questions": [
      [
        "What does R☉ mean?",
        "R☉ (R-sun) denotes the nominal solar radius, a standard astronomical conversion unit. It need not equal the Sun's instantaneous physical radius."
      ],
      [
        "How many Earth radii are in a solar radius?",
        "Using the calculator's nominal constants, 695,700 ÷ 6,371 ≈ 109.20 Earth radii."
      ]
    ],
    "related": [
      [
        "Solar Mass Converter",
        "solar-mass-converter"
      ],
      [
        "Unit Converter",
        "unit-converter"
      ]
    ]
  },
  "kinetic-energy": {
    "title": "Kinetic Energy Calculator – KE = ½mv² & Momentum",
    "heading": "Kinetic Energy Calculator",
    "description": "Calculate translational kinetic energy in joules and momentum from mass in kilograms and speed in metres per second. Includes worked examples.",
    "intro": "Enter mass and speed to calculate translational kinetic energy in joules and linear momentum in kilogram-metres per second.",
    "answer": "Translational kinetic energy KE = ½mv². Momentum magnitude p = mv. Increasing speed by a factor of two increases kinetic energy by a factor of four at constant mass.",
    "steps": [
      "Enter the object's mass in kilograms.",
      "Enter its speed in metres per second.",
      "Read kinetic energy in joules and the magnitude of momentum in kg·m/s."
    ],
    "examples": [
      [
        "Mass 10 kg moving at 6 m/s",
        "KE = ½ × 10 × 6² = 180 J; momentum magnitude = 10 × 6 = 60 kg·m/s."
      ],
      [
        "Double the speed to 12 m/s",
        "At the same 10 kg mass, KE = ½ × 10 × 12² = 720 J (four times as much). Momentum magnitude = 120 kg·m/s."
      ]
    ],
    "questions": [
      [
        "Can kinetic energy be negative?",
        "Not in this classical translational formula for non-negative mass: KE = ½mv² is zero or positive."
      ],
      [
        "Does this account for relativistic speeds?",
        "No. This is the classical Newtonian approximation and should not be used when the object's speed approaches the speed of light."
      ]
    ],
    "related": [
      [
        "Torque Calculator",
        "torque-calculator"
      ],
      [
        "Unit Converter",
        "unit-converter"
      ]
    ]
  },
  "sequence-series-calculator": {
    "title": "Arithmetic & Geometric Sequence Calculator – nth Term",
    "heading": "Arithmetic & Geometric Sequence Calculator",
    "description": "Calculate arithmetic sequence nth terms and sums, geometric progression nth terms and sums, and convergent infinite geometric series.",
    "intro": "Work with arithmetic and geometric progressions in one calculator. Choose Arithmetic, Geometric or Infinite Geometric Series mode and enter starting values.",
    "answer": "For an arithmetic sequence, aₙ = a₁+(n−1)d and Sₙ = n[2a₁+(n−1)d]/2. In a geometric sequence, aₙ = a₁rⁿ⁻¹.",
    "steps": [
      "Choose Arithmetic Sequence (AP), Geometric Sequence (GP) or Infinite Geometric Series mode.",
      "Enter the first term, common difference or ratio, and term count as needed.",
      "Read the nth term and partial sum, or infinite sum when |r| is less than 1."
    ],
    "examples": [
      [
        "Arithmetic progression: first term 4, d = 3, n = 12",
        "The 12th term is 4 + 11×3 = 37. The first 12 terms sum to 12×(4+37)/2 = 246."
      ],
      [
        "Infinite geometric series: first term 10, ratio ½",
        "Since |r| = 0.5 < 1, S∞ = 10/(1−0.5) = 20."
      ]
    ],
    "questions": [
      [
        "What is the difference between arithmetic and geometric progressions?",
        "Arithmetic sequences add a constant difference to obtain successive terms; geometric sequences multiply by a constant ratio."
      ],
      [
        "When does an infinite geometric sum exist?",
        "For a geometric series with first term a₁ and common ratio r, the conventional infinite sum a₁/(1−r) converges when |r| < 1."
      ]
    ],
    "related": [
      [
        "Prime Number Checker",
        "prime-checker"
      ],
      [
        "Scientific Calculator",
        "scientific-calculator"
      ]
    ]
  }
}''')
