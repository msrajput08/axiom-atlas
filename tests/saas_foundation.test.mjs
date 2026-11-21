import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const studio = read('site/studio/index.html');
const business = read('site/business/index.html');
const embed = read('site/assets/embed.js');
const catalog = JSON.parse(read('site/assets/catalog.json'));
const sitemap = read('site/sitemap.xml');
let assertions = 0;
function check(condition, message) { assert.ok(condition, message); assertions++; }
function near(actual, expected, tolerance, name) { check(Math.abs(actual - expected) < tolerance, name + ': ' + actual + ' != ' + expected); }

for (const [name, html, url] of [
  ['studio', studio, 'https://axiomatlas.netlify.app/studio/'],
  ['business', business, 'https://axiomatlas.netlify.app/business/'],
]) {
  check(html.includes('<link rel="canonical" href="' + url + '">'), name + ' canonical must be stable');
  check(html.includes('<title>'), name + ' must have crawlable title');
  check(/<meta name="description" content="[^"]{70,}"/.test(html), name + ' must have a useful description');
  check(!html.includes('noindex'), name + ' must be indexable');
  check(html.includes('href="/"'), name + ' must preserve link to free calculators');
  check(sitemap.includes('<loc>' + url + '</loc>'), name + ' must appear in regenerated sitemap');
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  for (const match of scripts) {
    if (match[0].includes('application/ld+json')) JSON.parse(match[1]);
    else new vm.Script(match[1], { filename: name + '-inline.js' });
  }
  assertions += scripts.length;
}
new vm.Script(embed, { filename: 'embed.js' }); assertions++;
check(embed.includes('attachShadow'), 'embed should use isolated Shadow DOM');
check(embed.includes("script.getAttribute('data-mode')"), 'widget must accept model selector');
check(embed.includes('Number.isFinite'), 'widget must reject numeric overflow');
check(!embed.includes('fetch(') && !embed.includes('XMLHttpRequest'), 'pilot must not secretly send calculation values');

const declaration = studio.slice(studio.indexOf('function calculate(s){'), studio.indexOf('\nfunction fmt('));
check(declaration.startsWith('function calculate(s){'), 'must locate actual Studio calculation code');
const calculate = vm.runInNewContext(declaration + '\ncalculate;', { Math });
const s = { resistance: 100, inductance: 10, capacitance: 100, frequency: 5, voltage: 12 };
const out = calculate(s);
near(out.f0, 5032.921210448703, 1e-7, 'RLC resonant frequency');
near(out.bw, 1591.5494309189535, 1e-7, 'series RLC bandwidth');
near(out.q, Math.sqrt(0.01 / 1e-7) / 100, 1e-10, 'series RLC quality');
near(out.current, 12 / out.z, 1e-12, 'RMS current');
const resonance = calculate({ ...s, frequency: out.f0 / 1000 });
near(resonance.z, s.resistance, 1e-9, 'impedance at resonance');
near(resonance.phase, 0, 1e-8, 'phase at resonance');
check(catalog.tools.filter(t => !t.isAlias).length === 314, 'all 314 canonical calculators must remain');
check(catalog.tools.length === 383, 'all 383 calculator routes must remain');
check(fs.existsSync(path.join(root, 'site/tools/scientific-calculator/index.html')), 'original tool must still be present');
check(fs.existsSync(path.join(root, 'site/tools/rlc-resonance-calculator/index.html')), 'original RLC calculator must still be present');
check(!studio.includes('checkout') && !business.includes('Buy now'), 'unfinished payment flow should not be advertised as live');

console.log('SaaS foundation and SEO smoke checks passed (' + assertions + ' assertions).');