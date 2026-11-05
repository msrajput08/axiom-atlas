# AxiomAtlas Discovery, UX/Accessibility, SEO/Security & Zero-Budget Technical Audit

**Live Website:** [AxiomAtlas](https://axiomatlas.netlify.app/)
**Audit Scope:** Sections 8 (Discovery & Navigation), 9 (UX, Accessibility & Responsiveness), 10 (SEO, Performance, Security & Privacy), and 11 (Zero-Budget Technical Feasibility).
**Status:** Phase 0 Audit Deliverable — Grounded in direct inspection of `source/build.py`, `source/generate_sitemap.py`, `site/assets/app.js`, `site/assets/styles.css`, `site/_headers`, `site/_redirects`, and `site/sitemap.xml`.

## 1. Calculator Discovery and Navigation Audit (Section 8)

### 1.1 Code-Level Inspection of Current Discovery Mechanisms

| Discovery Surface | Source Implementation | Current Behavior & Verified Weaknesses |
| :--- | :--- | :--- |
| **Global Search Modal (`#search-modal`)** | `searchSetup()` in `site/assets/app.js` (line 90) & `source/build.py` (line 20) | 1) Substring filter `(x.title + ' ' + x.description + ' ' + x.category).toLowerCase().includes(v)` **does not index `x.formula`, `x.slug`, or common synonyms/aliases** (e.g., searching `"pythagoras"` misses `Pythagorean Theorem Calculator`; searching `"F=ma"` or `"newton"` misses `Force Calculator` because `"Newton's"` has an apostrophe or formula is unindexed; searching `"csc"` or `"arcsin"` misses `Trigonometry Calculator`; searching `"mortgage"` misses `Loan EMI Calculator`; searching `"box"` works only because `"box"` is in `cuboid-calculator` description, whereas `"cuboid"` misses it because `slug` is not searched!). 2) Modal footer says `"Start typing to find any of 136 free tools · Enter to open via click"`, **but pressing `Enter` in `#global-search` does nothing** (no `keydown` handler for `Enter`, `ArrowDown`, or `ArrowUp` exists in `searchSetup()`!). |
| **Inline Page Filter (`[data-page-search]`)** | `site/assets/app.js` (line 90) | Toggles `c.hidden = !c.textContent.toLowerCase().includes(v)` on `.tool-card` elements. However, if zero cards match on the homepage or category page, **no empty-state message is shown**—the section simply collapses to a blank space! |
| **Related Calculators (`#related-tools`)** | `source/build.py` (line 31) & `site/assets/app.js` (line 86) | Both `build.py` and `app.js` compute `data.tools.filter(t => t.category === tool.category && t.slug !== tool.slug).slice(0, 5)`. Because it slices the **first 5 tools in the category**, **every single Physics calculator (`22` of the `27` tools) displays the exact same 5 kinematics calculators (`Speed`, `Distance`, `Acceleration`, `Displacement`, `Force`) as its "Related tools"!** Studying `Thin Lens Equation` or `Ohm's Law` shows `Speed Calculator` and `Distance Calculator` instead of `Snell's Law` or `Electrical Power`! |
| **Topbar Breadcrumb (`header-crumb`)** | `source/build.py` (line 18) | Computes the page label as `path.split('/')[-2].replace('-', ' ').title()` instead of passing the actual `title`! As a result, acronyms, apostrophes, and custom titles render incorrectly in the sticky topbar: `Loan EMI Calculator` → `Emi Calculator`; `Heron’s Formula Calculator` → `Herons Formula`; `2D Distance Calculator` → `Distance Between Points`; `Math & numbers` → `Math Numbers`; `404.html` → `404`. |
| **Homepage All-Calculators Grid (`#all-tools`)** | `source/build.py` (line 28) & `site/assets/app.js` (line 88) | Renders all 136 calculators in raw `make_catalog.py` array order (23 specialized tools first, followed by 113 formula tools) with **no category filter pills** and **no sorting** (Alphabetical / By Category / Popular). |
| **Recently Used & Saved Tools** | `site/assets/app.js` (lines 85–88, 91) | Uses privacy-friendly `localStorage` keys `axiomatlas-recent` (up to 15 slugs, 4 shown on homepage) and `axiomatlas-favorites` (first 5 shown in sidebar `#saved-links`). However, if a user saves more than 5 favorites, **favorites #6+ are completely inaccessible** because `#saved-links` slices `.slice(0, 5)` and there is no "Saved tools" view on the homepage! |
| **Keyboard Shortcut `/` Bug on Text Inputs** | `site/assets/app.js` (line 90) | `document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' || e.key === '/') { e.preventDefault(); open(); } })` intercepts the `/` key **globally on `document` without checking if the user is currently typing inside an `<input>` or `<textarea>`**! Consequently, **typing `/` for division (`3/4` or `sin(x)/x`) inside `Scientific Calculator`, `Fraction Calculator`, `Equation Solver`, or `Function Graphing Calculator` hijacks focus and pops open the global Search Modal instead of typing a division slash!** |

### 1.2 Actionable Discovery & Navigation Recommendations

1. **CRITICAL FIX — Guard the `/` Shortcut When Focused in Form Controls:**
   - In `searchSetup()` (`site/assets/app.js` line 90), ignore bare `/` when `['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)`. This immediately restores the ability to type `/` for division and fractions in all calculators!
2. **Multi-Field Weighted Search Index (Name + Problem + Formula + Slug + Synonyms):**
   - Index `title`, `slug`, `category`, `description`, `formula`, `note`, field labels, and a lightweight `keywords` array in `catalog.json` (e.g., `emi-calculator` → `["mortgage", "home loan", "car loan", "monthly payment"]`; `linear-system` → `["cramer", "gaussian", "2x2", "3x3", "simultaneous"]`).
   - Add keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter` to navigate to the highlighted result) in `#search-modal` so the footer promise `"Enter to open"` actually works.
3. **Semantic Topic Clustering for Related Calculators:**
   - Tag each calculator with a `subtopic` (e.g., `Physics > Optics`, `Physics > Electricity`, `Physics > Kinematics`, `Geometry > 3D Solids`, `Geometry > Triangles`) and rank `#related-tools` by matching `subtopic` first, then adjacent tools in the category ring `(index + 1..5) % catTools.length` rather than `.slice(0, 5)`.
4. **Category Filter Pills & Empty States on `#all-calculators`:**
   - Add horizontal scrollable category filter chips (`All (136)`, `Math (21)`, `Physics (27)`, etc.) above `#all-tools`, plus a visible `<div class="no-results">` state when `[data-page-search]` matches 0 cards.
5. **Show All Saved Tools:**
   - Remove the `.slice(0, 5)` cap on `#saved-links` (or display a `"Saved Tools"` section above `#featured` on the homepage when `axiomatlas-favorites` is non-empty).

## 2. Website UX, Accessibility, and Responsiveness Audit (Section 9)

### 2.1 Verified WCAG 2.1 Color Contrast Audit (`site/assets/styles.css`)

We computed exact WCAG 2.1 relative luminance contrast ratios across all foreground/background color pairs defined in `site/assets/styles.css` (lines 2–3):

| UI Element & Selector | Theme | Foreground Hex | Background Hex | Font Size / Weight | Exact Contrast Ratio | WCAG 2.1 AA Requirement | Audit Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Primary Body Text (`--ink` on `--panel`) | Light | `#161829` | `#ffffff` | 14px / 400 | **17.55 : 1** | 4.5 : 1 | **PASS (AAA)** |
| Secondary Muted Text (`--muted` on `--panel`) | Light | `#81859b` | `#ffffff` | 11–13.5px / 400 | **3.64 : 1** | 4.5 : 1 | **FAIL AA** (Too low for 11px `.mini-help`, `.tool-card small`, `.breadcrumbs`) |
| Muted Text on Control Background (`--muted` on `--panel2`) | Light | `#81859b` | `#f5f6fc` | 11–12px / 400 | **3.38 : 1** | 4.5 : 1 | **FAIL AA** (Used in `.unit-pill`, `.notice`, `.search-trigger`) |
| Sidebar Section Headers (`.side-section-title`) | Light | `#a3a7b8` | `#ffffff` | 10px / 800 | **2.39 : 1** | 4.5 : 1 | **FAIL AA (Severe)** |
| Sidebar Category Tool Counts (`.side-link small`) | Light | `#b0b2c1` | `#ffffff` | 10px / 600 | **2.10 : 1** | 4.5 : 1 | **FAIL AA (Severe)** |
| Live Result Status (`#result-status`) | Light | `#4aab89` | `#ffffff` | 10px / 400 | **2.81 : 1** | 4.5 : 1 | **FAIL AA (Severe)** |
| Eyebrow Accent (`--purple` on `--panel`) | Light | `#6757f3` | `#ffffff` | 10.5px / 800 | **4.96 : 1** | 4.5 : 1 | **PASS AA** |
| Active Pill Text (`--indigo` on `--purple-bg`) | Light | `#4437d0` | `#f0edff` | 12.5px / 600 | **6.76 : 1** | 4.5 : 1 | **PASS AA** |
| Dark Theme Primary Text (`--ink` on `--panel`) | Dark | `#f6f6fe` | `#191b2b` | 14px / 400 | **15.84 : 1** | 4.5 : 1 | **PASS (AAA)** |
| Dark Theme Muted Text (`--muted` on `--panel`) | Dark | `#9ca1bb` | `#191b2b` | 11–13.5px / 400 | **6.67 : 1** | 4.5 : 1 | **PASS AA** |
| Dark Theme Muted on Input (`--muted` on `--panel2`) | Dark | `#9ca1bb` | `#222437` | 11–12px / 400 | **5.98 : 1** | 4.5 : 1 | **PASS AA** |

**Exact CSS Fix for 100% WCAG 2.1 AA Compliance in Light Mode (Zero Brand Disruption):**
- Darken `--muted` in `:root` (`site/assets/styles.css` line 2) from `#81859b` to **`#5b6078`** (raises contrast on `#ffffff` to **6.18 : 1** and on `#f5f6fc` to **5.73 : 1**).
- Darken `.side-section-title` and `.side-link small` from `#a3a7b8` / `#b0b2c1` to `var(--muted)` (`#5b6078`).
- Darken `#result-status` in light mode from `#4aab89` to **`#1f7a5c`** (raises contrast on `#ffffff` to **5.24 : 1**).

### 2.2 Keyboard Navigation, Screen Reader, and Reduced-Motion Audit

1. **Missing `prefers-reduced-motion` Support:** `site/assets/styles.css` defines hover translations (`transform: translateY(-2px)`), sidebar slide transitions (`transition: transform .25s`), toast animations (`transition: .3s`), and smooth scrolling (`scroll-behavior: smooth`), but has **no `@media (prefers-reduced-motion: reduce)` rule**.
2. **Search Modal Focus Trap & ARIA:** `#search-modal` has `role="dialog" aria-modal="true"`, but pressing `Tab` while the modal is open tabs out into the background page behind the backdrop!
3. **Static Pre-Hydration Inputs Missing `data-field`:** Look at `source/build.py` line 32:
   ```python
   '<div class="control-grid">'+''.join(f'<label class="control"><span>{e(x["label"])}</span><input type="number" value="{e(x["default"])}" step="any"></label>' for x in t['fields'])+'</div>'
   ```
   When `build.py` pre-renders the static HTML for the 113 formula calculators, it renders `<input type="number" value="...">` **without `data-field` and without `.unit-pill`**, and then `app.js` fetches `/assets/catalog.json` and **completely overwrites `#calculator-app.innerHTML`**! If a user clicks into the first input field and starts typing on a slow 3G mobile connection before `catalog.json` (63.8 KB) finishes loading, **`app.js` wipes out their focus and keystrokes when `renderTool()` overwrites `#calculator-app.innerHTML`!**
4. **Responsive Layout & Touch Targets (`styles.css` lines 11–13):**
   - In `linear-system` (3×3 mode) on 360px–390px mobile viewports, each `.matrix-row` contains 3 coefficient inputs (`48px` each) + `=` (`26px`) + 1 RHS input (`48px`) + gaps (`28px`) inside a padded card, causing tight horizontal squeezing; adding `overflow-x: auto` on `.matrix-input` and `.matrix-pair` prevents layout overflow.
   - `.result-copy` button (`⧉`, `site/assets/styles.css` line 8) has no explicit padding or minimum width/height, making its touch target roughly `20px × 24px` on mobile (below the WCAG 2.5.5 / Apple HIG `44×44px` minimum touch target).

## 3. SEO, Performance, Security & Privacy Audit (Section 10)

### 3.1 Critical Privacy Policy vs. AdSense Script Contradiction

- **Evidence in `source/build.py` line 12:**
  ```html
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3021837592665796" crossorigin="anonymous"></script>
  ```
  This Google AdSense script is injected into the `<head>` of **all 155 HTML pages** (`site/index.html`, all 136 calculators, all 14 categories, `/about/`, `/privacy/`, and `404.html`).
- **Contradiction in `source/build.py` line 40 (`site/privacy/index.html`):**
  > *"AxiomAtlas uses Google Analytics 4 (measurement ID G-G9NPE8LWSM)... We do not currently display ads."*
- **Impact:** Loading `adsbygoogle.js` on every page while `/privacy/` states `"We do not currently display ads"` (and omits any disclosure of Google AdSense publisher ID `ca-pub-3021837592665796` or DoubleClick ad cookies) creates both a **privacy disclosure compliance gap** and an **unnecessary third-party script blocking Core Web Vitals (TBT/INP)** on every page load.
- **Recommendation:** Either remove `ADSENSE_TAG` from `source/build.py` until ads are actually enabled, or update `/privacy/` to disclose Google AdSense and implement Google Consent Mode v2 for EEA/UK visitors.

### 3.2 Technical SEO & Structured Data Findings

| SEO Dimension | Current Implementation | Verified Issue / Defect | Recommended Fix |
| :--- | :--- | :--- | :--- |
| **Homepage JSON-LD Schema (`site/index.html`)** | `source/build.py` line 29: `'url': URL+'/' if URL else None` | Because `scripts/rebuild.py` runs `build.py` without setting `SITE_URL` in `os.environ`, `site/index.html` is deployed with **`"url": null`** inside its `WebSite` Schema.org JSON-LD! | Pass `SITE_URL="https://axiomatlas.netlify.app"` in `scripts/rebuild.py` (or default `URL` in `build.py` to `'https://axiomatlas.netlify.app'`) and add `SearchAction` `potentialAction` to `WebSite` schema. |
| **Canonical URLs (`<link rel="canonical">`)** | Injected post-build by `source/generate_sitemap.py` (lines 14–18) | `generate_sitemap.py` strips and re-inserts `<link rel="canonical">` via fragile substring slicing (`txt.replace("</title>", ...)`), and skips `404.html`. | Set `URL = "https://axiomatlas.netlify.app"` directly inside `source/build.py` so canonical tags and `og:url` meta tags are generated cleanly in one pass. |
| **OpenGraph Meta Tags** | `og:type`, `og:title`, `og:description` in `source/build.py` (line 16) | Missing `og:url`, `og:image`, and `twitter:card` metadata across all 155 pages. | Add `og:url`, `og:site_name="AxiomAtlas"`, and a clean static social preview card (`/assets/og-card.png`). |
| **`sitemap.xml` Ordering & Metadata** | `source/generate_sitemap.py` (line 7): `root.rglob("index.html")` | Uses arbitrary OS directory traversal order (causing diffs on rebuilds) and omits `<lastmod>`. | Sort `urls` deterministically (`sorted(urls)`) in `generate_sitemap.py`. |
| **`404.html` Robots Meta Tag** | `source/build.py` (line 16 & 42) | `document()` hardcodes `<meta name="robots" content="index,follow,max-image-preview:large">` even on `404.html`! | Set `<meta name="robots" content="noindex,follow">` on `404.html`. |
| **Calculator-Specific SEO Content** | Each `/tools/<slug>/index.html` has an `<h1>`, 1-sentence `<p>`, `.formula-block`, and optional 1-line `.notice` | Thin on-page text (~45 words of unique body copy per tool page); formulas like `p*(r/1200)*(1+r/1200)^(years*12)/...` are not accompanied by variable definitions or worked examples in static HTML. | Render the **Variable Legend**, **Worked Default Example**, and **FAQ / Assumptions** directly into the static HTML during `source/build.py` so search engines index rich educational content without needing JS execution! |

### 3.3 Performance & Bundle Architecture Audit

1. **Redundant `catalog.json` Network Fetch & DOM Re-Rendering on Every Page:**
   - Every page load fetches `/assets/app.js` (`35.7 KB`), `/assets/engine.js` (`11.7 KB`), and then `init()` in `app.js` fetches `/assets/catalog.json` (`63.8 KB`).
   - Once `catalog.json` arrives, `shell()`, `renderHome()`, `renderCategory()`, and `renderTool()` overwrite `#sidebar-cats`, `#featured-tools`, `#categories-grid`, `#all-tools`, `#category-tools`, `#related-tools`, and `#calculator-app`—even though `source/build.py` **already rendered those exact HTML elements at build time!**
   - **Performance Fix:**
     1. In `source/build.py`, embed the current tool's 300-byte JSON definition inline (`<script id="tool-data" type="application/json">...</script>`) on `/tools/<slug>/index.html` AND include `data-field` and `.unit-pill` on the build-time `<input>` elements, so the calculator is **100% interactive at 0 ms without waiting for `catalog.json`**!
     2. Only fetch `/assets/catalog.json` lazily when the user opens `#search-modal` (or in `requestIdleCallback`), cutting critical-path payload by **63.8 KB (57%)** on all 136 calculator pages!
2. **Netlify Cache Headers (`site/_headers`):**
   - Currently `/assets/*` has `Cache-Control: public, max-age=604800` (7 days). Adding content-hash query strings in `build.py` (e.g., `/assets/app.js?v=<hash>`) allows `Cache-Control: public, max-age=31536000, immutable`.
3. **PWA Readiness (`site/manifest.webmanifest`):**
   - `site/manifest.webmanifest` is valid and linked on all pages, but there is no Service Worker (`sw.js`). Adding a 35-line cache-first Service Worker makes all 136 calculators work **100% offline** as an installable PWA!

### 3.4 URL Migration Strategy for Approved Calculator Merges

Whenever any calculator merge or reclassification is approved in Phase 1:
1. **Zero Broken URLs Policy:** Never delete a `/tools/<old-slug>/` route without a permanent 301 redirect.
2. **Category Reclassifications Require Zero URL Changes:** Because all calculator URLs live under the flat namespace `/tools/<slug>/` (not `/categories/<cat>/<slug>/`), moving `resistor-series`, `resistor-parallel`, and `frequency-wavelength` from `Computing` to `Physics` (and `electricity-cost` to `Everyday`) **does not change their URLs at all**! Only their breadcrumbs and category membership change.
3. **If Two Calculators Are Merged Into One Canonical Slug:**
   - **Preferred Option (Co-Hosted Multi-Mode Component):** Keep both `/tools/<slug-a>/` and `/tools/<slug-b>/` live with their own targeted `<title>`, `<h1>`, and default mode tab (e.g., `Speed` mode default on `/tools/speed-calculator/`, `Distance` mode default on `/tools/distance-calculator/`). This loses **zero** Google search impressions.
   - **Redirect Option (If Retiring a Slug):** Add `/tools/<old-slug>/* /tools/<new-slug>/ 301!` above the catch-all rule in `site/_redirects`, update all internal links via `scripts/rebuild.py`, and regenerate `site/sitemap.xml` so only 200-status canonical URLs appear in the sitemap.

### 3.5 Security & Expression Evaluation Audit

- **No `eval()` or `Function()`:** `site/assets/engine.js` uses a custom tokenizer and AST walker (`compile` / `run`) with hard caps on input length (`480` chars), token count (`240` tokens), and AST node visits (`2000` calls), completely preventing Arbitrary Code Execution and ReDoS / CPU-exhaustion attacks.
- **HTML Escaping (`esc()` in `app.js` and `e()` in `build.py`):** All dynamic strings interpolated into `.innerHTML` in `app.js` pass through `esc()` (`&`, `<`, `>`, `"`, `'`), preventing DOM XSS.
- **Prototype Pollution Guard in `engine.js`:** Line 12 of `engine.js` properly checks `Object.prototype.hasOwnProperty.call(vars, k)` before reading variable values, preventing prototype property leakage (such as `toString` or `constructor` being read as variables).
- **Security Header Enhancements (`site/_headers`):** `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, and `Permissions-Policy` are already configured; can be strengthened with a Content-Security-Policy (`CSP`) header once inline scripts in `build.py` are moved to external modules.

## 4. Zero-Budget Technical Feasibility Evaluation (Section 11)

Every proposed upgrade in this audit has been evaluated against AxiomAtlas's strict **zero-budget, zero-backend, offline-capable, browser-only** constraint:

| Proposed Feature / Upgrade | Browser-Only? | Needs Backend / Paid API? | Recommended Implementation vs. Open-Source Library Options | License | Bundle Size Impact | Works Offline (PWA)? | Recurring Cost |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Engine Bug Fixes & Domain Validations (`BUG-01`–`BUG-18`)** | Yes (100%) | No | Direct updates to `site/assets/engine.js` and `site/assets/app.js`. | Native / Own Code | **+2.5 KB** (minified) | Yes | **$0 / forever** |
| **2. Interactive Unit Selectors on All Formula Tools** | Yes (100%) | No | Reuses `unitGroups` and `convertUnit()` already in `site/assets/engine.js`! | Native / Own Code | **+1.8 KB** | Yes | **$0 / forever** |
| **3. Reusable Mathematical Input Keypad & Live Preview** | Yes (100%) | No | **Option A (Recommended):** Custom lightweight AST-to-HTML/MathML renderer + collapsible keypad in `app.js` (**+4.5 KB**, zero external deps). **Option B:** Self-hosted `KaTeX` (`katex.min.js` + CSS, MIT License, ~95 KB gzipped) loaded lazily only on expression tools. | Native or MIT (`KaTeX`) | **+4.5 KB** (Native HTML/MathML) | Yes | **$0 / forever** |
| **4. `Explain Calculation` Deterministic Trace Engine** | Yes (100%) | No (Zero LLM/API calls) | 60-line `traceCalculate()` AST walker in `site/assets/engine.js` + drawer UI in `site/assets/app.js`. | Native / Own Code | **+5.2 KB** | Yes | **$0 / forever** |
| **5. 16 Advanced STEM Calculators (ODE, Eigenvalues, Hypothesis Tests, NPV/IRR, Triangle Solver, etc.)** | Yes (100%) | No | Pure deterministic ES modules (e.g. `/assets/advanced.js` loaded on demand only on specialized pages, keeping core `engine.js` tiny). | Native / Own Code | **~18 KB** (lazy-loaded module) | Yes | **$0 / forever** |
| **6. Multi-Field Search & Topic-Clustered Related Tools** | Yes (100%) | No | Enhanced client-side search over `catalog.json` + build-time static related links in `source/build.py`. | Native / Own Code | **+1.5 KB** | Yes | **$0 / forever** |
| **7. Offline PWA Service Worker (`sw.js`)** | Yes (100%) | No | 35-line standard Cache API Service Worker caching `/assets/*` and visited HTML pages. | Native Web API | **+1.0 KB** | Yes | **$0 / forever** |
