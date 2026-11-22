#!/usr/bin/env node
/*
 * Fast, read-only build gate run by Netlify after npm run build.
 * Full mathematics, SEO, and game suites continue in GitHub Actions.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const site=path.join(root,'site');
const read=filename=>fs.readFileSync(path.join(site,filename),'utf8');
const catalog=JSON.parse(read('assets/catalog.json'));
const games=JSON.parse(read('assets/brain-games-catalog.json')).games;
const base='https://axiomatlas.netlify.app';
const slug=x=>String(x).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const targets=[
 '/',
 '/about/',
 '/privacy/',
 ...catalog.categories.map(c=>'/categories/'+slug(c.name)+'/'),
 ...catalog.tools.filter(t=>!t.isAlias).map(t=>'/tools/'+t.slug+'/'),
 '/games/',
 ...games.map(g=>'/games/'+g.id+'/')
];
const locs=[...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(targets.length,345,'Unexpected number of canonical pages');
assert.deepEqual(locs,targets.map(p=>base+p),'Sitemap must match every canonical page, in order');
assert.equal(new Set(locs).size,locs.length,'Sitemap must not repeat URLs');
for(const uri of targets) {
 const page=read(uri==='/'?'index.html':uri.slice(1)+'index.html');
 assert.ok(page.includes('<link rel="canonical" href="'+base+uri+'">'),'Missing canonical '+uri);
 assert.ok(!page.includes('name="robots" content="noindex'),'Canonical page is noindex: '+uri);
 assert.ok(page.includes('<h1') && page.includes('<meta name="description"'), 'Missing content/description: '+uri);
}
const home=read('index.html');
const firstHero=home.indexOf('<section class="hero hero-split">');
const brand=home.indexOf('class="hero-copy hero-axiomatlas"');
const game=home.indexOf('class="hero-games-card" id="brain-games"');
const countGames=(home.match(/id="brain-games"/g)||[]).length;
assert.ok(firstHero>=0 && brand>firstHero && game>brand,'Homepage must show AxiomAtlas first and games beside it');
assert.ok(game<home.indexOf('</section>',firstHero),'Brain Lab card must be inside primary hero');
assert.equal(countGames,1,'Only one Brain Lab feature on homepage');
assert.ok(home.includes('href="/games/"') && home.includes('href="/tools/scientific-calculator/"'),
 'Calculators and games must have valid CTAs');
assert.ok(home.includes('class="top-games-link" href="/games/"'),'Top navigation must expose Games');
assert.ok(home.includes('/assets/brain-games.css?v='),'Homepage must load Brain Lab CSS');
assert.ok(read('assets/styles.css').includes('.top-games-link{display:inline-flex'),
 'All calculator pages must style the global Games shortcut');
assert.ok(read('assets/brain-games.css').includes('grid-template-columns:minmax(0,1.45fr)'),
 'Desktop hero must be two columns');
assert.ok(read('assets/brain-games.css').includes('@media(max-width:900px)'),
 'Smaller screens must stack hero sections');
for(const name of ['brain-games.mjs','games-engine.mjs','games-levels.mjs','games-progress.mjs','brain-games.css','brain-games-catalog.json'])
 assert.ok(fs.existsSync(path.join(site,'assets',name)),'Missing Brain Lab dependency '+name);
const gameHub=read('games/index.html');
for(const g of games) {
 assert.ok(gameHub.includes('href="/games/'+g.id+'/">'),'Hub missing game '+g.id);
 const html=read('games/'+g.id+'/index.html');
 assert.ok(html.includes('data-game-id="'+g.id+'"')&&html.includes('data-calculator-slug="'+g.calculatorSlug+'"'),
   'Game calculator link mismatch '+g.id);
}
const robots=read('robots.txt');
assert.ok(robots.includes('Sitemap: '+base+'/sitemap.xml'),'Robots file points to wrong sitemap');
console.log('Netlify publish smoke passed: '+targets.length+' canonical pages, 19 Brain Lab routes, split hero, assets, links and robots.txt.');
