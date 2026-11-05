import {
  CONSTANTS, known, compile, run, calculate, traceCalculate, fmt,
  formatAstText, formatAstHtml, checkAmbiguity, extractVariables,
  solveQuadratic, solveRoots, gaussian, matrixOp, descriptive, integrate,
  unitGroups, findUnitGroup, convertUnit, parseFractions, fractionOp,
  fractionToDecimal, primeFactors, isPrime
} from './engine.js';
import {
  simplifyAst, diffAst, diffSymbolic, numericalDerivative,
  integrateSymbolic, quadratureCompare, doubleIntegral, tripleIntegral,
  improperIntegral, solveOdeIvp, solveOdeBvp, computeFourierSeries,
  computeGradient, computeDivergenceAndCurl
} from './symbolic.js';
import {
  rrefWithPivotInfo, luDecomposition, qrDecomposition, eigenvaluesEigenvectors,
  svdDecomposition, matrixExponential, linearLeastSquares,
  normalPdf, normalCdf, normalInv, studentTCdf, studentTInv,
  chiSquareCdf, chiSquareInv, fDistCdf, poissonDist, oneWayAnova,
  calcNpvIrr, calcXirr, calcBondValuation, calcBlackScholes
} from './linalg_stats_finance.js';

let data, tool, currentExplanation = null, explainOpen = false;
const $ = (s, r = document) => (typeof r === 'string' ? document.querySelector(r) : r)?.querySelector(s);
const $$ = (s, r = document) => [...((typeof r === 'string' ? document.querySelector(r) : r)?.querySelectorAll(s) || [])];
const url = t => `/tools/${t.slug}/`;
const catUrl = c => `/categories/${slugify(c)}/`;
const slugify = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = s => String(s ?? '').replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]));

const icons = {
  'Mathematics': '#',
  'Algebra': 'Σ',
  'Calculus & Graphing': '⌁',
  'Geometry & Trigonometry': '⬡',
  'Physics & Engineering': '⚛',
  'Statistics & Probability': '▥',
  'Finance': '₹',
  'Converters & Everyday Tools': '⇄'
};

const featured = [
  'scientific-calculator',
  'symbolic-derivative-calculator',
  'definite-integral-calculator',
  'triangle-trigonometry-solver',
  'eigenvalues-eigenvectors-calculator',
  'rlc-resonance-calculator',
  'hypothesis-testing-calculator',
  'npv-calculator'
];

function ls(k, def) {
  try { return JSON.parse(localStorage.getItem('axiomatlas-' + k)) ?? def; } catch { return def; }
}
function save(k, val) {
  try { localStorage.setItem('axiomatlas-' + k, JSON.stringify(val)); } catch {}
}
function find(slug) {
  return data.tools.find(x => x.slug === slug);
}
function canonicalTools() {
  return data.tools.filter(x => !x.isAlias);
}

function card(t) {
  return `<a class="tool-card" href="${url(t)}" data-cat="${esc(slugify(t.category))}" data-subcat="${esc(slugify(t.subcategory))}"><span class="tool-icon">${esc(icons[t.category] || '✦')}</span><span class="tool-card-body"><b>${esc(t.title)}</b><small><span class="tool-subtag">${esc(t.subcategory || t.category)}</span>${esc(t.description)}</small></span><span class="card-arrow">↗</span></a>`;
}

function notify(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => node.classList.remove('show'), 2800);
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(String(text));
    notify('Copied to clipboard');
  } catch {
    notify('Could not copy automatically.');
  }
}

// --- EXPLAIN EVERY CALCULATION RENDERER ---
function explainDisplayValue(value) {
  if (typeof value === 'number') return fmt(value);
  if (Array.isArray(value)) return value.map(explainDisplayValue).join(', ');
  if (value && typeof value === 'object') {
    try { return JSON.stringify(value); } catch { return '[structured value]'; }
  }
  return String(value ?? '');
}

function explainOperationGroup(op) {
  const name = String(op || '').toLowerCase();
  if (name.startsWith('function ')) return 'Evaluate functions';
  if (name.includes('power') || name.includes('exponent') || name.includes('root')) return 'Powers and roots';
  if (name.includes('multiplication') || name.includes('division')) return 'Products and quotients';
  if (name.includes('addition') || name.includes('subtraction')) return 'Addition and subtraction';
  if (name.includes('remainder') || name.includes('modulo')) return 'Remainders';
  return 'Other operations';
}

function explainDetailedStep(step, index) {
  if (typeof step === 'string') {
    return '<li class="explain-detail-item"><span class="explain-detail-index">' + (index + 1) +
      '</span><div class="explain-detail-body"><p>' + esc(step) + '</p></div></li>';
  }
  const op = step?.op || step?.rule || 'Calculation step';
  const symbolic = step?.symbolic || step?.expr || '';
  const substituted = step?.substituted || '';
  const hasValue = step && Object.prototype.hasOwnProperty.call(step, 'value');
  const value = hasValue ? explainDisplayValue(step.value) : '';
  return '<li class="explain-detail-item"><span class="explain-detail-index">' + (index + 1) +
    '</span><div class="explain-detail-body"><b>' + esc(op) + '</b>' +
    (symbolic ? '<div class="explain-detail-expression">' + esc(symbolic) + '</div>' : '') +
    (substituted ? '<div class="explain-detail-substitution">' + esc(substituted) + '</div>' : '') +
    (hasValue ? '<div class="explain-detail-result">Result: <strong>' + esc(value) + '</strong></div>' : '') +
    '</div></li>';
}

function buildExplainStepContent(exp) {
  const steps = Array.isArray(exp.steps) ? exp.steps : [];
  if (!steps.length) return { guided: '', detailed: '' };

  const detailsLimit = 120;
  const detailItems = steps.slice(0, detailsLimit).map(explainDetailedStep).join('');
  const omitted = steps.length > detailsLimit
    ? '<p class="explain-detail-note">Showing the first ' + detailsLimit + ' of ' + steps.length + ' recorded operations. The calculation itself used the complete execution trace.</p>'
    : '';
  const detailed = '<details class="explain-details"><summary><span>Show detailed derivation</span><small>' +
    steps.length + (steps.length === 1 ? ' recorded step' : ' recorded steps') + '</small></summary>' +
    '<ol class="explain-detail-list">' + detailItems + '</ol>' + omitted + '</details>';

  const objectTrace = steps.every(step => step && typeof step === 'object' && !Array.isArray(step));
  if (objectTrace) {
    const groups = new Map();
    steps.forEach(step => {
      const label = explainOperationGroup(step.op || step.rule);
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(step);
    });
    const guided = Array.from(groups.entries()).map(([label, items], index) => {
      const last = items[items.length - 1];
      const expression = last.symbolic || last.substituted || '';
      const result = Object.prototype.hasOwnProperty.call(last, 'value')
        ? '<div class="explain-step-result">Latest intermediate result: <strong>' + esc(explainDisplayValue(last.value)) + '</strong></div>'
        : '';
      return '<article class="explain-step-card"><div class="explain-step-top"><span class="explain-step-number">' +
        (index + 1) + '</span><h5>' + esc(label) + '</h5><span class="explain-step-count">' +
        items.length + (items.length === 1 ? ' operation' : ' operations') + '</span></div>' +
        (expression ? '<p class="explain-step-preview">' + esc(expression) + '</p>' : '') + result + '</article>';
    }).join('');
    return { guided: '<div class="explain-guided-grid">' + guided + '</div>', detailed };
  }

  const stringSteps = steps.map(step => typeof step === 'string' ? step : explainDisplayValue(step));
  const isDerivativeRuleTrace = /derivative/i.test(String(exp.formula || '')) &&
    stringSteps.some(step => /Rule\s*(?::|d\/dx)|Symbolic derivative:|Evaluated at/i.test(step));

  if (isDerivativeRuleTrace) {
    const groups = new Map();
    stringSteps.forEach(step => {
      const colon = step.indexOf(':');
      if (colon < 0) return;
      const rawLabel = step.slice(0, colon).trim();
      if (/^(Constant Rule|Variable Identity Rule)/i.test(rawLabel)) return;
      let label = rawLabel;
      if (/Power & Chain Rule/i.test(rawLabel)) label = 'Power and chain rule';
      else if (/Exponential Rule/i.test(rawLabel)) label = 'Exponential rule';
      else if (/Chain Rule on ln/i.test(rawLabel)) label = 'Logarithm chain rule';
      else if (/Chain Rule on sin/i.test(rawLabel)) label = 'Trigonometric chain rule';
      else if (/Chain Rule on sqrt/i.test(rawLabel)) label = 'Square-root chain rule';
      else if (/Sum \/ Difference Rule/i.test(rawLabel)) label = 'Sum and difference rule';
      else if (/Product Rule/i.test(rawLabel)) label = 'Product rule';
      else if (/Quotient Rule/i.test(rawLabel)) label = 'Quotient rule';
      else if (/^Symbolic derivative/i.test(rawLabel)) label = 'Simplified derivative';
      else if (/^Evaluated at/i.test(rawLabel)) label = 'Evaluate at the requested point';
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(step.slice(colon + 1).trim());
    });
    const guided = Array.from(groups.entries()).map(([label, examples], index) =>
      '<article class="explain-step-card"><div class="explain-step-top"><span class="explain-step-number">' +
      (index + 1) + '</span><h5>' + esc(label) + '</h5><span class="explain-step-count">' +
      examples.length + (examples.length === 1 ? ' application' : ' applications') +
      '</span></div><p class="explain-step-preview">Related operations are grouped here to make the derivation easier to follow.</p></article>'
    ).join('');
    return { guided: '<div class="explain-guided-grid">' + guided + '</div>', detailed };
  }

  const visibleCount = 6;
  const visible = stringSteps.slice(0, visibleCount);
  const guided = '<ol class="explain-guided-list">' + visible.map((step, index) =>
    '<li class="explain-guided-item"><span class="explain-step-number">' + (index + 1) +
    '</span><div>' + esc(step) + '</div></li>'
  ).join('') + '</ol>';
  return { guided, detailed: steps.length > visibleCount ? detailed : '' };
}

function buildExplainHtml(exp) {
  if (!exp) return '';
  const inputsHtml = exp.inputs?.length
    ? '<section class="explain-section"><div class="explain-section-heading"><span class="explain-eyebrow">01 · INPUTS</span><h4>Given information</h4></div>' +
      (exp.modeLabel ? '<span class="explain-mode-chip">' + esc(exp.modeLabel) + '</span>' : '') +
      '<div class="explain-input-grid">' + exp.inputs.map(inp => {
        const rawValue = inp.rawVal ?? inp.value ?? '';
        return '<div class="explain-input-card"><span>' + esc(inp.label || 'Input') + '</span><strong>' +
          esc(explainDisplayValue(rawValue)) + (inp.selectedUnit ? ' <em>' + esc(inp.selectedUnit) + '</em>' : '') +
          '</strong>' + (inp.convertedNote ? '<small>' + esc(inp.convertedNote) + '</small>' : '') + '</div>';
      }).join('') + '</div></section>'
    : '';

  const formulaHtml = exp.formula
    ? '<section class="explain-section"><div class="explain-section-heading"><span class="explain-eyebrow">02 · METHOD</span><h4>Formula used</h4></div>' +
      '<div class="explain-equation-card"><div class="explain-equation">' + esc(exp.formula) + '</div>' +
      (exp.principle ? '<p class="explain-principle">' + esc(exp.principle) + '</p>' : '') + '</div></section>'
    : '';

  const substHtml = exp.substituted
    ? '<section class="explain-section"><div class="explain-section-heading"><span class="explain-eyebrow">03 · SUBSTITUTION</span><h4>Putting in your values</h4></div>' +
      '<div class="explain-equation-card explain-equation-card-muted"><div class="explain-equation">' +
      esc(exp.substituted) + '</div></div></section>'
    : '';

  const stepContent = buildExplainStepContent(exp);
  const stepsHtml = stepContent.guided
    ? '<section class="explain-section"><div class="explain-section-heading"><span class="explain-eyebrow">04 · WORKED STEPS</span><h4>Follow the calculation</h4>' +
      '<p>Related operations are grouped so the important reasoning is easier to see.</p></div>' +
      stepContent.guided + stepContent.detailed + '</section>'
    : '';

  const finalHtml = exp.finalSummary
    ? '<section class="explain-final"><span class="explain-final-label">FINAL ANSWER</span><div class="explain-final-value">' +
      esc(exp.finalSummary) + '</div><p>The result shown here comes from the same calculation used by the result panel.</p></section>'
    : '';

  const notesHtml = exp.assumptions
    ? '<section class="explain-notes"><span class="explain-eyebrow">MORE CONTEXT</span><h4>Assumptions and method notes</h4><p>' +
      esc(exp.assumptions) + '</p></section>'
    : '';

  return '<section class="explain-drawer" id="explain-drawer" role="region" aria-label="Step-by-step calculation explanation" ' +
    (explainOpen ? '' : 'hidden') + '><header class="explain-intro"><span class="explain-eyebrow">CALCULATION GUIDE</span>' +
    '<h3>How this calculation works</h3><p>A clear walkthrough of the inputs, method and result.</p></header>' +
    inputsHtml + formulaHtml + substHtml + stepsHtml + finalHtml + notesHtml + '</section>';
}

function updateResults(items, explanation = null, extraHtml = '') {
  const target = $('#result-display');
  if (!target) return;
  if (!explanation && items.length) {
    explanation = {
      inputs: [],
      formula: tool?.formula || 'Direct mathematical evaluation',
      substituted: items.map(x => `${x.label}: ${typeof x.value === 'number' ? fmt(x.value) : x.value}`).join(' | '),
      steps: items.map(x => ({ op: x.label, substituted: x.expr || x.label, value: x.value })),
      finalSummary: `${items[0].label} = ${typeof items[0].value === 'number' ? fmt(items[0].value) : items[0].value}${items[0].unit ? ' ' + items[0].unit : ''}`,
      assumptions: tool?.note || 'Computed deterministically in your browser using IEEE-754 double precision.'
    };
  }
  currentExplanation = explanation;
  const linesHtml = items.map((x, i) => {
    const valStr = typeof x.value === 'number' ? fmt(x.value) : String(x.value);
    return `<div class="result-line ${i === 0 ? 'primary-result' : ''}"><div><span>${esc(x.label)}</span>${x.html ? x.html : `<strong>${esc(valStr)}${x.unit ? ` <em>${esc(x.unit)}</em>` : ''}</strong>`}</div><button class="result-copy" data-copy="${esc(valStr)}" title="Copy this result" aria-label="Copy ${esc(x.label)}">⧉</button></div>`;
  }).join('');

  const explainBtnHtml = `<div class="explain-bar"><button type="button" class="explain-toggle-btn" id="explain-toggle" aria-expanded="${explainOpen ? 'true' : 'false'}" aria-controls="explain-drawer">${explainOpen ? '▾ Hide Calculation Steps' : '✦ Explain Calculation (Step-by-Step)'}</button></div>${buildExplainHtml(currentExplanation)}`;

  target.innerHTML = linesHtml + extraHtml + explainBtnHtml;
  $$('[data-copy]', target).forEach(b => (b.onclick = () => copy(b.dataset.copy)));
  const expBtn = $('#explain-toggle', target);
  if (expBtn) {
    expBtn.onclick = () => {
      explainOpen = !explainOpen;
      const drawer = $('#explain-drawer', target);
      if (drawer) drawer.hidden = !explainOpen;
      expBtn.setAttribute('aria-expanded', explainOpen ? 'true' : 'false');
      expBtn.textContent = explainOpen ? '▾ Hide Calculation Steps' : '✦ Explain Calculation (Step-by-Step)';
    };
  }
}

function fail(message, conditionHint = '') {
  currentExplanation = null;
  const target = $('#result-display');
  if (!target) return;
  const hint = conditionHint || 'Verify that all required fields contain valid numbers within the mathematical or physical domain of this calculator.';
  target.innerHTML = `<div class="calc-error" role="alert"><b>Input Validation Notice</b><span>${esc(message)}</span><small style="color:var(--muted);margin-top:4px;display:block"><strong>How to fix:</strong> ${esc(hint)}</small></div>`;
}

function evalSafe(fn) {
  try {
    fn();
    const st = $('#result-status');
    if (st) {
      st.textContent = 'Calculated locally · verified single-pipeline trace';
      st.classList.remove('error-status');
    }
  } catch (e) {
    fail(e.message || 'Invalid input');
    const st = $('#result-status');
    if (st) {
      st.textContent = 'Please revise your inputs';
      st.classList.add('error-status');
    }
  }
}

// --- REUSABLE INPUT HELPERS WITH UNIT SELECTORS ---
function numsWithUnits(fields) {
  const v = {}, inputRecords = [];
  for (const f of fields) {
    const k = typeof f === 'string' ? f : f.key;
    const label = typeof f === 'string' ? k : f.label;
    const canonicalUnit = typeof f === 'string' ? '' : (f.unit || '');
    const node = $(`[data-field="${k}"]`);
    if (!node || node.value.trim() === '') throw Error(`Please enter a value for "${label}"`);
    const rawStr = node.value.trim();
    let rawNum = Number(rawStr);
    if (!Number.isFinite(rawNum)) {
      // Allow symbolic constants like pi, e, pi/2 in numeric fields!
      try { rawNum = calculate(rawStr); } catch { throw Error(`Enter a valid number for "${label}"`); }
    }
    const unitSel = $(`[data-unit-for="${k}"]`);
    let finalVal = rawNum, convertedNote = '', selectedUnit = canonicalUnit;
    if (unitSel && canonicalUnit) {
      selectedUnit = unitSel.value;
      const grp = findUnitGroup(canonicalUnit);
      if (grp && selectedUnit !== canonicalUnit) {
        finalVal = convertUnit(grp, rawNum, selectedUnit, canonicalUnit);
        convertedNote = `converted to ${fmt(finalVal)} ${canonicalUnit}`;
      }
    }
    v[k] = finalVal;
    inputRecords.push({ key: k, label, rawVal: fmt(rawNum), selectedUnit, canonicalUnit, finalVal, convertedNote });
  }
  return { v, inputRecords };
}

function nums(keys) {
  return numsWithUnits(keys).v;
}

function renderFieldControl(f) {
  const grp = findUnitGroup(f.unit);
  let unitHtml = '';
  if (grp && unitGroups[grp]) {
    const opts = Object.keys(unitGroups[grp]).map(u => `<option value="${esc(u)}" ${u === f.unit ? 'selected' : ''}>${esc(u)}</option>`).join('');
    unitHtml = `<select class="unit-select" data-unit-for="${esc(f.key)}" aria-label="Unit for ${esc(f.label)}">${opts}</select>`;
  } else if (f.unit) {
    unitHtml = `<span class="unit-pill">${esc(f.unit)}</span>`;
  }
  return `<label class="control"><span>${esc(f.label)}</span><div class="field-wrap ${unitHtml ? 'has-unit' : ''}"><input type="text" inputmode="decimal" data-field="${esc(f.key)}" data-default="${esc(f.default)}" value="${esc(f.default)}" placeholder="e.g. ${esc(f.default)}" aria-label="${esc(f.label)}">${unitHtml}</div></label>`;
}

function input(label, id, def = '', type = 'number', extras = '') {
  const mode = type === 'number' ? 'type="text" inputmode="decimal"' : `type="${type}"`;
  return `<label class="control"><span>${esc(label)}</span><input data-field="${esc(id)}" data-default="${esc(def)}" ${mode} value="${esc(def)}" placeholder="e.g. ${esc(def)}" ${extras}></label>`;
}

function dropdown(label, id, opts, val) {
  return `<label class="control"><span>${esc(label)}</span><select data-field="${esc(id)}" data-default="${esc(val)}">${opts.map(v => {
    const [ov, ol] = Array.isArray(v) ? v : [v, v];
    return `<option value="${esc(ov)}" ${String(ov) === String(val) ? 'selected' : ''}>${esc(ol)}</option>`;
  }).join('')}</select></label>`;
}

function textArea(label, id, def, rows = 3) {
  return `<label class="control full"><span>${esc(label)}</span><textarea data-field="${esc(id)}" data-default="${esc(def)}" rows="${rows}" spellcheck="false">${esc(def)}</textarea></label>`;
}

function actionBarHtml() {
  return `<div class="calc-action-bar"><button type="button" class="calc-btn" id="btn-calculate">✦ Calculate</button><button type="button" class="reset-btn" id="btn-reset">↺ Reset</button><span style="font-size:11.5px;color:var(--muted);margin-left:auto">Updates live as you type</span></div>`;
}

// --- REUSABLE MATHEMATICAL EXPRESSION INPUT COMPONENT (Section 5.2) ---
function mathExprControl(label, id, def, opts = {}) {
  const showKeypadOpen = opts.keypadOpen ?? false;
  const vars = opts.vars || ['x'];
  const keys = [
    ['sin(', 'sin'], ['cos(', 'cos'], ['tan(', 'tan'], ['asin(', 'sin⁻¹'], ['acos(', 'cos⁻¹'], ['atan(', 'tan⁻¹'],
    ['sec(', 'sec'], ['csc(', 'csc'], ['cot(', 'cot'], ['ln(', 'ln'], ['log(', 'log₁₀'], ['exp(', 'eˣ'],
    ['sqrt(', '√x'], ['cbrt(', '∛x'], ['^2', 'x²'], ['^3', 'x³'], ['^', 'xⁿ'], ['/', 'a/b'],
    ['(', '('], [')', ')'], ['abs(', '|x|'], ['!', 'n!'], ['pi', 'π'], ['e', 'e'],
    ...vars.map(v => [v, v]), ['+', '+'], ['-', '−'], ['*', '×'], ['C', 'Clear'], ['⌫', '⌫']
  ];
  return `<div class="math-expr-box control full" data-expr-wrap="${esc(id)}">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
      <label for="expr-in-${esc(id)}" style="font-size:12px;font-weight:700">${esc(label)}</label>
      <div style="display:flex;gap:6px;align-items:center">
        <button type="button" class="chip" data-toggle-keypad="${esc(id)}" aria-expanded="${showKeypadOpen ? 'true' : 'false'}">⌨ ${showKeypadOpen ? 'Hide Math Keypad' : 'Math Keypad'}</button>
        <button type="button" class="chip" data-toggle-oskb="${esc(id)}" title="Prevent mobile OS keyboard from covering screen">📱 Touch Keypad Only: Off</button>
      </div>
    </div>
    <input id="expr-in-${esc(id)}" class="big-input" data-field="${esc(id)}" data-default="${esc(def)}" type="text" value="${esc(def)}" placeholder="e.g. ${esc(def)}" spellcheck="false" autocomplete="off">
    <div class="math-preview-bar" data-preview-for="${esc(id)}" aria-live="polite">
      <span class="math-preview-label">Interpreted as:</span>
      <span class="math-preview-render" data-preview-html="${esc(id)}"></span>
    </div>
    <div class="ambiguity-banner" data-ambiguity-for="${esc(id)}" hidden></div>
    <div class="keypad" data-keypad-for="${esc(id)}" ${showKeypadOpen ? '' : 'hidden'}>
      ${keys.map(([ins, lbl]) => `<button type="button" class="key ${/[+−×/^!]/.test(lbl) ? 'operator' : ''}" data-expr-target="${esc(id)}" data-insert="${esc(ins)}">${esc(lbl)}</button>`).join('')}
    </div>
  </div>`;
}

function wireMathExprControls(runCalc) {
  $$('[data-expr-wrap]').forEach(wrap => {
    const id = wrap.dataset.exprWrap;
    const inp = $(`[data-field="${id}"]`, wrap);
    const prevNode = $(`[data-preview-html="${id}"]`, wrap);
    const ambNode = $(`[data-ambiguity-for="${id}"]`, wrap);
    const kpNode = $(`[data-keypad-for="${id}"]`, wrap);
    const kpBtn = $(`[data-toggle-keypad="${id}"]`, wrap);
    const oskbBtn = $(`[data-toggle-oskb="${id}"]`, wrap);

    function updatePreview() {
      if (!inp || !prevNode) return;
      const raw = inp.value.trim();
      if (!raw) {
        prevNode.innerHTML = '<em style="color:var(--muted);font-size:12px">Enter a mathematical expression…</em>';
        if (ambNode) ambNode.hidden = true;
        return;
      }
      const amb = checkAmbiguity(raw);
      if (amb.ambiguous && ambNode) {
        ambNode.hidden = false;
        ambNode.innerHTML = `<div><strong>⚠️ Ambiguous Notation Detected:</strong> ${esc(amb.message)}</div>
          <div class="ambiguity-actions">
            <button type="button" class="ambiguity-btn" data-resolve="inv">Use Inverse: <code>${esc(amb.inverseOption)}</code></button>
            <button type="button" class="ambiguity-btn" data-resolve="rec">Use Reciprocal: <code>${esc(amb.reciprocalOption)}</code></button>
          </div>`;
        $('[data-resolve="inv"]', ambNode).onclick = () => { inp.value = amb.inverseOption; updatePreview(); runCalc(); };
        $('[data-resolve="rec"]', ambNode).onclick = () => { inp.value = amb.reciprocalOption; updatePreview(); runCalc(); };
      } else if (ambNode) {
        ambNode.hidden = true;
      }
      try {
        const eqParts = raw.split('=');
        if (eqParts.length === 2) {
          const lHtml = formatAstHtml(compile(eqParts[0], { allowAmbiguousInversePower: true }));
          const rHtml = formatAstHtml(compile(eqParts[1], { allowAmbiguousInversePower: true }));
          prevNode.innerHTML = `${lHtml} = ${rHtml}`;
        } else {
          const ast = compile(raw, { allowAmbiguousInversePower: true });
          prevNode.innerHTML = formatAstHtml(ast);
        }
      } catch (e) {
        prevNode.innerHTML = `<span style="color:var(--danger);font-size:12px;font-family:system-ui">${esc(e.message)}</span>`;
      }
    }

    if (kpBtn && kpNode) {
      kpBtn.onclick = () => {
        kpNode.hidden = !kpNode.hidden;
        kpBtn.setAttribute('aria-expanded', kpNode.hidden ? 'false' : 'true');
        kpBtn.textContent = kpNode.hidden ? '⌨ Math Keypad' : '⌨ Hide Math Keypad';
      };
    }
    if (oskbBtn && inp) {
      oskbBtn.onclick = () => {
        const noneMode = inp.getAttribute('inputmode') === 'none';
        if (noneMode) {
          inp.removeAttribute('inputmode');
          oskbBtn.textContent = '📱 Touch Keypad Only: Off';
        } else {
          inp.setAttribute('inputmode', 'none');
          if (kpNode) kpNode.hidden = false;
          oskbBtn.textContent = '📱 Touch Keypad Only: On';
        }
      };
    }
    $$('[data-insert]', wrap).forEach(btn => {
      btn.onclick = () => {
        const k = btn.dataset.insert;
        if (k === 'C') { inp.value = ''; updatePreview(); runCalc(); return; }
        if (k === '⌫') { inp.value = inp.value.slice(0, -1); updatePreview(); runCalc(); return; }
        const pos = inp.selectionStart ?? inp.value.length;
        const endPos = inp.selectionEnd ?? inp.value.length;
        inp.value = inp.value.slice(0, pos) + k + inp.value.slice(endPos);
        if (inp.getAttribute('inputmode') !== 'none') inp.focus();
        inp.setSelectionRange(pos + k.length, pos + k.length);
        updatePreview();
        runCalc();
      };
    });
    inp?.addEventListener('input', updatePreview);
    updatePreview();
  });
}

function bind(runCalc) {
  let timer;
  wireMathExprControls(runCalc);
  $$('[data-field], [data-unit-for]', '#calculator-app').forEach(el => {
    el.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(runCalc, 65);
    });
    el.addEventListener('change', runCalc);
  });
  const calcBtn = $('#btn-calculate', '#calculator-app');
  if (calcBtn) calcBtn.onclick = runCalc;
  const resetBtn = $('#btn-reset', '#calculator-app');
  if (resetBtn) {
    resetBtn.onclick = () => {
      $$('[data-field]', '#calculator-app').forEach(el => {
        if (el.dataset.default !== undefined) el.value = el.dataset.default;
      });
      $$('[data-unit-for]', '#calculator-app').forEach(sel => {
        sel.selectedIndex = 0;
      });
      wireMathExprControls(runCalc);
      runCalc();
      notify('Inputs reset to defaults');
    };
  }
  runCalc();
}

// --- DOMAIN VALIDATION FOR ALL FORMULA & MULTIMODE CALCULATORS ---
function validateFormula(t, v, modeId = '') {
  const slug = t.canonicalSlug || t.slug;
  const val = (...keys) => keys.map(k => v[k]).filter(x => x !== undefined);

  if ((t.category === 'Geometry & Trigonometry' || slug.includes('geometry')) && slug !== 'slope-calculator' && slug !== 'midpoint-calculator' && slug !== 'distance-between-points' && slug !== 'degree-radian') {
    if (Object.values(v).some(x => x <= 0)) throw Error('Geometric lengths, radii, and angles must be positive (> 0)');
  }
  if ((slug === 'herons-formula' || modeId === 'heron') && (v.a + v.b <= v.c || v.a + v.c <= v.b || v.b + v.c <= v.a)) {
    throw Error('Triangle inequality violated: the sum of any two sides must strictly exceed the third side (a + b > c)');
  }
  if ((slug === 'torus-calculator' || modeId === 'torus') && v.R <= v.r) {
    throw Error('A ring torus requires Major Radius R to strictly exceed Tube Radius r (R > r)');
  }
  if ((slug === 'parallelogram-calculator' || modeId === 'parallelogram') && v.h > v.s) {
    throw Error('Perpendicular height h cannot exceed slant side length s (since h = s·sin θ ≤ s)');
  }
  if ((slug === 'regular-polygon' || modeId === 'polygon') && (!Number.isInteger(v.n) || v.n < 3)) {
    throw Error('A regular polygon requires an integer number of sides n ≥ 3');
  }
  if ((slug === 'logarithm-calculator' || modeId === 'log') && (v.x <= 0 || v.b <= 0 || v.b === 1)) {
    throw Error('Logarithm requires argument x > 0, base b > 0, and base b ≠ 1');
  }
  if ((slug === 'exponents-logarithms-calculator' && modeId === 'root') || slug === 'nth-root') {
    if (v.n === 0) throw Error('Root degree n cannot be zero');
    if (v.x < 0 && (!Number.isInteger(v.n) || Math.abs(v.n % 2) !== 1)) {
      throw Error('Even root of a negative number is not a real number');
    }
  }
  if (slug === 'law-of-sines' || modeId === 'sine_rule') {
    if (v.a <= 0 || v.A <= 0 || v.B <= 0 || v.A + v.B >= 180) {
      throw Error('Triangle side must be positive and angles A + B must sum to less than 180°');
    }
  }
  if (slug === 'law-of-cosines' || modeId === 'cosine_rule') {
    if (v.a <= 0 || v.b <= 0 || v.C <= 0 || v.C >= 180) {
      throw Error('Sides a, b must be positive and included angle C must lie between 0° and 180°');
    }
  }
  if (slug === 'attendance-calculator' || slug === 'attendance-planner') {
    if (v.att < 0 || v.total <= 0 || v.att > v.total || v.target <= 0 || v.target >= 100) {
      throw Error('Requires 0 ≤ attended ≤ held (held > 0), and target attendance strictly between 0% and 100%');
    }
  }
  if (slug === 'grade-percentage' || slug === 'grade-calculator') {
    if (v.obtained < 0 || v.maxmarks <= 0 || v.obtained > v.maxmarks) {
      throw Error('Marks obtained must lie between 0 and maximum marks (max > 0)');
    }
  }
  if (slug === 'probability-calculator-basic' && (v.p < 0 || v.p >= 1)) {
    throw Error('Enter a probability P(A) from 0 to less than 1 to compute finite odds');
  }
  if ((slug === 'compound-interest' || modeId === 'compound') && (v.n <= 0 || v.t < 0 || v.p < 0 || 1 + v.r / (100 * v.n) <= 0)) {
    throw Error('Principal and years must be nonnegative, and compounding frequency n must be positive');
  }
  if (slug === 'emi-calculator' && (v.p <= 0 || v.years <= 0 || v.r < 0)) {
    throw Error('Loan amount and term must be positive, and interest rate must be nonnegative');
  }
  if ((slug === 'sip-calculator' || slug === 'investment-growth-calculator') && (v.p < 0 || v.t <= 0 || v.r < 0)) {
    throw Error('Investment amount and rate must be nonnegative, and tenure t must be positive');
  }
  if ((slug === 'future-value-annuity' || modeId === 'fv_annuity' || modeId === 'pv_annuity') && (v.p < 0 || v.n <= 0 || v.r < 0)) {
    throw Error('Use nonnegative contribution and rate, and positive number of periods n > 0');
  }
  if ((slug === 'sequence-series-calculator' && (modeId === 'arithmetic' || modeId === 'geometric')) || slug === 'arithmetic-sequence' || slug === 'geometric-sequence') {
    if (!Number.isInteger(v.n) || v.n < 1) throw Error('Term count n must be a positive integer (n ≥ 1)');
  }
  if (slug === 'sequence-series-calculator' && modeId === 'infinite_gp') {
    if (Math.abs(v.r) >= 1) throw Error('An infinite geometric series converges if and only if |r| < 1');
  }
  if (slug === 'break-even' && (v.fixed < 0 || v.variable < 0 || v.price <= v.variable)) {
    throw Error('Selling price per unit must strictly exceed variable cost per unit');
  }
  if (slug === 'tip-calculator' && (v.bill < 0 || v.tip < 0 || !Number.isInteger(v.people) || v.people < 1)) {
    throw Error('Bill and tip must be nonnegative, and number of people must be a whole number ≥ 1');
  }
  if (slug === 'bmi-calculator' && (v.kg <= 0 || v.cm <= 0)) {
    throw Error('Body mass (kg) and height (cm) must both be positive numbers');
  }
  if (slug === 'z-score' && v.sd <= 0) throw Error('Standard deviation σ must be strictly positive (σ > 0)');
  if ((slug === 'standard-error' || slug === 'confidence-interval') && (v.sd < 0 || v.n < 1)) {
    throw Error('Standard deviation must be nonnegative and sample size n ≥ 1');
  }
  if (slug === 'carnot-efficiency-calculator' && (v.TC <= 0 || v.TH <= 0 || v.TC >= v.TH)) {
    throw Error('Absolute reservoir temperatures must satisfy 0 K < T_C < T_H');
  }
  if (slug === 'snells-law' && (v.n1 <= 0 || v.n2 <= 0 || Math.abs((v.n1 * Math.sin((v.ang * Math.PI) / 180)) / v.n2) > 1)) {
    const crit = v.n1 > v.n2 ? ((Math.asin(v.n2 / v.n1) * 180) / Math.PI).toFixed(2) : 'N/A';
    throw Error(`Total Internal Reflection occurs! Incident angle (${v.ang}°) exceeds the critical angle θ_c = ${crit}°.`);
  }
  if (slug === 'weighted-average' && (v.wa + v.wb + v.wc === 0)) {
    throw Error('Sum of weights (wa + wb + wc) cannot be zero');
  }
  if ((slug === '2d-geometry-calculator' && modeId === 'sector') || slug === 'sector-calculator' || slug === 'arc-length') {
    const ang = v.angle ?? v.deg;
    if (ang <= 0 || ang > 360) throw Error('Central angle θ must lie between 0° (exclusive) and 360° (inclusive)');
  }
  if (slug === 'bayesian-probability-calculator') {
    if ([v.pA, v.pBA, v.pBnotA].some(x => x < 0 || x > 1)) throw Error('All probabilities P(A), P(B|A), and P(B|¬A) must lie in [0, 1]');
    if (v.pBA * v.pA + v.pBnotA * (1 - v.pA) <= 0) throw Error('Marginal probability P(B) cannot be zero');
  }
  if (slug === 'investment-returns-calculator') {
    if (modeId === 'cagr' && (v.initial <= 0 || v.final < 0 || v.years <= 0)) throw Error('CAGR requires initial > 0, final ≥ 0, and years > 0');
    if (modeId === 'roi' && v.cost <= 0) throw Error('ROI requires initial investment cost > 0');
    if (modeId === 'rule72' && v.r <= 0) throw Error('Rule of 72 requires a positive annual growth rate r > 0');
  }
  if (slug === 'price-tax-calculator' && v.off !== undefined && (v.off < 0 || v.off > 100)) {
    throw Error('Discount percentage must lie between 0% and 100%');
  }
  if (slug === 'portfolio-risk-calculator' && (v.sd1 < 0 || v.sd2 < 0 || v.rho < -1 || v.rho > 1 || v.val <= 0)) {
    throw Error('Require non-negative volatilities, correlation ρ ∈ [−1, 1], and portfolio value > 0');
  }
  if (slug === 'gpa-cgpa-calculator' && (v.cgpa < 0 || v.cgpa > 10 || v.factor <= 0)) {
    throw Error('Require CGPA between 0 and 10 and positive multiplier');
  }
  if (slug === 'exam-target-calculator' && (v.weight <= 0 || v.weight >= 100 || v.current < 0 || v.current > 100 || v.target < 0 || v.target > 100)) {
    throw Error('Require percentages in [0, 100] and completed weight strictly between 0% and 100%');
  }
  // General physics positive mass / resistance / Kelvin checks
  if (t.category === 'Physics & Engineering') {
    for (const k of ['m', 'm1', 'm2', 'M', 'M1', 'M2']) {
      if (v[k] !== undefined && v[k] <= 0) throw Error(`Mass (${k}) must be strictly positive (> 0)`);
    }
    if (slug === 'moment-of-inertia-calculator' && modeId === 'hollow_cyl') {
      if (v.r1 < 0 || v.r2 <= 0 || v.r1 >= v.r2) throw Error('Hollow cylinder requires 0 ≤ inner radius r₁ < outer radius r₂');
    }
    for (const k of ['R', 'r', 'r2', 'L', 'L0', 'C', 'A', 'D', 'D1', 'D2', 'd', 'f', 'f0', 'T', 'l']) {
      if (v[k] !== undefined && v[k] <= 0 && !(slug === 'spring-force' || slug === 'work-calculator' || slug === 'work-energy-theorem-calculator')) {
        if (['R', 'r', 'r2', 'L', 'L0', 'C', 'A', 'D', 'D1', 'D2', 'f', 'f0', 'T', 'l'].includes(k)) {
          throw Error(`Physical parameter (${k}) must be strictly positive (> 0)`);
        }
      }
    }
    if (slug === 'elastic-inelastic-collision-calculator' && modeId === 'inelastic' && (v.e < 0 || v.e > 1)) {
      throw Error('Coefficient of restitution e must lie between 0 and 1');
    }
    if (slug === 'doppler-effect-calculator') {
      if (v.v <= 0 || v.f0 <= 0) throw Error('Wave speed v and source frequency f₀ must be positive');
      if (v.vs >= v.v) throw Error('Source speed v_s equals or exceeds wave speed v (supersonic shock wave — classical Doppler formula requires v_s < v)');
    }
    if ((slug === 'transformer-calculator' || slug === 'hydraulic-power-calculator') && (v.eff <= 0 || v.eff > 100)) {
      throw Error('Efficiency η must lie between 0% (exclusive) and 100% (inclusive)');
    }
    if (slug === 'power-factor-calculator' && (v.P <= 0 || v.pf1 <= 0 || v.pf1 > 1 || v.pf2 <= 0 || v.pf2 > 1 || v.pf1 > v.pf2)) {
      throw Error('Require P > 0 and power factors 0 < PF₁ ≤ PF₂ ≤ 1');
    }
    if (slug === 'three-phase-power-calculator' && (v.VL <= 0 || v.IL <= 0 || v.pf <= 0 || v.pf > 1)) {
      throw Error('Require V_L > 0, I_L > 0, and power factor cos(φ) in (0, 1]');
    }
    if (slug === 'heat-engine-efficiency-calculator' && (v.QH <= 0 || v.QC < 0 || v.QC > v.QH || v.TC <= 0 || v.TH <= v.TC)) {
      throw Error('Require Q_H > 0, 0 ≤ Q_C ≤ Q_H, and 0 K < T_C < T_H');
    }
    if (slug === 'resistance-network-calculator' || slug === 'resistor-series' || slug === 'resistor-parallel' || slug === 'capacitor-network-calculator') {
      if (val('a', 'b', 'c', 'c1', 'c2', 'c3').some(x => x <= 0)) {
        throw Error('All network component values (R or C) must be strictly positive (> 0)');
      }
    }
    if ((slug === 'ideal-gas' || slug === 'gas-process-calculator') && (v.T !== undefined && v.T < 0 || v.T1 !== undefined && v.T1 <= 0 || v.T2 !== undefined && v.T2 <= 0)) {
      throw Error('Absolute temperature must be positive Kelvin (T > 0 K)');
    }
  }
}

function overrideZeroRate(t, v, modeId = '') {
  const slug = t.canonicalSlug || t.slug;
  if (slug === 'emi-calculator' && v.r === 0) {
    const m = v.years * 12;
    return [{ label: 'Monthly EMI', value: v.p / m }, { label: 'Total paid', value: v.p }, { label: 'Total interest', value: 0 }];
  }
  if ((slug === 'sip-calculator' || (slug === 'investment-growth-calculator' && modeId === 'sip')) && v.r === 0) {
    return [{ label: 'Future value', value: v.p * 12 * v.t }, { label: 'Total invested', value: v.p * 12 * v.t }, { label: 'Estimated wealth gain', value: 0 }];
  }
  if ((slug === 'future-value-annuity' || (slug === 'time-value-of-money-calculator' && modeId === 'fv_annuity')) && v.r === 0) {
    return [{ label: 'Future value FV (Ordinary)', value: v.p * v.n }, { label: 'Total contributions', value: v.p * v.n }];
  }
  if ((slug === 'geometric-sequence' || (slug === 'sequence-series-calculator' && modeId === 'geometric')) && v.r === 1) {
    return [{ label: 'nth term (a_n)', value: v.a }, { label: 'Sum of n terms (S_n)', value: v.a * v.n }];
  }
  if (slug === 'slope-calculator' && v.x1 === v.x2) {
    const dist = Math.hypot(v.x2 - v.x1, v.y2 - v.y1);
    return [
      { label: 'Slope', value: `Undefined (vertical line x = ${fmt(v.x1)})` },
      { label: 'Rise', value: v.y2 - v.y1 },
      { label: 'Run', value: 0 },
      { label: 'Distance', value: dist },
      { label: 'Midpoint x', value: (v.x1 + v.x2) / 2 },
      { label: 'Midpoint y', value: (v.y1 + v.y2) / 2 },
      { label: 'Angle', value: 90, unit: '°' }
    ];
  }
  return null;
}

// --- GENERIC FORMULA & MULTIMODE RENDERER WITH SINGLE-PIPELINE EXPLAIN TRACE ---
function renderFormulaOrMultimode(def, initialModeId = '') {
  const isMulti = def.type === 'multimode' && Array.isArray(def.modes) && def.modes.length > 0;
  let activeModeId = initialModeId || def.defaultMode || (isMulti ? def.modes[0].id : 'default');

  function mountMode() {
    const activeMode = isMulti ? (def.modes.find(m => m.id === activeModeId) || def.modes[0]) : def;
    const modeTabsHtml = isMulti
      ? `<div class="mode-selector-wrap"><span class="mode-selector-label">Calculation Mode</span><div class="mode-tabs" role="tablist">${def.modes.map(m => `<button type="button" role="tab" aria-selected="${m.id === activeMode.id ? 'true' : 'false'}" class="mode-tab ${m.id === activeMode.id ? 'active' : ''}" data-mode-id="${esc(m.id)}">${esc(m.label)}</button>`).join('')}</div></div>`
      : '';
    const fieldsHtml = activeMode.fields.map(renderFieldControl).join('');
    $('#calculator-app').innerHTML = `${modeTabsHtml}<div class="control-grid">${fieldsHtml}</div>${actionBarHtml()}`;

    // Update formula block on page dynamically when mode changes
    const fBlock = $('.formula-block');
    if (fBlock && activeMode.formula) fBlock.textContent = activeMode.formula;

    $$('[data-mode-id]', '#calculator-app').forEach(btn => {
      btn.onclick = () => {
        activeModeId = btn.dataset.modeId;
        mountMode();
      };
    });

    bind(() => evalSafe(() => {
      const { v, inputRecords } = numsWithUnits(activeMode.fields);
      validateFormula(def, v, activeMode.id);
      const zeroOverride = overrideZeroRate(def, v, activeMode.id);
      let res, primaryTrace;
      if (zeroOverride) {
        res = zeroOverride;
        primaryTrace = {
          symbolic: activeMode.formula || def.formula,
          substituted: 'Special boundary case evaluated directly',
          steps: res.map(r => ({ op: r.label, substituted: r.label, value: r.value }))
        };
      } else {
        const traces = activeMode.outputs.map(o => ({
          label: o.label,
          unit: o.unit,
          trace: traceCalculate(o.expr, v)
        }));
        res = traces.map(t => ({ label: t.label, value: t.trace.value, unit: t.unit }));
        primaryTrace = traces[0].trace;
        // Include secondary outputs in trace steps if multiple outputs exist
        if (traces.length > 1) {
          primaryTrace.steps = [
            ...primaryTrace.steps,
            ...traces.slice(1).map(t => ({ op: `Output: ${t.label}`, substituted: `${t.trace.symbolic} = ${t.trace.substituted}`, value: t.trace.value }))
          ];
        }
      }
      const explanation = {
        modeLabel: isMulti ? activeMode.label : '',
        inputs: inputRecords,
        formula: activeMode.formula || def.formula || primaryTrace.symbolic,
        principle: `${def.category} › ${def.subcategory}`,
        substituted: `${res[0].label} = ${primaryTrace.substituted}`,
        steps: primaryTrace.steps,
        finalSummary: `${res[0].label} = ${typeof res[0].value === 'number' ? fmt(res[0].value) : res[0].value}${res[0].unit ? ' ' + res[0].unit : ''}`,
        assumptions: activeMode.note || def.note || 'Evaluated in canonical SI / domain units using IEEE-754 double-precision arithmetic.'
      };
      updateResults(res, explanation);
    }));
  }

  mountMode();
}

// --- HELPER: 2D MATRIX TABLE FORMATTER & CURVE CANVAS PLOTTER ---
function formatMatrixHtml(M) {
  return `<table class="matrix-table" aria-label="Matrix result"><tbody>${M.map(r => `<tr>${r.map(v => `<td>${esc(typeof v === 'number' ? fmt(v) : v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function drawMiniPlot(canvasId, fnList, xMin, xMax, opts = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof canvas.getContext !== 'function') return;
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(280, rect.width || 420), h = Math.max(180, rect.height || 230);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  const c = canvas.getContext('2d');
  c.scale(dpr, dpr);
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--plot-bg').trim() || '#ffffff';
  const gridCol = getComputedStyle(document.documentElement).getPropertyValue('--grid').trim() || '#e5e8f2';
  const mutedCol = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#565b73';
  c.fillStyle = bg;
  c.fillRect(0, 0, w, h);

  // Sample y values to auto-scale y-axis
  const samples = 200;
  let yMin = Infinity, yMax = -Infinity;
  const curves = fnList.map(fnObj => {
    const pts = [];
    for (let i = 0; i <= samples; i++) {
      const x = xMin + ((xMax - xMin) * i) / samples;
      let y = NaN;
      try { y = fnObj.fn(x); } catch { y = NaN; }
      if (Number.isFinite(y) && Math.abs(y) < 1e6) {
        if (y < yMin) yMin = y;
        if (y > yMax) yMax = y;
      }
      pts.push({ x, y });
    }
    return { ...fnObj, pts };
  });
  if (!Number.isFinite(yMin) || !Number.isFinite(yMax)) { yMin = -5; yMax = 5; }
  if (Math.abs(yMax - yMin) < 1e-6) { yMin -= 2; yMax += 2; }
  const padY = 0.14 * (yMax - yMin);
  yMin -= padY; yMax += padY;
  if (opts.includeZeroY) { yMin = Math.min(yMin, -0.1 * (yMax - yMin)); yMax = Math.max(yMax, 0.1 * (yMax - yMin)); }

  const px = x => ((x - xMin) / (xMax - xMin)) * (w - 48) + 34;
  const py = y => h - 24 - ((y - yMin) / (yMax - yMin)) * (h - 38);

  // Grid & Axes
  c.strokeStyle = gridCol;
  c.lineWidth = 1;
  c.font = '10px system-ui';
  c.fillStyle = mutedCol;
  for (let i = 0; i <= 4; i++) {
    const gx = xMin + ((xMax - xMin) * i) / 4;
    const xPix = px(gx);
    c.beginPath(); c.moveTo(xPix, 10); c.lineTo(xPix, h - 22); c.stroke();
    c.fillText(fmt(gx, 2), xPix - 10, h - 8);
    const gy = yMin + ((yMax - yMin) * i) / 4;
    const yPix = py(gy);
    c.beginPath(); c.moveTo(34, yPix); c.lineTo(w - 14, yPix); c.stroke();
    c.fillText(fmt(gy, 2), 2, yPix + 3);
  }
  // Zero axes
  c.strokeStyle = '#94a3b8';
  c.lineWidth = 1.3;
  if (xMin <= 0 && xMax >= 0) { c.beginPath(); c.moveTo(px(0), 10); c.lineTo(px(0), h - 22); c.stroke(); }
  if (yMin <= 0 && yMax >= 0) { c.beginPath(); c.moveTo(34, py(0)); c.lineTo(w - 14, py(0)); c.stroke(); }

  // Optional shaded integral region
  if (opts.shade && curves[0]) {
    const { a, b } = opts.shade;
    const y0 = py(Math.max(yMin, Math.min(yMax, 0)));
    c.fillStyle = 'rgba(91, 75, 232, 0.18)';
    c.beginPath();
    let started = false;
    for (const p of curves[0].pts) {
      if (p.x >= Math.min(a, b) && p.x <= Math.max(a, b) && Number.isFinite(p.y)) {
        if (!started) { c.moveTo(px(p.x), y0); started = true; }
        c.lineTo(px(p.x), py(p.y));
      }
    }
    if (started) { c.lineTo(px(Math.max(a, b)), y0); c.closePath(); c.fill(); }
  }

  // Draw curves
  const palette = ['#5b4be8', '#e86f38', '#129490', '#d33f6a'];
  curves.forEach((cv, idx) => {
    c.strokeStyle = cv.color || palette[idx % palette.length];
    c.lineWidth = cv.dashed ? 1.8 : 2.4;
    c.setLineDash(cv.dashed ? [5, 4] : []);
    c.beginPath();
    let drawing = false;
    for (let i = 0; i < cv.pts.length; i++) {
      const { x, y } = cv.pts[i];
      if (!Number.isFinite(y)) { drawing = false; continue; }
      const xx = px(x), yy = py(y);
      if (yy < -50 || yy > h + 50) { drawing = false; continue; }
      if (!drawing) { c.moveTo(xx, yy); drawing = true; }
      else c.lineTo(xx, yy);
    }
    c.stroke();
    c.setLineDash([]);
  });
}

// ============================================================================
// SPECIALIZED RENDERERS (MATHEMATICS, ALGEBRA, CALCULUS, PHYSICS, STATS, FINANCE, COMPUTING)
// ============================================================================

function scientific() {
  $('#calculator-app').innerHTML = `${mathExprControl('Mathematical Expression', 'expr', 'sin(pi/6)^2 + cos(pi/6)^2', { keypadOpen: true, vars: [] })}
    <div class="angle-line"><span>Trigonometric Angle Mode</span><div class="segmented" role="group" aria-label="Angle mode"><button type="button" class="selected" data-angle="rad">Radians (rad)</button><button type="button" data-angle="deg">Degrees (°)</button></div></div>
    <div class="example-row"><span>Try:</span>
      <button type="button" class="chip" data-ex="sin(pi/6)^2 + cos(pi/6)^2">sin²(π/6) + cos²(π/6)</button>
      <button type="button" class="chip" data-ex="√9 + 2^8">√9 + 2⁸</button>
      <button type="button" class="chip" data-ex="comb(10, 3) * 0.5^3">C(10,3)×0.5³</button>
      <button type="button" class="chip" data-ex="ln(e^3) + log(1000, 10)">ln(e³) + log₁₀(1000)</button>
    </div>${actionBarHtml()}`;
  let degrees = false;
  $$('[data-angle]').forEach(b => (b.onclick = () => {
    $$('[data-angle]').forEach(x => x.classList.toggle('selected', x === b));
    degrees = b.dataset.angle === 'deg';
    calc();
  }));
  $$('[data-ex]').forEach(b => (b.onclick = () => {
    $('[data-field=expr]').value = b.dataset.ex;
    wireMathExprControls(calc);
    calc();
  }));
  function calc() {
    evalSafe(() => {
      const exprStr = $('[data-field=expr]').value;
      const tr = traceCalculate(exprStr, {}, { degrees });
      updateResults([{ label: 'Result', value: tr.value }], {
        modeLabel: degrees ? 'Degrees (°)' : 'Radians (rad)',
        inputs: [{ label: 'Expression', rawVal: exprStr, selectedUnit: degrees ? 'deg mode' : 'rad mode' }],
        formula: tr.symbolic,
        substituted: tr.substituted,
        steps: tr.steps,
        finalSummary: `${tr.symbolic} = ${fmt(tr.value)}`
      });
    });
  }
  bind(calc);
}

function equation() {
  const examples = ['x^2 - 5*x + 6 = 0', '(x - 2.003)^2 = 0', 'sin(x) = 0.5', 'x(x + 1) = 12'];
  $('#calculator-app').innerHTML = `${mathExprControl('Single-Variable Equation in x', 'equation', examples[0], { vars: ['x'] })}
    <div class="control-grid">${input('Search interval minimum', 'lo', -40)}${input('Search interval maximum', 'hi', 40)}</div>
    <div class="angle-line"><span>Angle mode for trig equations</span><div class="segmented"><button type="button" class="selected" data-angle="rad">Radians</button><button type="button" data-angle="deg">Degrees</button></div></div>
    <div class="example-row"><span>Try:</span>${examples.map(e => `<button type="button" class="chip" data-ex="${esc(e)}">${esc(e)}</button>`).join('')}</div>${actionBarHtml()}`;
  let degrees = false;
  $$('[data-angle]').forEach(b => (b.onclick = () => {
    $$('[data-angle]').forEach(x => x.classList.toggle('selected', x === b));
    degrees = b.dataset.angle === 'deg';
    calc();
  }));
  $$('[data-ex]').forEach(b => (b.onclick = () => {
    $('[data-field=equation]').value = b.dataset.ex;
    wireMathExprControls(calc);
    calc();
  }));
  function calc() {
    evalSafe(() => {
      const eq = $('[data-field=equation]').value;
      const { lo, hi } = nums(['lo', 'hi']);
      if (!(lo < hi) || hi - lo > 10000) throw Error('Choose a valid search interval with lo < hi and width ≤ 10,000');
      const roots = solveRoots(eq, 'x', lo, hi, { degrees });
      const items = roots.length
        ? roots.slice(0, 20).map((x, i) => ({ label: `Real root x_${i + 1}`, value: x }))
        : [{ label: 'Search result', value: 'No real root found in this interval' }];
      updateResults(items, {
        modeLabel: `Numerical Root Finder on [${lo}, ${hi}]`,
        inputs: [{ label: 'Equation', rawVal: eq }, { label: 'Interval', rawVal: `[${lo}, ${hi}]` }],
        formula: 'f(x) − g(x) = 0 solved via 4,000-panel sign-change bisection + golden-section extremum search',
        substituted: `Scanning [${lo}, ${hi}] with step Δx = ${fmt((hi - lo) / 4000)}`,
        steps: roots.length
          ? roots.slice(0, 10).map((r, idx) => `Root ${idx + 1}: x ≈ ${fmt(r)} verified with |LHS − RHS| < 10⁻⁵`)
          : ['No sign change or zero-touching extremum detected on the interval'],
        finalSummary: roots.length ? `Found ${roots.length} real root(s): ${roots.map(fmt).join(', ')}` : 'No real roots in interval',
        assumptions: 'Numerical root finding over a bounded interval; for complex roots of polynomials, use the Quadratic or Polynomial Solver.'
      });
    });
  }
  bind(calc);
}

function quadratic() {
  $('#calculator-app').innerHTML = `<div class="control-grid">${input('Quadratic coefficient a (x²)', 'a', 1)}${input('Linear coefficient b (x)', 'b', -5)}${input('Constant term c', 'c', 6)}</div>${actionBarHtml()}`;
  bind(() => evalSafe(() => {
    const { a, b, c } = nums(['a', 'b', 'c']);
    const roots = solveQuadratic(a, b, c);
    const disc = b * b - 4 * a * c;
    const vx = a !== 0 ? -b / (2 * a) : 0;
    const vy = a !== 0 ? a * vx * vx + b * vx + c : c;
    const items = roots.map((r, i) => ({ label: roots.length === 1 ? 'Root x' : `Root x_${i + 1}`, value: r }))
      .concat([
        { label: 'Discriminant Δ (b² − 4ac)', value: disc },
        ...(a !== 0 ? [{ label: 'Parabola vertex (h, k)', value: `(${fmt(vx)}, ${fmt(vy)})` }, { label: 'Axis of symmetry', value: `x = ${fmt(vx)}` }] : [])
      ]);
    updateResults(items, {
      inputs: [{ label: 'a', rawVal: a }, { label: 'b', rawVal: b }, { label: 'c', rawVal: c }],
      formula: 'x = (−b ± √(b² − 4ac)) / (2a)',
      substituted: `Δ = (${fmt(b)})² − 4(${fmt(a)})(${fmt(c)}) = ${fmt(disc)}`,
      steps: [
        `Compute discriminant Δ = b² − 4ac = ${fmt(b * b)} − ${fmt(4 * a * c)} = ${fmt(disc)}`,
        disc > 0 ? 'Since Δ > 0, two distinct real roots exist (evaluated via stable Citardauq formula).' : disc === 0 ? 'Since Δ = 0, one repeated real root x = −b/(2a) exists.' : 'Since Δ < 0, two complex conjugate roots −b/(2a) ± i√(−Δ)/(2a) exist.',
        ...(a !== 0 ? [`Vertex coordinates: h = −b/(2a) = ${fmt(vx)}, k = f(h) = ${fmt(vy)}`] : [])
      ],
      finalSummary: `Solutions: ${roots.join(', ')}`
    });
  }));
}

function expression() {
  $('#calculator-app').innerHTML = `${mathExprControl('Algebraic Expression', 'expr', '2*x^3 - 4*x*y + 7', { vars: ['x', 'y', 'z'] })}
    <div id="dyn-vars" class="control-grid"></div>${actionBarHtml()}`;
  const varValues = { x: 3, y: 2, z: 1, a: 1, b: 2, c: 3, t: 1, n: 5 };
  function syncVarInputs() {
    const raw = $('[data-field=expr]')?.value || '';
    let vars = ['x'];
    try {
      const found = extractVariables(compile(raw, { allowAmbiguousInversePower: true }));
      if (found.length) vars = found;
    } catch {}
    const box = $('#dyn-vars');
    if (!box) return;
    box.innerHTML = vars.map(vName => input(`Value of variable ${vName}`, `var_${vName}`, varValues[vName] ?? 1)).join('');
    $$('input', box).forEach(inp => inp.addEventListener('input', () => {
      const k = inp.dataset.field.replace(/^var_/, '');
      varValues[k] = Number(inp.value);
      calc();
    }));
  }
  function calc() {
    evalSafe(() => {
      const raw = $('[data-field=expr]').value;
      const ast = compile(raw);
      const simplified = simplifyAst(ast);
      const vars = extractVariables(ast);
      const env = {};
      for (const vName of vars) {
        const node = $(`[data-field="var_${vName}"]`);
        env[vName] = node ? Number(node.value) : (varValues[vName] ?? 1);
        if (!Number.isFinite(env[vName])) throw Error(`Enter a valid number for variable ${vName}`);
      }
      const tr = traceCalculate(raw, env);
      updateResults([
        { label: 'Evaluated numeric result', value: tr.value },
        { label: 'Simplified symbolic form', value: formatAstText(simplified) }
      ], {
        inputs: Object.entries(env).map(([k, val]) => ({ label: `Variable ${k}`, rawVal: val })),
        formula: formatAstText(simplified),
        substituted: tr.substituted,
        steps: tr.steps,
        finalSummary: `${formatAstText(simplified)} = ${fmt(tr.value)}`
      });
    });
  }
  $('[data-field=expr]')?.addEventListener('input', syncVarInputs);
  syncVarInputs();
  bind(calc);
}

// --- SHARED HELPERS FOR SPECIALIZED RENDERERS ---
function parseNumberList(raw) {
  const arr = String(raw || '').trim().split(/[\s,;]+/).filter(Boolean).map(Number);
  if (arr.some(v => !Number.isFinite(v))) throw Error('Contains invalid numeric entry');
  return arr;
}

function parseMatrixText(raw) {
  const rows = String(raw || '').trim().split(/\n+/).map(line => parseNumberList(line)).filter(r => r.length > 0);
  if (!rows.length) throw Error('Enter at least one matrix row');
  const cols = rows[0].length;
  if (rows.some(r => r.length !== cols)) throw Error('All matrix rows must have the same number of columns');
  return rows;
}

function extGcd(a, b) {
  let oldR = Math.abs(Math.trunc(a)), r = Math.abs(Math.trunc(b));
  let oldS = 1, s = 0, oldT = 0, t = 1;
  const steps = [];
  while (r !== 0) {
    const q = Math.trunc(oldR / r);
    const nextR = oldR - q * r;
    steps.push(`${oldR} = ${q}·${r} + ${nextR}`);
    oldR = r; r = nextR;
    const nextS = oldS - q * s; oldS = s; s = nextS;
    const nextT = oldT - q * t; oldT = t; t = nextT;
  }
  return { g: oldR, x: a < 0 ? -oldS : oldS, y: b < 0 ? -oldT : oldT, steps };
}

function mean_suite() {
  $('#calculator-app').innerHTML = `${textArea('Dataset values (comma or space separated)', 'data', '4, 8, 15, 16, 23, 42', 2)}
    ${input('Optional weights (same count as dataset, or leave blank for equal weights)', 'weights', '1, 1, 2, 2, 3, 1', 'text')}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const arr = parseNumberList($('[data-field=data]').value);
    if (!arr.length) throw Error('Enter at least one numeric value');
    const wRaw = $('[data-field=weights]').value.trim();
    const n = arr.length;
    const sum = arr.reduce((a, b) => a + b, 0);
    const arith = sum / n;
    let wMean = arith;
    if (wRaw) {
      const w = parseNumberList(wRaw);
      if (w.length !== n) throw Error(`Weight count (${w.length}) must match data count (${n})`);
      const wSum = w.reduce((a, b) => a + b, 0);
      if (wSum === 0) throw Error('Sum of weights cannot be zero');
      wMean = arr.reduce((acc, v, i) => acc + v * w[i], 0) / wSum;
    }
    const allPositive = arr.every(v => v > 0);
    const geom = allPositive ? Math.exp(arr.reduce((a, b) => a + Math.log(b), 0) / n) : NaN;
    const nonZero = arr.every(v => v !== 0);
    const harm = nonZero ? n / arr.reduce((a, b) => a + 1 / b, 0) : NaN;
    const rms = Math.sqrt(arr.reduce((a, b) => a + b * b, 0) / n);
    updateResults([
      { label: 'Arithmetic Mean (x̄)', value: arith },
      { label: 'Weighted Mean', value: wMean },
      { label: 'Geometric Mean (G)', value: Number.isFinite(geom) ? geom : 'Requires all xᵢ > 0' },
      { label: 'Harmonic Mean (H)', value: Number.isFinite(harm) ? harm : 'Undefined when xᵢ = 0' },
      { label: 'Root Mean Square (RMS / Quadratic Mean)', value: rms },
      { label: 'Count (n) & Sum (Σx)', value: `n = ${n}, Σx = ${fmt(sum)}` }
    ], {
      inputs: [{ label: 'Dataset', rawVal: arr.join(', ') }, { label: 'Weights', rawVal: wRaw || 'Equal weights' }],
      formula: 'x̄ = (1/n)Σxᵢ, x̄_w = Σwᵢxᵢ/Σwᵢ, G = (Πxᵢ)^(1/n), H = n/Σ(1/xᵢ), RMS = √((1/n)Σxᵢ²)',
      substituted: `n = ${n}, Σx = ${fmt(sum)}`,
      steps: [
        `Arithmetic Mean = ${fmt(sum)} / ${n} = ${fmt(arith)}`,
        `Weighted Mean = ${fmt(wMean)}`,
        `Geometric Mean = ${Number.isFinite(geom) ? fmt(geom) : 'N/A (non-positive values)'}`,
        `Harmonic Mean = ${Number.isFinite(harm) ? fmt(harm) : 'N/A (zero values)'}`,
        `Root Mean Square = ${fmt(rms)}`
      ],
      finalSummary: `Arithmetic Mean = ${fmt(arith)}, Geometric Mean = ${Number.isFinite(geom) ? fmt(geom) : 'N/A'}, Harmonic Mean = ${Number.isFinite(harm) ? fmt(harm) : 'N/A'}`
    });
  });
  bind(calc);
}

function number_theory(t, initialMode) {
  const modeMap = { 'gcd-calculator': 'gcd_lcm', 'lcm-calculator': 'gcd_lcm', 'prime-checker': 'prime', 'prime-factorization-calculator': 'prime', 'modulo-calculator': 'mod', 'gcd': 'gcd_lcm', 'lcm': 'gcd_lcm', 'prime': 'prime', 'modulo': 'mod' };
  let active = modeMap[initialMode] || 'gcd_lcm';
  $('#calculator-app').innerHTML = `
    <div class="mode-selector-wrap"><span class="mode-selector-label">Number Theory Mode</span><div class="mode-tabs" role="tablist">
      <button type="button" class="mode-tab ${active === 'gcd_lcm' ? 'active' : ''}" data-nt="gcd_lcm">GCD, LCM & Bézout</button>
      <button type="button" class="mode-tab ${active === 'prime' ? 'active' : ''}" data-nt="prime">Prime Factorization & Divisors</button>
      <button type="button" class="mode-tab ${active === 'mod' ? 'active' : ''}" data-nt="mod">Modular Arithmetic & Inverse</button>
    </div></div>
    <div id="nt-body"></div>${actionBarHtml()}`;
  function renderMode() {
    const body = $('#nt-body');
    if (active === 'gcd_lcm') {
      body.innerHTML = `${input('Integers (2 or more comma-separated integers)', 'nums', '48, 180, 120', 'text')}`;
    } else if (active === 'prime') {
      body.innerHTML = `${input('Integer n (n ≥ 2)', 'n', 360)}`;
    } else {
      body.innerHTML = `<div class="control-grid">${input('Dividend / Base (a)', 'a', 17)}${input('Modulus (m > 0)', 'm', 43)}${input('Exponent (e, for a^e mod m)', 'e', 5)}</div>`;
    }
    bind(calc);
  }
  function calc() {
    evalSafe(() => {
      if (active === 'gcd_lcm') {
        const rawArr = parseNumberList($('[data-field=nums]').value);
        if (rawArr.length < 2 || rawArr.some(v => !Number.isInteger(v))) throw Error('Enter at least two integers');
        const g = known.gcd(...rawArr);
        const l = known.lcm(...rawArr);
        const bez = extGcd(rawArr[0], rawArr[1]);
        updateResults([
          { label: 'Greatest Common Divisor (GCD)', value: g },
          { label: 'Least Common Multiple (LCM)', value: l },
          { label: `Bézout Identity for (${rawArr[0]}, ${rawArr[1]})`, value: `${rawArr[0]}·(${bez.x}) + ${rawArr[1]}·(${bez.y}) = ${bez.g}` }
        ], {
          inputs: [{ label: 'Integers', rawVal: rawArr.join(', ') }],
          formula: 'gcd(a,b) = gcd(|a|,|b|) ≥ 0 via Euclidean algorithm; gcd(a,0) = |a|; lcm(a,b) = |a·b|/gcd(a,b) (lcm(a,0) = 0)',
          substituted: `gcd(${rawArr.join(', ')}) = ${g}, lcm(${rawArr.join(', ')}) = ${l}`,
          steps: bez.steps.length ? bez.steps : [`Direct zero-operand identity: gcd(${rawArr[0]}, ${rawArr[1]}) = ${g}`],
          finalSummary: `GCD = ${g}, LCM = ${l}`,
          assumptions: 'By standard number-theory convention, GCD and LCM are non-negative: gcd(−a, b) = gcd(a, b), gcd(a, 0) = |a|, gcd(0, 0) = 0, and lcm(a, 0) = 0.'
        });
      } else if (active === 'prime') {
        const rawN = Number($('[data-field=n]').value);
        if (!Number.isInteger(rawN)) throw Error('Enter a valid whole integer n');
        const n = rawN;
        if (n < 2) {
          updateResults([
            { label: 'Primality Classification', value: 'Not Prime (prime numbers are integers n ≥ 2)' },
            { label: 'Number Tested', value: n }
          ], {
            inputs: [{ label: 'Integer n', rawVal: n }],
            formula: 'Primality definition: integer n ≥ 2 with no positive divisors other than 1 and n',
            substituted: `n = ${n} < 2 ⇒ Not Prime`,
            steps: [`Tested integer n = ${n}`, 'Integers less than 2 (including 0, 1, and negatives) are neither prime nor composite.'],
            finalSummary: `${n} is Not Prime`
          });
          return;
        }
        const pf = primeFactors(n);
        const primeBool = isPrime(n);
        const canonical = pf.map(([p, e]) => (e > 1 ? `${p}^${e}` : `${p}`)).join(' × ');
        const divCount = pf.reduce((acc, [, e]) => acc * (e + 1), 1);
        const divSum = pf.reduce((acc, [p, e]) => acc * ((p ** (e + 1) - 1) / (p - 1)), 1);
        const totient = Math.round(pf.reduce((acc, [p]) => acc * (1 - 1 / p), n));
        updateResults([
          { label: 'Primality Classification', value: primeBool ? 'Prime Number' : 'Composite Number' },
          { label: 'Prime Factorization', value: canonical },
          { label: "Euler's Totient φ(n)", value: totient },
          { label: 'Divisor Count d(n) & Sum σ(n)', value: `d(n) = ${divCount},  σ(n) = ${divSum}` }
        ], {
          inputs: [{ label: 'Integer n', rawVal: n }],
          formula: 'n = Π pᵢ^(eᵢ), d(n) = Π(eᵢ+1), φ(n) = n Π(1 − 1/pᵢ)',
          substituted: `${n} = ${canonical}`,
          steps: [`Canonical prime power decomposition: ${canonical}`, `Total positive divisors: ${divCount}`, `Euler totient φ(${n}) = ${totient}`],
          finalSummary: `${n} = ${canonical} (${primeBool ? 'Prime' : 'Composite'})`
        });
      } else {
        const a = Math.round(Number($('[data-field=a]').value));
        const m = Math.round(Number($('[data-field=m]').value));
        const e = Math.round(Number($('[data-field=e]').value));
        if (m <= 0) throw Error('Modulus m must be positive');
        const rem = ((a % m) + m) % m;
        const bez = extGcd(rem, m);
        const inv = bez.g === 1 ? ((bez.x % m) + m) % m : null;
        let modPow = 1n, base = BigInt(rem), exp = BigInt(Math.max(0, e)), modB = BigInt(m);
        while (exp > 0n) { if (exp & 1n) modPow = (modPow * base) % modB; base = (base * base) % modB; exp >>= 1n; }
        updateResults([
          { label: 'Canonical Remainder (a mod m)', value: rem },
          { label: 'Modular Multiplicative Inverse (a⁻¹ mod m)', value: inv !== null ? inv : `Does not exist (gcd(${a}, ${m}) = ${bez.g} ≠ 1)` },
          { label: `Modular Exponentiation (${a}^${e} mod ${m})`, value: Number(modPow) }
        ], {
          inputs: [{ label: 'a', rawVal: a }, { label: 'm', rawVal: m }, { label: 'e', rawVal: e }],
          formula: 'a ≡ r (mod m), a·a⁻¹ ≡ 1 (mod m)',
          substituted: `${a} mod ${m} = ${rem}`,
          steps: [...bez.steps, inv !== null ? `Modular inverse: ${a}⁻¹ ≡ ${inv} (mod ${m})` : 'No modular inverse since gcd ≠ 1'],
          finalSummary: `${a} mod ${m} = ${rem}`
        });
      }
    });
  }
  $$('[data-nt]').forEach(btn => btn.addEventListener('click', () => {
    $$('[data-nt]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    active = btn.dataset.nt;
    renderMode();
  }));
  renderMode();
}

function complex_calc() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input('z₁ Real part (a₁)', 'a1', 3)}${input('z₁ Imaginary part (b₁)', 'b1', 4)}
    ${input('z₂ Real part (a₂)', 'a2', 1)}${input('z₂ Imaginary part (b₂)', 'b2', -2)}
    ${input('De Moivre Power / Root integer (n)', 'n', 3)}</div>${actionBarHtml()}`;
  const fmtC = (r, im) => `${fmt(r)} ${im >= 0 ? '+' : '−'} ${fmt(Math.abs(im))}i`;
  const calc = () => evalSafe(() => {
    const a1 = Number($('[data-field=a1]').value), b1 = Number($('[data-field=b1]').value);
    const a2 = Number($('[data-field=a2]').value), b2 = Number($('[data-field=b2]').value);
    const n = Math.max(1, Math.round(Number($('[data-field=n]').value) || 2));
    const r1 = Math.hypot(a1, b1), theta1 = Math.atan2(b1, a1);
    const denom = a2 * a2 + b2 * b2;
    const prodR = a1 * a2 - b1 * b2, prodI = a1 * b2 + b1 * a2;
    const quotR = denom ? (a1 * a2 + b1 * b2) / denom : NaN;
    const quotI = denom ? (b1 * a2 - a1 * b2) / denom : NaN;
    const powR = (r1 ** n) * Math.cos(n * theta1), powI = (r1 ** n) * Math.sin(n * theta1);
    const rootR = (r1 ** (1 / n)) * Math.cos(theta1 / n), rootI = (r1 ** (1 / n)) * Math.sin(theta1 / n);
    updateResults([
      { label: 'z₁ Polar & Exponential Form', value: `${fmt(r1)} ∠ ${fmt(theta1 * 180 / Math.PI)}° = ${fmt(r1)}·e^(i·${fmt(theta1)} rad)` },
      { label: 'Addition (z₁ + z₂) & Subtraction (z₁ − z₂)', value: `${fmtC(a1 + a2, b1 + b2)}  |  ${fmtC(a1 - a2, b1 - b2)}` },
      { label: 'Multiplication (z₁ · z₂)', value: fmtC(prodR, prodI) },
      { label: 'Division (z₁ / z₂)', value: denom ? fmtC(quotR, quotI) : 'Undefined (z₂ = 0)' },
      { label: `De Moivre Power (z₁^${n})`, value: fmtC(powR, powI) },
      { label: `Principal ${n}-th Root of z₁`, value: fmtC(rootR, rootI) }
    ], {
      inputs: [{ label: 'z₁', rawVal: fmtC(a1, b1) }, { label: 'z₂', rawVal: fmtC(a2, b2) }, { label: 'n', rawVal: n }],
      formula: '|z₁| = √(a₁² + b₁²), arg(z₁) = atan2(b₁, a₁), z₁^n = |z₁|^n e^(i·n·θ₁)',
      substituted: `|z₁| = ${fmt(r1)}, θ₁ = ${fmt(theta1)} rad`,
      steps: [`z₁·z₂ = (${a1}·${a2} − ${b1}·${b2}) + (${a1}·${b2} + ${b1}·${a2})i = ${fmtC(prodR, prodI)}`, `z₁^${n} = ${fmt(r1 ** n)} ∠ ${fmt(n * theta1 * 180 / Math.PI)}° = ${fmtC(powR, powI)}`],
      finalSummary: `z₁·z₂ = ${fmtC(prodR, prodI)}, |z₁| = ${fmt(r1)}`
    });
  });
  bind(calc);
}

function inequality_calc() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${dropdown('Inequality Type', 'kind', [['quad', 'Quadratic (a·x² + b·x + c ⋚ 0)'], ['abs', 'Absolute Value (|a·x + b| ⋚ c)'], ['lin', 'Linear (a·x + b ⋚ c)']], 'quad')}
    ${dropdown('Relation Operator', 'op', [['<', '< (Strictly less than)'], ['<=', '≤ (Less than or equal)'], ['>', '> (Strictly greater than)'], ['>=', '≥ (Greater than or equal)']], '<')}
    ${input('Coefficient a', 'a', 1)}${input('Coefficient b', 'b', -5)}${input('Constant c', 'c', 6)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const kind = $('[data-field=kind]').value, op = $('[data-field=op]').value;
    const a = Number($('[data-field=a]').value), b = Number($('[data-field=b]').value), c = Number($('[data-field=c]').value);
    const closedL = op.includes('=') ? '[' : '(', closedR = op.includes('=') ? ']' : ')';
    let interval = '', crit = '', signChart = '';
    if (kind === 'lin') {
      if (a === 0) throw Error('Coefficient a cannot be 0');
      const bound = (c - b) / a;
      const flip = a < 0;
      const effLess = (op.startsWith('<') && !flip) || (op.startsWith('>') && flip);
      interval = effLess ? `(-∞, ${fmt(bound)}${closedR}` : `${closedL}${fmt(bound)}, ∞)`;
      crit = `x = ${fmt(bound)}`;
      signChart = `Linear boundary at x = ${fmt(bound)}${flip ? ' (inequality direction flipped due to a < 0)' : ''}`;
    } else if (kind === 'abs') {
      if (a === 0) throw Error('Coefficient a cannot be 0');
      if (c < 0) {
        interval = op.startsWith('<') ? '∅ (No real solution)' : '(-∞, ∞) (All real numbers)';
        crit = 'None (c < 0)';
        signChart = '|ax + b| ≥ 0 for all real x';
      } else {
        const r1 = (-c - b) / a, r2 = (c - b) / a;
        const lo = Math.min(r1, r2), hi = Math.max(r1, r2);
        crit = `x₁ = ${fmt(lo)}, x₂ = ${fmt(hi)}`;
        interval = op.startsWith('<') ? `${closedL}${fmt(lo)}, ${fmt(hi)}${closedR}` : `(-∞, ${fmt(lo)}${closedR} ∪ ${closedL}${fmt(hi)}, ∞)`;
        signChart = `Inside (${fmt(lo)}, ${fmt(hi)}): |ax+b| < ${fmt(c)}; Outside: |ax+b| > ${fmt(c)}`;
      }
    } else {
      if (a === 0) throw Error('Quadratic coefficient a cannot be 0');
      const disc = b * b - 4 * a * c;
      if (disc < 0) {
        const alwaysPos = a > 0;
        const sat = (op.startsWith('>') && alwaysPos) || (op.startsWith('<') && !alwaysPos);
        interval = sat ? '(-∞, ∞)' : '∅ (No real solution)';
        crit = `No real roots (Δ = ${fmt(disc)} < 0)`;
        signChart = `Parabola is strictly ${alwaysPos ? 'positive' : 'negative'} on ℝ`;
      } else {
        const r1 = (-b - Math.sqrt(disc)) / (2 * a), r2 = (-b + Math.sqrt(disc)) / (2 * a);
        const lo = Math.min(r1, r2), hi = Math.max(r1, r2);
        crit = `r₁ = ${fmt(lo)}, r₂ = ${fmt(hi)}`;
        const wantSameSignAsA = (op.startsWith('>') && a > 0) || (op.startsWith('<') && a < 0);
        interval = wantSameSignAsA ? `(-∞, ${fmt(lo)}${closedR} ∪ ${closedL}${fmt(hi)}, ∞)` : `${closedL}${fmt(lo)}, ${fmt(hi)}${closedR}`;
        signChart = `(-∞, ${fmt(lo)}): ${a > 0 ? '+' : '−'}  |  (${fmt(lo)}, ${fmt(hi)}): ${a > 0 ? '−' : '+'}  |  (${fmt(hi)}, ∞): ${a > 0 ? '+' : '−'}`;
      }
    }
    updateResults([
      { label: 'Solution Interval Notation', value: interval },
      { label: 'Critical Boundary Points', value: crit },
      { label: 'Sign Chart Analysis', value: signChart }
    ], {
      inputs: [{ label: 'Type', rawVal: kind }, { label: 'Relation', rawVal: op }, { label: 'a, b, c', rawVal: `${a}, ${b}, ${c}` }],
      formula: 'Boundary root extraction + interval sign testing',
      substituted: crit,
      steps: [`Critical points: ${crit}`, `Sign analysis: ${signChart}`, `Solution interval: ${interval}`],
      finalSummary: `x ∈ ${interval}`
    });
  });
  bind(calc);
}

function poly_solver() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input('Polynomial coefficients (highest degree to constant, comma-separated)', 'coeffs', '1, -6, 11, -6', 'text')}
    ${input('Synthetic Division / Remainder Point (x₀)', 'x0', 2)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const coeffs = parseNumberList($('[data-field=coeffs]').value);
    if (coeffs.length < 2 || coeffs[0] === 0) throw Error('Enter at least 2 coefficients with non-zero leading coefficient');
    const x0 = Number($('[data-field=x0]').value);
    const deg = coeffs.length - 1;
    const syn = [coeffs[0]];
    for (let i = 1; i < coeffs.length; i++) syn.push(syn[i - 1] * x0 + coeffs[i]);
    const remainder = syn[syn.length - 1];
    const quotient = syn.slice(0, -1);
    let roots = Array.from({ length: deg }, (_, k) => {
      const ang = (2 * Math.PI * k) / deg + 0.4;
      return { r: Math.cos(ang), i: Math.sin(ang) };
    });
    const monic = coeffs.map(c => c / coeffs[0]);
    const evalPolyC = z => {
      let rr = 1, ii = 0;
      for (let k = 1; k < monic.length; k++) {
        const nr = rr * z.r - ii * z.i + monic[k];
        const ni = rr * z.i + ii * z.r;
        rr = nr; ii = ni;
      }
      return { r: rr, i: ii };
    };
    for (let iter = 0; iter < 80; iter++) {
      for (let j = 0; j < deg; j++) {
        const pz = evalPolyC(roots[j]);
        let dr = 1, di = 0;
        for (let k = 0; k < deg; k++) {
          if (k === j) continue;
          const diffR = roots[j].r - roots[k].r, diffI = roots[j].i - roots[k].i;
          const nr = dr * diffR - di * diffI, ni = dr * diffI + di * diffR;
          dr = nr; di = ni;
        }
        const denom = dr * dr + di * di || 1e-18;
        roots[j].r -= (pz.r * dr + pz.i * di) / denom;
        roots[j].i -= (pz.i * dr - pz.r * di) / denom;
      }
    }
    const maxRes = Math.max(...roots.map(z => { const pz = evalPolyC(z); return Math.hypot(pz.r, pz.i); }));
    if (!Number.isFinite(maxRes) || maxRes > 1e-3) throw Error('Durand-Kerner polynomial root solver did not converge within tolerance');
    const fmtRoot = z => Math.abs(z.i) < 1e-6 ? fmt(z.r, 6) : `${fmt(z.r, 5)} ${z.i >= 0 ? '+' : '−'} ${fmt(Math.abs(z.i), 5)}i`;
    const rootStr = roots.map((z, idx) => `r_${idx + 1} = ${fmtRoot(z)}`).join('  |  ');
    updateResults([
      { label: `All ${deg} Roots (Real & Complex via Durand–Kerner)`, value: rootStr },
      { label: `Remainder Theorem Value P(${x0})`, value: remainder },
      { label: `Synthetic Division Quotient Coefficients at (x − ${x0})`, value: quotient.map(c => fmt(c)).join(', ') },
      { label: "Vieta's Sum & Product of Roots", value: `Σr = ${fmt(-coeffs[1] / coeffs[0])},  Πr = ${fmt(((-1) ** deg) * coeffs[deg] / coeffs[0])}` }
    ], {
      inputs: [{ label: 'Coefficients', rawVal: coeffs.join(', ') }, { label: 'x₀', rawVal: x0 }],
      formula: 'P(x) = (x − x₀)Q(x) + P(x₀); Durand-Kerner simultaneous root iteration',
      substituted: `P(${x0}) = ${fmt(remainder)}`,
      steps: [`Horner synthetic division row at x₀ = ${x0}: [${syn.map(v => fmt(v)).join(', ')}]`, `Roots found: ${rootStr}`],
      finalSummary: rootStr
    });
  });
  bind(calc);
}

function partial_fractions() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${dropdown('Denominator Factor Form', 'form', [
      ['distinct2', '(p·x + q) / [(x − r₁)(x − r₂)] (Distinct Linear)'],
      ['repeated2', '(p·x + q) / (x − r₁)² (Repeated Linear)'],
      ['distinct3', '(p·x² + q·x + s) / [(x − r₁)(x − r₂)(x − r₃)]']
    ], 'distinct2')}
    ${input('Numerator coeff p', 'p', 5)}${input('Numerator coeff q', 'q', -3)}
    ${input('Numerator constant s (for 3-factor)', 's', 2)}${input('Root r₁', 'r1', 1)}
    ${input('Root r₂', 'r2', 3)}${input('Root r₃ (for 3-factor)', 'r3', -2)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const form = $('[data-field=form]').value;
    const p = Number($('[data-field=p]').value), q = Number($('[data-field=q]').value), s = Number($('[data-field=s]').value);
    const r1 = Number($('[data-field=r1]').value), r2 = Number($('[data-field=r2]').value), r3 = Number($('[data-field=r3]').value);
    let decomp = '', residues = '', steps = [];
    if (form === 'distinct2') {
      if (r1 === r2) throw Error('Roots r₁ and r₂ must be distinct for this mode');
      const A = (p * r1 + q) / (r1 - r2);
      const B = (p * r2 + q) / (r2 - r1);
      decomp = `${fmt(A)}/(x − ${r1}) + ${fmt(B)}/(x − ${r2})`;
      residues = `A = ${fmt(A)}, B = ${fmt(B)}`;
      steps = [`Heaviside cover-up at x = ${r1}: A = ${fmt(A)}`, `Heaviside cover-up at x = ${r2}: B = ${fmt(B)}`];
    } else if (form === 'repeated2') {
      const A = p, B = p * r1 + q;
      decomp = `${fmt(A)}/(x − ${r1}) + ${fmt(B)}/(x − ${r1})²`;
      residues = `A = ${fmt(A)}, B = ${fmt(B)}`;
      steps = [`Write p·x + q = p(x − ${r1}) + (p·${r1} + q)`, `A = ${fmt(A)}, B = ${fmt(B)}`];
    } else {
      if (r1 === r2 || r1 === r3 || r2 === r3) throw Error('Roots r₁, r₂, r₃ must be pairwise distinct');
      const num = x => p * x * x + q * x + s;
      const A = num(r1) / ((r1 - r2) * (r1 - r3));
      const B = num(r2) / ((r2 - r1) * (r2 - r3));
      const C = num(r3) / ((r3 - r1) * (r3 - r2));
      decomp = `${fmt(A)}/(x − ${r1}) + ${fmt(B)}/(x − ${r2}) + ${fmt(C)}/(x − ${r3})`;
      residues = `A = ${fmt(A)}, B = ${fmt(B)}, C = ${fmt(C)}`;
      steps = [`Residue at x = ${r1}: A = ${fmt(A)}`, `Residue at x = ${r2}: B = ${fmt(B)}`, `Residue at x = ${r3}: C = ${fmt(C)}`];
    }
    updateResults([
      { label: 'Partial Fraction Expansion', value: decomp },
      { label: 'Heaviside Residue Coefficients', value: residues }
    ], {
      inputs: [{ label: 'Form', rawVal: form }, { label: 'Roots', rawVal: `${r1}, ${r2}, ${r3}` }],
      formula: 'N(x)/Π(x − rᵢ) = Σ Aᵢ/(x − rᵢ) where Aᵢ = N(rᵢ)/Π_{j≠i}(rᵢ − rⱼ)',
      substituted: residues,
      steps,
      finalSummary: decomp
    });
  });
  bind(calc);
}

function matrix() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${textArea('Matrix A (one row per line, space/comma separated)', 'a', '2 1\n5 3', 3)}
    ${textArea('Matrix B (for A+B, A−B, A·B)', 'b', '1 0\n2 4', 3)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const A = parseMatrixText($('[data-field=a]').value);
    const B = parseMatrixText($('[data-field=b]').value);
    const m = A.length, n = A[0].length;
    const trA = matrixOp(A, null, 'transpose');
    let detVal = 'Non-square', invHtml = '<strong>Non-square matrix</strong>', trVal = 'Non-square';
    if (m === n) {
      const lu = luDecomposition(A);
      detVal = fmt(lu.det);
      trVal = fmt(A.reduce((s, r, i) => s + r[i], 0));
      if (Math.abs(lu.det) > 1e-11) {
        const inv = matrixOp(A, null, 'inverse');
        invHtml = formatMatrixHtml(inv);
      } else {
        invHtml = '<strong>Singular matrix (det = 0)</strong>';
      }
    }
    const sameShape = m === B.length && n === B[0].length;
    const canMul = n === B.length;
    const sumHtml = sameShape ? formatMatrixHtml(matrixOp(A, B, 'addition')) : '<strong>Dimension mismatch</strong>';
    const diffHtml = sameShape ? formatMatrixHtml(matrixOp(A, B, 'subtraction')) : '<strong>Dimension mismatch</strong>';
    const prodHtml = canMul ? formatMatrixHtml(matrixOp(A, B, 'multiply')) : `<strong>Dimension mismatch (${m}×${n} vs ${B.length}×${B[0].length})</strong>`;
    updateResults([
      { label: `Determinant det(A) & Trace tr(A) (${m}×${n})`, value: `det(A) = ${detVal},  tr(A) = ${trVal}` },
      { label: 'Matrix Product (A · B)', value: 'Matrix Product', html: prodHtml },
      { label: 'Matrix Sum (A + B)', value: 'Matrix Sum', html: sumHtml },
      { label: 'Matrix Difference (A − B)', value: 'Matrix Difference', html: diffHtml },
      { label: 'Inverse Matrix (A⁻¹)', value: 'Matrix Inverse', html: invHtml },
      { label: 'Transpose (Aᵀ)', value: 'Matrix Transpose', html: formatMatrixHtml(trA) }
    ], {
      inputs: [{ label: 'Matrix A shape', rawVal: `${m}×${n}` }, { label: 'Matrix B shape', rawVal: `${B.length}×${B[0].length}` }],
      formula: 'det(A) via PA = LU decomposition; A⁻¹ via Gauss-Jordan elimination [A | I] → [I | A⁻¹]',
      substituted: `det(A) = ${detVal}`,
      steps: [`Matrix A dimensions: ${m}×${n}`, `Determinant det(A) = ${detVal}`, `Trace tr(A) = ${trVal}`],
      finalSummary: `det(A) = ${detVal}, tr(A) = ${trVal}`
    });
  });
  bind(calc);
}

function vector() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input('Vector u (comma-separated, 2D or 3D)', 'u', '1, 2, 3', 'text')}
    ${input('Vector v (comma-separated, 2D or 3D)', 'v', '4, -5, 6', 'text')}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const u = parseNumberList($('[data-field=u]').value);
    const v = parseNumberList($('[data-field=v]').value);
    if (u.length < 2 || u.length !== v.length) throw Error('Enter two vectors of equal dimension (2D or 3D)');
    const dot = u.reduce((s, val, i) => s + val * v[i], 0);
    const magU = Math.hypot(...u), magV = Math.hypot(...v);
    const angleDeg = (magU && magV) ? Math.acos(Math.max(-1, Math.min(1, dot / (magU * magV)))) * 180 / Math.PI : 0;
    const cross = u.length === 3
      ? [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]
      : [0, 0, u[0] * v[1] - u[1] * v[0]];
    const projScale = magV ? dot / (magV * magV) : 0;
    const proj = v.map(c => c * projScale);
    updateResults([
      { label: 'Dot Product (u · v)', value: dot },
      { label: 'Cross Product (u × v)', value: `(${cross.map(c => fmt(c)).join(', ')})` },
      { label: 'Magnitudes |u| and |v|', value: `|u| = ${fmt(magU)},  |v| = ${fmt(magV)}` },
      { label: 'Angle θ between u and v', value: `${fmt(angleDeg)}°` },
      { label: 'Vector Projection proj_v(u)', value: `(${proj.map(c => fmt(c)).join(', ')})` }
    ], {
      inputs: [{ label: 'u', rawVal: `(${u.join(', ')})` }, { label: 'v', rawVal: `(${v.join(', ')})` }],
      formula: 'u·v = Σuᵢvᵢ = |u||v|cos(θ), proj_v(u) = ((u·v)/|v|²)v',
      substituted: `u·v = ${fmt(dot)}, |u| = ${fmt(magU)}, |v| = ${fmt(magV)}`,
      steps: [`u·v = ${u.map((x, i) => `${x}·(${v[i]})`).join(' + ')} = ${fmt(dot)}`, `θ = arccos(${fmt(dot)} / (${fmt(magU)}·${fmt(magV)})) = ${fmt(angleDeg)}°`],
      finalSummary: `u·v = ${fmt(dot)}, u×v = (${cross.map(c => fmt(c)).join(', ')}), θ = ${fmt(angleDeg)}°`
    });
  });
  bind(calc);
}

function system() {
  $('#calculator-app').innerHTML = `${textArea('Augmented Matrix [A | b] (one equation per line, coefficients followed by RHS)', 'aug', '2 1 -1 8\n-3 -1 2 -11\n-2 1 2 -3', 3)}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const aug = parseMatrixText($('[data-field=aug]').value);
    const m = aug.length, cols = aug[0].length, n = cols - 1;
    if (n < 1) throw Error('Enter at least 2 numbers per row (coefficients + RHS)');
    const A = aug.map(r => r.slice(0, n));
    const rrefAug = rrefWithPivotInfo(aug);
    const rrefA = rrefWithPivotInfo(A);
    let status = '', solText = '';
    if (rrefAug.rank > rrefA.rank) {
      status = 'Inconsistent System (0 solutions — rank(A) < rank([A|b]))';
      solText = 'No solution exists (contradictory row 0 = c in RREF)';
    } else if (rrefA.rank < n) {
      status = `Consistent Dependent System (Infinitely many solutions — ${n - rrefA.rank} free variable(s))`;
      solText = `Rank = ${rrefA.rank} < ${n} variables`;
    } else {
      status = 'Consistent Unique Solution (rank(A) = rank([A|b]) = n)';
      solText = rrefAug.rref.slice(0, n).map((r, i) => `x_${i + 1} = ${fmt(r[n])}`).join(',  ');
    }
    updateResults([
      { label: 'System Classification (Rouché–Capelli Theorem)', value: status },
      { label: 'Solution Set', value: solText },
      { label: 'Reduced Row Echelon Form RREF([A | b])', value: solText, html: formatMatrixHtml(rrefAug.rref) }
    ], {
      inputs: [{ label: 'Equations × Variables', rawVal: `${m} × ${n}` }],
      formula: 'Gauss-Jordan elimination to Reduced Row Echelon Form (RREF)',
      substituted: `rank(A) = ${rrefA.rank}, rank([A|b]) = ${rrefAug.rank}`,
      steps: [...rrefAug.steps, status, solText],
      finalSummary: solText
    });
  });
  bind(calc);
}

function linalg_eigen() {
  $('#calculator-app').innerHTML = `${textArea('Square Matrix A (2×2 or 3×3)', 'a', '4 1\n2 3', 3)}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const A = parseMatrixText($('[data-field=a]').value);
    const res = eigenvaluesEigenvectors(A);
    updateResults([
      { label: 'Eigenvalues (λ)', value: res.eigenvalues.map((l, i) => `λ_${i + 1} = ${typeof l === 'number' ? fmt(l, 6) : l}`).join(',  ') },
      { label: 'Characteristic Polynomial det(A − λI) = 0', value: res.charPoly },
      { label: 'Normalized Eigenvectors', value: res.eigenvectors.join('  |  ') },
      { label: 'Trace & Determinant Invariants', value: `tr(A) = Σλᵢ = ${fmt(res.trace)},  det(A) = Πλᵢ = ${fmt(res.det)}` }
    ], {
      inputs: [{ label: 'Matrix A', rawVal: `${A.length}×${A[0].length}` }],
      formula: 'det(A − λI) = 0; (A − λᵢI)vᵢ = 0',
      substituted: res.charPoly,
      steps: [`Characteristic polynomial: ${res.charPoly}`, `Eigenvalues: ${res.eigenvalues.map(l => typeof l === 'number' ? fmt(l, 5) : l).join(', ')}`, `Eigenvectors: ${res.eigenvectors.join(', ')}`],
      finalSummary: res.eigenvalues.map((l, i) => `λ_${i + 1} = ${typeof l === 'number' ? fmt(l, 5) : l}`).join(', ')
    });
  });
  bind(calc);
}

function linalg_lu() {
  $('#calculator-app').innerHTML = `${textArea('Square Matrix A', 'a', '2 1 1\n4 -6 0\n-2 7 2', 3)}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const A = parseMatrixText($('[data-field=a]').value);
    const lu = luDecomposition(A);
    updateResults([
      { label: 'Determinant det(A) = sign(P)·ΠUᵢᵢ', value: lu.det },
      { label: 'Lower Triangular Matrix L (Unit Diagonal)', value: 'L', html: formatMatrixHtml(lu.L) },
      { label: 'Upper Triangular Matrix U', value: 'U', html: formatMatrixHtml(lu.U) },
      { label: 'Permutation Matrix P (PA = LU)', value: 'P', html: formatMatrixHtml(lu.P) }
    ], {
      inputs: [{ label: 'Matrix A', rawVal: `${A.length}×${A.length}` }],
      formula: 'P·A = L·U (Doolittle algorithm with partial pivoting)',
      substituted: `det(A) = ${fmt(lu.det)}`,
      steps: lu.steps,
      finalSummary: `PA = LU completed, det(A) = ${fmt(lu.det)}`
    });
  });
  bind(calc);
}

function linalg_qr() {
  $('#calculator-app').innerHTML = `${textArea('Matrix A (m×n with linearly independent columns)', 'a', '12 -51 4\n6 167 -68\n-4 24 -41', 3)}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const A = parseMatrixText($('[data-field=a]').value);
    const qr = qrDecomposition(A);
    updateResults([
      { label: 'Orthogonal Matrix Q (QᵀQ = I)', value: 'Q', html: formatMatrixHtml(qr.Q) },
      { label: 'Upper Triangular Matrix R (A = Q·R)', value: 'R', html: formatMatrixHtml(qr.R) },
      { label: 'Reconstruction Residual ||A − QR||_F', value: qr.residual }
    ], {
      inputs: [{ label: 'Matrix A', rawVal: `${A.length}×${A[0].length}` }],
      formula: 'Modified Gram-Schmidt orthogonalization: qₖ = uₖ / ||uₖ||₂, Rᵢₖ = qᵢᵀ aₖ',
      substituted: `Q (${qr.Q.length}×${qr.Q[0].length}), R (${qr.R.length}×${qr.R[0].length})`,
      steps: qr.steps,
      finalSummary: `QR factorization completed for ${A.length}×${A[0].length} matrix`
    });
  });
  bind(calc);
}

function linalg_svd() {
  $('#calculator-app').innerHTML = `${textArea('Matrix A', 'a', '3 2 2\n2 3 -2', 3)}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const A = parseMatrixText($('[data-field=a]').value);
    const svd = svdDecomposition(A);
    updateResults([
      { label: 'Singular Values (σ₁ ≥ σ₂ ≥ …)', value: svd.singularValues.map((s, i) => `σ_${i + 1} = ${fmt(s, 6)}`).join(',  ') },
      { label: 'Rank & Condition Number κ₂(A) = σ_max / σ_min', value: `rank = ${svd.rank},  κ₂(A) = ${Number.isFinite(svd.conditionNumber) ? fmt(svd.conditionNumber) : '∞'}` },
      { label: 'Left Singular Vectors U', value: 'U', html: formatMatrixHtml(svd.U) },
      { label: 'Right Singular Vectors V', value: 'V', html: formatMatrixHtml(svd.V) }
    ], {
      inputs: [{ label: 'Matrix A', rawVal: `${A.length}×${A[0].length}` }],
      formula: 'A = U · Σ · Vᵀ where σᵢ = √λᵢ(AᵀA)',
      substituted: svd.singularValues.map((s, i) => `σ_${i + 1} = ${fmt(s, 5)}`).join(', '),
      steps: [`Computed AᵀA and Jacobi eigendecomposition`, `Singular values: ${svd.singularValues.map(s => fmt(s, 5)).join(', ')}`],
      finalSummary: `σ = [${svd.singularValues.map(s => fmt(s, 4)).join(', ')}]`
    });
  });
  bind(calc);
}

function linalg_rank() {
  $('#calculator-app').innerHTML = `${textArea('Matrix A', 'a', '1 2 1 1\n2 4 2 2\n1 2 3 4', 3)}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const A = parseMatrixText($('[data-field=a]').value);
    const info = rrefWithPivotInfo(A);
    updateResults([
      { label: 'Rank(A) & Nullity(A) (Rank–Nullity Theorem)', value: `rank(A) = ${info.rank},  nullity(A) = ${info.nullity}  (rank + nullity = ${A[0].length} columns)` },
      { label: 'Pivot Column Indices (1-based)', value: info.pivotCols.map(c => c + 1).join(', ') || 'None' },
      { label: 'Reduced Row Echelon Form RREF(A)', value: 'RREF', html: formatMatrixHtml(info.rref) }
    ], {
      inputs: [{ label: 'Matrix A', rawVal: `${A.length}×${A[0].length}` }],
      formula: 'rank(A) + nullity(A) = n (number of columns)',
      substituted: `${info.rank} + ${info.nullity} = ${A[0].length}`,
      steps: info.steps,
      finalSummary: `rank(A) = ${info.rank}, nullity(A) = ${info.nullity}`
    });
  });
  bind(calc);
}

function linalg_exp() {
  $('#calculator-app').innerHTML = `<div class="control-grid">${textArea('Square Matrix A', 'a', '0 1\n-1 0', 3)}${input('Time / Scale Parameter (t in e^(A·t))', 't', 1)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const A = parseMatrixText($('[data-field=a]').value);
    const tVal = Number($('[data-field=t]').value);
    const scaled = A.map(r => r.map(v => v * tVal));
    const res = matrixExponential(scaled);
    updateResults([
      { label: `Matrix Exponential exp(A · ${tVal})`, value: 'exp(At)', html: formatMatrixHtml(res.expA) },
      { label: 'Jacobi Identity det(exp(A·t)) = exp(tr(A·t))', value: `det(exp(At)) = ${fmt(res.detExpA, 6)},  exp(tr(At)) = ${fmt(res.exactExpTrace, 6)}` }
    ], {
      inputs: [{ label: 'Matrix A', rawVal: `${A.length}×${A.length}` }, { label: 't', rawVal: tVal }],
      formula: 'exp(At) = Σ_{k=0}^∞ (At)^k / k! via scaling and squaring Taylor series',
      substituted: `t = ${tVal}, tr(At) = ${fmt(res.traceA)}`,
      steps: [`Scaled matrix A·t by power-of-two factor`, `Evaluated 18-term Taylor series and squared back`, `Verified det(exp(At)) = ${fmt(res.detExpA, 6)}`],
      finalSummary: `det(exp(At)) = ${fmt(res.detExpA, 6)}`
    });
  });
  bind(calc);
}

function linalg_ols() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${textArea('Design Matrix X (one observation row per line)', 'X', '1 2\n2 1\n3 4\n4 3\n5 5', 4)}
    ${input('Response Vector y (comma-separated)', 'y', '6, 5, 12, 11, 16', 'text')}
    ${dropdown('Include Intercept Column (β₀)?', 'int', [['1', 'Yes (prepend column of 1s)'], ['0', 'No (fit through origin)']], '1')}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const rawX = parseMatrixText($('[data-field=X]').value);
    const y = parseNumberList($('[data-field=y]').value);
    const addInt = $('[data-field=int]').value === '1';
    const X = addInt ? rawX.map(r => [1, ...r]) : rawX;
    const ols = linearLeastSquares(X, y);
    updateResults([
      { label: 'Least-Squares Coefficient Vector β̂ = (XᵀX)⁻¹Xᵀy', value: ols.xHat.map((b, i) => `${addInt ? `β_${i}` : `β_${i + 1}`} = ${fmt(b, 5)}`).join(',  ') },
      { label: 'Coefficient of Determination (R²) & Residual RMSE', value: `R² = ${fmt(ols.rSquared, 5)},  RMSE = ${fmt(ols.rmse, 5)},  RSS = ${fmt(ols.rss, 5)}` },
      { label: 'Fitted Values ŷ = Xβ̂', value: ols.yHat.map(v => fmt(v, 4)).join(', ') },
      { label: 'Residuals e = y − ŷ', value: ols.residuals.map(v => fmt(v, 4)).join(', ') }
    ], {
      inputs: [{ label: 'Observations n', rawVal: y.length }, { label: 'Parameters p', rawVal: X[0].length }],
      formula: 'β̂ = (XᵀX)⁻¹Xᵀy, RSS = ||y − Xβ̂||₂²',
      substituted: ols.xHat.map((b, i) => `β_${i} = ${fmt(b, 4)}`).join(', '),
      steps: [`Formed normal equations (XᵀX)β̂ = Xᵀy`, `Solved for β̂: ${ols.xHat.map(b => fmt(b, 4)).join(', ')}`, `R² = ${fmt(ols.rSquared, 5)}, RMSE = ${fmt(ols.rmse, 5)}`],
      finalSummary: `R² = ${fmt(ols.rSquared, 4)}, RMSE = ${fmt(ols.rmse, 4)}`
    });
  });
  bind(calc);
}

// Calculus & Graphing Renderers
function graph() {
  $('#calculator-app').innerHTML = `${mathExprControl('Primary Function y₁ = f(x)', 'fx', 'sin(x) + 0.25*x')}
    ${mathExprControl('Optional Second Function y₂ = g(x)', 'gx', 'cos(x)')}
    ${mathExprControl('Optional Third Function y₃ = h(x)', 'hx', '')}
    <div class="control-grid">${input('x min', 'xmin', -10)}${input('x max', 'xmax', 10)}</div>
    <div class="graph-actions"><span>Multi-curve analysis (roots, stationary points & intersections)</span><button type="button" class="outline-btn" id="reset-graph">Reset view</button><button type="button" class="outline-btn" id="export-graph">↓ Save PNG</button></div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const fx = $('[data-field=fx]').value, gx = $('[data-field=gx]').value.trim(), hx = $('[data-field=hx]')?.value.trim() || '';
    const xmin = Number($('[data-field=xmin]').value), xmax = Number($('[data-field=xmax]').value);
    if (!(xmax > xmin)) throw Error('x max must be greater than x min');
    const fAst = compile(fx);
    const f = x => run(fAst, { x });
    const gAst = gx ? compile(gx) : null;
    const g = gAst ? x => run(gAst, { x }) : null;
    const hAst = hx ? compile(hx) : null;
    const hFn = hAst ? x => run(hAst, { x }) : null;
    const rootsF = solveRoots(fx, 'x', xmin, xmax);
    let extremaF = [];
    try {
      const dfSym = diffSymbolic(fx, 'x', 1);
      extremaF = solveRoots(dfSym.symbolic, 'x', xmin, xmax);
    } catch {}
    const intersections = gx ? solveRoots(`(${fx}) - (${gx})`, 'x', xmin, xmax) : [];
    const y0 = f(0);
    updateResults([
      { label: 'Interactive Function Plot', value: `f(0) = ${fmt(y0)}`, html: '<canvas id="graph-canvas" class="viz-canvas compact" width="560" height="230"></canvas>' },
      { label: 'y-Intercept f(0) & Real Roots f(x) = 0 on interval', value: `f(0) = ${Number.isFinite(y0) ? fmt(y0) : 'Undefined'}  |  Roots: ${rootsF.length ? rootsF.slice(0, 6).map(r => fmt(r, 4)).join(', ') : 'None in range'}` },
      { label: "Stationary Points (f'(x) = 0)", value: extremaF.length ? extremaF.slice(0, 6).map(x => `(${fmt(x, 3)}, ${fmt(f(x), 3)})`).join(', ') : 'None in range' },
      { label: 'Intersections f(x) = g(x)', value: gx ? (intersections.length ? intersections.slice(0, 6).map(x => `(${fmt(x, 4)}, ${fmt(f(x), 4)})`).join(', ') : 'None in range') : 'No second function g(x) specified' }
    ], {
      inputs: [{ label: 'f(x)', rawVal: fx }, { label: 'g(x)', rawVal: gx || 'None' }, ...(hx ? [{ label: 'h(x)', rawVal: hx }] : []), { label: 'Domain', rawVal: `[${xmin}, ${xmax}]` }],
      formula: 'Adaptive sampling + sign-change/extremum root detection',
      substituted: `f(x) = ${fx} on [${xmin}, ${xmax}]`,
      steps: [`y-intercept f(0) = ${fmt(y0)}`, `Detected ${rootsF.length} root(s) and ${extremaF.length} stationary point(s) in [${xmin}, ${xmax}]`],
      finalSummary: `f(0) = ${fmt(y0)}, Roots: ${rootsF.slice(0, 5).map(r => fmt(r, 4)).join(', ') || 'None'}`
    });
    const fnList = [{ fn: f, color: '#5b4be8' }];
    if (g) fnList.push({ fn: g, color: '#e86f38' });
    if (hFn) fnList.push({ fn: hFn, color: '#129490' });
    drawMiniPlot('graph-canvas', fnList, xmin, xmax);
  });
  $('#reset-graph')?.addEventListener('click', () => {
    $('[data-field=xmin]').value = -10;
    $('[data-field=xmax]').value = 10;
    calc();
  });
  $('#export-graph')?.addEventListener('click', () => {
    const c = document.getElementById('graph-canvas');
    if (c && typeof c.toDataURL === 'function') {
      const a = document.createElement('a');
      a.href = c.toDataURL('image/png');
      a.download = 'axiomatlas-function-graph.png';
      a.click();
    }
  });
  bind(calc);
}

function limit() {
  $('#calculator-app').innerHTML = `${mathExprControl('Function f(x)', 'fx', 'sin(x)/x')}${input('Approach Point (x → a, or type inf / -inf)', 'a', '0', 'text')}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const fx = $('[data-field=fx]').value, aRaw = $('[data-field=a]').value.trim().toLowerCase();
    const ast = compile(fx);
    const f = x => run(ast, { x });
    if (aRaw === 'inf' || aRaw === '+inf' || aRaw === 'infinity' || aRaw === '-inf' || aRaw === '-infinity') {
      const sign = aRaw.startsWith('-') ? -1 : 1;
      const v1 = f(sign * 1e3), v2 = f(sign * 1e5), v3 = f(sign * 1e7);
      const converged = Math.abs(v3 - v2) < 1e-3 * (1 + Math.abs(v3));
      updateResults([
        { label: `Limit as x → ${sign > 0 ? '+∞' : '−∞'}`, value: converged ? v3 : (Math.abs(v3) > 1e6 ? (v3 > 0 ? '+∞' : '−∞') : v3) },
        { label: 'Asymptotic Sequence f(10³), f(10⁵), f(10⁷)', value: `${fmt(v1)},  ${fmt(v2)},  ${fmt(v3)}` }
      ], {
        inputs: [{ label: 'f(x)', rawVal: fx }, { label: 'x →', rawVal: aRaw }],
        formula: 'Asymptotic evaluation along x = ±10^k',
        substituted: `f(${sign * 1e7}) = ${fmt(v3)}`,
        steps: [`f(${sign * 1e3}) = ${fmt(v1)}`, `f(${sign * 1e5}) = ${fmt(v2)}`, `f(${sign * 1e7}) = ${fmt(v3)}`],
        finalSummary: `lim f(x) = ${fmt(v3)}`
      });
      return;
    }
    const a = Number(aRaw);
    if (!Number.isFinite(a)) throw Error('Enter a valid number or inf / -inf for the limit point');
    const hs = [1e-2, 1e-4, 1e-6];
    const lefts = hs.map(h => f(a - h));
    const rights = hs.map(h => f(a + h));
    const L = lefts[2], R = rights[2];
    const match = Math.abs(L - R) <= 1e-4 * (1 + Math.abs(L) + Math.abs(R));
    const twoSided = match ? 0.5 * (L + R) : 'Does Not Exist (Jump / Asymptote: Left ≠ Right)';
    updateResults([
      { label: `Two-Sided Limit lim_{x→${a}} f(x)`, value: twoSided },
      { label: `Left-Hand Limit lim_{x→${a}⁻} f(x)`, value: L },
      { label: `Right-Hand Limit lim_{x→${a}⁺} f(x)`, value: R }
    ], {
      inputs: [{ label: 'f(x)', rawVal: fx }, { label: 'a', rawVal: a }],
      formula: 'lim_{x→a⁻} f(x) = f(a − h), lim_{x→a⁺} f(x) = f(a + h) as h → 0⁺',
      substituted: `Left = ${fmt(L)}, Right = ${fmt(R)}`,
      steps: [`Left-hand table: f(a−10⁻²) = ${fmt(lefts[0])}, f(a−10⁻⁴) = ${fmt(lefts[1])}, f(a−10⁻⁶) = ${fmt(lefts[2])}`, `Right-hand table: f(a+10⁻²) = ${fmt(rights[0])}, f(a+10⁻⁴) = ${fmt(rights[1])}, f(a+10⁻⁶) = ${fmt(rights[2])}`],
      finalSummary: `lim_{x→${a}} f(x) = ${typeof twoSided === 'number' ? fmt(twoSided) : twoSided}`
    });
  });
  bind(calc);
}

function multivar_limit() {
  $('#calculator-app').innerHTML = `${mathExprControl('Multivariable Function f(x, y)', 'fxy', '(x^2 - y^2)/(x^2 + y^2)', { vars: ['x', 'y'] })}
    <div class="control-grid">${input('Target x₀', 'x0', 0)}${input('Target y₀', 'y0', 0)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const fxy = $('[data-field=fxy]').value;
    const x0 = Number($('[data-field=x0]').value), y0 = Number($('[data-field=y0]').value);
    const ast = compile(fxy);
    const h = 1e-4;
    const pX = run(ast, { x: x0 + h, y: y0 });
    const pY = run(ast, { x: x0, y: y0 + h });
    const pDiag1 = run(ast, { x: x0 + h, y: y0 + h });
    const pDiag2 = run(ast, { x: x0 + h, y: y0 - h });
    const pParab = run(ast, { x: x0 + Math.sqrt(h), y: y0 + h });
    const vals = [pX, pY, pDiag1, pDiag2, pParab].filter(Number.isFinite);
    const maxDiff = vals.length ? Math.max(...vals) - Math.min(...vals) : NaN;
    const exists = Number.isFinite(maxDiff) && maxDiff < 1e-3 * (1 + Math.abs(vals[0]));
    updateResults([
      { label: `Multivariable Limit Conclusion as (x,y) → (${x0}, ${y0})`, value: exists ? vals[0] : 'Limit Does Not Exist (Path-Dependent Values)' },
      { label: 'Along Axis Paths (y = y₀ and x = x₀)', value: `Along y=${y0}: ${fmt(pX)}  |  Along x=${x0}: ${fmt(pY)}` },
      { label: 'Along Diagonal Lines y − y₀ = ±(x − x₀)', value: `Slope +1: ${fmt(pDiag1)}  |  Slope −1: ${fmt(pDiag2)}` },
      { label: 'Along Parabolic Path y − y₀ = (x − x₀)²', value: fmt(pParab) }
    ], {
      inputs: [{ label: 'f(x,y)', rawVal: fxy }, { label: '(x₀, y₀)', rawVal: `(${x0}, ${y0})` }],
      formula: 'Multi-path convergence test along axial, linear (y = mx), and parabolic (y = x²) trajectories',
      substituted: `Max path spread Δ = ${fmt(maxDiff)}`,
      steps: [`Path 1 (y = ${y0}): ${fmt(pX)}`, `Path 2 (x = ${x0}): ${fmt(pY)}`, `Path 3 (y−y₀ = x−x₀): ${fmt(pDiag1)}`, `Path 4 (y−y₀ = (x−x₀)²): ${fmt(pParab)}`],
      finalSummary: exists ? `Limit = ${fmt(vals[0])}` : 'Limit DNE (path-dependent)'
    });
  });
  bind(calc);
}

function derivative() {
  $('#calculator-app').innerHTML = `${mathExprControl('Function f(x)', 'fx', 'x^3 - 4*x + 2')}${input('Evaluation Point (x₀)', 'x0', 2)}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const fx = $('[data-field=fx]').value, x0 = Number($('[data-field=x0]').value);
    const ast = compile(fx);
    const sym = diffSymbolic(fx, 'x', 1);
    const num = numericalDerivative(ast, 'x', x0, 1);
    const y0 = num.f0;
    const tangent = `${fmt(num.value)}·(x − ${x0}) + ${fmt(y0)}`;
    const normal = Math.abs(num.value) > 1e-12 ? `${fmt(-1 / num.value)}·(x − ${x0}) + ${fmt(y0)}` : `x = ${x0} (Vertical normal)`;
    const rules = sym.orderSteps[0]?.rules || [];
    updateResults([
      { label: `Derivative Value f'(${x0})`, value: num.value },
      { label: "Symbolic First Derivative f'(x)", value: sym.symbolic },
      { label: `Tangent Line Equation at x = ${x0}`, value: `y = ${tangent}` },
      { label: `Normal Line Equation at x = ${x0}`, value: `y = ${normal}` }
    ], {
      inputs: [{ label: 'f(x)', rawVal: fx }, { label: 'x₀', rawVal: x0 }],
      formula: "f'(x) via symbolic differentiation rules + central difference verification",
      substituted: `f'(${x0}) = ${fmt(num.value)}, f(${x0}) = ${fmt(y0)}`,
      steps: [...rules.map(r => `${r.rule}: ${r.expr}`), `Symbolic derivative: f'(x) = ${sym.symbolic}`, `Evaluated at x₀ = ${x0}: f'(${x0}) = ${fmt(num.value)}`],
      finalSummary: `f'(x) = ${sym.symbolic}, f'(${x0}) = ${fmt(num.value)}`
    });
  });
  bind(calc);
}

function higher_derivative() {
  $('#calculator-app').innerHTML = `${mathExprControl('Function f(x)', 'fx', 'x^4 - 3*x^2 + sin(x)')}
    <div class="control-grid">${input('Derivative Order n (1 to 4)', 'n', 2)}${input('Evaluation Point (x₀)', 'x0', 1)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const fx = $('[data-field=fx]').value;
    const n = Math.max(1, Math.min(4, Math.round(Number($('[data-field=n]').value) || 2)));
    const x0 = Number($('[data-field=x0]').value);
    const sym = diffSymbolic(fx, 'x', n);
    const valAtX0 = run(sym.ast, { x: x0 });
    const f2 = run(diffSymbolic(fx, 'x', 2).ast, { x: x0 });
    const concavity = Math.abs(f2) < 1e-9 ? 'Potential inflection point (f″(x₀) ≈ 0)' : (f2 > 0 ? 'Concave Up (f″(x₀) > 0)' : 'Concave Down (f″(x₀) < 0)');
    updateResults([
      { label: `Evaluated Value f^(${n})(${x0})`, value: valAtX0 },
      { label: `Symbolic Order-${n} Derivative f^(${n})(x)`, value: sym.symbolic },
      { label: `Concavity Analysis at x = ${x0}`, value: concavity }
    ], {
      inputs: [{ label: 'f(x)', rawVal: fx }, { label: 'Order n', rawVal: n }, { label: 'x₀', rawVal: x0 }],
      formula: `Iterated symbolic differentiation d^${n}/dx^${n} f(x)`,
      substituted: `f^(${n})(${x0}) = ${fmt(valAtX0)}`,
      steps: sym.orderSteps.map(s => `Order ${s.order}: f^(${s.order})(x) = ${s.expression}`),
      finalSummary: `f^(${n})(x) = ${sym.symbolic} = ${fmt(valAtX0)} at x = ${x0}`
    });
  });
  bind(calc);
}

function partial_derivative() {
  $('#calculator-app').innerHTML = `${mathExprControl('Multivariable Function f(x, y)', 'fxy', 'x^2*y + sin(x*y)', { vars: ['x', 'y'] })}
    <div class="control-grid">${input('Point x₀', 'x0', 1)}${input('Point y₀', 'y0', 2)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const fxy = $('[data-field=fxy]').value;
    const x0 = Number($('[data-field=x0]').value), y0 = Number($('[data-field=y0]').value);
    const ast = compile(fxy);
    const fxAst = simplifyAst(diffAst(ast, 'x'));
    const fyAst = simplifyAst(diffAst(ast, 'y'));
    const fxxAst = simplifyAst(diffAst(fxAst, 'x'));
    const fyyAst = simplifyAst(diffAst(fyAst, 'y'));
    const fxyAst = simplifyAst(diffAst(fxAst, 'y'));
    const env = { x: x0, y: y0 };
    const vx = run(fxAst, env), vy = run(fyAst, env);
    const vxx = run(fxxAst, env), vyy = run(fyyAst, env), vxy = run(fxyAst, env);
    const hessDet = vxx * vyy - vxy * vxy;
    updateResults([
      { label: `Evaluated Gradient at (${x0}, ${y0})`, value: `f_x = ${fmt(vx)},  f_y = ${fmt(vy)}` },
      { label: 'Symbolic First Partials ∂f/∂x & ∂f/∂y', value: `f_x = ${formatAstText(fxAst)}  |  f_y = ${formatAstText(fyAst)}` },
      { label: 'Second Partials (f_xx, f_yy, Mixed Partial f_xy)', value: `f_xx = ${fmt(vxx)},  f_yy = ${fmt(vyy)},  f_xy = ${fmt(vxy)}` },
      { label: 'Hessian Determinant D = f_xx·f_yy − (f_xy)²', value: hessDet }
    ], {
      inputs: [{ label: 'f(x,y)', rawVal: fxy }, { label: '(x₀, y₀)', rawVal: `(${x0}, ${y0})` }],
      formula: '∂f/∂x holds y constant; ∂f/∂y holds x constant; Clairaut theorem f_xy = f_yx',
      substituted: `∇f(${x0},${y0}) = (${fmt(vx)}, ${fmt(vy)}), D = ${fmt(hessDet)}`,
      steps: [`∂f/∂x = ${formatAstText(fxAst)} = ${fmt(vx)}`, `∂f/∂y = ${formatAstText(fyAst)} = ${fmt(vy)}`, `Hessian determinant D = ${fmt(vxx)}·${fmt(vyy)} − (${fmt(vxy)})² = ${fmt(hessDet)}`],
      finalSummary: `f_x = ${fmt(vx)}, f_y = ${fmt(vy)}`
    });
  });
  bind(calc);
}

function implicit_diff() {
  $('#calculator-app').innerHTML = `${mathExprControl('Implicit Relation F(x, y) = 0', 'fxy', 'x^2 + y^2 - 25', { vars: ['x', 'y'] })}
    <div class="control-grid">${input('Point x₀', 'x0', 3)}${input('Point y₀', 'y0', 4)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const fxy = $('[data-field=fxy]').value;
    const x0 = Number($('[data-field=x0]').value), y0 = Number($('[data-field=y0]').value);
    const ast = compile(fxy);
    const Fx = simplifyAst(diffAst(ast, 'x'));
    const Fy = simplifyAst(diffAst(ast, 'y'));
    const env = { x: x0, y: y0 };
    const vx = run(Fx, env), vy = run(Fy, env);
    if (Math.abs(vy) < 1e-12) throw Error('∂F/∂y = 0 at this point (vertical tangent / singular point)');
    const dydx = -vx / vy;
    updateResults([
      { label: `Evaluated Slope dy/dx at (${x0}, ${y0})`, value: dydx },
      { label: 'Symbolic Implicit Derivative Formula dy/dx = −F_x / F_y', value: `−(${formatAstText(Fx)}) / (${formatAstText(Fy)})` },
      { label: `Tangent Line at (${x0}, ${y0})`, value: `y = ${fmt(dydx)}·(x − ${x0}) + ${y0}` }
    ], {
      inputs: [{ label: 'F(x,y) = 0', rawVal: fxy }, { label: '(x₀, y₀)', rawVal: `(${x0}, ${y0})` }],
      formula: 'dy/dx = −(∂F/∂x) / (∂F/∂y) by the Implicit Function Theorem',
      substituted: `dy/dx = −(${fmt(vx)}) / (${fmt(vy)}) = ${fmt(dydx)}`,
      steps: [`F_x = ${formatAstText(Fx)} = ${fmt(vx)}`, `F_y = ${formatAstText(Fy)} = ${fmt(vy)}`, `dy/dx = −F_x / F_y = ${fmt(dydx)}`],
      finalSummary: `dy/dx = ${fmt(dydx)}`
    });
  });
  bind(calc);
}

function parametric_diff() {
  $('#calculator-app').innerHTML = `${mathExprControl('x(t)', 'xt', 'cos(t)', { vars: ['t'] })}${mathExprControl('y(t)', 'yt', 'sin(t)', { vars: ['t'] })}${input('Parameter Value (t₀)', 't0', 0.785398163)}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const xt = $('[data-field=xt]').value, yt = $('[data-field=yt]').value, t0 = Number($('[data-field=t0]').value);
    const dxSym = diffSymbolic(xt, 't', 1), dySym = diffSymbolic(yt, 't', 1);
    const d2xSym = diffSymbolic(xt, 't', 2), d2ySym = diffSymbolic(yt, 't', 2);
    const env = { t: t0 };
    const dx = run(dxSym.ast, env), dy = run(dySym.ast, env);
    const d2x = run(d2xSym.ast, env), d2y = run(d2ySym.ast, env);
    const dydx = Math.abs(dx) > 1e-12 ? dy / dx : NaN;
    const d2ydx2 = Math.abs(dx) > 1e-12 ? (dx * d2y - dy * d2x) / (dx ** 3) : NaN;
    const speed = Math.hypot(dx, dy);
    updateResults([
      { label: "First Parametric Derivative dy/dx = y'(t)/x'(t)", value: Number.isFinite(dydx) ? dydx : 'Vertical tangent (dx/dt = 0)' },
      { label: 'Second Parametric Derivative d²y/dx²', value: Number.isFinite(d2ydx2) ? d2ydx2 : 'Undefined' },
      { label: "Velocity Components x'(t) & y'(t)", value: `x'(t) = ${dxSym.symbolic} = ${fmt(dx)}  |  y'(t) = ${dySym.symbolic} = ${fmt(dy)}` },
      { label: "Arc-Length Speed ds/dt = √(x'(t)² + y'(t)²)", value: speed }
    ], {
      inputs: [{ label: 'x(t)', rawVal: xt }, { label: 'y(t)', rawVal: yt }, { label: 't₀', rawVal: t0 }],
      formula: "dy/dx = (dy/dt)/(dx/dt), d²y/dx² = (x'y'' − y'x'') / (x')³",
      substituted: `dy/dx = ${fmt(dy)} / ${fmt(dx)} = ${fmt(dydx)}`,
      steps: [`x'(t) = ${dxSym.symbolic} = ${fmt(dx)}`, `y'(t) = ${dySym.symbolic} = ${fmt(dy)}`, `dy/dx = ${fmt(dydx)}, d²y/dx² = ${fmt(d2ydx2)}`],
      finalSummary: `dy/dx = ${fmt(dydx)}, d²y/dx² = ${fmt(d2ydx2)}`
    });
  });
  bind(calc);
}

function log_diff() {
  $('#calculator-app').innerHTML = `${mathExprControl('Base Function u(x) > 0', 'ux', 'x')}${mathExprControl('Exponent Function v(x)', 'vx', 'sin(x)')}${input('Evaluation Point x₀ (where u(x₀) > 0)', 'x0', 2)}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const ux = $('[data-field=ux]').value, vx = $('[data-field=vx]').value, x0 = Number($('[data-field=x0]').value);
    const uAst = compile(ux), vAst = compile(vx);
    const duAst = simplifyAst(diffAst(uAst, 'x')), dvAst = simplifyAst(diffAst(vAst, 'x'));
    const env = { x: x0 };
    const u = run(uAst, env), v = run(vAst, env), du = run(duAst, env), dv = run(dvAst, env);
    if (u <= 0) throw Error('Base function u(x₀) must be strictly positive for logarithmic differentiation');
    const y = u ** v;
    const logDeriv = dv * Math.log(u) + v * (du / u);
    const dydx = y * logDeriv;
    const symFormula = `(${ux})^(${vx}) · [ (${formatAstText(dvAst)})·ln(${ux}) + (${vx})·(${formatAstText(duAst)})/(${ux}) ]`;
    updateResults([
      { label: `Evaluated Derivative y'(${x0})`, value: dydx },
      { label: "Symbolic Logarithmic Derivative y' = u^v · [v'·ln(u) + v·u'/u]", value: symFormula },
      { label: `Logarithmic Derivative (y'/y) at x = ${x0}`, value: logDeriv }
    ], {
      inputs: [{ label: 'u(x)', rawVal: ux }, { label: 'v(x)', rawVal: vx }, { label: 'x₀', rawVal: x0 }],
      formula: "ln(y) = v(x)·ln(u(x)) ⇒ y'/y = v'(x)ln(u(x)) + v(x)u'(x)/u(x)",
      substituted: `y(${x0}) = ${fmt(y)}, y'/y = ${fmt(logDeriv)}`,
      steps: [`u(${x0}) = ${fmt(u)}, u'(${x0}) = ${fmt(du)}`, `v(${x0}) = ${fmt(v)}, v'(${x0}) = ${fmt(dv)}`, `y'(${x0}) = ${fmt(y)} · ${fmt(logDeriv)} = ${fmt(dydx)}`],
      finalSummary: `y'(${x0}) = ${fmt(dydx)}`
    });
  });
  bind(calc);
}

function directional_diff() {
  $('#calculator-app').innerHTML = `${mathExprControl('Scalar Field f(x, y, z)', 'fxyz', 'x^2*y + y*z^2', { vars: ['x', 'y', 'z'] })}
    <div class="control-grid">${input('Evaluation Point (x₀, y₀, z₀)', 'pt', '1, 2, -1', 'text')}
    ${input('Direction Vector u = (u₁, u₂, u₃)', 'dir', '2, -1, 2', 'text')}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const fxyz = $('[data-field=fxyz]').value;
    const pt = parseNumberList($('[data-field=pt]').value);
    const dir = parseNumberList($('[data-field=dir]').value);
    const grad = computeGradient(fxyz, pt[0] ?? 1, pt[1] ?? 1, pt[2] ?? 0);
    const gVec = pt.length === 2 ? [grad.fx, grad.fy] : [grad.fx, grad.fy, grad.fz];
    const uVec = dir.slice(0, gVec.length);
    const magU = Math.hypot(...uVec);
    if (magU === 0) throw Error('Direction vector cannot be the zero vector');
    const unitU = uVec.map(c => c / magU);
    const duf = gVec.reduce((s, g, i) => s + g * unitU[i], 0);
    const magG = Math.hypot(...gVec);
    updateResults([
      { label: 'Directional Derivative D_û f = ∇f · û', value: duf },
      { label: 'Gradient Vector ∇f at Point', value: `(${gVec.map(v => fmt(v)).join(', ')})` },
      { label: 'Normalized Unit Direction Vector û', value: `(${unitU.map(v => fmt(v)).join(', ')})` },
      { label: 'Maximum Rate of Increase ||∇f||₂', value: magG }
    ], {
      inputs: [{ label: 'f', rawVal: fxyz }, { label: 'Point', rawVal: pt.join(', ') }, { label: 'Direction u', rawVal: dir.join(', ') }],
      formula: 'D_û f(P) = ∇f(P) · (u / ||u||₂)',
      substituted: `(${gVec.map(v => fmt(v)).join(', ')}) · (${unitU.map(v => fmt(v)).join(', ')}) = ${fmt(duf)}`,
      steps: [`Evaluated ∇f = (${gVec.map(v => fmt(v)).join(', ')})`, `Unit vector û = (${unitU.map(v => fmt(v)).join(', ')})`, `Dot product D_û f = ${fmt(duf)}`],
      finalSummary: `D_û f = ${fmt(duf)}`
    });
  });
  bind(calc);
}

function gradient_calc() {
  $('#calculator-app').innerHTML = `${mathExprControl('Scalar Field f(x, y, z)', 'fxyz', 'x^2 + y^2 + z^2', { vars: ['x', 'y', 'z'] })}
    ${input('Evaluation Point (x₀, y₀, z₀)', 'pt', '1, 2, 2', 'text')}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const fxyz = $('[data-field=fxyz]').value;
    const pt = parseNumberList($('[data-field=pt]').value);
    const grad = computeGradient(fxyz, pt[0] ?? 1, pt[1] ?? 1, pt[2] ?? 0);
    const gVec = pt.length === 2 ? [grad.fx, grad.fy] : [grad.fx, grad.fy, grad.fz];
    const symVec = pt.length === 2 ? [grad.fxSymbolic, grad.fySymbolic] : [grad.fxSymbolic, grad.fySymbolic, grad.fzSymbolic];
    const magG = Math.hypot(...gVec);
    const unitG = magG > 0 ? gVec.map(v => v / magG) : gVec.map(() => 0);
    updateResults([
      { label: 'Evaluated Gradient Vector ∇f(P)', value: `(${gVec.map(v => fmt(v)).join(', ')})` },
      { label: 'Symbolic Gradient Vector ∇f', value: `(${symVec.join(', ')})` },
      { label: 'Steepest Ascent Magnitude ||∇f||₂', value: magG },
      { label: 'Steepest Ascent Unit Direction', value: `(${unitG.map(v => fmt(v)).join(', ')})` }
    ], {
      inputs: [{ label: 'f', rawVal: fxyz }, { label: 'Point P', rawVal: pt.join(', ') }],
      formula: '∇f = (∂f/∂x, ∂f/∂y, ∂f/∂z)',
      substituted: `∇f(P) = (${gVec.map(v => fmt(v)).join(', ')})`,
      steps: [`∂f/∂x = ${grad.fxSymbolic} = ${fmt(grad.fx)}`, `∂f/∂y = ${grad.fySymbolic} = ${fmt(grad.fy)}`, `∂f/∂z = ${grad.fzSymbolic} = ${fmt(grad.fz)}`],
      finalSummary: `∇f = (${gVec.map(v => fmt(v)).join(', ')}), ||∇f|| = ${fmt(magG)}`
    });
  });
  bind(calc);
}

function integral() {
  $('#calculator-app').innerHTML = `${mathExprControl('Integrand f(x)', 'fx', 'x^2 + sin(x)')}
    <div class="control-grid">${input('Lower Limit (a)', 'a', 0)}${input('Upper Limit (b)', 'b', 3.1415926535)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const fx = $('[data-field=fx]').value, a = Number($('[data-field=a]').value), b = Number($('[data-field=b]').value);
    const sym = integrateSymbolic(fx, 'x');
    const quad = quadratureCompare(fx, 'x', a, b, 120);
    const meanVal = b !== a ? quad.gaussLegendre / (b - a) : NaN;
    updateResults([
      { label: `Definite Integral ∫_${a}^${b} f(x) dx (Gauss–Legendre 8-pt)`, value: quad.gaussLegendre },
      { label: 'Symbolic Antiderivative F(x)', value: sym.symbolic },
      { label: 'Average Function Value on [a, b]', value: meanVal },
      { label: "Simpson's 1/3 & Trapezoidal Cross-Check", value: `Simpson 1/3 = ${fmt(quad.simpson13)},  Trapezoidal = ${fmt(quad.trapezoidal)},  Est. Error = ${fmt(quad.estimatedError)}` }
    ], {
      inputs: [{ label: 'f(x)', rawVal: fx }, { label: '[a, b]', rawVal: `[${a}, ${b}]` }],
      formula: '∫_a^b f(x) dx = F(b) − F(a); verified via composite 8-point Gauss-Legendre quadrature',
      substituted: `∫_${a}^${b} (${fx}) dx = ${fmt(quad.gaussLegendre)}`,
      steps: [...sym.steps, `8-point Gauss-Legendre quadrature: ${fmt(quad.gaussLegendre)}`, `Simpson's 1/3 rule: ${fmt(quad.simpson13)}`],
      finalSummary: `∫_${a}^${b} f(x) dx = ${fmt(quad.gaussLegendre)}`
    });
  });
  bind(calc);
}

function indefinite_integral() {
  $('#calculator-app').innerHTML = `${mathExprControl('Integrand f(x)', 'fx', '3*x^2 + cos(2*x) + 1/x')}${input('Verification Point x₀', 'x0', 2)}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const fx = $('[data-field=fx]').value, x0 = Number($('[data-field=x0]').value);
    const sym = integrateSymbolic(fx, 'x');
    const numF = quadratureCompare(fx, 'x', 1, x0, 60).gaussLegendre;
    updateResults([
      { label: 'Symbolic Indefinite Integral ∫ f(x) dx', value: sym.symbolic },
      { label: `Accumulation Function ∫₁^${x0} f(t) dt`, value: numF }
    ], {
      inputs: [{ label: 'f(x)', rawVal: fx }, { label: 'x₀', rawVal: x0 }],
      formula: "∫ f(x) dx = F(x) + C where F'(x) = f(x)",
      substituted: sym.symbolic,
      steps: sym.steps.length ? sym.steps : [`Antiderivative: ${sym.symbolic}`],
      finalSummary: sym.symbolic
    });
  });
  bind(calc);
}

function double_integral() {
  $('#calculator-app').innerHTML = `${mathExprControl('Integrand f(x, y)', 'fxy', 'x*y + x^2', { vars: ['x', 'y'] })}
    <div class="control-grid">${input('x Lower Limit (a)', 'ax', 0)}${input('x Upper Limit (b)', 'bx', 2)}</div>
    <div class="control-grid">${mathExprControl('y Lower Limit g₁(x)', 'gy1', '0', { vars: ['x'] })}${mathExprControl('y Upper Limit g₂(x)', 'gy2', 'x', { vars: ['x'] })}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const fxy = $('[data-field=fxy]').value;
    const ax = Number($('[data-field=ax]').value), bx = Number($('[data-field=bx]').value);
    const gy1 = $('[data-field=gy1]').value, gy2 = $('[data-field=gy2]').value;
    const val = doubleIntegral(fxy, 'x', 'y', ax, bx, gy1, gy2);
    const area = doubleIntegral('1', 'x', 'y', ax, bx, gy1, gy2);
    updateResults([
      { label: 'Iterated Double Integral ∬_D f(x, y) dy dx', value: val },
      { label: 'Domain Area ∬_D 1 dy dx', value: area },
      { label: 'Average Value of f(x, y) over D', value: area ? val / area : NaN }
    ], {
      inputs: [{ label: 'f(x,y)', rawVal: fxy }, { label: 'x ∈', rawVal: `[${ax}, ${bx}]` }, { label: 'y ∈', rawVal: `[${gy1}, ${gy2}]` }],
      formula: '∫_{x=a}^b ∫_{y=g₁(x)}^{g₂(x)} f(x, y) dy dx via 2D tensor-product Gauss-Legendre quadrature',
      substituted: `∬_D (${fxy}) dy dx = ${fmt(val)}`,
      steps: [`Integrated inner y-integral on [${gy1}, ${gy2}]`, `Integrated outer x-integral on [${ax}, ${bx}]`, `Result = ${fmt(val)}, Domain area = ${fmt(area)}`],
      finalSummary: `∬_D f(x,y) dA = ${fmt(val)}`
    });
  });
  bind(calc);
}

function triple_integral() {
  $('#calculator-app').innerHTML = `${mathExprControl('Integrand f(x, y, z)', 'fxyz', 'x + y + z', { vars: ['x', 'y', 'z'] })}
    <div class="control-grid">${input('x min', 'ax', 0)}${input('x max', 'bx', 1)}${input('y min', 'ay', 0)}${input('y max', 'by', 2)}${input('z min', 'az', 0)}${input('z max', 'bz', 3)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const fxyz = $('[data-field=fxyz]').value;
    const ax = Number($('[data-field=ax]').value), bx = Number($('[data-field=bx]').value);
    const ay = Number($('[data-field=ay]').value), by = Number($('[data-field=by]').value);
    const az = Number($('[data-field=az]').value), bz = Number($('[data-field=bz]').value);
    const val = tripleIntegral(fxyz, 'x', 'y', 'z', ax, bx, ay, by, az, bz);
    const vol = (bx - ax) * (by - ay) * (bz - az);
    updateResults([
      { label: 'Triple Integral ∭_B f(x, y, z) dz dy dx', value: val },
      { label: 'Box Volume V = Δx·Δy·Δz', value: vol },
      { label: 'Volume-Averaged Field Value', value: vol ? val / vol : NaN }
    ], {
      inputs: [{ label: 'f(x,y,z)', rawVal: fxyz }, { label: 'Box', rawVal: `[${ax},${bx}]×[${ay},${by}]×[${az},${bz}]` }],
      formula: '∫_ax^bx ∫_ay^by ∫_az^bz f(x,y,z) dz dy dx via 3D 512-node Gauss-Legendre quadrature',
      substituted: `∭_B (${fxyz}) dV = ${fmt(val)}`,
      steps: [`Evaluated 8×8×8 Gauss-Legendre tensor cubature over box volume V = ${fmt(vol)}`, `Triple integral = ${fmt(val)}`],
      finalSummary: `∭_B f dV = ${fmt(val)}`
    });
  });
  bind(calc);
}

function improper_integral() {
  $('#calculator-app').innerHTML = `${mathExprControl('Integrand f(x)', 'fx', '1/(1 + x^2)')}
    <div class="control-grid">${input('Lower Limit (number or -inf)', 'a', '0', 'text')}${input('Upper Limit (number or inf)', 'b', 'inf', 'text')}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const fx = $('[data-field=fx]').value;
    const aRaw = $('[data-field=a]').value.trim();
    const bRaw = $('[data-field=b]').value.trim();
    const res = improperIntegral(fx, 'x', aRaw, bRaw);
    updateResults([
      { label: `Improper Integral Value ∫_${aRaw}^${bRaw} f(x) dx`, value: res.convergent ? res.value : `Diverges (${res.reason})` },
      { label: 'Improper Integral Convergence Classification', value: res.convergent ? 'CONVERGENT' : 'DIVERGENT' }
    ], {
      inputs: [{ label: 'f(x)', rawVal: fx }, { label: 'Limits', rawVal: `[${aRaw}, ${bRaw}]` }],
      formula: 'Rational variable transformation x = a + t/(1−t) on [0, 1) + tail/endpoint p-exponent test',
      substituted: res.convergent ? `Value = ${fmt(res.value)}` : res.reason,
      steps: [res.convergent ? res.note : res.reason],
      finalSummary: res.convergent ? `Converges to ${fmt(res.value)}` : `Diverges (${res.reason})`
    });
  });
  bind(calc);
}

function ibp_calculator() {
  $('#calculator-app').innerHTML = `${mathExprControl('LIATE Factor u(x) (to differentiate)', 'ux', 'x')}${mathExprControl('Differential Factor dv/dx (to integrate)', 'dvx', 'exp(x)')}
    <div class="control-grid">${input('Definite Check Lower Limit (a)', 'a', 0)}${input('Definite Check Upper Limit (b)', 'b', 1)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const ux = $('[data-field=ux]').value, dvx = $('[data-field=dvx]').value;
    const a = Number($('[data-field=a]').value), b = Number($('[data-field=b]').value);
    const duSym = diffSymbolic(ux, 'x', 1);
    const vSym = integrateSymbolic(dvx, 'x');
    const vClean = vSym.symbolic.replace(/\s*\+\s*C$/, '');
    const remSym = vSym.exactAvailable ? integrateSymbolic(`(${vClean})*(${duSym.symbolic})`, 'x') : { exactAvailable: false, symbolic: '' };
    const fullSym = (vSym.exactAvailable && remSym.exactAvailable)
      ? `(${ux})·(${vClean}) − (${remSym.symbolic.replace(/\s*\+\s*C$/, '')}) + C`
      : `(${ux})·(${vClean}) − ∫ (${vClean})·(${duSym.symbolic}) dx`;
    const defVal = quadratureCompare(`(${ux})*(${dvx})`, 'x', a, b, 60).gaussLegendre;
    updateResults([
      { label: `Definite Integral ∫_${a}^${b} u(x)·v'(x) dx`, value: defVal },
      { label: 'Integration by Parts Formula ∫ u dv = u·v − ∫ v du', value: fullSym },
      { label: 'LIATE Components (du/dx and v(x) = ∫ dv)', value: `du/dx = ${duSym.symbolic}  |  v(x) = ${vClean}` }
    ], {
      inputs: [{ label: 'u(x)', rawVal: ux }, { label: "v'(x)", rawVal: dvx }],
      formula: '∫ u dv = u·v − ∫ v du (LIATE rule: Logarithmic, Inverse trig, Algebraic, Trig, Exponential)',
      substituted: `u = ${ux}, du = ${duSym.symbolic} dx, v = ${vClean}`,
      steps: [`Differentiate u(x) = ${ux} ⇒ du = (${duSym.symbolic}) dx`, `Integrate dv = (${dvx}) dx ⇒ v(x) = ${vClean}`, `Assemble u·v − ∫ v du = ${fullSym}`],
      finalSummary: fullSym
    });
  });
  bind(calc);
}

function trig_integral() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${dropdown('Trigonometric Integral / Substitution Family', 'fam', [
      ['sincos', '∫ sin^m(x) · cos^n(x) dx (Power Reduction)'],
      ['a2_minus_x2', '∫ √(a² − x²) dx  [Trig Sub: x = a·sin(θ)]'],
      ['a2_plus_x2', '∫ 1 / √(a² + x²) dx  [Trig Sub: x = a·tan(θ)]'],
      ['x2_minus_a2', '∫ 1 / √(x² − a²) dx  [Trig Sub: x = a·sec(θ)]']
    ], 'sincos')}
    ${input('Power m / Parameter a', 'm', 2)}${input('Power n (for sin^m cos^n)', 'n', 0)}
    ${input('Lower Limit (a)', 'lo', 0)}${input('Upper Limit (b)', 'hi', 1.5707963268)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const fam = $('[data-field=fam]').value;
    const m = Number($('[data-field=m]').value), n = Number($('[data-field=n]').value);
    const lo = Number($('[data-field=lo]').value), hi = Number($('[data-field=hi]').value);
    let expr = '', subRule = '', anti = '';
    if (fam === 'sincos') {
      expr = `(sin(x)^${m})*(cos(x)^${n})`;
      subRule = m % 2 === 1 ? 'Odd sin power: split one sin(x) dx = −d(cos x), use sin²x = 1 − cos²x'
        : (n % 2 === 1 ? 'Odd cos power: split one cos(x) dx = d(sin x), use cos²x = 1 − sin²x'
        : 'Even powers: apply half-angle identities sin²x = (1 − cos 2x)/2, cos²x = (1 + cos 2x)/2');
      anti = m === 2 && n === 0 ? 'x/2 − sin(2x)/4 + C' : (m === 0 && n === 2 ? 'x/2 + sin(2x)/4 + C' : 'Evaluated via power-reduction formula');
    } else if (fam === 'a2_minus_x2') {
      expr = `sqrt(${m}^2 - x^2)`;
      subRule = `x = ${m}·sin(θ), dx = ${m}·cos(θ) dθ, √(${m}² − x²) = ${m}·cos(θ)`;
      anti = `(x/2)√(${m}² − x²) + (${m}²/2)·arcsin(x/${m}) + C`;
    } else if (fam === 'a2_plus_x2') {
      expr = `1/sqrt(${m}^2 + x^2)`;
      subRule = `x = ${m}·tan(θ), dx = ${m}·sec²(θ) dθ, √(${m}² + x²) = ${m}·sec(θ)`;
      anti = `ln|x + √(${m}² + x²)| + C = asinh(x/${m}) + C`;
    } else {
      expr = `1/sqrt(x^2 - ${m}^2)`;
      subRule = `x = ${m}·sec(θ), dx = ${m}·sec(θ)tan(θ) dθ`;
      anti = `ln|x + √(x² − ${m}²)| + C = acosh(x/${m}) + C`;
    }
    const quad = quadratureCompare(expr, 'x', lo, hi, 60);
    updateResults([
      { label: `Definite Integral on [${lo}, ${hi}]`, value: quad.gaussLegendre },
      { label: 'Trigonometric Substitution / Reduction Strategy', value: subRule },
      { label: 'Closed-Form Antiderivative F(x)', value: anti }
    ], {
      inputs: [{ label: 'Family', rawVal: fam }, { label: 'm / a', rawVal: m }, { label: '[lo, hi]', rawVal: `[${lo}, ${hi}]` }],
      formula: subRule,
      substituted: `∫_${lo}^${hi} (${expr}) dx = ${fmt(quad.gaussLegendre)}`,
      steps: [subRule, `Antiderivative: ${anti}`, `Gauss-Legendre numerical verification: ${fmt(quad.gaussLegendre)}`],
      finalSummary: `Definite value = ${fmt(quad.gaussLegendre)}`
    });
  });
  bind(calc);
}

function num_integration() {
  $('#calculator-app').innerHTML = `${mathExprControl('Integrand f(x)', 'fx', 'exp(-x^2)')}
    <div class="control-grid">${input('Lower Limit (a)', 'a', 0)}${input('Upper Limit (b)', 'b', 1)}${input('Number of Subintervals N (multiple of 6)', 'n', 12)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const fx = $('[data-field=fx]').value, a = Number($('[data-field=a]').value), b = Number($('[data-field=b]').value);
    const n = Math.max(6, Math.round(Number($('[data-field=n]').value) || 12));
    const q = quadratureCompare(fx, 'x', a, b, n);
    updateResults([
      { label: '8-Point Composite Gauss–Legendre (Reference)', value: q.gaussLegendre },
      { label: "Composite Simpson's 1/3 Rule", value: q.simpson13 },
      { label: "Composite Simpson's 3/8 Rule", value: q.simpson38 },
      { label: 'Composite Trapezoidal Rule', value: q.trapezoidal },
      { label: 'Estimated Discretization Error |Gauss − Simpson 1/3|', value: q.estimatedError }
    ], {
      inputs: [{ label: 'f(x)', rawVal: fx }, { label: '[a, b]', rawVal: `[${a}, ${b}]` }, { label: 'Subintervals N', rawVal: q.n }],
      formula: 'Comparison of O(h²), O(h⁴), and O(h¹⁶) numerical quadrature rules',
      substituted: `N = ${q.n}, h = ${fmt(q.h)}`,
      steps: [`Trapezoidal Rule: ${fmt(q.trapezoidal)}`, `Simpson's 1/3 Rule: ${fmt(q.simpson13)}`, `Simpson's 3/8 Rule: ${fmt(q.simpson38)}`, `8-Point Gauss-Legendre: ${fmt(q.gaussLegendre)}`],
      finalSummary: `Gauss-Legendre = ${fmt(q.gaussLegendre)}, Simpson 1/3 = ${fmt(q.simpson13)}`
    });
  });
  bind(calc);
}

function fourier_series() {
  $('#calculator-app').innerHTML = `${mathExprControl('Periodic Function f(x) on [−L, L]', 'fx', 'x')}
    <div class="control-grid">${input('Half-Period L (> 0)', 'L', 3.1415926535)}${input('Number of Harmonics N (1 to 10)', 'N', 5)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const fx = $('[data-field=fx]').value, L = Number($('[data-field=L]').value), N = Number($('[data-field=N]').value);
    const fs = computeFourierSeries(fx, 2 * L, N, 1);
    const terms = [];
    if (Math.abs(fs.a0) > 1e-9) terms.push(fmt(fs.a0 / 2, 4));
    for (const c of fs.coeffs) {
      if (Math.abs(c.an) > 1e-6) terms.push(`${fmt(c.an, 4)}·cos(${c.n}πx/${fmt(L, 3)})`);
      if (Math.abs(c.bn) > 1e-6) terms.push(`${fmt(c.bn, 4)}·sin(${c.n}πx/${fmt(L, 3)})`);
    }
    const seriesText = terms.join(' + ').replace(/\+ -/g, '− ') || '0';
    const coeffSummary = fs.coeffs.map(c => `n=${c.n}: a_${c.n}=${fmt(c.an, 4)}, b_${c.n}=${fmt(c.bn, 4)}`).join('  |  ');
    updateResults([
      { label: `Trigonometric Fourier Series S_${N}(x)`, value: seriesText },
      { label: 'DC Component (a₀ / 2)', value: fs.a0 / 2 },
      { label: 'Harmonic Coefficients (aₙ, bₙ)', value: coeffSummary },
      { label: 'Reconstruction Check at x = 1', value: `Exact f(1) = ${fmt(fs.exactAtX, 5)},  Partial Sum S_${N}(1) = ${fmt(fs.approxAtX, 5)}` }
    ], {
      inputs: [{ label: 'f(x)', rawVal: fx }, { label: 'Half-period L', rawVal: L }, { label: 'Harmonics N', rawVal: N }],
      formula: 'f(x) ~ a₀/2 + Σ [aₙ cos(nπx/L) + bₙ sin(nπx/L)]',
      substituted: seriesText,
      steps: [`a₀ = (1/L)∫_{-L}^L f(x) dx = ${fmt(fs.a0, 5)}`, ...fs.coeffs.map(c => `Harmonic n=${c.n}: a_${c.n} = ${fmt(c.an, 5)}, b_${c.n} = ${fmt(c.bn, 5)}`)],
      finalSummary: seriesText
    });
  });
  bind(calc);
}

function fourier_transform() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${dropdown('Standard Time-Domain Signal f(t)', 'sig', [
      ['rect', 'Rectangular Pulse rect(t / T) of width T'],
      ['exp1', 'One-Sided Exponential Decay e^(−a·t)·u(t)'],
      ['exp2', 'Two-Sided Exponential e^(−a·|t|)'],
      ['gauss', 'Gaussian Pulse e^(−a·t²)'],
      ['damped_cos', 'Damped Cosine e^(−a·t)·cos(ω₀·t)·u(t)']
    ], 'rect')}
    ${input('Parameter a or Pulse Width T (> 0)', 'a', 2)}${input('Carrier Frequency ω₀ (for damped cosine)', 'w0', 5)}
    ${input('Evaluation Angular Frequency ω (rad/s)', 'w', 3)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const sig = $('[data-field=sig]').value;
    const a = Number($('[data-field=a]').value), w0 = Number($('[data-field=w0]').value), w = Number($('[data-field=w]').value);
    if (a <= 0) throw Error('Parameter a / T must be positive');
    let sym = '', re = 0, im = 0;
    if (sig === 'rect') {
      sym = `F(ω) = T · sinc(ωT / 2) = ${a} · sin(${a / 2}·ω) / (${a / 2}·ω)`;
      re = w === 0 ? a : (2 * Math.sin(w * a / 2)) / w;
    } else if (sig === 'exp1') {
      sym = `F(ω) = 1 / (${a} + i·ω) = (${a} − i·ω) / (${a * a} + ω²)`;
      re = a / (a * a + w * w);
      im = -w / (a * a + w * w);
    } else if (sig === 'exp2') {
      sym = `F(ω) = 2a / (a² + ω²) = ${2 * a} / (${a * a} + ω²)`;
      re = (2 * a) / (a * a + w * w);
    } else if (sig === 'gauss') {
      sym = `F(ω) = √(π / a) · e^(−ω² / 4a)`;
      re = Math.sqrt(Math.PI / a) * Math.exp(-(w * w) / (4 * a));
    } else {
      sym = `F(ω) = (a + i·ω) / [(a + i·ω)² + ω₀²]`;
      const d1 = a * a + (w - w0) ** 2, d2 = a * a + (w + w0) ** 2;
      re = 0.5 * (a / d1 + a / d2);
      im = -0.5 * ((w - w0) / d1 + (w + w0) / d2);
    }
    const mag = Math.hypot(re, im), phaseDeg = Math.atan2(im, re) * 180 / Math.PI;
    updateResults([
      { label: `Magnitude |F(${w})| & Phase ∠F(${w})`, value: `|F(ω)| = ${fmt(mag, 5)},  Phase = ${fmt(phaseDeg, 3)}°` },
      { label: 'Symbolic Fourier Transform F(ω) = ∫ f(t) e^(−iωt) dt', value: sym },
      { label: `Complex Spectrum Value F(${w})`, value: `${fmt(re, 5)} ${im >= 0 ? '+' : '−'} ${fmt(Math.abs(im), 5)}i` }
    ], {
      inputs: [{ label: 'Signal', rawVal: sig }, { label: 'a / T', rawVal: a }, { label: 'ω', rawVal: w }],
      formula: 'F(ω) = ∫_{-∞}^{∞} f(t) e^(−iωt) dt',
      substituted: `|F(${w})| = ${fmt(mag, 5)}, ∠F(${w}) = ${fmt(phaseDeg, 3)}°`,
      steps: [`Symbolic transform pair: ${sym}`, `Evaluated at ω = ${w}: Re = ${fmt(re, 5)}, Im = ${fmt(im, 5)}`],
      finalSummary: `|F(${w})| = ${fmt(mag, 5)}`
    });
  });
  bind(calc);
}

function inv_fourier_transform() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${dropdown('Frequency-Domain Spectrum F(ω)', 'spec', [
      ['lowpass', 'Ideal Low-Pass Filter rect(ω / 2W) with cutoff W'],
      ['pole1', 'First-Order Pole 1 / (a + i·ω)'],
      ['lorentz', 'Lorentzian Spectrum 2a / (a² + ω²)'],
      ['gauss', 'Gaussian Spectrum e^(−ω² / 4a)']
    ], 'lowpass')}
    ${input('Cutoff W or Parameter a (> 0)', 'a', 3)}${input('Evaluation Time t (s)', 't', 0.5)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const spec = $('[data-field=spec]').value, a = Number($('[data-field=a]').value), t = Number($('[data-field=t]').value);
    if (a <= 0) throw Error('Parameter a / W must be positive');
    let sym = '', val = 0;
    if (spec === 'lowpass') {
      sym = `f(t) = (W / π) · sinc(W·t) = sin(${a}·t) / (π·t)`;
      val = t === 0 ? a / Math.PI : Math.sin(a * t) / (Math.PI * t);
    } else if (spec === 'pole1') {
      sym = `f(t) = e^(−${a}·t) · u(t)`;
      val = t < 0 ? 0 : Math.exp(-a * t);
    } else if (spec === 'lorentz') {
      sym = `f(t) = e^(−${a}·|t|)`;
      val = Math.exp(-a * Math.abs(t));
    } else {
      sym = `f(t) = √(a / π) · e^(−a·t²)`;
      val = Math.sqrt(a / Math.PI) * Math.exp(-a * t * t);
    }
    updateResults([
      { label: `Reconstructed Time-Domain Signal f(${t})`, value: val },
      { label: 'Symbolic Inverse Fourier Transform f(t)', value: sym }
    ], {
      inputs: [{ label: 'Spectrum', rawVal: spec }, { label: 'a / W', rawVal: a }, { label: 't', rawVal: t }],
      formula: 'f(t) = (1 / 2π) ∫_{-∞}^{∞} F(ω) e^(iωt) dω',
      substituted: `f(${t}) = ${fmt(val, 6)}`,
      steps: [`Inverse Fourier transform pair: ${sym}`, `Evaluated at t = ${t}: f(${t}) = ${fmt(val, 6)}`],
      finalSummary: `f(${t}) = ${fmt(val, 6)}`
    });
  });
  bind(calc);
}

function laplace_transform() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${dropdown('Causal Time Signal f(t)·u(t) (t ≥ 0)', 'sig', [
      ['exp_sin', 'Damped Sine e^(−a·t)·sin(ω·t)'],
      ['exp_cos', 'Damped Cosine e^(−a·t)·cos(ω·t)'],
      ['poly_exp', 't^n · e^(−a·t) (Gamma / Factorial Pole)'],
      ['step', 'Delayed Step u(t − a)']
    ], 'exp_sin')}
    ${input('Damping / Shift Parameter a', 'a', 2)}${input('Frequency ω or Power n', 'w', 4)}
    ${input('Complex Frequency s (in ROC)', 's', 5)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const sig = $('[data-field=sig]').value;
    const a = Number($('[data-field=a]').value), w = Number($('[data-field=w]').value), s = Number($('[data-field=s]').value);
    let sym = '', roc = '', val = NaN;
    if (sig === 'exp_sin') {
      sym = `F(s) = ${w} / ((s + ${a})² + ${w * w})`;
      roc = `Re(s) > ${-a}`;
      val = w / ((s + a) ** 2 + w * w);
    } else if (sig === 'exp_cos') {
      sym = `F(s) = (s + ${a}) / ((s + ${a})² + ${w * w})`;
      roc = `Re(s) > ${-a}`;
      val = (s + a) / ((s + a) ** 2 + w * w);
    } else if (sig === 'poly_exp') {
      const n = Math.max(0, Math.round(w));
      const fact = known.gamma(n + 1);
      sym = `F(s) = ${n}! / (s + ${a})^${n + 1} = ${fact} / (s + ${a})^${n + 1}`;
      roc = `Re(s) > ${-a}`;
      val = fact / ((s + a) ** (n + 1));
    } else {
      sym = `F(s) = e^(−${a}·s) / s`;
      roc = 'Re(s) > 0';
      val = Math.exp(-a * s) / s;
    }
    updateResults([
      { label: `Evaluated Transform F(${s})`, value: val },
      { label: 'Unilateral Laplace Transform F(s) = ℒ{f(t)}', value: sym },
      { label: 'Region of Convergence (ROC)', value: roc }
    ], {
      inputs: [{ label: 'Signal', rawVal: sig }, { label: 'a', rawVal: a }, { label: 'ω / n', rawVal: w }, { label: 's', rawVal: s }],
      formula: 'F(s) = ∫₀^∞ f(t) e^(−st) dt',
      substituted: `F(${s}) = ${fmt(val, 6)}`,
      steps: [`Laplace transform formula: ${sym}`, `Region of convergence: ${roc}`, `Evaluated at s = ${s}: F(${s}) = ${fmt(val, 6)}`],
      finalSummary: `${sym} = ${fmt(val, 6)} at s = ${s}`
    });
  });
  bind(calc);
}

function inv_laplace_transform() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${dropdown('Rational S-Domain Transfer Function F(s)', 'tf', [
      ['distinct', 'Distinct Real Poles: (p·s + q) / [(s − r₁)(s − r₂)]'],
      ['repeated', 'Repeated Real Pole: (p·s + q) / (s − r₁)²'],
      ['complex', 'Underdamped Complex Poles: (p·(s + α) + q·ω) / [(s + α)² + ω²]']
    ], 'distinct')}
    ${input('Numerator coeff p', 'p', 3)}${input('Numerator coeff q', 'q', 7)}
    ${input('Pole r₁ or Damping α', 'r1', -1)}${input('Pole r₂ or Frequency ω', 'r2', -3)}
    ${input('Evaluation Time t ≥ 0 (s)', 't', 1)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const tf = $('[data-field=tf]').value;
    const p = Number($('[data-field=p]').value), q = Number($('[data-field=q]').value);
    const r1 = Number($('[data-field=r1]').value), r2 = Number($('[data-field=r2]').value), t = Math.max(0, Number($('[data-field=t]').value));
    let sym = '', val = 0, steps = [];
    if (tf === 'distinct') {
      if (r1 === r2) throw Error('r₁ and r₂ must be distinct for Distinct Real Poles mode');
      const A = (p * r1 + q) / (r1 - r2), B = (p * r2 + q) / (r2 - r1);
      sym = `f(t) = [${fmt(A)}·e^(${r1}·t) + ${fmt(B)}·e^(${r2}·t)] · u(t)`;
      val = A * Math.exp(r1 * t) + B * Math.exp(r2 * t);
      steps = [`Partial fractions: A = ${fmt(A)}, B = ${fmt(B)}`, `Inverse Laplace: ${sym}`];
    } else if (tf === 'repeated') {
      const A = p, B = p * r1 + q;
      sym = `f(t) = [${fmt(A)}·e^(${r1}·t) + ${fmt(B)}·t·e^(${r1}·t)] · u(t)`;
      val = (A + B * t) * Math.exp(r1 * t);
      steps = [`Repeated pole decomposition: A = ${fmt(A)}, B = ${fmt(B)}`, `Inverse Laplace: ${sym}`];
    } else {
      sym = `f(t) = e^(−${r1}·t) · [${p}·cos(${r2}·t) + ${q}·sin(${r2}·t)] · u(t)`;
      val = Math.exp(-r1 * t) * (p * Math.cos(r2 * t) + q * Math.sin(r2 * t));
      steps = [`S-shift theorem at s = −${r1} ± i·${r2}`, `Inverse Laplace: ${sym}`];
    }
    updateResults([
      { label: `Evaluated Signal Value f(${t})`, value: val },
      { label: 'Time-Domain Impulse Response f(t) = ℒ⁻¹{F(s)}', value: sym }
    ], {
      inputs: [{ label: 'Mode', rawVal: tf }, { label: 't', rawVal: t }],
      formula: 'Heaviside partial fraction expansion + standard Laplace inverse pairs',
      substituted: `f(${t}) = ${fmt(val, 6)}`,
      steps,
      finalSummary: `${sym} = ${fmt(val, 6)} at t = ${t}`
    });
  });
  bind(calc);
}

function taylor_series(t, initialMode, forceZero = false) {
  $('#calculator-app').innerHTML = `${mathExprControl('Function f(x)', 'fx', 'sin(x) + exp(x)')}
    <div class="control-grid">${forceZero ? '<input type="hidden" data-field="a" value="0">' : input('Expansion Center (a)', 'a', 0)}${input('Polynomial Degree n (1 to 4)', 'n', 4)}${input('Approximation Point (x)', 'x', 0.5)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const fx = $('[data-field=fx]').value;
    const a = forceZero ? 0 : Number($('[data-field=a]').value);
    const n = Math.max(1, Math.min(4, Math.round(Number($('[data-field=n]').value) || 4)));
    const x = Number($('[data-field=x]').value);
    let ast = compile(fx);
    const coeffs = [], terms = [];
    let approx = 0;
    for (let k = 0; k <= n; k++) {
      const fkVal = run(ast, { x: a });
      const ck = fkVal / known.gamma(k + 1);
      coeffs.push(ck);
      approx += ck * ((x - a) ** k);
      if (Math.abs(ck) > 1e-12) {
        const powStr = k === 0 ? '' : (a === 0 ? (k === 1 ? '·x' : `·x^${k}`) : (k === 1 ? `·(x − ${a})` : `·(x − ${a})^${k}`));
        terms.push(`${fmt(ck, 5)}${powStr}`);
      }
      if (k < n) ast = simplifyAst(diffAst(ast, 'x'));
    }
    const exact = run(compile(fx), { x });
    const rem = Math.abs(exact - approx);
    const polyStr = terms.join(' + ').replace(/\+ -/g, '− ') || '0';
    updateResults([
      { label: `${forceZero ? 'Maclaurin' : 'Taylor'} Approximation P_${n}(${x})`, value: approx },
      { label: `${forceZero ? 'Maclaurin' : 'Taylor'} Polynomial P_${n}(x)`, value: polyStr },
      { label: `Exact Value f(${x}) & Remainder |R_${n}(${x})|`, value: `Exact = ${fmt(exact, 7)},  |Error| = ${fmt(rem, 7)}` }
    ], {
      inputs: [{ label: 'f(x)', rawVal: fx }, { label: 'Center a', rawVal: a }, { label: 'Degree n', rawVal: n }, { label: 'x', rawVal: x }],
      formula: 'P_n(x) = Σ_{k=0}^n [f^(k)(a) / k!] · (x − a)^k',
      substituted: polyStr,
      steps: coeffs.map((c, k) => `Order k = ${k}: c_${k} = f^(${k})(${a})/${k}! = ${fmt(c, 6)}`),
      finalSummary: `P_${n}(x) = ${polyStr}`
    });
  });
  bind(calc);
}

function maclaurin_series(t, initialMode) {
  return taylor_series(t, initialMode, true);
}

function series_convergence() {
  $('#calculator-app').innerHTML = `${mathExprControl('General Series Term a_n (in variable n, for n ≥ 1)', 'an', '1 / (n^2)', { vars: ['n'] })}${input('Partial Sum Terms N', 'N', 100)}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const anRaw = $('[data-field=an]').value;
    const N = Math.max(10, Math.min(5000, Math.round(Number($('[data-field=N]').value) || 100)));
    const ast = compile(anRaw);
    const term = n => run(ast, { n });
    let sN = 0;
    for (let k = 1; k <= N; k++) {
      const tk = term(k);
      if (Number.isFinite(tk)) sN += tk;
    }
    const a100 = Math.abs(term(100)), a101 = Math.abs(term(101)), a1000 = Math.abs(term(1000));
    const ratio = a100 > 0 ? a101 / a100 : 0;
    const root = a100 ** (1 / 100);
    const pEst = (a100 > 0 && a1000 > 0) ? -Math.log(a1000 / a100) / Math.LN10 : 0;
    let verdict = 'CONVERGENT', testUsed = '';
    if (a1000 > 1e-3 && a1000 >= a100 * 0.99) {
      verdict = 'DIVERGENT (Divergence Test: lim a_n ≠ 0)';
      testUsed = `|a_1000| = ${fmt(a1000)} does not approach 0`;
    } else if (Math.abs(ratio - 1) > 0.02) {
      verdict = ratio < 1 ? 'CONVERGENT (D’Alembert Ratio Test L < 1)' : 'DIVERGENT (D’Alembert Ratio Test L > 1)';
      testUsed = `Ratio L ≈ |a_101 / a_100| = ${fmt(ratio, 5)}, Cauchy Root ≈ ${fmt(root, 5)}`;
    } else {
      const alternating = term(10) * term(11) < 0;
      if (alternating && a1000 < a100) {
        verdict = pEst > 1 ? 'ABSOLUTELY CONVERGENT (Alternating + p > 1)' : 'CONDITIONALLY CONVERGENT (Leibniz Alternating Series Test)';
      } else {
        verdict = pEst > 1.02 ? `CONVERGENT (p-Series Test: p_eff ≈ ${fmt(pEst, 3)} > 1)` : `DIVERGENT (Harmonic / p-Series Test: p_eff ≈ ${fmt(pEst, 3)} ≤ 1)`;
      }
      testUsed = `Asymptotic decay exponent p_eff ≈ ${fmt(pEst, 3)}`;
    }
    updateResults([
      { label: 'Convergence Verdict', value: verdict },
      { label: `Partial Sum S_${N} = Σ_{n=1}^{${N}} a_n`, value: sN },
      { label: 'Ratio, Root & Asymptotic p-Exponent Diagnostics', value: testUsed }
    ], {
      inputs: [{ label: 'a_n', rawVal: anRaw }, { label: 'Terms N', rawVal: N }],
      formula: 'Divergence Test (lim a_n = 0), Ratio Test (lim |a_{n+1}/a_n|), and p-Series Decay Rate',
      substituted: `S_${N} = ${fmt(sN, 6)}`,
      steps: [`|a_100| = ${fmt(a100)}, |a_1000| = ${fmt(a1000)}`, testUsed, `Partial sum S_${N} = ${fmt(sN, 6)}`],
      finalSummary: `${verdict}, S_${N} = ${fmt(sN, 6)}`
    });
  });
  bind(calc);
}

function ode_general() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${dropdown('Differential Equation Class', 'kind', [
      ['first_lin', "First-Order Linear: y' + p·y = q"],
      ['second_cc', "Second-Order Homogeneous: a·y'' + b·y' + c·y = 0"]
    ], 'first_lin')}
    ${input('Coefficient a (or p for 1st-order)', 'a', 1)}${input('Coefficient b (or q for 1st-order)', 'b', -3)}
    ${input('Coefficient c (for 2nd-order)', 'c', 2)}${input('Initial Condition y(0)', 'y0', 2)}
    ${input("Initial Derivative y'(0) (for 2nd-order)", 'dy0', 3)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const kind = $('[data-field=kind]').value;
    const a = Number($('[data-field=a]').value), b = Number($('[data-field=b]').value), c = Number($('[data-field=c]').value);
    const y0 = Number($('[data-field=y0]').value), dy0 = Number($('[data-field=dy0]').value);
    if (kind === 'first_lin') {
      const c1 = a === 0 ? y0 : y0 - b / a;
      const gen = a === 0 ? `y(x) = ${b}·x + C` : `y(x) = C·e^(−${a}·x) + ${fmt(b / a)}`;
      const part = a === 0 ? `y(x) = ${b}·x + ${y0}` : `y(x) = ${fmt(c1)}·e^(−${a}·x) + ${fmt(b / a)}`;
      updateResults([
        { label: `Particular Solution for y(0) = ${y0}`, value: part },
        { label: 'General Solution y(x)', value: gen },
        { label: 'Integrating Factor μ(x) = e^(∫p dx)', value: `e^(${a}·x)` }
      ], {
        inputs: [{ label: 'p', rawVal: a }, { label: 'q', rawVal: b }, { label: 'y(0)', rawVal: y0 }],
        formula: "d/dx [e^(px) y] = q·e^(px)",
        substituted: part,
        steps: [`Integrating factor μ(x) = e^(${a}·x)`, `General solution: ${gen}`, `Apply y(0) = ${y0} ⇒ C = ${fmt(c1)}`],
        finalSummary: part
      });
    } else {
      if (a === 0) throw Error('Leading coefficient a cannot be 0 for second-order ODE');
      const disc = b * b - 4 * a * c;
      let gen = '', part = '', roots = '';
      if (disc > 1e-12) {
        const r1 = (-b + Math.sqrt(disc)) / (2 * a), r2 = (-b - Math.sqrt(disc)) / (2 * a);
        const c2 = (dy0 - r1 * y0) / (r2 - r1), c1 = y0 - c2;
        roots = `r₁ = ${fmt(r1)}, r₂ = ${fmt(r2)} (Overdamped / Distinct Real Roots)`;
        gen = `y(x) = C₁·e^(${fmt(r1)}·x) + C₂·e^(${fmt(r2)}·x)`;
        part = `y(x) = ${fmt(c1)}·e^(${fmt(r1)}·x) + ${fmt(c2)}·e^(${fmt(r2)}·x)`;
      } else if (Math.abs(disc) <= 1e-12) {
        const r = -b / (2 * a);
        const c1 = y0, c2 = dy0 - r * y0;
        roots = `r₁ = r₂ = ${fmt(r)} (Critically Damped / Repeated Real Root)`;
        gen = `y(x) = (C₁ + C₂·x)·e^(${fmt(r)}·x)`;
        part = `y(x) = (${fmt(c1)} + ${fmt(c2)}·x)·e^(${fmt(r)}·x)`;
      } else {
        const alpha = -b / (2 * a), omega = Math.sqrt(-disc) / (2 * Math.abs(a));
        const c1 = y0, c2 = (dy0 - alpha * y0) / omega;
        roots = `r = ${fmt(alpha)} ± ${fmt(omega)}i (Underdamped / Complex Conjugate Roots)`;
        gen = `y(x) = e^(${fmt(alpha)}·x)·[C₁·cos(${fmt(omega)}·x) + C₂·sin(${fmt(omega)}·x)]`;
        part = `y(x) = e^(${fmt(alpha)}·x)·[${fmt(c1)}·cos(${fmt(omega)}·x) + ${fmt(c2)}·sin(${fmt(omega)}·x)]`;
      }
      updateResults([
        { label: `Particular Solution for y(0)=${y0}, y'(0)=${dy0}`, value: part },
        { label: 'General Solution y(x)', value: gen },
        { label: 'Characteristic Roots (a·r² + b·r + c = 0)', value: roots }
      ], {
        inputs: [{ label: 'a, b, c', rawVal: `${a}, ${b}, ${c}` }, { label: "y(0), y'(0)", rawVal: `${y0}, ${dy0}` }],
        formula: 'Characteristic equation a·r² + b·r + c = 0',
        substituted: roots,
        steps: [`Discriminant Δ = b² − 4ac = ${fmt(disc)}`, roots, `Particular solution: ${part}`],
        finalSummary: part
      });
    }
  });
  bind(calc);
}

function ode_ivp() {
  $('#calculator-app').innerHTML = `${mathExprControl("Derivative Function dy/dx = f(x, y)", 'fxy', 'x - y', { vars: ['x', 'y'] })}
    <div class="control-grid">${input('Initial x₀', 'x0', 0)}${input('Initial y(x₀) = y₀', 'y0', 1)}${input('Target x_end', 'xEnd', 1)}${input('Step Count N', 'n', 10)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const fxy = $('[data-field=fxy]').value;
    const x0 = Number($('[data-field=x0]').value), y0 = Number($('[data-field=y0]').value);
    const xEnd = Number($('[data-field=xEnd]').value), n = Number($('[data-field=n]').value);
    const rk4 = solveOdeIvp(fxy, x0, y0, xEnd, n, 'rk4');
    const heun = solveOdeIvp(fxy, x0, y0, xEnd, n, 'heun');
    const euler = solveOdeIvp(fxy, x0, y0, xEnd, n, 'euler');
    updateResults([
      { label: `4th-Order Runge–Kutta (RK4) y(${xEnd})`, value: rk4.finalY },
      { label: `Heun's Improved Euler (RK2) y(${xEnd})`, value: heun.finalY },
      { label: `Forward Euler Method y(${xEnd})`, value: euler.finalY },
      { label: 'Estimated Local Truncation Difference |RK4 − Heun|', value: Math.abs(rk4.finalY - heun.finalY) }
    ], {
      inputs: [{ label: 'f(x,y)', rawVal: fxy }, { label: '(x₀, y₀)', rawVal: `(${x0}, ${y0})` }, { label: 'x_end', rawVal: xEnd }],
      formula: 'RK4: y_{k+1} = y_k + (h/6)(k₁ + 2k₂ + 2k₃ + k₄)',
      substituted: `h = ${fmt(rk4.h)}, y_RK4(${xEnd}) = ${fmt(rk4.finalY, 7)}`,
      steps: rk4.trajectory.slice(0, 6).map(pt => `Step ${pt.step} (x=${fmt(pt.x, 3)}): y = ${fmt(pt.y, 6)}, dy/dx = ${fmt(pt.dy, 5)}`),
      finalSummary: `y_RK4(${xEnd}) = ${fmt(rk4.finalY, 7)}`
    });
  });
  bind(calc);
}

function ode_bvp() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${mathExprControl('Coefficient p(x)', 'px', '0')}${mathExprControl('Coefficient q(x)', 'qx', '-1')}</div>
    ${mathExprControl('Forcing Term r(x)', 'rx', '0')}
    <div class="control-grid">${input('Left Boundary x = a', 'a', 0)}${input('Left Value y(a) = α', 'alpha', 1)}
    ${input('Right Boundary x = b', 'b', 1)}${input('Right Value y(b) = β', 'beta', 2.7182818)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const px = $('[data-field=px]').value, qx = $('[data-field=qx]').value, rx = $('[data-field=rx]').value;
    const a = Number($('[data-field=a]').value), alpha = Number($('[data-field=alpha]').value);
    const b = Number($('[data-field=b]').value), beta = Number($('[data-field=beta]').value);
    const res = solveOdeBvp(px, qx, rx, a, b, alpha, beta, 20);
    const midX = 0.5 * (a + b);
    const sample = [0, 5, 10, 15, 20].map(i => `y(${fmt(res.points[i].x, 3)})=${fmt(res.points[i].y, 5)}`).join('  |  ');
    updateResults([
      { label: `Midpoint Solution y(${fmt(midX, 4)})`, value: res.midpointY },
      { label: 'Boundary-to-Boundary Mesh Profile (5 Checkpoints)', value: sample }
    ], {
      inputs: [{ label: '[a, b]', rawVal: `[${a}, ${b}]` }, { label: 'y(a), y(b)', rawVal: `${alpha}, ${beta}` }],
      formula: "(y_{i-1} − 2y_i + y_{i+1})/h² + p(x_i)(y_{i+1} − y_{i-1})/(2h) + q(x_i)y_i = r(x_i)",
      substituted: `Midpoint y(${fmt(midX, 4)}) = ${fmt(res.midpointY, 6)}`,
      steps: [`Discretized [${a}, ${b}] with m = ${res.m} subintervals (h = ${fmt(res.h)})`, `Solved tridiagonal system via Thomas algorithm`, sample],
      finalSummary: `y(${fmt(midX, 4)}) = ${fmt(res.midpointY, 6)}`
    });
  });
  bind(calc);
}

function jacobian_calc() {
  $('#calculator-app').innerHTML = `${mathExprControl('Function Component f₁(x, y)', 'f1', 'x^2 - y^2', { vars: ['x', 'y'] })}${mathExprControl('Function Component f₂(x, y)', 'f2', '2*x*y', { vars: ['x', 'y'] })}
    <div class="control-grid">${input('Evaluation Point x₀', 'x0', 2)}${input('Evaluation Point y₀', 'y0', 1)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const f1 = $('[data-field=f1]').value, f2 = $('[data-field=f2]').value;
    const x0 = Number($('[data-field=x0]').value), y0 = Number($('[data-field=y0]').value);
    const a1 = compile(f1), a2 = compile(f2);
    const j11 = simplifyAst(diffAst(a1, 'x')), j12 = simplifyAst(diffAst(a1, 'y'));
    const j21 = simplifyAst(diffAst(a2, 'x')), j22 = simplifyAst(diffAst(a2, 'y'));
    const env = { x: x0, y: y0 };
    const J = [[run(j11, env), run(j12, env)], [run(j21, env), run(j22, env)]];
    const detJ = J[0][0] * J[1][1] - J[0][1] * J[1][0];
    updateResults([
      { label: 'Jacobian Determinant det(J) = ∂(f₁, f₂)/∂(x, y)', value: detJ },
      { label: `Evaluated Jacobian Matrix J(${x0}, ${y0})`, value: 'J', html: formatMatrixHtml(J) },
      { label: 'Symbolic Partial Derivatives', value: `[∂f₁/∂x = ${formatAstText(j11)}, ∂f₁/∂y = ${formatAstText(j12)}; ∂f₂/∂x = ${formatAstText(j21)}, ∂f₂/∂y = ${formatAstText(j22)}]` }
    ], {
      inputs: [{ label: 'f₁, f₂', rawVal: `${f1}, ${f2}` }, { label: '(x₀, y₀)', rawVal: `(${x0}, ${y0})` }],
      formula: 'J_ij = ∂f_i / ∂x_j; det(J) = (∂f₁/∂x)(∂f₂/∂y) − (∂f₁/∂y)(∂f₂/∂x)',
      substituted: `det(J) = ${fmt(J[0][0])}·${fmt(J[1][1])} − ${fmt(J[0][1])}·${fmt(J[1][0])} = ${fmt(detJ)}`,
      steps: [`J₁₁ = ${fmt(J[0][0])}, J₁₂ = ${fmt(J[0][1])}, J₂₁ = ${fmt(J[1][0])}, J₂₂ = ${fmt(J[1][1])}`, `det(J) = ${fmt(detJ)}`],
      finalSummary: `det(J) = ${fmt(detJ)}`
    });
  });
  bind(calc);
}

function divergence_calc() {
  $('#calculator-app').innerHTML = `${mathExprControl('Vector Field Component P(x, y, z)', 'P', 'x^2*y', { vars: ['x', 'y', 'z'] })}${mathExprControl('Vector Field Component Q(x, y, z)', 'Q', 'y*z^2', { vars: ['x', 'y', 'z'] })}${mathExprControl('Vector Field Component R(x, y, z)', 'R', 'z^3', { vars: ['x', 'y', 'z'] })}
    ${input('Evaluation Point (x₀, y₀, z₀)', 'pt', '1, 2, 3', 'text')}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const P = $('[data-field=P]').value, Q = $('[data-field=Q]').value, R = $('[data-field=R]').value;
    const pt = parseNumberList($('[data-field=pt]').value);
    const res = computeDivergenceAndCurl(P, Q, R, pt[0] ?? 1, pt[1] ?? 1, pt[2] ?? 1);
    updateResults([
      { label: 'Evaluated Divergence (∇ · F)(P)', value: res.divValue },
      { label: 'Symbolic Divergence ∇ · F = ∂P/∂x + ∂Q/∂y + ∂R/∂z', value: res.divSymbolic },
      { label: 'Solenoidal (Incompressible) Check', value: Math.abs(res.divValue) < 1e-10 ? 'Solenoidal at P (∇ · F = 0)' : (res.divValue > 0 ? 'Net Source (∇ · F > 0)' : 'Net Sink (∇ · F < 0)') }
    ], {
      inputs: [{ label: 'F', rawVal: `(${P}, ${Q}, ${R})` }, { label: 'Point', rawVal: pt.join(', ') }],
      formula: 'div(F) = ∇ · F = ∂P/∂x + ∂Q/∂y + ∂R/∂z',
      substituted: `∇ · F = ${fmt(res.divValue)}`,
      steps: [`Symbolic divergence: ${res.divSymbolic}`, `Evaluated at (${pt.join(', ')}): ${fmt(res.divValue)}`],
      finalSummary: `∇ · F = ${fmt(res.divValue)}`
    });
  });
  bind(calc);
}

function curl_calc() {
  $('#calculator-app').innerHTML = `${mathExprControl('Vector Field Component P(x, y, z)', 'P', '-y', { vars: ['x', 'y', 'z'] })}${mathExprControl('Vector Field Component Q(x, y, z)', 'Q', 'x', { vars: ['x', 'y', 'z'] })}${mathExprControl('Vector Field Component R(x, y, z)', 'R', '0', { vars: ['x', 'y', 'z'] })}
    ${input('Evaluation Point (x₀, y₀, z₀)', 'pt', '1, 2, 0', 'text')}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const P = $('[data-field=P]').value, Q = $('[data-field=Q]').value, R = $('[data-field=R]').value;
    const pt = parseNumberList($('[data-field=pt]').value);
    const res = computeDivergenceAndCurl(P, Q, R, pt[0] ?? 1, pt[1] ?? 1, pt[2] ?? 0);
    const mag = res.curlMagnitude;
    updateResults([
      { label: 'Evaluated Curl Vector (∇ × F)(P)', value: `(${res.curlValue.map(v => fmt(v)).join(', ')})` },
      { label: 'Symbolic Curl Vector ∇ × F', value: res.curlSymbolic },
      { label: 'Vorticity Magnitude ||∇ × F||₂ & Conservative Check', value: `||∇ × F|| = ${fmt(mag)}  (${mag < 1e-10 ? 'Irrotational / Conservative at P' : 'Rotational Field'})` }
    ], {
      inputs: [{ label: 'F', rawVal: `(${P}, ${Q}, ${R})` }, { label: 'Point', rawVal: pt.join(', ') }],
      formula: '∇ × F = (∂R/∂y − ∂Q/∂z, ∂P/∂z − ∂R/∂x, ∂Q/∂x − ∂P/∂y)',
      substituted: `(${res.curlValue.map(v => fmt(v)).join(', ')})`,
      steps: [`Symbolic curl: ${res.curlSymbolic}`, `Evaluated at (${pt.join(', ')}): (${res.curlValue.map(v => fmt(v)).join(', ')})`],
      finalSummary: `∇ × F = (${res.curlValue.map(v => fmt(v)).join(', ')})`
    });
  });
  bind(calc);
}

function line_integral() {
  $('#calculator-app').innerHTML = `${mathExprControl('Vector Field P(x, y) (or Scalar Integrand)', 'P', '-y', { vars: ['x', 'y', 't'] })}${mathExprControl('Vector Field Q(x, y) (set 0 for scalar ds mode)', 'Q', 'x', { vars: ['x', 'y', 't'] })}
    <div class="control-grid">${mathExprControl('Curve x(t)', 'xt', 'cos(t)', { vars: ['t'] })}${mathExprControl('Curve y(t)', 'yt', 'sin(t)', { vars: ['t'] })}
    ${input('t start (t₀)', 't0', 0)}${input('t end (t₁)', 't1', 3.1415926535)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const P = $('[data-field=P]').value, Q = $('[data-field=Q]').value;
    const xt = $('[data-field=xt]').value, yt = $('[data-field=yt]').value;
    const t0 = Number($('[data-field=t0]').value), t1 = Number($('[data-field=t1]').value);
    const xAst = compile(xt), yAst = compile(yt);
    const dxAst = simplifyAst(diffAst(xAst, 't')), dyAst = simplifyAst(diffAst(yAst, 't'));
    const pAst = compile(P), qAst = compile(Q);
    const N = 40, h = (t1 - t0) / N;
    let workSum = 0, arcSum = 0, scalarSum = 0;
    for (let i = 0; i <= N; i++) {
      const t = t0 + i * h;
      const w = (i === 0 || i === N) ? 1 : (i % 2 === 1 ? 4 : 2);
      const x = run(xAst, { t }), y = run(yAst, { t });
      const dx = run(dxAst, { t }), dy = run(dyAst, { t });
      const pv = run(pAst, { x, y, t }), qv = run(qAst, { x, y, t });
      const ds = Math.hypot(dx, dy);
      workSum += w * (pv * dx + qv * dy);
      scalarSum += w * pv * ds;
      arcSum += w * ds;
    }
    const workVal = (h / 3) * workSum, scalarVal = (h / 3) * scalarSum, arcVal = (h / 3) * arcSum;
    updateResults([
      { label: 'Vector Work Line Integral ∫_C (P dx + Q dy) = ∫_C F · dr', value: workVal },
      { label: 'Scalar Arc-Length Line Integral ∫_C P(x, y) ds', value: scalarVal },
      { label: 'Total Curve Arc Length ∫_C ds', value: arcVal }
    ], {
      inputs: [{ label: 'F = (P, Q)', rawVal: `(${P}, ${Q})` }, { label: 'r(t)', rawVal: `(${xt}, ${yt})` }, { label: '[t₀, t₁]', rawVal: `[${t0}, ${t1}]` }],
      formula: "∫_C F·dr = ∫_{t₀}^{t₁} [P(x(t),y(t))x'(t) + Q(x(t),y(t))y'(t)] dt",
      substituted: `∫_C F·dr = ${fmt(workVal)}, Arc length L = ${fmt(arcVal)}`,
      steps: [`x'(t) = ${formatAstText(dxAst)}, y'(t) = ${formatAstText(dyAst)}`, `Vector circulation / work = ${fmt(workVal)}`, `Scalar line integral ∫ P ds = ${fmt(scalarVal)}`],
      finalSummary: `∫_C F·dr = ${fmt(workVal)}, ∫_C P ds = ${fmt(scalarVal)}`
    });
  });
  bind(calc);
}

function surface_integral() {
  $('#calculator-app').innerHTML = `${mathExprControl('Explicit Surface z = g(x, y)', 'gxy', 'x^2 + y^2', { vars: ['x', 'y'] })}${mathExprControl('Scalar Density f(x, y) on Surface', 'fxyz', '1', { vars: ['x', 'y'] })}
    <div class="control-grid">${input('x min', 'ax', 0)}${input('x max', 'bx', 1)}${input('y min', 'ay', 0)}${input('y max', 'by', 1)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const gxy = $('[data-field=gxy]').value, fxyz = $('[data-field=fxyz]').value;
    const ax = Number($('[data-field=ax]').value), bx = Number($('[data-field=bx]').value);
    const ay = Number($('[data-field=ay]').value), by = Number($('[data-field=by]').value);
    const gAst = compile(gxy);
    const gxText = formatAstText(simplifyAst(diffAst(gAst, 'x')));
    const gyText = formatAstText(simplifyAst(diffAst(gAst, 'y')));
    const dSExpr = `sqrt(1 + (${gxText})^2 + (${gyText})^2)`;
    const surfVal = doubleIntegral(`(${fxyz}) * ${dSExpr}`, 'x', 'y', ax, bx, String(ay), String(by));
    const areaVal = doubleIntegral(dSExpr, 'x', 'y', ax, bx, String(ay), String(by));
    updateResults([
      { label: 'Surface Integral ∬_S f(x, y) dS', value: surfVal },
      { label: 'Total Surface Area ∬_S √(1 + z_x² + z_y²) dx dy', value: areaVal },
      { label: 'Area Magnification Element dS', value: `√(1 + (${gxText})² + (${gyText})²) dx dy` }
    ], {
      inputs: [{ label: 'z = g(x,y)', rawVal: gxy }, { label: 'f', rawVal: fxyz }, { label: 'Domain', rawVal: `[${ax},${bx}]×[${ay},${by}]` }],
      formula: '∬_S f dS = ∬_D f(x, y) √(1 + (∂g/∂x)² + (∂g/∂y)²) dx dy',
      substituted: `∬_S f dS = ${fmt(surfVal)}, Surface Area = ${fmt(areaVal)}`,
      steps: [`∂z/∂x = ${gxText}, ∂z/∂y = ${gyText}`, `Surface integral = ${fmt(surfVal)}`, `Surface area = ${fmt(areaVal)}`],
      finalSummary: `∬_S f dS = ${fmt(surfVal)}, Area = ${fmt(areaVal)}`
    });
  });
  bind(calc);
}

function error_prop() {
  $('#calculator-app').innerHTML = `${mathExprControl('Measurement Formula f(x, y, z)', 'fxyz', 'x * y / z', { vars: ['x', 'y', 'z'] })}
    <div class="control-grid">${input('Nominal Value x ± Δx (comma-separated)', 'x', '10, 0.1', 'text')}${input('Nominal Value y ± Δy (comma-separated)', 'y', '5, 0.05', 'text')}
    ${input('Nominal Value z ± Δz (comma-separated)', 'z', '2, 0.02', 'text')}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const fxyz = $('[data-field=fxyz]').value;
    const [x, dx = 0] = parseNumberList($('[data-field=x]').value);
    const [y, dy = 0] = parseNumberList($('[data-field=y]').value);
    const [z, dz = 0] = parseNumberList($('[data-field=z]').value);
    const ast = compile(fxyz);
    const env = { x, y, z };
    const fVal = run(ast, env);
    const fx = run(simplifyAst(diffAst(ast, 'x')), env);
    const fy = run(simplifyAst(diffAst(ast, 'y')), env);
    const fz = run(simplifyAst(diffAst(ast, 'z')), env);
    const sigmaF = Math.hypot(fx * dx, fy * dy, fz * dz);
    const worstCase = Math.abs(fx * dx) + Math.abs(fy * dy) + Math.abs(fz * dz);
    const relPct = fVal !== 0 ? (sigmaF / Math.abs(fVal)) * 100 : NaN;
    updateResults([
      { label: 'Nominal Value ± Gaussian Combined Uncertainty (f ± σ_f)', value: `${fmt(fVal)} ± ${fmt(sigmaF)}` },
      { label: 'Relative Percentage Uncertainty (σ_f / |f|) × 100%', value: `${fmt(relPct, 4)}%` },
      { label: 'Worst-Case Linear Bound Σ|∂f/∂xᵢ|·Δxᵢ', value: worstCase },
      { label: 'Sensitivity Coefficients (∂f/∂x, ∂f/∂y, ∂f/∂z)', value: `∂f/∂x = ${fmt(fx)},  ∂f/∂y = ${fmt(fy)},  ∂f/∂z = ${fmt(fz)}` }
    ], {
      inputs: [{ label: 'f(x,y,z)', rawVal: fxyz }, { label: 'x ± Δx', rawVal: `${x} ± ${dx}` }, { label: 'y ± Δy', rawVal: `${y} ± ${dy}` }, { label: 'z ± Δz', rawVal: `${z} ± ${dz}` }],
      formula: 'σ_f = √[(∂f/∂x · Δx)² + (∂f/∂y · Δy)² + (∂f/∂z · Δz)²]',
      substituted: `σ_f = √[(${fmt(fx * dx)})² + (${fmt(fy * dy)})² + (${fmt(fz * dz)})²] = ${fmt(sigmaF)}`,
      steps: [`f(x,y,z) = ${fmt(fVal)}`, `Sensitivity partials: ∂f/∂x=${fmt(fx)}, ∂f/∂y=${fmt(fy)}, ∂f/∂z=${fmt(fz)}`, `Combined standard uncertainty σ_f = ${fmt(sigmaF)} (${fmt(relPct, 4)}%)`],
      finalSummary: `${fmt(fVal)} ± ${fmt(sigmaF)} (${fmt(relPct, 3)}%)`
    });
  });
  bind(calc);
}

// Geometry & Trigonometry + Physics SUVAT Renderers
function triangle_trig_suite(t, initialMode) {
  const modeMap = { 'right-triangle-calculator': 'right', 'pythagorean-calculator': 'right', 'pythagorean-theorem-calculator': 'right', 'herons-formula': 'heron', 'heron': 'heron', 'law-of-sines': 'sine', 'sine-law-calculator': 'sine', 'sine_rule': 'sine', 'law-of-cosines': 'cosine', 'cosine-law-calculator': 'cosine', 'cosine_rule': 'cosine', 'trigonometry-calculator': 'eval', 'trig-calculator': 'eval', 'trig_ratios': 'eval' };
  let active = modeMap[initialMode] || 'right';
  $('#calculator-app').innerHTML = `
    <div class="mode-selector-wrap"><span class="mode-selector-label">Trigonometry Mode</span><div class="mode-tabs" role="tablist">
      <button type="button" class="mode-tab ${active === 'right' ? 'active' : ''}" data-tt="right">Right Triangle & Pythagorean</button>
      <button type="button" class="mode-tab ${active === 'cosine' ? 'active' : ''}" data-tt="cosine">Law of Cosines (SAS)</button>
      <button type="button" class="mode-tab ${active === 'sine' ? 'active' : ''}" data-tt="sine">Law of Sines (AAS / ASA)</button>
      <button type="button" class="mode-tab ${active === 'ssa' ? 'active' : ''}" data-tt="ssa">Law of Sines (SSA Ambiguous Case)</button>
      <button type="button" class="mode-tab ${active === 'heron' ? 'active' : ''}" data-tt="heron">Heron's SSS Triangle</button><button type="button" class="mode-tab ${active === 'eval' ? 'active' : ''}" data-tt="eval">All 6 Trig Ratios</button>
    </div></div>
    <div id="tt-body" class="control-grid"></div>${actionBarHtml()}`;
  function renderMode() {
    const body = $('#tt-body');
    if (active === 'right') {
      body.innerHTML = `${input('Leg a', 'a', 3)}${input('Leg b', 'b', 4)}`;
    } else if (active === 'cosine') {
      body.innerHTML = `${input('Side a', 'a', 5)}${input('Side b', 'b', 7)}${input('Included Angle C (degrees)', 'C', 60)}`;
    } else if (active === 'sine') {
      body.innerHTML = `${input('Known Side a', 'a', 10)}${input('Angle A (degrees)', 'A', 30)}${input('Angle B (degrees)', 'B', 45)}`;
    } else if (active === 'ssa') {
      body.innerHTML = `${input('Side a (opposite Angle A)', 'a', 7)}${input('Side b (adjacent)', 'b', 10)}${input('Non-Included Angle A (degrees)', 'A', 30)}`;
    } else if (active === 'heron') {
      body.innerHTML = `${input('Side a', 'a', 5)}${input('Side b', 'b', 6)}${input('Side c', 'c', 7)}`;
    } else {
      body.innerHTML = `${input('Angle θ', 'theta', 30)}${dropdown('Angle Unit', 'unit', [['deg', 'Degrees (°)'], ['rad', 'Radians (rad)']], 'deg')}`;
    }
    bind(calc);
  }
  function calc() {
    evalSafe(() => {
      if (active === 'right') {
        const a = Number($('[data-field=a]').value), b = Number($('[data-field=b]').value);
        if (a <= 0 || b <= 0) throw Error('Triangle legs must be positive');
        const c = Math.hypot(a, b);
        const A = Math.atan2(a, b) * 180 / Math.PI, B = 90 - A;
        updateResults([
          { label: 'Hypotenuse c = √(a² + b²)', value: c },
          { label: 'Acute Angles A and B', value: `A = ${fmt(A)}°,  B = ${fmt(B)}°` },
          { label: 'Area & Perimeter', value: `Area = ${fmt(0.5 * a * b)},  Perimeter = ${fmt(a + b + c)}` }
        ], {
          inputs: [{ label: 'a, b', rawVal: `${a}, ${b}` }],
          formula: 'c = √(a² + b²), A = arctan(a/b), Area = ½ab',
          substituted: `c = √(${a}² + ${b}²) = ${fmt(c)}`,
          steps: [`c = √(${a * a} + ${b * b}) = ${fmt(c)}`, `A = ${fmt(A)}°, B = ${fmt(B)}°`],
          finalSummary: `c = ${fmt(c)}, A = ${fmt(A)}°, B = ${fmt(B)}°`
        });
      } else if (active === 'cosine') {
        const a = Number($('[data-field=a]').value), b = Number($('[data-field=b]').value), C = Number($('[data-field=C]').value);
        if (a <= 0 || b <= 0 || C <= 0 || C >= 180) throw Error('Sides must be positive and angle C ∈ (0°, 180°)');
        const radC = C * Math.PI / 180;
        const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(radC));
        const A = Math.acos(Math.max(-1, Math.min(1, (b * b + c * c - a * a) / (2 * b * c)))) * 180 / Math.PI;
        const B = 180 - A - C;
        const area = 0.5 * a * b * Math.sin(radC);
        updateResults([
          { label: 'Opposite Side c = √(a² + b² − 2ab cos C)', value: c },
          { label: 'Remaining Angles A and B', value: `A = ${fmt(A)}°,  B = ${fmt(B)}°` },
          { label: 'Triangle Area = ½ab sin(C)', value: area }
        ], {
          inputs: [{ label: 'a, b, C', rawVal: `${a}, ${b}, ${C}°` }],
          formula: 'c² = a² + b² − 2ab cos(C)',
          substituted: `c = ${fmt(c)}, A = ${fmt(A)}°, B = ${fmt(B)}°`,
          steps: [`c = √(${a}² + ${b}² − 2·${a}·${b}·cos(${C}°)) = ${fmt(c)}`, `Area = ${fmt(area)}`],
          finalSummary: `c = ${fmt(c)}, Area = ${fmt(area)}`
        });
      } else if (active === 'sine') {
        const a = Number($('[data-field=a]').value), A = Number($('[data-field=A]').value), B = Number($('[data-field=B]').value);
        if (a <= 0 || A <= 0 || B <= 0 || A + B >= 180) throw Error('Require a > 0 and A + B < 180°');
        const C = 180 - A - B;
        const b = a * Math.sin(B * Math.PI / 180) / Math.sin(A * Math.PI / 180);
        const c = a * Math.sin(C * Math.PI / 180) / Math.sin(A * Math.PI / 180);
        const R = a / (2 * Math.sin(A * Math.PI / 180));
        updateResults([
          { label: 'Side b = a·sin(B)/sin(A)', value: b },
          { label: 'Side c & Third Angle C = 180° − (A + B)', value: `c = ${fmt(c)},  C = ${fmt(C)}°` },
          { label: 'Circumradius R = a / (2 sin A)', value: R }
        ], {
          inputs: [{ label: 'a, A, B', rawVal: `${a}, ${A}°, ${B}°` }],
          formula: 'a/sin(A) = b/sin(B) = c/sin(C) = 2R',
          substituted: `b = ${fmt(b)}, c = ${fmt(c)}, C = ${fmt(C)}°`,
          steps: [`C = 180° − ${A}° − ${B}° = ${fmt(C)}°`, `b = ${fmt(b)}, c = ${fmt(c)}`],
          finalSummary: `b = ${fmt(b)}, c = ${fmt(c)}, C = ${fmt(C)}°`
        });
      } else if (active === 'ssa') {
        const a = Number($('[data-field=a]').value), b = Number($('[data-field=b]').value), A = Number($('[data-field=A]').value);
        if (a <= 0 || b <= 0 || A <= 0 || A >= 180) throw Error('Sides a, b must be positive and angle A ∈ (0°, 180°)');
        const radA = A * Math.PI / 180;
        const h = b * Math.sin(radA);
        const sinB = (b * Math.sin(radA)) / a;
        if (sinB > 1 + 1e-12 || (A >= 90 && a <= b)) {
          throw Error(`No valid triangle exists: side a (${fmt(a)}) is shorter than the minimum altitude h = b·sin(A) = ${fmt(h)} (or A ≥ 90° with a ≤ b).`);
        }
        const B1 = Math.asin(Math.min(1, sinB)) * 180 / Math.PI;
        const C1 = 180 - A - B1;
        const c1 = (a * Math.sin(C1 * Math.PI / 180)) / Math.sin(radA);
        const area1 = 0.5 * a * b * Math.sin(C1 * Math.PI / 180);
        const B2 = 180 - B1;
        const twoTriangles = A < 90 && a > h + 1e-9 && a < b - 1e-9 && (A + B2 < 180 - 1e-9);
        if (twoTriangles) {
          const C2 = 180 - A - B2;
          const c2 = (a * Math.sin(C2 * Math.PI / 180)) / Math.sin(radA);
          const area2 = 0.5 * a * b * Math.sin(C2 * Math.PI / 180);
          updateResults([
            { label: 'SSA Ambiguous Case Classification', value: 'TWO Valid Triangles Exist (b·sin A < a < b)' },
            { label: 'Triangle 1 (Acute B₁)', value: `B₁ = ${fmt(B1, 4)}°,  C₁ = ${fmt(C1, 4)}°,  c₁ = ${fmt(c1, 4)},  Area₁ = ${fmt(area1, 4)}` },
            { label: 'Triangle 2 (Obtuse B₂ = 180° − B₁)', value: `B₂ = ${fmt(B2, 4)}°,  C₂ = ${fmt(C2, 4)}°,  c₂ = ${fmt(c2, 4)},  Area₂ = ${fmt(area2, 4)}` },
            { label: 'Altitude h = b·sin(A)', value: h }
          ], {
            inputs: [{ label: 'a, b, A', rawVal: `${a}, ${b}, ${A}°` }],
            formula: 'sin(B) = b·sin(A)/a ⇒ B₁ = arcsin(b·sin(A)/a) and B₂ = 180° − B₁',
            substituted: `h = b·sin(A) = ${fmt(h)} < a = ${a} < b = ${b} ⇒ Two distinct triangles`,
            steps: [
              `Compute altitude h = ${b}·sin(${A}°) = ${fmt(h)}`,
              `Since h (${fmt(h)}) < a (${a}) < b (${b}) and A < 90°, two valid triangles exist.`,
              `Solution 1 (Acute): B₁ = ${fmt(B1, 4)}°, C₁ = ${fmt(C1, 4)}°, c₁ = ${fmt(c1, 4)}, Area₁ = ${fmt(area1, 4)}`,
              `Solution 2 (Obtuse): B₂ = 180° − B₁ = ${fmt(B2, 4)}°, C₂ = ${fmt(C2, 4)}°, c₂ = ${fmt(c2, 4)}, Area₂ = ${fmt(area2, 4)}`
            ],
            finalSummary: `2 Solutions: (B₁=${fmt(B1, 2)}°, c₁=${fmt(c1, 3)}) and (B₂=${fmt(B2, 2)}°, c₂=${fmt(c2, 3)})`
          });
        } else {
          updateResults([
            { label: 'SSA Case Classification', value: Math.abs(a - h) <= 1e-9 ? 'Unique Right Triangle (a = b·sin A)' : 'Unique Valid Triangle (a ≥ b)' },
            { label: 'Solved Angles B and C', value: `B = ${fmt(B1, 4)}°,  C = ${fmt(C1, 4)}°` },
            { label: 'Third Side c & Area', value: `c = ${fmt(c1, 4)},  Area = ${fmt(area1, 4)}` }
          ], {
            inputs: [{ label: 'a, b, A', rawVal: `${a}, ${b}, ${A}°` }],
            formula: 'sin(B) = b·sin(A)/a; supplementary angle B₂ = 180° − B₁ rejected since A + B₂ ≥ 180°',
            substituted: `B = ${fmt(B1, 4)}°, C = ${fmt(C1, 4)}°, c = ${fmt(c1, 4)}`,
            steps: [`sin(B) = ${fmt(sinB, 5)} ⇒ B₁ = ${fmt(B1, 4)}°`, `Supplementary angle B₂ = ${fmt(B2, 4)}° rejected because A + B₂ = ${fmt(A + B2, 2)}° ≥ 180°`, `Unique triangle: c = ${fmt(c1, 4)}, Area = ${fmt(area1, 4)}`],
            finalSummary: `Unique Triangle: B = ${fmt(B1, 3)}°, C = ${fmt(C1, 3)}°, c = ${fmt(c1, 4)}`
          });
        }
      } else if (active === 'heron') {
        const a = Number($('[data-field=a]').value), b = Number($('[data-field=b]').value), c = Number($('[data-field=c]').value);
        if (a <= 0 || b <= 0 || c <= 0 || a + b <= c || a + c <= b || b + c <= a) throw Error('These sides cannot form a valid triangle (require a + b > c)');
        const s = 0.5 * (a + b + c);
        const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
        updateResults([
          { label: 'Semiperimeter s = (a + b + c)/2', value: s },
          { label: "Triangle Area = √[s(s−a)(s−b)(s−c)]", value: area },
          { label: 'Perimeter & Inradius r = Area / s', value: `Perimeter = ${fmt(2 * s)},  r = ${fmt(area / s)}` }
        ], {
          inputs: [{ label: 'Sides a, b, c', rawVal: `${a}, ${b}, ${c}` }],
          formula: 's = (a + b + c)/2,  Area = √[s(s − a)(s − b)(s − c)]',
          substituted: `s = ${fmt(s)}, Area = ${fmt(area)}`,
          steps: [`Semiperimeter s = (${a}+${b}+${c})/2 = ${fmt(s)}`, `Area = √[${fmt(s)}·${fmt(s-a)}·${fmt(s-b)}·${fmt(s-c)}] = ${fmt(area)}`],
          finalSummary: `Semiperimeter = ${fmt(s)}, Area = ${fmt(area)}`
        });
      } else {
        const theta = Number($('[data-field=theta]').value), unit = $('[data-field=unit]').value;
        const rad = unit === 'deg' ? theta * Math.PI / 180 : theta;
        const s = Math.sin(rad), c = Math.cos(rad), tn = Math.tan(rad);
        updateResults([
          { label: 'sin θ', value: s },
          { label: 'cos θ', value: c },
          { label: 'tan θ', value: Math.abs(c) < 1e-12 ? 'Undefined' : tn },
          { label: 'Reciprocal Ratios (csc θ, sec θ, cot θ)', value: `csc = ${Math.abs(s) < 1e-12 ? 'Undefined' : fmt(1 / s)},  sec = ${Math.abs(c) < 1e-12 ? 'Undefined' : fmt(1 / c)},  cot = ${Math.abs(s) < 1e-12 ? 'Undefined' : fmt(c / s)}` }
        ], {
          inputs: [{ label: 'Angle θ', rawVal: `${theta} ${unit}` }],
          formula: 'sin(θ), cos(θ), tan(θ) = sin(θ)/cos(θ), csc = 1/sin, sec = 1/cos, cot = cos/sin',
          substituted: `rad = ${fmt(rad)}`,
          steps: [`sin(θ) = ${fmt(s)}, cos(θ) = ${fmt(c)}, tan(θ) = ${fmt(tn)}`],
          finalSummary: `sin = ${fmt(s)}, cos = ${fmt(c)}, tan = ${fmt(tn)}`
        });
      }
    });
  }
  $$('[data-tt]').forEach(btn => btn.addEventListener('click', () => {
    $$('[data-tt]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    active = btn.dataset.tt;
    renderMode();
  }));
  renderMode();
}

function trig(t) {
  return triangle_trig_suite(t, 'trig_ratios');
}

function kinematics_suvat() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${dropdown('Known SUVAT Variable Pair', 'pair', [
      ['u_a_t', 'Given u, a, t → Find v & s'],
      ['u_v_t', 'Given u, v, t → Find a & s'],
      ['u_v_a', 'Given u, v, a → Find s & t'],
      ['u_a_s', 'Given u, a, s → Find v & t']
    ], 'u_a_t')}
    ${input('Initial Velocity u (m/s)', 'u', 10)}${input('Second Input (a or v)', 'p2', 2)}
    ${input('Third Input (t or a or s)', 'p3', 5)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const pair = $('[data-field=pair]').value;
    const u = Number($('[data-field=u]').value), p2 = Number($('[data-field=p2]').value), p3 = Number($('[data-field=p3]').value);
    let v = 0, a = 0, t = 0, s = 0, eqUsed = '';
    if (pair === 'u_a_t') {
      a = p2; t = p3; v = u + a * t; s = u * t + 0.5 * a * t * t;
      eqUsed = 'v = u + at,  s = ut + ½at²';
    } else if (pair === 'u_v_t') {
      v = p2; t = p3;
      if (t === 0) throw Error('Time t cannot be 0');
      a = (v - u) / t; s = 0.5 * (u + v) * t;
      eqUsed = 'a = (v − u)/t,  s = ½(u + v)t';
    } else if (pair === 'u_v_a') {
      v = p2; a = p3;
      if (a === 0) throw Error('Acceleration a cannot be 0 in this mode');
      t = (v - u) / a; s = (v * v - u * u) / (2 * a);
      eqUsed = 't = (v − u)/a,  s = (v² − u²)/(2a)';
    } else {
      a = p2; s = p3;
      const v2 = u * u + 2 * a * s;
      if (v2 < 0) throw Error('u² + 2as < 0 (unphysical real velocity)');
      v = Math.sqrt(v2);
      t = a !== 0 ? (v - u) / a : (u !== 0 ? s / u : 0);
      eqUsed = 'v = √(u² + 2as),  t = (v − u)/a';
    }
    updateResults([
      { label: 'Displacement (s)', value: s, unit: 'm' },
      { label: 'Final Velocity (v)', value: v, unit: 'm/s' },
      { label: 'Acceleration (a) & Elapsed Time (t)', value: `a = ${fmt(a)} m/s²,  t = ${fmt(t)} s` },
      { label: 'Average Velocity v_avg = ½(u + v)', value: 0.5 * (u + v), unit: 'm/s' }
    ], {
      inputs: [{ label: 'Mode', rawVal: pair }, { label: 'u', rawVal: u }, { label: 'Input 2', rawVal: p2 }, { label: 'Input 3', rawVal: p3 }],
      formula: eqUsed,
      substituted: `u = ${fmt(u)}, v = ${fmt(v)}, a = ${fmt(a)}, s = ${fmt(s)}, t = ${fmt(t)}`,
      steps: [`Applied kinematic equations: ${eqUsed}`, `v = ${fmt(v)} m/s, s = ${fmt(s)} m, a = ${fmt(a)} m/s², t = ${fmt(t)} s`],
      finalSummary: `s = ${fmt(s)} m, v = ${fmt(v)} m/s`
    });
  });
  bind(calc);
}

// Statistics & Probability Renderers
function stats() {
  $('#calculator-app').innerHTML = `${textArea('Dataset Values (comma or space separated)', 'data', '10, 12, 23, 23, 16, 23, 21, 16', 3)}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const arr = parseNumberList($('[data-field=data]').value);
    if (arr.length < 2) throw Error('Enter at least two numeric observations');
    const res = descriptive(arr);
    updateResults(Object.entries(res).map(([label, value]) => ({ label, value })), {
      inputs: [{ label: 'n', rawVal: res.Count }, { label: 'Dataset', rawVal: arr.join(', ') }],
      formula: 'x̄ = (1/n)Σxᵢ,  s² = Σ(xᵢ − x̄)²/(n − 1),  σ² = Σ(xᵢ − x̄)²/n',
      substituted: `Mean = ${fmt(res.Mean)}, Median = ${fmt(res.Median)}`,
      steps: [`Count n = ${res.Count}, Sum = ${fmt(res.Sum)}, Mean = ${fmt(res.Mean)}`, `Sample SD s = ${fmt(res['Sample std. deviation'])}, Population SD σ = ${fmt(res['Population std. deviation'])}`],
      finalSummary: `Mean = ${fmt(res.Mean)}, Sample SD s = ${fmt(res['Sample std. deviation'])}`
    });
  });
  bind(calc);
}

function regression() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input('Predictor Values X (comma-separated)', 'x', '1, 2, 3, 4, 5', 'text')}
    ${input('Response Values Y (comma-separated)', 'y', '2.1, 3.9, 6.2, 8.0, 9.9', 'text')}
    ${input('Forecast / Predict at X₀', 'x0', 6)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const x = parseNumberList($('[data-field=x]').value), y = parseNumberList($('[data-field=y]').value);
    const x0 = Number($('[data-field=x0]').value);
    if (x.length < 2 || x.length !== y.length) throw Error('Enter equal-length X and Y arrays with at least 2 points');
    const n = x.length;
    const mx = x.reduce((a, b) => a + b, 0) / n, my = y.reduce((a, b) => a + b, 0) / n;
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i++) {
      sxy += (x[i] - mx) * (y[i] - my);
      sxx += (x[i] - mx) ** 2;
      syy += (y[i] - my) ** 2;
    }
    if (sxx === 0 || syy === 0) throw Error('Both X and Y datasets must vary');
    const slope = sxy / sxx, intercept = my - slope * mx;
    const r = sxy / Math.sqrt(sxx * syy);
    const yPred = intercept + slope * x0;
    updateResults([
      { label: 'Pearson Correlation Coefficient (r)', value: r },
      { label: 'Slope (m) & Intercept (b)', value: `m = ${fmt(slope, 5)},  b = ${fmt(intercept, 5)}` },
      { label: 'Coefficient of Determination (R²) & Sample Covariance', value: `R² = ${fmt(r * r, 5)},  Cov(X,Y) = ${fmt(sxy / (n - 1), 5)}` },
      { label: `OLS Regression Line & Forecast ŷ(${x0})`, value: `ŷ = ${fmt(slope, 4)}x ${intercept >= 0 ? '+' : '−'} ${fmt(Math.abs(intercept), 4)}  |  ŷ(${x0}) = ${fmt(yPred, 4)}` }
    ], {
      inputs: [{ label: 'X', rawVal: x.join(', ') }, { label: 'Y', rawVal: y.join(', ') }],
      formula: 'b₁ = S_xy / S_xx,  b₀ = ȳ − b₁x̄,  r = S_xy / √(S_xx S_yy)',
      substituted: `b₁ = ${fmt(sxy)} / ${fmt(sxx)} = ${fmt(slope)}`,
      steps: [`x̄ = ${fmt(mx)}, ȳ = ${fmt(my)}`, `S_xy = ${fmt(sxy)}, S_xx = ${fmt(sxx)}, S_yy = ${fmt(syy)}`, `r = ${fmt(r)}, R² = ${fmt(r * r)}`],
      finalSummary: `r = ${fmt(r, 4)}, ŷ = ${fmt(slope, 4)}x + ${fmt(intercept, 4)}`
    });
  });
  bind(calc);
}

function covariance_calc() {
  return regression();
}

function normal_dist() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input('Value (x)', 'x', 1.96)}${input('Mean (μ)', 'mu', 0)}
    ${input('Standard Deviation (σ > 0)', 'sd', 1)}${input('Quantile Probability p ∈ (0, 1)', 'p', 0.975)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const x = Number($('[data-field=x]').value), mu = Number($('[data-field=mu]').value);
    const sd = Number($('[data-field=sd]').value), p = Number($('[data-field=p]').value);
    if (sd <= 0) throw Error('Standard deviation σ must be positive');
    const z = (x - mu) / sd;
    const pdf = normalPdf(x, mu, sd);
    const cdfL = normalCdf(x, mu, sd);
    const cdfR = 1 - cdfL;
    const twoTail = 2 * (1 - normalCdf(Math.abs(z), 0, 1));
    const qVal = (p > 0 && p < 1) ? normalInv(p, mu, sd) : NaN;
    updateResults([
      { label: 'Left-Tail Cumulative Probability P(X ≤ x)', value: cdfL },
      { label: 'Standardized Z-Score z = (x − μ)/σ & Density f(x)', value: `z = ${fmt(z, 5)},  f(x) = ${fmt(pdf, 6)}` },
      { label: 'Right-Tail P(X > x) & Two-Tailed P(|Z| ≥ |z|)', value: `P(X > x) = ${fmt(cdfR, 6)},  Two-tailed = ${fmt(twoTail, 6)}` },
      { label: `Inverse Normal Quantile x_p for P(X ≤ x_p) = ${p}`, value: Number.isFinite(qVal) ? qVal : 'Enter p ∈ (0, 1)' }
    ], {
      inputs: [{ label: 'x, μ, σ', rawVal: `${x}, ${mu}, ${sd}` }, { label: 'p', rawVal: p }],
      formula: 'Φ(z) = ½[1 + erf(z / √2)],  x_p = μ + σ·Φ⁻¹(p)',
      substituted: `z = ${fmt(z)}, Φ(${fmt(z)}) = ${fmt(cdfL, 6)}`,
      steps: [`z = (${x} − ${mu}) / ${sd} = ${fmt(z)}`, `P(X ≤ ${x}) = ${fmt(cdfL, 6)}, P(X > ${x}) = ${fmt(cdfR, 6)}`, `Quantile x_${p} = ${fmt(qVal, 5)}`],
      finalSummary: `z = ${fmt(z, 4)}, P(X ≤ x) = ${fmt(cdfL, 5)}`
    });
  });
  bind(calc);
}

function binomial() {
  $('#calculator-app').innerHTML = `<div class="control-grid">${input('Number of Trials (n)', 'n', 10)}${input('Exact Successes (k)', 'k', 5)}${input('Success Probability p ∈ [0, 1]', 'p', 0.5)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const n = Math.round(Number($('[data-field=n]').value)), k = Math.round(Number($('[data-field=k]').value)), p = Number($('[data-field=p]').value);
    if (n < 1 || k < 0 || k > n || p < 0 || p > 1) throw Error('Require 0 ≤ k ≤ n and 0 ≤ p ≤ 1');
    const pmf = j => known.comb(n, j) * (p ** j) * ((1 - p) ** (n - j));
    const exact = pmf(k);
    let cdf = 0;
    for (let j = 0; j <= k; j++) cdf += pmf(j);
    const mean = n * p, sd = Math.sqrt(n * p * (1 - p));
    updateResults([
      { label: `Exact Binomial PMF P(X = ${k})`, value: exact },
      { label: `Cumulative P(X ≤ ${k}) & Upper Tail P(X ≥ ${k})`, value: `P(X ≤ ${k}) = ${fmt(cdf, 6)},  P(X ≥ ${k}) = ${fmt(1 - cdf + exact, 6)}` },
      { label: 'Mean (μ = np), Variance (σ² = np(1−p)) & SD (σ)', value: `μ = ${fmt(mean)},  σ² = ${fmt(n * p * (1 - p))},  σ = ${fmt(sd)}` }
    ], {
      inputs: [{ label: 'n, k, p', rawVal: `${n}, ${k}, ${p}` }],
      formula: 'P(X = k) = C(n, k) · p^k · (1 − p)^(n − k)',
      substituted: `C(${n}, ${k}) · ${p}^${k} · ${fmt(1 - p)}^${n - k} = ${fmt(exact, 6)}`,
      steps: [`C(${n}, ${k}) = ${known.comb(n, k)}`, `P(X = ${k}) = ${fmt(exact, 6)}`, `P(X ≤ ${k}) = ${fmt(cdf, 6)}`],
      finalSummary: `P(X = ${k}) = ${fmt(exact, 6)}, P(X ≤ ${k}) = ${fmt(cdf, 6)}`
    });
  });
  bind(calc);
}

function poisson_dist() {
  $('#calculator-app').innerHTML = `<div class="control-grid">${input('Event Rate Parameter (λ > 0)', 'lam', 4.5)}${input('Event Count (k ≥ 0 integer)', 'k', 3)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const lam = Number($('[data-field=lam]').value), k = Math.round(Number($('[data-field=k]').value));
    const res = poissonDist(lam, k);
    updateResults([
      { label: `Exact Poisson PMF P(X = ${k})`, value: res.pmf },
      { label: `Cumulative P(X ≤ ${k}) & Upper Tail P(X ≥ ${k})`, value: `P(X ≤ ${k}) = ${fmt(res.cdfLe, 6)},  P(X ≥ ${k}) = ${fmt(res.cdfGe, 6)}` },
      { label: 'Mean (μ = λ), Variance (σ² = λ) & SD (√λ)', value: `μ = ${fmt(res.mean)},  σ² = ${fmt(res.variance)},  σ = ${fmt(res.sd)}` }
    ], {
      inputs: [{ label: 'λ', rawVal: lam }, { label: 'k', rawVal: k }],
      formula: 'P(X = k) = (e^(−λ) · λ^k) / k!',
      substituted: `P(X = ${k}) = ${fmt(res.pmf, 6)}`,
      steps: [`P(X = ${k}) = exp(−${lam}) · ${lam}^${k} / ${k}! = ${fmt(res.pmf, 6)}`, `Cumulative P(X ≤ ${k}) = ${fmt(res.cdfLe, 6)}`],
      finalSummary: `P(X = ${k}) = ${fmt(res.pmf, 6)}, P(X ≤ ${k}) = ${fmt(res.cdfLe, 6)}`
    });
  });
  bind(calc);
}

function t_dist() {
  $('#calculator-app').innerHTML = `<div class="control-grid">${input('t-Statistic (t)', 't', 2.228)}${input('Degrees of Freedom (ν > 0)', 'df', 10)}${input('Two-Tailed Confidence Level (e.g. 0.95)', 'conf', 0.95)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const tVal = Number($('[data-field=t]').value), df = Number($('[data-field=df]').value), conf = Number($('[data-field=conf]').value);
    if (df <= 0) throw Error('Degrees of freedom ν must be positive');
    const cdf = studentTCdf(tVal, df);
    const twoTailP = 2 * (1 - studentTCdf(Math.abs(tVal), df));
    const alpha = 1 - conf;
    const tCrit = (conf > 0 && conf < 1) ? studentTInv(1 - alpha / 2, df) : NaN;
    updateResults([
      { label: `Cumulative Probability P(T ≤ ${tVal}) (ν = ${df})`, value: cdf },
      { label: `Two-Tailed p-Value P(|T| ≥ |${tVal}|) & One-Tailed P(T > ${tVal})`, value: `Two-tailed p = ${fmt(twoTailP, 6)},  Right-tail p = ${fmt(1 - cdf, 6)}` },
      { label: `Critical Value ±t_{α/2, ${df}} for ${(conf * 100).toFixed(1)}% Confidence`, value: `±${fmt(tCrit, 5)}` }
    ], {
      inputs: [{ label: 't', rawVal: tVal }, { label: 'df ν', rawVal: df }, { label: 'Confidence', rawVal: conf }],
      formula: 'Regularized incomplete beta function I_{ν/(ν+t²)}(ν/2, 1/2)',
      substituted: `P(T ≤ ${tVal}) = ${fmt(cdf, 6)}, Two-tailed p = ${fmt(twoTailP, 6)}`,
      steps: [`Evaluated Student t CDF at t = ${tVal}, ν = ${df}: ${fmt(cdf, 6)}`, `Two-tailed p-value = ${fmt(twoTailP, 6)}`, `Critical value t* = ±${fmt(tCrit, 5)}`],
      finalSummary: `P(T ≤ ${tVal}) = ${fmt(cdf, 5)}, t* = ±${fmt(tCrit, 4)}`
    });
  });
  bind(calc);
}

function chi2_dist() {
  $('#calculator-app').innerHTML = `<div class="control-grid">${input('Chi-Square Statistic (χ² ≥ 0)', 'x', 9.488)}${input('Degrees of Freedom (k > 0)', 'df', 4)}${input('Significance Level α (e.g. 0.05)', 'alpha', 0.05)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const x = Number($('[data-field=x]').value), df = Number($('[data-field=df]').value), alpha = Number($('[data-field=alpha]').value);
    if (df <= 0 || x < 0) throw Error('Require χ² ≥ 0 and degrees of freedom k > 0');
    const cdf = chiSquareCdf(x, df);
    const pVal = 1 - cdf;
    const crit = (alpha > 0 && alpha < 1) ? chiSquareInv(1 - alpha, df) : NaN;
    updateResults([
      { label: `Right-Tail p-Value P(χ² ≥ ${x})`, value: pVal },
      { label: `Cumulative Probability P(χ² ≤ ${x})`, value: cdf },
      { label: `Critical Value χ²_{${alpha}, ${df}}`, value: crit },
      { label: `Decision at α = ${alpha}`, value: pVal < alpha ? `Reject H₀ (χ² = ${fmt(x, 4)} > ${fmt(crit, 4)})` : `Fail to Reject H₀ (χ² = ${fmt(x, 4)} ≤ ${fmt(crit, 4)})` }
    ], {
      inputs: [{ label: 'χ²', rawVal: x }, { label: 'df k', rawVal: df }, { label: 'α', rawVal: alpha }],
      formula: 'P(χ² ≤ x) = P(k/2, x/2) = γ(k/2, x/2) / Γ(k/2)',
      substituted: `P(χ² ≥ ${x}) = ${fmt(pVal, 6)}, χ²_crit = ${fmt(crit, 4)}`,
      steps: [`Regularized lower incomplete gamma P(${df / 2}, ${x / 2}) = ${fmt(cdf, 6)}`, `Right-tail p-value = ${fmt(pVal, 6)}`, `Critical value at α = ${alpha}: ${fmt(crit, 4)}`],
      finalSummary: `p-value = ${fmt(pVal, 5)}, χ²_crit = ${fmt(crit, 4)}`
    });
  });
  bind(calc);
}

function hypothesis_test() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${dropdown('Hypothesis Test Type', 'kind', [
      ['t1', 'One-Sample t-Test (Mean x̄ vs μ₀ with Sample SD s)'],
      ['z1', 'One-Sample Z-Test (Mean x̄ vs μ₀ with Known σ)'],
      ['prop1', 'One-Sample Proportion Z-Test (p̂ vs p₀)']
    ], 't1')}
    ${input('Sample Mean x̄ (or Sample Proportion p̂)', 'xbar', 105)}${input('Null Hypothesis Value μ₀ (or p₀)', 'mu0', 100)}
    ${input('Sample SD s / σ (ignored for proportion)', 's', 15)}${input('Sample Size (n)', 'n', 36)}
    ${input('Significance Level α', 'alpha', 0.05)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const kind = $('[data-field=kind]').value;
    const xbar = Number($('[data-field=xbar]').value), mu0 = Number($('[data-field=mu0]').value);
    const s = Number($('[data-field=s]').value), n = Math.round(Number($('[data-field=n]').value)), alpha = Number($('[data-field=alpha]').value);
    if (n < 2) throw Error('Sample size n must be at least 2');
    let stat = 0, pTwo = 0, pRight = 0, se = 0, statName = 't';
    if (kind === 'prop1') {
      if (mu0 <= 0 || mu0 >= 1) throw Error('Null proportion p₀ must be in (0, 1)');
      se = Math.sqrt((mu0 * (1 - mu0)) / n);
      stat = (xbar - mu0) / se;
      statName = 'z';
      pTwo = 2 * (1 - normalCdf(Math.abs(stat)));
      pRight = 1 - normalCdf(stat);
    } else if (kind === 'z1') {
      se = s / Math.sqrt(n);
      stat = (xbar - mu0) / se;
      statName = 'z';
      pTwo = 2 * (1 - normalCdf(Math.abs(stat)));
      pRight = 1 - normalCdf(stat);
    } else {
      se = s / Math.sqrt(n);
      stat = (xbar - mu0) / se;
      statName = `t (df=${n - 1})`;
      pTwo = 2 * (1 - studentTCdf(Math.abs(stat), n - 1));
      pRight = 1 - studentTCdf(stat, n - 1);
    }
    const decision = pTwo < alpha ? `Reject H₀ at α = ${alpha} (Statistically Significant)` : `Fail to Reject H₀ at α = ${alpha}`;
    updateResults([
      { label: `Test Statistic (${statName})`, value: stat },
      { label: 'Two-Tailed & One-Tailed p-Values', value: `Two-tailed p = ${fmt(pTwo, 6)},  Right-tailed p = ${fmt(pRight, 6)}` },
      { label: 'Standard Error (SE) & Decision', value: `SE = ${fmt(se, 5)}  |  ${decision}` }
    ], {
      inputs: [{ label: 'Test', rawVal: kind }, { label: 'x̄ / p̂', rawVal: xbar }, { label: 'μ₀ / p₀', rawVal: mu0 }, { label: 'n', rawVal: n }],
      formula: 'Test Statistic = (Estimate − Null) / SE',
      substituted: `(${xbar} − ${mu0}) / ${fmt(se, 5)} = ${fmt(stat, 5)}`,
      steps: [`Standard Error SE = ${fmt(se, 5)}`, `Test statistic = ${fmt(stat, 5)}`, `Two-tailed p-value = ${fmt(pTwo, 6)} ⇒ ${decision}`],
      finalSummary: `Statistic = ${fmt(stat, 4)}, two-tailed p = ${fmt(pTwo, 5)} (${decision})`
    });
  });
  bind(calc);
}

function pvalue_calc() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${dropdown('Test Statistic Distribution', 'dist', [
      ['z', 'Standard Normal (Z)'],
      ['t', "Student's t-Distribution (t)"],
      ['chi2', 'Chi-Square Distribution (χ²)'],
      ['f', 'F-Distribution (F)']
    ], 'z')}
    ${input('Observed Test Statistic', 'stat', 2.15)}${input('Degrees of Freedom df₁ (for t, χ², F)', 'df1', 15)}
    ${input('Denominator Degrees of Freedom df₂ (for F)', 'df2', 20)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const dist = $('[data-field=dist]').value;
    const stat = Number($('[data-field=stat]').value), df1 = Number($('[data-field=df1]').value), df2 = Number($('[data-field=df2]').value);
    let left = 0, right = 0, two = 0;
    if (dist === 'z') {
      left = normalCdf(stat); right = 1 - left; two = 2 * (1 - normalCdf(Math.abs(stat)));
    } else if (dist === 't') {
      left = studentTCdf(stat, df1); right = 1 - left; two = 2 * (1 - studentTCdf(Math.abs(stat), df1));
    } else if (dist === 'chi2') {
      left = chiSquareCdf(Math.max(0, stat), df1); right = 1 - left; two = right;
    } else {
      left = fDistCdf(Math.max(0, stat), df1, df2); right = 1 - left; two = right;
    }
    updateResults([
      { label: 'Two-Tailed p-Value (or Upper Tail for χ²/F)', value: two },
      { label: 'Right-Tail p-Value P(Stat ≥ x) & Left-Tail P(Stat ≤ x)', value: `Right-tail = ${fmt(right, 6)},  Left-tail = ${fmt(left, 6)}` },
      { label: 'Significance Threshold Check', value: `α = 0.05: ${two < 0.05 ? 'Significant' : 'Not significant'}  |  α = 0.01: ${two < 0.01 ? 'Significant' : 'Not significant'}` }
    ], {
      inputs: [{ label: 'Distribution', rawVal: dist }, { label: 'Statistic', rawVal: stat }, { label: 'df₁, df₂', rawVal: `${df1}, ${df2}` }],
      formula: 'Exact tail probability integral from Normal, Student-t, Chi-Square, or Snedecor F CDF',
      substituted: `Right-tail p = ${fmt(right, 6)}, Two-tailed p = ${fmt(two, 6)}`,
      steps: [`Evaluated ${dist.toUpperCase()} CDF at ${stat}: P(≤ ${stat}) = ${fmt(left, 6)}`, `Two-tailed p-value = ${fmt(two, 6)}`],
      finalSummary: `p = ${fmt(two, 6)}`
    });
  });
  bind(calc);
}

function sample_size() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input('Confidence Level (e.g. 0.95 for 95%)', 'conf', 0.95)}${input('Margin of Error E (as decimal, e.g. 0.05)', 'E', 0.05)}
    ${input('Estimated Proportion p̂ ∈ (0, 1)', 'p', 0.5)}${input('Population Size N (0 for infinite)', 'N', 0)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const conf = Number($('[data-field=conf]').value), E = Number($('[data-field=E]').value);
    const p = Number($('[data-field=p]').value), N = Number($('[data-field=N]').value);
    if (conf <= 0 || conf >= 1 || E <= 0 || p <= 0 || p >= 1) throw Error('Require confidence ∈ (0,1), E > 0, and p ∈ (0,1)');
    const z = normalInv(1 - (1 - conf) / 2);
    const n0 = (z * z * p * (1 - p)) / (E * E);
    const nFinite = N > 0 ? n0 / (1 + (n0 - 1) / N) : n0;
    updateResults([
      { label: 'Required Sample Size (Rounded Up ⌈n⌉)', value: Math.ceil(nFinite) },
      { label: 'Infinite-Population Cochran Sample Size (n₀)', value: `${fmt(n0, 2)} (⌈n₀⌉ = ${Math.ceil(n0)})` },
      { label: 'Critical Z-Score z_{α/2}', value: z }
    ], {
      inputs: [{ label: 'Confidence', rawVal: conf }, { label: 'Margin E', rawVal: E }, { label: 'p̂', rawVal: p }, { label: 'N', rawVal: N || '∞' }],
      formula: 'n₀ = z²·p(1−p)/E²,  n_FPC = n₀ / [1 + (n₀ − 1)/N]',
      substituted: `z = ${fmt(z, 4)}, n₀ = ${fmt(n0, 2)}, ⌈n⌉ = ${Math.ceil(nFinite)}`,
      steps: [`Critical z_{α/2} = ${fmt(z, 5)}`, `Cochran formula n₀ = ${fmt(n0, 2)}`, `Required integer sample size = ${Math.ceil(nFinite)}`],
      finalSummary: `Required n = ${Math.ceil(nFinite)}`
    });
  });
  bind(calc);
}

function anova_calc() {
  $('#calculator-app').innerHTML = `${textArea('Treatment Groups (1 group per line, comma/space separated)', 'groups', '23, 25, 21, 24, 22\n30, 28, 31, 29, 32\n19, 20, 18, 21, 17', 4)}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const lines = $('[data-field=groups]').value.trim().split(/\n+/).map(l => parseNumberList(l)).filter(g => g.length > 0);
    const res = oneWayAnova(lines);
    const grpSummary = res.groupStats.map(g => `G${g.group} (n=${g.n}): x̄=${fmt(g.mean, 3)}, s=${fmt(g.sd, 3)}`).join('  |  ');
    updateResults([
      { label: `ANOVA F-Statistic F(${res.dfBetween}, ${res.dfWithin})`, value: res.fStat },
      { label: 'p-Value & Effect Size (η²)', value: `p-value = ${fmt(res.pVal, 6)},  η² = ${fmt(res.etaSq, 4)}` },
      { label: 'Sum of Squares (SSB, SSW, SST)', value: `SSB = ${fmt(res.ssBetween, 4)},  SSW = ${fmt(res.ssWithin, 4)},  SST = ${fmt(res.ssTotal, 4)}` },
      { label: 'Mean Squares (MSB & MSW) & Group Summary', value: `MSB = ${fmt(res.msBetween, 4)},  MSW = ${fmt(res.msWithin, 4)}  |  ${grpSummary}` }
    ], {
      inputs: [{ label: 'Groups k', rawVal: res.k }, { label: 'Total N', rawVal: res.N }],
      formula: 'F = MSB / MSW = [SSB/(k−1)] / [SSW/(N−k)]',
      substituted: `F = ${fmt(res.msBetween, 4)} / ${fmt(res.msWithin, 4)} = ${fmt(res.fStat, 5)}`,
      steps: [`Grand mean = ${fmt(res.grandMean, 4)}`, `SSB = ${fmt(res.ssBetween, 4)} (df=${res.dfBetween}), SSW = ${fmt(res.ssWithin, 4)} (df=${res.dfWithin})`, `F = ${fmt(res.fStat, 5)}, p = ${fmt(res.pVal, 6)}`],
      finalSummary: `F(${res.dfBetween}, ${res.dfWithin}) = ${fmt(res.fStat, 4)}, p = ${fmt(res.pVal, 5)}`
    });
  });
  bind(calc);
}

function multi_regression() {
  return linalg_ols();
}

function logistic_reg() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input('Intercept β₀', 'b0', -1.5)}${input('Coefficient β₁', 'b1', 0.8)}
    ${input('Predictor Value x₁', 'x1', 2.5)}${input('Coefficient β₂', 'b2', -0.4)}
    ${input('Predictor Value x₂', 'x2', 1.0)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const b0 = Number($('[data-field=b0]').value), b1 = Number($('[data-field=b1]').value), x1 = Number($('[data-field=x1]').value);
    const b2 = Number($('[data-field=b2]').value), x2 = Number($('[data-field=x2]').value);
    const z = b0 + b1 * x1 + b2 * x2;
    const odds = Math.exp(z);
    const prob = 1 / (1 + Math.exp(-z));
    updateResults([
      { label: 'Predicted Probability P(Y = 1 | X) = σ(z)', value: prob },
      { label: 'Linear Log-Odds (Logit z) & Odds P/(1−P)', value: `Logit z = ${fmt(z, 5)},  Odds = ${fmt(odds, 5)}` },
      { label: 'Odds Ratios exp(β₁) and exp(β₂)', value: `OR₁ = e^β₁ = ${fmt(Math.exp(b1), 4)},  OR₂ = e^β₂ = ${fmt(Math.exp(b2), 4)}` },
      { label: 'Binary Classification (0.5 Threshold)', value: prob >= 0.5 ? 'Class 1 (Positive, P ≥ 0.5)' : 'Class 0 (Negative, P < 0.5)' }
    ], {
      inputs: [{ label: 'β₀, β₁, β₂', rawVal: `${b0}, ${b1}, ${b2}` }, { label: 'x₁, x₂', rawVal: `${x1}, ${x2}` }],
      formula: 'z = β₀ + β₁x₁ + β₂x₂,  P(Y=1) = 1 / (1 + e^(−z))',
      substituted: `z = ${fmt(z, 5)}, P = 1 / (1 + e^(−${fmt(z, 5)})) = ${fmt(prob, 6)}`,
      steps: [`Logit z = ${b0} + ${b1}·${x1} + ${b2}·${x2} = ${fmt(z, 5)}`, `Odds = e^z = ${fmt(odds, 5)}`, `Sigmoid probability P(Y=1) = ${fmt(prob, 6)}`],
      finalSummary: `P(Y = 1) = ${fmt(prob, 5)}`
    });
  });
  bind(calc);
}

function stat_power() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input("Standardized Effect Size d (Cohen's d)", 'd', 0.5)}${input('Sample Size per Group (n)', 'n', 64)}
    ${input('Significance Level α (Two-Tailed)', 'alpha', 0.05)}${input('Target Power (1 − β) for Required n', 'targetPower', 0.8)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const d = Math.abs(Number($('[data-field=d]').value)), n = Number($('[data-field=n]').value);
    const alpha = Number($('[data-field=alpha]').value), targetPower = Number($('[data-field=targetPower]').value);
    if (d <= 0 || n < 2 || alpha <= 0 || alpha >= 1 || targetPower <= 0 || targetPower >= 1) throw Error('Require d > 0, n ≥ 2, and α, power ∈ (0, 1)');
    const zCrit = normalInv(1 - alpha / 2);
    const ncp = d * Math.sqrt(n / 2);
    const powerTwoSample = 1 - normalCdf(zCrit - ncp) + normalCdf(-zCrit - ncp);
    const zBeta = normalInv(targetPower);
    const reqNPerGroup = Math.ceil(2 * (((zCrit + zBeta) / d) ** 2));
    updateResults([
      { label: `Achieved Statistical Power (1 − β) at n = ${n} per group`, value: powerTwoSample },
      { label: 'Type II Error Rate (β)', value: 1 - powerTwoSample },
      { label: `Required Sample Size per Group for ${(targetPower * 100).toFixed(0)}% Power`, value: `${reqNPerGroup} per group (${2 * reqNPerGroup} total)` }
    ], {
      inputs: [{ label: "Cohen's d", rawVal: d }, { label: 'n per group', rawVal: n }, { label: 'α', rawVal: alpha }],
      formula: '1 − β ≈ Φ(d√(n/2) − z_{α/2}),  n_req = 2·[(z_{α/2} + z_{1−β}) / d]²',
      substituted: `ncp = ${fmt(ncp, 4)}, z_{α/2} = ${fmt(zCrit, 4)}, Power = ${fmt(powerTwoSample, 5)}`,
      steps: [`Critical value z_{α/2} = ${fmt(zCrit, 4)}`, `Non-centrality parameter δ = ${fmt(ncp, 4)}`, `Statistical power (1 − β) = ${fmt(powerTwoSample, 5)}, Required n per group = ${reqNPerGroup}`],
      finalSummary: `Power = ${fmt(powerTwoSample, 4)}, Required n = ${reqNPerGroup}/group`
    });
  });
  bind(calc);
}

// Finance Renderers
function finance_npv(t, initialMode, focusIrr = false) {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input('Discount Rate (% per period)', 'rate', 10)}
    ${input('Cash Flows CF₀, CF₁, …, CFₙ (comma-separated)', 'cfs', '-1000, 300, 400, 500, 600', 'text')}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const rate = Number($('[data-field=rate]').value);
    const cfs = parseNumberList($('[data-field=cfs]').value);
    const res = calcNpvIrr(rate, cfs);
    updateResults([
      focusIrr
        ? { label: 'Internal Rate of Return (IRR %)', value: res.irr !== null ? res.irr : 'No real IRR', unit: res.irr !== null ? '%' : '' }
        : { label: 'Net Present Value (NPV)', value: res.npv },
      focusIrr
        ? { label: `Net Present Value (NPV at ${rate}%)`, value: res.npv }
        : { label: 'Internal Rate of Return (IRR %)', value: res.irr !== null ? `${fmt(res.irr, 4)}%` : 'No real IRR' },
      { label: 'Profitability Index (PI = PV of Inflows / |CF₀|)', value: res.profitabilityIndex ?? 'N/A' },
      { label: 'Total Net Undiscounted Cash Flow', value: res.totalNetCashFlow }
    ], {
      inputs: [{ label: 'Discount Rate', rawVal: `${rate}%` }, { label: 'Cash Flows', rawVal: cfs.join(', ') }],
      formula: 'NPV = Σ_{t=0}^n CF_t / (1 + r)^t; IRR solves NPV(IRR) = 0',
      substituted: `NPV = ${fmt(res.npv, 2)}, IRR = ${res.irr !== null ? fmt(res.irr, 4) + '%' : 'N/A'}`,
      steps: [`Discounted ${cfs.length} cash flows at r = ${rate}%`, `NPV = ${fmt(res.npv, 2)}`, `Solved NPV(IRR) = 0 ⇒ IRR = ${res.irr !== null ? fmt(res.irr, 4) + '%' : 'N/A'}`],
      finalSummary: `NPV = ${fmt(res.npv, 2)}, IRR = ${res.irr !== null ? fmt(res.irr, 3) + '%' : 'N/A'}`
    });
  });
  bind(calc);
}

function finance_irr(t, initialMode) {
  return finance_npv(t, initialMode, true);
}

function finance_xirr() {
  $('#calculator-app').innerHTML = `${textArea('Dated Cash Flows (one per line as YYYY-MM-DD, amount)', 'rows', '2024-01-01, -10000\n2024-06-15, 2500\n2025-01-01, 4500\n2025-09-01, 5200', 4)}
    ${input('Discount Rate (% p.a. for XNPV)', 'rate', 8)}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const rate = Number($('[data-field=rate]').value);
    const lines = $('[data-field=rows]').value.trim().split(/\n+/);
    const cfs = [], datesMs = [];
    for (const line of lines) {
      const [d, v] = line.split(',').map(s => s.trim());
      if (!d || v === undefined) continue;
      const ms = Date.parse(d + 'T00:00:00Z');
      if (isNaN(ms)) throw Error(`Invalid date "${d}" (use YYYY-MM-DD)`);
      datesMs.push(ms);
      cfs.push(Number(v));
    }
    const xirrPct = calcXirr(cfs, datesMs);
    const d0 = datesMs[0];
    const xnpv = cfs.reduce((s, cf, i) => s + cf / Math.pow(1 + rate / 100, (datesMs[i] - d0) / (365 * 86400000)), 0);
    updateResults([
      { label: 'Annualized XIRR (%)', value: xirrPct, unit: '%' },
      { label: `Exact-Day XNPV (at ${rate}% p.a.)`, value: xnpv },
      { label: 'Total Net Cash Flow ΣCF', value: cfs.reduce((a, b) => a + b, 0) }
    ], {
      inputs: [{ label: 'Cash flow count', rawVal: cfs.length }, { label: 'Discount rate', rawVal: `${rate}%` }],
      formula: 'XNPV = Σ CF_i / (1 + r)^((d_i − d_0)/365)',
      substituted: `XIRR = ${fmt(xirrPct, 4)}%, XNPV = ${fmt(xnpv, 2)}`,
      steps: [`Evaluated exact day-count fractions (d_i − d_0)/365`, `XNPV at ${rate}% = ${fmt(xnpv, 2)}`, `Annualized XIRR = ${fmt(xirrPct, 4)}%`],
      finalSummary: `XIRR = ${fmt(xirrPct, 4)}%, XNPV = ${fmt(xnpv, 2)}`
    });
  });
  bind(calc);
}

function finance_bond() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input('Face / Par Value (F)', 'face', 1000)}${input('Annual Coupon Rate (%)', 'cRate', 5)}
    ${input('Required Yield to Maturity (% p.a.)', 'yRate', 6)}${input('Years to Maturity (T)', 'years', 10)}
    ${input('Coupon Payments per Year (m)', 'freq', 2)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const face = Number($('[data-field=face]').value), cRate = Number($('[data-field=cRate]').value);
    const yRate = Number($('[data-field=yRate]').value), years = Number($('[data-field=years]').value);
    const freq = Math.max(1, Math.round(Number($('[data-field=freq]').value) || 2));
    const res = calcBondValuation(face, cRate, yRate, years, freq);
    updateResults([
      { label: `Fair Bond Price (at ${yRate}% YTM)`, value: res.price },
      { label: 'Macaulay Duration & Modified Duration', value: `Macaulay = ${fmt(res.macaulayDuration, 4)} yrs,  Modified = ${fmt(res.modifiedDuration, 4)} yrs` },
      { label: 'Bond Convexity & Current Yield', value: `Convexity = ${fmt(res.convexity, 4)},  Current Yield = ${fmt(res.currentYield, 4)}%` }
    ], {
      inputs: [{ label: 'Face, Coupon%', rawVal: `${face}, ${cRate}%` }, { label: 'YTM%, Years', rawVal: `${yRate}%, ${years}` }],
      formula: 'P = Σ C/(1+y/m)^t + F/(1+y/m)^(mT)',
      substituted: `Fair Price = ${fmt(res.price, 2)}, Mod. Duration = ${fmt(res.modifiedDuration, 4)} yrs`,
      steps: [`Discounted ${Math.round(years * freq)} coupon periods + par redemption`, `Bond Price = ${fmt(res.price, 2)}`, `Macaulay Duration = ${fmt(res.macaulayDuration, 4)} yrs, Modified Duration = ${fmt(res.modifiedDuration, 4)} yrs`],
      finalSummary: `Price = ${fmt(res.price, 2)}, Mod. Duration = ${fmt(res.modifiedDuration, 3)} yrs`
    });
  });
  bind(calc);
}

function finance_mortgage() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input('Home Purchase Price', 'home', 400000)}${input('Down Payment Amount', 'down', 80000)}
    ${input('Annual Interest Rate (% p.a.)', 'rate', 6.5)}${input('Loan Term (Years)', 'years', 30)}
    ${input('Annual Property Tax', 'tax', 4800)}${input('Annual Home Insurance', 'ins', 1200)}
    ${input('Monthly HOA / Condo Fee', 'hoa', 150)}${input('Annual PMI Rate (% if LTV > 80%)', 'pmi', 0.6)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const home = Number($('[data-field=home]').value), down = Number($('[data-field=down]').value);
    const rate = Number($('[data-field=rate]').value), years = Number($('[data-field=years]').value);
    const tax = Number($('[data-field=tax]').value), ins = Number($('[data-field=ins]').value);
    const hoa = Number($('[data-field=hoa]').value), pmiRate = Number($('[data-field=pmi]').value);
    const L = home - down;
    if (L <= 0 || years <= 0) throw Error('Loan principal (Home − Down) and term must be positive');
    const n = years * 12, r = (rate / 100) / 12;
    const pi = r === 0 ? L / n : (L * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1);
    const ltv = (L / home) * 100;
    const mPmi = ltv > 80 ? (L * (pmiRate / 100)) / 12 : 0;
    const mTax = tax / 12, mIns = ins / 12;
    const totalMonthly = pi + mTax + mIns + hoa + mPmi;
    const totalInterest = pi * n - L;
    updateResults([
      { label: 'Total Monthly Payment (PITI + HOA + PMI)', value: totalMonthly },
      { label: 'Monthly Principal & Interest (P&I)', value: pi },
      { label: 'Monthly Tax, Insurance, HOA & PMI Breakdown', value: `Tax = ${fmt(mTax, 2)},  Ins = ${fmt(mIns, 2)},  HOA = ${fmt(hoa, 2)},  PMI = ${fmt(mPmi, 2)} (LTV = ${fmt(ltv, 1)}%)` },
      { label: 'Loan Principal & Total Lifetime Interest', value: `Principal = ${fmt(L, 2)},  Total Interest = ${fmt(totalInterest, 2)}` }
    ], {
      inputs: [{ label: 'Loan L', rawVal: L }, { label: 'Rate', rawVal: `${rate}%` }, { label: 'Term', rawVal: `${years} yrs` }],
      formula: 'P&I = L·r(1+r)^n / [(1+r)^n − 1]; Total = P&I + Tax/12 + Ins/12 + HOA + PMI',
      substituted: `P&I = ${fmt(pi, 2)}, Total Monthly = ${fmt(totalMonthly, 2)}`,
      steps: [`Loan principal L = ${home} − ${down} = ${fmt(L, 2)} (LTV = ${fmt(ltv, 1)}%)`, `Monthly P&I = ${fmt(pi, 2)}`, `Total monthly PITI+HOA = ${fmt(totalMonthly, 2)}`],
      finalSummary: `Monthly Total = ${fmt(totalMonthly, 2)} (P&I = ${fmt(pi, 2)})`
    });
  });
  bind(calc);
}

function finance_bs(t, initialMode, focusGreeks = false) {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input('Spot Price (S)', 'S', 100)}${input('Strike Price (K)', 'K', 100)}
    ${input('Time to Expiry T (Years)', 'T', 1)}${input('Risk-Free Rate r (% p.a.)', 'r', 5)}
    ${input('Implied Volatility σ (% p.a.)', 'vol', 20)}${input('Continuous Dividend Yield q (% p.a.)', 'q', 0)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const S = Number($('[data-field=S]').value), K = Number($('[data-field=K]').value), T = Number($('[data-field=T]').value);
    const r = Number($('[data-field=r]').value), vol = Number($('[data-field=vol]').value), q = Number($('[data-field=q]').value);
    const bs = calcBlackScholes(S, K, T, r, vol, q);
    updateResults([
      focusGreeks
        ? { label: 'Call Delta (Δ_call)', value: bs.callDelta }
        : { label: 'European Call Option Price (C)', value: bs.callPrice },
      focusGreeks
        ? { label: 'Put Delta (Δ_put) & Gamma (Γ)', value: `Δ_put = ${fmt(bs.putDelta, 5)},  Γ = ${fmt(bs.gamma, 6)}` }
        : { label: 'European Put Option Price (P)', value: bs.putPrice },
      focusGreeks
        ? { label: 'Vega (per 1% σ), Theta (per day) & Rho (per 1% r)', value: `Vega = ${fmt(bs.vega, 5)},  Θ_call = ${fmt(bs.callTheta, 5)}/day,  ρ_call = ${fmt(bs.callRho, 5)}` }
        : { label: 'd₁, d₂ & Primary Greeks (Δ_call, Γ, Vega)', value: `d₁ = ${fmt(bs.d1, 4)},  d₂ = ${fmt(bs.d2, 4)},  Δ_call = ${fmt(bs.callDelta, 4)},  Γ = ${fmt(bs.gamma, 5)},  Vega = ${fmt(bs.vega, 4)}` }
    ], {
      inputs: [{ label: 'S, K, T', rawVal: `${S}, ${K}, ${T}` }, { label: 'r%, σ%, q%', rawVal: `${r}%, ${vol}%, ${q}%` }],
      formula: 'C = S·e^(−qT)Φ(d₁) − K·e^(−rT)Φ(d₂),  P = K·e^(−rT)Φ(−d₂) − S·e^(−qT)Φ(−d₁)',
      substituted: `d₁ = ${fmt(bs.d1, 4)}, d₂ = ${fmt(bs.d2, 4)}, Call = ${fmt(bs.callPrice, 4)}, Put = ${fmt(bs.putPrice, 4)}`,
      steps: [`d₁ = ${fmt(bs.d1, 5)}, d₂ = ${fmt(bs.d2, 5)}`, `Call C = ${fmt(bs.callPrice, 4)}, Put P = ${fmt(bs.putPrice, 4)}`, `Δ_call = ${fmt(bs.callDelta, 5)}, Γ = ${fmt(bs.gamma, 5)}, Vega = ${fmt(bs.vega, 5)}`],
      finalSummary: `Call = ${fmt(bs.callPrice, 4)}, Put = ${fmt(bs.putPrice, 4)}, Δ_call = ${fmt(bs.callDelta, 4)}`
    });
  });
  bind(calc);
}

function finance_greeks(t, initialMode) {
  return finance_bs(t, initialMode, true);
}

function finance_depreciation() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input('Initial Asset Cost (C)', 'cost', 50000)}${input('Salvage / Residual Value (S)', 'salv', 5000)}
    ${input('Useful Life (N Years)', 'life', 5)}${input('Evaluation Year k (1 to N)', 'yr', 1)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const cost = Number($('[data-field=cost]').value), salv = Number($('[data-field=salv]').value);
    const life = Math.max(1, Math.round(Number($('[data-field=life]').value)));
    const yr = Math.max(1, Math.min(life, Math.round(Number($('[data-field=yr]').value) || 1)));
    if (cost < salv) throw Error('Asset cost must be greater than or equal to salvage value');
    const depBase = cost - salv;
    const sl = depBase / life;
    const sydDenom = (life * (life + 1)) / 2;
    const sydK = depBase * ((life - yr + 1) / sydDenom);
    let bv = cost, ddbK = 0;
    const ddbRate = 2 / life;
    for (let k = 1; k <= yr; k++) {
      ddbK = Math.max(0, Math.min(bv * ddbRate, bv - salv));
      bv -= ddbK;
    }
    updateResults([
      { label: `Straight-Line Annual Depreciation (Year ${yr})`, value: sl },
      { label: `Double-Declining Balance (DDB) in Year ${yr} & Ending Book Value`, value: `DDB_${yr} = ${fmt(ddbK, 2)},  Ending Book Value = ${fmt(bv, 2)}` },
      { label: `Sum-of-the-Years'-Digits (SYD) Depreciation in Year ${yr}`, value: sydK },
      { label: 'Total Depreciable Base (Cost − Salvage)', value: depBase }
    ], {
      inputs: [{ label: 'Cost, Salvage', rawVal: `${cost}, ${salv}` }, { label: 'Life, Year', rawVal: `${life}, ${yr}` }],
      formula: 'SL = (C−S)/N; DDB_k = 2/N · BV_{k-1}; SYD_k = (C−S)·(N−k+1)/[N(N+1)/2]',
      substituted: `SL = ${fmt(sl, 2)}, DDB_${yr} = ${fmt(ddbK, 2)}, SYD_${yr} = ${fmt(sydK, 2)}`,
      steps: [`Depreciable base = ${cost} − ${salv} = ${fmt(depBase, 2)}`, `Straight-line = ${fmt(sl, 2)}/yr`, `Year ${yr} DDB = ${fmt(ddbK, 2)}, SYD = ${fmt(sydK, 2)}`],
      finalSummary: `SL = ${fmt(sl, 2)}, DDB_${yr} = ${fmt(ddbK, 2)}, SYD_${yr} = ${fmt(sydK, 2)}`
    });
  });
  bind(calc);
}

function finance_prepayment() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input('Current Loan Balance (P)', 'P', 250000)}${input('Annual Interest Rate (% p.a.)', 'rate', 6.5)}
    ${input('Remaining Term (Years)', 'years', 25)}${input('Extra Monthly Principal Prepayment', 'extraM', 300)}
    ${input('One-Time Lump-Sum Prepayment Today', 'lump', 5000)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const P = Number($('[data-field=P]').value), rate = Number($('[data-field=rate]').value);
    const years = Number($('[data-field=years]').value), extraM = Number($('[data-field=extraM]').value), lump = Number($('[data-field=lump]').value);
    if (P <= 0 || years <= 0 || rate <= 0) throw Error('Balance, rate, and term must be positive');
    const n = Math.round(years * 12), r = (rate / 100) / 12;
    const baseEmi = (P * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1);
    const baseInterest = baseEmi * n - P;
    let bal = Math.max(0, P - lump), months = 0, newInterest = 0;
    while (bal > 0.01 && months < 1200) {
      const intPart = bal * r;
      newInterest += intPart;
      const prinPart = (baseEmi + extraM) - intPart;
      if (prinPart <= 0) throw Error('Payment does not cover monthly interest');
      bal = Math.max(0, bal - prinPart);
      months++;
    }
    const savedInterest = Math.max(0, baseInterest - newInterest);
    const savedMonths = Math.max(0, n - months);
    updateResults([
      { label: 'Total Interest Saved', value: savedInterest },
      { label: 'Time Saved', value: `${savedMonths} months (${fmt(savedMonths / 12, 2)} years)` },
      { label: 'Accelerated Payoff Term vs Original Term', value: `${months} months (${fmt(months / 12, 2)} yrs)  vs  ${n} months (${years} yrs)` },
      { label: 'Baseline Monthly Payment vs Accelerated Monthly Payment', value: `Base = ${fmt(baseEmi, 2)},  With Extra = ${fmt(baseEmi + extraM, 2)}` }
    ], {
      inputs: [{ label: 'Balance P', rawVal: P }, { label: 'Rate', rawVal: `${rate}%` }, { label: 'Extra Monthly / Lump', rawVal: `${extraM} / ${lump}` }],
      formula: 'Month-by-month amortization simulation with lump-sum and recurring curtailment',
      substituted: `Saved Interest = ${fmt(savedInterest, 2)}, Months Saved = ${savedMonths}`,
      steps: [`Original total interest = ${fmt(baseInterest, 2)} over ${n} months`, `New total interest = ${fmt(newInterest, 2)} over ${months} months`, `Interest saved = ${fmt(savedInterest, 2)}`],
      finalSummary: `Interest Saved = ${fmt(savedInterest, 2)}, Time Saved = ${savedMonths} months`
    });
  });
  bind(calc);
}

function finance_taxslab() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input('Gross Annual Income', 'inc', 120000)}${input('Standard / Itemized Deduction', 'ded', 14600)}</div>
    ${textArea('Progressive Brackets (Upper Limit, Tax Rate %)', 'slabs', '11600, 10\n47150, 12\n100525, 22\n191950, 24\ninf, 32', 4)}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const inc = Number($('[data-field=inc]').value), ded = Number($('[data-field=ded]').value);
    const taxable = Math.max(0, inc - ded);
    const slabs = $('[data-field=slabs]').value.trim().split(/\n+/).map(l => {
      const [u, r] = l.split(',').map(s => s.trim());
      return { cap: u.toLowerCase().includes('inf') ? Infinity : Number(u), rate: Number(r) };
    });
    let prev = 0, totalTax = 0, marginal = 0;
    const breakdown = [];
    for (const s of slabs) {
      if (taxable > prev) {
        const chunk = Math.min(taxable, s.cap) - prev;
        const taxChunk = chunk * (s.rate / 100);
        totalTax += taxChunk;
        marginal = s.rate;
        breakdown.push(`${s.rate}% on ${fmt(chunk, 0)} = ${fmt(taxChunk, 2)}`);
      }
      prev = s.cap;
    }
    const effRate = inc > 0 ? (totalTax / inc) * 100 : 0;
    updateResults([
      { label: 'Total Income Tax Liability', value: totalTax },
      { label: 'Net Take-Home Pay (After Tax)', value: inc - totalTax },
      { label: 'Effective Tax Rate vs Marginal Tax Bracket', value: `Effective Rate = ${fmt(effRate, 2)}%,  Marginal Bracket = ${fmt(marginal, 1)}%` },
      { label: 'Bracket-by-Bracket Tax Breakdown', value: breakdown.join('  |  ') || '0 tax' }
    ], {
      inputs: [{ label: 'Gross Income', rawVal: inc }, { label: 'Deduction', rawVal: ded }, { label: 'Taxable Income', rawVal: taxable }],
      formula: 'T = Σ max(0, min(Taxable, U_i) − L_i) · r_i',
      substituted: `Total Tax = ${fmt(totalTax, 2)}, Effective Rate = ${fmt(effRate, 2)}%`,
      steps: breakdown.length ? breakdown : ['Taxable income is 0'],
      finalSummary: `Tax = ${fmt(totalTax, 2)} (Effective ${fmt(effRate, 2)}%)`
    });
  });
  bind(calc);
}

// Converters, Computing & Everyday Renderers
function converter() {
  const dims = Object.keys(unitGroups);
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${dropdown('Physical Dimension', 'group', dims, 'Length')}
    ${input('Value to Convert', 'value', 1)}
    ${dropdown('Convert From', 'from', Object.keys(unitGroups.Length), 'm')}
    ${dropdown('Convert To', 'to', Object.keys(unitGroups.Length), 'km')}</div>
    <div class="tool-actions"><button type="button" id="swap-units" class="outline-btn">⇄ Swap units</button></div>${actionBarHtml()}`;
  const group = $('[data-field=group]'), from = $('[data-field=from]'), to = $('[data-field=to]');
  function setup() {
    const u = Object.keys(unitGroups[group.value]);
    from.innerHTML = u.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
    to.innerHTML = from.innerHTML;
    to.selectedIndex = Math.min(1, u.length - 1);
    calc();
  }
  function calc() {
    evalSafe(() => {
      const v = Number($('[data-field=value]').value);
      const out = convertUnit(group.value, v, from.value, to.value);
      updateResults([{ label: `${from.value} → ${to.value}`, value: out, unit: to.value }], {
        inputs: [{ label: 'Dimension', rawVal: group.value }, { label: 'Input', rawVal: `${v} ${from.value}` }],
        formula: group.value === 'Temperature' ? 'Affine temperature scale conversion (°C, °F, K)' : 'Value_to = Value_from × (Factor_from / Factor_to)',
        substituted: `${v} ${from.value} = ${fmt(out)} ${to.value}`,
        steps: [`Converted ${v} ${from.value} in ${group.value} to ${fmt(out)} ${to.value}`],
        finalSummary: `${v} ${from.value} = ${fmt(out)} ${to.value}`
      });
    });
  }
  group.onchange = setup;
  $('#swap-units').onclick = () => { const v = from.value; from.value = to.value; to.value = v; calc(); };
  setup();
  bind(calc);
}

function base() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input('Integer String', 'value', 'FF', 'text')}
    ${input('Source Base (2–36)', 'from', 16)}
    ${input('Target Base (2–36)', 'to', 10)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const src = $('[data-field=value]').value.trim().toUpperCase();
    const fr = Math.round(Number($('[data-field=from]').value)), to = Math.round(Number($('[data-field=to]').value));
    if (fr < 2 || fr > 36 || to < 2 || to > 36) throw Error('Bases must be integers between 2 and 36');
    if (!/^[-+]?[0-9A-Z]+$/.test(src) || src.length > 200) throw Error('Enter a valid integer (maximum 200 digits)');
    const neg = src[0] === '-', digits = src.replace(/^[-+]/, '');
    let x = 0n;
    for (const c of digits) {
      const d = parseInt(c, 36);
      if (d >= fr) throw Error(`Digit ${c} is not valid for base ${fr}`);
      x = x * BigInt(fr) + BigInt(d);
    }
    if (neg) x = -x;
    const out = x.toString(to).toUpperCase();
    updateResults([
      { label: `Base ${to} result`, value: out },
      { label: 'Decimal (Base 10)', value: x.toString(10) },
      { label: 'Binary (2), Octal (8), Hexadecimal (16)', value: `BIN: ${x.toString(2)}  |  OCT: ${x.toString(8)}  |  HEX: ${x.toString(16).toUpperCase()}` }
    ], {
      inputs: [{ label: 'Input', rawVal: `${src} (base ${fr})` }],
      formula: 'Positional radix expansion Σ d_k · b^k and repeated Euclidean division',
      substituted: `${src}_${fr} = ${x.toString(10)}_10 = ${out}_${to}`,
      steps: [`Parsed base-${fr} integer "${src}" to decimal ${x.toString(10)}`, `Converted to base-${to}: ${out}`],
      finalSummary: `${out} (base ${to})`
    });
  });
  bind(calc);
}

function comp_binary() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input('Binary Operand A', 'a', '101101', 'text')}${input('Binary Operand B', 'b', '010111', 'text')}
    ${dropdown("Word Width for Two's Complement", 'bits', [['8', '8-bit'], ['16', '16-bit'], ['32', '32-bit']], '8')}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const aStr = $('[data-field=a]').value.trim().replace(/[^01]/g, '') || '0';
    const bStr = $('[data-field=b]').value.trim().replace(/[^01]/g, '') || '0';
    const bits = Number($('[data-field=bits]').value);
    const a = parseInt(aStr, 2), b = parseInt(bStr, 2);
    const sum = a + b, diff = a - b, prod = a * b, quot = b !== 0 ? Math.trunc(a / b) : NaN;
    const mask = bits === 32 ? 0xFFFFFFFF : ((1 << bits) - 1);
    const twosA = (((~a + 1) & mask) >>> 0).toString(2).padStart(bits, '0').slice(-bits);
    updateResults([
      { label: 'Addition (A + B) & Subtraction (A − B)', value: `A + B = ${sum.toString(2)} (${sum})  |  A − B = ${diff >= 0 ? diff.toString(2) : '-' + Math.abs(diff).toString(2)} (${diff})` },
      { label: 'Multiplication (A × B) & Integer Division (A ÷ B)', value: `A × B = ${prod.toString(2)} (${prod})  |  A ÷ B = ${b ? quot.toString(2) + ` (rem ${a % b})` : 'Div by 0'}` },
      { label: `${bits}-Bit Two's Complement of −A`, value: twosA }
    ], {
      inputs: [{ label: 'A', rawVal: `${aStr}₂ (${a})` }, { label: 'B', rawVal: `${bStr}₂ (${b})` }],
      formula: "Binary arithmetic + Two's complement −A = (~A + 1) mod 2^n",
      substituted: `A + B = ${sum.toString(2)}₂, A × B = ${prod.toString(2)}₂`,
      steps: [`A = ${aStr}₂ = ${a}₁₀, B = ${bStr}₂ = ${b}₁₀`, `A + B = ${sum}₁₀ = ${sum.toString(2)}₂`, `${bits}-bit two's complement of −A: ${twosA}`],
      finalSummary: `A + B = ${sum.toString(2)}₂ (${sum})`
    });
  });
  bind(calc);
}

function comp_bitwise() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input('Integer Operand A (32-bit)', 'a', 42)}${input('Integer Operand B (32-bit)', 'b', 15)}
    ${input('Shift Count k (bits)', 'k', 2)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const a = Math.trunc(Number($('[data-field=a]').value)), b = Math.trunc(Number($('[data-field=b]').value));
    const k = Math.max(0, Math.min(31, Math.trunc(Number($('[data-field=k]').value))));
    const andV = a & b, orV = a | b, xorV = a ^ b, notA = ~a;
    const shl = a << k, shr = a >> k, ushr = a >>> k;
    updateResults([
      { label: 'Bitwise AND (A & B), OR (A | B), XOR (A ^ B)', value: `AND = ${andV} (0b${(andV >>> 0).toString(2)})  |  OR = ${orV} (0b${(orV >>> 0).toString(2)})  |  XOR = ${xorV} (0b${(xorV >>> 0).toString(2)})` },
      { label: 'Bitwise NOT (~A)', value: `${notA} (32-bit hex: 0x${(notA >>> 0).toString(16).toUpperCase()})` },
      { label: `Bit Shifts by k = ${k} (A << k, A >> k, A >>> k)`, value: `A << ${k} = ${shl}  |  A >> ${k} = ${shr}  |  A >>> ${k} = ${ushr}` }
    ], {
      inputs: [{ label: 'A, B, k', rawVal: `${a}, ${b}, ${k}` }],
      formula: '32-bit two’s-complement bitwise boolean logic & barrel shifts',
      substituted: `A & B = ${andV}, A | B = ${orV}, A ^ B = ${xorV}`,
      steps: [`A = 0b${(a >>> 0).toString(2)}, B = 0b${(b >>> 0).toString(2)}`, `AND = ${andV}, OR = ${orV}, XOR = ${xorV}, ~A = ${notA}`],
      finalSummary: `AND=${andV}, OR=${orV}, XOR=${xorV}`
    });
  });
  bind(calc);
}

function comp_ieee754() {
  $('#calculator-app').innerHTML = `${input('Decimal Floating-Point Number', 'val', -12.375)}${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const val = Number($('[data-field=val]').value);
    const buf = new ArrayBuffer(8);
    const dv = new DataView(buf);
    dv.setFloat32(0, val, false);
    const u32 = dv.getUint32(0, false);
    const bin32 = u32.toString(2).padStart(32, '0');
    const hex32 = '0x' + u32.toString(16).toUpperCase().padStart(8, '0');
    const sign = bin32[0], expBits = bin32.slice(1, 9), mantBits = bin32.slice(9);
    const expVal = parseInt(expBits, 2), unbiased = expVal - 127;
    const f32Exact = dv.getFloat32(0, false);
    dv.setFloat64(0, val, false);
    const hi = dv.getUint32(0, false).toString(16).toUpperCase().padStart(8, '0');
    const lo = dv.getUint32(4, false).toString(16).toUpperCase().padStart(8, '0');
    updateResults([
      { label: 'IEEE 754 Single Precision (32-Bit Binary Layout)', value: `${sign} | ${expBits} | ${mantBits}` },
      { label: 'Sign, Biased Exponent & Unbiased Exponent (e − 127)', value: `Sign = ${sign} (${sign === '1' ? '−' : '+'}),  Biased Exp = ${expVal},  Unbiased = ${unbiased}` },
      { label: '32-Bit Hex & 64-Bit Double Hex Representation', value: `Float32 = ${hex32}  |  Float64 = 0x${hi}${lo}` },
      { label: 'Decoded Float32 Value & Quantization Error', value: `Decoded = ${f32Exact},  Error = ${fmt(Math.abs(val - f32Exact), 9)}` }
    ], {
      inputs: [{ label: 'Decimal Value', rawVal: val }],
      formula: '(−1)^s × (1 + mantissa/2²³) × 2^(exponent − 127)',
      substituted: `${sign} | ${expBits} (${expVal}) | ${mantBits}`,
      steps: [`Sign bit s = ${sign}`, `Exponent bits = ${expBits}₂ = ${expVal} (unbiased ${unbiased})`, `Mantissa bits = ${mantBits}`, `Hex32 = ${hex32}`],
      finalSummary: `${hex32} (${sign} ${expBits} ${mantBits})`
    });
  });
  bind(calc);
}

function comp_subnet() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input('IPv4 Address', 'ip', '192.168.1.42', 'text')}${input('CIDR Prefix Length (/0 to /32)', 'cidr', 24)}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const ipStr = $('[data-field=ip]').value.trim();
    const cidr = Math.max(0, Math.min(32, Math.round(Number($('[data-field=cidr]').value))));
    const parts = ipStr.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => !Number.isInteger(p) || p < 0 || p > 255)) throw Error('Enter a valid IPv4 address (e.g. 192.168.1.42)');
    const ipInt = ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
    const maskInt = cidr === 0 ? 0 : ((0xFFFFFFFF << (32 - cidr)) >>> 0);
    const wildInt = (~maskInt) >>> 0;
    const netInt = (ipInt & maskInt) >>> 0;
    const bcastInt = (netInt | wildInt) >>> 0;
    const toIp = n => `${(n >>> 24) & 255}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`;
    const firstHost = cidr >= 31 ? netInt : (netInt + 1) >>> 0;
    const lastHost = cidr >= 31 ? bcastInt : (bcastInt - 1) >>> 0;
    const totalAddrs = 2 ** (32 - cidr);
    const usableHosts = cidr <= 30 ? Math.max(0, totalAddrs - 2) : totalAddrs;
    updateResults([
      { label: 'Network Address & Broadcast Address', value: `Network: ${toIp(netInt)}/${cidr}  |  Broadcast: ${toIp(bcastInt)}` },
      { label: 'Subnet Mask & Wildcard Mask', value: `Mask: ${toIp(maskInt)}  |  Wildcard: ${toIp(wildInt)}` },
      { label: 'Usable Host IP Range', value: `${toIp(firstHost)}  →  ${toIp(lastHost)}` },
      { label: 'Total Addresses & Usable Host Count', value: `Total = ${totalAddrs.toLocaleString()},  Usable Hosts = ${usableHosts.toLocaleString()}` }
    ], {
      inputs: [{ label: 'IPv4/CIDR', rawVal: `${ipStr}/${cidr}` }],
      formula: 'Network = IP & Mask, Broadcast = Network | (~Mask), Usable Hosts = 2^(32−CIDR) − 2',
      substituted: `Network = ${toIp(netInt)}, Broadcast = ${toIp(bcastInt)}, Hosts = ${usableHosts}`,
      steps: [`Subnet mask for /${cidr}: ${toIp(maskInt)}`, `Network address: ${toIp(netInt)}`, `Broadcast address: ${toIp(bcastInt)}`, `Usable hosts: ${usableHosts.toLocaleString()}`],
      finalSummary: `${toIp(netInt)}/${cidr} (${usableHosts.toLocaleString()} usable hosts)`
    });
  });
  bind(calc);
}

function color() {
  $('#calculator-app').innerHTML = `${input('HEX Color Code', 'color', '#6757f3', 'text')}<div id="color-sample" class="color-sample"></div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const raw = $('[data-field=color]').value.trim().replace(/^#/, '');
    if (!/^[0-9a-fA-F]{6}$/.test(raw)) throw Error('Enter a valid 6-digit HEX color (e.g. #6757F3)');
    const hex = '#' + raw.toUpperCase();
    const rr = parseInt(raw.slice(0, 2), 16), gg = parseInt(raw.slice(2, 4), 16), bb = parseInt(raw.slice(4, 6), 16);
    const r = rr / 255, g = gg / 255, b = bb / 255, max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (d) {
      s = d / (1 - Math.abs(2 * l - 1));
      switch (max) {
        case r: h = ((g - b) / d) % 6; break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h *= 60;
      if (h < 0) h += 360;
    }
    const sample = $('#color-sample');
    if (sample) sample.style.background = hex;
    updateResults([
      { label: 'HEX', value: hex },
      { label: 'RGB', value: `rgb(${rr}, ${gg}, ${bb})` },
      { label: 'HSL', value: `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)` }
    ], {
      inputs: [{ label: 'HEX', rawVal: hex }],
      formula: 'Channel normalization R,G,B ∈ [0, 255] → HSL',
      substituted: `rgb(${rr}, ${gg}, ${bb})`,
      steps: [`R = ${rr}, G = ${gg}, B = ${bb}`, `HSL = hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`],
      finalSummary: `${hex} = rgb(${rr}, ${gg}, ${bb})`
    });
  });
  bind(calc);
}

function fraction() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input('Fraction A (e.g. 3/4 or 1 3/4)', 'a', '3/4', 'text')}
    ${dropdown('Operation', 'operation', ['+', '−', '×', '÷'], '+')}
    ${input('Fraction B (e.g. 2/3)', 'b', '2/3', 'text')}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const a = $('[data-field=a]').value, b = $('[data-field=b]').value, op = $('[data-field=operation]').value;
    const r = fractionOp(a, b, op === '−' ? '-' : op);
    const dec = fractionToDecimal(r);
    updateResults([
      { label: 'Exact simplified fraction', value: r },
      { label: 'Approximate decimal', value: dec }
    ], {
      inputs: [{ label: 'A', rawVal: a }, { label: 'Op', rawVal: op }, { label: 'B', rawVal: b }],
      formula: 'Exact rational arithmetic via BigInt GCD reduction',
      substituted: `(${a}) ${op} (${b}) = ${r}`,
      steps: [`Evaluated exact rational operation (${a}) ${op} (${b})`, `Simplified by greatest common divisor: ${r} ≈ ${fmt(dec)}`],
      finalSummary: `${r} (${fmt(dec)})`
    });
  });
  bind(calc);
}

function prime(t) {
  return number_theory(t, 'prime');
}

function getDate(k) {
  const v = $(`[data-field=${k}]`).value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) throw Error('Select valid dates (YYYY-MM-DD)');
  const y = +v.slice(0, 4), m = +v.slice(5, 7), d = +v.slice(8, 10);
  const ms = Date.UTC(y, m - 1, d);
  const test = new Date(ms);
  if (test.getUTCFullYear() !== y || test.getUTCMonth() + 1 !== m || test.getUTCDate() !== d) throw Error('Invalid calendar date');
  return { y, m, d, ms, raw: v };
}

function dates(kind = 'dates') {
  const today = new Date().toISOString().slice(0, 10);
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input(kind === 'age' ? 'Date of birth' : 'First date', 'a', kind === 'age' ? '2000-01-01' : '2026-01-01', 'date')}
    ${input(kind === 'age' ? 'As of date' : 'Second date', 'b', today, 'date')}</div>${actionBarHtml()}`;
  const calc = () => evalSafe(() => {
    const a = getDate('a'), b = getDate('b'), days = Math.round((b.ms - a.ms) / 86400000);
    if (kind === 'dates') {
      updateResults([
        { label: 'Signed days', value: days },
        { label: 'Absolute days', value: Math.abs(days) },
        { label: 'Full weeks', value: Math.floor(Math.abs(days) / 7) },
        { label: 'Remaining days', value: Math.abs(days) % 7 }
      ], {
        inputs: [{ label: 'First date', rawVal: a.raw }, { label: 'Second date', rawVal: b.raw }],
        formula: 'Δdays = (UTC(d₂) − UTC(d₁)) / 86,400,000 ms',
        substituted: `${Math.abs(days)} days (${Math.floor(Math.abs(days) / 7)} weeks, ${Math.abs(days) % 7} days)`,
        steps: [`Computed exact UTC day difference: ${days} days`],
        finalSummary: `${Math.abs(days)} days`
      });
      return;
    }
    if (days < 0) throw Error('Birth date must not be after the reference date');
    let totalMonths = (b.y - a.y) * 12 + b.m - a.m;
    const addMonths = n => {
      const year = a.y + Math.floor((a.m - 1 + n) / 12);
      const month = ((a.m - 1 + n) % 12 + 12) % 12 + 1;
      const day = Math.min(a.d, new Date(Date.UTC(year, month, 0)).getUTCDate());
      return Date.UTC(year, month - 1, day);
    };
    if (addMonths(totalMonths) > b.ms) totalMonths--;
    const y = Math.floor(totalMonths / 12), m = totalMonths % 12, d = Math.round((b.ms - addMonths(totalMonths)) / 86400000);
    updateResults([
      { label: 'Age', value: `${y} years, ${m} months, ${d} days` },
      { label: 'Total days lived', value: days },
      { label: 'Completed years', value: y }
    ], {
      inputs: [{ label: 'Date of birth', rawVal: a.raw }, { label: 'As of date', rawVal: b.raw }],
      formula: 'Calendar year-month-day decomposition + exact UTC day count',
      substituted: `${y} years, ${m} months, ${d} days (${days} total days)`,
      steps: [`Completed years = ${y}, months = ${m}, days = ${d}`, `Total days lived = ${days}`],
      finalSummary: `${y} years, ${m} months, ${d} days`
    });
  });
  bind(calc);
}

function age() {
  return dates('age');
}

function random() {
  $('#calculator-app').innerHTML = `<div class="control-grid">
    ${input('Minimum integer', 'min', 1)}${input('Maximum integer', 'max', 100)}</div>
    <div class="tool-actions"><button type="button" class="main-button" id="roll">Generate another number ↗</button></div>${actionBarHtml()}`;
  function roll() {
    evalSafe(() => {
      const { min, max } = nums(['min', 'max']);
      if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || max < min) throw Error('Use valid integers with min ≤ max');
      const bound = max - min + 1;
      let v;
      if (typeof crypto !== 'undefined' && crypto.getRandomValues && bound <= 4294967295) {
        const arr = new Uint32Array(1);
        const range = 2 ** 32, cut = range - (range % bound);
        do { crypto.getRandomValues(arr); v = arr[0]; } while (v >= cut);
        v = min + (v % bound);
      } else {
        v = Math.floor(min + Math.random() * bound);
      }
      updateResults([
        { label: 'Your random number', value: v },
        { label: 'Interval Mean', value: 0.5 * (min + max) }
      ], {
        inputs: [{ label: 'Interval', rawVal: `[${min}, ${max}]` }],
        formula: 'X ~ DiscreteUniform(min, max)',
        substituted: `Generated ${v} ∈ [${min}, ${max}]`,
        steps: [`Sampled uniform integer in [${min}, ${max}]: ${v}`],
        finalSummary: `Random number = ${v}`
      });
    });
  }
  const rollBtn = $('#roll');
  if (rollBtn) rollBtn.onclick = roll;
  bind(roll);
}

const renderers = {
  scientific, equation, quadratic, expression, mean_suite, number_theory, complex_calc, inequality_calc,
  poly_solver, partial_fractions, matrix, vector, system, linalg_eigen, linalg_lu, linalg_qr, linalg_svd,
  linalg_rank, linalg_exp, linalg_ols, graph, limit, multivar_limit, derivative, higher_derivative,
  partial_derivative, implicit_diff, parametric_diff, log_diff, directional_diff, gradient_calc,
  integral, indefinite_integral, double_integral, triple_integral, improper_integral, ibp_calculator,
  trig_integral, num_integration, fourier_series, fourier_transform, inv_fourier_transform,
  laplace_transform, inv_laplace_transform, taylor_series, maclaurin_series, series_convergence,
  ode_general, ode_ivp, ode_bvp, jacobian_calc, divergence_calc, curl_calc, line_integral,
  surface_integral, error_prop, triangle_trig_suite, trig, kinematics_suvat, stats, regression,
  covariance_calc, normal_dist, binomial, poisson_dist, t_dist, chi2_dist, hypothesis_test,
  pvalue_calc, sample_size, anova_calc, multi_regression, logistic_reg, stat_power,
  finance_npv, finance_irr, finance_xirr, finance_bond, finance_mortgage, finance_bs, finance_greeks,
  finance_depreciation, finance_prepayment, finance_taxslab, converter, base, comp_binary,
  comp_bitwise, comp_ieee754, comp_subnet, color, fraction, prime, dates: () => dates('dates'), age, random
};

function renderTool() {
  const slug = document.body.dataset.tool;
  tool = find(slug);
  if (!tool || !$('#calculator-app')) return;
  const target = tool.canonicalSlug ? (find(tool.canonicalSlug) || tool) : tool;
  const initialMode = document.body.dataset.mode || tool.defaultMode || target.defaultMode || slug;
  if (target.type === 'formula' || target.type === 'multimode') {
    renderFormulaOrMultimode(target, initialMode);
  } else if (renderers[target.type]) {
    renderers[target.type](target, initialMode);
  }
  const favorites = ls('favorites', []);
  const b = $('#favorite-toggle');
  if (b) {
    b.classList.toggle('is-favorite', favorites.includes(slug));
    b.textContent = favorites.includes(slug) ? '★ Saved' : '☆ Save tool';
    b.onclick = () => {
      let a = ls('favorites', []);
      a = a.includes(slug) ? a.filter(s => s !== slug) : [...a, slug];
      save('favorites', a);
      b.classList.toggle('is-favorite', a.includes(slug));
      b.textContent = a.includes(slug) ? '★ Saved' : '☆ Save tool';
      notify(a.includes(slug) ? 'Added to your saved tools' : 'Removed from saved tools');
    };
  }
  const r = ls('recent', []).filter(s => s !== slug);
  save('recent', [slug, ...r].slice(0, 15));
  $('#share-tool')?.addEventListener('click', () => copy(location.href));
  if ($('#related-tools')) {
    const sameSub = canonicalTools().filter(t => t.category === tool.category && t.subcategory === tool.subcategory && t.slug !== tool.slug);
    const sameCat = canonicalTools().filter(t => t.category === tool.category && t.slug !== tool.slug);
    const rel = [...sameSub, ...sameCat.filter(x => !sameSub.includes(x))].slice(0, 6);
    $('#related-tools').innerHTML = rel.map(card).join('');
  }
}

function renderHome() {
  const target = $('#featured-tools');
  if (target) target.innerHTML = featured.map(s => find(s)).filter(Boolean).map(card).join('');
  const cats = $('#categories-grid');
  if (cats) {
    const canon = canonicalTools();
    cats.innerHTML = data.categories.map(c => {
      const cnt = canon.filter(t => t.category === c.name).length;
      const pills = (c.subcategories || []).slice(0, 3).map(s => `<span class="cat-subpill">${esc(s)}</span>`).join('');
      return `<a class="category-card" href="${catUrl(c.name)}"><span class="cat-glyph">${esc(icons[c.name] || '#')}</span><b>${esc(c.name)}</b><small>${esc(c.description)}</small><div class="cat-subpills">${pills}</div><span class="cat-count">${cnt} calculators →</span></a>`;
    }).join('');
  }
  const recent = ls('recent', []).map(find).filter(Boolean), rec = $('#recent-section');
  if (rec && recent.length) {
    rec.hidden = false;
    $('#recent-tools').innerHTML = recent.slice(0, 4).map(card).join('');
  }
  const all = $('#all-tools');
  if (all) all.innerHTML = canonicalTools().map(card).join('');
  if ($('#total-tools')) $('#total-tools').textContent = canonicalTools().length + '+';
}

function renderCategory() {
  const catSlug = document.body.dataset.category;
  const container = $('#category-tools');
  if (!catSlug || !container) return;
  const catObj = data.categories.find(c => slugify(c.name) === catSlug);
  const tools = canonicalTools().filter(x => slugify(x.category) === catSlug);
  if (!catObj) {
    container.innerHTML = tools.map(card).join('');
    return;
  }
  const subcats = catObj.subcategories || [];
  let activeSub = (location.hash || '').replace(/^#/, '') || 'all';
  if (activeSub !== 'all' && !subcats.some(s => slugify(s) === activeSub)) activeSub = 'all';

  let pillBar = $('#subcat-pills');
  if (!pillBar) {
    pillBar = document.createElement('div');
    pillBar.id = 'subcat-pills';
    pillBar.className = 'filter-pills';
    container.parentElement.insertBefore(pillBar, container);
  }
  pillBar.innerHTML = `<button type="button" class="filter-pill ${activeSub === 'all' ? 'active' : ''}" data-sub="all">All ${esc(catObj.name)} (${tools.length})</button>` +
    subcats.map(s => {
      const sSlug = slugify(s);
      const cnt = tools.filter(t => slugify(t.subcategory) === sSlug).length;
      return `<button type="button" class="filter-pill ${activeSub === sSlug ? 'active' : ''}" data-sub="${esc(sSlug)}">${esc(s)} (${cnt})</button>`;
    }).join('');

  function draw() {
    const list = activeSub === 'all' ? tools : tools.filter(t => slugify(t.subcategory) === activeSub);
    container.innerHTML = list.map(card).join('');
  }
  $$('[data-sub]', pillBar).forEach(btn => {
    btn.onclick = () => {
      activeSub = btn.dataset.sub;
      $$('[data-sub]', pillBar).forEach(b => b.classList.toggle('active', b === btn));
      draw();
    };
  });
  draw();
}

function searchSetup() {
  const results = $('#search-results');
  const modal = $('#search-modal');
  const globalInput = $('#global-search');
  let activeIdx = -1;

  const build = q => {
    if (!results) return;
    const v = q.trim().toLowerCase();
    const tokens = v.split(/\s+/).filter(Boolean);
    let hits;
    if (!tokens.length) {
      hits = featured.map(find).filter(Boolean);
    } else {
      const scored = [];
      for (const x of data.tools) {
        const hay = `${x.title} ${x.slug} ${x.description} ${x.category} ${x.subcategory || ''} ${x.formula || ''}`.toLowerCase();
        if (!tokens.every(tok => hay.includes(tok))) continue;
        let score = x.isAlias ? 0 : 15;
        if (x.title.toLowerCase().startsWith(v)) score += 30;
        else if (x.title.toLowerCase().includes(v)) score += 15;
        scored.push({ x, score });
      }
      scored.sort((a, b) => b.score - a.score);
      hits = scored.slice(0, 30).map(s => s.x);
    }
    activeIdx = -1;
    results.innerHTML = hits.length
      ? hits.map((x, idx) => `<a href="${url(x)}" data-hit-idx="${idx}"><span class="tool-icon tiny">${esc(icons[x.category] || '✦')}</span><span><b>${esc(x.title)}</b><small>${esc(x.category)} › ${esc(x.subcategory || 'General')} — ${esc(x.description)}</small></span><span>↗</span></a>`).join('')
      : '<div class="no-results">No matching calculator found. Try a formula, symbol, or topic keyword.</div>';
  };

  function open() {
    if (!modal) return;
    modal.hidden = false;
    build(globalInput?.value || '');
    globalInput?.focus();
    document.body.classList.add('modal-open');
  }
  function close() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
  }
  $('#open-search')?.addEventListener('click', open);
  $('#search-close')?.addEventListener('click', close);
  if (modal) modal.onclick = e => { if (e.target === modal) close(); };
  document.addEventListener('keydown', e => {
    const tag = (document.activeElement?.tagName || '').toUpperCase();
    const inEditable = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement?.isContentEditable;
    if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !inEditable)) {
      e.preventDefault();
      open();
    } else if (e.key === 'Escape' && modal && !modal.hidden) {
      close();
    }
  });
  globalInput?.addEventListener('input', e => build(e.target.value));
  globalInput?.addEventListener('keydown', e => {
    const items = $$('a[data-hit-idx]', results);
    if (!items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIdx = (activeIdx + 1) % items.length;
      items.forEach((el, i) => el.classList.toggle('active-hit', i === activeIdx));
      items[activeIdx]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = (activeIdx - 1 + items.length) % items.length;
      items.forEach((el, i) => el.classList.toggle('active-hit', i === activeIdx));
      items[activeIdx]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && activeIdx >= 0 && items[activeIdx]) {
      e.preventDefault();
      location.href = items[activeIdx].getAttribute('href');
    }
  });
  $$('[data-page-search]').forEach(inp => inp.addEventListener('input', () => {
    const v = inp.value.toLowerCase().trim();
    $$('.tool-card', inp.closest('section') || document).forEach(c => {
      c.hidden = !c.textContent.toLowerCase().includes(v);
    });
  }));
}

function shell() {
  const links = $('#sidebar-cats');
  if (links) {
    const canon = canonicalTools();
    const curCat = document.body.dataset.category || (tool ? slugify(tool.category) : '');
    links.innerHTML = data.categories.map(c => {
      const cSlug = slugify(c.name);
      const isOpen = curCat === cSlug;
      const catTools = canon.filter(t => t.category === c.name);
      const subLinks = (c.subcategories || []).map(s => {
        const sSlug = slugify(s);
        const sCount = catTools.filter(t => t.subcategory === s).length;
        return `<a href="/categories/${cSlug}/#${sSlug}" class="subcat-link">${esc(s)} <span>${sCount}</span></a>`;
      }).join('');
      return `<details class="cat-nav-group ${isOpen ? 'active' : ''}" ${isOpen ? 'open' : ''}>
        <summary class="cat-nav-summary">
          <span class="cat-nav-glyph">${esc(icons[c.name] || '#')}</span>
          <a href="/categories/${cSlug}/" onclick="event.stopPropagation()">${esc(c.name)}</a>
          <span class="cat-nav-count">${catTools.length}</span>
          <span class="cat-nav-caret">▸</span>
        </summary>
        <div class="subcat-list">${subLinks}</div>
      </details>`;
    }).join('');
  }
  const toggle = $('#theme-toggle');
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    if (toggle) toggle.textContent = t === 'dark' ? '☀' : '☾';
    save('theme', t);
  }
  setTheme(ls('theme', 'light'));
  if (toggle) toggle.onclick = () => setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
  $('#mobile-menu')?.addEventListener('click', () => document.body.classList.toggle('sidebar-open'));
  $('#mobile-shade')?.addEventListener('click', () => document.body.classList.remove('sidebar-open'));
  $$('#sidebar-cats a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('sidebar-open')));
  const fav = $('#saved-links'), list = ls('favorites', []).map(find).filter(Boolean);
  if (fav) {
    fav.innerHTML = list.length
      ? list.slice(0, 5).map(t => `<a href="${url(t)}" class="side-link"><span>☆</span>${esc(t.title)}</a>`).join('')
      : '<span class="side-empty">Your favorites will appear here.</span>';
  }
}

async function init() {
  try {
    const res = await fetch('/assets/catalog.json');
    if (!res.ok) throw Error('Data unavailable');
    data = await res.json();
    if (document.body.dataset.page === 'tool') renderTool();
    shell();
    if (document.body.dataset.page === 'home') renderHome();
    else if (document.body.dataset.page === 'category') renderCategory();
    searchSetup();
  } catch (e) {
    console.error(e);
    const a = $('#calculator-app');
    if (a) a.textContent = 'Calculator library could not load. Please refresh the page.';
  }
}
init();
