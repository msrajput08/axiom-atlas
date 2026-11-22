# AxiomAtlas Brain Lab — 18 cross-subject games and calculator verification

## Experience — 20 levels per activity

- **18 games × 20 levels = 360 distinct learning stages**, across nine existing calculator categories.
- Each correct level awards **exactly 5 marks**. A full game gives **100/100**; using a hint does not reduce the score. Incorrect answers award zero, explain the math and reveal exact calculator inputs. Retrying can recover the 5 marks.
- Four progressive tiers of five levels: **Discovery (1–5)**, **Application (6–10)**, **Reasoning (11–15)** and **Mastery (16–20)**. Level mechanics are varied: direct solving, answer selection, truth checks, error audits, missing values, scenario duels, differences, totals, averages, estimation, ranking, median, ranges, percent errors, threshold reasoning, weighted outcomes, ratios, multi-step chains, team comparisons and final-boss challenges.
- Prime Detective has domain-specific levels about prime factors, gaps, twin primes and divisor counts; Quadratic Code covers discriminants, root properties, vertices and factorizations. Other subjects combine and compare real, calculator-verifiable scenarios.
- The **level map unlocks the next level after any attempted answer**, so mistakes don't trap learners. Each correctly completed level gets a permanent five-mark credit saved locally; retrying a previously earned level cannot erase it. Browser storage is the only persistence mechanism.
- **Daily 20-level mode** uses a repeatable device-date seed, and is separate from the saved campaign. The daily result is not a cloud leaderboard.
- Everything is client-side, without account, paid server, third-party puzzle generation or login. Calculator pages and their routes are unchanged.

## Subject coverage

| Subject | Games | Calculator links |
| --- | --- | --- |
| Mathematics | Prime Detective, Percent Hunt | Prime Number Checker, Percentage Calculator |
| Algebra | Equation Escape, Quadratic Code | Linear Equation Calculator, Quadratic Equation Solver |
| Calculus & Graphing | Derivative Dash, Integral Hunt | Derivative Calculator, Definite Integral Calculator |
| Geometry & Trigonometry | Slope Run, Shape Builder | Slope Calculator, 2D Geometry Calculator |
| Physics & Engineering | Energy Quest, Circuit Lab | Kinetic Energy Calculator, Circuit Calculator |
| Statistics & Probability | Mean Machine, Probability Lab | Statistics Calculator, Basic Probability Calculator |
| Finance | Interest Builder, Margin Master | Simple Interest mode, Profit Margin Calculator |
| Converters & Everyday Tools | Attendance Rescue, Recipe Remix | Attendance Planner, Recipe Scaling Calculator |
| Astronomy & Astrophysics | Solar Scale, Star Distance | Solar Radius Converter, Stellar Parallax Calculator |

## URLs and discoverability

`/games/` is a crawlable hub with two HTML cards per category. Each game has a unique crawlable route at `/games/<game-id>/` with a descriptive heading, contextual information and WebApplication/BreadcrumbList metadata. All 19 game routes are in sitemap.xml alongside the 326 existing canonical URLs. The homepage, primary category pages, sidebar, and the linked calculators provide contextual internal links to the games.

A new game should only be added if it has a distinct educational purpose, independent numerical tests, an existing compatible calculator link and a real worked explanation. Do not add 100 near-identical pages to target keywords.

## Accuracy, limitations, and QA

- `site/assets/games-engine.mjs`: original audited one-step formula generators and strict answer grader.
- `site/assets/games-levels.mjs`: twenty named mechanisms per activity, with four stages and subject-specific Prime/Quadratic variations.
- `site/assets/games-progress.mjs`: pure functions for unlock, retry and five-mark scoring; malformed local data is normalized safely.
- `tests/brain_games.test.mjs`: original 2,700 deterministic base-game numerical checks (150 per activity).
- `tests/brain_levels.test.mjs`: **6,480 deterministically seeded level scenarios (18 games × 20 levels × 18 seeds)** covering all formula transformations, special prime and quadratic cases, stages, scoring, URL output and browser-only constraints.
- `npm test` reruns the full pre-existing calculator and SEO tests as well as the game engine and progression suite.

**Important:** Cross-scenario levels may ask for arithmetic on several calculator outputs. Verification displays separate scenario inputs and tells learners to combine the individual results; it does not silently claim that the calculator has a built-in multi-scenario solver.

Limitations: results use standard educational assumptions, e.g. classical kinetic energy, Ohm's law with ideal resistance, simple interest (not compound), gross margin (not markup), fair spinners, nominal solar radius and elementary stellar parallax. Scores are saved only on the current browser/device and can be reset when storage is cleared. Daily challenges follow the user's local device date, not a globally enforced tournament day.

## Measurement
Track page-level game discoverability, first-game starts, completed 20-level runs, return visits, link clicks back to calculators, and device-specific usability **without** sending answer values to analytics. Before adding more activities, verify mobile gameplay and user interest. Adding new URLs alone does not guarantee search rankings or traffic.

## Homepage discovery and deployment (22 November 2026)

The homepage's first section is a shared two-column hero: **AxiomAtlas calculators and the main H1 first**, followed by a secondary Brain Lab promo on the right. At narrower widths the sections stack in the same accessible reading order. The global top navigation offers a compact Games link without replacing calculator search.

The canonical sitemap has 345 URLs: 3 core + 9 categories + 314 calculators + 1 games hub + 18 playable games. All 19 games are crawlable. `robots.txt` points to `/sitemap.xml`; legacy alias tools are excluded to avoid canonical duplicates.

To conserve deployment credits, Netlify runs `npm run build && npm run verify:publish` instead of the 100,000+-assertion suite. GitHub Actions still runs `npm test`, including a **prebuild check against the committed sitemap** and the full game/SEO/regression suites. Multiple small main commits were avoided for this release.
