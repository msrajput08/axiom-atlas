from pathlib import Path
import json, html, re, os, sys

root = Path(__file__).resolve().parent
catalog = json.loads((root / 'assets/catalog.json').read_text(encoding='utf8'))
T = catalog['tools']
canonical_tools = [t for t in T if not t.get('isAlias')]
cats = catalog['categories']
legacy_cat_redirects = catalog.get('legacyCategoryRedirects', {})
URL = os.environ.get('SITE_URL', 'https://axiomatlas.netlify.app').strip().rstrip('/')

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
    'Converters & Everyday Tools': '⇄'
}

e = lambda s: html.escape(str(s), quote=True)
def slug(x): return re.sub(r'(^-|-$)', '', re.sub(r'[^a-z0-9]+', '-', str(x).lower()))

def cards(tools):
    return '\n'.join(
        f'<a class="tool-card" href="/tools/{e(t["slug"])}/" data-cat="{e(slug(t["category"]))}" data-subcat="{e(slug(t.get("subcategory", "")))}">'
        f'<span class="tool-icon">{e(icon.get(t["category"], "✦"))}</span>'
        f'<span class="tool-card-body"><b>{e(t["title"])}</b>'
        f'<small><span class="tool-subtag">{e(t.get("subcategory") or t["category"])}</span>{e(t["description"])}</small></span>'
        f'<span class="card-arrow">↗</span></a>'
        for t in tools
    )

def fullurl(path):
    return (URL + path) if URL else ''

def sidebar_nav_html(active_cat_slug=''):
    parts = []
    for c in cats:
        c_slug = slug(c['name'])
        is_open = (c_slug == active_cat_slug)
        cat_tools = [t for t in canonical_tools if t['category'] == c['name']]
        sub_links = ''.join(
            f'<a href="/categories/{c_slug}/#{slug(s)}" class="subcat-link">{e(s)} <span>{sum(1 for t in cat_tools if t.get("subcategory") == s)}</span></a>'
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

def document(title, desc, path, body, attrs='', schema='', canonical_override='', robots='index,follow,max-image-preview:large', active_cat_slug=''):
    full_title = e(title) + ' | AxiomAtlas' if title != 'AxiomAtlas' else f'AxiomAtlas — {len(canonical_tools)}+ Scientific, Math, Engineering & Finance Calculators'
    canon_href = canonical_override or fullurl(path)
    canonical = f'<link rel="canonical" href="{e(canon_href)}">' if canon_href else ''
    crumb = 'Dashboard' if path == '/' else e(title)
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#151530"><meta name="description" content="{e(desc)}"><meta name="robots" content="{e(robots)}"><title>{full_title}</title>{canonical}<meta property="og:type" content="website"><meta property="og:title" content="{full_title}"><meta property="og:description" content="{e(desc)}"><link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"><link rel="manifest" href="/manifest.webmanifest"><link rel="stylesheet" href="/assets/styles.css">{schema}{GA4_TAG}</head><body {attrs}>
<div class="site"><aside class="sidebar" id="sidebar"><a class="brand-wrap" href="/"><span class="brand-mark"><svg viewBox="0 0 40 40" fill="none" stroke="white" stroke-width="3.4" stroke-linecap="round"><circle cx="20" cy="20" r="7"/><ellipse cx="20" cy="20" rx="17" ry="8" transform="rotate(-38 20 20)"/><circle cx="32.7" cy="8.3" r="3" fill="#f4cc74" stroke="none"/></svg></span><span><span class="brand">Axiom<em>Atlas</em></span><div class="brand-subtitle">ONE UNIVERSE OF CALCULATIONS</div></span></a><div class="side-section-title">EXPLORE</div><a class="side-link {'active' if path == '/' else ''}" href="/"><span>⌂</span> Overview</a><a class="side-link" href="/#featured"><span>⚡</span> Popular tools</a><a class="side-link" href="/#all-calculators"><span>▤</span> All calculators</a><div class="side-section-title">8 PRIMARY CATEGORIES</div><nav id="sidebar-cats">{sidebar_nav_html(active_cat_slug)}</nav><div class="side-section-title">SAVED TOOLS</div><div id="saved-links"><span class="side-empty">Your favorites will appear here.</span></div><div class="side-bottom"><strong>Everything adds up.</strong><br>100% free. No account. Step-by-step explanations on every tool.<br><span>© 2026 AxiomAtlas</span></div></aside><div class="mobile-shade" id="mobile-shade"></div><div class="main-frame"><header class="topbar"><div class="header-crumb"><button class="icon-btn mobile-only" id="mobile-menu" aria-label="Open navigation">☰</button><a href="/">Home</a> <span>›</span> <strong>{crumb}</strong></div><div class="top-actions"><button class="search-trigger" id="open-search" aria-label="Search calculators"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.8" cy="10.8" r="7"/><path d="m16 16 5 5"/></svg><span>Search any calculator or formula...</span><kbd>⌘ K</kbd></button><button class="icon-btn" id="theme-toggle" aria-label="Toggle dark mode">☾</button></div></header><main class="content">{body}<footer class="footer"><span>© 2026 AxiomAtlas · Built for students, engineers, scientists & analysts.</span><span>Free tools · No sign-in · Client-side calculations · <a href="/about/">About & accuracy</a> · <a href="/privacy/">Privacy</a></span></footer></main></div></div>
<div class="search-modal" id="search-modal" hidden role="dialog" aria-modal="true" aria-label="Search calculators"><div class="search-box"><div class="search-box-header"><span>⌕</span><input id="global-search" type="search" placeholder="Search calculus, linear algebra, circuits, physics, statistics, finance..." aria-label="Search all calculators"><button id="search-close">ESC</button></div><div class="search-results" id="search-results"></div><div class="search-foot">Start typing to search {len(canonical_tools)}+ calculators & {len(T)} total routes · Use ↑/↓ and Enter</div></div></div><div class="toast" id="toast" role="status" aria-live="polite"></div><script type="module" src="/assets/app.js"></script></body></html>'''

def jsonld(d):
    return '<script type="application/ld+json">' + json.dumps(d, ensure_ascii=False).replace('</', '<\\/') + '</script>'

featured_slugs = [
    'scientific-calculator',
    'symbolic-derivative-calculator',
    'definite-integral-calculator',
    'triangle-trigonometry-solver',
    'eigenvalues-eigenvectors-calculator',
    'rlc-resonance-calculator',
    'hypothesis-testing-calculator',
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

home = f'''<section class="hero"><div class="hero-copy"><span class="eyebrow">THE ALL-IN-ONE STEM & FINANCIAL CALCULATION STUDIO</span><h1>Everything adds up.<br><span>With step-by-step clarity.</span></h1><p>From percentages and trigonometry to symbolic derivatives, multivariable integrals, eigenvalues, AC circuits, thermodynamics, fluid mechanics, hypothesis testing, and Black–Scholes option pricing.</p><div class="hero-buttons"><a class="main-button" href="/tools/scientific-calculator/">Start calculating <span>↗</span></a><a class="secondary-button" href="#all-calculators">Explore all calculators ↓</a></div></div><div class="hero-orbit" aria-hidden="true"><span class="orbit-circle one"></span><span class="orbit-circle two"></span><span class="orbit-circle three"></span><span class="orbit-planet">∑</span><span class="float-equation a">∇ × F</span><span class="float-equation b">∫ f(x) dx</span><span class="float-equation c">PA = LU</span></div></section>
<section class="metrics"><div class="metric"><span class="metric-icon">∑</span><div><strong id="total-tools">{len(canonical_tools)}+</strong><small> Interactive calculators</small></div></div><div class="metric"><span class="metric-icon">◈</span><div><strong>8</strong><small>Primary STEM & Finance categories</small></div></div><div class="metric"><span class="metric-icon">✦</span><div><strong>100% Explained</strong><small>Step-by-step derivation on every tool</small></div></div></section>
<section class="section" id="featured"><div class="section-heading"><div><span class="eyebrow">FLAGSHIP SOLVERS</span><h2>Featured calculators</h2><p>Symbolic & numerical calculus, linear algebra, engineering circuits, statistics, and quantitative finance.</p></div><a class="plain-link" href="#all-calculators">View complete library →</a></div><div class="tool-grid" id="featured-tools">{cards(featured)}</div></section>
<section class="section" id="categories"><div class="section-heading"><div><span class="eyebrow">STRUCTURED TAXONOMY</span><h2>Explore 8 primary categories</h2><p>Organized into {sum(len(c.get('subcategories', [])) for c in cats)} domain-specific subcategories for rapid discovery.</p></div></div><div class="categories-grid" id="categories-grid">{catshtml}</div></section>
<section class="section" id="recent-section" hidden><div class="section-heading"><div><h2>Pick up where you left off</h2><p>Recently used tools, saved only on this device.</p></div></div><div class="tool-grid" id="recent-tools"></div></section>
<section class="section" id="all-calculators"><div class="section-heading library-header"><div><span class="eyebrow">COMPLETE TOOL LIBRARY</span><h2>Every calculator, one place.</h2><p>{len(canonical_tools)} canonical calculators ({len(T)} total routes with full backward compatibility).</p></div><label class="search-field"><input type="search" data-page-search placeholder="Filter calculators..." aria-label="Filter all calculators"></label></div><div class="tool-grid" id="all-tools">{cards(canonical_tools)}</div></section>
<section class="info-card"><h2>Built for students, engineers, researchers & analysts.</h2><p>Every calculation runs locally in your browser with deterministic step-by-step explanations, live mathematical expression previews, and unit-aware inputs. Results are computed using IEEE-754 double-precision arithmetic; always independently verify safety-critical engineering, medical, or financial decisions.</p></section>'''

(root / 'index.html').write_text(
    document(
        'AxiomAtlas',
        f'{len(canonical_tools)}+ free calculators for mathematics, algebra, calculus, linear algebra, geometry, trigonometry, physics, electrical engineering, statistics, finance, and unit conversions.',
        '/',
        home,
        'data-page="home"',
        jsonld({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            'name': 'AxiomAtlas',
            'description': 'Free all-in-one mathematics, engineering, statistics and finance calculator platform',
            'url': (URL + '/') if URL else 'https://axiomatlas.netlify.app/'
        })
    ),
    encoding='utf8'
)

# Build the 8 primary category pages
for c in cats:
    c_slug = slug(c['name'])
    items = [x for x in canonical_tools if x['category'] == c['name']]
    path = f'/categories/{c_slug}/'
    pills_html = f'<button type="button" class="filter-pill active" data-sub="all">All {e(c["name"])} ({len(items)})</button>' + ''.join(
        f'<button type="button" class="filter-pill" data-sub="{e(slug(s))}">{e(s)} ({sum(1 for x in items if x.get("subcategory") == s)})</button>'
        for s in c.get('subcategories', [])
    )
    bod = f'''<div class="breadcrumbs"><a href="/">Home</a><span>›</span><strong>{e(c['name'])}</strong></div>
<div class="category-top"><span class="cat-glyph">{e(icon.get(c['name'], '#'))}</span><span class="eyebrow">{len(items)} FREE CALCULATORS · {len(c.get("subcategories", []))} SUBCATEGORIES</span><h1>{e(c['name'])} Calculators</h1><p>{e(c['description'])} Every calculator includes live updates and step-by-step mathematical explanations.</p></div>
<section class="section" style="margin-top:15px"><div class="section-heading library-header"><h2>Browse {len(items)} calculators</h2><label class="search-field"><input type="search" data-page-search placeholder="Filter in {e(c['name'])}..." aria-label="Filter calculators"></label></div><div id="subcat-pills" class="filter-pills">{pills_html}</div><div class="tool-grid" id="category-tools">{cards(items)}</div></section>'''
    dst = root / path.lstrip('/')
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
    dst = root / path.lstrip('/')
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

# Build all 300 calculator pages (231 canonical + 69 legacy compatibility routes)
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

    bod = f'''<div class="breadcrumbs"><a href="/">Home</a><span>›</span><a href="/categories/{cat_slug}/">{e(t['category'])}</a><span>›</span><a href="/categories/{cat_slug}/#{sub_slug}">{e(t.get('subcategory') or t['category'])}</a><span>›</span><strong>{e(t['title'])}</strong></div>
<section class="tool-top"><div><span class="eyebrow">{e(t['category'].upper())} › {e((t.get('subcategory') or t['category']).upper())}</span><h1>{e(t['title'])}</h1><p>{e(t['description'])}</p></div><div class="tool-top-actions"><button class="outline-btn" id="favorite-toggle">☆ Save tool</button><button class="outline-btn" id="share-tool">↗ Share</button></div></section>
{alias_banner}
<div class="calculator-layout"><div><div class="calculator-card"><div class="calc-card-header"><h2>Input values</h2><span class="tiny-tag">✦ Live & Unit-Aware</span></div><div id="calculator-app">{pre_inputs_html}</div></div><section class="info-card"><h2>Formula, Governing Principle & Domain Notes</h2><p>{e(t['description'])} Edit any input or unit above to recalculate instantly, and click <b>Explain Calculation</b> in the results panel to inspect the step-by-step substitution and derivation.</p><div class="formula-block">{e(t.get('formula') or target_tool.get('formula') or 'Interactive mathematical evaluation')}</div>{f'<div class="notice"><b>Domain & Method Note:</b> {e(t["note"])}</div>' if t.get('note') else ''}</section></div><aside class="answer-card"><div class="answer-heading"><h2>Your results</h2><span class="live-label"><i class="live-dot"></i> LIVE</span></div><div id="result-display" aria-live="polite"><p class="mini-help">Edit any field to calculate your result and view the step-by-step explanation.</p></div><p id="result-status">Calculated locally · verified single-pipeline trace</p></aside></div>
<section class="section"><div class="section-heading"><div><span class="eyebrow">RELATED IN {e((t.get('subcategory') or t['category']).upper())}</span><h2>More {e(t['category'])} calculators</h2></div><a class="plain-link" href="/categories/{cat_slug}/">View all {e(t['category'])} tools →</a></div><div class="related-grid" id="related-tools">{cards(related)}</div></section>'''

    ld = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': t['title'],
        'description': t['description'],
        'url': fullurl(f'/tools/{t.get("canonicalSlug") or t["slug"]}/'),
        'applicationCategory': 'EducationalApplication',
        'operatingSystem': 'Any',
        'isAccessibleForFree': True,
        'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'USD'}
    }
    mode_attr = f' data-mode="{e(t["defaultMode"])}"' if t.get('defaultMode') else ''
    canon_url = fullurl(f'/tools/{t.get("canonicalSlug") or t["slug"]}/')
    dst = root / path.lstrip('/')
    dst.mkdir(parents=True, exist_ok=True)
    (dst / 'index.html').write_text(
        document(
            t['title'],
            t['description'] + ' Free online calculator with step-by-step explanation.',
            path,
            bod,
            f'data-page="tool" data-tool="{e(t["slug"])}"{mode_attr}',
            jsonld(ld),
            canonical_override=canon_url,
            active_cat_slug=cat_slug
        ),
        encoding='utf8'
    )

for slugpath, title, body in [
    ('about', 'About & accuracy', "AxiomAtlas is a comprehensive collection of free, browser-based mathematical, engineering, statistical, and financial calculation tools for learning, problem-solving, and rapid verification. Every calculator includes a deterministic step-by-step Explain Calculation trace generated from the exact same execution pipeline as the displayed result. Numerical root-finding, quadrature, ODE solvers, and matrix factorizations operate in IEEE-754 double precision. Always independently verify safety-critical, medical, tax, financial, or structural engineering calculations before acting."),
    ('privacy', 'Privacy policy', "Your calculator inputs are processed locally in your browser and are never transmitted to our server for calculation. Favorites, recent tools, and theme preferences are stored in local browser storage on your device. AxiomAtlas uses Google Analytics 4 (measurement ID G-G9NPE8LWSM) to understand aggregate website usage. Calculator input values are not sent to Google Analytics, and we do not display third-party advertisements.")
]:
    path = f'/{slugpath}/'
    dst = root / slugpath
    dst.mkdir(exist_ok=True)
    (dst / 'index.html').write_text(
        document(title, body[:155], path, f'<div class="breadcrumbs"><a href="/">Home</a><span>›</span><strong>{e(title)}</strong></div><div class="info-card" style="margin-top:20px"><h1>{e(title)}</h1><p>{e(body)}</p></div>', 'data-page="info"'),
        encoding='utf8'
    )

(root / '404.html').write_text(
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

(root / 'assets/favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><rect width="72" height="72" rx="18" fill="#5f50ed"/><circle cx="36" cy="36" r="12" fill="none" stroke="white" stroke-width="5"/><ellipse cx="36" cy="36" rx="30" ry="15" fill="none" stroke="white" stroke-width="4" transform="rotate(-38 36 36)"/><circle cx="58" cy="16" r="6" fill="#ffdb8a"/></svg>', encoding='utf8')
(root / 'manifest.webmanifest').write_text(json.dumps({'name': 'AxiomAtlas - STEM & Finance Calculators', 'short_name': 'AxiomAtlas', 'description': 'Free mathematical, scientific, engineering, statistics and finance calculators', 'start_url': '/', 'display': 'standalone', 'background_color': '#f8f9fd', 'theme_color': '#151530', 'icons': [{'src': '/assets/favicon.svg', 'sizes': 'any', 'type': 'image/svg+xml', 'purpose': 'any'}]}), encoding='utf8')
(root / 'robots.txt').write_text('User-agent: *\nAllow: /\n' + (f'Sitemap: {URL}/sitemap.xml\n' if URL else ''), encoding='utf8')
(root / '_headers').write_text('/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n\n/assets/*\n  Cache-Control: public, max-age=604800\n', encoding='utf8')

redirect_lines = [
    f'/categories/{old_s}/* /categories/{new_s}/ 301'
    for old_s, raw_new in legacy_cat_redirects.items() if (new_s := raw_new.strip("/").split("/")[-1])
    if old_s != new_s
]
redirect_lines.append('/tools/* /tools/:splat 200')
(root / '_redirects').write_text('\n'.join(redirect_lines) + '\n', encoding='utf8')

print(f'Built {len(T)} calculator pages ({len(canonical_tools)} canonical + {len(T) - len(canonical_tools)} aliases) + {len(cats)} primary category pages + {len(legacy_cat_redirects)} legacy category compatibility pages')
