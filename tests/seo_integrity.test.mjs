import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..','site');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'assets/catalog.json'),'utf8'));
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const slugs=new Set();
const canonicalTools=catalog.tools.filter(t=>!t.isAlias);
let checked=0;

assert.equal(canonicalTools.length,314,'Canonical calculator count changed');
assert.equal(catalog.tools.length,383,'Legacy calculator compatibility changed');
for(const tool of catalog.tools){
  assert.ok(!slugs.has(tool.slug),'Duplicate calculator slug: '+tool.slug);
  slugs.add(tool.slug);
  const f=path.join(root,'tools',tool.slug,'index.html');
  assert.ok(fs.existsSync(f),'Missing calculator route: '+tool.slug);
  const html=fs.readFileSync(f,'utf8');
  const canon='https://axiomatlas.netlify.app/tools/'+(tool.canonicalSlug||tool.slug)+'/';
  assert.ok(html.includes('<link rel="canonical" href="'+canon+'">'),'Invalid canonical: '+tool.slug);
  assert.ok(/<title>[^<]{8,}<\/title>/.test(html),'Missing meaningful title: '+tool.slug);
  assert.ok(html.includes('<meta name="description" content="'),'Missing description: '+tool.slug);
  assert.ok(html.includes('application/ld+json'),'Missing JSON-LD: '+tool.slug);
  if(!tool.isAlias)assert.ok(sitemap.includes('<loc>'+canon+'</loc>'),'Canonical tool absent from sitemap: '+tool.slug);
  else assert.ok(!sitemap.includes('<loc>https://axiomatlas.netlify.app/tools/'+tool.slug+'/</loc>'),'Alias must not be in canonical sitemap: '+tool.slug);
  checked++;
}
for(const cat of catalog.categories){
  const slug=cat.slug;
  const page='/categories/'+slug+'/';
  assert.ok(fs.existsSync(path.join(root,page,'index.html')),'Missing category page: '+slug);
  assert.ok(sitemap.includes('<loc>https://axiomatlas.netlify.app'+page+'</loc>'),'Category absent from sitemap: '+slug);
}
for(const route of ['/','/studio/','/business/','/about/','/privacy/']){
  assert.ok(fs.existsSync(path.join(root,route,'index.html')),'Missing expected page: '+route);
  assert.ok(sitemap.includes('<loc>https://axiomatlas.netlify.app'+route+'</loc>'),'Missing sitemap route: '+route);
}
const locs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(locs.length,328,'Unexpected canonical sitemap URL count');
assert.equal(new Set(locs).size,locs.length,'Duplicate sitemap entries');
for(const loc of locs){
  assert.ok(loc.startsWith('https://axiomatlas.netlify.app/'),'Sitemap URL has wrong domain');
  const rel=new URL(loc).pathname;
  assert.ok(fs.existsSync(path.join(root,rel,'index.html')),'Sitemap points to a missing page: '+rel);
}
console.log('SEO integrity passed: '+checked+' calculator routes, 9 categories, '+locs.length+' unique canonical sitemap URLs.');
