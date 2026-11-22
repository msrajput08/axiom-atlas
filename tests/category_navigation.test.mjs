import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const slugify = x => String(x).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const app = read("site/assets/app.js");
const start = app.indexOf("function renderCategory() {");
const end = app.indexOf("\nfunction searchSetup() {", start);
assert.ok(start >= 0 && end > start, "Category UI renderer must exist");
const source = app.slice(start, end);

let assertions = 0;
function check(value, expected, reason) {
  assert.deepEqual(value, expected, reason);
  assertions++;
}
function ok(condition, reason) { assert.ok(condition, reason); assertions++; }

// Real generated HTML must expose valid fragment destinations for all 74 subcategories.
// The sidebar's /categories/X/#Y link and the corresponding pill share the same ID.
const catalog = JSON.parse(read("site/assets/catalog.json"));
let fragmentLinks = 0;
for (const category of catalog.categories) {
  const cat = slugify(category.name);
  const html = read("site/categories/" + cat + "/index.html");
  check(html.includes('data-page="category"'), true, "Category page should be generated");
  for (const name of category.subcategories) {
    const sub = slugify(name);
    ok(html.includes('href="/categories/' + cat + '/#' + sub + '"'), "Sidebar subcategory link exists: " + cat + "/#" + sub);
    ok(html.includes('id="' + sub + '" class="filter-pill" data-sub="' + sub + '"'), "Matching fragment target exists: " + cat + "/#" + sub);
    ok(html.includes('data-sub="' + sub + '" aria-pressed="false"'), "Accessible button state: " + cat + "/#" + sub);
    fragmentLinks++;
  }
}

// Exercise the production renderCategory function in a deterministic DOM stub.
// Verify initial hash, click filtering, updated URL and browser forward/back.
const tools = [
  {slug: "alpha-one", category: "Example Category", subcategory: "Alpha"},
  {slug: "alpha-two", category: "Example Category", subcategory: "Alpha"},
  {slug: "beta-one", category: "Example Category", subcategory: "Beta"}
];
const location = {pathname: "/categories/example-category/", search: "?view=tools", hash: "#beta"};
const historyCalls = [];
const history = {pushState(_state, _title, href) {
  historyCalls.push(href);
  location.hash = href.includes("#") ? href.slice(href.indexOf("#")) : "";
}};
const handlers = {};
const pills = {
  buttons: [],
  set innerHTML(html) {
    this.html = html;
    this.buttons = [...html.matchAll(/data-sub="([^"]+)" aria-pressed="false"/g)].map(m => {
      const button = {
        dataset: {sub: m[1]},
        attributes: {},
        active: false,
        classList: {toggle(_name, state) {button.active = state;}},
        setAttribute(name, value) {button.attributes[name] = value;},
        onclick: null
      };
      return button;
    });
  },
  get innerHTML() {return this.html;}
};
const container = {innerHTML: "", parentElement: {insertBefore() {throw Error("Pill bar should already exist");}}};
const selectors = {"#category-tools": container, "#subcat-pills": pills};
const context = {
  document: {body: {dataset: {category: "example-category"}}, createElement() {throw Error("Not needed");}},
  location, history,
  window: {addEventListener(type, callback) {handlers[type] = callback;}},
  data: {categories: [{name: "Example Category", subcategories: ["Alpha", "Beta"]}]},
  canonicalTools: () => tools,
  slugify, esc: x => String(x),
  card: t => "<a data-test-slug='" + t.slug + "'></a>",
  $: query => selectors[query] || null,
  $$: (_query, node) => node.buttons
};
vm.runInNewContext(source + "\nrenderCategory();", context);

check(pills.buttons.length, 3, "All and two category filters are visible");
ok(container.innerHTML.includes("beta-one"), "Direct #beta link selects the Beta filter");
ok(!container.innerHTML.includes("alpha-one"), "Beta link must not leave unfiltered Alpha tools");
check(pills.buttons.find(b => b.dataset.sub === "beta").attributes["aria-pressed"], "true", "Active button announced");
pills.buttons.find(b => b.dataset.sub === "alpha").onclick();
check(location.hash, "#alpha", "Clicking a pill changes the URL fragment without reloading");
ok(historyCalls[0].includes("?view=tools#alpha"), "Existing query string is preserved");
ok(container.innerHTML.includes("alpha-one") && container.innerHTML.includes("alpha-two"), "Alpha filter shows both matching tools");
ok(!container.innerHTML.includes("beta-one"), "Alpha filter excludes Beta");
pills.buttons.find(b => b.dataset.sub === "all").onclick();
check(location.hash, "", "All filter removes the fragment");
check(container.innerHTML.match(/data-test-slug/g)?.length || 0, 3, "All filter shows all tools");
location.hash = "#beta"; handlers.popstate();
ok(container.innerHTML.includes("beta-one") && !container.innerHTML.includes("alpha-one"), "Back/forward restores URL filter");
location.hash = "#alpha"; handlers.hashchange();
ok(container.innerHTML.includes("alpha-one") && !container.innerHTML.includes("beta-one"), "Same-page sidebar link synchronizes filtered content");
location.hash = "#missing"; handlers.hashchange();
check(container.innerHTML.match(/data-test-slug/g)?.length || 0, 3, "Invalid fragments fall back to all tools");
check(pills.buttons.filter(b => b.active).length, 1, "Exactly one filter button is active");

console.log("Category sub-navigation QA passed (" + assertions + " assertions; " +
  fragmentLinks + " static fragment destinations checked).");
