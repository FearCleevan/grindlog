'use strict';

let selectedDay = new Date().getDay();
let sessionSets = {};

let calViewYear = new Date().getFullYear();
let calViewMonth = new Date().getMonth();

function renderCalendar(containerEl) {
  if (!containerEl) return;
  const today = new Date();
  const sessions = load('sessions', []);
  const boxSessions = load('boxing_sessions', []);
  const loggedDates = new Set([
    ...sessions.map(s => s.date),
    ...boxSessions.map(s => s.date)
  ]);

  const firstDay = new Date(calViewYear, calViewMonth, 1);
  const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();
  const startDow = firstDay.getDay();
  const monthName = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d =>
    `<div class="cal-day-header">${d}</div>`
  ).join('');

  let cells = '';
  for (let i = 0; i < startDow; i++) {
    cells += `<div class="cal-cell cal-empty"></div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(calViewYear, calViewMonth, d);
    const dow = cellDate.getDay();
    const plan = WEEKLY_PLAN[dow];
    const isToday = cellDate.toDateString() === today.toDateString();
    const isSelected = calViewYear === today.getFullYear()
      && calViewMonth === today.getMonth()
      && dow === selectedDay
      && d === today.getDate();
    const ds = `${calViewYear}-${String(calViewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const hasSession = loggedDates.has(ds);
    const classes = ['cal-cell', isToday ? 'cal-today' : '', isSelected ? 'cal-selected' : ''].filter(Boolean).join(' ');

    cells += `
      <div class="${classes}" onclick="calSelectDate(${calViewYear},${calViewMonth},${d},${dow})">
        <span class="cal-cell-num">${d}</span>
        <span class="cal-cell-type" style="color:${plan.badge === 'rest' ? 'var(--border)' : ''}">${WORKOUT_SHORT[plan.badge]}</span>
        ${hasSession ? '<span class="cal-dot"></span>' : ''}
      </div>
    `;
  }

  containerEl.innerHTML = `
    <div class="cal-month-nav">
      <button class="btn btn-ghost" style="padding:6px 10px;min-height:36px" onclick="calPrevMonth()">‹</button>
      <span class="cal-month-label">${monthName.toUpperCase()}</span>
      <button class="btn btn-ghost" style="padding:6px 10px;min-height:36px" onclick="calNextMonth()">›</button>
    </div>
    <div class="cal-grid">
      ${dayHeaders}
      ${cells}
    </div>
  `;
}

window.calSelectDate = function (year, month, day, dow) {
  selectedDay = dow;
  sessionSets = {};
  calViewYear = year;
  calViewMonth = month;
  renderWorkout();
  setTimeout(() => {
    const el = document.getElementById('exercise-list') || document.getElementById('cardio-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
};

window.calPrevMonth = function () {
  calViewMonth--;
  if (calViewMonth < 0) { calViewMonth = 11; calViewYear--; }
  renderWorkout();
};
window.calNextMonth = function () {
  calViewMonth++;
  if (calViewMonth > 11) { calViewMonth = 0; calViewYear++; }
  renderWorkout();
};

function renderWorkout() {
  const el = document.getElementById('tab-workout');
  const plan = WEEKLY_PLAN[selectedDay];
  const exercises = getPersonalizedExercises()[plan.badge] || [];

  const dayStrip = DAYS.map((d, i) => {
    const p = WEEKLY_PLAN[i];
    const isToday = i === new Date().getDay();
    const isSelected = i === selectedDay;
    return `
      <div onclick="selectDay(${i})" style="
        flex:1;text-align:center;padding:8px 4px;cursor:pointer;
        border-bottom:2px solid ${isSelected ? 'var(--accent)' : 'transparent'};
        color:${isSelected ? 'var(--accent)' : isToday ? 'var(--text)' : 'var(--muted)'};
      ">
        <div style="font-size:10px;letter-spacing:0.08em;text-transform:uppercase">${d}</div>
        <div style="font-family:'Bebas Neue';font-size:11px;color:${isSelected ? 'var(--accent)' : 'var(--muted)'};margin-top:2px">${p.badge}</div>
      </div>
    `;
  }).join('');

  el.innerHTML = `
    <h1 class="section-header">WORKOUT</h1>

    <div class="card" style="padding:12px">
      <div id="cal-container"></div>
    </div>

    <div style="display:flex;border-bottom:1px solid var(--border);margin-bottom:16px;overflow-x:auto">${dayStrip}</div>

    ${plan.badge === 'rest' ? `
      <div class="card"><p class="muted">Rest day. Stretch, hydrate, sleep.</p></div>
    ` : plan.badge === 'cardio' ? `
      <div id="cardio-section"></div>
    ` : `
      <div class="card">
        <div class="card-title">Warm Up — 5 min</div>
        ${WARMUP.map(w => `<div class="check-item" style="cursor:default"><div class="check-dot" style="border-color:var(--muted)"></div><span class="text-sm">${w}</span></div>`).join('')}
      </div>
      <div class="card">
        <div class="card-title">${plan.label}</div>
        <div id="exercise-list"></div>
        <button class="btn btn-accent btn-full mt-12" onclick="finishSession('${plan.badge}')">FINISH SESSION</button>
      </div>
    `}

    <div class="collapsible" style="margin-top:8px">
      <div class="collapsible-trigger" onclick="toggleCollapsible(this)">
        EXERCISE LIBRARY <span class="collapsible-arrow">▼</span>
      </div>
      <div class="collapsible-body">
        ${renderExerciseLibrary()}
      </div>
    </div>
  `;

  renderCalendar(document.getElementById('cal-container'));
  if (plan.badge === 'cardio') renderCardio();
  if (exercises.length) renderExerciseList(exercises);
}

window.selectDay = function (day) {
  selectedDay = day;
  sessionSets = {};
  renderWorkout();
};

function renderExerciseList(exercises) {
  const el = document.getElementById('exercise-list');
  if (!el) return;
  el.innerHTML = exercises.map(ex => {
    if (!sessionSets[ex.name]) sessionSets[ex.name] = Array(ex.sets).fill(false);
    const circles = sessionSets[ex.name].map((done, si) => `
      <div class="set-circle${done ? ' done' : ''}" onclick="toggleSet('${ex.name}',${si})">${si + 1}</div>
    `).join('');
    return `
      <div style="padding:12px 0;border-bottom:1px solid var(--border)">
        <div class="flex-between">
          <div>
            <div style="font-weight:500">${ex.name}</div>
            <div class="text-xs muted">${ex.sets} × ${ex.reps}</div>
          </div>
        </div>
        <p class="text-xs muted mt-8">${ex.cue}</p>
        <div class="set-circles mt-8">${circles}</div>
      </div>
    `;
  }).join('');
}

window.toggleSet = function (name, si) {
  if (!sessionSets[name]) return;
  sessionSets[name][si] = !sessionSets[name][si];
  vibrate(30);
  renderExerciseList(getPersonalizedExercises()[WEEKLY_PLAN[selectedDay].badge] || []);
  if (sessionSets[name][si]) showRestTimer();
};

function renderExerciseLibrary() {
  const ex = getPersonalizedExercises();
  const all = [...(ex.push || []), ...(ex.pull || []), ...(ex.legs || [])];
  const unique = all.filter((e, i, a) => a.findIndex(x => x.name === e.name) === i);
  return unique.map(ex => `
    <div style="padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="font-weight:500;font-size:14px">${ex.name}</div>
      <p class="text-xs muted mt-8">${ex.cue}</p>
    </div>
  `).join('');
}

let restTimer = { interval: null, seconds: 60, active: false };

function showRestTimer() {
  if (restTimer.active) return;
  restTimer = { interval: null, seconds: 60, active: true };
  openModal('rest-overlay');
  updateRestDisplay();
  restTimer.interval = setInterval(() => {
    restTimer.seconds--;
    updateRestDisplay();
    if (restTimer.seconds <= 0) {
      clearInterval(restTimer.interval);
      restTimer.active = false;
      vibrate([100, 50, 100]);
      closeModal('rest-overlay');
    }
  }, 1000);
}

function updateRestDisplay() {
  const el = document.getElementById('rest-countdown');
  if (el) el.textContent = fmtTime(restTimer.seconds);
}

window.skipRest = function () {
  clearInterval(restTimer.interval);
  restTimer.active = false;
  closeModal('rest-overlay');
};

window.finishSession = function (type) {
  const sessions = load('sessions', []);
  const exercises = (getPersonalizedExercises()[type] || []).map(ex => ({
    name: ex.name,
    sets: (sessionSets[ex.name] || []).filter(Boolean).length + '/' + ex.sets
  }));
  sessions.push({
    date: dateStr(),
    type,
    exercises,
    duration: 0,
    feeling: 'moderate'
  });
  store('sessions', sessions);
  updateStreak();
  vibrate(200);
  sessionSets = {};
  alert('Session logged!');
  renderToday();
  renderWorkout();
};

function getCurrentCardioPhase() {
  const profile = getProfile();
  const start = new Date(profile.startDate);
  const now = new Date();
  const weekNum = Math.max(1, Math.ceil((now - start) / (7 * 86400000)));
  return CARDIO_PHASES.find(p => p.weeks.includes(Math.min(weekNum, 8))) || CARDIO_PHASES[3];
}

let cardio = {
  status: 'idle',
  interval: null,
  phase: null,
  intervalIdx: 0,
  roundIdx: 0,
  seconds: 0
};

function renderCardio() {
  const el = document.getElementById('cardio-section');
  if (!el) return;
  const phase = getCurrentCardioPhase();
  cardio.phase = phase;
  if (cardio.status === 'idle') {
    cardio.intervalIdx = 0;
    cardio.roundIdx = 0;
    cardio.seconds = phase.intervals[0].duration;
  }
  const cur = phase.intervals[cardio.intervalIdx];
  el.innerHTML = `
    <div class="card">
      <div class="card-title">${phase.label}</div>
      <div class="muted text-sm mb-12">Round ${cardio.roundIdx + 1} of ${phase.rounds} · ${phase.intervals.length} intervals/round</div>
      <div class="timer-display${cardio.status === 'running' ? ' timer-active' : ''}" id="cardio-timer">${fmtTime(cardio.seconds)}</div>
      <div class="timer-label" id="cardio-phase-label">${cur ? cur.label : ''}</div>
      <div class="btn-row mt-12" style="justify-content:center">
        <button class="btn btn-accent" onclick="cardioStart()">START</button>
        <button class="btn btn-ghost" onclick="cardioPause()">PAUSE</button>
        <button class="btn btn-ghost" onclick="cardioReset()">RESET</button>
      </div>
    </div>
    <button class="btn btn-accent btn-full" onclick="finishSession('cardio')" style="margin-top:4px">LOG CARDIO SESSION</button>
  `;
}

function cardioTick() {
  cardio.seconds--;
  updateCardioDisplay();
  if (cardio.seconds <= 0) {
    vibrate([100, 50, 100]);
    beep();
    cardio.intervalIdx++;
    if (cardio.intervalIdx >= cardio.phase.intervals.length) {
      cardio.intervalIdx = 0;
      cardio.roundIdx++;
      if (cardio.roundIdx >= cardio.phase.rounds) {
        cardioReset();
        vibrate(200);
        alert('Cardio complete!');
        return;
      }
    }
    cardio.seconds = cardio.phase.intervals[cardio.intervalIdx].duration;
  }
}

function updateCardioDisplay() {
  const tEl = document.getElementById('cardio-timer');
  const lEl = document.getElementById('cardio-phase-label');
  if (tEl) tEl.textContent = fmtTime(cardio.seconds);
  if (lEl && cardio.phase) lEl.textContent = cardio.phase.intervals[cardio.intervalIdx]?.label || '';
}

window.cardioStart = function () {
  if (cardio.status === 'running') return;
  cardio.status = 'running';
  cardio.interval = setInterval(cardioTick, 1000);
  const tEl = document.getElementById('cardio-timer');
  if (tEl) tEl.classList.add('timer-active');
};
window.cardioPause = function () {
  if (cardio.status !== 'running') return;
  clearInterval(cardio.interval);
  cardio.status = 'paused';
  const tEl = document.getElementById('cardio-timer');
  if (tEl) tEl.classList.remove('timer-active');
};
window.cardioReset = function () {
  clearInterval(cardio.interval);
  cardio.status = 'idle';
  cardio.intervalIdx = 0;
  cardio.roundIdx = 0;
  if (cardio.phase) cardio.seconds = cardio.phase.intervals[0].duration;
  const tEl = document.getElementById('cardio-timer');
  if (tEl) tEl.classList.remove('timer-active');
  updateCardioDisplay();
};
