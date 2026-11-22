import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROUNDS, seedFromText, dailySeed, roundSeed, makeChallenge, gradeAnswer, formatAnswer } from '../site/assets/games-engine.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const catalog = JSON.parse(read('site/assets/brain-games-catalog.json'));
const tools = JSON.parse(read('site/assets/catalog.json')).tools;
const canonical = new Set(tools.filter(t => !t.isAlias).map(t=>t.slug));
const close = (x, y) => Math.abs(x-y) <= Math.max(1e-8, Math.abs(y)*1e-9);
let assertions = 0;
function ok(value, reason) { assert.ok(value, reason); assertions++; }
function eq(a, b, reason) { assert.equal(a, b, reason); assertions++; }
function numeric(challenge, expected, label) {
  ok(Number.isFinite(expected), label + ' must be finite');
  ok(close(Number(challenge.answer), expected), label + ': answer inconsistent with independent formula; got ' + challenge.answer + ', expected ' + expected);
}
function independentlyVerify(gameId, q) {
  const v = q.verifyInputs;
  const val = key => parseFloat(String(v[key]).replace(/,/g, ''));
  switch (gameId) {
    case 'prime-detective': {
      const prime = Number(q.answer);
      let divisors = 0;
      for(let i=1;i<=prime;i++)if(prime%i===0)divisors++;
      eq(divisors,2,'prime detective must select an actual prime');
      for (const option of q.options) {
        if (option === q.answer) continue;
        const n=Number(option);
        ok(Array.from({length:n},(_,i)=>i+1).some(d=>d>1&&d<n&&n%d===0),'distractor must be composite');
      }
      break;
    }
    case 'percent-hunt':
      numeric(q,val('Percentage p')*val('Number n')/100,gameId);break;
    case 'equation-escape':
      numeric(q,(val('Right-hand side c')-val('Constant b'))/val('Coefficient a'),gameId);break;
    case 'quadratic-code': {
      const match=q.answer.match(/^\((-?\d+), (-?\d+)\)$/);
      ok(match,'quadratic must have exactly two parsable roots');
      const [x,y]=[Number(match[1]),Number(match[2])];
      for (const r of [x,y]) eq(val('a')*r*r+val('b')*r+val('c'),0,'quadratic root must solve original equation');
      break;
    }
    case 'derivative-dash': {
      const aMatch=String(v['Expression f(x)']).match(/^(\d+)\*x\^(\d+)$/);
      ok(aMatch,'power rule expression valid');
      numeric(q,Number(aMatch[1])*Number(aMatch[2])*val('Evaluation point x')**(Number(aMatch[2])-1),gameId);break;
    }
    case 'integral-hunt': {
      const a=Number(String(v['Expression f(x)']).split('*')[0]),lo=val('Lower bound'),hi=val('Upper bound');
      numeric(q,a*(hi*hi-lo*lo)/2,gameId);break;
    }
    case 'slope-run':
      numeric(q,(val('y2')-val('y1'))/(val('x2')-val('x1')),gameId);break;
    case 'shape-builder':
      numeric(q,val('Length l')*val('Width w'),gameId);break;
    case 'energy-quest':
      numeric(q,0.5*val('Mass m')*val('Speed v')**2,gameId);break;
    case 'circuit-lab':
      numeric(q,val('Voltage V')/val('Resistance R'),gameId);break;
    case 'mean-machine': {
      const xs=String(v.Dataset).split(',').map(Number);
      numeric(q,xs.reduce((a,b)=>a+b,0)/xs.length,gameId);break;
    }
    case 'probability-lab':
      numeric(q,Number(String(v['Event probability p']).split('=').at(-1))*100,gameId);break;
    case 'interest-builder':
      numeric(q,val('Principal P')*val('Annual interest r')*val('Years t')/100,gameId);break;
    case 'margin-master':
      numeric(q,100*(val('Selling price')-val('Unit cost'))/val('Selling price'),gameId);break;
    case 'attendance-rescue':
      numeric(q,100*val('Classes attended')/val('Classes held'),gameId);break;
    case 'recipe-remix':
      numeric(q,val('Ingredient amount q')*val('New servings')/val('Original servings'),gameId);break;
    case 'solar-scale':
      numeric(q,695700*val('Radius in solar radii'),gameId);break;
    case 'star-distance':
      numeric(q,1/val('Parallax angle p'),gameId);break;
    default: throw Error('Missing independent reference for '+gameId);
  }
}

eq(ROUNDS,20,'20 progression levels per game');
eq(catalog.games.length,18,'exactly 18 educational games');
eq(catalog.categories.length,9,'one set of games for every original category');
const oldCats=JSON.parse(read('site/assets/catalog.json')).categories.map(c=>c.name);
eq(JSON.stringify(catalog.categories.map(c=>c.name)),JSON.stringify(oldCats),'same existing 9 categories in order');
const ids=new Set();
let checked=0;
for (const g of catalog.games) {
  ok(!ids.has(g.id),'no duplicate games: '+g.id);ids.add(g.id);
  ok(canonical.has(g.calculatorSlug),'game must link to canonical, existing calculator: '+g.id);
  ok(oldCats.includes(g.category),'existing category: '+g.id);
  ok(g.title.length>6&&g.description.length>25,'meaningful title and description: '+g.id);
  const html=read('site/games/'+g.id+'/index.html');
  ok(html.includes('<link rel="canonical" href="https://axiomatlas.netlify.app/games/'+g.id+'/">'),'per-game canonical route: '+g.id);
  ok(html.includes('id="game-player" data-game-id="'+g.id+'"'),'interactive game root: '+g.id);
  ok(html.includes('data-calculator-slug="'+g.calculatorSlug+'"'),'correct calculator mapping: '+g.id);
  ok(html.includes('src="/assets/brain-games.mjs?v='),'versioned client: '+g.id);
  ok(html.includes('href="/tools/'+g.calculatorSlug+'/">'),'no broken calculator verification link: '+g.id);
  ok(html.includes('<h1>'+g.title+'</h1>'),'crawlable landing title: '+g.id);
  for (let seed=1;seed<=150;seed++) {
    const q=makeChallenge(g.id, seedFromText(g.id+':'+seed));
    eq(q.mode,g.answerMode,'answer mode matches catalog');
    ok(typeof q.prompt==='string'&&q.prompt.length>=15,'readable puzzle');
    ok(typeof q.explanation==='string'&&q.explanation.length>=35,'method after answer');
    ok(typeof q.hint==='string'&&q.hint.length>=25,'useful optional hint');
    ok(typeof q.verifyGuide==='string'&&q.verifyGuide.length>=25,'calculator instructions');
    ok(Object.keys(q.verifyInputs).length>0,'reproducible calculator inputs');
    ok(gradeAnswer(q,String(q.answer)),'correct answer must grade correctly');
    if(q.mode==='multiple-choice'){
      eq(q.options.length,4,'four alternatives');
      eq(new Set(q.options).size,4,'all choices distinct');
      ok(q.options.includes(q.answer),'correct answer present');
      ok(!gradeAnswer(q,q.options.find(x=>x!==q.answer)),'distractor grades false');
    }else{
      ok(Number.isFinite(Number(q.answer)),'numeric answer finite');
      ok(!gradeAnswer(q,String(Number(q.answer)+Math.max(1,Math.abs(Number(q.answer))*0.1))),'wrong answer grades false');
      ok(!gradeAnswer(q,'Infinity'),'reject Infinity');
      ok(!gradeAnswer(q,'0x10'),'reject hex');
      ok(!gradeAnswer(q,''),'reject blank');
      ok(!gradeAnswer(q,'random'),'reject nonnumber');
      ok(gradeAnswer(q,Number(q.answer).toLocaleString('en-US')),'accept grouped thousands');
    }
    ok(typeof formatAnswer(q)==='string' && formatAnswer(q).length>0,'display result');
    independentlyVerify(g.id,q);
    checked++;
  }
  const seeds=Array.from({length:5},(_,n)=>roundSeed(dailySeed(g.id,'2026-11-22'),n));
  eq(new Set(seeds).size,5,'each daily round has a unique random seed');
}
for(const category of catalog.categories)
  eq(catalog.games.filter(g=>g.category===category.name).length,2,'two games for '+category.name);
const hub=read('site/games/index.html');
for(const category of catalog.categories){
  ok(hub.includes('id="'+category.slug+'"'),'hub has subject section '+category.slug);
}
for(const game of catalog.games){
  ok(hub.includes('href="/games/'+game.id+'/">'),'hub links to '+game.id);
}
const home=read('site/index.html');
ok(home.includes('id="brain-games"'),'homepage has brain game promo');
ok(home.includes('href="/games/"'),'homepage links to game hub');
const stylesheet=read('site/assets/brain-games.css');
ok(stylesheet.includes('@media(max-width:520px)'),'responsive mobile play layout');
ok(stylesheet.includes('brain-verify'),'wrong answer verification UI is styled');
const script=read('site/assets/brain-games.mjs');
ok(script.includes('gradeAnswer(puzzle,response)'),'game grades submitted answers');
ok(script.includes("correct?'LEVEL CLEARED':'LEARNING OPPORTUNITY'"),'wrong answers show teaching outcome');
ok(script.includes('puzzle.verifyGuide'),'shows calculator usage instructions');
ok(script.includes('puzzle.verifyInputs'),'shows exact reproduction inputs');
ok(script.includes('href="/tools/'),'opens related calculator');
ok(script.includes('localStorage.setItem'),'best score locally retained');
ok(!script.includes('fetch('),'game needs no cloud service or network fetch');
const sitemap=read('site/sitemap.xml');
eq((sitemap.match(/<loc>/g)||[]).length,345,'326 old canonical URLs plus 19 new indexable games pages');
ok(sitemap.includes('https://axiomatlas.netlify.app/games/prime-detective/'),'discoverable game URL');
console.log('Brain Lab QA passed: '+checked+' independently verified puzzles, 18 games, 9 categories, '+assertions+' assertions.');
