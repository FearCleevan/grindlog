'use strict';

function renderProgress() {
  const el = document.getElementById('tab-progress');
  const stats = getStats();
  const profile = getProfile();
  const tests = load('progress_tests', []);
  const milestones = load('milestones', MILESTONES.map(m => ({ ...m, done: false })));

  const pushPct = Math.min(100, (stats.pushupPR / 20) * 100);
  const runPct = Math.min(100, (stats.longestRun / 30) * 100);
  const weightStart = profile.startWeight || 82;
  const weightTarget = 72;
  const weightCur = stats.weight || weightStart;
  const weightLost = weightStart - weightCur;
  const weightTotal = weightStart - weightTarget;
  const weightPct = Math.max(0, Math.min(100, (weightLost / weightTotal) * 100));

  el.innerHTML = `
    <h1 class="section-header">PROGRESS</h1>

    <div class="card">
      <div class="card-title">Push-up Goal</div>
      <div class="flex-between">
        <div><span style="font-family:'Bebas Neue';font-size:28px"><input class="editable" id="prog-pushup" value="${stats.pushupPR}" style="font-size:28px;width:52px"></span> <span class="muted text-sm">/ 20 reps</span></div>
        <span class="badge${pushPct >= 100 ? ' badge-accent' : ''}">${pushPct >= 100 ? 'DONE' : Math.round(pushPct) + '%'}</span>
      </div>
      <div class="prog-track"><div class="prog-fill" style="width:${pushPct}%"></div></div>
    </div>

    <div class="card">
      <div class="card-title">Running Goal</div>
      <div class="flex-between">
        <div><span style="font-family:'Bebas Neue';font-size:28px"><input class="editable" id="prog-run" value="${stats.longestRun}" style="font-size:28px;width:52px"></span> <span class="muted text-sm">/ 30 min</span></div>
        <span class="badge${runPct >= 100 ? ' badge-accent' : ''}">${runPct >= 100 ? 'DONE' : Math.round(runPct) + '%'}</span>
      </div>
      <div class="prog-track"><div class="prog-fill" style="width:${runPct}%"></div></div>
    </div>

    <div class="card">
      <div class="card-title">Weight Goal</div>
      <div class="flex-between">
        <div><span style="font-family:'Bebas Neue';font-size:28px">${weightCur} kg</span> <span class="muted text-sm">→ ${weightTarget} kg</span></div>
        <span class="badge">${weightLost >= 0 ? '-' : '+'}${Math.abs(weightLost).toFixed(1)} kg</span>
      </div>
      <div class="prog-track"><div class="prog-fill" style="width:${weightPct}%"></div></div>
    </div>

    <div class="card">
      <div class="card-title">Session Stats</div>
      <div class="stat-row">
        <div class="stat-box"><div class="stat-val">${stats.totalSessions}</div><div class="stat-lbl">Total</div></div>
        <div class="stat-box"><div class="stat-val">${stats.streak}</div><div class="stat-lbl">Streak</div></div>
        <div class="stat-box"><div class="stat-val">${stats.longestStreak}</div><div class="stat-lbl">Best</div></div>
      </div>
    </div>

    <div class="card">
      <div class="flex-between mb-12">
        <div class="card-title" style="margin:0">Biweekly Tests</div>
        <button class="btn btn-ghost" style="font-size:11px;padding:6px 10px" onclick="toggleTestForm()">+ LOG TEST</button>
      </div>
      <div id="test-form" style="display:none;margin-bottom:12px">
        <input class="input" id="tf-pushups" type="number" placeholder="Push-ups" min="0" style="margin-bottom:8px">
        <input class="input" id="tf-run" type="number" placeholder="Run minutes" min="0" style="margin-bottom:8px">
        <input class="input" id="tf-weight" type="number" placeholder="Weight (kg)" min="30">
        <button class="btn btn-accent btn-full mt-12" onclick="saveTest()">SAVE TEST</button>
      </div>
      <div id="test-history">
        ${tests.length === 0 ? '<p class="muted text-sm">No tests logged yet.</p>' : tests.slice().reverse().map((t, i, arr) => {
          const prev = arr[i + 1];
          const dPush = prev ? t.pushups - prev.pushups : null;
          const dRun = prev ? t.runMinutes - prev.runMinutes : null;
          const dW = prev ? t.weight - prev.weight : null;
          return `
            <div style="padding:10px 0;border-bottom:1px solid var(--border)">
              <div style="font-size:11px;color:var(--muted)">${t.date}</div>
              <div class="text-sm mt-8">Push-ups: <strong>${t.pushups}</strong>${dPush !== null ? ` <span class="${dPush >= 0 ? 'accent' : 'muted'}">(${dPush >= 0 ? '+' : ''}${dPush})</span>` : ''}</div>
              <div class="text-sm">Run: <strong>${t.runMinutes} min</strong>${dRun !== null ? ` <span class="${dRun >= 0 ? 'accent' : 'muted'}">(${dRun >= 0 ? '+' : ''}${dRun})</span>` : ''}</div>
              <div class="text-sm">Weight: <strong>${t.weight} kg</strong>${dW !== null ? ` <span class="${dW <= 0 ? 'accent' : 'muted'}">(${dW >= 0 ? '+' : ''}${dW.toFixed(1)})</span>` : ''}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-title">Milestones</div>
      ${milestones.map((m, i) => `
        <div class="check-item" onclick="toggleMilestone(${i})">
          <div class="check-dot${m.done ? ' done' : ''}"></div>
          <div style="flex:1">
            <div class="text-sm${m.done ? ' muted' : ''}" style="${m.done ? 'text-decoration:line-through' : ''}">${m.label}</div>
            <div class="text-xs muted">Unlocks: ${m.unlock}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="collapsible">
      <div class="collapsible-trigger" onclick="toggleCollapsible(this)">MONTHLY CHECKPOINTS <span class="collapsible-arrow">▼</span></div>
      <div class="collapsible-body">
        ${MONTHLY_TARGETS.map(m => `
          <div style="padding:10px 0;border-bottom:1px solid var(--border)">
            <div style="font-family:'Bebas Neue';font-size:16px;color:var(--accent)">Month ${m.month}</div>
            <div class="text-sm">Push-ups: ${m.pushups} · Run: ${m.run} · Weight: ${m.weight}</div>
            ${m.note ? `<div class="text-xs muted">${m.note}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('prog-pushup').addEventListener('change', e => {
    const s = getStats(); s.pushupPR = parseInt(e.target.value) || 0; store('current_stats', s); renderProgress();
  });
  document.getElementById('prog-run').addEventListener('change', e => {
    const s = getStats(); s.longestRun = parseFloat(e.target.value) || 0; store('current_stats', s); renderProgress();
  });
}

window.toggleTestForm = function () {
  const f = document.getElementById('test-form');
  f.style.display = f.style.display === 'none' ? 'block' : 'none';
};

window.saveTest = function () {
  const pushups = parseInt(document.getElementById('tf-pushups').value) || 0;
  const runMinutes = parseFloat(document.getElementById('tf-run').value) || 0;
  const weight = parseFloat(document.getElementById('tf-weight').value) || 0;
  if (!pushups && !runMinutes && !weight) return;
  const tests = load('progress_tests', []);
  tests.push({ date: dateStr(), pushups, runMinutes, weight });
  store('progress_tests', tests);
  const s = getStats();
  if (pushups) s.pushupPR = Math.max(s.pushupPR, pushups);
  if (runMinutes) s.longestRun = Math.max(s.longestRun, runMinutes);
  if (weight) s.weight = weight;
  store('current_stats', s);
  renderProgress();
};

window.toggleMilestone = function (i) {
  const milestones = load('milestones', MILESTONES.map(m => ({ ...m, done: false })));
  milestones[i].done = !milestones[i].done;
  store('milestones', milestones);
  vibrate(50);
  renderProgress();
};
