import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROUNDS,POINTS_PER_LEVEL,seedFromText,roundSeed,gradeAnswer,formatAnswer} from '../site/assets/games-engine.mjs';
import {LEVEL_STAGES,LEVEL_MECHANICS,makeLevelChallenge,mechanicForGame,SPECIAL_MECHANICS} from '../site/assets/games-levels.mjs';
import {createProgress,normalizeProgress,recordAttempt,totalMarks} from '../site/assets/games-progress.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const catalog=JSON.parse(read('site/assets/brain-games-catalog.json'));
let assertions=0, puzzles=0;
const check=(actual,expected,reason)=>{assert.deepEqual(actual,expected,reason);assertions++;};
const ok=(value,reason)=>{assert.ok(value,reason);assertions++;};
const approx=(a,b,reason)=>{ok(Number.isFinite(Number(a))&&Number.isFinite(Number(b)),reason+' finite');ok(Math.abs(Number(a)-Number(b))<=Math.max(1e-8,Math.abs(Number(b))*1e-9),reason+' expected '+b+' received '+a);};
const isPrime=n=>{if(!Number.isInteger(n)||n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true;};
const divisors=n=>Array.from({length:n},(_,i)=>i+1).filter(x=>n%x===0).length;
const fmt=x=>Number(x).toLocaleString('en-US',{maximumFractionDigits:8});
const round2=x=>Math.round((x+Number.EPSILON)*100)/100;

check(ROUNDS,20,'Each activity has exactly 20 levels');
check(POINTS_PER_LEVEL,5,'Five marks per correctly solved level');
check(ROUNDS*POINTS_PER_LEVEL,100,'100 marks possible per activity');
check(LEVEL_MECHANICS.length,20,'Distinct mechanic defined for every level');
check(new Set(LEVEL_MECHANICS).size,20,'Unique mechanic names');
check(LEVEL_STAGES.length,4,'Four stages in the progression');
for(let i=0;i<4;i++){
  check(LEVEL_STAGES[i].range[0],i*5+1,'Stage starts correctly');
  check(LEVEL_STAGES[i].range[1],i*5+5,'Stage ends correctly');
}

const fresh=createProgress();
check(fresh.unlocked,1,'Only level 1 unlocked at start');
check(totalMarks(fresh),0,'New progress has 0 marks');
check(fresh.awards.length,20,'Twenty level scores');
check(fresh.attempted.length,20,'Twenty completion indicators');
assert.throws(()=>recordAttempt(fresh,2,true),RangeError,'Cannot jump to locked level');
assert.throws(()=>recordAttempt(fresh,0,true),RangeError,'Cannot attempt level zero');
assert.throws(()=>makeLevelChallenge('prime-detective',1,21),RangeError,'Invalid generator level');
let p=recordAttempt(fresh,1,false);
check(p.unlocked,2,'A wrong attempt still unlocks the next level');
check(p.awards[0],0,'Wrong answer earns zero marks');
check(p.attempted[0],true,'Wrong level marked attempted');
p=recordAttempt(p,1,true);
check(p.awards[0],5,'Retrying successfully earns five marks');
check(totalMarks(p),5,'Campaign tally uses best per-level award');
p=recordAttempt(p,1,false);
check(totalMarks(p),5,'Replaying wrong does not remove an earned mark');
for(let level=2;level<=20;level++)p=recordAttempt(p,level,true);
check(totalMarks(p),100,'Full campaign has 100 marks');
check(p.unlocked,20,'Level 20 is the final unlock');
check(normalizeProgress({version:2,unlocked:50,awards:[99,-1],attempted:[]}).unlocked,20,'Corrupt unlock clamped');
check(totalMarks(normalizeProgress({version:2,unlocked:5,awards:Array(20).fill(9999),attempted:[]})),0,'Only five marks allowed per level');
check(totalMarks(normalizeProgress(null)),0,'Corrupted local storage fails safely');
check(totalMarks(fresh),0,'Original progress never mutated');

function independentlyCheckNumber(q) {
  const audit=q.audit;
  const values=audit.operands;
  const [a,b,c,d]=values;
  let expected;
  switch(audit.operation) {
    case 'identity':case 'select':expected=a;break;
    case 'truth':check(q.answer,b===a?'True':'False','True/false based on calculation');return;
    case 'absolute-error':expected=Math.abs(b-a);break;
    case 'reverse-offset':expected=a-b;break;
    case 'argmax2':check(q.answer,a>b?'A':'B','Larger scenario');return;
    case 'difference':expected=Math.abs(a-b);break;
    case 'sum2':expected=a+b;break;
    case 'mean2':expected=(a+b)/2;break;
    case 'nearest-step':check(q.answer,fmt(Math.round(a/b)*b),'Rounded result');return;
    case 'rank3':check(q.answer,[a,b,c].map((v,i)=>({v,id:String.fromCharCode(65+i)})).sort((x,y)=>x.v-y.v).map(x=>x.id).join(' < '),'Ascending rank');return;
    case 'median3':expected=[a,b,c].sort((x,y)=>x-y)[1];break;
    case 'range3':expected=Math.max(a,b,c)-Math.min(a,b,c);break;
    case 'percent-error':expected=round2(Math.abs(b-a)/Math.abs(a)*100);break;
    case 'threshold':check(q.answer,a>b+c?'Yes':'No','Threshold condition');return;
    case 'weighted':expected=2*a+b;break;
    case 'ratio-percent':expected=round2(a/b*100);break;
    case 'chain3':expected=a+b-c;break;
    case 'team-showdown':check(q.answer,a+b>c+d?'A + B':a+b<c+d?'C + D':'Equal','Team outcome');return;
    case 'boss4':expected=a+2*b-c+d;break;
    default:throw Error('Unexpected general level mechanic '+audit.operation);
  }
  if(q.mode==='number')approx(q.answer,expected,audit.operation);
  else approx(Number(q.answer.replaceAll(',','')),expected,audit.operation);
}
function independentlyCheckPrime(q,level){
  const nums=Object.values(q.verifyInputs).map(Number);
  const p=Number(q.answer);
  const primes=nums.filter(isPrime);
  switch(level) {
    case 1:ok(isPrime(p),'Prime answer really prime');break;
    case 2:ok(!isPrime(p),'Composite answer really composite');break;
    case 3:check(q.answer,isPrime(nums[0])?'Prime':'Composite','Prime classification');break;
    case 4:check(p,Math.min(...nums),'Smallest prime');ok(nums.every(isPrime),'All candidates prime');break;
    case 5:ok(nums[0]%p===0,'Chosen candidate is a factor');break;
    case 6:check(p,primes.length,'Prime count among values');break;
    case 7:check(p,Math.abs(nums[0]-nums[1]),'Prime difference');break;
    case 8:check(p,nums[0]+nums[1],'Prime sum');break;
    case 9:ok(isPrime(p),'Next result prime');ok(p>nums[0],'Next is strictly larger');
      for(let n=nums[0]+1;n<p;n++)ok(!isPrime(n),'No skipped prime');break;
    case 10:ok(nums[0]%p===0,'Actual factor chosen');
      ok(nums.slice(2).every(x=>nums[0]%x!==0),'All distractors are non-factors');break;
    case 11:{let count=0;for(let n=nums[0];n<=nums[1];n++)if(isPrime(n))count++;check(p,count,'Inclusive interval prime count');break;}
    case 12:check(q.answer,isPrime(nums[1])?'Yes':'No','Twin-prime classification');break;
    case 13:check(p,Math.max(...nums),'Largest prime');break;
    case 14:check(p,divisors(nums[0]),'Positive divisor count');break;
    case 15:check(p,divisors(nums[1]),'Prime square divisor count');break;
    case 16:check(p,nums.reduce((a,b)=>a+b,0),'Three prime sum');break;
    case 17:check(p,nums[0]*nums[1],'Semiprime product');break;
    case 18:{let count=0;for(let n=1;n<=nums[0];n++)if(isPrime(n))count++;check(p,count,'Prime counting function');break;}
    case 19:check(p,primes.length,'Two-divisor count');break;
    case 20:check(p,primes.reduce((a,b)=>a+b,0),'Prime-only boss sum');break;
    default:throw Error('Unknown prime level');
  }
}
function independentlyCheckQuadratic(q,level){
  const {r1,r2,a,b,c,x}=q.audit.operands;
  check(a,1,'Original quadratic is monic');
  check(-(r1+r2),b,'Vieta sum');
  check(r1*r2,c,'Vieta product');
  let expected;
  switch(level){
    case 1: expected='('+[r1,r2].sort((m,n)=>m-n).join(', ')+')';break;
    case 2:expected=b*b-4*c;break;
    case 3:expected=r1+r2;break;
    case 4:expected=r1*r2;break;
    case 5:expected=Math.max(r1,r2);break;
    case 6:expected=r1*r2<0?'Mixed sign':(r1>0&&r2>0?'Both positive':(r1<0&&r2<0?'Both negative':'One root is zero'));break;
    case 7:case 16:expected=-b/2;break;
    case 8:expected=c-b*b/4;break;
    case 9:expected=Math.min(r1,r2);break;
    case 10:expected=Math.abs(r1-r2);break;
    case 11:expected=c;break;
    case 12:expected=1+b+c;break;
    case 13:expected='(x−('+r1+'))(x−('+r2+'))';break;
    case 14:expected=c;break;
    case 15:expected=b;break;
    case 17:expected=r1*r1+r2*r2;break;
    case 18:expected=(r1-r2)**2;break;
    case 19:expected=x*x+b*x+c;break;
    case 20:expected=4*(r1-r2)**2;check(q.verifyInputs.a,2,'Boss verifies scaled equation');break;
    default:throw Error('Unknown quadratic level');
  }
  if(typeof expected==='number')approx(q.answer,expected,'Quadratic level '+level);
  else check(q.answer,expected,'Quadratic response');
}
const seedCount=18;
for(const g of catalog.games){
  const mechanics=new Set();
  const stageSet=new Set();
  for(let level=1;level<=ROUNDS;level++){
    const special=g.id==='prime-detective'||g.id==='quadratic-code';
    for(let seed=1;seed<=seedCount;seed++){
      const id=seedFromText('20-level-audit|'+g.id+'|'+seed);
      const q=makeLevelChallenge(g.id,roundSeed(id,level-1),level);
      const q2=makeLevelChallenge(g.id,roundSeed(id,level-1),level);
      check(q,q2,'Seeded puzzles reproducible');
      check(q.level,level,'Level index preserved');
      check(q.points,5,'Per-level award');
      check(q.mechanic,mechanicForGame(g.id,level),'Mechanic matches game progression');
      check(q.stage,LEVEL_STAGES[Math.floor((level-1)/5)].name,'Correct stage');
      ok(q.prompt.length>18,'Clear question');
      ok(q.explanation.length>18,'Explained solution');
      ok(q.hint.length>12,'A useful clue');
      ok(q.verifyGuide.length>15,'Calculator verification method');
      ok(Object.keys(q.verifyInputs).length>0,'Exact calculator inputs');
      ok(gradeAnswer(q,String(q.answer)),'Exact answer accepted');
      ok(typeof formatAnswer(q)==='string'&&formatAnswer(q).length>0,'Printable result');
      if(q.mode==='multiple-choice'){
        ok(q.options.length>=2,'At least two answer options');
        check(new Set(q.options).size,q.options.length,'No duplicate answer options');
        ok(q.options.includes(String(q.answer)),'Correct option shown');
        const wrong=q.options.find(opt=>opt!==String(q.answer));
        ok(!gradeAnswer(q,wrong),'Wrong option rejected');
      }else{
        ok(Number.isFinite(Number(q.answer)),'Finite numeric answer');
        ok(!gradeAnswer(q,'Infinity'),'Reject infinity');
        ok(!gradeAnswer(q,'0x10'),'Reject hexadecimal');
        ok(!gradeAnswer(q,'hello'),'Reject arbitrary text');
        ok(!gradeAnswer(q,''),'Reject empty response');
      }
      if(g.id==='prime-detective')independentlyCheckPrime(q,level);
      else if(g.id==='quadratic-code')independentlyCheckQuadratic(q,level);
      else independentlyCheckNumber(q);
      puzzles++;
      mechanics.add(q.mechanic);stageSet.add(q.stage);
    }
  }
  check(mechanics.size,20,'All 20 unique puzzle types exist in '+g.id);
  check(stageSet.size,4,'All four progressive stages represented in '+g.id);
  const page=read('site/games/'+g.id+'/index.html');
  ok(page.includes('20 levels'),'Crawlable 20-level description for '+g.id);
  ok(page.includes('5 marks per level'),'Crawlable scoring policy for '+g.id);
  ok(page.includes('data-calculator-slug="'+g.calculatorSlug+'"'),'Calculator mapping preserved '+g.id);
}
const gameCode=read('site/assets/brain-games.mjs');
ok(gameCode.includes('makeLevelChallenge('),'Player uses progressive question engine');
ok(gameCode.includes('recordAttempt('),'Player persists each completed level');
ok(gameCode.includes("session.mode==='daily'"),'Daily 20-level mode supported');
ok(gameCode.includes("points=correct?POINTS_PER_LEVEL:0"),'Scoring is exactly five or zero');
ok(gameCode.includes("Retry this level"),'Incorrect levels can be revisited');
ok(gameCode.includes("brain-level-grid"),'Visible 20-level selector');
ok(gameCode.includes('puzzle.verifyInputs'),'Verification input values still visible');
ok(gameCode.includes('puzzle.verifyGuide'),'Verification instructions still visible');
ok(!gameCode.includes('fetch('),'No third-party API or backend');
const home=read('site/index.html');
ok(home.includes('id="brain-games"'),'Main homepage game feature remains');
const hero=home.indexOf('<section class="hero hero-split">');
const brand=home.indexOf('class="hero-copy hero-axiomatlas"');
const games=home.indexOf('class="hero-games-card" id="brain-games"');
ok(hero>=0,'Homepage starts with the AxiomAtlas primary hero');
ok(brand>hero,'AxiomAtlas content comes before Brain Lab in document order');
ok(games>brand && games<home.indexOf('</section>',hero),'Games card sits beside AxiomAtlas inside one hero');
check((home.match(/id="brain-games"/g)||[]).length,1,'Exactly one homepage Games feature');
ok(home.indexOf('<h1>',hero)>hero && home.indexOf('<h1>',hero)<games,'Calculator brand H1 precedes games secondary H2');
ok(home.includes('class="hero-games-cta" href="/games/"'),'Games card has a prominent hub CTA');
ok(home.includes('class="top-games-link" href="/games/"'),'Header exposes a shortcut to games');
for (const slug of ['prime-detective','equation-escape','energy-quest'])
  ok(home.includes('href="/games/'+slug+'/">'),'Featured game link is intact: '+slug);
ok(home.includes('360 levels in total') && home.includes('100 marks per game'),
  'Game teaser truthfully describes the latest progression');
ok(!home.includes('class="brain-front-feature"'),'Old standalone banner must not displace the calculator brand');
ok(read('site/assets/styles.css').includes('.top-games-link{display:inline-flex'),
  'Global Games navigation works on all calculator routes');
const pageCss=read('site/assets/brain-games.css');
ok(pageCss.includes('.hero.hero-split{display:grid'),'Side-by-side desktop hero has grid layout');
ok(pageCss.includes('@media(max-width:900px){.hero.hero-split{grid-template-columns:1fr'),
  'Narrow screens keep AxiomAtlas first and stack the game teaser');
ok(pageCss.includes('@media(max-width:460px)'),'Phone-specific controls remain available');
const catalogHtml=read('site/games/index.html');
ok(catalogHtml.includes('20</b> levels per game'),'Game hub describes twenty levels');
const css=read('site/assets/brain-games.css');
ok(css.includes('.brain-level-grid{'),'Responsive level grid available');
ok(css.includes('max-width:610px'),'Mobile level selector defined');

console.log('20-level Brain Lab QA passed: '+puzzles+' generated level puzzles, all 18 games × 20 mechanics, '+assertions+' assertions.');
