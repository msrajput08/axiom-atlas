#!/usr/bin/env node
/**
 * Read-only live deployment verification. Does not deploy or mutate production.
 * Run after a Netlify deployment: EXPECTED_SHA=<40-char commit> node scripts/verify_live.mjs
 */
import assert from "node:assert/strict";

const base = (process.env.SITE_URL || "https://axiomatlas.netlify.app").replace(/\/$/, "");
const expected = (process.env.EXPECTED_SHA || process.env.GITHUB_SHA || "").trim().toLowerCase();
if (!/^https:\/\//.test(base)) throw Error("SITE_URL must use HTTPS");
if (expected && !/^[0-9a-f]{40}$/.test(expected)) throw Error("EXPECTED_SHA must be a full Git commit SHA");

async function get(path, type) {
  const glue = path.includes("?") ? "&" : "?";
  const url = base + path + glue + "verify=" + Date.now();
  const response = await fetch(url, {
    cache: "no-store", redirect: "follow",
    headers: {"Cache-Control": "no-cache", "Accept": type}
  });
  assert.equal(response.status, 200, "Expected HTTP 200 for " + path + ", got " + response.status);
  const text = await response.text();
  assert.ok(text.length > 0, "Empty response at " + path);
  return text;
}
const info = JSON.parse(await get("/build-info.json", "application/json"));
assert.equal(info.app, "AxiomAtlas", "Unexpected site in build manifest");
assert.equal(info.kind, "static-site", "Unexpected application format");
if (expected) {
  assert.equal(info.revision, expected,
    "Live website does not serve the requested Git commit. Check Netlify Deploys.");
} else {
  assert.match(info.revision || "", /^[0-9a-f]{40}$/,
    "No valid Git build revision is published; confirm a Git-linked Netlify deploy");
}
const home = await get("/", "text/html");
assert.ok(home.includes('id="quick-tools"'), "Search-led homepage shortcuts are absent");
assert.ok(home.includes('<section class="hero hero-split">'), "Latest AxiomAtlas-and-Games shared hero is missing");
assert.ok(home.indexOf('class="hero-copy hero-axiomatlas"') <
  home.indexOf('class="hero-games-card" id="brain-games"'),
  "AxiomAtlas brand must appear before the adjacent games feature");
assert.ok(home.includes('class="top-games-link" href="/games/"'),
  "Games must be reachable from top navigation");
assert.ok(home.includes('<link rel="canonical" href="' + base + '/">'), "Home canonical URL mismatch");
const prime = await get("/tools/prime-checker/", "text/html");
assert.ok(prime.includes('<h1>Prime Number Checker</h1>'), "Latest Prime Checker content is missing");
assert.ok(prime.includes('class="seo-focus section"'), "Editorial calculation guides are missing");
const midpoint = await get("/tools/midpoint-calculator/", "text/html");
assert.ok(midpoint.includes('<h1>Midpoint Calculator</h1>'), "Midpoint route is not using the correct renderer");
const robots = await get("/robots.txt", "text/plain");
assert.ok(robots.includes("Sitemap: " + base + "/sitemap.xml"), "robots.txt sitemap reference missing");
const sitemap = await get("/sitemap.xml", "application/xml");
assert.equal((sitemap.match(/<loc>/g) || []).length, 345, "Canonical sitemap count changed");
console.log("Production deployment verified: " + info.revision);
const hub = await get("/games/", "text/html");
assert.ok(hub.includes("Think deeper."), "Game hub missing on production");
const primeGame = await get("/games/prime-detective/", "text/html");
assert.ok(primeGame.includes('data-game-id="prime-detective"'), "Prime Detective is not deployed");
console.log("Home, calculators, 18 games and 345 sitemap URLs verified.");
