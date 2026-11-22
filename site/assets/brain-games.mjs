import {ROUNDS, dailySeed, seedFromText, roundSeed, makeChallenge, gradeAnswer, formatAnswer} from './games-engine.mjs';

const player = document.querySelector('#game-player');
if (player) {
  const gameId = player.dataset.gameId;
  const gameTitle = player.dataset.gameTitle;
  const calculator = player.dataset.calculatorSlug;
  const calculatorName = player.dataset.calculatorName;
  const storageKey = 'axiomatlas-brain-best:' + gameId;
  let session = null, puzzle = null, selected = '', hintUsed = false, answered = false;

  const esc = value => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  const readScore = () => {
    try { return Math.max(0, Math.min(50, Number(localStorage.getItem(storageKey)) || 0)); }
    catch { return 0; }
  };
  const saveScore = score => {
    try { if (score > readScore()) localStorage.setItem(storageKey, String(score)); } catch {}
  };
  const localDay = () => {
    const date = new Date();
    return [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
  };
  const renderStart = () => {
    session = null; puzzle = null; answered = false; selected = '';
    player.innerHTML = '<div class="brain-start">' +
      '<span class="brain-kicker">READY, THINK, SOLVE</span>' +
      '<h2>Your next challenge starts here.</h2>' +
      '<p>Five rounds. Learn by trying, and open the exact AxiomAtlas calculator when you need to verify an answer.</p>' +
      '<div class="brain-start-actions">' +
        '<button type="button" class="brain-button primary" data-start="practice">Start 5-round challenge <span aria-hidden="true">↗</span></button>' +
        '<button type="button" class="brain-button secondary" data-start="daily">Today’s challenge</button>' +
      '</div><p class="brain-fine">Free · No sign-in · Best scores saved on this device · Daily puzzles follow your device date.</p>' +
      '<div class="brain-best-overview"><span>Personal best</span><strong>' + readScore() + ' / 50</strong></div></div>';
    player.querySelectorAll('[data-start]').forEach(button => button.addEventListener('click', () => begin(button.dataset.start)));
  };
  const begin = mode => {
    const day = localDay();
    session = {
      mode, day, index: 0, correct: 0, score: 0,
      seed: mode === 'daily'
        ? dailySeed(gameId, day)
        : seedFromText(gameId + ':' + Date.now() + ':' + Math.random())
    };
    showRound();
  };
  const progress = () => {
    const value = Math.round((session.index / ROUNDS) * 100);
    return '<div class="brain-round-top"><span>' + (session.mode === 'daily' ? 'DAILY · ' + esc(session.day) : 'PRACTICE MODE') +
      '</span><strong>ROUND ' + (session.index + 1) + ' / ' + ROUNDS + '</strong></div>' +
      '<div class="brain-progress-track" role="progressbar" aria-label="Challenge progress" aria-valuenow="' + session.index +
      '" aria-valuemin="0" aria-valuemax="' + ROUNDS + '"><span style="width:' + value + '%"></span></div>' +
      '<div class="brain-score-line"><span>Score <strong>' + session.score + ' / ' + (ROUNDS*10) + '</strong></span>' +
      '<span>Correct <strong>' + session.correct + '</strong></span></div>';
  };
  const showRound = () => {
    hintUsed = false; answered = false; selected = '';
    puzzle = makeChallenge(gameId, roundSeed(session.seed, session.index));
    const answerForm = puzzle.mode === 'multiple-choice'
      ? '<div class="brain-choice-grid" role="group" aria-label="Choose one answer">' +
        puzzle.options.map(option => '<button type="button" class="brain-choice" aria-pressed="false" data-choice="' +
          esc(option) + '">' + esc(option) + '</button>').join('') + '</div>'
      : '<form id="brain-answer-form"><label for="brain-answer">Your answer ' +
        (puzzle.unit ? '<span class="brain-answer-unit">(' + esc(puzzle.unit) + ')</span>' : '') +
        '</label><input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" ' +
        'name="answer" id="brain-answer" placeholder="Enter a number" required></form>';
    player.innerHTML = '<div class="brain-question">' + progress() +
      '<div class="brain-question-head"><span class="brain-challenge-icon" aria-hidden="true">' + esc(puzzle.symbol || '∑') + '</span>' +
      '<span class="brain-round-type">' + (puzzle.mode === 'multiple-choice' ? 'Choose the correct answer' : 'Calculate the answer') + '</span></div>' +
      '<h2 id="brain-question-heading" tabindex="-1">' + esc(puzzle.prompt) + '</h2>' +
      answerForm +
      '<div class="brain-question-actions"><button type="button" class="brain-button secondary" id="brain-hint-button">Need a hint?</button>' +
      '<button type="button" class="brain-button primary" id="brain-check-button">Check answer <span aria-hidden="true">→</span></button></div>' +
      '<div id="brain-hint" hidden class="brain-hint"><strong>Think about this:</strong> ' + esc(puzzle.hint) + '</div>' +
      '<p class="brain-fine">No pressure. You can inspect the method and use the related calculator after answering.</p></div>';
    player.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => {
      if (answered) return;
      selected = button.dataset.choice;
      player.querySelectorAll('[data-choice]').forEach(other => {
        const active = other === button;
        other.classList.toggle('is-selected', active);
        other.setAttribute('aria-pressed', String(active));
      });
    }));
    player.querySelector('#brain-hint-button').addEventListener('click', () => {
      hintUsed = true;
      player.querySelector('#brain-hint').hidden = false;
      player.querySelector('#brain-hint-button').hidden = true;
    });
    player.querySelector('#brain-check-button').addEventListener('click', submit);
    const form = player.querySelector('#brain-answer-form');
    if (form) {
      form.addEventListener('submit', event => { event.preventDefault(); submit(); });
      form.querySelector('input')?.focus();
    } else {
      player.querySelector('[data-choice]')?.focus();
    }
  };
  const submit = () => {
    if (answered) return;
    const userInput = puzzle.mode === 'multiple-choice' ? selected : player.querySelector('#brain-answer')?.value;
    if (!String(userInput || '').trim()) {
      const el = player.querySelector('#brain-answer') || player.querySelector('[data-choice]');
      el?.focus();
      let info = player.querySelector('#brain-required');
      if (!info) {
        info = document.createElement('p');
        info.id = 'brain-required'; info.className = 'brain-required'; info.setAttribute('role','alert');
        player.querySelector('.brain-question-actions').before(info);
      }
      info.textContent = 'Select or enter an answer first.';
      return;
    }
    answered = true;
    const correct = gradeAnswer(puzzle, userInput);
    const points = correct ? (hintUsed ? 7 : 10) : 0;
    session.score += points;
    if (correct) session.correct++;
    player.querySelectorAll('[data-choice]').forEach(el => { el.disabled = true; });
    const input = player.querySelector('#brain-answer');
    if (input) input.disabled = true;
    player.querySelector('#brain-check-button').disabled = true;
    player.querySelector('#brain-hint-button')?.setAttribute('hidden', '');
    const inputs = Object.entries(puzzle.verifyInputs || {}).map(([key,value]) =>
      '<li><span>' + esc(key) + '</span><strong>' + esc(value) + '</strong></li>').join('');
    const result = document.createElement('section');
    result.className = 'brain-result ' + (correct?'is-right':'is-wrong');
    result.setAttribute('role','status'); result.setAttribute('aria-live','polite');
    result.innerHTML = '<div class="brain-result-heading">' +
      '<span class="brain-result-mark" aria-hidden="true">' + (correct?'✓':'↻') + '</span>' +
      '<div><span class="brain-kicker">' + (correct?'NICE WORK':'LET’S FIGURE IT OUT') + '</span>' +
      '<h3>' + (correct?'Correct! +' + points + ' points':'Not quite — here’s how to verify it') + '</h3></div></div>' +
      '<p class="brain-correct-answer">Correct answer: <strong>' + esc(formatAnswer(puzzle)) + '</strong></p>' +
      '<p class="brain-explanation">' + esc(puzzle.explanation) + '</p>' +
      '<div class="brain-verify"><div class="brain-verify-title"><span aria-hidden="true">⌁</span>' +
      '<div><strong>Verify with ' + esc(calculatorName) + '</strong>' +
      '<p>' + esc(puzzle.verifyGuide) + '</p></div></div>' +
      '<ul class="brain-verify-inputs">' + inputs + '</ul>' +
      '<a class="brain-verify-link" href="/tools/' + encodeURIComponent(calculator) + '/" target="_blank" rel="noopener">' +
      'Open ' + esc(calculatorName) + ' <span aria-hidden="true">↗</span></a></div>' +
      '<button type="button" id="brain-next" class="brain-button primary">' +
      (session.index === ROUNDS-1 ? 'See my results':'Next challenge') + '<span aria-hidden="true">→</span></button>';
    player.querySelector('.brain-question').append(result);
    player.querySelector('#brain-next').addEventListener('click', nextRound);
    result.scrollIntoView({behavior:'auto',block:'nearest'});
    player.querySelector('#brain-next').focus();
  };
  const nextRound = () => {
    session.index++;
    if (session.index < ROUNDS) showRound();
    else showFinish();
  };
  const showFinish = () => {
    saveScore(session.score);
    const nice = session.correct === ROUNDS ? 'Perfect round!' : session.correct >= 3 ? 'Strong thinking!' : 'Every attempt makes you sharper.';
    const text = 'I scored ' + session.score + '/' + (ROUNDS*10) + ' on ' + gameTitle +
      ' at AxiomAtlas Brain Lab. Try it: https://axiomatlas.netlify.app/games/' + gameId + '/';
    player.innerHTML = '<section class="brain-finish"><span class="brain-finish-icon" aria-hidden="true">✦</span>' +
      '<span class="brain-kicker">CHALLENGE COMPLETE</span><h2>' + esc(nice) + '</h2>' +
      '<p>You solved ' + session.correct + ' of ' + ROUNDS + ' puzzles. Keep exploring to level up your reasoning.</p>' +
      '<div class="brain-finish-stats"><div><small>Your score</small><strong>' + session.score + ' / ' + (ROUNDS*10) + '</strong></div>' +
      '<div><small>Personal best</small><strong>' + readScore() + ' / ' + (ROUNDS*10) + '</strong></div></div>' +
      '<div class="brain-start-actions"><button type="button" class="brain-button primary" id="brain-again">Play again ↻</button>' +
      '<button type="button" class="brain-button secondary" id="brain-share">Share score</button>' +
      '<a class="brain-button secondary" href="/games/">Explore all 18 activities ↗</a></div>' +
      '<p id="brain-share-status" class="brain-fine" role="status" aria-live="polite"></p></section>';
    player.querySelector('#brain-again').addEventListener('click', renderStart);
    player.querySelector('#brain-share').addEventListener('click', async () => {
      const status = player.querySelector('#brain-share-status');
      try {
        if (navigator.share) {
          await navigator.share({title:'AxiomAtlas Brain Lab',text,url:'https://axiomatlas.netlify.app/games/' + gameId + '/'});
          status.textContent='Share dialog opened.';
        } else if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          status.textContent='Score and game link copied.';
        } else {
          status.textContent=text;
        }
      } catch { status.textContent='You can share this game link: https://axiomatlas.netlify.app/games/' + gameId + '/'; }
    });
  };
  renderStart();
}
