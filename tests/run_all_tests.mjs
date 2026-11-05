import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

import {
  CONSTANTS, known, compile, run, calculate, traceCalculate, fmt,
  formatAstText, formatAstHtml, checkAmbiguity, extractVariables,
  solveQuadratic, solveRoots, gaussian, matrixOp, descriptive, integrate,
  unitGroups, findUnitGroup, convertUnit, parseFractions, fractionOp,
  fractionToDecimal, primeFactors, isPrime
} from '../site/assets/engine.js';

import {
  simplifyAst, diffAst, diffSymbolic, numericalDerivative,
  integrateSymbolic, quadratureCompare, doubleIntegral, tripleIntegral,
  improperIntegral, solveOdeIvp, solveOdeBvp, computeFourierSeries,
  computeGradient, computeDivergenceAndCurl
} from '../site/assets/symbolic.js';

import {
  rrefWithPivotInfo, luDecomposition, qrDecomposition, eigenvaluesEigenvectors,
  svdDecomposition, matrixExponential, linearLeastSquares,
  normalPdf, normalCdf, normalInv, studentTCdf, studentTInv,
  chiSquareCdf, chiSquareInv, fDistCdf, poissonDist, oneWayAnova,
  calcNpvIrr, calcXirr, calcBondValuation, calcBlackScholes
} from '../site/assets/linalg_stats_finance.js';

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const catalog = JSON.parse(fs.readFileSync(path.join(rootDir, 'site/assets/catalog.json'), 'utf8'));
const baseline = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/audits/phase0-baseline-results.json'), 'utf8'));

let passed = 0;
let failed = 0;
const suiteStats = {};

function test(suite, name, fn) {
  suiteStats[suite] = suiteStats[suite] || { passed: 0, failed: 0 };
  try {
    fn();
    passed++;
    suiteStats[suite].passed++;
  } catch (err) {
    failed++;
    suiteStats[suite].failed++;
    console.error(`❌ [${suite}] ${name}: ${err.message}`);
  }
}

function approxEqual(actual, expected, relTol = 1e-6, absTol = 1e-9) {
  const diff = Math.abs(actual - expected);
  const scale = Math.max(Math.abs(expected), 1);
  assert.ok(
    diff <= Math.max(absTol, relTol * scale),
    `Expected ${expected}, got ${actual} (diff=${diff})`
  );
}

// ============================================================================
// SUITE 1: PHASE 0 BASELINE REGRESSION & 136 LEGACY SLUG PRESERVATION
// ============================================================================
test('Suite 1: Baseline & Backward Compatibility', 'All 113 original formula calculators match Phase 0 baseline outputs', () => {
  for (const [slug, b] of Object.entries(baseline.formulaBaselines)) {
    const tool = catalog.tools.find(t => t.slug === slug);
    assert.ok(tool, `Missing legacy slug in catalog: ${slug}`);
    const target = tool.canonicalSlug ? catalog.tools.find(t => t.slug === tool.canonicalSlug) : tool;
    if (target.type !== 'formula' && target.type !== 'multimode') {
      assert.ok(['number_theory', 'mean_suite', 'triangle_trig_suite', 'kinematics_suvat'].includes(target.type));
      continue;
    }
    let outputsDef = target.outputs;
    let fieldsDef = target.fields || [];
    if (target.type === 'multimode') {
      const mId = tool.defaultMode || target.defaultMode || target.modes[0].id;
      const mode = target.modes.find(m => m.id === mId);
      assert.ok(mode, `Missing mode ${mId} for ${slug}`);
      outputsDef = mode.outputs;
      fieldsDef = mode.fields || [];
    }
    const env = { ...Object.fromEntries(fieldsDef.map(f => [f.key, Number(f.default)])), ...b.inputs };
    if (b.inputs.angle !== undefined) env.deg = b.inputs.angle;
    if (b.inputs.deg !== undefined) env.angle = b.inputs.deg;
    if (b.inputs.mhz !== undefined) env.f = b.inputs.mhz * 1e6;
    const calcVals = outputsDef.map(o => calculate(o.expr, env));
    for (const [k, expVal] of Object.entries(b.outputs)) {
      const matched = calcVals.some(v => Math.abs(v - expVal) <= 1e-6 * Math.max(1, Math.abs(expVal)));
      assert.ok(matched, `Baseline mismatch on ${slug} (${k}): expected ${expVal}, got [${calcVals.join(', ')}]`);
    }
  }
});

test('Suite 1: Baseline & Backward Compatibility', 'All 300 tool routes have generated static HTML files on disk', () => {
  assert.equal(catalog.tools.length, 300);
  const canonicalCount = catalog.tools.filter(t => !t.isAlias).length;
  const aliasCount = catalog.tools.filter(t => t.isAlias).length;
  assert.equal(canonicalCount, 231);
  assert.equal(aliasCount, 69);
  for (const t of catalog.tools) {
    const htmlPath = path.join(rootDir, 'site/tools', t.slug, 'index.html');
    assert.ok(fs.existsSync(htmlPath), `Missing HTML file for /tools/${t.slug}/`);
  }
});

// ============================================================================
// SUITE 2: PARSER, PRECEDENCE, IMPLICIT MULTIPLICATION & TRIG DISAMBIGUATION
// ============================================================================
test('Suite 2: Mathematical Parser & Disambiguation', 'Unary minus vs exponentiation precedence (-2^2 = -4, (-2)^2 = 4, 2^3^2 = 512)', () => {
  assert.equal(calculate('-2^2'), -4);
  assert.equal(calculate('(-2)^2'), 4);
  assert.equal(calculate('2^3^2'), 512);
});

test('Suite 2: Mathematical Parser & Disambiguation', 'Implicit multiplication x(x+1), (x+1)(x-1), 2sin(pi/6), 3pi', () => {
  assert.equal(calculate('x(x+1)', { x: 3 }), 12);
  assert.equal(calculate('(x+1)(x-1)', { x: 4 }), 15);
  approxEqual(calculate('2sin(pi/6)'), 1);
  approxEqual(calculate('3pi'), 3 * Math.PI);
});

test('Suite 2: Mathematical Parser & Disambiguation', 'Unicode radical and absolute value notation √9, ∛8, |-12.5|', () => {
  assert.equal(calculate('√9 + ∛8'), 5);
  assert.equal(calculate('|-12.5|'), 12.5);
});

test('Suite 2: Mathematical Parser & Disambiguation', 'Trigonometric notation disambiguation (asin, sin⁻¹, csc, sin², sin(x²), and ambiguous sin^-1)', () => {
  approxEqual(calculate('asin(0.5)'), Math.PI / 6);
  approxEqual(calculate('sin⁻¹(0.5)'), Math.PI / 6);
  approxEqual(calculate('csc(pi/6)'), 2);
  approxEqual(calculate('1/sin(pi/6)'), 2);
  approxEqual(calculate('sin²(pi/6)'), 0.25);
  approxEqual(calculate('sin(pi/6)^2'), 0.25);
  approxEqual(calculate('sin((pi/6)^2)'), Math.sin((Math.PI / 6) ** 2));

  const amb = checkAmbiguity('sin^-1(0.5)');
  assert.equal(amb.ambiguous, true);
  assert.equal(amb.inverseOption, 'asin(0.5)');
  assert.equal(amb.reciprocalOption, 'csc(0.5)');
  assert.throws(() => calculate('sin^-1(0.5)'), /Inverse sin|Reciprocal/);
});

test('Suite 2: Mathematical Parser & Disambiguation', 'Scale-aware precision preserves small physical values (gravitational force 6.6743e-15 N) while clamping sin(pi) noise', () => {
  const fg = calculate('6.6743e-11 * m1 * m2 / r^2', { m1: 1, m2: 1, r: 100 });
  approxEqual(fg, 6.6743e-15, 1e-9, 1e-22);
  assert.equal(calculate('sin(pi)'), 0);
});

test('Suite 2: Mathematical Parser & Disambiguation', 'Even-multiplicity root finding ((x - 2.003)^2 = 0) and mixed fractions (1 3/4 + 2/5)', () => {
  const roots = solveRoots('(x - 2.003)^2 = 0', 'x', -10, 10);
  assert.ok(roots.some(r => Math.abs(r - 2.003) < 1e-3), `Expected root near 2.003, got ${roots}`);
  assert.equal(fractionOp('1 3/4', '2/5', '+'), '43/20');
});

// ============================================================================
// SUITE 3: SYMBOLIC & NUMERICAL CALCULUS BENCHMARKS
// ============================================================================
test('Suite 3: Symbolic & Numerical Calculus', 'Symbolic differentiation, higher-order derivatives, and non-differentiable corner detection', () => {
  const d1 = diffSymbolic('x^3 - 4*x + 2', 'x', 1);
  assert.equal(run(d1.ast, { x: 2 }), 8);
  const d4 = diffSymbolic('sin(x)', 'x', 4);
  approxEqual(run(d4.ast, { x: 1.2 }), Math.sin(1.2));
  assert.throws(() => numericalDerivative(compile('abs(x)'), 'x', 0, 1), /not differentiable/);
});

test('Suite 3: Symbolic & Numerical Calculus', 'Definite, Double, Triple, and Improper Integrals (convergent & divergent)', () => {
  const q = quadratureCompare('x^2 + sin(x)', 'x', 0, Math.PI, 60);
  approxEqual(q.gaussLegendre, (Math.PI ** 3) / 3 + 2, 1e-6);
  const dbl = doubleIntegral('x*y + x^2', 'x', 'y', 0, 2, '0', 'x');
  approxEqual(dbl, 6, 1e-5);
  const trp = tripleIntegral('x + y + z', 'x', 'y', 'z', 0, 1, 0, 2, 0, 3);
  approxEqual(trp, 18, 1e-5);
  const impConv = improperIntegral('1/(1 + x^2)', 'x', '0', 'inf');
  assert.equal(impConv.convergent, true);
  approxEqual(impConv.value, Math.PI / 2, 1e-3);
  const impDiv = improperIntegral('1/x', 'x', '1', 'inf');
  assert.equal(impDiv.convergent, false);
});

test('Suite 3: Symbolic & Numerical Calculus', 'ODE Initial Value Problem (RK4), Boundary Value Problem (Thomas), Fourier Series, and Vector Calculus', () => {
  const ivp = solveOdeIvp('y', 0, 1, 1, 20, 'rk4');
  approxEqual(ivp.finalY, Math.E, 1e-5);
  const bvp = solveOdeBvp('0', '-1', '0', 0, 1, 1, Math.E, 40);
  approxEqual(bvp.midpointY, Math.exp(0.5), 1e-3);
  const fs = computeFourierSeries('x', 2 * Math.PI, 5, 1);
  approxEqual(fs.a0, 0, 1e-7, 1e-7);
  approxEqual(fs.coeffs[0].bn, 2, 1e-3);
  const grad = computeGradient('x^2*y + z^3', 2, 3, 1);
  assert.equal(grad.fx, 12);
  assert.equal(grad.fy, 4);
  assert.equal(grad.fz, 3);
  const vc = computeDivergenceAndCurl('-y', 'x', 'z^2', 1, 2, 3);
  assert.equal(vc.divValue, 6);
  assert.deepEqual(vc.curlValue, [0, 0, 2]);
});

// ============================================================================
// SUITE 4: LINEAR ALGEBRA, STATISTICS & QUANTITATIVE FINANCE BENCHMARKS
// ============================================================================
test('Suite 4: Linear Algebra, Statistics & Finance', 'LU, QR, Eigenvalues, SVD, Matrix Exponential, and Least Squares', () => {
  const A = [[4, 1], [2, 3]];
  const eig = eigenvaluesEigenvectors(A);
  approxEqual(eig.eigenvalues[0], 5, 1e-6);
  approxEqual(eig.eigenvalues[1], 2, 1e-6);
  const lu = luDecomposition([[2, 1, 1], [4, -6, 0], [-2, 7, 2]]);
  approxEqual(lu.det, -16, 1e-6);
  assert.ok(lu.residual < 1e-10);
  const qr = qrDecomposition([[12, -51, 4], [6, 167, -68], [-4, 24, -41]]);
  assert.ok(qr.residual < 1e-9);
  const svd = svdDecomposition([[3, 2, 2], [2, 3, -2]]);
  approxEqual(svd.singularValues[0], 5, 1e-5);
  approxEqual(svd.singularValues[1], 3, 1e-5);
  const expM = matrixExponential([[0, -Math.PI], [Math.PI, 0]]);
  approxEqual(expM.expA[0][0], -1, 1e-4);
  approxEqual(expM.expA[1][1], -1, 1e-4);
  const ols = linearLeastSquares([[1, 1], [1, 2], [1, 3], [1, 4]], [3, 5, 7, 9]);
  approxEqual(ols.xHat[0], 1, 1e-6);
  approxEqual(ols.xHat[1], 2, 1e-6);
  approxEqual(ols.rSquared, 1, 1e-9);
});

test('Suite 4: Linear Algebra, Statistics & Finance', 'Normal, Student-t, Chi-Square, F, Poisson, and One-Way ANOVA distributions', () => {
  approxEqual(normalCdf(1.959963984540054), 0.975, 1e-6);
  approxEqual(normalInv(0.975), 1.959963984540054, 1e-5);
  approxEqual(studentTCdf(2.22813885, 10), 0.975, 1e-5);
  approxEqual(chiSquareCdf(9.487729, 4), 0.95, 1e-5);
  const pois = poissonDist(4, 2);
  approxEqual(pois.pmf, (Math.exp(-4) * 16) / 2, 1e-6);
  const anova = oneWayAnova([[23, 25, 21, 24, 22], [30, 28, 31, 29, 32], [19, 20, 18, 21, 17]]);
  approxEqual(anova.fStat, 62, 1e-4);
  assert.ok(anova.pVal < 1e-6);
});

test('Suite 4: Linear Algebra, Statistics & Finance', 'NPV/IRR, XIRR, Bond Duration/Convexity, and Black-Scholes Option Pricing & Greeks', () => {
  const npvRes = calcNpvIrr(10, [-1000, 300, 400, 500, 600]);
  approxEqual(npvRes.npv, 388.77125879, 1e-6);
  approxEqual(npvRes.irr, 24.8883, 1e-3);
  const bond = calcBondValuation(1000, 5, 5, 10, 2);
  approxEqual(bond.price, 1000, 1e-6);
  const bs = calcBlackScholes(100, 100, 1, 5, 20, 0);
  approxEqual(bs.callPrice, 10.45058357, 1e-5);
  approxEqual(bs.putPrice, 5.57352602, 1e-5);
  approxEqual(bs.callDelta - bs.putDelta, 1, 1e-6);
});

// ============================================================================
// SUITE 5: SINGLE-PIPELINE EXPLAIN CALCULATION CONSISTENCY ACROSS ALL 795 EXPRESSIONS
// ============================================================================
test('Suite 5: Explain Calculation Single-Pipeline Audit', 'All 795 formula & multimode expressions produce identical trace.value and calculate() output with non-empty steps', () => {
  let exprCount = 0;
  for (const t of catalog.tools) {
    if (t.type === 'formula') {
      const env = Object.fromEntries(t.fields.map(f => [f.key, Number(f.default)]));
      for (const o of t.outputs) {
        const direct = calculate(o.expr, env);
        const tr = traceCalculate(o.expr, env);
        approxEqual(tr.value, direct, 1e-12, 1e-12);
        assert.ok(tr.symbolic.length > 0);
        assert.ok(tr.substituted.length > 0);
        exprCount++;
      }
    } else if (t.type === 'multimode') {
      for (const m of t.modes) {
        const env = Object.fromEntries(m.fields.map(f => [f.key, Number(f.default)]));
        for (const o of m.outputs) {
          const direct = calculate(o.expr, env);
          const tr = traceCalculate(o.expr, env);
          approxEqual(tr.value, direct, 1e-12, 1e-12);
          assert.ok(tr.symbolic.length > 0);
          assert.ok(tr.substituted.length > 0);
          exprCount++;
        }
      }
    }
  }
  assert.equal(exprCount, 795);
});

// ============================================================================
// SUITE 6: STATIC SITE HTML, SEO, CANONICALS, LEGACY CATEGORY URLS & NO-ADSENSE AUDIT
// ============================================================================
test('Suite 6: Static Site & SEO Integrity', 'Homepage, 8 primary categories, 14 legacy categories, and 404 page pass SEO and structure checks', () => {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'site/index.html'), 'utf8');
  assert.ok(!indexHtml.includes('adsbygoogle'), 'AdSense script must be removed');
  assert.ok(!indexHtml.includes('"url": null'), 'JSON-LD url must not be null');
  assert.ok(indexHtml.includes('https://axiomatlas.netlify.app/'), 'Canonical URL must be present');

  const html404 = fs.readFileSync(path.join(rootDir, 'site/404.html'), 'utf8');
  assert.ok(html404.includes('noindex,follow'), '404.html must use noindex,follow');

  for (const c of catalog.categories) {
    const cSlug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const p = path.join(rootDir, 'site/categories', cSlug, 'index.html');
    assert.ok(fs.existsSync(p), `Missing primary category page: ${cSlug}`);
  }
  for (const [oldSlug, newPath] of Object.entries(catalog.legacyCategoryRedirects)) {
    const p = path.join(rootDir, 'site/categories', oldSlug, 'index.html');
    assert.ok(fs.existsSync(p), `Missing legacy category compatibility page: ${oldSlug}`);
    const txt = fs.readFileSync(p, 'utf8');
    assert.ok(txt.includes(newPath), `Legacy category ${oldSlug} must link/canonicalize to ${newPath}`);
  }
});

console.log('\n============================================================');
console.log('AXIOMATLAS 2.0 AUTOMATED TEST SUITE SUMMARY');
console.log('============================================================');
for (const [s, st] of Object.entries(suiteStats)) {
  console.log(`  ${st.failed === 0 ? '✅' : '❌'} ${s}: ${st.passed} passed, ${st.failed} failed`);
}
console.log('------------------------------------------------------------');
console.log(`TOTAL: ${passed} passed, ${failed} failed`);
console.log('============================================================\n');
if (failed > 0) process.exit(1);
