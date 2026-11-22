import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const manifest = JSON.parse(read("site/build-info.json"));
assert.equal(manifest.app, "AxiomAtlas");
assert.equal(manifest.kind, "static-site");
assert.ok(manifest.revision === null || /^[a-f0-9]{40}$/.test(manifest.revision));
const expected = process.env.COMMIT_REF || process.env.GITHUB_SHA;
if (expected && /^[a-f0-9]{40}$/i.test(expected)) {
  assert.equal(manifest.revision, expected.toLowerCase(), "Build must identify the exact current Git revision");
}
const headers = read("site/_headers");
assert.ok(/\/build-info\.json\n  Cache-Control: no-store\n/.test(headers),
  "Git revision endpoint must not be cached");
const rebuild = read("scripts/rebuild.py");
assert.ok(rebuild.includes("'build-info.json'"), "Manifest must be emitted by deterministic build");
const testSource = read("scripts/verify_live.mjs");
assert.ok(testSource.includes("info.revision, expected"), "Live verifier must compare the exact Git commit");
assert.ok(testSource.includes('id="quick-tools"'), "Live verifier must check the latest homepage");
const netlify = read("netlify.toml");
assert.ok(netlify.includes('command = "npm run build && npm run verify:publish"'),
  "Netlify must perform a fast static smoke check, not the full math suite on every deploy");
assert.ok(!netlify.includes('command = "npm test"'),
  "Full regression suite must remain in GitHub CI to conserve Netlify build minutes");
const pkg = JSON.parse(read("package.json"));
assert.ok(pkg.scripts.test.includes("tests/sitemap_source.test.mjs"),
  "CI must catch a stale committed sitemap before rebuilding");
assert.ok(pkg.scripts.test.includes("scripts/verify_publish.mjs"),
  "CI must run the same publishing smoke gate as Netlify");
console.log("Production build provenance checks passed (11 assertions).");
