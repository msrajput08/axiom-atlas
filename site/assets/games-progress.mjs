/**
 * Pure, offline-only campaign progress helpers. No network or global storage.
 * Unlocks follow completed attempts, while marks accrue only for correct solves.
 */
import {ROUNDS, POINTS_PER_LEVEL} from './games-engine.mjs';

export function createProgress() {
  return {version:2,unlocked:1,awards:Array(ROUNDS).fill(0),attempted:Array(ROUNDS).fill(false)};
}
export function normalizeProgress(data) {
  const safe=createProgress();
  if (!data || data.version!==2 || !Array.isArray(data.awards) || !Array.isArray(data.attempted))
    return safe;
  for (let i=0;i<ROUNDS;i++) {
    safe.awards[i]=data.awards[i]===POINTS_PER_LEVEL?POINTS_PER_LEVEL:0;
    safe.attempted[i]=data.attempted[i]===true || safe.awards[i]===POINTS_PER_LEVEL;
  }
  const marked=safe.attempted.reduce((max,yes,i)=>yes?Math.max(max,i+2):max,1);
  const unlocked=Number.isInteger(data.unlocked)?data.unlocked:1;
  safe.unlocked=Math.min(ROUNDS,Math.max(1,marked,unlocked));
  return safe;
}
export function totalMarks(progress) {
  const p=normalizeProgress(progress);
  return p.awards.reduce((sum,value)=>sum+value,0);
}
export function recordAttempt(progress, level, correct) {
  if (!Number.isInteger(level) || level<1 || level>ROUNDS)
    throw RangeError('Invalid level number');
  const next=normalizeProgress(progress);
  if(level>next.unlocked)throw RangeError('Cannot attempt a locked level');
  next.attempted[level-1]=true;
  if(correct===true)next.awards[level-1]=POINTS_PER_LEVEL;
  next.unlocked=Math.min(ROUNDS,Math.max(next.unlocked,level+1));
  return next;
}
