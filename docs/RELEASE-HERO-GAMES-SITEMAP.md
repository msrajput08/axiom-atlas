# AxiomAtlas — One-batch home hero, indexing and deployment efficiency release

Date: 22 November 2026. Repository: `msrajput08/axiom-atlas`.

## Request addressed

Restore the **AxiomAtlas calculator-first impression**. The landing page must open with the original AxiomAtlas headline, calculator summary and working calculator links, not a standalone games takeover banner. Brain Lab should appear **beside the main AxiomAtlas hero on desktop** and **below the brand hero on smaller screens**.

## Bundled release work

1. Homepage: replace the previous full-width Brain Lab takeover with a split-screen AxiomAtlas-led hero. The existing H1 and calculator CTAs remain primary. The right-side Brain Lab teaser links to the game hub and three actual games. The layout stacks in logical order on narrow viewports. No extra JS, external image or paid dependency.
2. Navigation: add a compact top-bar Games shortcut while retaining global calculator search, category navigation and the sidebar.
3. SEO: update the *committed* `site/sitemap.xml` from 326 to **345 canonical URLs**. This incorporates 19 previously generated game paths: `/games/` plus 18 playable game pages. The source generator still produces the same 345 URLs at build time. `robots.txt` continues to reference this sitemap.
4. Sitemap QA: add `tests/sitemap_source.test.mjs` **before the rebuild** so old sitemap files no longer escape detection when CI regenerates correct site content.
5. Netlify credits: switch the Netlify build command from the full `npm test` suite to `npm run build && npm run verify:publish`. The fast publish gate verifies all 345 pages, canonical tags, headings, game links, the brand-first hero, required frontend assets and sitemap/robots integrity. GitHub Actions retains the full regression suite, including 2,700 base puzzles and 6,480 progression-level puzzles.
6. CI and diagnostics: revise brand-first homepage tests, live deployment verification, and documentation without changing game progression, scoring, math engines or tool slugs.

## Sitemap composition

| URL group | Count |
| --- | ---: |
| Core pages (home, about, privacy) | 3 |
| Categories | 9 |
| Canonical calculators | 314 |
| Brain Lab landing page | 1 |
| Individual games | 18 |
| **Total** | **345** |

Legacy calculator aliases (69 routes) intentionally remain operational but are **not added as additional canonical sitemap entries**. There are no invented `lastmod` values. Every listed URL is an existing generated page after the build.

## Release validation and rollout

- Run `npm test` to validate the checked-in sitemap first, regenerate site pages, run existing calculator and game tests, then run the production smoke gate. The GitHub Actions workflow performs these on the final commit.
- Deploy only **one consolidated commit on `main`** rather than a series of small deployments. A successful GitHub CI run does not itself prove Netlify deployed the commit.
- Compare the deployed `/build-info.json` revision against the commit and visit `/games/` plus `/sitemap.xml` after deployment.
- In Google Search Console, submit or resubmit `https://axiomatlas.netlify.app/sitemap.xml`, then use URL Inspection on the hub and a few representative game pages. Sitemap submission aids discovery but does not guarantee indexing or rankings.

## Non-goals

No changes to 314 calculator implementations, 69 alias routes, billing, hosting provider or ranking guarantees. No automated or fabricated schema ratings, no new ad providers or user tracking.
