# AxiomAtlas SaaS + SEO foundation (isolated development branch)

Branch: \`feature/saas-studio-foundation\`
Base: \`main\`
Live website: https://axiomatlas.netlify.app/

## Immutable release constraints

1. Keep all **314 canonical calculators, 69 legacy aliases, nine categories, existing client-side calculation functionality, explanations and bookmarked paths free**. Do not introduce a login gate on existing calculator routes.
2. No direct commits to \`main\`, merge, paid checkout, production deployment, Netlify configuration changes or production secrets in this foundation release.
3. Do not alter existing mathematical engines, their default formulas, the SEO verification file or legacy redirects. Run \`npm test\` before any later merge.
4. Preserve existing Google Analytics configuration on existing calculator pages. The new Studio route stores scenarios locally; embedded widgets do not record visitors' inputs.

## Working features on this branch

### Studio preview — \`/studio/\`

- Fully operational linked series RLC engineering model; updates resonant frequency, impedance, RMS current, quality factor, bandwidth and phase when parameters change.
- A normalized frequency-response plot, max 50 local scenarios, scenario selection, duplication, deletion and comparison.
- Local browser storage persistence and JSON export/import and CSV export.
- No cloud sync, collaboration, authentication, subscription or paid promises. Error validation for invalid/overflowing numeric values.
- Model assumptions explained on the page. This is an educational model, not safety-critical validation.

### Business widgets — \`/business/\`

- An embeddable script (\`/assets/embed.js\`) using Shadow DOM to isolate styles, with parameterized accent colors.
- Three functional calculator variants: ideal series RLC resonance, Ohm's law and fixed-rate compound interest.
- Live builder preview and a copyable integration snippet; widgets work client-side with no cookie or usage-analytics storage.
- The public script link in the generated snippet will resolve when this code is deployed in a subsequent reviewed release.
- No real business billing, account management, per-domain permissions, white-label removal or backend analytics. These are future architecture tasks, not active product claims.

## SEO changes

- Keep existing Google-verifiable canonical URLs and SEO descriptions for all free tools.
- Add meaningful crawlable homepage entry points to Studio and Business without removing the free library.
- Add clear navigational links from the footer generated for original pages.
- Include both new indexable canonical routes in the generated XML sitemap.
- Remove the artificial \`FAQPage\` JSON-LD from calculator pages: FAQ data should represent actually visible Q&A content, not invented eligibility for rich results.
- Correct generated privacy language to mention locally persisted Studio scenarios and embedded client-side calculations.
- Continue to preserve 301 legacy category redirects, canonicalization of alias tools, true calculator content and visible step-by-step guides.

Technical SEO cannot guarantee rankings or immediate indexing. After reviewed deployment: verify sitemap fetch and canonical selection in Search Console, track 404s and coverage, evaluate search queries by calculator category and improve actual unique explanations where data shows a gap. Do **not** submit undeployed Studio/Business URLs as live properties.

## Architecture direction — not yet implemented

**Keep the static free calculator library on the existing Netlify site.** Build paid value as additive routes and independent authenticated services, avoiding migrations of deterministic engines to paid infrastructure. A future backend could use a small Cloudflare Worker + D1 or another managed platform, subject to infrastructure costs and service limits.

Suggested protected backend entities: \`users\`, \`organizations\`, \`memberships\`, \`projects\`, \`scenarios\`, \`embed_domains\`, \`subscriptions\`, \`entitlements\`, \`usage_ledger\`, \`billing_events\`. Ensure organization-level access control, server-verified entitlements, usage limits, encrypted transport and scoped API keys. Never trust price or plan information from the browser.

For payment later, validate provider eligibility, checkout terms, invoice and tax handling. Use verified webhook signatures, event idempotency, subscription status state machines, retry policies, billing reconciliation and a safe, reversible launch flag. Do not turn on a checkout link until real end-to-end sandbox tests pass.

For hosted widgets at scale, add per-account domain rules, installation IDs, usage quotas, version pinning, abuse prevention, backward compatibility and an accessible fallback when scripts are blocked. Do not promise white-label or analytics until authentication and enforcement exist.

## Validation & review

\`\`\`bash
npm test
# Runs existing calculator regression suite, plus SaaS route/SEO/engineering smoke tests.
cd site && python3 -m http.server 8000
# Locally inspect /studio/ and /business/.
\`\`\`

Review responsive behavior, keyboard navigation, local-storage failure paths, JSON import limits, numerical edge cases and embed integration on an external HTML host. Compare the exact set of existing route slugs and results with \`main\` before any deployment. Allow a reviewer to approve changes before merging.

**Production rollout:** no deployment until explicitly approved. If Netlify build previews consume unavailable credits, keep preview deploys disabled and test locally.