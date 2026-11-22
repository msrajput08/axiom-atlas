/**
 * AxiomAtlas Brain Lab — deterministic, offline-first STEM challenge engine.
 * Every answer uses the same mathematical relationship as the linked canonical calculator.
 * No network, subscription, identity or leaderboard required.
 */
export const ROUNDS = 5;

function generator(seed) {
  let state = (Number(seed) >>> 0) || 0x91e10da5;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

export function seedFromText(value) {
  let h = 2166136261;
  for (const char of String(value)) {
    h ^= char.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function dailySeed(gameId, day) {
  return seedFromText('axiomatlas-brain-lab-v1|' + gameId + '|' + day);
}

export function makeChallenge(gameId, seed) {
  const rand = generator(seed);
  const pick = xs => xs[Math.floor(rand() * xs.length)];
  const int = (min, max) => min + Math.floor(rand() * (max - min + 1));
  const shuffle = items => {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const number = (prompt, answer, unit, hint, explanation, verifyInputs, verifyGuide, symbol = '') => ({
    mode: 'number', prompt, answer, unit, hint,
    explanation: explanation.length >= 35 ? explanation : 'Substitute the given values into the formula: ' + explanation,
    verifyInputs, verifyGuide, symbol
  });
  const choice = (prompt, answer, options, hint, explanation, verifyInputs, verifyGuide, symbol = '') => ({
    mode: 'multiple-choice', prompt, answer, options: shuffle(options), unit: '',
    hint, explanation, verifyInputs, verifyGuide, symbol
  });

  switch (gameId) {
    case 'prime-detective': {
      const p = pick([11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97]);
      const notPrimes = shuffle([15,21,25,27,33,35,39,49,51,55,57,63,65,69,77,81,85,87,91,95]).slice(0,3);
      return choice(
        'Only one number is prime. Which one breaks the pattern?',
        String(p), [String(p), ...notPrimes.map(String)],
        'A prime has exactly two positive divisors: 1 and itself. Check small divisors first.',
        p + ' is prime: no integer from 2 through √' + p + ' divides it. The other options have nontrivial factors.',
        { 'Integer n': p },
        'Open Prime Factorization & Divisors mode. Test each candidate to verify its primality classification.',
        '∑'
      );
    }
    case 'percent-hunt': {
      const p = pick([5,10,15,20,25,30,40,50,75]);
      const total = 20 * int(3,22);
      const answer = total * p / 100;
      return number(
        'A challenge box holds ' + total + ' tokens. What is ' + p + '% of them?',
        answer, 'tokens',
        'Divide the percentage by 100, then multiply by the whole.',
        p + '% × ' + total + ' = (' + p + '/100) × ' + total + ' = ' + answer + ' tokens.',
        { 'Percentage p': p + '%', 'Number n': total },
        'Select Percentage of a Number and enter p and n.',
        '%'
      );
    }
    case 'equation-escape': {
      const a = int(2,8);
      const x = int(-9,9);
      const b = int(-12,12);
      const c = a*x + b;
      return number(
        'Unlock x: ' + a + 'x ' + (b<0?'− '+(-b):'+ '+b) + ' = ' + c + '.',
        x, '', 'Move the constant term, then divide by the coefficient.',
        a + 'x = ' + c + ' − (' + b + ') = ' + (c-b) + '; x = ' + (c-b) + '/' + a + ' = ' + x + '.',
        { 'Coefficient a': a, 'Constant b': b, 'Right-hand side c': c },
        'Enter a, b, c in the Linear Equation Calculator (ax + b = c).',
        'x'
      );
    }
    case 'quadratic-code': {
      let r1 = int(-6,5);
      let r2 = int(-5,7);
      if (r1 === r2) r2++;
      const a = 1, b = -(r1+r2), c = r1*r2;
      const pair = (x,y) => '(' + [x,y].sort((p,q)=>p-q).join(', ') + ')';
      const ans = pair(r1,r2);
      const choices = [ans, pair(r1+1,r2), pair(r1,r2+1), pair(-r1,r2)];
      const opts = [...new Set(choices)];
      let offset = 2;
      while (opts.length < 4) {
        const other = pair(r1+offset,r2-offset);
        if (!opts.includes(other)) opts.push(other);
        offset++;
      }
      return choice(
        'Which pair of roots solves x² ' + (b<0?'− '+(-b):'+ '+b) + 'x ' + (c<0?'− '+(-c):'+ '+c) + ' = 0?',
        ans, opts,
        'For a monic quadratic, root sum = −b and root product = c.',
        'The quadratic factors as (x − (' + r1 + '))(x − (' + r2 + ')) = 0, giving roots ' + ans + '.',
        { 'a': a, 'b': b, 'c': c },
        'Enter coefficients a = 1, b and c into the Quadratic Equation Solver and compare the roots.',
        'x²'
      );
    }
    case 'derivative-dash': {
      const a = int(1,5), n=int(2,4), x=int(1,4);
      const answer=a*n*x**(n-1);
      return number(
        'At x = ' + x + ', what is the slope of f(x) = ' + a + 'x^' + n + '?',
        answer, '',
        'Apply the power rule: d(axⁿ)/dx = anxⁿ⁻¹.',
        "f'(x) = " + (a*n) + 'x^' + (n-1) + "; f'(" + x + ') = ' + (a*n) + ' × ' + x + '^' + (n-1) + ' = ' + answer + '.',
        { 'Expression f(x)': a + '*x^' + n, 'Evaluation point x': x },
        "Enter f(x) in the Derivative Calculator, then evaluate f'(x) at the given x.",
        "f'"
      );
    }
    case 'integral-hunt': {
      const a=int(1,6), b=2*int(1,5);
      const answer=a*b*b/2;
      return number(
        'Find the area under y = ' + a + 'x from x = 0 to x = ' + b + '.',
        answer, 'square units',
        'Integrate ax to (a/2)x², then evaluate from 0 to b.',
        '∫₀^' + b + ' ' + a + 'x dx = [' + a + 'x²/2]₀^' + b + ' = ' + a + ' × ' + b + '²/2 = ' + answer + '.',
        { 'Expression f(x)': a + '*x', 'Lower bound': 0, 'Upper bound': b },
        'Choose definite integration; enter f(x) and the limits 0 and ' + b + '.',
        '∫'
      );
    }
    case 'slope-run': {
      const x1=int(-5,5), y1=int(-7,7);
      const run=int(1,5), slope=pick([-4,-3,-2,-1,1,2,3,4]);
      const x2=x1+run, y2=y1+slope*run;
      return number(
        'What is the slope from (' + x1 + ', ' + y1 + ') to (' + x2 + ', ' + y2 + ')?',
        slope, '',
        'Slope is rise divided by run: (y₂−y₁)/(x₂−x₁).',
        'Rise = ' + y2 + ' − (' + y1 + ') = ' + (y2-y1) + '. Run = ' + x2 + ' − (' + x1 + ') = ' + run + '. Slope = ' + slope + '.',
        { x1, y1, x2, y2 },
        'Enter both coordinate points in the Slope Calculator.',
        'm'
      );
    }
    case 'shape-builder': {
      const l=int(3,18), w=int(2,12);
      return number(
        'A rectangular garden is ' + l + ' m long and ' + w + ' m wide. What is its area?',
        l*w, 'm²',
        'Rectangle area = length × width.',
        'Multiply the rectangle length by its width: Area = ' + l + ' m × ' + w + ' m = ' + (l*w) + ' m².',
        { 'Mode': 'Rectangle', 'Length l': l + ' m', 'Width w': w + ' m' },
        'Select Rectangle mode in the 2D Geometry Calculator and enter l and w.',
        '▱'
      );
    }
    case 'energy-quest': {
      const m=int(2,14), v=2*int(1,6), answer=m*v*v/2;
      return number(
        'A ' + m + ' kg object travels at ' + v + ' m/s. How much kinetic energy does it have?',
        answer, 'J',
        'The classical kinetic-energy formula is KE = ½mv².',
        'Square the speed, then multiply by half the mass: KE = ½ × ' + m + ' × ' + v + '² = ' + answer + ' joules.',
        { 'Mass m': m + ' kg', 'Speed v': v + ' m/s' },
        'Enter mass and speed in the Kinetic Energy Calculator. This is non-relativistic.',
        '½mv²'
      );
    }
    case 'circuit-lab': {
      const I=int(1,9), R=int(2,12), V=I*R;
      return number(
        'A resistor is ' + R + ' Ω and the voltage is ' + V + ' V. Find the current.',
        I, 'A',
        'Use Ohm’s law: I = V/R.',
        'Ohm’s law divides voltage by resistance: Current I = ' + V + ' V / ' + R + ' Ω = ' + I + ' A.',
        { 'Mode': 'Current & Power (from V & R)', 'Voltage V': V + ' V', 'Resistance R': R + ' Ω' },
        'Choose Find Current & Power (from V & R) in the Circuit Calculator.',
        'Ω'
      );
    }
    case 'mean-machine': {
      const mean=int(6,21);
      const offsets=shuffle([-4,-2,0,2,4]);
      const numbers=offsets.map(x=>mean+x);
      return number(
        'Dataset: ' + numbers.join(', ') + '. Find its arithmetic mean.',
        mean, '',
        'Add all values, then divide by the number of observations.',
        'Sum the five equally weighted observations to get ' + (mean*5) + ', then divide by 5: mean = ' + (mean*5) + '/5 = ' + mean + '.',
        { 'Dataset': numbers.join(', ') },
        'Paste the comma-separated dataset into the Statistics Calculator and locate the mean.',
        'x̄'
      );
    }
    case 'probability-lab': {
      const red=int(1,9), total=10, answer=red*10;
      return number(
        'A fair spinner has 10 equal sectors, ' + red + ' red. What is the chance of red, as a percentage?',
        answer, '%',
        'Favourable equally likely outcomes ÷ total outcomes × 100.',
        'There are ' + red + ' favourable sectors out of 10 equally likely ones: P(red) = ' + red + '/10 = ' + (red/10) + ' = ' + answer + '%.',
        { 'Event probability p': red + '/10 = ' + (red/10) },
        'Enter probability p = ' + (red/10) + ' in the Basic Probability & Odds Calculator to get the percentage.',
        'P'
      );
    }
    case 'interest-builder': {
      const P=100*int(5,40), rate=pick([2,4,5,6,8,10]), years=int(1,4);
      const answer=P*rate*years/100;
      return number(
        'Invest ' + P + ' credits at ' + rate + '% simple annual interest for ' + years + ' years. Interest earned?',
        answer, 'credits',
        'Simple interest I = principal × annual rate × years ÷ 100.',
        'I = ' + P + ' × ' + rate + ' × ' + years + ' / 100 = ' + answer + ' credits (not compounded).',
        { 'Mode': 'Simple Interest', 'Principal P': P, 'Annual interest r': rate + '%', 'Years t': years },
        'Choose Simple Interest mode, not Compound Interest, in the Interest Calculator.',
        '%'
      );
    }
    case 'margin-master': {
      const sell=100*int(2,20), margin=pick([10,20,25,30,40,50]), cost=sell*(100-margin)/100;
      return number(
        'An item costs ' + cost + ' credits and sells for ' + sell + ' credits. What is the gross profit margin?',
        margin, '%',
        'Margin uses selling price as denominator, not cost.',
        'Gross profit = ' + sell + ' − ' + cost + ' = ' + (sell-cost) + '. Margin = ' + (sell-cost) + '/' + sell + ' × 100 = ' + margin + '%.',
        { 'Unit cost': cost, 'Selling price': sell },
        'Enter cost and selling price in Profit Margin & Markup Calculator. Read Margin, not Markup.',
        '↗'
      );
    }
    case 'attendance-rescue': {
      const attended=pick([20,25,30,35,40,45]), held=50;
      return number(
        'You attended ' + attended + ' of ' + held + ' classes. What is your current attendance?',
        (attended/held)*100, '%',
        'Attendance % = attended classes ÷ classes held × 100.',
        'Divide attended classes by classes held and multiply by 100: ' + attended + '/' + held + ' × 100 = ' + (attended/held*100) + '%.',
        { 'Classes attended': attended, 'Classes held': held, 'Target': '75%' },
        'Enter attended, total held and any valid target in Attendance Planner. Read Current Attendance.',
        'A'
      );
    }
    case 'recipe-remix': {
      const old=pick([2,4,5]), quantity=20*old*int(2,7), target=pick([3,6,8,10]);
      const answer=quantity*target/old;
      return number(
        'A recipe uses ' + quantity + ' g of flour for ' + old + ' servings. How much for ' + target + ' servings?',
        answer, 'g',
        'Scale the ingredient by new servings / original servings.',
        'Scale the original flour quantity by the serving ratio: ' + quantity + ' × (' + target + '/' + old + ') = ' + answer + ' g.',
        { 'Ingredient amount q': quantity + ' g', 'Original servings': old, 'New servings': target },
        'Enter ingredient amount, original servings and target servings in Recipe Scaling Calculator.',
        '×'
      );
    }
    case 'solar-scale': {
      const radius=int(1,6), answer=radius*695700;
      return number(
        'A star has a nominal radius of ' + radius + ' R☉. What is that in kilometres?',
        answer, 'km',
        'One nominal solar radius is exactly 695,700 km.',
        'Multiply the star’s radius in R☉ by the exact nominal solar radius: ' + radius + ' × 695,700 km = ' + answer.toLocaleString('en-US') + ' km.',
        { 'Radius in solar radii': radius + ' R☉' },
        'Enter ' + radius + ' into the Solar Radius Converter and read the kilometres result.',
        '☉'
      );
    }
    case 'star-distance': {
      const p=pick([0.05,0.1,0.2,0.25,0.5]);
      const answer=1/p;
      return number(
        'A star has annual parallax p = ' + p + ' arcseconds. What is its distance in parsecs?',
        answer, 'pc',
        'For annual trigonometric parallax, distance in parsecs is 1 / p in arcseconds.',
        'For stellar parallax in arcseconds, take the reciprocal to find distance: d = 1 / ' + p + ' = ' + answer + ' pc.',
        { 'Parallax angle p': p + ' arcsec' },
        'Enter parallax angle p in the Stellar Parallax Calculator and read distance in parsecs.',
        '✦'
      );
    }
    default:
      throw new RangeError('Unknown game: ' + String(gameId));
  }
}

export function gradeAnswer(challenge, response) {
  if (typeof response !== 'string' && typeof response !== 'number') return false;
  const raw = String(response).trim();
  if (!raw) return false;
  if (challenge.mode === 'multiple-choice') {
    return raw === String(challenge.answer);
  }
  if (challenge.mode !== 'number') return false;
  const cleaned = raw.replace(/,/g, '').replace(/%$/, '').trim();
  // Reject hexadecimal, Infinity, empty strings, and text with embedded numbers.
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(cleaned)) return false;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return false;
  const expected = Number(challenge.answer);
  const tolerance = Math.max(1e-8, Math.abs(expected)*1e-9);
  return Number.isFinite(expected) && Math.abs(value - expected) <= tolerance;
}

export function formatAnswer(challenge) {
  const raw = challenge.answer;
  const value = challenge.mode === 'number'
    ? Number(raw).toLocaleString('en-US', { maximumFractionDigits: 8 })
    : String(raw);
  return value + (challenge.unit ? ' ' + challenge.unit : '');
}

export function roundSeed(baseSeed, index) {
  if (!Number.isInteger(index) || index < 0) throw RangeError('Invalid round');
  return seedFromText((baseSeed >>> 0) + ':' + index);
}
