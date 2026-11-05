// AxiomAtlas 2.0 Core Mathematical, Unit Conversion, Fraction, Matrix & Deterministic Trace Engine
// Zero eval(), zero remote runtime dependencies, 100% deterministic client-side execution.

export const CONSTANTS = {
  pi: { value: Math.PI, unit: 'rad', name: 'Archimedes constant π' },
  e: { value: Math.E, unit: '', name: "Euler's number e" },
  tau: { value: 2 * Math.PI, unit: 'rad', name: 'Circle constant τ = 2π' },
  phi: { value: (1 + Math.sqrt(5)) / 2, unit: '', name: 'Golden ratio φ' },
  c: { value: 299792458, unit: 'm/s', name: 'Speed of light in vacuum c' },
  G: { value: 6.67430e-11, unit: 'N·m²/kg²', name: 'Gravitational constant G' },
  g0: { value: 9.80665, unit: 'm/s²', name: 'Standard gravity g₀' },
  h: { value: 6.62607015e-34, unit: 'J·s', name: 'Planck constant h' },
  hbar: { value: 1.054571817e-34, unit: 'J·s', name: 'Reduced Planck constant ℏ' },
  kB: { value: 1.380649e-23, unit: 'J/K', name: 'Boltzmann constant k_B' },
  NA: { value: 6.02214076e23, unit: 'mol⁻¹', name: 'Avogadro constant N_A' },
  Rgas: { value: 8.314462618, unit: 'J/(mol·K)', name: 'Molar gas constant R' },
  q_e: { value: 1.602176634e-19, unit: 'C', name: 'Elementary charge e' },
  m_e: { value: 9.1093837139e-31, unit: 'kg', name: 'Electron mass m_e' },
  m_p: { value: 1.67262192595e-27, unit: 'kg', name: 'Proton mass m_p' },
  eps0: { value: 8.8541878188e-12, unit: 'F/m', name: 'Vacuum electric permittivity ε₀' },
  mu0: { value: 1.25663706127e-6, unit: 'H/m', name: 'Vacuum magnetic permeability μ₀' },
  ke: { value: 8.9875517923e9, unit: 'N·m²/C²', name: 'Coulomb constant k_e = 1/(4πε₀)' },
  sigmaSB: { value: 5.670374419e-8, unit: 'W/(m²·K⁴)', name: 'Stefan-Boltzmann constant σ' }
};

export function erf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

export function lgamma(z) {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
  ];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

export function gamma(z) {
  if (z <= 0 && Number.isInteger(z)) throw Error('Gamma function is undefined at non-positive integers');
  if (Number.isInteger(z) && z >= 1 && z <= 171) {
    let p = 1;
    for (let i = 2; i < z; i++) p *= i;
    return p;
  }
  return Math.exp(lgamma(z));
}

function snapTrigZero(v) {
  return Math.abs(v) < 1e-15 ? 0 : v;
}

function gcdPair(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) throw Error('GCD requires finite numbers');
  a = Math.round(Math.abs(a));
  b = Math.round(Math.abs(b));
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b)) throw Error('GCD requires safe integers');
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function lcmPair(a, b) {
  a = Math.round(Math.abs(a));
  b = Math.round(Math.abs(b));
  if (a === 0 || b === 0) return 0;
  return (a / gcdPair(a, b)) * b;
}

export const known = {
  sin: x => snapTrigZero(Math.sin(x)),
  cos: x => snapTrigZero(Math.cos(x)),
  tan: x => {
    const c = Math.cos(x);
    if (Math.abs(c) < 1e-14) throw Error('Tangent is undefined at vertical asymptote (cos θ = 0)');
    return snapTrigZero(Math.sin(x) / c);
  },
  sec: x => {
    const c = Math.cos(x);
    if (Math.abs(c) < 1e-14) throw Error('Secant is undefined at vertical asymptote (cos θ = 0)');
    return 1 / c;
  },
  csc: x => {
    const s = Math.sin(x);
    if (Math.abs(s) < 1e-14) throw Error('Cosecant is undefined at vertical asymptote (sin θ = 0)');
    return 1 / s;
  },
  cosec: x => known.csc(x),
  cot: x => {
    const s = Math.sin(x);
    if (Math.abs(s) < 1e-14) throw Error('Cotangent is undefined at vertical asymptote (sin θ = 0)');
    return snapTrigZero(Math.cos(x) / s);
  },
  asin: x => {
    if (x < -1 || x > 1) throw Error('Inverse sine (asin) requires input between −1 and +1');
    return Math.asin(x);
  },
  arcsin: x => known.asin(x),
  acos: x => {
    if (x < -1 || x > 1) throw Error('Inverse cosine (acos) requires input between −1 and +1');
    return Math.acos(x);
  },
  arccos: x => known.acos(x),
  atan: Math.atan,
  arctan: Math.atan,
  asec: x => {
    if (Math.abs(x) < 1) throw Error('Inverse secant (asec) requires |x| ≥ 1');
    return Math.acos(1 / x);
  },
  arcsec: x => known.asec(x),
  acsc: x => {
    if (Math.abs(x) < 1) throw Error('Inverse cosecant (acsc) requires |x| ≥ 1');
    return Math.asin(1 / x);
  },
  arccsc: x => known.acsc(x),
  acot: x => Math.atan2(1, x),
  arccot: x => Math.atan2(1, x),
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  sech: x => 1 / Math.cosh(x),
  csch: x => {
    if (x === 0) throw Error('Hyperbolic cosecant (csch) is undefined at 0');
    return 1 / Math.sinh(x);
  },
  coth: x => {
    if (x === 0) throw Error('Hyperbolic cotangent (coth) is undefined at 0');
    return Math.cosh(x) / Math.sinh(x);
  },
  asinh: Math.asinh,
  arcsinh: Math.asinh,
  acosh: x => {
    if (x < 1) throw Error('Inverse hyperbolic cosine (acosh) requires x ≥ 1');
    return Math.acosh(x);
  },
  arccosh: x => known.acosh(x),
  atanh: x => {
    if (x <= -1 || x >= 1) throw Error('Inverse hyperbolic tangent (atanh) requires −1 < x < 1');
    return Math.atanh(x);
  },
  arctanh: x => known.atanh(x),
  sqrt: x => {
    if (x < 0) throw Error('Square root of a negative number is not a real number');
    return Math.sqrt(x);
  },
  cbrt: Math.cbrt,
  nthroot: (x, n = 2) => {
    if (n === 0) throw Error('Root degree n cannot be zero');
    if (x < 0) {
      if (!Number.isInteger(n) || Math.abs(n % 2) !== 1) {
        throw Error('Even root of a negative number is not a real number');
      }
      return -Math.pow(-x, 1 / n);
    }
    return Math.pow(x, 1 / n);
  },
  root: (n, x) => known.nthroot(x, n),
  abs: Math.abs,
  exp: Math.exp,
  ln: x => {
    if (x <= 0) throw Error('Natural logarithm ln(x) requires x > 0');
    return Math.log(x);
  },
  log: (x, b = 10) => {
    if (x <= 0) throw Error('Logarithm requires argument x > 0');
    if (b <= 0 || b === 1) throw Error('Logarithm base must be positive and not equal to 1');
    return b === 10 ? Math.log10(x) : Math.log(x) / Math.log(b);
  },
  log10: x => known.log(x, 10),
  log2: x => {
    if (x <= 0) throw Error('Base-2 logarithm log2(x) requires x > 0');
    return Math.log2(x);
  },
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  sign: Math.sign,
  min: Math.min,
  max: Math.max,
  pow: (x, y) => {
    if (x < 0 && !Number.isInteger(y)) {
      const inv = 1 / y;
      if (Number.isInteger(inv) && Math.abs(inv % 2) === 1) return -Math.pow(-x, y);
    }
    return Math.pow(x, y);
  },
  hypot: Math.hypot,
  atan2: Math.atan2,
  erf,
  erfc: x => 1 - erf(x),
  gamma,
  lgamma,
  sinc: x => (Math.abs(x) < 1e-12 ? 1 : Math.sin(x) / x),
  step: x => (x < 0 ? 0 : 1),
  heaviside: x => (x < 0 ? 0 : 1),
  mod: (a, b) => {
    if (b === 0) throw Error('Modulo divisor cannot be zero');
    return ((a % b) + Math.abs(b)) % Math.abs(b);
  },
  gcd: (...args) => {
    if (args.length < 2) throw Error('GCD requires at least two integers');
    return args.reduce((acc, val) => gcdPair(acc, val));
  },
  lcm: (...args) => {
    if (args.length < 2) throw Error('LCM requires at least two integers');
    return args.reduce((acc, val) => lcmPair(acc, val));
  },
  fact: n => {
    if (!Number.isInteger(n) || n < 0 || n > 170) throw Error('Factorial supports integers 0–170');
    let p = 1;
    for (let i = 2; i <= n; i++) p *= i;
    return p;
  },
  perm: (n, r) => {
    if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n || n > 170) {
      throw Error('Use integers 0 ≤ r ≤ n ≤ 170');
    }
    let v = 1;
    for (let i = n - r + 1; i <= n; i++) v *= i;
    return v;
  },
  comb: (n, r) => {
    if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n || n > 1024) {
      throw Error('Use integers 0 ≤ r ≤ n ≤ 1024');
    }
    r = Math.min(r, n - r);
    let x = 1;
    for (let i = 1; i <= r; i++) x = (x * (n - r + i)) / i;
    return Math.round(x);
  }
};

const forwardTrigSet = new Set(['sin', 'cos', 'tan', 'sec', 'csc', 'cosec', 'cot']);
const inverseTrigSet = new Set(['asin', 'arcsin', 'acos', 'arccos', 'atan', 'arctan', 'asec', 'arcsec', 'acsc', 'arccsc', 'acot', 'arccot', 'atan2']);

// Detect ambiguous ASCII notation like sin^-1(x)
export function checkAmbiguity(src) {
  const s = String(src || '');
  const m = /\b(sin|cos|tan|sec|csc|cot)\s*\^\s*-\s*1\s*\(/i.exec(s);
  if (m) {
    const fn = m[1].toLowerCase();
    const invMap = { sin: 'asin', cos: 'acos', tan: 'atan', sec: 'asec', csc: 'acsc', cot: 'acot' };
    const recMap = { sin: 'csc', cos: 'sec', tan: 'cot', sec: 'cos', csc: 'sin', cot: 'tan' };
    return {
      ambiguous: true,
      token: `${fn}^-1(...)`,
      inverseOption: s.replace(new RegExp(`\\b${fn}\\s*\\^\\s*-\\s*1\\s*\\(`, 'gi'), `${invMap[fn]}(`),
      reciprocalOption: s.replace(new RegExp(`\\b${fn}\\s*\\^\\s*-\\s*1\\s*\\(`, 'gi'), `${recMap[fn]}(`),
      message: `"${fn}^-1(x)" can mean Inverse ${fn} (${invMap[fn]}(x)) or Reciprocal 1/${fn}(x) (${recMap[fn]}(x)). Please select your intended meaning.`
    };
  }
  return { ambiguous: false };
}

function normalizeMathSource(raw) {
  let s = String(raw ?? '');
  // Convert Unicode sin⁻¹( -> asin(, cos⁻¹( -> acos(, tan⁻¹( -> atan(
  s = s.replace(/\bsin⁻¹\s*\(/gi, 'asin(')
       .replace(/\bcos⁻¹\s*\(/gi, 'acos(')
       .replace(/\btan⁻¹\s*\(/gi, 'atan(')
       .replace(/\bsec⁻¹\s*\(/gi, 'asec(')
       .replace(/\bcsc⁻¹\s*\(/gi, 'acsc(')
       .replace(/\bcot⁻¹\s*\(/gi, 'acot(');

  // Convert Unicode superscripts (e.g., x², sin²(x), x⁻³)
  const supMap = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+' };
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g, match => '^(' + [...match].map(ch => supMap[ch] ?? ch).join('') + ')');

  // Convert Unicode subscripts (₀..₉ -> 0..9)
  const subMap = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
  s = s.replace(/[₀₁₂₃₄₅₆₇⁸₉]/g, ch => subMap[ch] ?? ch);

  // Convert |expr| vertical absolute value bars (non-nested)
  s = s.replace(/\|([^|]+)\|/g, 'abs($1)');

  // Convert prefix radicals without parens: √9 -> sqrt(9), √x -> sqrt(x), ∛8 -> cbrt(8)
  s = s.replace(/∛\s*\(/g, 'cbrt(')
       .replace(/∛\s*(\d+(?:\.\d*)?|\.\d+|[A-Za-z_][A-Za-z_0-9]*)/g, 'cbrt($1)')
       .replace(/√\s*\(/g, 'sqrt(')
       .replace(/√\s*(\d+(?:\.\d*)?|\.\d+|[A-Za-z_][A-Za-z_0-9]*)/g, 'sqrt($1)');

  // Replace standard symbols
  s = s.replace(/π/g, 'pi')
       .replace(/τ/g, 'tau')
       .replace(/φ/g, 'phi')
       .replace(/\*\*/g, '^')
       .replace(/×/g, '*')
       .replace(/⋅/g, '*')
       .replace(/÷/g, '/')
       .replace(/−/g, '-')
       .replace(/–/g, '-')
       .replace(/√/g, 'sqrt')
       .replace(/\s+/g, '')
       .trim();

  // Convert trig power notation sin^2(x) or sin^(2)(x) -> (sin(x))^(2)
  // Handles balanced parentheses inside the trig argument
  const trigPowRx = /\b(sin|cos|tan|sec|csc|cosec|cot|sinh|cosh|tanh)\^(\(\d+\)|[2-9]\d*)\(/i;
  let guard = 0;
  while (trigPowRx.test(s) && guard++ < 20) {
    const m = trigPowRx.exec(s);
    const fn = m[1], expPart = m[2], openIdx = m.index + m[0].length - 1;
    let depth = 0, closeIdx = -1;
    for (let k = openIdx; k < s.length; k++) {
      if (s[k] === '(') depth++;
      else if (s[k] === ')') {
        depth--;
        if (depth === 0) { closeIdx = k; break; }
      }
    }
    if (closeIdx === -1) break;
    const arg = s.slice(openIdx + 1, closeIdx);
    s = s.slice(0, m.index) + `(${fn}(${arg}))^${expPart}` + s.slice(closeIdx + 1);
  }

  return s;
}

export function compile(src, options = {}) {
  const amb = checkAmbiguity(src);
  if (amb.ambiguous && !options.allowAmbiguousInversePower) {
    throw Error(amb.message);
  }
  const clean = normalizeMathSource(src);
  if (clean.length > 640) throw Error('Expression too long (max 640 characters)');
  const t = [];
  let pos = 0;
  const rx = /(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|[A-Za-z_][A-Za-z_0-9]*|[()+\-*/^,%!]/y;
  while (pos < clean.length) {
    rx.lastIndex = pos;
    const m = rx.exec(clean);
    if (!m) throw Error('Unsupported character near ' + clean.slice(pos, pos + 9));
    t.push(m[0]);
    pos = rx.lastIndex;
    if (t.length > 360) throw Error('Expression too complex');
  }
  let i = 0;
  const peek = () => t[i], take = () => t[i++], eat = v => { if (peek() === v) { i++; return true; } return false; };

  function primary() {
    const v = take();
    if (!v) throw Error('Incomplete expression');
    if (v === '(') {
      const a = add();
      if (!eat(')')) throw Error('Missing closing parenthesis');
      return a;
    }
    if (/^(?:\d|\.)/.test(v)) return ['n', Number(v)];
    if (/^[A-Za-z_]/.test(v)) {
      const lower = v.toLowerCase();
      // Only treat v(...) as a function call if v is a registered function in known!
      // Otherwise (e.g. x(x+1) or pi(2)), return variable ['v', v] so mul() handles implicit multiplication!
      if (peek() === '(' && Object.prototype.hasOwnProperty.call(known, lower)) {
        eat('(');
        const args = [];
        if (!eat(')')) {
          do { args.push(add()); } while (eat(','));
          if (!eat(')')) throw Error('Missing closing parenthesis');
        }
        return ['call', lower, args];
      }
      if (peek() === '(' && !Object.prototype.hasOwnProperty.call(known, lower) && v.length > 1 && !['pi', 'tau', 'phi', 'ans'].includes(lower)) {
        throw Error('Unknown function: ' + v);
      }
      return ['v', v];
    }
    throw Error('Unexpected token: ' + v);
  }

  function pow() {
    let a = primary();
    while (eat('!')) a = ['call', 'fact', [a]];
    if (eat('^')) return ['op', '^', a, unary()];
    return a;
  }

  function unary() {
    if (eat('-')) return ['neg', unary()];
    if (eat('+')) return unary();
    return pow();
  }

  function mul() {
    let a = unary();
    for (;;) {
      const v = peek();
      if (['*', '/', '%'].includes(v)) {
        take();
        // Support postfix percentage like 50% when % is at end of expression or before ), +, -
        if (v === '%' && (!peek() || [')', '+', '-', ','].includes(peek()))) {
          a = ['op', '/', a, ['n', 100]];
        } else {
          a = ['op', v, a, unary()];
        }
      } else if (v && (v === '(' || /^[A-Za-z_]/.test(v) || /^(?:\d|\.)/.test(v))) {
        a = ['op', '*', a, unary()];
      } else {
        break;
      }
    }
    return a;
  }

  function add() {
    let a = mul();
    while (peek() === '+' || peek() === '-') {
      const v = take();
      a = ['op', v, a, mul()];
    }
    return a;
  }

  if (!t.length) throw Error('Please enter an expression');
  const ast = add();
  if (i < t.length) throw Error('Unexpected token: ' + t[i]);
  return ast;
}

export function formatAstText(node, vars = null) {
  if (!node) return '';
  if (node[0] === 'n') return fmt(node[1]);
  if (node[0] === 'v') {
    const k = node[1];
    if (vars && Object.prototype.hasOwnProperty.call(vars, k)) return fmt(Number(vars[k]));
    if (k.toLowerCase() === 'pi') return 'π';
    if (k.toLowerCase() === 'tau') return 'τ';
    if (k.toLowerCase() === 'phi') return 'φ';
    return k;
  }
  if (node[0] === 'neg') {
    const inner = formatAstText(node[1], vars);
    return node[1][0] === 'op' ? `−(${inner})` : `−${inner}`;
  }
  if (node[0] === 'call') {
    const fn = node[1];
    const dispMap = { asin: 'arcsin', acos: 'arccos', atan: 'arctan', asec: 'arcsec', acsc: 'arccsc', acot: 'arccot', sqrt: '√' };
    const name = dispMap[fn] || fn;
    return `${name}(${node[2].map(x => formatAstText(x, vars)).join(', ')})`;
  }
  if (node[0] === 'op') {
    const op = node[1];
    const l = formatAstText(node[2], vars);
    const r = formatAstText(node[3], vars);
    const lWrap = (node[2][0] === 'op' && ['+', '-'].includes(node[2][1]) && ['*', '/', '^'].includes(op)) || (node[2][0] === 'neg' && op === '^') ? `(${l})` : l;
    const rWrap = (node[3][0] === 'op' && (['*', '/', '^'].includes(op) || (op === '-' && ['+', '-'].includes(node[3][1])))) ? `(${r})` : r;
    const sym = op === '*' ? ' × ' : op === '/' ? ' / ' : op === '-' ? ' − ' : op === '+' ? ' + ' : op;
    return `${lWrap}${sym}${rWrap}`;
  }
  return '';
}

export function formatAstHtml(node) {
  const escH = s => String(s ?? '').replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]));
  if (!node) return '';
  if (node[0] === 'n') return `<span class="m-num">${escH(fmt(node[1]))}</span>`;
  if (node[0] === 'v') {
    const k = node[1];
    const sym = k.toLowerCase() === 'pi' ? 'π' : k.toLowerCase() === 'tau' ? 'τ' : k.toLowerCase() === 'phi' ? 'φ' : k;
    return `<var>${escH(sym)}</var>`;
  }
  if (node[0] === 'neg') {
    const inner = formatAstHtml(node[1]);
    return node[1][0] === 'op' ? `−(${inner})` : `−${inner}`;
  }
  if (node[0] === 'call') {
    const fn = node[1];
    if (fn === 'sqrt' && node[2].length === 1) return `<span class="m-rad">√(${formatAstHtml(node[2][0])})</span>`;
    if (fn === 'cbrt' && node[2].length === 1) return `<span class="m-rad">∛(${formatAstHtml(node[2][0])})</span>`;
    if (fn === 'nthroot' && node[2].length === 2) return `<span class="m-rad"><sup>${formatAstHtml(node[2][1])}</sup>√(${formatAstHtml(node[2][0])})</span>`;
    if (fn === 'abs' && node[2].length === 1) return `|${formatAstHtml(node[2][0])}|`;
    if (fn === 'fact' && node[2].length === 1) return `(${formatAstHtml(node[2][0])})!`;
    const dispMap = {
      asin: 'sin<sup>−1</sup>', arcsin: 'sin<sup>−1</sup>',
      acos: 'cos<sup>−1</sup>', arccos: 'cos<sup>−1</sup>',
      atan: 'tan<sup>−1</sup>', arctan: 'tan<sup>−1</sup>',
      asec: 'sec<sup>−1</sup>', acsc: 'csc<sup>−1</sup>', acot: 'cot<sup>−1</sup>'
    };
    const label = dispMap[fn] || escH(fn);
    return `<span class="m-fn">${label}</span>(${node[2].map(formatAstHtml).join(', ')})`;
  }
  if (node[0] === 'op') {
    const op = node[1];
    if (op === '^') {
      const baseHtml = (node[2][0] === 'op' || node[2][0] === 'neg' || node[2][0] === 'call') ? `(${formatAstHtml(node[2])})` : formatAstHtml(node[2]);
      return `${baseHtml}<sup>${formatAstHtml(node[3])}</sup>`;
    }
    if (op === '/') {
      return `<span class="m-frac"><span class="m-num-top">${formatAstHtml(node[2])}</span><span class="m-bar">/</span><span class="m-den-bot">${formatAstHtml(node[3])}</span></span>`;
    }
    const l = formatAstHtml(node[2]);
    const r = formatAstHtml(node[3]);
    const lWrap = (node[2][0] === 'op' && ['+', '-'].includes(node[2][1]) && op === '*') ? `(${l})` : l;
    const rWrap = (node[3][0] === 'op' && ['+', '-'].includes(node[3][1]) && (op === '*' || op === '-')) ? `(${r})` : r;
    const sym = op === '*' ? ' · ' : op === '-' ? ' − ' : op === '+' ? ' + ' : ' mod ';
    return `${lWrap}${sym}${rWrap}`;
  }
  return '';
}

export function extractVariables(ast) {
  const vars = new Set();
  const builtins = new Set(['pi', 'e', 'tau', 'phi']);
  function walk(n) {
    if (!n) return;
    if (n[0] === 'v' && !builtins.has(n[1].toLowerCase())) vars.add(n[1]);
    else if (n[0] === 'neg') walk(n[1]);
    else if (n[0] === 'call') n[2].forEach(walk);
    else if (n[0] === 'op') { walk(n[2]); walk(n[3]); }
  }
  walk(ast);
  return [...vars];
}

export function run(ast, vars = {}, options = {}, traceSteps = null) {
  let calls = 0;
  function walk(a) {
    if (++calls > 4000) throw Error('Calculation too complex');
    if (a[0] === 'n') return a[1];
    if (a[0] === 'v') {
      const k = a[1];
      if (Object.prototype.hasOwnProperty.call(vars, k)) return Number(vars[k]);
      const low = k.toLowerCase();
      if (low === 'pi') return Math.PI;
      if (k === 'e') return Math.E;
      if (low === 'tau') return 2 * Math.PI;
      if (low === 'phi') return (1 + Math.sqrt(5)) / 2;
      if (Object.prototype.hasOwnProperty.call(CONSTANTS, k)) return CONSTANTS[k].value;
      throw Error('Unknown variable: ' + k);
    }
    if (a[0] === 'neg') {
      const inner = walk(a[1]);
      const res = -inner;
      if (traceSteps) {
        traceSteps.push({
          op: 'Negation',
          symbolic: formatAstText(a),
          substituted: `−(${fmt(inner)})`,
          value: res
        });
      }
      return res;
    }
    if (a[0] === 'call') {
      const fnName = a[1].toLowerCase();
      const fn = known[fnName];
      if (!fn) throw Error('Unknown function: ' + a[1]);
      const rawArgs = a[2].map(walk);
      const evalArgs = [...rawArgs];
      if (options.degrees && forwardTrigSet.has(fnName)) {
        // Exact quadrant reduction in degrees to eliminate floating-point noise at 90°, 180°, 270°, 360°
        const degMod = ((evalArgs[0] % 360) + 360) % 360;
        if ((fnName === 'tan' || fnName === 'sec') && (Math.abs(degMod - 90) < 1e-12 || Math.abs(degMod - 270) < 1e-12)) {
          throw Error(`${fnName}(${evalArgs[0]}°) is undefined (vertical asymptote at cos θ = 0)`);
        }
        if ((fnName === 'cot' || fnName === 'csc' || fnName === 'cosec') && (Math.abs(degMod) < 1e-12 || Math.abs(degMod - 180) < 1e-12 || Math.abs(degMod - 360) < 1e-12)) {
          throw Error(`${fnName}(${evalArgs[0]}°) is undefined (vertical asymptote at sin θ = 0)`);
        }
        evalArgs[0] = evalArgs[0] * (Math.PI / 180);
      }
      let r = fn(...evalArgs);
      if (options.degrees && inverseTrigSet.has(fnName)) {
        r = r * (180 / Math.PI);
      }
      if (traceSteps) {
        traceSteps.push({
          op: `Function ${fnName}`,
          symbolic: formatAstText(a),
          substituted: `${fnName}(${rawArgs.map(fmt).join(', ')})${options.degrees && (forwardTrigSet.has(fnName) || inverseTrigSet.has(fnName)) ? ' [deg]' : ''}`,
          value: r
        });
      }
      return r;
    }
    if (a[0] === 'op') {
      const x = walk(a[2]), y = walk(a[3]);
      let r;
      switch (a[1]) {
        case '+': r = x + y; break;
        case '-': r = x - y; break;
        case '*': r = x * y; break;
        case '/':
          if (y === 0) throw Error('Division by zero is undefined');
          r = x / y;
          break;
        case '%':
          if (y === 0) throw Error('Modulo division by zero is undefined');
          r = x % y;
          break;
        case '^':
          r = known.pow(x, y);
          break;
        default:
          throw Error('Invalid operator: ' + a[1]);
      }
      if (traceSteps) {
        const opNames = { '+': 'Addition', '-': 'Subtraction', '*': 'Multiplication', '/': 'Division', '%': 'Remainder', '^': 'Exponentiation' };
        traceSteps.push({
          op: opNames[a[1]] || 'Operation',
          symbolic: formatAstText(a),
          substituted: `${fmt(x)} ${a[1] === '*' ? '×' : a[1] === '-' ? '−' : a[1]} ${fmt(y)}`,
          value: r
        });
      }
      return r;
    }
    throw Error('Invalid syntax');
  }

  const v = walk(ast);
  if (!Number.isFinite(v)) throw Error('Result is undefined or outside the supported numeric range');
  return Object.is(v, -0) ? 0 : v;
}

const cache = new Map();
export function calculate(expr, vars = {}, options = {}) {
  if (!cache.has(expr)) {
    if (cache.size > 1200) cache.clear();
    cache.set(expr, compile(expr, options));
  }
  return run(cache.get(expr), vars, options);
}

export function traceCalculate(expr, vars = {}, options = {}) {
  const ast = compile(expr, options);
  const steps = [];
  const value = run(ast, vars, options, steps);
  return {
    expr,
    symbolic: formatAstText(ast),
    symbolicHtml: formatAstHtml(ast),
    substituted: formatAstText(ast, vars),
    steps,
    value
  };
}

export function fmt(v, maxDecimals = 9, _arr = undefined) {
  if (_arr !== undefined || typeof maxDecimals !== "number") maxDecimals = 9;
  if (typeof v === 'string') return v;
  if (!Number.isFinite(v)) return 'Undefined';
  if (Object.is(v, -0) || v === 0) return '0';
  if (Math.abs(v) > 0 && (Math.abs(v) < 1e-6 || Math.abs(v) >= 1e12)) {
    return v.toExponential(7).replace('e+', 'e');
  }
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: maxDecimals }).format(Number(v.toPrecision(12)));
}

export function solveQuadratic(a, b, c) {
  if (!Number.isFinite(a + b + c)) throw Error('Coefficients must be finite numbers');
  if (a === 0) {
    if (b === 0) return c === 0 ? ['All real numbers'] : ['No solution'];
    return [fmt(-c / b)];
  }
  const d = b * b - 4 * a * c;
  if (d >= 0) {
    const sq = Math.sqrt(d);
    if (sq === 0) return [fmt(-b / (2 * a))];
    const q = -(b + (b < 0 ? -sq : sq)) / 2;
    const roots = [q / a, c / q].sort((x, y) => x - y);
    return roots.map(r => fmt(r));
  }
  const re = -b / (2 * a), im = Math.sqrt(-d) / Math.abs(2 * a);
  return [fmt(re) + ' + ' + fmt(im) + 'i', fmt(re) + ' − ' + fmt(im) + 'i'];
}

export function solveRoots(expr, variable = 'x', lo = -40, hi = 40, options = {}) {
  const leftRight = expr.split('=');
  if (leftRight.length > 2) throw Error('Use one equals sign');
  const ast = compile(leftRight.length === 2 ? `(${leftRight[0]})-(${leftRight[1]})` : expr, options);
  const f = x => {
    try { return run(ast, { [variable]: x }, options); } catch { return NaN; }
  };
  const out = [];
  const samples = 4000, step = (hi - lo) / samples;
  let prev = lo, pv = f(prev), prevPrev = lo, ppv = pv;

  const add = x => {
    if (!Number.isFinite(x)) return;
    const fx = f(x);
    if (!Number.isFinite(fx) || Math.abs(fx) > 1e-5) return;
    // Reject false roots across vertical asymptotes by checking continuity around x
    const eps = Math.max(1e-7, Math.abs(x) * 1e-7);
    const fl = f(x - eps), fr = f(x + eps);
    if (!Number.isFinite(fl) || !Number.isFinite(fr) || Math.abs(fr - fl) > 1) return;
    const snapped = Math.abs(x) < 1e-11 ? 0 : Number(x.toPrecision(12));
    if (!out.some(r => Math.abs(r - snapped) < 1e-4)) out.push(snapped);
  };

  for (let i = 1; i <= samples; i++) {
    const x = lo + step * i, v = f(x);
    if (Number.isFinite(v) && Math.abs(v) < 1e-7) add(x);
    // 1. Odd-multiplicity sign-change bisection
    if (Number.isFinite(v) && Number.isFinite(pv) && v * pv < 0) {
      let a = prev, b = x, fa = pv;
      for (let j = 0; j < 65; j++) {
        const mid = (a + b) / 2, fm = f(mid);
        if (!Number.isFinite(fm)) break;
        if (Math.abs(fm) < 1e-13) { a = b = mid; break; }
        if (fa * fm <= 0) b = mid;
        else { a = mid; fa = fm; }
      }
      add((a + b) / 2);
    }
    // 2. Even-multiplicity tangent root detection (local minimum of |f(x)|)
    if (i >= 2 && Number.isFinite(ppv) && Number.isFinite(pv) && Number.isFinite(v)) {
      const a0 = Math.abs(ppv), a1 = Math.abs(pv), a2 = Math.abs(v);
      if (a1 <= a0 && a1 <= a2 && a1 < Math.max(1, step * 10)) {
        // Golden-section search on [prevPrev, x] for minimum of |f(t)|
        let ga = prevPrev, gb = x;
        const gr = (Math.sqrt(5) - 1) / 2;
        let c = gb - gr * (gb - ga), d = ga + gr * (gb - ga);
        for (let iter = 0; iter < 45; iter++) {
          if (Math.abs(f(c)) < Math.abs(f(d))) gb = d;
          else ga = c;
          c = gb - gr * (gb - ga);
          d = ga + gr * (gb - ga);
        }
        add((ga + gb) / 2);
      }
    }
    prevPrev = prev; ppv = pv;
    prev = x; pv = v;
    if (out.length > 120) break;
  }
  return out.sort((a, b) => a - b);
}

export function gaussian(A, B) {
  const n = A.length;
  const q = A.map((r, i) => [...r, ...(B ? B[i] : Array.from({ length: n }, (_, j) => +(i === j)))]);
  let det = 1;
  const steps = [];
  for (let k = 0; k < n; k++) {
    let ix = k;
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(q[i][k]) > Math.abs(q[ix][k])) ix = i;
    }
    if (Math.abs(q[ix][k]) < 1e-12) {
      // Distinguish inconsistent vs dependent linear system when B is provided
      if (B) {
        for (let i = k; i < n; i++) {
          const rowNorm = q[i].slice(0, n).reduce((s, v) => s + Math.abs(v), 0);
          const rhsVal = Math.abs(q[i][n]);
          if (rowNorm < 1e-12 && rhsVal > 1e-9) {
            throw Error('System is inconsistent (no solution exists; parallel hyperplanes)');
          }
        }
        throw Error('Matrix is singular with dependent equations (infinitely many solutions)');
      }
      throw Error('Matrix is singular (determinant = 0); no unique inverse exists');
    }
    if (ix !== k) {
      [q[k], q[ix]] = [q[ix], q[k]];
      det = -det;
      steps.push(`Swap Row ${k + 1} ↔ Row ${ix + 1}`);
    }
    const v = q[k][k];
    det *= v;
    for (let j = k; j < q[k].length; j++) q[k][j] /= v;
    steps.push(`Normalize Row ${k + 1} by pivot ${fmt(v)}`);
    for (let i = 0; i < n; i++) {
      if (i !== k) {
        const c = q[i][k];
        if (Math.abs(c) > 1e-14) {
          for (let j = k; j < q[i].length; j++) q[i][j] -= c * q[k][j];
          steps.push(`R${i + 1} ← R${i + 1} − (${fmt(c)})·R${k + 1}`);
        }
      }
    }
  }
  return { det, answer: q.map(r => r.slice(n)), steps };
}

export function matrixOp(A, B, operation) {
  const n = A.length, m = A[0].length;
  if (operation === 'transpose') return A[0].map((_, j) => A.map(r => r[j]));
  if (operation === 'trace') {
    if (n !== m) throw Error('Trace requires a square matrix');
    return [[A.reduce((s, r, i) => s + r[i], 0)]];
  }
  if (operation === 'determinant') {
    if (n !== m) throw Error('Determinant requires a square matrix');
    const q = A.map(r => r.slice());
    let det = 1;
    for (let j = 0; j < n; j++) {
      let k = j;
      for (let i = j + 1; i < n; i++) if (Math.abs(q[i][j]) > Math.abs(q[k][j])) k = i;
      if (Math.abs(q[k][j]) < 1e-12) return [[0]];
      if (k !== j) { [q[j], q[k]] = [q[k], q[j]]; det = -det; }
      const pivot = q[j][j];
      det *= pivot;
      for (let i = j + 1; i < n; i++) {
        const factor = q[i][j] / pivot;
        for (let z = j; z < n; z++) q[i][z] -= factor * q[j][z];
      }
    }
    return [[det]];
  }
  if (operation === 'inverse') {
    if (n !== m) throw Error('Inverse requires a square matrix');
    return gaussian(A).answer;
  }
  if (operation === 'addition' || operation === 'subtraction') {
    if (A.length !== B.length || A[0].length !== B[0].length) throw Error('Matrix sizes must match');
    return A.map((r, i) => r.map((v, j) => v + (operation === 'addition' ? 1 : -1) * B[i][j]));
  }
  if (operation === 'multiply') {
    if (m !== B.length) throw Error('Matrix A columns must equal Matrix B rows');
    return A.map(r => B[0].map((_, j) => r.reduce((sum, v, k) => sum + v * B[k][j], 0)));
  }
  throw Error('Unknown matrix operation');
}

export function descriptive(arr) {
  const a = [...arr].sort((x, y) => x - y);
  if (!a.length) throw Error('Enter at least one number');
  const n = a.length, sum = a.reduce((s, v) => s + v, 0), mean = sum / n;
  const med = ar => {
    const l = ar.length;
    return l % 2 ? ar[(l - 1) / 2] : (ar[l / 2 - 1] + ar[l / 2]) / 2;
  };
  const v = a.reduce((s, x) => s + (x - mean) ** 2, 0);
  const freq = new Map();
  a.forEach(x => freq.set(x, (freq.get(x) || 0) + 1));
  const max = Math.max(...freq.values());
  const modes = max === 1 ? ['No repeated mode'] : [...freq].filter(x => x[1] === max).map(x => x[0]);
  const lower = a.slice(0, Math.floor(n / 2)), upper = a.slice(Math.ceil(n / 2));
  const q1 = lower.length ? med(lower) : a[0];
  const q3 = upper.length ? med(upper) : a[n - 1];
  return {
    'Count': n,
    'Sum': sum,
    'Mean': mean,
    'Median': med(a),
    'Mode': modes.join(', '),
    'Minimum': a[0],
    'Maximum': a[n - 1],
    'Range': a[n - 1] - a[0],
    'IQR (Interquartile range)': q3 - q1,
    'Population variance': v / n,
    'Sample variance': n > 1 ? v / (n - 1) : 'Requires n ≥ 2',
    'Population std. deviation': Math.sqrt(v / n),
    'Sample std. deviation': n > 1 ? Math.sqrt(v / (n - 1)) : 'Requires n ≥ 2',
    'Q1': q1,
    'Q3': q3
  };
}

function simpsonRaw(ast, a, b, n, options = {}) {
  const h = (b - a) / n;
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const x = a + i * h;
    const y = run(ast, { x }, options);
    if (!Number.isFinite(y) || Math.abs(y) > 1e14) {
      throw Error('Integrand is undefined or singular on the integration interval');
    }
    sum += (i === 0 || i === n ? 1 : i % 2 ? 4 : 2) * y;
  }
  return (sum * h) / 3;
}

export function integrate(ast, a, b, n = 1000, options = {}) {
  if (!Number.isFinite(a + b) || n <= 0 || n % 2) throw Error('Invalid interval or integration steps');
  if (a === b) return 0;
  const sHalf = simpsonRaw(ast, a, b, Math.max(2, Math.floor(n / 2) * 2), options);
  const sFull = simpsonRaw(ast, a, b, n, options);
  // Also probe midpoint near zero if interval straddles 0 to catch 1/x^2 or 1/x poles
  if (a < 0 && b > 0) {
    try {
      const f0 = run(ast, { x: 0 }, options);
      if (!Number.isFinite(f0)) throw Error('Divergent or singular integral at x = 0');
    } catch {
      throw Error('Integrand has a singularity at x = 0 inside the interval');
    }
  }
  if (Math.abs(sFull - sHalf) > 1e-2 * (1 + Math.abs(sFull))) {
    throw Error('Integral failed to converge (possible singularity or discontinuity on interval)');
  }
  return Math.abs(sFull) < 1e-14 ? 0 : sFull;
}

export const unitGroups = {
  Length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, 'µm': 1e-6, nm: 1e-9, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254, 'nautical mi': 1852, AU: 149597870700, 'light-year': 9.4607304725808e15 },
  Mass: { kg: 1, g: 0.001, mg: 1e-6, 'µg': 1e-9, 'metric ton': 1000, lb: 0.45359237, oz: 0.028349523125, st: 6.35029318, 'short ton': 907.18474 },
  Area: { 'm²': 1, 'km²': 1e6, 'cm²': 1e-4, 'mm²': 1e-6, 'ft²': 0.09290304, 'in²': 0.00064516, 'yd²': 0.83612736, acre: 4046.8564224, hectare: 10000 },
  Volume: { L: 1, mL: 0.001, 'm³': 1000, 'cm³': 0.001, 'mm³': 1e-6, 'US gal': 3.785411784, 'US qt': 0.946352946, 'US pt': 0.473176473, 'US cup': 0.2365882365, 'US fl oz': 0.02957352956, 'UK gal': 4.54609, 'ft³': 28.316846592, 'in³': 0.016387064 },
  Speed: { 'm/s': 1, 'km/h': 1 / 3.6, mph: 0.44704, knot: 0.5144444444, 'ft/s': 0.3048, 'cm/s': 0.01 },
  Acceleration: { 'm/s²': 1, 'cm/s²': 0.01, 'ft/s²': 0.3048, 'g₀': 9.80665 },
  Time: { s: 1, ms: 0.001, 'µs': 1e-6, ns: 1e-9, min: 60, h: 3600, day: 86400, week: 604800, year: 31557600 },
  Temperature: { '°C': 1, '°F': 1, K: 1 },
  Pressure: { Pa: 1, kPa: 1000, MPa: 1e6, GPa: 1e9, bar: 1e5, mbar: 100, atm: 101325, psi: 6894.757293178, torr: 133.322368421, mmHg: 133.322387415 },
  Energy: { J: 1, kJ: 1000, MJ: 1e6, mJ: 0.001, cal: 4.184, kcal: 4184, Wh: 3600, kWh: 3.6e6, eV: 1.602176634e-19, keV: 1.602176634e-16, MeV: 1.602176634e-13, BTU: 1055.05585262, 'ft·lbf': 1.35581794833 },
  Power: { W: 1, mW: 0.001, kW: 1000, MW: 1e6, GW: 1e9, hp: 745.69987158, 'BTU/h': 0.29307107 },
  Data: { bit: 1, B: 8, kB: 8000, MB: 8e6, GB: 8e9, TB: 8e12, PB: 8e15, KiB: 8192, MiB: 8388608, GiB: 8589934592, TiB: 8796093022208 },
  DataRate: { bps: 1, Kbps: 1e3, Mbps: 1e6, Gbps: 1e9, 'B/s': 8, 'kB/s': 8e3, 'MB/s': 8e6, 'GB/s': 8e9, 'KiB/s': 8192, 'MiB/s': 8388608 },
  Angle: { rad: 1, '°': Math.PI / 180, grad: Math.PI / 200, turn: Math.PI * 2, arcmin: Math.PI / 10800, arcsec: Math.PI / 648000 },
  Frequency: { Hz: 1, mHz: 0.001, kHz: 1e3, MHz: 1e6, GHz: 1e9, THz: 1e12, rpm: 1 / 60, 'rad/s': 1 / (2 * Math.PI) },
  Force: { N: 1, mN: 0.001, kN: 1000, MN: 1e6, lbf: 4.44822161526, dyne: 1e-5, kgf: 9.80665 },
  Density: { 'kg/m³': 1, 'g/cm³': 1000, 'g/mL': 1000, 'kg/L': 1000, 'lb/ft³': 16.01846337396, 'lb/in³': 27679.90471 },
  Torque: { 'N·m': 1, 'kN·m': 1000, 'N·cm': 0.01, 'lb·ft': 1.35581794833, 'lb·in': 0.112984829, 'kgf·m': 9.80665 },
  Voltage: { V: 1, mV: 1e-3, 'µV': 1e-6, kV: 1e3, MV: 1e6 },
  Current: { A: 1, mA: 1e-3, 'µA': 1e-6, nA: 1e-9, kA: 1e3 },
  Resistance: { 'Ω': 1, 'mΩ': 1e-3, 'kΩ': 1e3, 'MΩ': 1e6, 'GΩ': 1e9 },
  Capacitance: { F: 1, mF: 1e-3, 'µF': 1e-6, nF: 1e-9, pF: 1e-12 },
  Inductance: { H: 1, mH: 1e-3, 'µH': 1e-6, nH: 1e-9 },
  MagneticField: { T: 1, mT: 1e-3, 'µT': 1e-6, nT: 1e-9, G: 1e-4 },
  MagneticFlux: { Wb: 1, mWb: 1e-3, 'µWb': 1e-6, Mx: 1e-8 },
  FlowRate: { 'm³/s': 1, 'L/s': 0.001, 'L/min': 0.001 / 60, 'm³/h': 1 / 3600, 'US gal/min': 0.003785411784 / 60, 'ft³/s': 0.028316846592 },
  Viscosity: { 'Pa·s': 1, 'mPa·s': 0.001, cP: 0.001, P: 0.1, 'lb/(ft·s)': 1.4881639 }
};

export function findUnitGroup(unitStr) {
  if (!unitStr) return null;
  for (const [grp, map] of Object.entries(unitGroups)) {
    if (Object.prototype.hasOwnProperty.call(map, unitStr)) return grp;
  }
  return null;
}

export function convertUnit(group, num, from, to) {
  if (!Number.isFinite(num)) throw Error('Enter a finite number');
  if (from === to) return num;
  if (group === 'Temperature') {
    const c = from === '°C' ? num : from === '°F' ? (num - 32) * (5 / 9) : num - 273.15;
    if (c < -273.15 - 1e-8) throw Error('Temperature cannot be below absolute zero (0 K / −273.15 °C)');
    return to === '°C' ? c : to === '°F' ? (c * 9) / 5 + 32 : c + 273.15;
  }
  const g = unitGroups[group];
  if (!g || !Object.prototype.hasOwnProperty.call(g, from) || !Object.prototype.hasOwnProperty.call(g, to)) {
    throw Error(`Incompatible unit conversion: ${from} → ${to}`);
  }
  return (num * g[from]) / g[to];
}

export function parseFractions(str) {
  const s = String(str).trim();
  // Support mixed numbers like "1 3/4" or "-2 1/2"
  const mixedMatch = /^([-+]?\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(s);
  const gcdBig = (x, y) => { x = x < 0n ? -x : x; y = y < 0n ? -y : y; while (y) { [x, y] = [y, x % y]; } return x; };
  if (mixedMatch) {
    const whole = BigInt(mixedMatch[1]);
    const numPart = BigInt(mixedMatch[2]);
    const denPart = BigInt(mixedMatch[3]);
    if (denPart === 0n) throw Error('Denominator must not be zero');
    const sign = whole < 0n ? -1n : 1n;
    const totalNum = sign * ( (whole < 0n ? -whole : whole) * denPart + numPart );
    const k = gcdBig(totalNum, denPart);
    return [totalNum / k, denPart / k];
  }
  const parts = s.split('/');
  if (parts.length > 2 || parts.some(x => !/^[-+]?\d+$/.test(x.trim()))) {
    throw Error('Enter a valid fraction such as 3/4, −5/8, or mixed number 1 3/4');
  }
  let a = BigInt(parts[0].trim()), b = BigInt((parts[1] || '1').trim());
  if (b === 0n) throw Error('Denominator must not be zero');
  if (b < 0n) { a = -a; b = -b; }
  const k = gcdBig(a, b);
  return [a / k, b / k];
}

export function fractionOp(f1, f2, op) {
  const [a, b] = parseFractions(f1), [c, d] = parseFractions(f2);
  let p, q;
  switch (op) {
    case '+': p = a * d + c * b; q = b * d; break;
    case '-':
    case '−': p = a * d - c * b; q = b * d; break;
    case '×':
    case '*': p = a * c; q = b * d; break;
    case '÷':
    case '/': p = a * d; q = b * c; break;
    default: throw Error('Invalid fraction operation');
  }
  if (!q) throw Error('Division by zero');
  const neg = q < 0n ? -1n : 1n;
  p *= neg; q *= neg;
  const gcdBig = (x, y) => { x = x < 0n ? -x : x; while (y) { [x, y] = [y, x % y]; } return x; };
  const k = gcdBig(p, q);
  const rp = p / k, rq = q / k;
  return `${rp}${rq === 1n ? '' : '/' + rq}`;
}

export function fractionToDecimal(fracStr) {
  const [num, denStr] = String(fracStr).split('/');
  const p = BigInt(num), q = BigInt(denStr || '1');
  if (q === 1n) return Number(p);
  const sign = p < 0n ? -1 : 1;
  const ap = p < 0n ? -p : p;
  const intPart = ap / q;
  const rem = ap % q;
  const fracScaled = Number((rem * 1000000000000n) / q) / 1e12;
  return sign * (Number(intPart) + fracScaled);
}

export function primeFactors(n) {
  if (!Number.isSafeInteger(n) || n > 1e12 || n < 0) throw Error('Enter an integer from 0 to 10¹²');
  if (n < 2) return [];
  const factors = [];
  let rem = n;
  let count = 0;
  while (rem % 2 === 0) { rem /= 2; count++; }
  if (count > 0) factors.push([2, count]);
  for (let k = 3; k * k <= rem; k += 2) {
    count = 0;
    while (rem % k === 0) { rem /= k; count++; }
    if (count > 0) factors.push([k, count]);
  }
  if (rem > 1) factors.push([rem, 1]);
  return factors;
}

export function isPrime(n) {
  if (!Number.isSafeInteger(n) || n > 1e12 || n < 0) throw Error('Enter an integer from 0 to 10¹²');
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let k = 3; k * k <= n; k += 2) if (n % k === 0) return false;
  return true;
}
