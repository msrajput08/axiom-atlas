import {ROUNDS, POINTS_PER_LEVEL, dailySeed, seedFromText, roundSeed, gradeAnswer, formatAnswer} from './games-engine.mjs';
import {LEVEL_STAGES, mechanicForGame, makeLevelChallenge} from './games-levels.mjs';
import {createProgress, normalizeProgress, totalMarks, recordAttempt} from './games-progress.mjs';

const player = document.querySelector('#game-player');
if (player) {
  const gameId=player.dataset.gameId;
  const gameTitle=player.dataset.gameTitle;
  const calculator=player.dataset.calculatorSlug;
  const calculatorName=player.dataset.calculatorName;
  const storageKey='axiomatlas-brain-levels-v2:'+gameId;
  const maxScore=ROUNDS*POINTS_PER_LEVEL;
  let session=null, puzzle=null, selected='', answered=false, hintUsed=false;
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[c]);
  const readProgress=()=>{
    try {return normalizeProgress(JSON.parse(localStorage.getItem(storageKey)));}
    catch {return createProgress();}
  };
  const saveProgress=data=>{
    try {localStorage.setItem(storageKey,JSON.stringify(data));}catch {}
  };
  const earned=totalMarks;
  const localDay=()=>{
    const date=new Date();
    return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
  };

  const renderLevels=()=>{
    session=null; puzzle=null; selected=''; answered=false;
    const progress=readProgress();
    const stageMaps=LEVEL_STAGES.map((stage,i)=>{
      const tiles=Array.from({length:5},(_,n)=>{
        const level=i*5+n+1;
        const locked=level>progress.unlocked;
        const scored=progress.awards[level-1]===POINTS_PER_LEVEL;
        const tried=progress.attempted[level-1];
        const state=locked?'Locked':scored?'5/5':tried?'Retry':'Ready';
        return '<button type="button" class="brain-level-tile'+(locked?' is-locked':'')+
          (scored?' is-earned':'')+'" data-level="'+level+'"'+(locked?' disabled':'')+
          ' aria-label="Level '+level+', '+esc(mechanicForGame(gameId,level))+', '+state+'">' +
          '<span class="brain-level-number">'+(locked?'🔒':level)+'</span>' +
          '<span class="brain-level-name">'+esc(mechanicForGame(gameId,level))+'</span>' +
          '<span class="brain-level-award">'+state+'</span></button>';
      }).join('');
      return '<section class="brain-stage-block" aria-labelledby="brain-stage-'+i+'">' +
        '<div class="brain-stage-head"><span class="brain-stage-icon">'+(i+1)+'</span><div>'+
        '<span class="brain-kicker">STAGE '+(i+1)+' / 4</span><h3 id="brain-stage-'+i+'">'+esc(stage.name)+'</h3>'+
        '<p>'+esc(stage.description)+'</p></div></div>' +
        '<div class="brain-level-grid">'+tiles+'</div></section>';
    }).join('');
    player.innerHTML='<div class="brain-level-select"><div class="brain-level-overview">'+
      '<span class="brain-kicker">20 LEVELS · 4 STAGES · 5 POINTS EACH</span>'+
      '<h2>Build your way to 100.</h2><p>Each level changes the puzzle mechanism. Solve, compare, detect errors and tackle a final boss. Wrong answers explain the method and link to the exact calculator.</p>'+
      '<div class="brain-total-row"><span>Campaign progress <strong>'+earned(progress)+' / '+maxScore+' points</strong></span>'+
      '<span>Unlocked <strong>'+progress.unlocked+' / '+ROUNDS+'</strong></span></div>'+
      '<div class="brain-progress-track" role="progressbar" aria-label="Campaign score" aria-valuenow="'+earned(progress)+'" aria-valuemin="0" aria-valuemax="'+maxScore+'">'+
      '<span style="width:'+(earned(progress)/maxScore*100)+'%"></span></div></div>'+stageMaps+
      '<div class="brain-daily-panel"><div><span class="brain-kicker">FRESH EVERY DAY</span><h3>Daily 20-level run</h3>'+
      '<p>A repeatable set for today, separate from your campaign. Scores stay on this device; no global leaderboard.</p></div>'+
      '<button type="button" class="brain-button secondary" data-daily>Play today’s challenge ↗</button></div>'+
      '<p class="brain-fine">Unlocked progress and earned marks are saved locally in this browser. Each correct level earns exactly 5 marks, even if you use a hint. You can retry missed levels.</p>'+
      '</div>';
    player.querySelectorAll('[data-level]').forEach(button=>button.addEventListener('click',()=>begin('journey',Number(button.dataset.level))));
    player.querySelector('[data-daily]')?.addEventListener('click',()=>begin('daily',1));
  };

  const begin=(mode,level)=>{
    const campaign=readProgress();
    if(mode==='journey' && (!Number.isInteger(level) || level<1 || level>campaign.unlocked))return renderLevels();
    const day=localDay();
    session={mode,day,level,score:0,correct:0,
      seed:mode==='daily'?dailySeed(gameId,day):
        seedFromText('levels-v2|'+gameId+'|'+Date.now()+'|'+Math.random())};
    showLevel();
  };
  const banner=()=>{
    const state=readProgress();
    const score=session.mode==='daily'?session.score:earned(state);
    const label=session.mode==='daily'?'DAILY · '+esc(session.day):'CAMPAIGN MODE';
    const stage=Math.ceil(session.level/5);
    return '<div class="brain-round-top"><span>'+label+' · STAGE '+stage+'/4</span>'+
      '<strong>LEVEL '+session.level+' / '+ROUNDS+'</strong></div>'+
      '<div class="brain-progress-track" role="progressbar" aria-label="Level progress" aria-valuenow="'+session.level+
      '" aria-valuemin="1" aria-valuemax="'+ROUNDS+'"><span style="width:'+(session.level/ROUNDS*100)+'%"></span></div>'+
      '<div class="brain-score-line"><span>Earned <strong>'+score+' / '+maxScore+' marks</strong></span>'+
      '<span>5 marks per level</span></div>';
  };
  const showLevel=()=>{
    answered=false; selected='';hintUsed=false;
    puzzle=makeLevelChallenge(gameId,roundSeed(session.seed,session.level-1),session.level);
    const select=puzzle.mode==='multiple-choice'
      ? '<div class="brain-choice-grid" role="group" aria-label="Choose one answer">'+
        puzzle.options.map(opt=>'<button type="button" class="brain-choice" aria-pressed="false" data-choice="'+esc(opt)+'">'+esc(opt)+'</button>').join('')+'</div>'
      : '<form id="brain-answer-form"><label for="brain-answer">Your answer '+
        (puzzle.unit?'<span class="brain-answer-unit">('+esc(puzzle.unit)+')</span>':'')+'</label>'+
        '<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" '+
        'name="answer" id="brain-answer" placeholder="Enter a number" required></form>';
    player.innerHTML='<div class="brain-question">'+banner()+
      '<div class="brain-question-head"><span class="brain-challenge-icon" aria-hidden="true">'+esc(puzzle.symbol||'∑')+'</span>'+
      '<div><span class="brain-kicker">'+esc(puzzle.stage)+'</span><div class="brain-round-type">'+esc(puzzle.mechanic)+'</div></div></div>'+
      '<h2 id="brain-question-heading" tabindex="-1">'+esc(puzzle.prompt)+'</h2>'+select+
      '<div class="brain-question-actions"><button type="button" class="brain-button secondary" id="brain-hint-button">Need a hint?</button>'+
      '<button type="button" class="brain-button primary" id="brain-check-button">Check answer →</button></div>'+
      '<div id="brain-hint" hidden class="brain-hint"><strong>Think about this:</strong> '+esc(puzzle.hint)+'</div>'+
      '<div class="brain-question-bottom"><button type="button" class="brain-text-button" id="brain-level-map">← Level map</button>'+
      '<span class="brain-fine">Correct = 5 marks · Hints are free</span></div></div>';
    player.querySelectorAll('[data-choice]').forEach(button=>button.addEventListener('click',()=>{
      if(answered)return;
      selected=button.dataset.choice;
      player.querySelectorAll('[data-choice]').forEach(other=>{
        const on=button===other;
        other.classList.toggle('is-selected',on);
        other.setAttribute('aria-pressed',String(on));
      });
    }));
    player.querySelector('#brain-hint-button').addEventListener('click',()=>{
      hintUsed=true;player.querySelector('#brain-hint').hidden=false;
      player.querySelector('#brain-hint-button').hidden=true;
    });
    player.querySelector('#brain-check-button').addEventListener('click',submit);
    player.querySelector('#brain-level-map').addEventListener('click',renderLevels);
    const form=player.querySelector('#brain-answer-form');
    if(form){
      form.addEventListener('submit',event=>{event.preventDefault();submit();});
      form.querySelector('input')?.focus();
    }else{player.querySelector('[data-choice]')?.focus();}
  };
  const submit=()=>{
    if(answered)return;
    const response=puzzle.mode==='multiple-choice'?selected:player.querySelector('#brain-answer')?.value;
    if(!String(response??'').trim()){
      let node=player.querySelector('#brain-required');
      if(!node){
        node=document.createElement('p');node.id='brain-required';node.className='brain-required';
        node.setAttribute('role','alert');player.querySelector('.brain-question-actions').before(node);
      }
      node.textContent='Select or enter an answer first.';
      (player.querySelector('#brain-answer')||player.querySelector('[data-choice]'))?.focus();
      return;
    }
    answered=true;
    const correct=gradeAnswer(puzzle,response);
    const points=correct?POINTS_PER_LEVEL:0;
    session.score+=points;
    if(correct)session.correct++;
    if(session.mode==='journey'){
      const state=recordAttempt(readProgress(),session.level,correct);
      saveProgress(state);
    }
    player.querySelectorAll('[data-choice]').forEach(node=>node.disabled=true);
    const input=player.querySelector('#brain-answer');if(input)input.disabled=true;
    player.querySelector('#brain-check-button').disabled=true;
    player.querySelector('#brain-hint-button')?.setAttribute('hidden','');
    const params=Object.entries(puzzle.verifyInputs||{}).map(([name,val])=>
      '<li><span>'+esc(name)+'</span><strong>'+esc(val)+'</strong></li>').join('');
    const result=document.createElement('section');
    result.className='brain-result '+(correct?'is-right':'is-wrong');
    result.setAttribute('role','status');
    result.setAttribute('aria-live','polite');
    result.innerHTML='<div class="brain-result-heading"><span class="brain-result-mark" aria-hidden="true">'+(correct?'✓':'↻')+'</span>'+
      '<div><span class="brain-kicker">'+(correct?'LEVEL CLEARED':'LEARNING OPPORTUNITY')+'</span>'+
      '<h3>'+(correct?'Correct! +5 marks':'Not quite — here’s how to solve it')+'</h3></div></div>'+
      '<p class="brain-correct-answer">Correct answer: <strong>'+esc(formatAnswer(puzzle))+'</strong></p>'+
      '<p class="brain-explanation">'+esc(puzzle.explanation)+'</p>'+
      '<div class="brain-verify"><div class="brain-verify-title"><span aria-hidden="true">⌁</span>'+
      '<div><strong>Verify with '+esc(calculatorName)+'</strong><p>'+esc(puzzle.verifyGuide)+'</p></div></div>'+
      '<ul class="brain-verify-inputs">'+params+'</ul>'+
      '<a class="brain-verify-link" href="/tools/'+encodeURIComponent(calculator)+'/" target="_blank" rel="noopener">'+
      'Open '+esc(calculatorName)+' ↗</a></div>'+
      '<div class="brain-next-actions">'+
      (!correct?'<button type="button" class="brain-button secondary" id="brain-retry">Retry this level</button>':'')+
      '<button type="button" class="brain-button primary" id="brain-next">'+
      (session.level===ROUNDS?'See my results':'Next level')+' →</button></div>';
    player.querySelector('.brain-question').append(result);
    result.querySelector('#brain-retry')?.addEventListener('click',()=>{
      if(session.mode==='daily'){session.score-=points;if(correct)session.correct--;}
      showLevel();
    });
    result.querySelector('#brain-next').addEventListener('click',()=>{
      if(session.level<ROUNDS){session.level++;showLevel();}
      else showFinish();
    });
    result.scrollIntoView({behavior:'auto',block:'nearest'});
    result.querySelector('#brain-next')?.focus();
  };
  const showFinish=()=>{
    const state=readProgress();
    const total=session.mode==='daily'?session.score:earned(state);
    const line=total===maxScore?'Perfect 100!':total>=70?'That was strong reasoning.':'Every solved puzzle builds your skills.';
    const shareText='I earned '+total+'/'+maxScore+' marks in '+gameTitle+
      ' on AxiomAtlas Brain Lab: https://axiomatlas.netlify.app/games/'+gameId+'/';
    player.innerHTML='<section class="brain-finish"><span class="brain-finish-icon" aria-hidden="true">✦</span>'+
      '<span class="brain-kicker">20-LEVEL CHALLENGE COMPLETE</span>'+
      '<h2>'+esc(line)+'</h2>'+
      '<p>Each of the 20 levels is worth 5 marks. Revisit incomplete levels to work toward the full 100.</p>'+
      '<div class="brain-finish-stats"><div><small>'+ (session.mode==='daily'?'Daily score':'Campaign score')+
      '</small><strong>'+total+' / '+maxScore+'</strong></div>'+
      '<div><small>Campaign progress</small><strong>'+earned(state)+' / '+maxScore+'</strong></div></div>'+
      '<div class="brain-start-actions">'+
      '<button type="button" class="brain-button primary" id="brain-again">Explore level map ↻</button>'+
      '<button type="button" class="brain-button secondary" id="brain-share">Share score</button>'+
      '<a class="brain-button secondary" href="/games/">All 18 activities ↗</a></div>'+
      '<p id="brain-share-status" class="brain-fine" role="status" aria-live="polite"></p></section>';
    player.querySelector('#brain-again').addEventListener('click',renderLevels);
    player.querySelector('#brain-share').addEventListener('click',async()=>{
      const status=player.querySelector('#brain-share-status');
      try{
        if(navigator.share){
          await navigator.share({title:'AxiomAtlas Brain Lab',text:shareText,url:'https://axiomatlas.netlify.app/games/'+gameId+'/'});
          status.textContent='Share completed.';
        }else if(navigator.clipboard?.writeText){
          await navigator.clipboard.writeText(shareText);status.textContent='Score and game link copied.';
        }else{status.textContent=shareText;}
      }catch{status.textContent=shareText;}
    });
  };
  renderLevels();
}
