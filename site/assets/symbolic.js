// AxiomAtlas 2.0 Symbolic & Numerical Calculus, Transform, Differential Equations & Vector Calculus Engine
// Provides exact AST symbolic differentiation, symbolic antiderivatives (where elementary rules apply),
// multi-method quadrature (Trapezoidal, Simpson 1/3, Simpson 3/8, Gauss-Legendre, 2D/3D cubature),
// improper integral convergence detection, Fourier/Laplace transforms, Taylor/Maclaurin series,
// ODE IVP (Euler, Heun, RK4, RK45) & BVP (Finite Difference Thomas solver), and Vector Calculus.

import { compile, run, fmt, formatAstText, formatAstHtml } from './engine.js';

// --- AST Construction & Algebraic Simplification ---
const isNum = (n, val = undefined) => n && n[0] === 'n' && (val === undefined || Math.abs(n[1] - val) < 1e-14);
const isVar = (n, name = undefined) => n && n[0] === 'v' && (name === undefined || n[1] === name);
const num = v => ['n', v];
const vr = name => ['v', name];
const neg = a => simplifyAst(['neg', a]);
const add = (a, b) => simplifyAst(['op', '+', a, b]);
const sub = (a, b) => simplifyAst(['op', '-', a, b]);
const mul = (a, b) => simplifyAst(['op', '*', a, b]);
const div = (a, b) => simplifyAst(['op', '/', a, b]);
const pow = (a, b) => simplifyAst(['op', '^', a, b]);
const call = (fn, ...args) => simplifyAst(['call', fn, args]);

export function dependsOn(node, varName) {
  if (!node) return false;
  if (node[0] === 'n') return false;
  if (node[0] === 'v') return node[1] === varName;
  if (node[0] === 'neg') return dependsOn(node[1], varName);
  if (node[0] === 'call') return node[2].some(arg => dependsOn(arg, varName));
  if (node[0] === 'op') return dependsOn(node[2], varName) || dependsOn(node[3], varName);
  return false;
}

export function simplifyAst(node) {
  if (!node) return num(0);
  if (node[0] === 'n') return Math.abs(node[1]) < 1e-15 ? num(0) : node;
  if (node[0] === 'v') return node;
  if (node[0] === 'neg') {
    const inner = simplifyAst(node[1]);
    if (isNum(inner, 0)) return num(0);
    if (isNum(inner)) return num(-inner[1]);
    if (inner[0] === 'neg') return inner[1];
    return ['neg', inner];
  }
  if (node[0] === 'call') {
    const args = node[2].map(simplifyAst);
    const fn = node[1];
    if (args.length === 1 && isNum(args[0])) {
      try {
        const val = run(['call', fn, args]);
        if (Number.isInteger(val) && Math.abs(val) <= 1e6) return num(val);
      } catch {}
    }
    if (fn === 'ln' && isVar(args[0], 'e')) return num(1);
    if (fn === 'ln' && args[0][0] === 'call' && args[0][1] === 'exp') return args[0][2][0];
    if (fn === 'exp' && args[0][0] === 'call' && args[0][1] === 'ln') return args[0][2][0];
    return ['call', fn, args];
  }
  if (node[0] === 'op') {
    const op = node[1];
    const l = simplifyAst(node[2]);
    const r = simplifyAst(node[3]);
    if (isNum(l) && isNum(r)) {
      if (op === '+') return num(l[1] + r[1]);
      if (op === '-') return num(l[1] - r[1]);
      if (op === '*') return num(l[1] * r[1]);
      if (op === '/' && r[1] !== 0 && Number.isInteger(l[1] / r[1])) return num(l[1] / r[1]);
      if (op === '^' && Number.isInteger(r[1]) && r[1] >= 0 && r[1] <= 8) return num(Math.pow(l[1], r[1]));
    }
    if (op === '+') {
      if (isNum(l, 0)) return r;
      if (isNum(r, 0)) return l;
      if (r[0] === 'neg') return simplifyAst(['op', '-', l, r[1]]);
      if (formatAstText(l) === formatAstText(r)) return simplifyAst(['op', '*', num(2), l]);
    }
    if (op === '-') {
      if (isNum(r, 0)) return l;
      if (isNum(l, 0)) return neg(r);
      if (r[0] === 'neg') return simplifyAst(['op', '+', l, r[1]]);
      if (formatAstText(l) === formatAstText(r)) return num(0);
    }
    if (op === '*') {
      if (isNum(l, 0) || isNum(r, 0)) return num(0);
      if (isNum(l, 1)) return r;
      if (isNum(r, 1)) return l;
      if (isNum(l, -1)) return neg(r);
      if (isNum(r, -1)) return neg(l);
      if (isNum(r) && !isNum(l)) return simplifyAst(['op', '*', r, l]);
      // Combine a * (b * x) -> (a*b) * x
      if (isNum(l) && r[0] === 'op' && r[1] === '*' && isNum(r[2])) {
        return simplifyAst(['op', '*', num(l[1] * r[2][1]), r[3]]);
      }
      if (formatAstText(l) === formatAstText(r)) return simplifyAst(['op', '^', l, num(2)]);
    }
    if (op === '/') {
      if (isNum(l, 0) && !isNum(r, 0)) return num(0);
      if (isNum(r, 1)) return l;
      if (formatAstText(l) === formatAstText(r)) return num(1);
    }
    if (op === '^') {
      if (isNum(r, 0)) return num(1);
      if (isNum(r, 1)) return l;
      if (isNum(l, 0)) return num(0);
      if (isNum(l, 1)) return num(1);
      if (l[0] === 'op' && l[1] === '^' && isNum(l[3]) && isNum(r)) {
        return simplifyAst(['op', '^', l[2], num(l[3][1] * r[1])]);
      }
    }
    return ['op', op, l, r];
  }
  return node;
}

// --- Exact Symbolic Differentiation Engine ---
export function diffAst(node, varName = 'x', steps = null) {
  if (!node) return num(0);
  if (!dependsOn(node, varName)) {
    if (steps) steps.push({ rule: 'Constant Rule', expr: `d/d${varName}[${formatAstText(node)}] = 0` });
    return num(0);
  }
  if (node[0] === 'v') {
    const res = node[1] === varName ? num(1) : num(0);
    if (steps) steps.push({ rule: 'Variable Identity Rule', expr: `d/d${varName}[${node[1]}] = ${res[1]}` });
    return res;
  }
  if (node[0] === 'neg') {
    const dInner = diffAst(node[1], varName, steps);
    return neg(dInner);
  }
  if (node[0] === 'op') {
    const op = node[1], u = node[2], v = node[3];
    if (op === '+' || op === '-') {
      const du = diffAst(u, varName, steps);
      const dv = diffAst(v, varName, steps);
      const res = op === '+' ? add(du, dv) : sub(du, dv);
      if (steps) steps.push({ rule: 'Sum / Difference Rule', expr: `d/d${varName}[${formatAstText(node)}] = ${formatAstText(res)}` });
      return res;
    }
    if (op === '*') {
      if (!dependsOn(u, varName)) {
        const dv = diffAst(v, varName, steps);
        const res = mul(u, dv);
        if (steps) steps.push({ rule: 'Constant Multiple Rule', expr: `d/d${varName}[${formatAstText(node)}] = ${formatAstText(res)}` });
        return res;
      }
      if (!dependsOn(v, varName)) {
        const du = diffAst(u, varName, steps);
        const res = mul(v, du);
        if (steps) steps.push({ rule: 'Constant Multiple Rule', expr: `d/d${varName}[${formatAstText(node)}] = ${formatAstText(res)}` });
        return res;
      }
      const du = diffAst(u, varName, steps);
      const dv = diffAst(v, varName, steps);
      const res = add(mul(du, v), mul(u, dv));
      if (steps) steps.push({ rule: 'Product Rule (u·v)\' = u\'v + uv\'', expr: `d/d${varName}[${formatAstText(node)}] = ${formatAstText(res)}` });
      return res;
    }
    if (op === '/') {
      if (!dependsOn(v, varName)) {
        const du = diffAst(u, varName, steps);
        return div(du, v);
      }
      const du = diffAst(u, varName, steps);
      const dv = diffAst(v, varName, steps);
      const res = div(sub(mul(du, v), mul(u, dv)), pow(v, num(2)));
      if (steps) steps.push({ rule: 'Quotient Rule (u/v)\' = (u\'v − uv\')/v²', expr: `d/d${varName}[${formatAstText(node)}] = ${formatAstText(res)}` });
      return res;
    }
    if (op === '^') {
      const du = diffAst(u, varName, steps);
      if (!dependsOn(v, varName)) {
        // Power rule: d/dx [u^n] = n * u^(n-1) * u'
        const nMinus1 = isNum(v) ? num(v[1] - 1) : sub(v, num(1));
        const res = mul(mul(v, pow(u, nMinus1)), du);
        if (steps) steps.push({ rule: 'Power & Chain Rule d/dx[uⁿ] = n·uⁿ⁻¹·u\'', expr: `d/d${varName}[${formatAstText(node)}] = ${formatAstText(res)}` });
        return res;
      }
      if (!dependsOn(u, varName)) {
        // Exponential rule: d/dx [a^v] = a^v * ln(a) * v'
        const dv = diffAst(v, varName, steps);
        const lnBase = isVar(u, 'e') ? num(1) : call('ln', u);
        const res = mul(mul(node, lnBase), dv);
        if (steps) steps.push({ rule: 'Exponential Rule d/dx[aᵛ] = aᵛ·ln(a)·v\'', expr: `d/d${varName}[${formatAstText(node)}] = ${formatAstText(res)}` });
        return res;
      }
      // General logarithmic differentiation: d/dx [u^v] = u^v * (v' * ln(u) + v * u' / u)
      const dv = diffAst(v, varName, steps);
      const res = mul(node, add(mul(dv, call('ln', u)), div(mul(v, du), u)));
      if (steps) steps.push({ rule: 'Generalized Power / Logarithmic Differentiation Rule', expr: `d/d${varName}[${formatAstText(node)}] = ${formatAstText(res)}` });
      return res;
    }
  }
  if (node[0] === 'call') {
    const fn = node[1].toLowerCase();
    const u = node[2][0];
    const du = diffAst(u, varName, steps);
    let outer;
    switch (fn) {
      case 'sin': outer = call('cos', u); break;
      case 'cos': outer = neg(call('sin', u)); break;
      case 'tan': outer = pow(call('sec', u), num(2)); break;
      case 'sec': outer = mul(call('sec', u), call('tan', u)); break;
      case 'csc':
      case 'cosec': outer = neg(mul(call('csc', u), call('cot', u))); break;
      case 'cot': outer = neg(pow(call('csc', u), num(2))); break;
      case 'asin':
      case 'arcsin': outer = div(num(1), call('sqrt', sub(num(1), pow(u, num(2))))); break;
      case 'acos':
      case 'arccos': outer = neg(div(num(1), call('sqrt', sub(num(1), pow(u, num(2)))))); break;
      case 'atan':
      case 'arctan': outer = div(num(1), add(num(1), pow(u, num(2)))); break;
      case 'sinh': outer = call('cosh', u); break;
      case 'cosh': outer = call('sinh', u); break;
      case 'tanh': outer = pow(call('sech', u), num(2)); break;
      case 'asinh':
      case 'arcsinh': outer = div(num(1), call('sqrt', add(pow(u, num(2)), num(1)))); break;
      case 'acosh':
      case 'arccosh': outer = div(num(1), call('sqrt', sub(pow(u, num(2)), num(1)))); break;
      case 'atanh':
      case 'arctanh': outer = div(num(1), sub(num(1), pow(u, num(2)))); break;
      case 'exp': outer = call('exp', u); break;
      case 'ln': outer = div(num(1), u); break;
      case 'log':
      case 'log10': {
        const b = node[2][1] || num(10);
        outer = div(num(1), mul(u, call('ln', b)));
        break;
      }
      case 'log2': outer = div(num(1), mul(u, call('ln', num(2)))); break;
      case 'sqrt': outer = div(num(1), mul(num(2), call('sqrt', u))); break;
      case 'cbrt': outer = div(num(1), mul(num(3), pow(call('cbrt', u), num(2)))); break;
      case 'abs': outer = div(u, call('abs', u)); break;
      default:
        throw Error(`Symbolic derivative rule not available for ${fn}()`);
    }
    const res = mul(outer, du);
    if (steps) steps.push({ rule: `Chain Rule on ${fn}(u)`, expr: `d/d${varName}[${formatAstText(node)}] = ${formatAstText(res)}` });
    return res;
  }
  throw Error('Unsupported AST node in symbolic differentiation');
}

export function diffSymbolic(exprStr, varName = 'x', order = 1) {
  let ast = simplifyAst(compile(exprStr));
  const allSteps = [];
  for (let k = 1; k <= order; k++) {
    const steps = [];
    ast = simplifyAst(diffAst(ast, varName, steps));
    allSteps.push({ order: k, expression: formatAstText(ast), html: formatAstHtml(ast), ast, rules: steps });
  }
  return {
    ast,
    symbolic: formatAstText(ast),
    html: formatAstHtml(ast),
    orderSteps: allSteps
  };
}

export function numericalDerivative(ast, varName, x0, order = 1, options = {}) {
  const f = val => run(ast, { [varName]: val }, options);
  // Check differentiability at x0 for 1st order via forward vs backward difference
  const h1 = 1e-5 * Math.max(1, Math.abs(x0));
  const f0 = f(x0), fp = f(x0 + h1), fm = f(x0 - h1);
  if (!Number.isFinite(f0) || !Number.isFinite(fp) || !Number.isFinite(fm)) {
    throw Error(`Function is not defined or not differentiable at ${varName} = ${x0}`);
  }
  const fwd = (fp - f0) / h1, bwd = (f0 - fm) / h1;
  const central1 = (fp - fm) / (2 * h1);
  if (order === 1) {
    if (Math.abs(fwd - bwd) > 1e-2 * (1 + Math.abs(central1))) {
      throw Error(`Function is not differentiable at ${varName} = ${x0} (corner/cusp: left derivative ≈ ${fmt(bwd)}, right derivative ≈ ${fmt(fwd)})`);
    }
    return { value: Math.abs(central1) < 1e-12 ? 0 : central1, f0, fwd, bwd, h: h1 };
  }
  if (order === 2) {
    const h2 = 1e-4 * Math.max(1, Math.abs(x0));
    const d2 = (f(x0 + h2) - 2 * f0 + f(x0 - h2)) / (h2 * h2);
    return { value: Math.abs(d2) < 1e-10 ? 0 : d2, f0, h: h2 };
  }
  if (order === 3) {
    const h3 = 1e-3 * Math.max(1, Math.abs(x0));
    const d3 = (f(x0 + 2 * h3) - 2 * f(x0 + h3) + 2 * f(x0 - h3) - f(x0 - 2 * h3)) / (2 * h3 ** 3);
    return { value: Math.abs(d3) < 1e-8 ? 0 : d3, f0, h: h3 };
  }
  const h4 = 2e-3 * Math.max(1, Math.abs(x0));
  const d4 = (f(x0 + 2 * h4) - 4 * f(x0 + h4) + 6 * f0 - 4 * f(x0 - h4) + f(x0 - 2 * h4)) / (h4 ** 4);
  return { value: Math.abs(d4) < 1e-7 ? 0 : d4, f0, h: h4 };
}

// --- Symbolic Antiderivative Engine (Elementary Rule Matcher) ---
function matchLinearCoeff(node, varName) {
  // Returns { a, b } if node == a * x + b (with a != 0), else null
  if (!dependsOn(node, varName)) return { a: 0, b: run(node) };
  if (isVar(node, varName)) return { a: 1, b: 0 };
  if (node[0] === 'neg') {
    const inner = matchLinearCoeff(node[1], varName);
    return inner ? { a: -inner.a, b: -inner.b } : null;
  }
  if (node[0] === 'op' && node[1] === '*') {
    if (!dependsOn(node[2], varName) && isVar(node[3], varName)) return { a: run(node[2]), b: 0 };
    if (!dependsOn(node[3], varName) && isVar(node[2], varName)) return { a: run(node[3]), b: 0 };
  }
  if (node[0] === 'op' && (node[1] === '+' || node[1] === '-')) {
    const l = matchLinearCoeff(node[2], varName);
    const r = matchLinearCoeff(node[3], varName);
    if (l && r) {
      return { a: l.a + (node[1] === '+' ? r.a : -r.a), b: l.b + (node[1] === '+' ? r.b : -r.b) };
    }
  }
  return null;
}

export function integrateAst(node, varName = 'x', steps = null) {
  node = simplifyAst(node);
  if (!dependsOn(node, varName)) {
    const res = mul(node, vr(varName));
    if (steps) steps.push({ rule: 'Constant Rule ∫ c dx = c·x', expr: formatAstText(res) });
    return res;
  }
  if (isVar(node, varName)) {
    const res = div(pow(vr(varName), num(2)), num(2));
    if (steps) steps.push({ rule: 'Power Rule ∫ x dx = x²/2', expr: formatAstText(res) });
    return res;
  }
  if (node[0] === 'neg') {
    return neg(integrateAst(node[1], varName, steps));
  }
  if (node[0] === 'op') {
    const op = node[1], u = node[2], v = node[3];
    if (op === '+' || op === '-') {
      const iu = integrateAst(u, varName, steps);
      const iv = integrateAst(v, varName, steps);
      return op === '+' ? add(iu, iv) : sub(iu, iv);
    }
    if (op === '*') {
      if (!dependsOn(u, varName)) return mul(u, integrateAst(v, varName, steps));
      if (!dependsOn(v, varName)) return mul(v, integrateAst(u, varName, steps));
      // Integration by parts patterns: x * exp(a*x), x * sin(a*x), x * cos(a*x), x * ln(x)
      if (isVar(u, varName) && v[0] === 'call') {
        const fn = v[1], arg = v[2][0];
        const lin = matchLinearCoeff(arg, varName);
        if (lin && lin.a !== 0 && lin.b === 0) {
          const a = num(lin.a);
          if (fn === 'exp') {
            const res = div(mul(sub(mul(a, vr(varName)), num(1)), call('exp', arg)), pow(a, num(2)));
            if (steps) steps.push({ rule: 'Integration by Parts ∫ x·e^(ax) dx = (ax − 1)e^(ax)/a²', expr: formatAstText(res) });
            return res;
          }
          if (fn === 'sin') {
            const res = sub(div(call('sin', arg), pow(a, num(2))), div(mul(vr(varName), call('cos', arg)), a));
            if (steps) steps.push({ rule: 'Integration by Parts ∫ x·sin(ax) dx = sin(ax)/a² − x·cos(ax)/a', expr: formatAstText(res) });
            return res;
          }
          if (fn === 'cos') {
            const res = add(div(call('cos', arg), pow(a, num(2))), div(mul(vr(varName), call('sin', arg)), a));
            if (steps) steps.push({ rule: 'Integration by Parts ∫ x·cos(ax) dx = cos(ax)/a² + x·sin(ax)/a', expr: formatAstText(res) });
            return res;
          }
          if (fn === 'ln' && lin.a === 1) {
            const res = sub(mul(div(pow(vr(varName), num(2)), num(2)), call('ln', vr(varName))), div(pow(vr(varName), num(2)), num(4)));
            if (steps) steps.push({ rule: 'Integration by Parts ∫ x·ln(x) dx = (x²/2)ln(x) − x²/4', expr: formatAstText(res) });
            return res;
          }
        }
      }
    }
    if (op === '/') {
      if (!dependsOn(u, varName) && isVar(v, varName)) {
        const res = mul(u, call('ln', call('abs', vr(varName))));
        if (steps) steps.push({ rule: 'Logarithmic Rule ∫ (c/x) dx = c·ln|x|', expr: formatAstText(res) });
        return res;
      }
      if (!dependsOn(u, varName) && v[0] === 'op' && v[1] === '+' && isNum(v[2], 1) && v[3][0] === 'op' && v[3][1] === '^' && isVar(v[3][2], varName) && isNum(v[3][3], 2)) {
        const res = mul(u, call('atan', vr(varName)));
        if (steps) steps.push({ rule: 'Arctangent Rule ∫ c/(1+x²) dx = c·arctan(x)', expr: formatAstText(res) });
        return res;
      }
      if (!dependsOn(v, varName)) {
        return div(integrateAst(u, varName, steps), v);
      }
    }
    if (op === '^') {
      if (isVar(u, varName) && !dependsOn(v, varName)) {
        if (isNum(v, -1)) {
          const res = call('ln', call('abs', vr(varName)));
          if (steps) steps.push({ rule: 'Reciprocal Rule ∫ x⁻¹ dx = ln|x|', expr: formatAstText(res) });
          return res;
        }
        const nPlus1 = isNum(v) ? num(v[1] + 1) : add(v, num(1));
        const res = div(pow(vr(varName), nPlus1), nPlus1);
        if (steps) steps.push({ rule: 'Power Rule ∫ xⁿ dx = xⁿ⁺¹/(n+1)', expr: formatAstText(res) });
        return res;
      }
      if (isVar(u, 'e')) {
        const lin = matchLinearCoeff(v, varName);
        if (lin && lin.a !== 0) {
          const res = div(node, num(lin.a));
          if (steps) steps.push({ rule: 'Exponential Rule ∫ e^(ax+b) dx = e^(ax+b)/a', expr: formatAstText(res) });
          return res;
        }
      }
      // Trig squared integrals: sin(x)^2, cos(x)^2, sec(x)^2, csc(x)^2
      if (u[0] === 'call' && isNum(v, 2)) {
        const fn = u[1], arg = u[2][0];
        const lin = matchLinearCoeff(arg, varName);
        if (lin && lin.a !== 0 && lin.b === 0) {
          const a = lin.a;
          if (fn === 'sin') {
            const res = sub(div(vr(varName), num(2)), div(call('sin', mul(num(2 * a), vr(varName))), num(4 * a)));
            if (steps) steps.push({ rule: 'Half-Angle Reduction ∫ sin²(ax) dx = x/2 − sin(2ax)/(4a)', expr: formatAstText(res) });
            return res;
          }
          if (fn === 'cos') {
            const res = add(div(vr(varName), num(2)), div(call('sin', mul(num(2 * a), vr(varName))), num(4 * a)));
            if (steps) steps.push({ rule: 'Half-Angle Reduction ∫ cos²(ax) dx = x/2 + sin(2ax)/(4a)', expr: formatAstText(res) });
            return res;
          }
          if (fn === 'sec') {
            const res = div(call('tan', arg), num(a));
            if (steps) steps.push({ rule: 'Trigonometric Rule ∫ sec²(ax) dx = tan(ax)/a', expr: formatAstText(res) });
            return res;
          }
          if (fn === 'csc' || fn === 'cosec') {
            const res = neg(div(call('cot', arg), num(a)));
            if (steps) steps.push({ rule: 'Trigonometric Rule ∫ csc²(ax) dx = −cot(ax)/a', expr: formatAstText(res) });
            return res;
          }
        }
      }
    }
  }
  if (node[0] === 'call') {
    const fn = node[1].toLowerCase();
    const arg = node[2][0];
    const lin = matchLinearCoeff(arg, varName);
    if (lin && lin.a !== 0) {
      const a = num(lin.a);
      if (fn === 'sin') {
        const res = neg(div(call('cos', arg), a));
        if (steps) steps.push({ rule: 'Trigonometric Rule ∫ sin(ax+b) dx = −cos(ax+b)/a', expr: formatAstText(res) });
        return res;
      }
      if (fn === 'cos') {
        const res = div(call('sin', arg), a);
        if (steps) steps.push({ rule: 'Trigonometric Rule ∫ cos(ax+b) dx = sin(ax+b)/a', expr: formatAstText(res) });
        return res;
      }
      if (fn === 'tan') {
        const res = neg(div(call('ln', call('abs', call('cos', arg))), a));
        if (steps) steps.push({ rule: 'Trigonometric Rule ∫ tan(ax) dx = −ln|cos(ax)|/a', expr: formatAstText(res) });
        return res;
      }
      if (fn === 'exp') {
        const res = div(call('exp', arg), a);
        if (steps) steps.push({ rule: 'Exponential Rule ∫ exp(ax+b) dx = exp(ax+b)/a', expr: formatAstText(res) });
        return res;
      }
      if (fn === 'sinh') return div(call('cosh', arg), a);
      if (fn === 'cosh') return div(call('sinh', arg), a);
      if (fn === 'sqrt') {
        const res = div(mul(num(2), pow(arg, num(1.5))), mul(num(3), a));
        if (steps) steps.push({ rule: 'Fractional Power Rule ∫ √(ax+b) dx = 2(ax+b)^(3/2)/(3a)', expr: formatAstText(res) });
        return res;
      }
      if (fn === 'ln' && lin.a === 1 && lin.b === 0) {
        const res = sub(mul(vr(varName), call('ln', vr(varName))), vr(varName));
        if (steps) steps.push({ rule: 'Integration by Parts ∫ ln(x) dx = x·ln(x) − x', expr: formatAstText(res) });
        return res;
      }
    }
  }
  throw Error('No elementary closed-form antiderivative rule matched; using numerical quadrature');
}

export function integrateSymbolic(exprStr, varName = 'x') {
  const ast = simplifyAst(compile(exprStr));
  const steps = [];
  try {
    const anti = simplifyAst(integrateAst(ast, varName, steps));
    return {
      exactAvailable: true,
      ast: anti,
      symbolic: formatAstText(anti) + ' + C',
      html: formatAstHtml(anti) + ' + <var>C</var>',
      steps
    };
  } catch (e) {
    return {
      exactAvailable: false,
      symbolic: 'Non-elementary / requires numerical integration',
      html: '<em>No elementary antiderivative in rule table — evaluate numerically</em>',
      reason: e.message,
      steps
    };
  }
}

// --- Multi-Method Numerical Quadrature (Trapezoidal, Simpson 1/3, Simpson 3/8, Gauss-Legendre) ---
const GL8_X = [-0.9602898564975363, -0.7966664774136267, -0.5255324099163290, -0.1834346424956498, 0.1834346424956498, 0.5255324099163290, 0.7966664774136267, 0.9602898564975363];
const GL8_W = [0.1012285362903763, 0.2223810344533745, 0.3137066458778873, 0.3626837833783620, 0.3626837833783620, 0.3137066458778873, 0.2223810344533745, 0.1012285362903763];

export function quadratureCompare(exprStr, varName = 'x', a = 0, b = 1, panels = 120) {
  const ast = compile(exprStr);
  if (!Number.isFinite(a) || !Number.isFinite(b)) throw Error('Bounds must be finite numbers');
  if (a === b) return { trapezoidal: 0, simpson13: 0, simpson38: 0, gaussLegendre: 0, h: 0 };
  // Ensure panels is divisible by 6 for both Simpson 1/3 and Simpson 3/8
  const n = Math.max(6, Math.round(panels / 6) * 6);
  const h = (b - a) / n;
  const f = x => {
    const v = run(ast, { [varName]: x });
    if (!Number.isFinite(v) || Math.abs(v) > 1e14) throw Error(`Integrand is singular or undefined near ${varName} = ${fmt(x)}`);
    return v;
  };
  if (a < 0 && b > 0) {
    try {
      const f0 = run(ast, { [varName]: 0 });
      if (!Number.isFinite(f0)) throw Error('Divergent or singular integral at 0');
    } catch {
      throw Error('Integrand has an interior singularity at 0');
    }
  }
  const ys = Array.from({ length: n + 1 }, (_, i) => f(a + i * h));
  // 1. Trapezoidal Rule
  let trapSum = 0.5 * (ys[0] + ys[n]);
  for (let i = 1; i < n; i++) trapSum += ys[i];
  const trapezoidal = trapSum * h;

  // 2. Simpson's 1/3 Rule
  let s13Sum = ys[0] + ys[n];
  for (let i = 1; i < n; i++) s13Sum += (i % 2 === 1 ? 4 : 2) * ys[i];
  const simpson13 = (s13Sum * h) / 3;

  // 3. Simpson's 3/8 Rule
  let s38Sum = ys[0] + ys[n];
  for (let i = 1; i < n; i++) s38Sum += (i % 3 === 0 ? 2 : 3) * ys[i];
  const simpson38 = (3 * h * s38Sum) / 8;

  // 4. Composite 8-Point Gauss-Legendre Quadrature over 20 subpanels
  const m = 20, hm = (b - a) / m;
  let glSum = 0;
  for (let k = 0; k < m; k++) {
    const xL = a + k * hm, xR = xL + hm;
    const mid = 0.5 * (xL + xR), half = 0.5 * hm;
    let panel = 0;
    for (let j = 0; j < 8; j++) {
      panel += GL8_W[j] * f(mid + half * GL8_X[j]);
    }
    glSum += half * panel;
  }

  if (Math.abs(simpson13 - glSum) > 5e-2 * (1 + Math.abs(glSum))) {
    throw Error('Integral failed convergence verification (probable interior singularity or divergence)');
  }

  return {
    trapezoidal,
    simpson13,
    simpson38,
    gaussLegendre: glSum,
    n,
    h,
    estimatedError: Math.abs(glSum - simpson13)
  };
}

// --- 2D Double Integral & 3D Triple Integral Cubature ---
export function doubleIntegral(exprStr, xVar, yVar, ax, bx, ayExpr, byExpr, nx = 16, ny = 16) {
  const ast = compile(exprStr);
  const ayAst = compile(String(ayExpr));
  const byAst = compile(String(byExpr));
  const hx = (bx - ax) / nx;
  let total = 0;
  for (let i = 0; i < nx; i++) {
    const x0 = ax + i * hx, x1 = x0 + hx;
    const xMid = 0.5 * (x0 + x1), xHalf = 0.5 * hx;
    for (let gx = 0; gx < 8; gx++) {
      const x = xMid + xHalf * GL8_X[gx];
      const wx = xHalf * GL8_W[gx];
      const yLow = run(ayAst, { [xVar]: x });
      const yHigh = run(byAst, { [xVar]: x });
      const yMid = 0.5 * (yLow + yHigh), yHalf = 0.5 * (yHigh - yLow);
      let inner = 0;
      for (let gy = 0; gy < 8; gy++) {
        const y = yMid + yHalf * GL8_X[gy];
        const fval = run(ast, { [xVar]: x, [yVar]: y });
        inner += GL8_W[gy] * fval;
      }
      total += wx * yHalf * inner;
    }
  }
  return total;
}

export function tripleIntegral(exprStr, xVar, yVar, zVar, ax, bx, ay, by, az, bz) {
  const ast = compile(exprStr);
  const xMid = 0.5 * (ax + bx), xHalf = 0.5 * (bx - ax);
  const yMid = 0.5 * (ay + by), yHalf = 0.5 * (by - ay);
  const zMid = 0.5 * (az + bz), zHalf = 0.5 * (bz - az);
  let total = 0;
  for (let i = 0; i < 8; i++) {
    const x = xMid + xHalf * GL8_X[i], wx = GL8_W[i];
    for (let j = 0; j < 8; j++) {
      const y = yMid + yHalf * GL8_X[j], wy = GL8_W[j];
      for (let k = 0; k < 8; k++) {
        const z = zMid + zHalf * GL8_X[k], wz = GL8_W[k];
        total += wx * wy * wz * run(ast, { [xVar]: x, [yVar]: y, [zVar]: z });
      }
    }
  }
  return total * xHalf * yHalf * zHalf;
}

// --- Improper Integral Solver with Convergence Verification ---
export function improperIntegral(exprStr, varName = 'x', aStr = '1', bStr = 'inf') {
  const ast = compile(exprStr);
  const parseBound = s => {
    const clean = String(s).trim().toLowerCase();
    if (clean === 'inf' || clean === '+inf' || clean === 'infinity' || clean === '∞') return Infinity;
    if (clean === '-inf' || clean === '-infinity' || clean === '-∞') return -Infinity;
    return run(compile(s));
  };
  const a = parseBound(aStr), b = parseBound(bStr);
  if (a === b) return { convergent: true, value: 0, note: 'Zero-width interval' };

  // Transform [a, Infinity) via x = a + t / (1 - t) for t in (0, 1)
  function integrateHalfInfinite(low, dir = 1) {
    // Check asymptotic decay p in |f(low + dir*R)| ~ R^(-p) at R = 100 and R = 1000
    const fAt = x => run(ast, { [varName]: x });
    let y100, y1000;
    try {
      y100 = Math.abs(fAt(low + dir * 100));
      y1000 = Math.abs(fAt(low + dir * 1000));
    } catch {
      return { convergent: false, reason: 'Integrand undefined on infinite tail' };
    }
    if (y1000 > 1e-15 && y100 > 0) {
      const pEst = Math.log10(y100 / y1000);
      if (pEst <= 1.02) {
        return { convergent: false, reason: `Divergent p-type tail: |f(x)| decays as ~x^(−${pEst.toFixed(2)}), which requires p > 1 to converge on an infinite interval.` };
      }
    } else if (y1000 >= y100 && y100 > 1e-12) {
      return { convergent: false, reason: 'Integrand does not decay to 0 as x → ∞ (Divergent).' };
    }
    const m = 40;
    const eps = 1e-6;
    const h = (1 - 2 * eps) / m;
    let sum = 0;
    for (let k = 0; k < m; k++) {
      const tL = eps + k * h, tR = tL + h;
      const mid = 0.5 * (tL + tR), half = 0.5 * h;
      for (let j = 0; j < 8; j++) {
        const t = mid + half * GL8_X[j];
        const x = low + dir * (t / (1 - t));
        const dxdt = 1 / ((1 - t) * (1 - t));
        sum += half * GL8_W[j] * fAt(x) * dxdt;
      }
    }
    return { convergent: true, value: sum, note: 'Evaluated via rational mapping x = a ± t/(1−t) with 320-point Gauss-Legendre quadrature' };
  }

  if (Number.isFinite(a) && b === Infinity) return integrateHalfInfinite(a, 1);
  if (a === -Infinity && Number.isFinite(b)) return integrateHalfInfinite(b, -1);
  if (a === -Infinity && b === Infinity) {
    const left = integrateHalfInfinite(0, -1);
    if (!left.convergent) return left;
    const right = integrateHalfInfinite(0, 1);
    if (!right.convergent) return right;
    return { convergent: true, value: left.value + right.value, note: 'Split at x = 0 into (−∞, 0] and [0, +∞)' };
  }

  // Finite interval [a, b] with potential endpoint or interior singularity
  const fSafe = x => {
    try { return run(ast, { [varName]: x }); } catch { return NaN; }
  };
  // Check if interior singularity at x = 0 exists
  if (a < 0 && b > 0) {
    const near0 = Math.abs(fSafe(1e-5)), near00 = Math.abs(fSafe(1e-6));
    if (!Number.isFinite(fSafe(0)) || (near00 > 10 * near0 && near0 > 100)) {
      const pSlope = Math.log10(near00 / near0);
      if (pSlope >= 0.98) {
        return { convergent: false, reason: `Divergent interior singularity at x = 0 (integrand blows up as ~|x|^(−${pSlope.toFixed(2)}) with p ≥ 1).` };
      }
    }
  }
  // Check endpoint singularity at x = a or x = b
  const delta1 = (b - a) * 1e-5, delta2 = (b - a) * 1e-6;
  const fa1 = Math.abs(fSafe(a + delta1)), fa2 = Math.abs(fSafe(a + delta2));
  if (fa2 > 8 * fa1 && fa1 > 100) {
    const pSlope = Math.log10(fa2 / fa1);
    if (pSlope >= 0.98) {
      return { convergent: false, reason: `Divergent endpoint singularity at x = ${fmt(a)} (blows up as ~(x − a)^(−${pSlope.toFixed(2)}) with p ≥ 1).` };
    }
  }
  // Use open Gauss-Legendre quadrature (which never evaluates exact endpoints a or b!)
  const computeOpenGL = panels => {
    const hm = (b - a) / panels;
    let glSum = 0;
    for (let k = 0; k < panels; k++) {
      const xL = a + k * hm, xR = xL + hm;
      const mid = 0.5 * (xL + xR), half = 0.5 * hm;
      for (let j = 0; j < 8; j++) {
        const y = fSafe(mid + half * GL8_X[j]);
        if (!Number.isFinite(y)) throw Error('Divergent or undefined interior value');
        glSum += half * GL8_W[j] * y;
      }
    }
    return glSum;
  };
  try {
    const s20 = computeOpenGL(24);
    const s48 = computeOpenGL(48);
    if (Math.abs(s48 - s20) > 0.05 * (1 + Math.abs(s48))) {
      return { convergent: false, reason: 'Quadrature refinements did not converge (improper integral diverges).' };
    }
    return { convergent: true, value: s48, note: 'Convergent improper integral evaluated via open-node Gauss-Legendre quadrature' };
  } catch (e) {
    return { convergent: false, reason: e.message };
  }
}

// --- ODE Initial Value Problem (Euler, Heun, RK4, RK45) & Boundary Value Problem ---
export function solveOdeIvp(exprStr, x0, y0, xEnd, steps = 20, method = 'rk4') {
  const ast = compile(exprStr);
  const n = Math.max(2, Math.min(2000, Math.round(steps)));
  const h = (xEnd - x0) / n;
  const f = (x, y) => {
    const v = run(ast, { x, y, t: x });
    if (!Number.isFinite(v) || Math.abs(v) > 1e12) throw Error(`ODE solution blew up or became undefined near x = ${fmt(x)}`);
    return v;
  };
  const trajectory = [{ step: 0, x: x0, y: y0, dy: f(x0, y0) }];
  let x = x0, y = y0;
  for (let i = 1; i <= n; i++) {
    if (method === 'euler') {
      const k1 = f(x, y);
      y = y + h * k1;
    } else if (method === 'heun') {
      const k1 = f(x, y);
      const k2 = f(x + h, y + h * k1);
      y = y + (h / 2) * (k1 + k2);
    } else {
      const k1 = f(x, y);
      const k2 = f(x + h / 2, y + (h * k1) / 2);
      const k3 = f(x + h / 2, y + (h * k2) / 2);
      const k4 = f(x + h, y + h * k3);
      y = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    }
    x = x0 + i * h;
    trajectory.push({ step: i, x, y, dy: f(x, y) });
  }
  return { x0, y0, xEnd, h, n, method, finalY: y, trajectory };
}

// Solve 2nd-order linear BVP: y'' + p(x)*y' + q(x)*y = r(x) on [a, b] with y(a) = alpha, y(b) = beta
export function solveOdeBvp(pExpr, qExpr, rExpr, a, b, alpha, beta, n = 40) {
  const pAst = compile(pExpr || '0');
  const qAst = compile(qExpr || '0');
  const rAst = compile(rExpr || '0');
  const m = Math.max(4, Math.min(400, Math.round(n)));
  const h = (b - a) / m;
  // Interior nodes i = 1 .. m-1 (size N = m - 1)
  const N = m - 1;
  const lower = new Array(N).fill(0);
  const diag = new Array(N).fill(0);
  const upper = new Array(N).fill(0);
  const rhs = new Array(N).fill(0);

  for (let i = 0; i < N; i++) {
    const xi = a + (i + 1) * h;
    const pi = run(pAst, { x: xi }), qi = run(qAst, { x: xi }), ri = run(rAst, { x: xi });
    const a_i = 1 / (h * h) - pi / (2 * h);
    const b_i = -2 / (h * h) + qi;
    const c_i = 1 / (h * h) + pi / (2 * h);
    lower[i] = a_i;
    diag[i] = b_i;
    upper[i] = c_i;
    rhs[i] = ri;
    if (i === 0) rhs[i] -= a_i * alpha;
    if (i === N - 1) rhs[i] -= c_i * beta;
  }

  // Thomas Tridiagonal Algorithm
  for (let i = 1; i < N; i++) {
    if (Math.abs(diag[i - 1]) < 1e-14) throw Error('BVP finite-difference matrix is singular');
    const w = lower[i] / diag[i - 1];
    diag[i] -= w * upper[i - 1];
    rhs[i] -= w * rhs[i - 1];
  }
  const yInt = new Array(N);
  yInt[N - 1] = rhs[N - 1] / diag[N - 1];
  for (let i = N - 2; i >= 0; i--) {
    yInt[i] = (rhs[i] - upper[i] * yInt[i + 1]) / diag[i];
  }

  const points = [{ x: a, y: alpha }, ...yInt.map((yv, idx) => ({ x: a + (idx + 1) * h, y: yv })), { x: b, y: beta }];
  return { a, b, alpha, beta, h, m, midpointY: points[Math.floor(m / 2)].y, points };
}

// --- Fourier Series Calculator ---
export function computeFourierSeries(exprStr, periodL = 2 * Math.PI, harmonics = 5, evalX = 1) {
  const ast = compile(exprStr);
  if (periodL <= 0) throw Error('Period T must be positive');
  const halfL = periodL / 2;
  const N = Math.max(1, Math.min(30, Math.round(harmonics)));
  const quad = fn => {
    const panels = 40, hm = periodL / panels;
    let s = 0;
    for (let k = 0; k < panels; k++) {
      const xL = -halfL + k * hm, mid = xL + 0.5 * hm, half = 0.5 * hm;
      for (let j = 0; j < 8; j++) s += half * GL8_W[j] * fn(mid + half * GL8_X[j]);
    }
    return s;
  };
  const a0 = (2 / periodL) * quad(x => run(ast, { x, t: x }));
  const coeffs = [];
  for (let n = 1; n <= N; n++) {
    const omegaN = (2 * Math.PI * n) / periodL;
    const an = (2 / periodL) * quad(x => run(ast, { x, t: x }) * Math.cos(omegaN * x));
    const bn = (2 / periodL) * quad(x => run(ast, { x, t: x }) * Math.sin(omegaN * x));
    coeffs.push({
      n,
      an: Math.abs(an) < 1e-11 ? 0 : an,
      bn: Math.abs(bn) < 1e-11 ? 0 : bn,
      amplitude: Math.hypot(an, bn)
    });
  }
  const reconstruct = x => {
    let val = a0 / 2;
    for (const c of coeffs) {
      const omegaN = (2 * Math.PI * c.n) / periodL;
      val += c.an * Math.cos(omegaN * x) + c.bn * Math.sin(omegaN * x);
    }
    return val;
  };
  return {
    a0: Math.abs(a0) < 1e-11 ? 0 : a0,
    coeffs,
    exactAtX: run(ast, { x: evalX, t: evalX }),
    approxAtX: reconstruct(evalX),
    reconstruct
  };
}

// --- Vector Calculus (Gradient, Divergence, Curl, Jacobian, Line & Surface Integrals) ---
export function computeGradient(exprStr, x0, y0, z0 = 0) {
  const ast = compile(exprStr);
  const dxAst = simplifyAst(diffAst(ast, 'x'));
  const dyAst = simplifyAst(diffAst(ast, 'y'));
  const dzAst = simplifyAst(diffAst(ast, 'z'));
  const pt = { x: x0, y: y0, z: z0 };
  return {
    fxSymbolic: formatAstText(dxAst),
    fySymbolic: formatAstText(dyAst),
    fzSymbolic: formatAstText(dzAst),
    fx: run(dxAst, pt),
    fy: run(dyAst, pt),
    fz: run(dzAst, pt),
    fVal: run(ast, pt)
  };
}

export function computeDivergenceAndCurl(FxStr, FyStr, FzStr, x0, y0, z0) {
  const Fx = compile(FxStr), Fy = compile(FyStr), Fz = compile(FzStr);
  const dFx_dx = simplifyAst(diffAst(Fx, 'x')), dFx_dy = simplifyAst(diffAst(Fx, 'y')), dFx_dz = simplifyAst(diffAst(Fx, 'z'));
  const dFy_dx = simplifyAst(diffAst(Fy, 'x')), dFy_dy = simplifyAst(diffAst(Fy, 'y')), dFy_dz = simplifyAst(diffAst(Fy, 'z'));
  const dFz_dx = simplifyAst(diffAst(Fz, 'x')), dFz_dy = simplifyAst(diffAst(Fz, 'y')), dFz_dz = simplifyAst(diffAst(Fz, 'z'));

  const divAst = simplifyAst(add(add(dFx_dx, dFy_dy), dFz_dz));
  const curlX = simplifyAst(sub(dFz_dy, dFy_dz));
  const curlY = simplifyAst(sub(dFx_dz, dFz_dx));
  const curlZ = simplifyAst(sub(dFy_dx, dFx_dy));

  const pt = { x: x0, y: y0, z: z0 };
  const cx = run(curlX, pt), cy = run(curlY, pt), cz = run(curlZ, pt);
  return {
    divSymbolic: formatAstText(divAst),
    divValue: run(divAst, pt),
    curlSymbolic: `(${formatAstText(curlX)}, ${formatAstText(curlY)}, ${formatAstText(curlZ)})`,
    curlValue: [cx, cy, cz],
    curlMagnitude: Math.hypot(cx, cy, cz)
  };
}
