from pathlib import Path
from editorial_cases import EDITORIAL_CASES
from seo_focus import SEO_FOCUS
from seo_expansion import SEO_EXPANSION
SEO_FOCUS.update(SEO_EXPANSION)
import hashlib
import json, html, re, os, sys, math

root = Path(__file__).resolve().parent
if (root / 'assets/catalog.json').exists():
    site_root = root
else:
    site_root = root.parent / 'site'
catalog_path = site_root / 'assets/catalog.json'

catalog = json.loads(catalog_path.read_text(encoding='utf8'))
T = catalog['tools']
canonical_tools = [t for t in T if not t.get('isAlias')]
cats = catalog['categories']
game_catalog = json.loads((site_root / 'assets/brain-games-catalog.json').read_text(encoding='utf8'))
GAMES = game_catalog['games']
GAME_CATEGORIES = game_catalog['categories']
legacy_cat_redirects = catalog.get('legacyCategoryRedirects', {})
URL = os.environ.get('SITE_URL', 'https://axiomatlas.netlify.app').strip().rstrip('/')

# A content-derived version keeps browsers from reusing old mobile catalog/app assets.
_ASSET_HASH = hashlib.sha256()
for _asset_name in ('catalog.json', 'app.js', 'styles.css', 'brain-games-catalog.json', 'brain-games.mjs', 'games-engine.mjs', 'brain-games.css'):
    _asset_path = site_root / 'assets' / _asset_name
    _ASSET_HASH.update(_asset_name.encode('utf-8'))
    _ASSET_HASH.update(_asset_path.read_bytes())
ASSET_VERSION = _ASSET_HASH.hexdigest()[:12]

GA4_TAG = '''<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-G9NPE8LWSM"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-G9NPE8LWSM');
</script>'''

icon = {
    'Mathematics': '#',
    'Algebra': 'Σ',
    'Calculus & Graphing': '⌁',
    'Geometry & Trigonometry': '⬡',
    'Physics & Engineering': '⚛',
    'Statistics & Probability': '▥',
    'Finance': '₹',
    'Converters & Everyday Tools': '⇄',
    'Astronomy & Astrophysics': '✦'
}

e = lambda s: html.escape(str(s), quote=True)
def slug(x): return re.sub(r'(^-|-$)', '', re.sub(r'[^a-z0-9]+', '-', str(x).lower()))

def tool_matches_subcat(t, sub_name):
    if t.get('subcategory') == sub_name:
        return True
    secs = t.get('secondarySubcategories') or []
    return sub_name in secs

def cards(tools):
    out = []
    for t in tools:
        secs = [slug(s) for s in (t.get('secondarySubcategories') or [])]
        sub_attr = ' '.join([slug(t.get('subcategory', ''))] + secs).strip()
        out.append(
            f'<a class="tool-card" href="/tools/{e(t["slug"])}/" data-cat="{e(slug(t["category"]))}" data-subcat="{e(sub_attr)}">'
            f'<span class="tool-icon">{e(icon.get(t["category"], "✦"))}</span>'
            f'<span class="tool-card-body"><b>{e(t["title"])}</b>'
            f'<small><span class="tool-subtag">{e(t.get("subcategory") or t["category"])}</span>{e(t["description"])}</small></span>'
            f'<span class="card-arrow">↗</span></a>'
        )
    return '\n'.join(out)

def fullurl(path):
    return (URL + path) if URL else ''

def sidebar_nav_html(active_cat_slug=''):
    parts = []
    for c in cats:
        c_slug = slug(c['name'])
        is_open = (c_slug == active_cat_slug)
        cat_tools = [t for t in canonical_tools if t['category'] == c['name']]
        sub_links = ''.join(
            f'<a href="/categories/{c_slug}/#{slug(s)}" class="subcat-link">{e(s)} <span>{sum(1 for t in cat_tools if tool_matches_subcat(t, s))}</span></a>'
            for s in c.get('subcategories', [])
        )
        parts.append(
            f'<details class="cat-nav-group {"active" if is_open else ""}" {"open" if is_open else ""}>'
            f'<summary class="cat-nav-summary">'
            f'<span class="cat-nav-glyph">{e(icon.get(c["name"], "#"))}</span>'
            f'<a href="/categories/{c_slug}/">{e(c["name"])}</a>'
            f'<span class="cat-nav-count">{len(cat_tools)}</span>'
            f'<span class="cat-nav-caret">▸</span>'
            f'</summary>'
            f'<div class="subcat-list">{sub_links}</div>'
            f'</details>'
        )
    return ''.join(parts)

def document(title, desc, path, body, attrs='', schema='', canonical_override='', robots='index,follow,max-image-preview:large', active_cat_slug='', seo_title=None):
    full_title = (e(seo_title) + ' | AxiomAtlas') if seo_title else (e(title) + ' | AxiomAtlas' if title != 'AxiomAtlas' else f'AxiomAtlas — {len(canonical_tools)}+ Scientific, Math, Engineering, Astronomy & Finance Calculators')
    canon_href = canonical_override or fullurl(path)
    canonical = f'<link rel="canonical" href="{e(canon_href)}">' if canon_href else ''
    crumb = 'Dashboard' if path == '/' else e(title)
    game_path = path == '/' or path.startswith('/games/') or path.startswith('/categories/') or (path.startswith('/tools/') and path.strip('/').split('/')[-1] in {g['calculatorSlug'] for g in GAMES})
    game_style = f'<link rel="stylesheet" href="/assets/brain-games.css?v={ASSET_VERSION}">' if game_path else ''
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#151530"><meta name="description" content="{e(desc)}"><meta name="robots" content="{e(robots)}"><title>{full_title}</title>{canonical}<meta property="og:type" content="website"><meta property="og:url" content="{e(canon_href)}"><meta property="og:title" content="{full_title}"><meta property="og:description" content="{e(desc)}"><link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"><link rel="manifest" href="/manifest.webmanifest"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&amp;family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap"><link rel="stylesheet" href="/assets/styles.css?v={ASSET_VERSION}">{game_style}{schema}{GA4_TAG}</head><body {attrs}>
<div class="site"><aside class="sidebar" id="sidebar"><a class="brand-wrap" href="/"><span class="brand-mark"><svg viewBox="0 0 40 40" fill="none" stroke="white" stroke-width="3.4" stroke-linecap="round"><circle cx="20" cy="20" r="7"/><ellipse cx="20" cy="20" rx="17" ry="8" transform="rotate(-38 20 20)"/><circle cx="32.7" cy="8.3" r="3" fill="#f4cc74" stroke="none"/></svg></span><span><span class="brand">Axiom<em>Atlas</em></span><div class="brand-subtitle">ONE UNIVERSE OF CALCULATIONS</div></span></a><div class="side-section-title">EXPLORE</div><a class="side-link {'active' if path == '/' else ''}" href="/"><span>⌂</span> Overview</a><a class="side-link" href="/#featured"><span>⚡</span> Popular tools</a><a class="side-link" href="/games/"><span>✦</span> Games &amp; Activities</a><a class="side-link" href="/#all-calculators"><span>▤</span> All calculators</a><div class="side-section-title">{len(cats)} PRIMARY CATEGORIES</div><nav id="sidebar-cats">{sidebar_nav_html(active_cat_slug)}</nav><div class="side-section-title">SAVED TOOLS</div><div id="saved-links"><span class="side-empty">Your favorites will appear here.</span></div><div class="side-bottom"><strong>Everything adds up.</strong><br>100% free. No account. Step-by-step explanations on every tool.<br><span>© 2026 AxiomAtlas</span></div></aside><div class="mobile-shade" id="mobile-shade"></div><div class="main-frame"><header class="topbar"><div class="header-crumb"><button class="icon-btn mobile-only" id="mobile-menu" aria-label="Open navigation">☰</button><a href="/">Home</a> <span>›</span> <strong>{crumb}</strong></div><div class="top-actions"><button class="search-trigger" id="open-search" aria-label="Search calculators"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.8" cy="10.8" r="7"/><path d="m16 16 5 5"/></svg><span>Search any calculator or formula...</span><kbd id="search-hotkey">Ctrl K</kbd></button><button class="icon-btn" id="theme-toggle" aria-label="Toggle dark mode">☾</button></div></header><main class="content">{body}<footer class="footer"><span>© 2026 AxiomAtlas · Built for students, engineers, scientists, astronomers & analysts.</span><span>Free tools · No sign-in · Client-side calculations · <a href="/about/">About & accuracy</a> · <a href="/privacy/">Privacy</a></span></footer></main></div></div>
<div class="search-modal" id="search-modal" hidden role="dialog" aria-modal="true" aria-label="Search calculators"><div class="search-box"><div class="search-box-header"><span>⌕</span><input id="global-search" type="search" placeholder="Search calculus, linear algebra, astronomy, circuits, physics, statistics, finance..." aria-label="Search all calculators"><button id="search-close">ESC</button></div><div class="search-results" id="search-results"></div><div class="search-foot">Start typing to search {len(canonical_tools)}+ calculators & {len(T)} total routes · Use ↑/↓ and Enter</div></div></div><div class="toast" id="toast" role="status" aria-live="polite"></div><script type="module" src="/assets/app.js?v={ASSET_VERSION}"></script></body></html>'''

def jsonld(d):
    return '<script type="application/ld+json">' + json.dumps(d, ensure_ascii=False).replace('</', '<\\/') + '</script>'

# --- SPECIALIZED VARIABLE DEFINITIONS & EXAMPLES FOR 6-PART EXPLANATION UI ---
SPECIALIZED_VARIABLES = {
    'astro_elliptical': [
        ('M', 'Central gravitating body mass', 'kg (or M_☉, M_⊕)'),
        ('a', 'Orbital semi-major axis', 'm (or km, AU)'),
        ('e', 'Orbital eccentricity (0 ≤ e < 1)', 'Dimensionless'),
        ('M_anom', 'Mean anomaly angle', '° (degrees)'),
        ('E, ν', 'Eccentric anomaly & True anomaly', '° (degrees)'),
        ('G', 'Newtonian gravitational constant (6.67430 × 10⁻¹¹)', 'm³·kg⁻¹·s⁻²')
    ],
    'astro_habitable_zone': [
        ('L_★', 'Host star bolometric luminosity', 'L_☉ (Solar luminosities)'),
        ('T_eff', 'Host star effective surface temperature', 'K'),
        ('a', 'Candidate planet orbital semi-major axis', 'AU'),
        ('S_eff', 'Effective incident stellar flux relative to Earth', 'S_⊕')
    ],
    'astro_blackbody': [
        ('T', 'Absolute thermodynamic temperature', 'K'),
        ('λ', 'Observation wavelength', 'nm (or m)'),
        ('B_λ(λ,T)', 'Planck spectral radiance per unit wavelength', 'W·sr⁻¹·m⁻²·nm⁻¹'),
        ('h, c, k_B', 'Planck constant, speed of light, Boltzmann constant', 'SI units')
    ],
    'astro_cosmology': [
        ('z', 'Cosmological redshift', 'Dimensionless'),
        ('H₀', 'Present-day Hubble expansion constant', 'km·s⁻¹·Mpc⁻¹'),
        ('Ω_m,0', 'Present matter density parameter (baryonic + dark matter)', 'Dimensionless'),
        ('Ω_Λ,0', 'Present dark energy density parameter', 'Dimensionless'),
        ('D_C, D_L, D_A', 'Comoving, Luminosity, and Angular Diameter distances', 'Mpc / Gly'),
        ('t_L(z)', 'Cosmological lookback time to redshift z', 'Gyr')
    ],
    'astro_julian': [
        ('Y, M, D', 'UTC Gregorian calendar year, month, and day', 'Calendar date'),
        ('h, m, s', 'UTC time of day (hours, minutes, seconds)', 'UTC time'),
        ('JD', 'Continuous Julian Date since Jan 1, 4713 BCE 12:00 UTC', 'days'),
        ('MJD', 'Modified Julian Date (JD − 2,400,000.5)', 'days')
    ],
    'astro_mjd': [
        ('MJD', 'Modified Julian Date since Nov 17, 1858 00:00 UTC', 'days'),
        ('JD', 'Full Julian Date (MJD + 2,400,000.5)', 'days'),
        ('T', 'Julian centuries elapsed since J2000.0 (JD 2451545.0)', 'centuries')
    ],
    'astro_sidereal': [
        ('JD', 'Julian Date of observation', 'days'),
        ('λ_lon', 'Observer geographic longitude (+East, −West)', '° (degrees)'),
        ('α (RA)', 'Target celestial Right Ascension', 'hours (0h–24h)'),
        ('GMST, LST', 'Greenwich & Local Mean Sidereal Time', 'h m s / °')
    ],
    'astro_celestial_dist': [
        ('α₁, δ₁', 'Object 1 Right Ascension & Declination', '° (degrees)'),
        ('α₂, δ₂', 'Object 2 Right Ascension & Declination', '° (degrees)'),
        ('d₁, d₂', 'Heliocentric/observer distances to Objects 1 & 2', 'pc (parsecs)'),
        ('θ, PA', 'Great-circle angular separation & Position Angle', '° / ′ / ″')
    ]
}

SPECIALIZED_VARIABLES.update({
    'finance_npv': [
        ('r', 'Discount rate per period', '%'),
        ('CF₀', 'Cash flow at the initial period (typically negative)', 'Currency'),
        ('CFₜ', 'Cash flow received or paid at period t', 'Currency'),
        ('t', 'Number of periods after the initial investment', 'Periods'),
        ('NPV', 'Sum of discounted cash flows', 'Currency')
    ],
    'finance_irr': [
        ('CFₜ', 'Cash flow at period t, including initial investment CF₀', 'Currency'),
        ('t', 'Number of periods since the initial cash flow', 'Periods'),
        ('IRR', 'Discount rate at which NPV equals zero', '% per period')
    ],
    'linalg_eigen': [
        ('A', 'Input square matrix', 'Dimensionless unless specified'),
        ('λ', 'Eigenvalue satisfying det(A − λI) = 0', 'Same as matrix entries'),
        ('v', 'Nonzero eigenvector satisfying Av = λv', 'Normalized vector'),
        ('I', 'Identity matrix of the same dimension as A', 'Dimensionless')
    ]
})

CONSTANT_INFO = {
    'G': ('G', 'Newtonian gravitational constant (6.67430 × 10⁻¹¹)', 'N·m²/kg²'),
    'c': ('c', 'Speed of light in vacuum (299,792,458)', 'm/s'),
    'h': ('h', 'Planck constant (6.62607015 × 10⁻³⁴)', 'J·s'),
    'hbar': ('ℏ', 'Reduced Planck constant h/(2π)', 'J·s'),
    'kB': ('k_B', 'Boltzmann constant (1.380649 × 10⁻²³)', 'J/K'),
    'sigmaSB': ('σ', 'Stefan–Boltzmann constant (5.670374 × 10⁻⁸)', 'W·m⁻²·K⁻⁴'),
    'b_wien': ('b', 'Wien displacement constant (2.89777 × 10⁻³)', 'm·K'),
    'Rgas': ('R_gas', 'Universal molar gas constant (8.31446)', 'J/(mol·K)'),
    'AU': ('AU', 'Astronomical Unit (149,597,870,700)', 'm'),
    'ly': ('ly', 'Julian light-year (9.46073 × 10¹⁵)', 'm'),
    'pc': ('pc', 'Parsec (3.085678 × 10¹⁶)', 'm'),
    'M_sun': ('M_☉', 'Nominal Solar mass (1.98847 × 10³⁰)', 'kg'),
    'R_sun': ('R_☉', 'Nominal Solar radius (6.957 × 10⁸)', 'm'),
    'L_sun': ('L_☉', 'Nominal Solar luminosity (3.828 × 10²⁶)', 'W'),
    'M_earth': ('M_⊕', 'Earth mass (5.97217 × 10²⁴)', 'kg'),
    'R_earth': ('R_⊕', 'Earth mean radius (6.371 × 10⁶)', 'm'),
    'M_jup': ('M_J', 'Jupiter mass (1.89813 × 10²⁷)', 'kg'),
    'R_jup': ('R_J', 'Jupiter mean radius (6.9911 × 10⁷)', 'm'),
    'g0': ('g₀', 'Standard Earth gravity (9.80665)', 'm/s²')
}

def build_edu_guide_html(t, target_tool, pre_fields):
    cat_name = t['category']
    sub_name = t.get('subcategory') or cat_name
    formula_str = t.get('formula') or target_tool.get('formula') or 'f(x) → Deterministic symbolic & numerical evaluation'
    note_str = t.get('note') or target_tool.get('note') or ''

    # 1. Overview (2-3 clean sentences)
    overview_text = (
        f"{t['description']} "
        f"Designed for {cat_name.lower()} ({sub_name.lower()}), this tool evaluates your inputs in canonical SI or domain units and generates a verified step-by-step derivation."
    )

    # 3. Variables Table (Symbol | Meaning | Unit)
    var_rows = []
    if pre_fields:
        for fld in pre_fields:
            var_rows.append((fld['key'], fld['label'], fld.get('unit') or 'Dimensionless'))
        # Check if any physical constants appear in outputs
        out_list = target_tool.get('outputs', [])
        if target_tool.get('type') == 'multimode' and target_tool.get('modes'):
            out_list = target_tool['modes'][0].get('outputs', [])
        expr_concat = ' '.join(o.get('expr', '') for o in out_list)
        for ck, cinfo in CONSTANT_INFO.items():
            if re.search(r'\b' + re.escape(ck) + r'\b', expr_concat):
                var_rows.append(cinfo)
        for o in out_list[:2]:
            var_rows.append(('Output', o['label'], o.get('unit') or 'Result unit'))
    elif target_tool.get('type') in SPECIALIZED_VARIABLES:
        var_rows = SPECIALIZED_VARIABLES[target_tool['type']]
    else:
        var_rows = [
            ('Inputs', 'Values entered into the expression, matrix, dataset, or model controls above', 'Depends on input'),
            ('Outputs', 'Labeled results and diagnostics produced for the current inputs', 'Shown per result')
        ]

    var_tbody_html = ''.join(
        f'<tr><td><code>{e(sym)}</code></td><td>{e(meaning)}</td><td>{e(u_str)}</td></tr>'
        for sym, meaning, u_str in var_rows
    )

    # 4. How It Works (concise numbered steps)
    if pre_fields:
        field_names = ', '.join(f'{fld["label"]} ({fld["key"]})' for fld in pre_fields[:4])
        how_steps = [
            f'<strong>Enter input parameters:</strong> Provide values for {e(field_names)}. If you select an alternative unit from any dropdown, the calculator converts it to the canonical base unit automatically.',
            f'<strong>Apply governing relation:</strong> The solver substitutes the normalized values into <code>{e(formula_str)}</code> using IEEE-754 double-precision arithmetic.',
            f'<strong>Inspect step-by-step derivation:</strong> Review the primary and secondary results on the right, and click <strong>Explain Calculation</strong> to view the substituted formula and intermediate steps.'
        ]
    else:
        how_steps = [
            f'<strong>Configure parameters:</strong> Enter your mathematical expression, matrix, dataset, or physical model parameters in the interactive controls above.',
            f'<strong>Execute domain solver:</strong> The engine validates domain constraints and runs the {e(sub_name.lower())} algorithm using <code>{e(formula_str)}</code>.',
            f'<strong>Verify trace & diagnostics:</strong> Inspect the primary output cards and open <strong>Explain Calculation</strong> for the complete step-by-step derivation.'
        ]
    how_html = ''.join(f'<li>{st}</li>' for st in how_steps)

    # 5. Worked Example ( inside accessible <details class="edu-collapse"> )
    if pre_fields:
        given_str = ', '.join(f'{fld["key"]} = {fld["default"]}{" " + fld["unit"] if fld.get("unit") else ""}' for fld in pre_fields)
        out_list = target_tool.get('outputs', [])
        if target_tool.get('type') == 'multimode' and target_tool.get('modes'):
            def_m = t.get('defaultMode') or target_tool.get('defaultMode') or target_tool['modes'][0]['id']
            m_obj = next((m for m in target_tool['modes'] if m['id'] == def_m), target_tool['modes'][0])
            out_list = m_obj.get('outputs', [])
        out_labels = ', '.join(f'{o["label"]}{" (" + o["unit"] + ")" if o.get("unit") else ""}' for o in out_list[:3])
        example_body = (
            f'<p style="margin:0 0 8px">Using the default reference inputs loaded on this page, the calculator evaluates <strong>{e(t["title"])}</strong> as follows:</p>'
            f'<div class="edu-example-grid">'
            f'<div class="edu-example-box"><small>Reference Inputs</small><div>{e(given_str)}</div></div>'
            f'<div class="edu-example-box"><small>Governing Equation</small><div>{e(formula_str)}</div></div>'
            f'<div class="edu-example-box"><small>Computed Outputs</small><div>{e(out_labels)} (see live results panel)</div></div>'
            f'</div>'
        )
    else:
        example_body = (
            f'<p style="margin:0 0 8px">This interactive solver pre-loads a standard benchmark problem for <strong>{e(t["title"])}</strong> so you can verify the method immediately:</p>'
            f'<div class="edu-example-grid">'
            f'<div class="edu-example-box"><small>Governing Relation</small><div>{e(formula_str)}</div></div>'
            f'<div class="edu-example-box"><small>Interactive Verification</small><div>Click <b>Explain Calculation</b> in the results panel to inspect the full worked steps for the current inputs.</div></div>'
            f'</div>'
        )

    # Show reproducible reference values for high-traffic specialized solvers.
    if target_tool.get('type') == 'finance_npv':
        example_body = (
            '<p>Using the initial cash flow and four annual cash flows preloaded in the calculator:</p>'
            '<div class="edu-example-grid">'
            '<div class="edu-example-box"><small>Reference Inputs</small><div>r = 10%; CF = [−1000, 300, 400, 500, 600]</div></div>'
            '<div class="edu-example-box"><small>Substitution</small><div>NPV = −1000 + 300/1.1 + 400/1.1² + 500/1.1³ + 600/1.1⁴</div></div>'
            '<div class="edu-example-box"><small>Expected NPV</small><div>388.77125879 currency units</div></div>'
            '</div>'
        )
    elif target_tool.get('type') == 'linalg_eigen':
        example_body = (
            '<p>The preloaded 2×2 matrix has two distinct real eigenvalues:</p>'
            '<div class="edu-example-grid">'
            '<div class="edu-example-box"><small>Reference Matrix</small><div>A = [[4, 1], [2, 3]]</div></div>'
            '<div class="edu-example-box"><small>Characteristic Equation</small><div>det(A − λI) = λ² − 7λ + 10 = 0</div></div>'
            '<div class="edu-example-box"><small>Expected Results</small><div>λ₁ = 5; λ₂ = 2; tr(A) = 7; det(A) = 10</div></div>'
            '</div>'
        )

    # Independent, reproducible editorial reference cases—not boilerplate.
    case = EDITORIAL_CASES.get(t['slug'])
    if case:
        example_body = (
            '<p>Independent worked example: these reference inputs can be entered into the calculator to reproduce the result.</p>'
            '<div class="edu-example-grid">'
            f'<div class="edu-example-box"><small>Reference inputs</small><div>{e(case["inputs"])}</div></div>'
            f'<div class="edu-example-box"><small>Calculation</small><div>{e(case["calculation"])}</div></div>'
            f'<div class="edu-example-box"><small>Expected result</small><div>{e(case["result"])}</div></div>'
            '</div>'
        )
    interpretation_html = (
        '<div class="edu-sec edu-interpretation">'
        '<h3 class="edu-sec-title">When to use this calculator</h3>'
        f'<p class="edu-prose">{e(case["purpose"])}</p>'
        '<h3 class="edu-sec-title">How to check the answer</h3>'
        f'<p class="edu-prose">{e(case["check"])}</p>'
        '<h3 class="edu-sec-title">Important limitation</h3>'
        f'<p class="edu-prose">{e(case["limitation"])}</p>'
        '</div>'
        if case else ''
    )

    # 6. Assumptions & Limitations
    assumptions_items = []
    if note_str:
        assumptions_items.append(e(note_str))
    if cat_name == 'Astronomy & Astrophysics':
        assumptions_items.append('All internal evaluations use SI units and IAU 2012/2015 & CODATA 2018 physical constants (c = 299,792,458 m/s, G = 6.67430 × 10⁻¹¹ m³·kg⁻¹·s⁻², 1 AU = 149,597,870,700 m).')
        if sub_name == 'Cosmology':
            assumptions_items.append('Cosmological distances and lookback times assume a homogeneous, isotropic FLRW metric; simple linear Hubble approximations (v = H₀d) are valid only at low redshift (z ≪ 0.1).')
        elif sub_name == 'Orbital Mechanics & Celestial Motion':
            assumptions_items.append('Two-body Keplerian models assume point-mass or spherically symmetric bodies without atmospheric drag, solar radiation pressure, or third-body perturbations.')
    elif cat_name == 'Physics & Engineering':
        assumptions_items.append('Calculations use standard SI units and ideal lumped-element or classical continuum models unless dissipative losses are explicitly specified.')
    elif cat_name == 'Finance':
        assumptions_items.append('Financial projections assume constant periodic rates and compounding conventions for educational planning, and do not account for variable market taxes or brokerage fees.')
    else:
        assumptions_items.append('Evaluated in IEEE-754 double-precision floating-point arithmetic (~15–17 significant decimal digits) with explicit domain boundary checks.')

    assumptions_html = ''.join(f'<li>{item}</li>' for item in assumptions_items)

    return f'''<section class="edu-guide" id="edu-guide" aria-label="Calculator explanation and scientific reference">
  <div class="edu-guide-header">
    <span class="eyebrow">SCIENTIFIC & MATHEMATICAL REFERENCE</span>
    <h2>How {e(t['title'])} Works</h2>
  </div>
  <div class="edu-sec edu-overview">
    <h3 class="edu-sec-title"><span class="edu-step-num">1</span> Overview</h3>
    <p class="edu-prose">{e(overview_text)}</p>
  </div>
  <div class="edu-sec edu-formula">
    <h3 class="edu-sec-title"><span class="edu-step-num">2</span> Formula</h3>
    <div class="formula-block" id="edu-formula-box">{e(formula_str)}</div>
  </div>
  <div class="edu-sec edu-variables">
    <h3 class="edu-sec-title"><span class="edu-step-num">3</span> Variables & Constants</h3>
    <div class="edu-table-wrap">
      <table class="edu-var-table">
        <thead><tr><th>Symbol</th><th>Meaning</th><th>Unit</th></tr></thead>
        <tbody id="edu-var-tbody">{var_tbody_html}</tbody>
      </table>
    </div>
  </div>
  <div class="edu-sec edu-how">
    <h3 class="edu-sec-title"><span class="edu-step-num">4</span> How It Works</h3>
    <ol class="edu-how-list">{how_html}</ol>
  </div>
  <div class="edu-sec edu-example">
    <details class="edu-collapse" id="edu-example-details">
      <summary><span><span class="edu-step-num" style="margin-right:8px">5</span> Worked Example & Reference Case</span></summary>
      <div class="edu-collapse-body">{example_body}</div>
    </details>
  </div>
  {interpretation_html}
  <div class="edu-sec edu-assumptions">
    <h3 class="edu-sec-title"><span class="edu-step-num">6</span> Assumptions & Limitations</h3>
    <ul class="edu-assumptions-list">{assumptions_html}</ul>
  </div>
</section>'''


def build_seo_focus_html(focus):
    """Human-readable, unique worked examples and guidance on selected canonical pages."""
    if not focus:
        return ''
    steps = ''.join(f'<li>{e(step)}</li>' for step in focus['steps'])
    examples = ''.join(
        f'<div class="seo-example"><h3>{e(label)}</h3><p>{e(calculation)}</p></div>'
        for label, calculation in focus['examples']
    )
    questions = ''.join(
        f'<div class="seo-qa"><h3>{e(q)}</h3><p>{e(a)}</p></div>'
        for q, a in focus['questions']
    )
    related = ''.join(
        f'<a href="/tools/{e(target)}/">{e(label)} →</a>'
        for label, target in focus['related']
    )
    return (
        '<section class="seo-focus section" aria-labelledby="seo-focus-heading">'
        '<div class="seo-focus-head"><span class="eyebrow">PRACTICAL EXAMPLES & DEFINITIONS</span>'
        f'<h2 id="seo-focus-heading">{e(focus["heading"])}: explained</h2>'
        f'<p>{e(focus["answer"])}</p></div>'
        '<div class="seo-focus-grid"><div class="seo-focus-column">'
        '<h3 class="seo-focus-subtitle">How to use the calculator</h3>'
        f'<ol class="seo-focus-steps">{steps}</ol>'
        '<h3 class="seo-focus-subtitle">Worked examples</h3>'
        f'<div class="seo-examples">{examples}</div></div>'
        '<div class="seo-focus-column"><h3 class="seo-focus-subtitle">Common questions</h3>'
        f'<div class="seo-questions">{questions}</div>'
        '<h3 class="seo-focus-subtitle">Related calculations</h3>'
        f'<nav class="seo-related" aria-label="Related calculations">{related}</nav>'
        '</div></div></section>'
    )


featured_slugs = [
    'scientific-calculator',
    'symbolic-derivative-calculator',
    'definite-integral-calculator',
    'triangle-trigonometry-solver',
    'eigenvalues-eigenvectors-calculator',
    'rlc-resonance-calculator',
    'redshift-distance-calculator',
    'schwarzschild-radius-calculator',
    'npv-calculator'
]
featured = [next((t for t in T if t['slug'] == s), None) for s in featured_slugs]
featured = [t for t in featured if t is not None]

catshtml = ''.join(
    f'<a class="category-card" href="/categories/{slug(c["name"])}/">'
    f'<span class="cat-glyph">{e(icon.get(c["name"], "#"))}</span>'
    f'<b>{e(c["name"])}</b>'
    f'<small>{e(c["description"])}</small>'
    f'<div class="cat-subpills">{"".join(f"<span class=cat-subpill>{e(s)}</span>" for s in c.get("subcategories", [])[:3])}</div>'
    f'<span class="cat-count">{sum(1 for t in canonical_tools if t["category"] == c["name"])} calculators →</span></a>'
    for c in cats
)


# Prominent, evergreen links to verified everyday calculators with observed search demand.
# All destinations are existing canonical calculator URLs, not legacy aliases.
def game_card(g):
    return (
        f'<a class="brain-game-card" href="/games/{e(g["id"])}/">'
        f'<span class="brain-game-card-head"><span class="brain-game-symbol" aria-hidden="true">'
        f'{e(next((c["icon"] for c in GAME_CATEGORIES if c["name"] == g["category"]), "✦"))}'
        f'</span><span class="brain-game-difficulty">{e(g["difficulty"])}</span></span>'
        f'<h3>{e(g["title"])}</h3><p>{e(g["description"])}</p>'
        f'<span class="brain-game-link">Play this game →</span></a>'
    )

def games_in_category(category):
    return [g for g in GAMES if g['category'] == category]

def game_page_document(title, desc, path, body, attrs, schema=''):
    return document(title, desc, path, body, attrs, schema)

quick_tool_links = [
    ('prime-checker', 'Prime Number Checker', 'Prime tests, factors and divisors', 'P'),
    ('slope-calculator', 'Slope Calculator', 'Rise, run, distance and midpoint', 'm'),
    ('percentage-calculator', 'Percentage Calculator', 'Change, difference and percentages', '%'),
    ('attendance-planner', 'Attendance Calculator', 'Target attendance and classes to skip', 'A'),
    ('recipe-scaler', 'Recipe Scaling Calculator', 'Adjust ingredients for any serving count', '×'),
    ('paint-coverage', 'Paint Coverage Calculator', 'Estimate litres, wall area and coats', 'L'),
    ('midpoint-calculator', 'Midpoint Calculator', 'Find a line segment midpoint', 'M'),
    ('image-resolution-calculator', 'PPI Calculator', 'Pixel density and screen resolution', 'px')
]
quicklinks_html = ''.join(
    f'<a class="quick-tool-card" href="/tools/{e(tool_slug)}/">'
    f'<span class="quick-tool-icon" aria-hidden="true">{e(symbol)}</span>'
    f'<span class="quick-tool-body"><b>{e(label)}</b><small>{e(description)}</small></span>'
    f'<span class="quick-tool-arrow" aria-hidden="true">↗</span></a>'
    for tool_slug, label, description, symbol in quick_tool_links
)

home = f'''<section class="hero"><div class="hero-copy"><span class="eyebrow">THE ALL-IN-ONE STEM, ASTRONOMY & FINANCIAL CALCULATION STUDIO</span><h1>Everything adds up.<br><span>With step-by-step clarity.</span></h1><p>From symbolic calculus, linear algebra, and engineering circuits to orbital mechanics, numerical ΛCDM cosmology, black hole relativity, exoplanet transits, statistics, and quantitative finance.</p><div class="hero-buttons"><a class="main-button" href="/tools/scientific-calculator/">Start calculating <span>↗</span></a><a class="secondary-button" href="#all-calculators">Explore all calculators ↓</a></div></div><div class="hero-orbit" aria-hidden="true"><span class="orbit-circle one"></span><span class="orbit-circle two"></span><span class="orbit-circle three"></span><span class="orbit-planet">∑</span><span class="float-equation a">R_s = 2GM/c²</span><span class="float-equation b">∫ f(x) dx</span><span class="float-equation c">PA = LU</span></div></section>
<section class="metrics"><div class="metric"><span class="metric-icon">∑</span><div><strong id="total-tools">{len(canonical_tools)}+</strong><small> Interactive calculators</small></div></div><div class="metric"><span class="metric-icon">◈</span><div><strong>{len(cats)}</strong><small>Primary STEM, Astronomy & Finance categories</small></div></div><div class="metric"><span class="metric-icon">✦</span><div><strong>100% Explained</strong><small>Step-by-step derivation on every tool</small></div></div></section>
<section class="section quick-tools-section" id="quick-tools"><div class="section-heading"><div><span class="eyebrow">USEFUL EVERYDAY CALCULATIONS</span><h2>Find a quick answer</h2><p>Jump directly to a free calculator for numbers, coordinates, study, screen displays, recipes and home projects.</p></div></div><nav class="quick-tool-grid" aria-label="Quick access to everyday calculators">{quicklinks_html}</nav></section>
<section class="brain-promo section" id="brain-games"><div class="brain-promo-head"><div><span class="eyebrow">PLAY, THINK &amp; VERIFY</span><h2>Learn it by playing it.</h2><p>18 free STEM brain games across 9 subjects. Every wrong answer links to a relevant calculator.</p></div><a href="/games/">Explore all 18 games →</a></div><nav class="brain-promo-grid" aria-label="Brain games">{''.join(f'<a href="/games/{e(g["id"])}/"><span class="brain-game-symbol" aria-hidden="true">✦</span><span>{e(g["title"])}</span></a>' for g in GAMES if g['id'] in ('prime-detective','equation-escape','energy-quest','star-distance'))}</nav></section>
<section class="section" id="featured"><div class="section-heading"><div><span class="eyebrow">FLAGSHIP SOLVERS</span><h2>Featured calculators</h2><p>Symbolic & numerical calculus, linear algebra, astronomy & cosmology, engineering circuits, statistics, and finance.</p></div><a class="plain-link" href="#all-calculators">View complete library →</a></div><div class="tool-grid" id="featured-tools">{cards(featured)}</div></section>
<section class="section" id="categories"><div class="section-heading"><div><span class="eyebrow">STRUCTURED TAXONOMY</span><h2>Explore {len(cats)} primary categories</h2><p>Organized into {sum(len(c.get('subcategories', [])) for c in cats)} domain-specific subcategories for rapid discovery.</p></div></div><div class="categories-grid" id="categories-grid">{catshtml}</div></section>
<section class="section" id="recent-section" hidden><div class="section-heading"><div><h2>Pick up where you left off</h2><p>Recently used tools, saved only on this device.</p></div></div><div class="tool-grid" id="recent-tools"></div></section>
<section class="section" id="all-calculators"><div class="section-heading library-header"><div><span class="eyebrow">COMPLETE TOOL LIBRARY</span><h2>Every calculator, one place.</h2><p>{len(canonical_tools)} canonical calculators ({len(T)} total routes with full backward compatibility).</p></div><label class="search-field"><input type="search" data-page-search placeholder="Filter calculators..." aria-label="Filter all calculators"></label></div><div class="tool-grid" id="all-tools">{cards(canonical_tools)}</div></section>
<section class="info-card"><h2>Built for students, engineers, astronomers, researchers & analysts.</h2><p>Every calculation runs locally in your browser with deterministic step-by-step explanations, live mathematical expression previews, and unit-aware inputs. Results are computed using IEEE-754 double-precision arithmetic; always independently verify safety-critical engineering, medical, or financial decisions.</p></section>'''

for out_root in [site_root]:
    (out_root / 'index.html').write_text(
        document(
            'AxiomAtlas',
            f'{len(canonical_tools)}+ free calculators for mathematics, algebra, calculus, linear algebra, geometry, trigonometry, physics, engineering, astronomy, astrophysics, statistics, finance, and unit conversions.',
            '/',
            home,
            'data-page="home"',
            jsonld({
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                'name': 'AxiomAtlas',
                'description': 'Free all-in-one mathematics, engineering, astronomy, statistics and finance calculator platform',
                'url': (URL + '/') if URL else 'https://axiomatlas.netlify.app/'
            })
        ),
        encoding='utf8'
    )

    # Build the 9 primary category pages
    for c in cats:
        c_slug = slug(c['name'])
        items = [x for x in canonical_tools if x['category'] == c['name']]
        path = f'/categories/{c_slug}/'
        pills_html = f'<button type="button" class="filter-pill active" data-sub="all" aria-pressed="true">All {e(c["name"])} ({len(items)})</button>' + ''.join(
            f'<button type="button" id="{e(slug(s))}" class="filter-pill" data-sub="{e(slug(s))}" aria-pressed="false">{e(s)} ({sum(1 for x in items if tool_matches_subcat(x, s))})</button>'
            for s in c.get('subcategories', [])
        )
        cross_list_note = ('<p class="filter-note">Some calculators belong to multiple subcategories. The category total counts each calculator once.</p>' if any(x.get('secondarySubcategories') for x in items) else '')
        bod = f'''<div class="breadcrumbs"><a href="/">Home</a><span>›</span><strong>{e(c['name'])}</strong></div>
<div class="category-top"><span class="cat-glyph">{e(icon.get(c['name'], '#'))}</span><span class="eyebrow">{len(items)} FREE CALCULATORS · {len(c.get("subcategories", []))} SUBCATEGORIES</span><h1>{e(c['name'])} Calculators</h1><p>{e(c['description'])}. Every calculator includes live updates, structured explanations, and step-by-step derivations.</p></div>
<section class="section" style="margin-top:15px"><div class="section-heading library-header"><h2>Browse {len(items)} calculators</h2><label class="search-field"><input type="search" data-page-search placeholder="Filter in {e(c['name'])}..." aria-label="Filter calculators"></label></div><div id="subcat-pills" class="filter-pills">{pills_html}</div>{cross_list_note}<div class="tool-grid" id="category-tools">{cards(items)}</div></section>'''
        cat_games = games_in_category(c['name'])
        if cat_games:
            bod += ('<section class="brain-promo section"><div class="brain-promo-head"><div>'
                    '<span class="eyebrow">PRACTICE THIS SUBJECT</span><h2>Games for this subject</h2>'
                    '<p>Try a challenge, then verify the method in the matching calculator.</p>'
                    '</div><a href="/games/">All games →</a></div>'
                    '<div class="brain-game-grid">' + ''.join(game_card(g) for g in cat_games) + '</div></section>')
        dst = out_root / path.lstrip('/')
        dst.mkdir(parents=True, exist_ok=True)
        (dst / 'index.html').write_text(
            document(
                c['name'] + ' Calculators',
                f'{len(items)} free {c["name"].lower()} calculators. {c["description"]}',
                path,
                bod,
                f'data-page="category" data-category="{c_slug}"',
                active_cat_slug=c_slug
            ),
            encoding='utf8'
        )

    # Build legacy category compatibility pages so old /categories/<old-slug>/ URLs never 404
    for old_slug, raw_target in legacy_cat_redirects.items():
        target_cat_slug = raw_target.strip("/").split("/")[-1]
        if any(slug(c['name']) == old_slug for c in cats):
            continue
        target_cat = next((c for c in cats if slug(c['name']) == target_cat_slug), cats[0])
        items = [x for x in canonical_tools if slug(x['category']) == target_cat_slug]
        path = f'/categories/{old_slug}/'
        canon_target = fullurl(f'/categories/{target_cat_slug}/')
        bod = f'''<div class="breadcrumbs"><a href="/">Home</a><span>›</span><a href="/categories/{target_cat_slug}/">{e(target_cat['name'])}</a></div>
<div class="category-top"><span class="cat-glyph">{e(icon.get(target_cat['name'], '#'))}</span><span class="eyebrow">CATEGORY CONSOLIDATED INTO {e(target_cat['name'].upper())}</span><h1>{e(target_cat['name'])} Calculators</h1><p>{e(target_cat['description'])} <a class="plain-link" href="/categories/{target_cat_slug}/">Open primary {e(target_cat['name'])} hub →</a></p></div>
<section class="section" style="margin-top:15px"><div class="tool-grid" id="category-tools">{cards(items)}</div></section>'''
        dst = out_root / path.lstrip('/')
        dst.mkdir(parents=True, exist_ok=True)
        (dst / 'index.html').write_text(
            document(
                target_cat['name'] + ' Calculators',
                target_cat['description'],
                path,
                bod,
                f'data-page="category" data-category="{target_cat_slug}"',
                canonical_override=canon_target,
                robots='noindex,follow',
                active_cat_slug=target_cat_slug
            ),
            encoding='utf8'
        )

    # Build all calculator pages
    for t in T:
        path = f'/tools/{t["slug"]}/'
        cat_slug = slug(t['category'])
        sub_slug = slug(t.get('subcategory', ''))
        target_tool = next((x for x in T if x['slug'] == t.get('canonicalSlug')), t) if t.get('canonicalSlug') else t
        same_sub = [x for x in canonical_tools if x['category'] == t['category'] and x.get('subcategory') == t.get('subcategory') and x['slug'] != target_tool['slug']]
        same_cat = [x for x in canonical_tools if x['category'] == t['category'] and x['slug'] != target_tool['slug'] and x not in same_sub]
        related = (same_sub + same_cat)[:6]

        pre_fields = []
        if target_tool['type'] == 'formula':
            pre_fields = target_tool.get('fields', [])
        elif target_tool['type'] == 'multimode' and target_tool.get('modes'):
            def_mode_id = t.get('defaultMode') or target_tool.get('defaultMode') or target_tool['modes'][0]['id']
            m_obj = next((m for m in target_tool['modes'] if m['id'] == def_mode_id), target_tool['modes'][0])
            pre_fields = m_obj.get('fields', [])

        pre_inputs_html = (
            '<div class="control-grid">' + ''.join(
                f'<label class="control"><span>{e(x["label"])}</span><input type="text" inputmode="decimal" data-field="{e(x["key"])}" value="{e(x["default"])}"></label>'
                for x in pre_fields
            ) + '</div>'
            if pre_fields else '<p>Loading interactive calculator…</p>'
        )

        alias_banner = (
            f'<div class="notice" style="margin-bottom:14px"><b>Consolidated Tool Mode:</b> You are viewing the <b>{e(t["title"])}</b> mode inside our unified <a class="plain-link" href="/tools/{e(t["canonicalSlug"])}/">{e(target_tool["title"])}</a> suite.</div>'
            if t.get('isAlias') and t.get('canonicalSlug') else ''
        )

        edu_guide_html = build_edu_guide_html(t, target_tool, pre_fields)
        focus = SEO_FOCUS.get(t['slug']) if not t.get('isAlias') else None
        focus_html = build_seo_focus_html(focus)
        visible_heading = focus['heading'] if focus else t['title']
        visible_intro = focus['intro'] if focus else t['description']

        bod = f'''<div class="breadcrumbs"><a href="/">Home</a><span>›</span><a href="/categories/{cat_slug}/">{e(t['category'])}</a><span>›</span><a href="/categories/{cat_slug}/#{sub_slug}">{e(t.get('subcategory') or t['category'])}</a><span>›</span><strong>{e(t['title'])}</strong></div>
<section class="tool-top"><div><span class="eyebrow">{e(t['category'].upper())} › {e((t.get('subcategory') or t['category']).upper())}</span><h1>{e(visible_heading)}</h1><p>{e(visible_intro)}</p></div><div class="tool-top-actions"><button class="outline-btn" id="favorite-toggle">☆ Save tool</button><button class="outline-btn" id="share-tool">↗ Share</button></div></section>
{alias_banner}
<div class="calculator-layout"><div class="calculator-inputs"><div class="calculator-card"><div class="calc-card-header"><h2>Input values</h2><span class="tiny-tag">✦ Live & Unit-Aware</span></div><div id="calculator-app">{pre_inputs_html}</div></div></div><aside class="answer-card"><div class="answer-heading"><h2>Your results</h2><span class="live-label"><i class="live-dot"></i> LIVE</span></div><div id="result-display" aria-live="polite"><p class="mini-help">Edit any field to calculate your result and view the step-by-step explanation.</p></div><p id="result-status">Calculated locally · verified single-pipeline trace</p></aside><div class="calculator-guide-wrap">{edu_guide_html}</div></div>
{focus_html}
<section class="section"><div class="section-heading"><div><span class="eyebrow">RELATED IN {e((t.get('subcategory') or t['category']).upper())}</span><h2>More {e(t['category'])} calculators</h2></div><a class="plain-link" href="/categories/{cat_slug}/">View all {e(t['category'])} tools →</a></div><div class="related-grid" id="related-tools">{cards(related)}</div></section>'''
        tool_games = [g for g in GAMES if g['calculatorSlug'] == t['slug'] and not t.get('isAlias')]
        if tool_games:
            g = tool_games[0]
            bod += ('<div class="brain-related-inline"><div><span class="eyebrow">TEST YOUR SKILLS</span>'
                    f'<h3>Try {e(g["title"])}</h3>'
                    f'<p>{e(g["description"])} Wrong answers can be verified with this calculator.</p>'
                    f'</div><a href="/games/{e(g["id"])}/">Play challenge →</a></div>')


        canon_url = fullurl(f'/tools/{t.get("canonicalSlug") or t["slug"]}/')
        ld = [
            {
                '@context': 'https://schema.org',
                '@type': 'WebApplication',
                'name': visible_heading,
                'description': focus['description'] if focus else t['description'],
                'url': canon_url,
                'applicationCategory': 'EducationalApplication',
                'operatingSystem': 'Any',
                'isAccessibleForFree': True,
                'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'USD'}
            },
            {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                'itemListElement': [
                    {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': fullurl('/')},
                    {'@type': 'ListItem', 'position': 2, 'name': t['category'], 'item': fullurl(f'/categories/{cat_slug}/')},
                    {'@type': 'ListItem', 'position': 3, 'name': t['title'], 'item': canon_url}
                ]
            }
        ]
        mode_attr = f' data-mode="{e(t["defaultMode"])}"' if t.get('defaultMode') else ''
        dst = out_root / path.lstrip('/')
        dst.mkdir(parents=True, exist_ok=True)
        (dst / 'index.html').write_text(
            document(
                t['title'],
                focus['description'] if focus else t['description'] + ' Free online calculator with formula, variables table, and step-by-step explanation.',
                path,
                bod,
                f'data-page="tool" data-tool="{e(t["slug"])}"{mode_attr}',
                jsonld(ld),
                canonical_override=canon_url,
                active_cat_slug=cat_slug,
                seo_title=focus['title'] if focus else None
            ),
            encoding='utf8'
        )

    # Fully crawlable games hub and a distinct landing page for each learning activity.
    game_links = ''.join(
        '<section class="brain-category-block" id="' + e(c['slug']) + '">'
        '<div class="brain-category-heading"><span class="brain-category-icon" aria-hidden="true">' + e(c['icon']) + '</span>'
        '<div><h2>' + e(c['name']) + '</h2><p>' + e(c['description']) + '</p></div>'
        '<a href="/categories/' + e(c['slug']) + '/">Calculators →</a></div>'
        '<div class="brain-game-grid">' + ''.join(game_card(g) for g in games_in_category(c['name'])) + '</div></section>'
        for c in GAME_CATEGORIES
    )
    game_hub = (
        '<div class="brain-page"><div class="breadcrumbs"><a href="/">Home</a><span>›</span><strong>Games &amp; Activities</strong></div>'
        '<section class="brain-hero"><span class="brain-kicker">AXIOMATLAS BRAIN LAB</span>'
        '<h1>Think deeper. <span>Play smarter.</span></h1>'
        '<p>18 free brain games and interactive challenges across mathematics, algebra, calculus, geometry, physics, statistics, finance, everyday tools and astronomy. '
        'When you miss an answer, learn the method and open a matching calculator to independently verify it.</p>'
        '<div class="brain-hero-stats"><span class="brain-stat-pill"><b>18</b> games</span>'
        '<span class="brain-stat-pill"><b>9</b> subjects</span>'
        '<span class="brain-stat-pill"><b>5</b> rounds per game</span>'
        '<span class="brain-stat-pill">Free · No account</span></div></section>'
        + game_links + '</div>'
    )
    game_dir = out_root / 'games'
    game_dir.mkdir(parents=True, exist_ok=True)
    (game_dir / 'index.html').write_text(
        game_page_document(
            'Free Math, Science & Brain Games',
            'Play 18 free math, logic, physics, finance, statistics and astronomy games. Check wrong answers with AxiomAtlas calculators. No login needed.',
            '/games/', game_hub, 'data-page="games"',
            jsonld({'@context': 'https://schema.org', '@type': 'CollectionPage',
                    'name': 'AxiomAtlas Brain Lab — Free Math and Science Games',
                    'url': fullurl('/games/'), 'description': '18 educational brain games in 9 STEM and everyday subjects'})
        ), encoding='utf8'
    )
    for g in GAMES:
        path = f'/games/{g["id"]}/'
        sibling_games = [other for other in games_in_category(g['category']) if other['id'] != g['id']]
        game_html = (
            '<div class="brain-page">'
            f'<a class="brain-breadcrumb" href="/games/">← All brain games</a>'
            '<section class="brain-hero brain-detail-hero">'
            f'<span class="brain-kicker">{e(g["category"])} · {e(g["difficulty"])}</span>'
            f'<h1>{e(g["title"])}</h1><p>{e(g["description"])} Solve five problems, learn from every answer, '
            f'and verify your work with the {e(g["calculatorName"])}.</p>'
            '<div class="brain-hero-stats"><span class="brain-stat-pill">5 puzzles per round</span>'
            '<span class="brain-stat-pill">Free · No sign-in</span><span class="brain-stat-pill">Personal best saved locally</span></div>'
            '</section><div class="brain-game-layout">'
            f'<div class="brain-player" id="game-player" data-game-id="{e(g["id"])}"'
            f' data-game-title="{e(g["title"])}"'
            f' data-calculator-slug="{e(g["calculatorSlug"])}"'
            f' data-calculator-name="{e(g["calculatorName"])}">'
            '<p>Loading your challenge…</p><noscript>Enable JavaScript to play this interactive challenge. '
            'The calculator and reference pages remain accessible without JavaScript.</noscript></div>'
            '<aside class="brain-sidebar"><h2>How this challenge works</h2>'
            '<ol><li>Answer 5 questions using your reasoning.</li>'
            '<li>Use hints if you need them; a correct answer with a hint earns 7 rather than 10 points.</li>'
            '<li>After every answer, inspect the explanation and use the corresponding calculator to verify it.</li>'
            '<li>Play again to improve your personal best, saved on this device.</li></ol>'
            '<div class="brain-side-note"><strong>Check your calculation</strong>'
            f'<p>Use <a href="/tools/{e(g["calculatorSlug"])}/">{e(g["calculatorName"])}</a> to reproduce any challenge result.</p>'
            '<p>No account, public leaderboard or real-money rewards are involved.</p></div></aside></div>'
            '<section class="brain-more"><h2>More challenges in this subject</h2>'
            '<div class="brain-game-grid">' + ''.join(game_card(other) for other in sibling_games) + '</div></section>'
            '</div>'
        )
        schema = jsonld([
            {'@context': 'https://schema.org', '@type': 'WebApplication',
             'name': g['title'] + ' — AxiomAtlas Brain Lab',
             'description': g['description'], 'url': fullurl(path),
             'applicationCategory': 'EducationalApplication', 'operatingSystem': 'Any',
             'isAccessibleForFree': True, 'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'USD'}},
            {'@context': 'https://schema.org', '@type': 'BreadcrumbList',
             'itemListElement': [
                 {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': fullurl('/')},
                 {'@type': 'ListItem', 'position': 2, 'name': 'Brain Games', 'item': fullurl('/games/')},
                 {'@type': 'ListItem', 'position': 3, 'name': g['title'], 'item': fullurl(path)}
             ]}
        ])
        html_doc = game_page_document(
            g['title'] + ' — Free Brain Game',
            g['description'] + ' Play five interactive rounds and verify answers with the related calculator.',
            path, game_html, f'data-page="game" data-game="{e(g["id"])}"', schema
        )
        html_doc = html_doc.replace('</body>',
            f'<script type="module" src="/assets/brain-games.mjs?v={ASSET_VERSION}"></script></body>', 1)
        dst = out_root / path.lstrip('/')
        dst.mkdir(parents=True, exist_ok=True)
        (dst / 'index.html').write_text(html_doc, encoding='utf8')

    for slugpath, title, body in [
        ('about', 'About & accuracy', "AxiomAtlas is a comprehensive collection of free, browser-based mathematical, engineering, physical, astronomical, statistical, and financial calculation tools for learning, problem-solving, and rapid verification. Every calculator includes a structured 6-part educational guide and a deterministic step-by-step Explain Calculation trace generated from the exact same execution pipeline as the displayed result. Numerical root-finding, quadrature, ΛCDM cosmological integrals, Keplerian orbit solvers, ODE solvers, and matrix factorizations operate in IEEE-754 double precision. Always independently verify safety-critical, medical, tax, financial, or structural engineering calculations before acting."),
        ('privacy', 'Privacy policy', "Your calculator inputs are processed locally in your browser and are never transmitted to our server for calculation. Favorites, recent tools, theme preferences, and Brain Lab personal-best scores are stored in local browser storage on your device. AxiomAtlas uses Google Analytics 4 (measurement ID G-G9NPE8LWSM) to understand aggregate website usage. Calculator input values are not sent to Google Analytics, and we do not display third-party advertisements.")
    ]:
        path = f'/{slugpath}/'
        dst = out_root / slugpath
        dst.mkdir(exist_ok=True)
        (dst / 'index.html').write_text(
            document(
                title,
                body[:155],
                path,
                "<div class=\"breadcrumbs\"><a href=\"/\">Home</a><span>›</span><strong>About &amp; accuracy</strong></div>\n<section class=\"info-card\" style=\"margin-top:20px\">\n  <h1>About AxiomAtlas</h1>\n  <p>AxiomAtlas provides browser-based calculators for mathematics, physics, engineering, astronomy, statistics and finance. Its purpose is to make calculations repeatable, accessible and easier to understand. Inputs are processed locally in the browser. The reference explanations help with learning; they are not a substitute for professional review.</p>\n  <h2>How calculations and explanations work</h2>\n  <p>Results are generated by a JavaScript calculation engine. Formula tools evaluate expressions, while specialized tools use algorithms for tasks such as root finding, symbolic operations, matrix decomposition and numerical integration. Many outputs use IEEE-754 double precision; numerical approximations have finite error. The live Explain Calculation view follows the same run that produced the displayed result, but some specialized explanations are summaries rather than formal mathematical proofs.</p>\n  <h2>Reproducibility and automated checks</h2>\n  <p>The project's source, calculator catalog, and automated test suite are public in the <a class=\"plain-link\" href=\"https://github.com/msrajput08/axiom-atlas\">AxiomAtlas GitHub repository</a>. Tests cover representative formula results, mathematical edge cases, compatibility routes and rendering behavior. Passing tests helps catch regressions; it does not certify that every possible input or every published reference explanation has been independently verified. Selected calculator guides include independently reproducible numerical benchmark cases and clearly stated assumptions.</p>\n  <h2>Known limitations and safe use</h2>\n  <p>Small changes in inputs may produce large changes in ill-conditioned problems; iterative solvers can fail to converge, and models may omit real-world effects such as friction, taxes, market variability, electromagnetic losses or non-ideal instrumentation. Review units and input constraints and independently validate decisions involving financial, medical, safety-critical, structural or high-stakes engineering use.</p>\n  <h2>Corrections and maintenance</h2>\n  <p>Calculator definitions, explanations, and tests are maintained in version-controlled source code. If you notice an incorrect result, unclear assumption, outdated constant or broken interface, include the calculator link, your input values, expected result and any trusted reference when <a class=\"plain-link\" href=\"https://github.com/msrajput08/axiom-atlas/issues\">reporting an issue on GitHub</a>. Public changes can be inspected through the repository's commit history. The available automated checks should not be mistaken for external peer review.</p>\n</section>" if slugpath == 'about' else f'<div class="breadcrumbs"><a href="/">Home</a><span>›</span><strong>{e(title)}</strong></div><div class="info-card" style="margin-top:20px"><h1>{e(title)}</h1><p>{e(body)}</p></div>',
                'data-page="info"'
            ),
            encoding='utf8'
        )

    (out_root / '404.html').write_text(
        document(
            'Page not found',
            'The requested page could not be found.',
            '/404/',
            '<div class="not-found"><span class="eyebrow">404 — PAGE NOT FOUND</span><h1>Nothing here. Yet.</h1><p>This page does not exist or may have moved.</p><a class="main-button" href="/">Back to all calculators ↗</a></div>',
            'data-page="info"',
            robots='noindex,follow'
        ),
        encoding='utf8'
    )

    (out_root / 'assets/favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><rect width="72" height="72" rx="18" fill="#5f50ed"/><circle cx="36" cy="36" r="12" fill="none" stroke="white" stroke-width="5"/><ellipse cx="36" cy="36" rx="30" ry="15" fill="none" stroke="white" stroke-width="4" transform="rotate(-38 36 36)"/><circle cx="58" cy="16" r="6" fill="#ffdb8a"/></svg>', encoding='utf8')
    (out_root / 'manifest.webmanifest').write_text(json.dumps({'name': 'AxiomAtlas - STEM, Astronomy & Finance Calculators', 'short_name': 'AxiomAtlas', 'description': 'Free mathematical, scientific, engineering, astronomy, statistics and finance calculators', 'start_url': '/', 'display': 'standalone', 'background_color': '#f8f9fd', 'theme_color': '#151530', 'icons': [{'src': '/assets/favicon.svg', 'sizes': 'any', 'type': 'image/svg+xml', 'purpose': 'any'}]}), encoding='utf8')
    (out_root / 'robots.txt').write_text('User-agent: *\nAllow: /\n' + (f'Sitemap: {URL}/sitemap.xml\n' if URL else ''), encoding='utf8')
    (out_root / '_headers').write_text('/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n\n/assets/app.js\n  Cache-Control: public, max-age=0, must-revalidate\n\n/assets/catalog.json\n  Cache-Control: public, max-age=0, must-revalidate\n\n/assets/styles.css\n  Cache-Control: public, max-age=0, must-revalidate\n\n/assets/brain-games.mjs\n  Cache-Control: public, max-age=0, must-revalidate\n\n/assets/games-engine.mjs\n  Cache-Control: public, max-age=0, must-revalidate\n\n/assets/brain-games-catalog.json\n  Cache-Control: public, max-age=0, must-revalidate\n\n/assets/brain-games.css\n  Cache-Control: public, max-age=0, must-revalidate\n\n/assets/*\n  Cache-Control: public, max-age=604800\n', encoding='utf8')

    redirect_lines = [
        f'/categories/{old_s}/* /categories/{new_s}/ 301'
        for old_s, raw_new in legacy_cat_redirects.items() if (new_s := raw_new.strip("/").split("/")[-1])
        if old_s != new_s
    ]
    redirect_lines.append('/tools/* /tools/:splat 200')
    (out_root / '_redirects').write_text('\n'.join(redirect_lines) + '\n', encoding='utf8')

print(f'Built {len(GAMES)} brain game pages + games hub across {len(GAME_CATEGORIES)} subjects')
print(f'Built {len(T)} calculator pages ({len(canonical_tools)} canonical + {len(T) - len(canonical_tools)} aliases) + {len(cats)} primary category pages + {len(legacy_cat_redirects)} legacy category compatibility pages')
