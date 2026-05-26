'use strict';

function showOnboarding() {
  openModal('onboarding-overlay');
  let step = 1;
  const data = {
    name: '',
    gender: '',
    age: 25,
    startWeight: 82,
    targetWeight: 72,
    startDate: dateStr(),
    goal: '',
    workoutEnv: '',
    equipment: [],
    fitnessLevel: ''
  };

  function render() {
    const el = document.getElementById('onboarding-steps');
    el.innerHTML = getStep(step);
    attachStepListeners(step);
  }

  function getStep(s) {
    const prog = `<div style="display:flex;gap:4px;margin-bottom:20px">${
      Array.from({length: 8}, (_, i) => `<div style="flex:1;height:3px;background:${i < s ? 'var(--accent)' : 'var(--border)'}"></div>`).join('')
    }</div>`;

    if (s === 1) return `
      ${prog}
      <p class="muted text-sm mb-12">Step 1 of 8 — Welcome</p>
      <h3 class="heading" style="font-size:28px;margin-bottom:4px">GRINDLOG</h3>
      <p class="muted text-sm mb-12">Your personalized fighter's training journal. Let's set you up.</p>
      <label class="input-label">What should we call you?</label>
      <input class="input" id="ob-name" placeholder="Leave blank to be called Champ" maxlength="30" value="${data.name}">
      <button class="btn btn-accent btn-full mt-12" id="ob-next">NEXT →</button>
    `;

    if (s === 2) return `
      ${prog}
      <p class="muted text-sm mb-12">Step 2 of 8 — About You</p>
      <h3 class="heading" style="font-size:22px;margin-bottom:16px">GENDER & AGE</h3>
      <div class="ob-option-grid" id="gender-grid">
        <div class="ob-option${data.gender === 'male' ? ' selected' : ''}" data-gender="male">
          <div class="ob-option-icon">♂</div>
          <div class="ob-option-label">MALE</div>
        </div>
        <div class="ob-option${data.gender === 'female' ? ' selected' : ''}" data-gender="female">
          <div class="ob-option-icon">♀</div>
          <div class="ob-option-label">FEMALE</div>
        </div>
      </div>
      <label class="input-label">Age</label>
      <input class="input" id="ob-age" type="number" min="14" max="80" value="${data.age}" placeholder="25" style="margin-bottom:16px">
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost" id="ob-back" style="flex:1">← BACK</button>
        <button class="btn btn-accent" id="ob-next" style="flex:2">NEXT →</button>
      </div>
    `;

    if (s === 3) return `
      ${prog}
      <p class="muted text-sm mb-12">Step 3 of 8 — Weight</p>
      <h3 class="heading" style="font-size:22px;margin-bottom:16px">CURRENT & TARGET WEIGHT</h3>
      <label class="input-label">Current weight (kg)</label>
      <input class="input" id="ob-weight" type="number" min="40" max="200" value="${data.startWeight}" style="margin-bottom:12px">
      <label class="input-label">Target weight (kg)</label>
      <input class="input" id="ob-target" type="number" min="40" max="200" value="${data.targetWeight}" style="margin-bottom:16px">
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost" id="ob-back" style="flex:1">← BACK</button>
        <button class="btn btn-accent" id="ob-next" style="flex:2">NEXT →</button>
      </div>
    `;

    if (s === 4) return `
      ${prog}
      <p class="muted text-sm mb-12">Step 4 of 8 — Goal</p>
      <h3 class="heading" style="font-size:22px;margin-bottom:16px">WHAT'S YOUR MAIN GOAL?</h3>
      <div class="ob-option-grid" id="goal-grid">
        <div class="ob-option${data.goal === 'weightloss' ? ' selected' : ''}" data-goal="weightloss">
          <div class="ob-option-icon">🔥</div>
          <div class="ob-option-label">WEIGHT LOSS</div>
          <div class="ob-option-sub">Burn fat, lean out</div>
        </div>
        <div class="ob-option${data.goal === 'muscle' ? ' selected' : ''}" data-goal="muscle">
          <div class="ob-option-icon">💪</div>
          <div class="ob-option-label">MUSCLE GAIN</div>
          <div class="ob-option-sub">Build strength</div>
        </div>
        <div class="ob-option${data.goal === 'fitness' ? ' selected' : ''}" data-goal="fitness">
          <div class="ob-option-icon">⚡</div>
          <div class="ob-option-label">GENERAL FITNESS</div>
          <div class="ob-option-sub">Stay active & healthy</div>
        </div>
        <div class="ob-option${data.goal === 'boxing' ? ' selected' : ''}" data-goal="boxing">
          <div class="ob-option-icon">🥊</div>
          <div class="ob-option-label">BOXING FOCUS</div>
          <div class="ob-option-sub">Speed, power, endurance</div>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost" id="ob-back" style="flex:1">← BACK</button>
        <button class="btn btn-accent" id="ob-next" style="flex:2">NEXT →</button>
      </div>
    `;

    if (s === 5) return `
      ${prog}
      <p class="muted text-sm mb-12">Step 5 of 8 — Workout Environment</p>
      <h3 class="heading" style="font-size:22px;margin-bottom:16px">WHERE DO YOU TRAIN?</h3>
      <div class="ob-option-grid" id="env-grid" style="grid-template-columns:1fr">
        <div class="ob-option${data.workoutEnv === 'gym' ? ' selected' : ''}" data-env="gym" style="display:flex;align-items:center;gap:12px;text-align:left;padding:14px 16px">
          <div style="font-size:28px">🏋️</div>
          <div>
            <div class="ob-option-label">GYM</div>
            <div class="ob-option-sub">Full equipment access</div>
          </div>
        </div>
        <div class="ob-option${data.workoutEnv === 'home_equip' ? ' selected' : ''}" data-env="home_equip" style="display:flex;align-items:center;gap:12px;text-align:left;padding:14px 16px">
          <div style="font-size:28px">🏠</div>
          <div>
            <div class="ob-option-label">HOME — WITH EQUIPMENT</div>
            <div class="ob-option-sub">Dumbbells, bands, pull-up bar, etc.</div>
          </div>
        </div>
        <div class="ob-option${data.workoutEnv === 'home_bw' ? ' selected' : ''}" data-env="home_bw" style="display:flex;align-items:center;gap:12px;text-align:left;padding:14px 16px">
          <div style="font-size:28px">🤸</div>
          <div>
            <div class="ob-option-label">HOME — BODYWEIGHT ONLY</div>
            <div class="ob-option-sub">No equipment needed</div>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn btn-ghost" id="ob-back" style="flex:1">← BACK</button>
        <button class="btn btn-accent" id="ob-next" style="flex:2">NEXT →</button>
      </div>
    `;

    if (s === 6) return `
      ${prog}
      <p class="muted text-sm mb-12">Step 6 of 8 — Equipment</p>
      <h3 class="heading" style="font-size:22px;margin-bottom:8px">WHAT EQUIPMENT DO YOU HAVE?</h3>
      <p class="muted text-xs mb-12">Select all that apply</p>
      <div class="ob-equip-list" id="equip-list">
        ${[
          { id: 'dumbbells',  label: 'Dumbbells',             sub: 'Any weight' },
          { id: 'bands',      label: 'Resistance Bands',      sub: 'Light / medium / heavy' },
          { id: 'pullupbar',  label: 'Pull-up Bar',           sub: 'Door frame or wall mount' },
          { id: 'bench',      label: 'Bench / Sturdy Chair',  sub: 'For step-ups, dips' },
          { id: 'kettlebell', label: 'Kettlebell',            sub: 'Any weight' },
          { id: 'jumprope',   label: 'Jump Rope',             sub: 'For cardio' },
          { id: 'mat',        label: 'Exercise Mat',          sub: 'Yoga / foam mat' }
        ].map(eq => `
          <div class="ob-equip-item" data-equip="${eq.id}">
            <div class="ob-equip-box${data.equipment.includes(eq.id) ? ' checked' : ''}"></div>
            <div>
              <div style="font-size:14px">${eq.label}</div>
              <div class="text-xs muted">${eq.sub}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost" id="ob-back" style="flex:1">← BACK</button>
        <button class="btn btn-accent" id="ob-next" style="flex:2">NEXT →</button>
      </div>
    `;

    if (s === 7) return `
      ${prog}
      <p class="muted text-sm mb-12">Step 7 of 8 — Experience</p>
      <h3 class="heading" style="font-size:22px;margin-bottom:16px">FITNESS LEVEL</h3>
      <div class="ob-option-grid" id="level-grid" style="grid-template-columns:1fr">
        <div class="ob-option${data.fitnessLevel === 'beginner' ? ' selected' : ''}" data-level="beginner" style="display:flex;align-items:center;gap:12px;text-align:left;padding:14px 16px">
          <div style="font-size:24px">🌱</div>
          <div>
            <div class="ob-option-label">BEGINNER</div>
            <div class="ob-option-sub">New to training or returning after a long break</div>
          </div>
        </div>
        <div class="ob-option${data.fitnessLevel === 'intermediate' ? ' selected' : ''}" data-level="intermediate" style="display:flex;align-items:center;gap:12px;text-align:left;padding:14px 16px">
          <div style="font-size:24px">⚡</div>
          <div>
            <div class="ob-option-label">INTERMEDIATE</div>
            <div class="ob-option-sub">Training 3–6 months consistently</div>
          </div>
        </div>
        <div class="ob-option${data.fitnessLevel === 'advanced' ? ' selected' : ''}" data-level="advanced" style="display:flex;align-items:center;gap:12px;text-align:left;padding:14px 16px">
          <div style="font-size:24px">🔥</div>
          <div>
            <div class="ob-option-label">ADVANCED</div>
            <div class="ob-option-sub">Training 6+ months, comfortable with compound moves</div>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn btn-ghost" id="ob-back" style="flex:1">← BACK</button>
        <button class="btn btn-accent" id="ob-next" style="flex:2">ANALYZE →</button>
      </div>
    `;

    if (s === 8) return `
      <div class="ob-analyze-screen">
        <div class="ob-analyze-ring"></div>
        <div style="font-family:'Bebas Neue';font-size:24px;letter-spacing:0.1em;margin-bottom:8px">ANALYZING YOUR PROFILE</div>
        <p class="muted text-sm">Building your personalized plan...</p>
      </div>
    `;

    if (s === 9) {
      const plan = analyzePlan(data);
      return `
        <p class="muted text-sm mb-12" style="letter-spacing:0.06em;text-transform:uppercase">Your Personalized Plan</p>
        <h3 class="heading" style="font-size:26px;margin-bottom:16px">HERE'S WHAT WE BUILT FOR YOU</h3>
        <div class="ob-plan-summary">
          <div class="ob-plan-row">
            <span class="ob-plan-key">Training Type</span>
            <span class="ob-plan-val">${plan.trainingType}</span>
          </div>
          <div class="ob-plan-row">
            <span class="ob-plan-key">Weekly Sessions</span>
            <span class="ob-plan-val">${plan.weeklySessions} days</span>
          </div>
          <div class="ob-plan-row">
            <span class="ob-plan-key">Daily Calories</span>
            <span class="ob-plan-val">${plan.calories} kcal</span>
          </div>
          <div class="ob-plan-row">
            <span class="ob-plan-key">Daily Protein</span>
            <span class="ob-plan-val">${plan.protein}g</span>
          </div>
          <div class="ob-plan-row">
            <span class="ob-plan-key">Starting Difficulty</span>
            <span class="ob-plan-val">${plan.difficulty}</span>
          </div>
          <div class="ob-plan-row">
            <span class="ob-plan-key">Focus</span>
            <span class="ob-plan-val">${plan.focus}</span>
          </div>
        </div>
        <p class="muted text-xs mb-12">This plan adapts as you log sessions and hit milestones.</p>
        <button class="btn btn-accent btn-full" id="ob-finish">LET'S GO →</button>
      `;
    }
  }

  function attachStepListeners(s) {
    const nextBtn = document.getElementById('ob-next');
    const backBtn = document.getElementById('ob-back');

    if (backBtn) backBtn.addEventListener('click', () => {
      step--;
      if (step === 6 && data.workoutEnv !== 'home_equip') step--;
      render();
    });

    if (s === 1 && nextBtn) {
      nextBtn.addEventListener('click', () => {
        data.name = (document.getElementById('ob-name').value || '').trim();
        step = 2; render();
      });
    }

    if (s === 2) {
      document.querySelectorAll('[data-gender]').forEach(el => {
        el.addEventListener('click', () => {
          data.gender = el.dataset.gender;
          document.querySelectorAll('[data-gender]').forEach(x => x.classList.remove('selected'));
          el.classList.add('selected');
        });
      });
      if (nextBtn) nextBtn.addEventListener('click', () => {
        if (!data.gender) { alert('Please select a gender.'); return; }
        data.age = parseInt(document.getElementById('ob-age').value) || 25;
        step = 3; render();
      });
    }

    if (s === 3 && nextBtn) {
      nextBtn.addEventListener('click', () => {
        data.startWeight  = parseFloat(document.getElementById('ob-weight').value) || 82;
        data.targetWeight = parseFloat(document.getElementById('ob-target').value) || 72;
        step = 4; render();
      });
    }

    if (s === 4) {
      document.querySelectorAll('[data-goal]').forEach(el => {
        el.addEventListener('click', () => {
          data.goal = el.dataset.goal;
          document.querySelectorAll('[data-goal]').forEach(x => x.classList.remove('selected'));
          el.classList.add('selected');
        });
      });
      if (nextBtn) nextBtn.addEventListener('click', () => {
        if (!data.goal) { alert('Please select a goal.'); return; }
        step = 5; render();
      });
    }

    if (s === 5) {
      document.querySelectorAll('[data-env]').forEach(el => {
        el.addEventListener('click', () => {
          data.workoutEnv = el.dataset.env;
          document.querySelectorAll('[data-env]').forEach(x => x.classList.remove('selected'));
          el.classList.add('selected');
        });
      });
      if (nextBtn) nextBtn.addEventListener('click', () => {
        if (!data.workoutEnv) { alert('Please select where you train.'); return; }
        step = data.workoutEnv === 'home_equip' ? 6 : 7;
        render();
      });
    }

    if (s === 6) {
      document.querySelectorAll('[data-equip]').forEach(el => {
        el.addEventListener('click', () => {
          const id = el.dataset.equip;
          const box = el.querySelector('.ob-equip-box');
          if (data.equipment.includes(id)) {
            data.equipment = data.equipment.filter(e => e !== id);
            box.classList.remove('checked');
          } else {
            data.equipment.push(id);
            box.classList.add('checked');
          }
        });
      });
      if (nextBtn) nextBtn.addEventListener('click', () => { step = 7; render(); });
    }

    if (s === 7) {
      document.querySelectorAll('[data-level]').forEach(el => {
        el.addEventListener('click', () => {
          data.fitnessLevel = el.dataset.level;
          document.querySelectorAll('[data-level]').forEach(x => x.classList.remove('selected'));
          el.classList.add('selected');
        });
      });
      if (nextBtn) nextBtn.addEventListener('click', () => {
        if (!data.fitnessLevel) { alert('Please select your fitness level.'); return; }
        step = 8; render();
        setTimeout(() => { step = 9; render(); }, 2200);
      });
    }

    const finishBtn = document.getElementById('ob-finish');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        const plan = analyzePlan(data);
        const profile = {
          name:         data.name,
          gender:       data.gender,
          age:          data.age,
          startDate:    data.startDate,
          startWeight:  data.startWeight,
          targetWeight: data.targetWeight,
          goal:         data.goal,
          workoutEnv:   data.workoutEnv,
          equipment:    data.equipment,
          fitnessLevel: data.fitnessLevel,
          plan:         plan
        };
        store('profile', profile);
        const stats = getStats();
        stats.weight = data.startWeight;
        store('current_stats', stats);
        closeModal('onboarding-overlay');
        if (typeof renderAll === 'function') renderAll();
      });
    }
  }

  render();
}
