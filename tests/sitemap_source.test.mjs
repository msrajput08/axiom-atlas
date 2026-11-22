import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// This runs BEFORE the site rebuild. A stale committed sitemap cannot be hidden
// by a successful regeneration during CI or Netlify.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const tools=JSON.parse(read('site/assets/catalog.json'));
const games=JSON.parse(read('site/assets/brain-games-catalog.json')).games;
const slug=x=>String(x).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const base='https://axiomatlas.netlify.app';
const expected=[
 '/',
 '/about/',
 '/privacy/',
 ...tools.categories.map(c=>'/categories/'+slug(c.name)+'/'),
 ...tools.tools.filter(t=>!t.isAlias).map(t=>'/tools/'+t.slug+'/'),
 '/games/',
 ...games.map(g=>'/games/'+g.id+'/')
].map(path=>base+path);
const xml=read('site/sitemap.xml');
const locs=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(games.length,18,'Expected 18 existing game definitions');
assert.equal(locs.length,345,'Tracked sitemap must contain all 345 canonical URLs');
assert.deepEqual(locs,expected,'Tracked sitemap must match source catalog and game routes exactly');
assert.equal(new Set(locs).size,locs.length,'No duplicates');
assert.ok(!locs.some(link=>/\/tools\/(?:.+)?\/(?:.+)?\//.test(link)),'All tool routes are flat');
assert.ok(read('site/robots.txt').includes('Sitemap: '+base+'/sitemap.xml'),'robots.txt must reference published sitemap');
const generator=read('source/generate_sitemap.py');
assert.ok(generator.includes('game_paths'),'Sitemap generator must continue emitting new games');
console.log('Committed sitemap prebuild QA passed: 345 canonical URLs (314 tools + 9 categories + 3 core + 19 games).');
