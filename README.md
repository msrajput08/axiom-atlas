# AxiomAtlas — All-in-One Calculator Website

**Independent** of PankhPages. Live domain: https://axiomatlas.netlify.app

- 136 calculator pages and 14 category landing pages; scientific math, algebra, graphs, numerical calculus, geometry, physics, statistics, finance and unit conversions.
- Completely static, browser-side calculations. No paid API or backend.
- `site/` — current **deployable** public website, including domain-specific `sitemap.xml`, canonical tags, and `google3d4d24a07fe849ba.html` for Google Search Console.
- `source/` — source generators and numerical test script. `scripts/rebuild.py` regenerates the public `site/` directory.
- `netlify.toml` tells Netlify to publish the `site/` folder without an extra build step.

## Run locally

```bash
cd site
python -m http.server 8000
```

## Updating and deployment

Edit the generators in `source/` and run `python scripts/rebuild.py`. Commit the resulting `site/` changes. Or edit the site directly for content/style updates. Connect this repo to your **existing AxiomAtlas Netlify project** in the Netlify dashboard to enable continuous deployment. Never connect this repo to the PankhPages Netlify project.

Search Console verification lives in `site/google3d4d24a07fe849ba.html`. Do not rename it. To switch domains, update the domain inside `source/` rebuild instructions and regenerate the sitemap and canonical tags.

## Functional limits

This is a **numerical** calculator suite, not a full symbolic CAS. Numerical root finding/derivatives/integrals have mathematical and precision limitations; the physics and financial tools are informational. Conversion does not include live currency prices. Verify critical decisions independently.

## Google Analytics 4 (added October 2026)

The shared page template in `source/build.py` loads Google's global site tag on all 136 calculators, category pages, homepage, About, Privacy and the 404 page using measurement ID `G-G9NPE8LWSM`. `site/` contains the generated HTML with the same tag; running `python scripts/rebuild.py` preserves it. The Google Search Console verification HTML is not modified.

**Deploy:** Upload the contents of the `site/` directory to the existing Netlify site `https://axiomatlas.netlify.app`, or connect this repository to the same Netlify site (publish directory `site`). This ZIP cannot update Netlify on its own. After publication, open GA4 > Reports > Realtime, visit the site in a regular browser without an ad blocker, and check whether a page view appears. Analytics can take time and may be blocked by browser privacy settings or consent controls.

**Privacy:** The privacy policy now discloses GA4. Review cookie consent and privacy requirements for the regions in which you serve visitors, especially the EEA/UK. The tag supplied in this update starts automatically; it does not itself provide a cookie-consent interface.
