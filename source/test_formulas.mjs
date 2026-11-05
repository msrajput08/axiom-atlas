import fs from 'node:fs';
import {calculate, solveQuadratic,solveRoots, integrate,compile, gaussian, matrixOp,fractionOp,descriptive,convertUnit} from '../site/assets/engine.js';
let db=JSON.parse(fs.readFileSync(new URL('../site/assets/catalog.json', import.meta.url),'utf8'));
let fail=[],total=0;
for(let t of db.tools){if(t.type!=='formula')continue;let vars=Object.fromEntries(t.fields.map(f=>[f.key,Number(f.default)]));for(let o of t.outputs){total++;try{let v=calculate(o.expr,vars);if(!Number.isFinite(v))fail.push({slug:t.slug,out:o.label,v})}catch(e){fail.push({slug:t.slug,out:o.label,error:e.message})}}}
console.log('FORMULA TESTS',total,'errors',fail.length,fail.slice(0,30));
const tests=[['scientific',calculate('sin(pi/6)^2 + cos(pi/6)^2')],['linear',calculate('2*x+3',{x:4})],['quadratic',solveQuadratic(1,-5,6)],['complex',solveQuadratic(1,0,4)],['roots',solveRoots('x^2 - 5*x + 6 = 0')],['system',gaussian([[2,1],[1,2]],[[5],[6]])],['fraction',fractionOp('3/4','2/3','+')],['integral',integrate(compile('x^2'),0,3)],['converted',convertUnit('Length',1,'km','m')],['stats',descriptive([1,2,3,4,5]).Mean]];console.log(tests);
