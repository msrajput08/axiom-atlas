/**
 * Twenty educational, progressively challenging puzzle mechanisms per activity.
 * Legacy single-question generators remain in games-engine.mjs; this module
 * composes their independently verified calculator outputs into distinct tasks.
 */
import {makeChallenge, seedFromText, ROUNDS, POINTS_PER_LEVEL} from './games-engine.mjs';

export const LEVEL_STAGES = Object.freeze([
  {id: 'discover', name: 'Discovery', range: [1, 5], description: 'Recognize formulas, solve and check simple claims.'},
  {id: 'apply', name: 'Application', range: [6, 10], description: 'Compare scenarios, combine results and estimate.'},
  {id: 'reason', name: 'Reasoning', range: [11, 15], description: 'Rank, analyze data and challenge assumptions.'},
  {id: 'master', name: 'Mastery', range: [16, 20], description: 'Multi-step analysis, reverse problems and a final boss.'}
]);

export const LEVEL_MECHANICS = Object.freeze([
  'First Principles', 'Answer Picker', 'Truth Test', 'Find the Error', 'Missing Result',
  'Scenario Duel', 'Difference Detective', 'Combined Outcome', 'Average Challenge', 'Quick Estimate',
  'Ranking Puzzle', 'Middle Value', 'Range Finder', 'Percent Error Audit', 'Threshold Decision',
  'Weighted Challenge', 'Ratio Quest', 'Three-Step Chain', 'Team Showdown', 'Final Boss'
]);

export const SPECIAL_MECHANICS = Object.freeze({
  'prime-detective': Object.freeze([
    'Prime Spotter','Composite Catch','Prime Classifier','Smallest Prime','Factor Match',
    'Prime Counter','Prime Gap','Prime Sum','Next Prime','Factor Finder',
    'Interval Count','Twin-Prime Test','Largest Prime','Divisor Count','Prime Square',
    'Three-Prime Sum','Semiprime Product','Prime Census','Divisor Detective','Prime Final Boss'
  ]),
  'quadratic-code': Object.freeze([
    'Root Pair','Discriminant','Root Sum','Root Product','Larger Root',
    'Sign Detective','Vertex X','Vertex Y','Smaller Root','Root Distance',
    'f(0) Check','f(1) Check','Factor Match','Constant Finder','Coefficient Finder',
    'Symmetry Axis','Squares Sum','Gap Squared','Polynomial Audit','Discriminant Boss'
  ])
});
export function mechanicForGame(gameId, level) {
  if (!Number.isInteger(level) || level<1 || level>ROUNDS) throw RangeError('Invalid level');
  return (SPECIAL_MECHANICS[gameId] || LEVEL_MECHANICS)[level-1];
}

const fmt = x => Number(x).toLocaleString('en-US', {maximumFractionDigits: 8});
const safe = x => String(x);
const stageOf = level => LEVEL_STAGES[Math.floor((level-1)/5)];
const numeric = (prompt, answer, unit, explanation, extra = {}) => ({
  mode:'number', prompt, answer, unit, explanation, ...extra
});
const choices = (prompt, answer, options, explanation, extra = {}) => {
  const valid=[...new Set(options.map(String))];
  if(!valid.includes(String(answer)) || valid.length<2)
    throw Error('Puzzle choices require a correct answer and a distinct distractor');
  return {mode:'multiple-choice',prompt,answer:String(answer),options:valid,unit:'',explanation,...extra};
};
const asNumber = q => Number(q.answer);
const withPrefix = (id, q) =>
  Object.fromEntries(Object.entries(q.verifyInputs).map(([key,value])=>[id+' · '+key,value]));
const linked = (source, cases, note) => ({
  verifyInputs:Object.assign({},...cases.map(([label,problem])=>withPrefix(label,problem))),
  verifyGuide: source.verifyGuide + ' ' + note,
  symbol:source.symbol
});
function choiceNumbers(answer, seed) {
  const offset = Math.max(1,Math.ceil(Math.abs(answer)*.1));
  const vals = [answer, answer-offset, answer+offset, answer+2*offset];
  if(new Set(vals.map(String)).size!==4)throw Error('Duplicate numeric options');
  return rotate(vals.map(fmt),seed);
}
function rotate(values, seed) {
  const r=seed % values.length;
  return [...values.slice(r),...values.slice(0,r)];
}
const roundTwo = n => Math.round((n+Number.EPSILON)*100)/100;
const tags = (q,mechanic,stage,level,refs,audit) => ({
  ...q,
  level, stage:stage.name, stageId:stage.id, mechanic,
  points:POINTS_PER_LEVEL, referenceScenarios:refs,
  audit
});
function sampleSet(gameId,seed) {
  const seen=new Set();
  const a=[];
  for(let i=0;i<4;i++){
    let problem=null;
    for(let attempt=0;attempt<120;attempt++){
      const s=seedFromText(gameId+'|level-ref|'+seed+'|'+i+'|'+attempt);
      const candidate=makeChallenge(gameId,s);
      if(!seen.has(String(candidate.answer))) {problem=candidate;break;}
    }
    if(!problem)throw Error('Cannot generate distinct learning scenarios for '+gameId);
    seen.add(String(problem.answer));a.push(problem);
  }
  return a;
}
const joined = (a,b,c) => [
  'Scenario A: '+a.prompt,
  'Scenario B: '+b.prompt,
  ...(c?['Scenario C: '+c.prompt]:[])
].join(' ');
const orderedLabels = (qs) => qs.map((q,i)=>({label:String.fromCharCode(65+i),value:asNumber(q)}));
function numLevels(gameId,seed,level) {
  const stage=stageOf(level);
  const mechanic=LEVEL_MECHANICS[level-1];
  const [A,B,C,D]=sampleSet(gameId,seed);
  const a=asNumber(A),b=asNumber(B),c=asNumber(C),d=asNumber(D);
  const unit=A.unit;
  const show=x=>fmt(x)+(unit?' '+unit:'');
  const refs=[[ 'A',A ],[ 'B',B ],[ 'C',C ],[ 'D',D ]];
  const include=names=>refs.filter(([id])=>names.includes(id));
  const explain=(formula,result)=>formula+' The answer is '+show(result)+'.';
  let result, audit, active=['A'], hint=A.hint;
  switch(level) {
    case 1:
      result={...A};audit={operation:'identity',operands:[a]};break;
    case 2:
      result=choices('Choose the exact result for this challenge: '+A.prompt,fmt(a),
        choiceNumbers(a,seed), 'Calculate the original expression. '+A.explanation);
      audit={operation:'select',operands:[a]};break;
    case 3: {
      const claimed=a+(seed%2?0:Math.max(1,Math.ceil(Math.abs(a)*.15)));
      const truth=claimed===a;
      result=choices(A.prompt+' A student claims the answer is '+show(claimed)+'. Is the claim correct?',
        truth?'True':'False',['True','False'],
        'The calculator result is '+show(a)+', so the claim '+(truth?'is correct.':'is incorrect.'));
      audit={operation:'truth',operands:[a,claimed]};break;
    }
    case 4: {
      const offset=Math.max(1,Math.ceil(Math.abs(a)*.1));
      const reported=a+offset;
      result=numeric(A.prompt+' A worked answer reports '+show(reported)+
        '. How large is the absolute error?',offset,unit,
        'Absolute error is |reported − actual|. |'+fmt(reported)+' − '+fmt(a)+'| = '+fmt(offset)+'.');
      audit={operation:'absolute-error',operands:[a,reported]};break;
    }
    case 5: {
      const k=2+(seed%7),reported=a+k;
      result=numeric(A.prompt+' A display reads '+show(reported)+' after an extra '+show(k)+' was accidentally added. What was the correct original result?',a,unit,
        'Reverse the added offset: '+fmt(reported)+' − '+fmt(k)+' = '+fmt(a)+'.');
      audit={operation:'reverse-offset',operands:[reported,k]};break;
    }
    case 6: {
      active=['A','B'];const answer=a>b?'A':'B';
      result=choices(joined(A,B)+' Which scenario produces the larger numerical output?',
        answer,['A','B'],explain('Compare '+show(a)+' (A) with '+show(b)+' (B).',Math.max(a,b)));
      audit={operation:'argmax2',operands:[a,b]};break;
    }
    case 7:
      active=['A','B'];
      result=numeric(joined(A,B)+' Find the absolute difference between the two results.',
        Math.abs(a-b),unit,explain('|'+fmt(a)+' − ('+fmt(b)+')| = '+fmt(Math.abs(a-b))+'.',Math.abs(a-b)));
      audit={operation:'difference',operands:[a,b]};break;
    case 8:
      active=['A','B'];result=numeric(joined(A,B)+' Add both computed outcomes.',
        a+b,unit,explain('Outcome A + Outcome B = '+fmt(a)+' + ('+fmt(b)+') = '+fmt(a+b)+'.',a+b));
      audit={operation:'sum2',operands:[a,b]};break;
    case 9:
      active=['A','B'];result=numeric(joined(A,B)+' What is the arithmetic average of the two results?',
        (a+b)/2,unit,explain('Average = (A + B)/2 = ('+fmt(a)+' + '+fmt(b)+')/2.',(a+b)/2));
      audit={operation:'mean2',operands:[a,b]};break;
    case 10: {
      const step=Math.max(1,10**Math.floor(Math.log10(Math.max(1,Math.abs(a))))/10);
      const rounded=Math.round(a/step)*step;
      const options=rotate([rounded-step,rounded,rounded+step,rounded+2*step].map(fmt),seed);
      result=choices(A.prompt+' Which estimate is closest to the actual output? (Rounding to the nearest '+fmt(step)+')',
        fmt(rounded),options,explain('Calculate '+show(a)+' and round it to the specified step.',rounded));
      audit={operation:'nearest-step',operands:[a,step]};break;
    }
    case 11: {
      active=['A','B','C'];
      const values=[a,b,c].map((value,i)=>({value,id:String.fromCharCode(65+i)}));
      const correct=[...values].sort((x,y)=>x.value-y.value).map(x=>x.id).join(' < ');
      const variants=[correct,...[
        [...values].sort((x,y)=>y.value-x.value).map(x=>x.id).join(' < '),
        [correct.split(' < ')[1],correct.split(' < ')[0],correct.split(' < ')[2]].join(' < '),
        [correct.split(' < ')[0],correct.split(' < ')[2],correct.split(' < ')[1]].join(' < ')
      ]];
      result=choices(joined(A,B,C)+' Order the outcomes from smallest to largest.',
        correct,rotate(variants,seed),
        'Compare all three computed outputs: A='+show(a)+', B='+show(b)+', C='+show(c)+'. Ascending order is '+correct+'.');
      audit={operation:'rank3',operands:[a,b,c]};break;
    }
    case 12: {
      active=['A','B','C'];
      const median=[a,b,c].sort((x,y)=>x-y)[1];
      result=numeric(joined(A,B,C)+' Find the middle (median) result.',
        median,unit,explain('Sort A, B and C numerically, then choose the middle output.',median));
      audit={operation:'median3',operands:[a,b,c]};break;
    }
    case 13: {
      active=['A','B','C'];const range=Math.max(a,b,c)-Math.min(a,b,c);
      result=numeric(joined(A,B,C)+' Compute the range between the largest and smallest outputs.',
        range,unit,explain('Range = max(A,B,C) − min(A,B,C) = '+fmt(range)+'.',range));
      audit={operation:'range3',operands:[a,b,c]};break;
    }
    case 14: {
      const actual=a===0?Math.abs(b):a;
      const mis=actual+Math.max(1,Math.ceil(Math.abs(actual)*.07));
      const pct=roundTwo(Math.abs(mis-actual)/Math.abs(actual)*100);
      active=a===0?['B']:['A'];
      result=numeric((a===0?B:A).prompt+' A student reports '+show(mis)+
        ' instead of the correct result. What is the absolute percentage error? Round to 2 decimal places.',
        pct,'%',explain('Error percentage = |reported−actual|/|actual| × 100.',pct));
      audit={operation:'percent-error',operands:[actual,mis]};break;
    }
    case 15: {
      active=['A','B','C'];
      const claim=a>b+c;
      result=choices(joined(A,B,C)+' Is result A greater than the sum of B and C?',
        claim?'Yes':'No',['Yes','No'],
        'A = '+show(a)+'; B + C = '+show(b+c)+'. Therefore the answer is '+(claim?'Yes.':'No.'));
      audit={operation:'threshold',operands:[a,b,c]};break;
    }
    case 16:
      active=['A','B'];
      result=numeric(joined(A,B)+' A is counted twice and B once. Find their total weighted outcome.',
        2*a+b,unit,explain('2 × A + B = 2×'+fmt(a)+' + '+fmt(b)+'.',2*a+b));
      audit={operation:'weighted',operands:[a,b]};break;
    case 17: {
      const denomName=b!==0?'B':(c!==0?'C':'D');
      const denom=b!==0?b:(c!==0?c:d);
      active=['A',denomName];
      const pct=roundTwo(a/denom*100);
      result=numeric(joined(A,denomName==='B'?B:denomName==='C'?C:D)+' A is what percentage of '+denomName+'? Round to 2 decimal places.',
        pct,'%',explain('Compute (A/'+denomName+') × 100 = ('+fmt(a)+'/'+fmt(denom)+') × 100.',pct));
      audit={operation:'ratio-percent',operands:[a,denom]};break;
    }
    case 18:
      active=['A','B','C'];
      result=numeric(joined(A,B,C)+' Complete the chain: result A plus result B minus result C.',
        a+b-c,unit,explain('A + B − C = '+fmt(a)+' + '+fmt(b)+' − '+fmt(c)+'.',a+b-c));
      audit={operation:'chain3',operands:[a,b,c]};break;
    case 19: {
      active=['A','B','C','D'];
      const ab=a+b,cd=c+d,choice=ab>cd?'A + B':ab<cd?'C + D':'Equal';
      result=choices(joined(A,B,C)+' Scenario D: '+D.prompt+
        ' Which team gives the higher combined output?',
        choice,['A + B','C + D','Equal'],
        'Compare A + B = '+show(ab)+' with C + D = '+show(cd)+'. The larger group is '+choice+'.');
      audit={operation:'team-showdown',operands:[a,b,c,d]};break;
    }
    case 20:
      active=['A','B','C','D'];result=numeric(joined(A,B,C)+' Scenario D: '+D.prompt+
        ' Final boss: calculate A + 2×B − C + D, showing the combined result.',
        a+2*b-c+d,unit,explain('A + 2B − C + D = '+fmt(a)+' + 2×'+fmt(b)+' − '+fmt(c)+' + '+fmt(d)+'.',a+2*b-c+d));
      audit={operation:'boss4',operands:[a,b,c,d]};break;
    default:throw Error('Unknown level '+level);
  }
  return tags({
    hint:level===1?hint:'Calculate the linked scenarios individually before applying the '+mechanic.toLowerCase()+' rule.',
    ...linked(A,include(active),'Compute each named scenario separately, then apply the level instruction.'),
    ...result
  },mechanic,stage,level,include(active),audit);
}

const isPrime = n => {
  if(!Number.isInteger(n) || n<2)return false;
  for(let d=2;d*d<=n;d++)if(n%d===0)return false;
  return true;
};
const distinctNums = (...values) => [...new Set(values)];
function primeLevels(seed,level) {
  const rand = seedFromText(seed+'|prime-level-'+level);
  const primes=[11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97];
  const comps=[15,21,25,27,33,35,39,49,51,55,57,63,65,69,77,81,85,87,91,95];
  const p=primes[rand%primes.length];
  const p2=primes[(rand+3+level)%primes.length];
  const p3=primes[(rand+7+level)%primes.length];
  const c=comps[(rand+level)%comps.length];
  const options=rotate([safe(p),safe(c),safe(comps[(rand+2)%comps.length]),safe(comps[(rand+4)%comps.length])],rand);
  const verify=(nums,description)=>({
    verifyInputs:Object.fromEntries(nums.map((n,i)=>['Number '+(i+1),n])),
    verifyGuide:'Enter each listed number separately in Prime Number Checker. '+description,
    symbol:'∑',
    referenceScenarios:nums.map(n=>({verifyInputs:{'Integer n':n},answer:n}))
  });
  const plain=(prompt,ans,exp,nums,extras={})=>({...numeric(prompt,ans,'',exp,extras),...verify(nums,'Check divisors, factors and prime classification.')});
  const choose=(prompt,ans,opts,exp,nums)=>({...choices(prompt,ans,opts,exp),...verify(nums,'Check which choices satisfy the rule.')});
  const truth = x => isPrime(x)?'Prime':'Composite';
  const cdiv=Array.from({length:c-1},(_,i)=>i+2).find(d=>c%d===0);
  const divisors = n => Array.from({length:n},(_,i)=>i+1).filter(d=>n%d===0).length;
  let q;const nums=[p,p2,p3,c];
  switch(level){
    case 1:q=choose('One of these is a prime number. Select it.',safe(p),options,'A prime has no positive divisors other than 1 and itself. '+p+' meets this rule.',[p,c,...options.slice(1).map(Number)]);break;
    case 2:q=choose('Which of these four numbers is composite?',safe(c),rotate([safe(c),...distinctNums(p,p2,p3,primes[(rand+12)%21]).slice(0,3).map(String)],rand),
      'A composite integer has more than two positive divisors. '+c+' is divisible by '+cdiv+'.',nums);break;
    case 3:q=choose('Is '+p+' prime or composite?',truth(p),['Prime','Composite'],'Trial division shows '+p+' has exactly two positive divisors.',[p]);break;
    case 4: {const pool=distinctNums(p,p2,p3).sort((a,b)=>a-b);q=choose('Which candidate is the smallest prime?',safe(pool[0]),rotate(pool.map(String),rand),
      'Check each candidate for divisibility; the smallest valid prime is '+pool[0]+'.',pool);break;}
    case 5:q=choose('Which number has the factor '+cdiv+'?',safe(c),rotate([safe(c),...distinctNums(p,p2,p3).slice(0,3).map(String)],rand),
      c+' is divisible by '+cdiv+' but the other listed primes are not.',[c,p,p2,p3]);break;
    case 6:q=plain('Among '+nums.join(', ')+', how many entries are prime?',nums.filter(isPrime).length,
      'Test each value for factors, count the ones with exactly two positive divisors.',nums);break;
    case 7:q=plain('Find the absolute distance between prime numbers '+p+' and '+p2+'.',Math.abs(p-p2),
      'The gap is the absolute difference |'+p+' − '+p2+'| = '+Math.abs(p-p2)+'.',[p,p2]);break;
    case 8:q=plain('Add the prime pair '+p+' and '+p2+'. What is the total?',p+p2,
      'Both numbers are prime. Their sum is '+p+' + '+p2+' = '+(p+p2)+'.',[p,p2]);break;
    case 9: {let next=p+1;while(!isPrime(next))next++;q=plain('What is the first prime strictly greater than '+p+'?',next,
      'Test each larger integer for divisibility; the next prime is '+next+'.',[p,next]);break;}
    case 10: {
      const distractors=primes.filter(t=>c%t!==0).slice(rand%8,(rand%8)+3);
      q=choose('Which of these is a genuine factor of '+c+'?',safe(cdiv),
        rotate([safe(cdiv),...distractors.map(String)],rand),
        c+' is divisible by '+cdiv+' but every other offered choice leaves a remainder.',[c,cdiv,...distractors]);break;
    }
    case 11: {const lo=Math.min(p,p2),hi=Math.max(p,p2);const count=Array.from({length:hi-lo+1},(_,i)=>lo+i).filter(isPrime).length;
      q=plain('How many primes are between '+lo+' and '+hi+', including both endpoints?',count,
      'Count each integer in the inclusive interval only when it has exactly two factors.',[lo,hi]);break;}
    case 12:q=choose('Do '+p+' and '+(p+2)+' form a twin-prime pair?',isPrime(p+2)?'Yes':'No',['Yes','No'],
      'Twin primes must both be prime and differ by 2. '+(p+2)+(isPrime(p+2)?' is prime.':' is not prime.'),[p,p+2]);break;
    case 13: {const pool=distinctNums(p,p2,p3);q=choose('Which listed prime is the largest?',safe(Math.max(...pool)),rotate(pool.map(String),rand),
      'Compare the prime values after verifying that each has exactly two divisors.',pool);break;}
    case 14:q=plain('How many positive divisors does '+c+' have?',divisors(c),
      'List divisors of '+c+' or use its prime-power factorization and multiply exponent-plus-one factors.',[c]);break;
    case 15:q=plain('For the square of the prime '+p+', how many positive divisors are there?',3,
      'The number '+p+'² has divisors 1, '+p+' and '+p+'², so exactly three.',[p,p*p]);break;
    case 16:q=plain('What is the sum of the three listed primes '+p+', '+p2+' and '+p3+'?',p+p2+p3,
      'Individually verify each prime, then add '+p+' + '+p2+' + '+p3+' = '+(p+p2+p3)+'.',[p,p2,p3]);break;
    case 17:q=plain('A semiprime is the product of two primes. What is '+p+' × '+p2+'?',p*p2,
      'Verify both factors are prime. Their product '+p+' × '+p2+' = '+(p*p2)+'.',[p,p2,p*p2]);break;
    case 18: {const max=Math.min(110,p+17),count=Array.from({length:max},(_,i)=>i+1).filter(isPrime).length;
      q=plain('Count all prime numbers from 1 through '+max+' (inclusive).',count,
      'Test integers 2 through '+max+'; 1 is neither prime nor composite.',[max]);break;}
    case 19: {const set=[p,c,p2,comps[(rand+3)%comps.length]];q=plain('How many numbers in '+set.join(', ')+' have exactly two positive divisors?',
      set.filter(isPrime).length,'Exactly two divisors means prime; check each entry independently.',set);break;}
    case 20: {const set=[p,p2,c,comps[(rand+2)%comps.length],p3];q=plain('Final boss: sum only the prime numbers in '+set.join(', ')+'.',
      set.filter(isPrime).reduce((acc,n)=>acc+n,0),
      'Filter the list by primality before summing. The composite distractors do not count.',set);break;}
    default:throw Error('Invalid level');
  }
  return tags({...q,unit:q.unit||'',hint:'Check divisibility from 2 up to the square root, then combine only numbers that satisfy the rule.'},
    mechanicForGame('prime-detective',level),stageOf(level),level,q.referenceScenarios||[],{operation:'prime-'+level,operands:q.verifyInputs});
}

const rootPair = (a,b) => '('+[a,b].sort((x,y)=>x-y).join(', ')+')';
function quadraticLevels(seed,level) {
  const k=seedFromText('quad|'+seed+'|'+level);
  let r1=(k%11)-5, r2=(Math.floor(k/19)%11)-5;
  if(r1===r2)r2+=2;
  const a=1,b=-(r1+r2),c=r1*r2;
  const x=3+(k%4),disc=b*b-4*a*c,lo=Math.min(r1,r2),hi=Math.max(r1,r2);
  const vi={'a':a,'b':b,'c':c};
  const link={
    verifyInputs:vi,
    verifyGuide:'Enter a, b, c in the Quadratic Equation Solver; compare its real roots, discriminant and vertex with the requested property.',
    symbol:'x²',
    referenceScenarios:[{answer:rootPair(r1,r2),verifyInputs:vi}]
  };
  const eq='x² '+(b<0?'− '+(-b):'+ '+b)+'x '+(c<0?'− '+(-c):'+ '+c)+' = 0';
  const expr='f(x) = x² '+(b<0?'− '+(-b):'+ '+b)+'x '+(c<0?'− '+(-c):'+ '+c);
  const explain='The roots '+r1+' and '+r2+' give b = −('+r1+' + '+r2+') = '+b+' and c = '+r1+'×'+r2+' = '+c+'. ';
  const n=(text,ans,exp,unit='')=>({...numeric(text,ans,unit,explain+exp),...link});
  const choose=(text,ans,opts,exp)=>({...choices(text,ans,opts,explain+exp),...link});
  let q;
  switch(level){
    case 1:q=choose('Solve '+eq+'. Which root pair is correct?',rootPair(r1,r2),
      [rootPair(r1,r2),rootPair(r1+1,r2),rootPair(r1,r2+1),rootPair(r1+2,r2+2)],
      'Set each linear factor to zero to recover both roots.');break;
    case 2:q=n('For '+eq+', calculate the discriminant Δ = b² − 4ac.',disc,
      'The discriminant is '+b+'²−4×1×('+c+') = '+disc+'.');break;
    case 3:q=n('For '+eq+', what is the sum of the two roots?',r1+r2,
      'The root sum is −b/a = '+(-b)+'.');break;
    case 4:q=n('For '+eq+', what is the product of the two roots?',r1*r2,
      'The root product is c/a = '+c+'.');break;
    case 5:q=n('For '+eq+', find the larger root.',hi,
      'Compare the two real roots and select '+hi+'.');break;
    case 6:q=choose('For '+eq+', are the two real roots equal, both positive, both negative or of mixed sign?',
      r1*r2<0?'Mixed sign':(r1>0&&r2>0?'Both positive':(r1<0&&r2<0?'Both negative':'One root is zero')),
      ['Mixed sign','Both positive','Both negative','One root is zero'],
      'Classify '+r1+' and '+r2+' by sign.');break;
    case 7:q=n('For '+eq+', find the x-coordinate of its parabola vertex.',-b/(2*a),
      'The vertex x-coordinate is −b/(2a) = '+(-b)+'/2.');break;
    case 8:q=n('What is the y-coordinate of the vertex of '+expr+'?',c-b*b/(4*a),
      'Evaluate f(−b/2a) = c − b²/(4a) = '+(c-b*b/4)+'.');break;
    case 9:q=n('For '+eq+', determine the smaller root.',lo,'Compare roots and choose '+lo+'.');break;
    case 10:q=n('What is the distance between the two real roots of '+eq+'?',hi-lo,
      'Absolute root gap = |'+hi+' − '+lo+'| = '+(hi-lo)+'.');break;
    case 11:q=n('What is '+expr+' when x = 0?',c,'Substitute x = 0; f(0) equals the constant term '+c+'.');break;
    case 12:q=n('Calculate '+expr+' when x = 1.',1+b+c,'f(1)=1+'+b+'+'+c+' = '+(1+b+c)+'.');break;
    case 13:q=choose('Which factorization matches '+eq+'?', 
      '(x−('+r1+'))(x−('+r2+'))',
      ['(x−('+r1+'))(x−('+r2+'))','(x+('+r1+'))(x+('+r2+'))',
       '(x−('+(r1+1)+'))(x−('+r2+'))','(x−('+r1+'))(x−('+(r2+1)+'))'],
      'Expand (x−r₁)(x−r₂) to verify coefficients.');break;
    case 14:q=n('A monic quadratic has roots '+r1+' and '+r2+'. What is its constant c?',c,
      'The constant is the product of the roots: '+r1+' × '+r2+'.');break;
    case 15:q=n('A monic quadratic has roots '+r1+' and '+r2+'. What is its coefficient of x?',b,
      'Coefficient b is minus the root sum: −('+r1+' + '+r2+') = '+b+'.');break;
    case 16:q=n('For '+eq+', find the axis of symmetry x = −b/(2a).',-b/2,
      'The axis of symmetry passes through the vertex x = '+(-b/2)+'.');break;
    case 17:q=n('For '+eq+', compute the sum of squares of its two roots.',r1*r1+r2*r2,
      'r₁² + r₂² = '+r1+'² + '+r2+'² = '+(r1*r1+r2*r2)+'.');break;
    case 18:q=n('For '+eq+', find the square of the difference between its roots.',(r1-r2)**2,
      '(r₁−r₂)² = '+(r1-r2)+'² = '+((r1-r2)**2)+'.');break;
    case 19:q=n('Audit '+expr+'. What is f('+x+')?',x*x+b*x+c,
      'Substitute x='+x+': '+x+'² + ('+b+')×'+x+' + ('+c+') = '+(x*x+b*x+c)+'.');break;
    case 20:q=n('Final boss: using the same two roots, a new quadratic has leading coefficient 2. What is its discriminant?',
      4*(r1-r2)**2,'For leading coefficient a=2, Δ = a²(r₁−r₂)² = 4×'+((r1-r2)**2)+'.');break;
    default:throw Error('Invalid level');
  }
  // The first 19 levels verify the displayed monic quadratic; level 20 has a=2.
  if(level===20) {
    q.verifyInputs={'a':2,'b':2*b,'c':2*c};
  }
  return tags({...q,hint:'Use the sum and product of roots, the discriminant or f(x), depending on the task.'},
    mechanicForGame('quadratic-code',level),stageOf(level),level,q.referenceScenarios||[],
    {operation:'quadratic-'+level,operands:{r1,r2,a,b,c,x}});
}

export function makeLevelChallenge(gameId, seed, level) {
  if(!Number.isInteger(level) || level<1 || level>ROUNDS)
    throw RangeError('Level must be an integer between 1 and '+ROUNDS);
  if(gameId==='prime-detective')return primeLevels(seed,level);
  if(gameId==='quadratic-code')return quadraticLevels(seed,level);
  return numLevels(gameId,seed,level);
}
