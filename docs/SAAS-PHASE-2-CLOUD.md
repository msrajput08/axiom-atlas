# AxiomAtlas SaaS — Phase 2: authentication, cloud projects and entitlements

**Branch:** feature/saas-studio-foundation — **NO production deploy / NO main merge / NO paid checkout**

## Implemented (code-level foundation)

- \`saas/worker.mjs\`: a Cloudflare Worker using **Supabase Auth asymmetric RS256/ES256 JWT verification**, a pinned Supabase issuer/JWKS endpoint, audience/expiry/role/sub checks, explicit browser origin allowlist, and D1 database.
- \`saas/schema.sql\`: isolated project, entitlement, and rate-limit tables; untouched static calculator storage, SEO metadata and routes.
- API endpoints: \`GET /api/health\` (public); \`GET /api/me\`; \`GET /api/projects\`; \`POST /api/projects\`; \`GET/PUT/DELETE /api/projects/:uuid\` (authenticated).
- Every project access is scoped to the JWT-verified user ID, including updates and deletion. Server generates UUIDs and checks schema/size. PUT requires a matching project version to prevent blind overwrites. Creating a project enforces limits in a *single SQL statement* to avoid oversubscription under concurrent requests.
- Project calculations never run on the server. The same free local-first Studio remains available without login. The optional cloud panel adds manual Save, Load, Refresh and Delete, and prompts before replacing local work.
- \`/account/\`: styled account frontend with login, registration, recovery and sign-out, backed by actual Supabase Auth endpoints when configured (not fake account logic). Confirmation emails and password reset emails are handled by the provider, **not** by this repository. The account page is noindexed, and the path has a restrictive script CSP.
- Auth tokens reside in browser **sessionStorage** (session lifetime; scripts running on the origin can access this, so keep CSP and XSS prevention strong), not localStorage. The client supports token renewal, retries an API request once on 401, and clears tokens on logout.
- \`site/assets/saas-config.mjs\` is intentionally \`enabled: false\`. Free users are not prompted to sign up and see no cloud tools until actual configuration and staging verification.
- Server reads entitlements from D1 **only** if \`ENABLE_PAID_ENTITLEMENTS=true\`. It defaults to false, so every authenticated account receives the free allocation (3 cloud projects, up to 50 scenarios per project); no unverified plan upgrades from the browser.
- No billing webhooks, checkout, paid subscription lifecycle, domain restriction service, or team administration have been implemented yet.

## Private staging setup (manual, not yet performed)

1. Create a distinct Supabase Auth project for AxiomAtlas staging. Enable email confirmation and configure a legitimate SMTP sender and appropriate email limits before testing signups. Configure allowed origins and redirect URLs (including \`https://YOUR-STAGING-SITE/account/\`). Use an **asymmetric JWT signing key (RS256 or ES256)**; legacy HS256-only tokens are deliberately unsupported because this Worker verifies public JWKS signatures.
2. Create a distinct Cloudflare D1 staging database via \`npx wrangler d1 create axiomatlas-saas-staging\`. Copy \`saas/wrangler.example.toml\` to \`saas/wrangler.toml\`, set the returned database ID, your staging \`APP_ORIGIN\` and Supabase URL. Keep \`ENABLE_PAID_ENTITLEMENTS = "false"\`.
3. Apply the schema to the intended *staging* DB: \`npx wrangler d1 execute axiomatlas-saas-staging --remote --file=saas/schema.sql\`. Double-check the database name and account before running. Deploy the API explicitly from \`saas/\` with \`npx wrangler deploy --config wrangler.toml\` only after reviewing the target account.
4. In the staged frontend branch only, update \`site/assets/saas-config.mjs\` with \`enabled: true\`, the public Supabase project URL and **public/publishable** key, plus the HTTPS Worker API origin. **Never place service_role keys, a database token, SMTP password or billing secrets in any \`site/\` file.**
5. Use a separate Netlify site/branch deploy for staging; never attach the test branch to the existing production site. Confirm \`APP_ORIGIN\` exactly matches the staged site's origin and that Supabase allows its redirect URI.
6. Manually test: email confirmation, login, password recovery, expired-session refresh, sign-out, three-project free quota, owner isolation, cross-device reload, 409 version-conflict handling, invalid payload and 429 rate limiting. Repeat on desktop and mobile. Configure Cloudflare logs and usage alerts before any production rollout.

**Web security:** The JWT belongs only in the Authorization header. There are no cookie credentials on this API. The Worker returns CORS headers for a single explicitly configured origin. CSP currently permits outbound HTTPS connections for the account screen; narrow \`connect-src\` to the actual Supabase and API hosts in staging/production. Browser sessionStorage does not protect against an XSS vulnerability—separate security review is mandatory before enabling.

## Automated QA

\`\`\`bash
npm run test:saas
npm test
\`\`\`

Test files:
- \`tests/saas_api.test.mjs\`: signed ES256 JWTs, rejection of tampered or expired JWTs, role/audience validation, user A vs B project isolation, free limits, paid flag, stale updates and rate limits against an in-memory D1 test double.
- \`tests/saas_frontend.test.mjs\`: checks that cloud defaults off, account script is external, CSP/noindex are present and front-end writes use authenticated API paths.
- Existing calculator/SEO suites continue to check all 314 canonical calculators and 69 aliases.

**Test limitations:** Mock D1 integration tests are not a substitute for actual Cloudflare D1 transactions or real Supabase/Auth/email integration tests. Do not claim production readiness until a separate staging environment passes.

## Planned Phase 3 — not built yet

- Billing provider onboarding, verified provider webhook signatures, replay protection/idempotency, full subscription and refund/reconciliation lifecycle.
- Server-enforced business embed API keys/domain controls, quotas, pricing, customer analytics with privacy safeguards, real team/organization access control.
- Account deletion/export, data retention controls and privacy policy/legal updates for optional cloud accounts and provider processing.
- Observability, performance budgets, abuse controls, user support, real-host load tests, multi-device E2E and launch gating.

**Release policy:** Only after explicit user authorization, passing GitHub CI, external staging and sign-off may changes be merged to \`main\`. Paid checkout must stay disabled until payment and fulfillment are proven end-to-end.
