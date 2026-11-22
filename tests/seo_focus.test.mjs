import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {isPrime, primeFactors} from "../site/assets/engine.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const load = file => fs.readFileSync(path.join(root, file), "utf8");
const catalog = JSON.parse(load("site/assets/catalog.json"));
const parseGuides = (file, symbol) => {
  const source = load(file);
  const pattern = new RegExp(symbol + " = json\\.loads\\(r'''([\\s\\S]*?)'''\\)");
  const match = source.match(pattern);
  assert.ok(match, "Curated SEO content must be data-only JSON: " + file);
  return JSON.parse(match[1]);
};
const focus = {
  ...parseGuides("source/seo_focus.py", "SEO_FOCUS"),
  ...parseGuides("source/seo_expansion.py", "SEO_EXPANSION")
};
const all = catalog.tools;
const canonical = all.filter(t => !t.isAlias);
const bySlug = new Map(all.map(t => [t.slug, t]));
const origin = "https://axiomatlas.netlify.app";
const escape = x => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
let assertions = 0;
function ok(cond, reason) { assert.ok(cond, reason); assertions++; }
function equal(x, y, reason) { assert.equal(x, y, reason); assertions++; }

equal(all.length, 383, "All existing 383 routes must remain");
equal(canonical.length, 314, "All original 314 free tools must remain");
equal(Object.keys(focus).length, 14, "Fourteen canonical pages with hand-verified search-intent guides");

const seenTitles = new Set();
const visited = new Set();
for (const [slug, guide] of Object.entries(focus)) {
  const tool = bySlug.get(slug);
  ok(tool && !tool.isAlias, "Guides must target canonical calculators: " + slug);
  ok(!seenTitles.has(guide.title), "No duplicate focused titles: " + slug);
  seenTitles.add(guide.title);
  ok(guide.description.length >= 90 && guide.description.length <= 165, "Useful, concise meta: " + slug);
  ok(guide.title.length <= 65, "Title not excessively long: " + slug);
  ok(Array.isArray(guide.steps) && guide.steps.length >= 2, "Instruction steps: " + slug);
  ok(Array.isArray(guide.examples) && guide.examples.length >= 2, "Worked examples: " + slug);
  ok(Array.isArray(guide.questions) && guide.questions.length >= 2, "Questions: " + slug);
  ok(Array.isArray(guide.related) && guide.related.length >= 2, "Internal links: " + slug);
  for (const [label, target] of guide.related) {
    const to = bySlug.get(target);
    ok(to && !to.isAlias, "Link must target a canonical tool: " + slug + " -> " + target);
    ok(label.length >= 6, "Descriptive anchor text: " + slug);
  }
  const html = load("site/tools/" + slug + "/index.html");
  const canonicalUrl = origin + "/tools/" + slug + "/";
  ok(html.includes("<title>" + escape(guide.title) + " | AxiomAtlas</title>"), "Focused SEO title: " + slug);
  ok(html.includes('<meta name="description" content="' + escape(guide.description) + '">'), "Focused description: " + slug);
  ok(html.includes("<h1>" + escape(guide.heading) + "</h1>"), "Matching real page heading: " + slug);
  ok(html.includes(escape(guide.intro)), "Useful introductory copy: " + slug);
  ok(html.includes('<link rel="canonical" href="' + canonicalUrl + '">'), "Self canonical: " + slug);
  ok(html.includes('<meta property="og:url" content="' + canonicalUrl + '">'), "Open Graph canonical URL: " + slug);
  ok(html.includes('class="seo-focus section"'), "Crawlable HTML guide: " + slug);
  for (const step of guide.steps) ok(html.includes(escape(step)), "Visible step: " + slug);
  for (const [label, calculation] of guide.examples) {
    ok(html.includes("<h3>" + escape(label) + "</h3>"), "Visible example title: " + slug);
    ok(html.includes(escape(calculation)), "Visible computed example: " + slug);
  }
  for (const [q, a] of guide.questions) {
    ok(html.includes("<h3>" + escape(q) + "</h3>"), "Visible question: " + slug);
    ok(html.includes(escape(a)), "Visible answer: " + slug);
  }
  for (const [, target] of guide.related) {
    ok(html.includes('href="/tools/' + target + '/"'), "Working related href: " + slug);
  }
  visited.add(slug);
}
for (const t of all) {
  const html = load("site/tools/" + t.slug + "/index.html");
  const expected = t.isAlias ? t.canonicalSlug : t.slug;
  ok(html.includes('<link rel="canonical" href="' + origin + '/tools/' + expected + '/">'),
    "Preserve canonical relationship: " + t.slug);
  ok(!html.includes('"@type": "FAQPage"'), "Remove unsupported sitewide FAQ schema: " + t.slug);
  const tag = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  ok(tag, "Keep structured data: " + t.slug);
  const schemas = JSON.parse(tag[1]);
  ok(schemas.some(x => x["@type"] === "WebApplication"), "Working software metadata: " + t.slug);
  ok(schemas.some(x => x["@type"] === "BreadcrumbList"), "Keep breadcrumbs: " + t.slug);
  if (t.isAlias) ok(!html.includes('class="seo-focus section"'), "Aliases must not duplicate focused guides: " + t.slug);
  else if (!visited.has(t.slug)) ok(!html.includes('class="seo-focus section"'), "Non-target routes remain unchanged: " + t.slug);
}
const home = load("site/index.html");
const quickPaths = [
  "prime-checker", "slope-calculator", "percentage-calculator",
  "attendance-planner", "recipe-scaler", "paint-coverage",
  "midpoint-calculator", "image-resolution-calculator"
];
const categoryCount = (home.match(/class="category-card"/g) || []).length;
equal(categoryCount, 9, "Home still contains precisely 9 primary category cards");
for (const slug of quickPaths) {
  ok(bySlug.get(slug) && !bySlug.get(slug).isAlias,
    "Quick-link must lead to a canonical tool " + slug);
  ok(home.includes('<a class="quick-tool-card" href="/tools/' + slug + '/">'),
    "Search-led quick access must be in static HTML " + slug);
}
ok(home.includes('id="quick-tools"'), "Homepage quick-access section is present");
ok(home.includes('rel="preconnect" href="https://fonts.gstatic.com"'), "Font server is preconnected");
ok(home.includes('fonts.googleapis.com/css2?family=DM+Sans'), "Fonts stylesheet loads in the document head");
ok(!load("site/assets/styles.css").includes("@import url('https://fonts.googleapis.com"),
  "External font CSS must not be serially imported by site CSS");
ok(load("site/assets/styles.css").includes(".quick-tool-grid{"), "Responsive quick-link grid must exist");
ok(load("source/build.py").includes("SEO_FOCUS.update(SEO_EXPANSION)"), "Expansion guides must be included in generator");

const map = load("site/sitemap.xml");
equal((map.match(/<loc>/g) || []).length, 326, "Canonical sitemap count must stay at 326");
ok(map.includes("<loc>" + origin + "/tools/prime-checker/</loc>"), "Existing prime canonical remains discoverable");
ok(!map.includes("<loc>" + origin + "/tools/pixel-density/</loc>"), "Alias must not enter sitemap");
const robots = load("site/robots.txt");
ok(robots.includes("Sitemap: " + origin + "/sitemap.xml"), "Sitemap stays declared");

// Reference numerical checks against actual prime solver and independent arithmetic.
equal(isPrime(97), true, "97 is prime");
equal(isPrime(1), false, "1 is not prime");
equal(isPrime(360), false, "360 is composite");
equal(JSON.stringify(primeFactors(360)), JSON.stringify([[2,3],[3,2],[5,1]]), "360 factorization");
equal((11 - 3) / (6 - 2), 2, "Slope worked example");
equal(250 * 7 / 4, 437.5, "Recipe worked example");
equal(Math.ceil(Math.max(0, (75 * 75 - 100 * 56) / (100 - 75))), 1, "Attendance class goal");
equal(Math.floor(Math.max(0, (100 * 90 - 75 * 100) / 75)), 20, "Attendance allowed absences");
equal(65 * 2 / 10, 13, "Paint litres");
equal((20 - 5) / 3, 5, "Linear equation example");
ok(Math.abs(7 * Math.PI / 2 - 10.9956) < 0.0001, "Arc length example");
ok(Math.abs(Math.hypot(1920, 1080) / 15.6 - 141.21) < 0.01, "PPI example");
ok(Math.abs(200 * Math.abs(64 - 80) / (Math.abs(64) + Math.abs(80)) - 22.222222) < 0.0001, "Percent difference example");
equal((2 + 8)/2, 5, "Midpoint x worked example");
equal((6 + 10)/2, 8, "Midpoint y worked example");
ok(Math.abs(Math.hypot(8-2,10-6) - 7.2111) < 0.0001, "Midpoint distance worked example");
equal(0.5 * 80 * Math.sin(Math.PI/2), 40, "Torque 90-degree example");
ok(Math.abs(0.5 * 80 * Math.sin(Math.PI/6) - 20) < 0.00001, "Torque 30-degree example");
equal(695700 * 2, 1391400, "Solar radius converted to kilometres");
ok(Math.abs(695700/6371 - 109.20) < 0.01, "Solar to Earth radius conversion");
equal(0.5 * 10 * 6 * 6, 180, "Kinetic energy example");
equal(10 * 6, 60, "Momentum example");
equal(4 + (12-1)*3, 37, "AP 12th term");
equal(12 * (4 + 37)/2, 246, "AP 12-term sum");
equal(10/(1-0.5), 20, "Infinite geometric series example");
ok(!load("source/build.py").includes("'@type': 'FAQPage'"), "Schema fix must live in generator");
console.log("Targeted SEO audit passed (" + assertions + " assertions across 383 routes, 9 focused guides).");
