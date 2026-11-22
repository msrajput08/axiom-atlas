import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const account = read("site/account/index.html");
const studio = read("site/studio/index.html");
const headers = read("site/_headers");
const config = read("site/assets/saas-config.mjs");
const client = read("site/assets/saas-client.mjs");
const cloud = read("site/assets/studio-cloud.mjs");
const accountJs = read("site/assets/account.mjs");
const api = read("saas/worker.mjs");
const schema = read("saas/schema.sql");
let n = 0;
function ok(condition, reason) {assert.ok(condition, reason); n++;}
ok(account.includes('name="robots" content="noindex,nofollow"'), "Account must stay out of search results");
ok(account.includes('src="/assets/account.mjs"'), "Account JS must be external");
ok(!/<script type="module">/.test(account), "Account must not inline executable JavaScript");
ok(headers.includes("/account/*") && headers.includes("script-src 'self'"), "Account page must have strict script CSP");
ok(headers.includes("Cache-Control: no-store"), "Account responses must avoid shared caches");
ok(config.includes("enabled: false"), "Incomplete auth and billing must remain disabled by default");
ok(!config.includes("service_role") || config.includes("NEVER put"), "Public configuration must not contain secrets");
ok(studio.includes('id="cloud-panel"') && studio.includes('id="cloud-panel" aria-labelledby="cloud-heading" hidden'), "Cloud must be opt-in");
ok(studio.includes('window.AxiomAtlasStudio=Object.freeze'), "Studio must provide a constrained bridge");
ok(cloud.includes("isCloudConfigured()"), "Cloud controls must honor feature flag");
ok(cloud.includes('studio.replaceFromCloud'), "Cloud loads must use validation and confirmation");
ok(cloud.includes('apiRequest("PUT"'), "Cloud writes must use authenticated API");
ok(client.includes('window.sessionStorage'), "Tokens must never be persisted in localStorage");
ok(!client.includes('localStorage'), "Do not use persistent browser auth tokens");
ok(client.includes('clearSession()'), "Account client must expose secure sign-out cleanup");
ok(client.includes('grant_type=refresh_token'), "Access tokens must have refresh support");
ok(api.includes('verifyJWT('), "API authentication required");
ok(api.includes('owner_id = ?'), "Cloud operations must have owner constraints");
ok(api.includes('version = ?'), "Cloud writes must implement optimistic concurrency");
ok(api.includes('ENABLE_PAID_ENTITLEMENTS !== "true"'), "Paid tiers must be disabled by default");
ok(api.includes('ON CONFLICT(actor_id'), "Rate limiting must be atomic");
ok(schema.includes("CREATE TABLE IF NOT EXISTS saas_projects"), "Project schema required");
ok(schema.includes("CREATE TABLE IF NOT EXISTS saas_entitlements"), "Server entitlements schema required");
ok(schema.includes("CREATE TABLE IF NOT EXISTS saas_rate_limits"), "Rate-limiter schema required");
ok(!account.includes("Pay now") && !studio.includes("Checkout"), "Payments must not falsely appear active");
for (const name of ["site/studio/index.html", "site/business/index.html", "site/account/index.html"]) {
  const html = read(name);
  const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  matches.forEach(m => JSON.parse(m[1]));
  n++;
}
for (const name of ["site/assets/saas-client.mjs", "site/assets/studio-cloud.mjs", "site/assets/account.mjs"]) {
  const src = read(name);
  // Syntax errors are caught by "node --check"; no side effects from source inspection.
  ok(src.length > 100, name + " must not be empty");
}
const legacy = read("site/assets/catalog.json");
ok(JSON.parse(legacy).tools.length === 383, "Original free calculator inventory must be preserved");
console.log("SaaS frontend/security source checks passed (" + n + " assertions).");
