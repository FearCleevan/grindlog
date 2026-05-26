'use strict';

function getGreeting() {
  const h = new Date().getHours();
  const profile = getProfile();
  const name = profile.name || 'Champ';
  if (h >= 21 || h < 1) return `Pre-shift time, ${name}.`;
  if (h >= 1 && h < 7) return `Rise and grind, ${name}.`;
  if (h >= 7 && h < 12) return `Morning grind, ${name}.`;
  if (h >= 12 && h < 18) return `Good afternoon, ${name}.`;
  return `Evening session, ${name}.`;
}

function getWeeklyTrainedCount() {
  const sessions = load('sessions', []);
  const boxing = load('boxing_sessions', []);
  const allSessions = [...sessions, ...boxing];
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return allSessions.filter(s => new Date(s.date) >= monday).length;
}

function renderToday() {
  const el = document.getElementById('tab-today');
  const stats = getStats();
  const daily = getDailyData();
  const today = new Date();
  const plan = WEEKLY_PLAN[today.getDay()];
  const trained = getWeeklyTrainedCount();
  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  el.innerHTML = `
    <div style="padding-bottom:8px;border-bottom:1px solid var(--border);margin-bottom:16px">
      <div style="font-size:12px;color:var(--muted);letter-spacing:0.1em;text-transform:uppercase">${dateLabel}</div>
      <h1 style="font-size:28px;margin-top:4px">${getGreeting()}</h1>
    </div>

    <div class="stat-row">
      <div class="stat-box">
        <div class="stat-val"><input class="editable" id="stat-weight" value="${stats.weight}" style="font-size:24px;width:52px"> <span style="font-size:14px;font-family:'DM Sans'">kg</span></div>
        <div class="stat-lbl">Weight</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">${trained}</div>
        <div class="stat-lbl">This Week</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">${stats.streak}</div>
        <div class="stat-lbl">Streak 🔥</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Today's Plan</div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <span class="badge badge-accent">${plan.badge.toUpperCase()}</span>
          <div style="font-family:'Bebas Neue';font-size:22px;margin-top:6px">${plan.label}</div>
        </div>
        ${plan.badge !== 'rest' ? `<button class="btn btn-accent" onclick="switchTab('workout')">START</button>` : `<span class="muted text-sm">Recover well.</span>`}
      </div>
    </div>

    <div class="card">
      <div class="flex-between mb-12">
        <div class="card-title" style="margin:0">Daily Checklist</div>
        <button class="btn btn-ghost" style="font-size:11px;padding:6px 10px" onclick="addCustomCheckItem()">+ ADD</button>
      </div>
      <div id="checklist-items"></div>
    </div>

    <button class="btn btn-ghost btn-full" onclick="openModal('sleep-overlay')">SLEEP & RECOVERY TIPS</button>
  `;

  document.getElementById('stat-weight').addEventListener('change', e => {
    const s = getStats();
    s.weight = parseFloat(e.target.value) || s.weight;
    store('current_stats', s);
  });

  renderChecklist(daily);
}

function renderChecklist(daily) {
  const el = document.getElementById('checklist-items');
  if (!el) return;
  el.innerHTML = daily.checklistItems.map((item, i) => `
    <div class="check-item" onclick="toggleCheck(${i})">
      <div class="check-dot${item.done ? ' done' : ''}" id="dot-${i}"></div>
      <span class="check-label${item.done ? ' done' : ''}" id="lbl-${i}">${item.label}</span>
    </div>
  `).join('');
}

window.toggleCheck = function (i) {
  const daily = getDailyData();
  daily.checklistItems[i].done = !daily.checklistItems[i].done;
  saveDailyData(daily);
  if (daily.checklistItems[i].done) vibrate(50);
  const dot = document.getElementById('dot-' + i);
  const lbl = document.getElementById('lbl-' + i);
  dot.classList.toggle('done', daily.checklistItems[i].done);
  lbl.classList.toggle('done', daily.checklistItems[i].done);
  dot.classList.add('pop');
  setTimeout(() => dot.classList.remove('pop'), 200);
};

window.addCustomCheckItem = function () {
  const label = prompt('Checklist item:');
  if (!label || !label.trim()) return;
  const item = { id: 'custom_' + Date.now(), label: label.trim(), done: false, custom: true };
  const customs = load('custom_checklist', []);
  customs.push(item);
  store('custom_checklist', customs);
  const daily = getDailyData();
  daily.checklistItems.push(item);
  saveDailyData(daily);
  renderChecklist(daily);
};

function renderSleepModal() {
  const el = document.getElementById('sleep-content');
  if (!el) return;
  el.innerHTML = `
    <ul style="list-style:none;margin-bottom:16px">
      ${[
        'Cold shower before sleep',
        'Basin of water in front of electric fan',
        'Cover windows (cardboard or dark curtain)',
        'Wet hair slightly before sleeping',
        'f.lux or night mode ON by 7PM',
        'Blue light glasses — available ₱500–800 on Shopee',
        'No phone 30 min before sleep'
      ].map(tip => `<li style="padding:10px 0;border-bottom:1px solid var(--border);font-size:14px">→ ${tip}</li>`).join('')}
    </ul>

    <div class="card" style="text-align:center">
      <div class="card-title">4-7-8 BREATHING</div>
      <div id="breathing-circle" style="
        width:120px;height:120px;border-radius:50%;
        border:3px solid var(--border);
        margin:16px auto;display:flex;align-items:center;justify-content:center;
        font-family:'Bebas Neue';font-size:18px;letter-spacing:0.05em;
        transition:transform 0.5s ease, border-color 0.5s ease;
      ">READY</div>
      <div id="breathing-phase" style="font-family:'Bebas Neue';font-size:24px;letter-spacing:0.1em">4-7-8</div>
      <div id="breathing-count" class="muted text-xs" style="margin-top:4px">Cycle 0 of 4</div>
      <div class="btn-row mt-12" style="justify-content:center">
        <button class="btn btn-accent" id="breath-start-btn" onclick="breathingStart()">START</button>
        <button class="btn btn-ghost" onclick="breathingReset()">RESET</button>
      </div>
    </div>
  `;
}

let breathTimer = { interval: null, status: 'idle', phase: 0, seconds: 0, cycle: 0 };
const BREATH_PHASES = [
  { label: 'INHALE', duration: 4, scale: '1.3', color: 'var(--accent)' },
  { label: 'HOLD', duration: 7, scale: '1.3', color: 'var(--muted)' },
  { label: 'EXHALE', duration: 8, scale: '0.85', color: 'var(--border)' }
];

window.breathingStart = function () {
  if (breathTimer.status === 'running') return;
  breathTimer.status = 'running';
  breathTimer.phase = 0;
  breathTimer.cycle = 0;
  breathTimer.seconds = BREATH_PHASES[0].duration;
  updateBreathing();
  breathTimer.interval = setInterval(breathTick, 1000);
  const btn = document.getElementById('breath-start-btn');
  if (btn) btn.textContent = 'RUNNING';
};

function breathTick() {
  breathTimer.seconds--;
  if (breathTimer.seconds <= 0) {
    breathTimer.phase = (breathTimer.phase + 1) % 3;
    if (breathTimer.phase === 0) {
      breathTimer.cycle++;
      if (breathTimer.cycle >= 4) {
        breathingReset();
        return;
      }
    }
    breathTimer.seconds = BREATH_PHASES[breathTimer.phase].duration;
  }
  updateBreathing();
}

function updateBreathing() {
  const p = BREATH_PHASES[breathTimer.phase];
  const circle = document.getElementById('breathing-circle');
  const phase = document.getElementById('breathing-phase');
  const count = document.getElementById('breathing-count');
  if (circle) {
    circle.style.transform = `scale(${p.scale})`;
    circle.style.borderColor = p.color;
    circle.textContent = breathTimer.seconds;
  }
  if (phase) phase.textContent = `${p.label} — ${breathTimer.seconds}s`;
  if (count) count.textContent = `Cycle ${breathTimer.cycle + 1} of 4`;
}

window.breathingReset = function () {
  clearInterval(breathTimer.interval);
  breathTimer = { interval: null, status: 'idle', phase: 0, seconds: 0, cycle: 0 };
  const circle = document.getElementById('breathing-circle');
  const phase = document.getElementById('breathing-phase');
  const count = document.getElementById('breathing-count');
  if (circle) { circle.style.transform = 'scale(1)'; circle.style.borderColor = 'var(--border)'; circle.textContent = 'READY'; }
  if (phase) phase.textContent = '4-7-8';
  if (count) count.textContent = 'Cycle 0 of 4';
  const btn = document.getElementById('breath-start-btn');
  if (btn) btn.textContent = 'START';
};
