# SEO Iteration 2 — Evidence-led improvements (22 November 2026)

## Data used

Source: owner's Google Search Console export `Performance-on-Search-2026-11-22.zip`. The export's filter says "Last 3 months", but the underlying daily Chart.csv spans **17 October to 19 November 2026 (34 days)**. All data below refer to that observed period, not a full quarter.

- 35 search clicks and 15,332 impressions (aggregate CTR approximately 0.23%).
- Prime Number Checker: 15 clicks, 6,276 impressions; average position 11.57.
- Recipe Scaler: 233 impressions; average position 14.58.
- Attendance Planner: 112 impressions; average position 11.92.
- Paint Coverage: 170 impressions; average position 17.21.
- Slope Calculator: 2 clicks, 114 impressions; average position 14.06.
- Other search-interest opportunities include Midpoint Calculator (133 impressions), Torque Calculator (72 impressions), Solar Radius Converter (1 click; 58 impressions), Kinetic Energy (110 impressions) and legacy Arithmetic Sequence route (212 impressions).

These are historical Search Console aggregates, **not forecasts** and not evidence of paid demand.

## Implementation in source

1. Add crawlable homepage "Find a quick answer" navigation, linking to eight **existing canonical** tools with short task-oriented anchor text.
2. Add **five new canonical, human-edited calculator references**, generated from `source/seo_expansion.py`: midpoint, torque, solar-radius converter, kinetic energy, and arithmetic/geometric sequence. Every page has an accurate title, descriptive intro, numerical examples, constraints, and related canonical links. The legacy arithmetic-sequence URL is not rewritten or turned into an extra duplicate canonical.
3. Move the Google Fonts stylesheet from a serial CSS `@import` to an HTML `link rel=stylesheet` with early font-host preconnects, while preserving the same font families and fallback fonts.
4. Add source-level tests checking all **14** focused guides, direct homepage links, document metadata, HTML-visible examples, exact canonical URL mapping, numerical worked examples, and all 383 existing routes.
5. Keep all 314 free canonical calculators, all 69 compatibility aliases, 326 canonical sitemap URLs, original slugs and calculator execution engines unchanged.

## SEO decisions intentionally deferred

- Do not turn legacy aliases into independent canonical URLs or remove noindex without a structured migration plan. Some alias routes still register impressions, but changing canonical strategy wholesale could split signals or affect users.
- Do not fabricate `lastmod` times, add unverified review/rating structured data, mass-produce generic FAQ text, or add artificial keyword lists.
- Do not merge the unfinished SaaS project; this is SEO-only production work.

## Measurement protocol

After the deployment has been confirmed in Netlify, verify the homepage shortcuts and the five changed canonical pages directly. In Search Console, inspect URL indexing and record clicks, impressions, CTR and position for targeted pages and exact query groups. Compare **equal-length complete periods** with the same search type/country/device filters. Allow for recrawl delays, ranking volatility and other confounding changes; an improvement is not proven by one day's spike.

The build must pass `npm test` (existing calculators plus expanded SEO integrity checks). Passing CI tests does **not** establish real-world traffic gains, real-browser Core Web Vitals, or completed Netlify deployment.
