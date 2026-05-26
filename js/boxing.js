'use strict';

function getBoxingPlan() {
  const profile = getProfile();
  const start = new Date(profile.startDate);
  const now = new Date();
  const monthNum = Math.max(1, Math.ceil((now - start) / (30 * 86400000)));
  if (monthNum === 1) return { rounds: 3, target: 150, desc: 'Combos: 1-2 and 1-2-3' };
  if (monthNum === 2) return { rounds: 4, target: 280, desc: 'Add hooks. Combos: 1-2-3 and 1-2-3-2' };
  return { rounds: 5, target: 450, desc: 'Full combos. All 6 punches.' };
}

let boxing = {
  status: 'idle',
  interval: null,
  seconds: 180,
  round: 1,
  totalRounds: 3,
  resting: false,
  restSeconds: 60,
  punchCount: 0
};

let boxFeeling = 'moderate';

function renderBoxing() {
  const plan = getBoxingPlan();
  boxing.totalRounds = plan.rounds;
  const el = document.getElementById('tab-boxing');
  el.innerHTML = `
    <h1 class="section-header">BOXING</h1>

    <div class="card" style="text-align:center">
      <div class="muted text-xs" style="letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px" id="box-status-label">Round ${boxing.round} of ${boxing.totalRounds}</div>
      <div class="timer-display${boxing.status === 'running' ? ' timer-active' : ''}" id="box-timer">${fmtTime(boxing.seconds)}</div>
      <div class="timer-label" id="box-phase">READY</div>
      <div class="btn-row mt-12" style="justify-content:center">
        <button class="btn btn-accent" onclick="boxStart()">START</button>
        <button class="btn btn-ghost" onclick="boxPause()">PAUSE</button>
        <button class="btn btn-ghost" onclick="boxReset()">RESET</button>
      </div>
    </div>

    <div class="card" style="text-align:center">
      <div class="card-title">PUNCH COUNTER</div>
      <div style="font-family:'Bebas Neue';font-size:48px;line-height:1" id="punch-display">${boxing.punchCount} / ${plan.target}</div>
      <div
        style="margin-top:12px;background:var(--bg);border:2px solid var(--border);height:80px;display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;font-family:'Bebas Neue';font-size:18px;letter-spacing:0.1em;color:var(--muted)"
        onclick="countPunch(${plan.target})"
      >TAP TO COUNT</div>
    </div>

    <div class="card muted text-sm">
      <div class="card-title">THIS MONTH</div>
      <div style="font-family:'Bebas Neue';font-size:16px">${plan.rounds} Rounds · ${plan.target} Punch Target</div>
      <p class="text-xs muted mt-8">${plan.desc}</p>
    </div>

    <div class="collapsible">
      <div class="collapsible-trigger" onclick="toggleCollapsible(this)">
        COMBO REFERENCE <span class="collapsible-arrow">▼</span>
      </div>
      <div class="collapsible-body">
        ${COMBOS.map(c => `
          <div style="padding:10px 0;border-bottom:1px solid var(--border)">
            <div style="display:flex;gap:10px;align-items:baseline">
              <span style="font-family:'Bebas Neue';font-size:22px;color:var(--accent)">${c.num}</span>
              <span style="font-weight:500">${c.name}</span>
            </div>
            <p class="text-xs muted">${c.desc}</p>
          </div>
        `).join('')}
        <div style="padding:10px 0">
          <div class="card-title">SEQUENCES</div>
          ${COMBO_SEQUENCES.map(s => `<div style="font-family:'Bebas Neue';font-size:18px;color:var(--muted);padding:4px 0">${s}</div>`).join('')}
        </div>
      </div>
    </div>

    <div id="box-log-form" style="display:none;margin-top:16px"></div>
  `;
}

function boxTick() {
  if (boxing.resting) {
    boxing.restSeconds--;
    const tEl = document.getElementById('box-timer');
    const pEl = document.getElementById('box-phase');
    if (tEl) tEl.textContent = fmtTime(boxing.restSeconds);
    if (pEl) pEl.textContent = 'REST';
    if (boxing.restSeconds <= 0) {
      boxing.resting = false;
      boxing.seconds = 180;
      beep(660);
      vibrate([100, 50, 100]);
      updateBoxDisplay();
    }
  } else {
    boxing.seconds--;
    updateBoxDisplay();
    if (boxing.seconds <= 0) {
      beep(880);
      vibrate([100, 50, 100]);
      boxing.round++;
      if (boxing.round > boxing.totalRounds) {
        boxEnd();
      } else {
        boxing.resting = true;
        boxing.restSeconds = 60;
      }
    }
  }
}

function updateBoxDisplay() {
  const tEl = document.getElementById('box-timer');
  const lEl = document.getElementById('box-status-label');
  const pEl = document.getElementById('box-phase');
  if (tEl) tEl.textContent = boxing.resting ? fmtTime(boxing.restSeconds) : fmtTime(boxing.seconds);
  if (lEl) lEl.textContent = `Round ${Math.min(boxing.round, boxing.totalRounds)} of ${boxing.totalRounds}`;
  if (pEl) pEl.textContent = boxing.resting ? 'REST' : 'ROUND';
}

function boxEnd() {
  clearInterval(boxing.interval);
  boxing.status = 'idle';
  vibrate(200);
  beep(1000, 0.4);
  const form = document.getElementById('box-log-form');
  if (form) {
    form.style.display = 'block';
    form.innerHTML = `
      <div class="card">
        <div class="card-title">LOG SESSION</div>
        <div class="card-title mt-8">How was it?</div>
        <div class="btn-row" id="feeling-btns">
          <button class="btn" onclick="selectFeeling('easy')">EASY</button>
          <button class="btn" onclick="selectFeeling('moderate')">MODERATE</button>
          <button class="btn" onclick="selectFeeling('hard')">HARD</button>
        </div>
        <button class="btn btn-accent btn-full mt-12" onclick="saveBoxingSession()">SAVE</button>
      </div>
    `;
  }
}

window.selectFeeling = function (f) {
  boxFeeling = f;
  document.querySelectorAll('#feeling-btns .btn').forEach(b => b.classList.remove('btn-accent'));
  event.target.classList.add('btn-accent');
};

window.saveBoxingSession = function () {
  const sessions = load('boxing_sessions', []);
  sessions.push({ date: dateStr(), rounds: boxing.totalRounds, totalPunches: boxing.punchCount, feeling: boxFeeling });
  store('boxing_sessions', sessions);
  updateStreak();
  const form = document.getElementById('box-log-form');
  if (form) form.style.display = 'none';
  boxing.punchCount = 0;
  boxReset();
  alert('Boxing session logged!');
  renderToday();
};

window.countPunch = function (target) {
  boxing.punchCount++;
  vibrate(20);
  const el = document.getElementById('punch-display');
  if (el) {
    el.textContent = `${boxing.punchCount} / ${target}`;
    el.classList.add('pop');
    setTimeout(() => el.classList.remove('pop'), 200);
  }
};

window.boxStart = function () {
  if (boxing.status === 'running') return;
  boxing.status = 'running';
  boxing.interval = setInterval(boxTick, 1000);
  const tEl = document.getElementById('box-timer');
  if (tEl) tEl.classList.add('timer-active');
  beep(440, 0.1);
};
window.boxPause = function () {
  if (boxing.status !== 'running') return;
  clearInterval(boxing.interval);
  boxing.status = 'paused';
  const tEl = document.getElementById('box-timer');
  if (tEl) tEl.classList.remove('timer-active');
};
window.boxReset = function () {
  clearInterval(boxing.interval);
  const plan = getBoxingPlan();
  boxing = { status: 'idle', interval: null, seconds: 180, round: 1, totalRounds: plan.rounds, resting: false, restSeconds: 60, punchCount: 0 };
  updateBoxDisplay();
  const tEl = document.getElementById('box-timer');
  if (tEl) { tEl.classList.remove('timer-active'); tEl.textContent = '3:00'; }
};
