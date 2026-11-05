// AxiomAtlas 2.0 Advanced Linear Algebra, Statistics & Probability Distributions, Finance, and Computing Engine
import { fmt, erf, lgamma, gamma, gaussian, matrixOp } from './engine.js';

// ============================================================================
// 1. ADVANCED LINEAR ALGEBRA ENGINE (Eigenvalues, LU, QR, SVD, Rank, exp(A), OLS)
// ============================================================================

export function rrefWithPivotInfo(A) {
  const m = A.length, n = A[0].length;
  const R = A.map(row => row.map(v => Number(v)));
  const pivotCols = [];
  const steps = [];
  let lead = 0;
  for (let r = 0; r < m; r++) {
    if (lead >= n) break;
    let i = r;
    while (Math.abs(R[i][lead]) < 1e-11) {
      i++;
      if (i === m) {
        i = r;
        lead++;
        if (lead === n) return { rref: R, pivotCols, rank: pivotCols.length, nullity: n - pivotCols.length, steps };
      }
    }
    if (i !== r) {
      [R[i], R[r]] = [R[r], R[i]];
      steps.push(`Swap R${i + 1} ↔ R${r + 1}`);
    }
    const lv = R[r][lead];
    for (let j = 0; j < n; j++) R[r][j] /= lv;
    steps.push(`Scale R${r + 1} by 1/(${fmt(lv)})`);
    for (let k = 0; k < m; k++) {
      if (k !== r) {
        const factor = R[k][lead];
        if (Math.abs(factor) > 1e-12) {
          for (let j = 0; j < n; j++) R[k][j] -= factor * R[r][j];
          steps.push(`R${k + 1} ← R${k + 1} − (${fmt(factor)})·R${r + 1}`);
        }
      }
    }
    pivotCols.push(lead);
    lead++;
  }
  // Snap tiny noise
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (Math.abs(R[i][j]) < 1e-13) R[i][j] = 0;
    }
  }
  return { rref: R, pivotCols, rank: pivotCols.length, nullity: n - pivotCols.length, steps };
}

export function luDecomposition(A) {
  const n = A.length;
  if (n !== A[0].length) throw Error('LU decomposition requires a square matrix');
  const U = A.map(r => r.slice());
  const L = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? 1 : 0)));
  const P = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? 1 : 0)));
  const steps = [];
  let swaps = 0;

  for (let k = 0; k < n; k++) {
    let maxRow = k;
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(U[i][k]) > Math.abs(U[maxRow][k])) maxRow = i;
    }
    if (maxRow !== k) {
      [U[k], U[maxRow]] = [U[maxRow], U[k]];
      [P[k], P[maxRow]] = [P[maxRow], P[k]];
      for (let j = 0; j < k; j++) {
        [L[k][j], L[maxRow][j]] = [L[maxRow][j], L[k][j]];
      }
      swaps++;
      steps.push(`Pivot swap: Row ${k + 1} ↔ Row ${maxRow + 1}`);
    }
    if (Math.abs(U[k][k]) < 1e-13) continue;
    for (let i = k + 1; i < n; i++) {
      const factor = U[i][k] / U[k][k];
      L[i][k] = factor;
      for (let j = k; j < n; j++) U[i][j] -= factor * U[k][j];
      steps.push(`L[${i + 1},${k + 1}] = ${fmt(factor)}; U[${i + 1}] ← U[${i + 1}] − ${fmt(factor)}·U[${k + 1}]`);
    }
  }
  const det = (swaps % 2 ? -1 : 1) * U.reduce((p, r, i) => p * r[i], 1);
  // Compute residual ||PA - LU||_F
  const PA = matrixOp(P, A, 'multiply');
  const LU = matrixOp(L, U, 'multiply');
  let resNorm = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) resNorm += (PA[i][j] - LU[i][j]) ** 2;
  return { L, U, P, det, residual: Math.sqrt(resNorm), steps };
}

export function qrDecomposition(A) {
  const m = A.length, n = A[0].length;
  if (m < n) throw Error('QR decomposition requires rows m ≥ columns n');
  // Modified Gram-Schmidt for numerical stability
  const V = Array.from({ length: n }, (_, j) => Array.from({ length: m }, (__, i) => A[i][j]));
  const Qcols = Array.from({ length: n }, () => new Array(m).fill(0));
  const R = Array.from({ length: n }, () => new Array(n).fill(0));
  const steps = [];

  for (let i = 0; i < n; i++) {
    const norm = Math.hypot(...V[i]);
    if (norm < 1e-12) throw Error('Matrix columns are linearly dependent (rank deficient)');
    R[i][i] = norm;
    Qcols[i] = V[i].map(x => x / norm);
    steps.push(`r_${i + 1},${i + 1} = ||v_${i + 1}|| = ${fmt(norm)}; normalize q_${i + 1}`);
    for (let j = i + 1; j < n; j++) {
      let dot = 0;
      for (let k = 0; k < m; k++) dot += Qcols[i][k] * V[j][k];
      R[i][j] = dot;
      for (let k = 0; k < m; k++) V[j][k] -= dot * Qcols[i][k];
    }
  }
  const Q = Array.from({ length: m }, (_, r) => Array.from({ length: n }, (__, c) => Qcols[c][r]));
  const QR = matrixOp(Q, R, 'multiply');
  let resNorm = 0;
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) resNorm += (A[i][j] - QR[i][j]) ** 2;
  return { Q, R, residual: Math.sqrt(resNorm), steps };
}

export function eigenvaluesEigenvectors(A) {
  const n = A.length;
  if (n !== A[0].length) throw Error('Eigenvalues require a square matrix');
  const tr = A.reduce((s, r, i) => s + r[i], 0);
  const det = matrixOp(A, null, 'determinant')[0][0];

  if (n === 2) {
    // Exact 2x2 analytical eigenvalues & eigenvectors: λ² - tr(A)λ + det(A) = 0
    const disc = tr * tr - 4 * det;
    const charPoly = `λ² ${tr >= 0 ? '−' : '+'} ${fmt(Math.abs(tr))}λ ${det >= 0 ? '+' : '−'} ${fmt(Math.abs(det))} = 0`;
    if (disc < -1e-12) {
      const re = tr / 2, im = Math.sqrt(-disc) / 2;
      return {
        charPoly,
        trace: tr,
        det,
        eigenvalues: [`${fmt(re)} + ${fmt(im)}i`, `${fmt(re)} − ${fmt(im)}i`],
        eigenvectors: ['Complex conjugate eigenpair', 'Complex conjugate eigenpair'],
        residual: 0
      };
    }
    const sq = Math.sqrt(Math.max(0, disc));
    const l1 = (tr + sq) / 2, l2 = (tr - sq) / 2;
    const getVec2 = lam => {
      const a = A[0][0] - lam, b = A[0][1], c = A[1][0], d = A[1][1] - lam;
      let vx, vy;
      if (Math.abs(a) + Math.abs(b) >= Math.abs(c) + Math.abs(d)) {
        if (Math.abs(a) < 1e-12 && Math.abs(b) < 1e-12) return [1, 0];
        vx = -b; vy = a;
      } else {
        vx = -d; vy = c;
      }
      const norm = Math.hypot(vx, vy) || 1;
      return [vx / norm, vy / norm];
    };
    const v1 = getVec2(l1);
    const v2 = Math.abs(l1 - l2) < 1e-11 && Math.abs(A[0][1]) < 1e-12 && Math.abs(A[1][0]) < 1e-12 ? [0, 1] : getVec2(l2);
    return {
      charPoly,
      trace: tr,
      det,
      eigenvalues: [l1, l2],
      eigenvectors: [`[${v1.map(fmt).join(', ')}]`, `[${v2.map(fmt).join(', ')}]`],
      residual: Math.hypot(A[0][0] * v1[0] + A[0][1] * v1[1] - l1 * v1[0], A[1][0] * v1[0] + A[1][1] * v1[1] - l1 * v1[1])
    };
  }

  // For n >= 3: QR iteration with Wilkinson shifts for eigenvalues + inverse/nullspace eigenvector extraction
  let Ak = A.map(r => r.slice());
  for (let iter = 0; iter < 140; iter++) {
    const mu = Ak[n - 1][n - 1];
    const shifted = Ak.map((r, i) => r.map((v, j) => (i === j ? v - mu : v)));
    try {
      const { Q, R } = qrDecomposition(shifted);
      const RQ = matrixOp(R, Q, 'multiply');
      Ak = RQ.map((r, i) => r.map((v, j) => (i === j ? v + mu : v)));
    } catch {
      const { Q, R } = qrDecomposition(Ak.map((r, i) => r.map((v, j) => (i === j ? v + 1e-7 : v))));
      Ak = matrixOp(R, Q, 'multiply');
    }
  }
  const rawEigs = [];
  let idx = 0;
  while (idx < n) {
    if (idx < n - 1 && Math.abs(Ak[idx + 1][idx]) > 1e-4) {
      const a11 = Ak[idx][idx], a12 = Ak[idx][idx + 1], a21 = Ak[idx + 1][idx], a22 = Ak[idx + 1][idx + 1];
      const tr2 = a11 + a22, det2 = a11 * a22 - a12 * a21, disc2 = tr2 * tr2 - 4 * det2;
      if (disc2 < 0) {
        const re = tr2 / 2, im = Math.sqrt(-disc2) / 2;
        rawEigs.push(`${fmt(re)} + ${fmt(im)}i`, `${fmt(re)} − ${fmt(im)}i`);
        idx += 2;
        continue;
      }
    }
    rawEigs.push(Math.abs(Ak[idx][idx]) < 1e-11 ? 0 : Ak[idx][idx]);
    idx++;
  }
  const eigs = rawEigs.every(x => typeof x === 'number') ? rawEigs.sort((a, b) => b - a) : rawEigs;
  const vecs = eigs.map(lam => {
    // Solve (A - (lam + 1e-9)I) v = [1, 1, ..., 1]^T (1-step shifted inverse iteration)
    if (typeof lam !== 'number') return '[Complex conjugate eigenvector]';
    const M = A.map((r, i) => r.map((v, j) => (i === j ? v - lam - 1e-8 : v)));
    const b = Array.from({ length: n }, (_, i) => [1 + 0.1 * i]);
    try {
      let v = gaussian(M, b).answer.map(x => x[0]);
      const norm = Math.hypot(...v) || 1;
      v = v.map(x => (Math.abs(x / norm) < 1e-10 ? 0 : x / norm));
      return `[${v.map(fmt).join(', ')}]`;
    } catch {
      return '[Basis vector in null(A − λI)]';
    }
  });
  return {
    charPoly: `deg(${n}) characteristic polynomial, tr(A) = ${fmt(tr)}, det(A) = ${fmt(det)}`,
    trace: tr,
    det,
    eigenvalues: eigs,
    eigenvectors: vecs,
    residual: 0
  };
}

export function svdDecomposition(A) {
  // Compute A^T A symmetric eigendecomposition via Jacobi rotations
  const m = A.length, n = A[0].length;
  const AT = matrixOp(A, null, 'transpose');
  const ATA = matrixOp(AT, A, 'multiply');
  const V = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? 1 : 0)));
  const D = ATA.map(r => r.slice());

  for (let sweep = 0; sweep < 50; sweep++) {
    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(D[p][q]) < 1e-14) continue;
        const tau = (D[q][q] - D[p][p]) / (2 * D[p][q]);
        const t = Math.sign(tau || 1) / (Math.abs(tau) + Math.sqrt(1 + tau * tau));
        const c = 1 / Math.sqrt(1 + t * t), s = t * c;
        for (let k = 0; k < n; k++) {
          const dkp = D[k][p], dkq = D[k][q];
          D[k][p] = c * dkp - s * dkq;
          D[k][q] = s * dkp + c * dkq;
        }
        for (let k = 0; k < n; k++) {
          const dpk = D[p][k], dqk = D[q][k];
          D[p][k] = c * dpk - s * dqk;
          D[q][k] = s * dpk + c * dqk;
        }
        for (let k = 0; k < n; k++) {
          const vkp = V[k][p], vkq = V[k][q];
          V[k][p] = c * vkp - s * vkq;
          V[k][q] = s * vkp + c * vkq;
        }
      }
    }
  }
  const pairs = Array.from({ length: n }, (_, j) => ({
    sigma: Math.sqrt(Math.max(0, D[j][j])),
    vCol: V.map(r => r[j])
  })).sort((a, b) => b.sigma - a.sigma);

  const rankMax = Math.min(m, n);
  const sMax = pairs[0]?.sigma || 0;
  const tol = Math.max(1e-11, sMax * 1e-7);
  const singularValues = pairs.slice(0, rankMax).map(p => (p.sigma < tol ? 0 : p.sigma));
  const Vsorted = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (__, c) => pairs[c].vCol[r]));
  const AV = matrixOp(A, Vsorted, 'multiply');
  const U = Array.from({ length: m }, (_, r) =>
    Array.from({ length: rankMax }, (__, c) => (singularValues[c] > tol ? AV[r][c] / singularValues[c] : (r === c ? 1 : 0)))
  );
  const nonZeroS = singularValues.filter(s => s > tol);
  const sMin = nonZeroS.length === rankMax ? singularValues[rankMax - 1] : 0;
  const cond = sMin > tol ? sMax / sMin : Infinity;
  return { U, singularValues, V: Vsorted, conditionNumber: cond, rank: nonZeroS.length };
}

export function matrixExponential(A) {
  const n = A.length;
  if (n !== A[0].length) throw Error('Matrix exponential requires a square matrix');
  // Scaling and squaring with Taylor/Padé expansion: e^A = (e^(A / 2^s))^(2^s)
  const norm1 = Math.max(...A.map(r => r.reduce((s, v) => s + Math.abs(v), 0)));
  const s = Math.max(0, Math.ceil(Math.log2(Math.max(1, norm1))) + 2);
  const scale = 2 ** s;
  const As = A.map(r => r.map(v => v / scale));
  let E = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? 1 : 0)));
  let term = E.map(r => r.slice());
  for (let k = 1; k <= 18; k++) {
    term = matrixOp(term, As, 'multiply').map(r => r.map(v => v / k));
    E = matrixOp(E, term, 'addition');
  }
  for (let i = 0; i < s; i++) {
    E = matrixOp(E, E, 'multiply');
  }
  const trA = A.reduce((sum, r, i) => sum + r[i], 0);
  const detExpA = matrixOp(E, null, 'determinant')[0][0];
  return { expA: E, traceA: trA, detExpA, exactExpTrace: Math.exp(trA) };
}

export function linearLeastSquares(A, bVec) {
  const m = A.length, n = A[0].length;
  if (bVec.length !== m) throw Error('Observation vector b length must match rows of A');
  const AT = matrixOp(A, null, 'transpose');
  const ATA = matrixOp(AT, A, 'multiply');
  const ATb = matrixOp(AT, bVec.map(v => [v]), 'multiply');
  const sol = gaussian(ATA, ATb);
  const xHat = sol.answer.map(r => r[0]);
  const yHat = matrixOp(A, sol.answer, 'multiply').map(r => r[0]);
  const residuals = bVec.map((y, i) => y - yHat[i]);
  const rss = residuals.reduce((s, e) => s + e * e, 0);
  const yMean = bVec.reduce((s, y) => s + y, 0) / m;
  const tss = bVec.reduce((s, y) => s + (y - yMean) ** 2, 0);
  return {
    xHat,
    yHat,
    residuals,
    rss,
    rmse: Math.sqrt(rss / m),
    rSquared: tss > 0 ? Math.max(0, 1 - rss / tss) : 1
  };
}

// ============================================================================
// 2. PROBABILITY DISTRIBUTIONS & INFERENTIAL STATISTICS ENGINE
// ============================================================================

export function normalPdf(x, mu = 0, sigma = 1) {
  if (sigma <= 0) throw Error('Standard deviation σ must be positive');
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

export function normalCdf(x, mu = 0, sigma = 1) {
  if (sigma <= 0) throw Error('Standard deviation σ must be positive');
  const z = (x - mu) / (sigma * Math.SQRT2);
  return 0.5 * (1 + erf(z));
}

// Beasley-Springer-Moro / Acklam rational approximation for inverse standard normal Φ⁻¹(p)
export function normalInv(p, mu = 0, sigma = 1) {
  if (p <= 0 || p >= 1) throw Error('Probability p must lie strictly between 0 and 1');
  if (sigma <= 0) throw Error('Standard deviation σ must be positive');
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pLow = 0.02425, pHigh = 1 - pLow;
  let z;
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    z = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    const q = p - 0.5, r = q * q;
    z = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
        (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    z = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
         ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  return mu + sigma * z;
}

// Regularized Incomplete Beta I_x(a, b) via Lentz's continued fraction
export function regIncompleteBeta(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(x, a, b)) / a;
  }
  return 1 - (bt * betacf(1 - x, b, a)) / b;
}

function betacf(x, a, b) {
  const maxIter = 200, eps = 3e-14, fpmin = 1e-30;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - (qab * x) / qap;
  if (Math.abs(d) < fpmin) d = fpmin;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= maxIter; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < fpmin) d = fpmin;
    c = 1 + aa / c; if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d; h *= d * c;
    aa = -((a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < fpmin) d = fpmin;
    c = 1 + aa / c; if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < eps) break;
  }
  return h;
}

// Regularized Incomplete Gamma P(a, x)
export function regIncompleteGammaP(a, x) {
  if (x <= 0) return 0;
  if (x < a + 1) {
    let ap = a, del = 1 / a, sum = del;
    for (let n = 1; n <= 200; n++) {
      ap += 1;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * 1e-14) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - lgamma(a));
  }
  let b = x + 1 - a, c = 1 / 1e-30, d = 1 / b, h = d;
  for (let i = 1; i <= 200; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b; if (Math.abs(d) < 1e-30) d = 1e-30;
    c = b + an / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-14) break;
  }
  return 1 - Math.exp(-x + a * Math.log(x) - lgamma(a)) * h;
}

export function studentTCdf(t, df) {
  if (df <= 0) throw Error('Degrees of freedom df must be positive');
  const x = df / (df + t * t);
  const ib = 0.5 * regIncompleteBeta(x, df / 2, 0.5);
  return t >= 0 ? 1 - ib : ib;
}

export function studentTInv(p, df) {
  if (p <= 0 || p >= 1) throw Error('Probability p must lie in (0, 1)');
  if (df <= 0) throw Error('Degrees of freedom df must be positive');
  let lo = -1000, hi = 1000;
  for (let i = 0; i < 70; i++) {
    const mid = (lo + hi) / 2;
    if (studentTCdf(mid, df) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function chiSquareCdf(chi2, df) {
  if (df <= 0) throw Error('Degrees of freedom df must be positive');
  if (chi2 <= 0) return 0;
  return regIncompleteGammaP(df / 2, chi2 / 2);
}

export function chiSquareInv(p, df) {
  if (p <= 0 || p >= 1) throw Error('Probability p must lie in (0, 1)');
  let lo = 0, hi = Math.max(100, df * 10);
  while (chiSquareCdf(hi, df) < p) hi *= 2;
  for (let i = 0; i < 70; i++) {
    const mid = (lo + hi) / 2;
    if (chiSquareCdf(mid, df) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function fDistCdf(fVal, df1, df2) {
  if (df1 <= 0 || df2 <= 0) throw Error('Degrees of freedom must be positive');
  if (fVal <= 0) return 0;
  const x = (df1 * fVal) / (df1 * fVal + df2);
  return regIncompleteBeta(x, df1 / 2, df2 / 2);
}

export function poissonDist(lambda, k) {
  if (lambda <= 0) throw Error('Rate parameter λ must be positive');
  if (!Number.isInteger(k) || k < 0) throw Error('Occurrences k must be a nonnegative integer');
  const pmf = Math.exp(k * Math.log(lambda) - lambda - lgamma(k + 1));
  let cdf = 0;
  for (let i = 0; i <= k; i++) {
    cdf += Math.exp(i * Math.log(lambda) - lambda - lgamma(i + 1));
  }
  cdf = Math.min(1, cdf);
  return {
    pmf,
    cdfLe: cdf,
    cdfLt: k > 0 ? Math.max(0, cdf - pmf) : 0,
    cdfGe: Math.max(0, 1 - (k > 0 ? cdf - pmf : 0)),
    cdfGt: Math.max(0, 1 - cdf),
    mean: lambda,
    variance: lambda,
    sd: Math.sqrt(lambda)
  };
}

export function oneWayAnova(groups) {
  const valid = groups.filter(g => g.length > 0);
  if (valid.length < 2) throw Error('Enter at least two groups of observations');
  const k = valid.length;
  const N = valid.reduce((s, g) => s + g.length, 0);
  if (N <= k) throw Error('Total observations N must exceed number of groups k');
  const allVals = valid.flat();
  const grandMean = allVals.reduce((s, v) => s + v, 0) / N;
  let ssBetween = 0, ssWithin = 0;
  const groupStats = valid.map((g, idx) => {
    const n = g.length;
    const mean = g.reduce((s, v) => s + v, 0) / n;
    const ss = g.reduce((s, v) => s + (v - mean) ** 2, 0);
    ssBetween += n * (mean - grandMean) ** 2;
    ssWithin += ss;
    return { group: idx + 1, n, mean, sd: n > 1 ? Math.sqrt(ss / (n - 1)) : 0 };
  });
  const dfBetween = k - 1, dfWithin = N - k;
  const msBetween = ssBetween / dfBetween, msWithin = ssWithin / dfWithin;
  const fStat = msWithin > 0 ? msBetween / msWithin : Infinity;
  const pVal = Number.isFinite(fStat) ? 1 - fDistCdf(fStat, dfBetween, dfWithin) : 0;
  const etaSq = (ssBetween + ssWithin) > 0 ? ssBetween / (ssBetween + ssWithin) : 0;
  return { k, N, grandMean, ssBetween, ssWithin, ssTotal: ssBetween + ssWithin, dfBetween, dfWithin, msBetween, msWithin, fStat, pVal, etaSq, groupStats };
}

// ============================================================================
// 3. ADVANCED FINANCE ENGINE (NPV, IRR, XIRR, Bonds, Black-Scholes, Greeks)
// ============================================================================

export function calcNpvIrr(ratePercent, cashFlows) {
  if (!cashFlows || cashFlows.length < 2) throw Error('Enter at least 2 cash flows (including initial CF₀)');
  const r = ratePercent / 100;
  if (r <= -1) throw Error('Discount rate must exceed −100%');
  const npvAt = rate => cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0);
  const npv = npvAt(r);

  // Check sign change for IRR existence
  const hasPos = cashFlows.some(c => c > 0), hasNeg = cashFlows.some(c => c < 0);
  let irr = null;
  if (hasPos && hasNeg) {
    // Bracket search + bisection / secant on [-0.95, 10.0]
    let lo = -0.95, hi = 10.0;
    let fLo = npvAt(lo);
    for (let step = -0.9; step <= 10.0; step += 0.05) {
      const fVal = npvAt(step);
      if (fLo * fVal <= 0) { hi = step; break; }
      lo = step; fLo = fVal;
    }
    if (npvAt(lo) * npvAt(hi) <= 0) {
      let a = lo, b = hi, fa = npvAt(a);
      for (let i = 0; i < 80; i++) {
        const mid = (a + b) / 2, fm = npvAt(mid);
        if (Math.abs(fm) < 1e-11) { a = b = mid; break; }
        if (fa * fm <= 0) b = mid;
        else { a = mid; fa = fm; }
      }
      irr = ((a + b) / 2) * 100;
    }
  }
  const pvInflows = cashFlows.slice(1).reduce((s, cf, idx) => s + cf / Math.pow(1 + r, idx + 1), 0);
  const pi = cashFlows[0] < 0 ? pvInflows / Math.abs(cashFlows[0]) : null;
  return { npv, irr, profitabilityIndex: pi, totalNetCashFlow: cashFlows.reduce((a, b) => a + b, 0) };
}

export function calcXirr(cashFlows, datesMs) {
  if (cashFlows.length !== datesMs.length || cashFlows.length < 2) throw Error('Provide matching cash flows and dates');
  const hasPos = cashFlows.some(c => c > 0), hasNeg = cashFlows.some(c => c < 0);
  if (!hasPos || !hasNeg) throw Error('XIRR requires at least one positive and one negative cash flow');
  const d0 = datesMs[0];
  const years = datesMs.map(d => (d - d0) / (365 * 86400000));
  const f = r => cashFlows.reduce((s, cf, i) => s + cf / Math.pow(1 + r, years[i]), 0);
  let lo = -0.95, hi = 10.0, fLo = f(lo), bracketed = false;
  for (let step = -0.9; step <= 10.0; step += 0.05) {
    const fVal = f(step);
    if (fLo * fVal <= 0) { hi = step; bracketed = true; break; }
    lo = step; fLo = fVal;
  }
  if (!bracketed && f(lo) * f(hi) > 0) {
    throw Error('XIRR did not converge to a real rate of return in [−95%, +1000%]');
  }
  let a = lo, b = hi, fa = f(a);
  for (let i = 0; i < 90; i++) {
    const mid = (a + b) / 2, fm = f(mid);
    if (Math.abs(fm) < 1e-11) { a = b = mid; break; }
    if (fa * fm <= 0) b = mid;
    else { a = mid; fa = fm; }
  }
  const root = (a + b) / 2;
  const scale = Math.max(1, ...cashFlows.map(Math.abs));
  if (Math.abs(f(root)) > 1e-3 * scale) {
    throw Error('XIRR iterative solver failed to converge within tolerance');
  }
  return root * 100;
}

export function calcBondValuation(faceValue, couponRatePct, ytmPct, yearsToMaturity, freq = 2) {
  if (faceValue <= 0 || yearsToMaturity <= 0 || freq <= 0) throw Error('Face value, years, and frequency must be positive');
  const n = Math.round(yearsToMaturity * freq);
  const c = (faceValue * (couponRatePct / 100)) / freq;
  const y = (ytmPct / 100) / freq;
  let price = 0, weightedTime = 0, convexitySum = 0;
  for (let t = 1; t <= n; t++) {
    const cf = t === n ? c + faceValue : c;
    const pv = cf / Math.pow(1 + y, t);
    price += pv;
    weightedTime += (t / freq) * pv;
    convexitySum += (pv * t * (t + 1)) / (freq * freq * Math.pow(1 + y, 2));
  }
  const macaulayDuration = price > 0 ? weightedTime / price : 0;
  const modifiedDuration = macaulayDuration / (1 + y);
  const convexity = price > 0 ? convexitySum / price : 0;
  const currentYield = price > 0 ? ((faceValue * (couponRatePct / 100)) / price) * 100 : 0;
  return { price, currentYield, macaulayDuration, modifiedDuration, convexity };
}

export function calcBlackScholes(S, K, T, rPct, sigmaPct, qPct = 0) {
  if (S <= 0 || K <= 0 || T <= 0 || sigmaPct <= 0) {
    throw Error('Spot price S, strike K, time T, and volatility σ must all be positive');
  }
  const r = rPct / 100, sigma = sigmaPct / 100, q = qPct / 100;
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  const Nd1 = normalCdf(d1), Nd2 = normalCdf(d2);
  const Nmd1 = normalCdf(-d1), Nmd2 = normalCdf(-d2);
  const pdfD1 = normalPdf(d1);
  const eqT = Math.exp(-q * T), erT = Math.exp(-r * T);

  const callPrice = S * eqT * Nd1 - K * erT * Nd2;
  const putPrice = K * erT * Nmd2 - S * eqT * Nmd1;
  const callDelta = eqT * Nd1;
  const putDelta = eqT * (Nd1 - 1);
  const gammaVal = (eqT * pdfD1) / (S * sigma * sqrtT);
  const vega = S * eqT * pdfD1 * sqrtT * 0.01; // per 1% vol change
  const callTheta = (-((S * sigma * eqT * pdfD1) / (2 * sqrtT)) - r * K * erT * Nd2 + q * S * eqT * Nd1) / 365;
  const putTheta = (-((S * sigma * eqT * pdfD1) / (2 * sqrtT)) + r * K * erT * Nmd2 - q * S * eqT * Nmd1) / 365;
  const callRho = K * T * erT * Nd2 * 0.01;
  const putRho = -K * T * erT * Nmd2 * 0.01;

  return { d1, d2, callPrice, putPrice, callDelta, putDelta, gamma: gammaVal, vega, callTheta, putTheta, callRho, putRho };
}
