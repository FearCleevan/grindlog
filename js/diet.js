'use strict';

function renderDiet() {
  const el = document.getElementById('tab-diet');
  const daily = getDailyData();
  const macros = daily.macros || { protein: 0, calories: 0, water: 0 };
  const meals = daily.mealsEaten || {};
  const profile = getProfile();
  const planCalories = (profile.plan && profile.plan.calories) || 1900;
  const planProtein  = (profile.plan && profile.plan.protein)  || 140;

  el.innerHTML = `
    <h1 class="section-header">DIET</h1>

    <div class="card">
      <div class="card-title">Daily Macros</div>

      <div style="margin-bottom:14px">
        <div class="flex-between"><span class="text-sm">Protein</span><span class="text-sm"><input class="editable" id="proto-input" value="${macros.protein}" style="width:40px"> / ${planProtein}g</span></div>
        <div class="prog-track"><div class="prog-fill" id="proto-bar" style="width:${Math.min(100, (macros.protein / planProtein) * 100)}%"></div></div>
      </div>

      <div style="margin-bottom:14px">
        <div class="flex-between"><span class="text-sm">Calories</span><span class="text-sm"><input class="editable" id="kcal-input" value="${macros.calories}" style="width:48px"> / ${planCalories}</span></div>
        <div class="prog-track"><div class="prog-fill" id="kcal-bar" style="width:${Math.min(100, (macros.calories / planCalories) * 100)}%"></div></div>
      </div>

      <div class="flex-between" style="align-items:center">
        <span class="text-sm">Water</span>
        <div style="display:flex;align-items:center;gap:8px">
          <button class="btn btn-ghost" style="padding:6px 12px" onclick="changeWater(-1)">−</button>
          <span id="water-count" style="font-family:'Bebas Neue';font-size:22px">${macros.water}</span>
          <button class="btn btn-ghost" style="padding:6px 12px" onclick="changeWater(1)">+</button>
          <span class="muted text-xs">/ 8 glasses</span>
        </div>
      </div>
      <div class="prog-track"><div class="prog-fill" id="water-bar" style="width:${Math.min(100, (macros.water / 8) * 100)}%"></div></div>
    </div>

    <div class="card">
      <div class="card-title">Meal Schedule</div>
      ${MEALS.map(m => `
        <div class="check-item" onclick="toggleMeal('${m.id}')">
          <div class="check-dot${meals[m.id] ? ' done' : ''}"></div>
          <div style="flex:1">
            <div style="font-size:10px;color:var(--muted);letter-spacing:0.08em">${m.time}</div>
            <div class="text-sm">${m.label}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="collapsible">
      <div class="collapsible-trigger" onclick="toggleCollapsible(this)">MEAL PREP REFERENCE <span class="collapsible-arrow">▼</span></div>
      <div class="collapsible-body">
        ${MEAL_PREP.map(m => `
          <div style="padding:12px 0;border-bottom:1px solid var(--border)">
            <div style="font-weight:500;font-size:14px">${m.title}</div>
            <p class="text-xs muted mt-8">${m.steps}</p>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="collapsible">
      <div class="collapsible-trigger" onclick="toggleCollapsible(this)">WEEKLY GROCERY LIST <span class="collapsible-arrow">▼</span></div>
      <div class="collapsible-body">
        <p class="text-xs muted" style="padding:8px 0">Budget: ₱800–1,200/week</p>
        ${GROCERY_LIST.map(g => `
          <div class="flex-between" style="padding:8px 0;border-bottom:1px solid var(--border)">
            <span class="text-sm">${g.item}</span>
            <span class="text-xs muted">${g.price}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="collapsible">
      <div class="collapsible-trigger" onclick="toggleCollapsible(this)">PROTEIN SOURCES <span class="collapsible-arrow">▼</span></div>
      <div class="collapsible-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding-top:10px">
          ${PROTEIN_SOURCES.map(p => `
            <div style="background:var(--bg);border:1px solid var(--border);padding:12px">
              <div style="font-family:'Bebas Neue';font-size:20px;color:var(--accent)">${p.protein}</div>
              <div style="font-size:13px">${p.food}</div>
              <div class="text-xs muted">${p.note}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  document.getElementById('proto-input').addEventListener('change', e => {
    updateMacro('protein', parseFloat(e.target.value) || 0, planProtein, 'proto-bar');
  });
  document.getElementById('kcal-input').addEventListener('change', e => {
    updateMacro('calories', parseFloat(e.target.value) || 0, planCalories, 'kcal-bar');
  });
}

function updateMacro(key, val, max, barId) {
  const daily = getDailyData();
  daily.macros[key] = val;
  saveDailyData(daily);
  const bar = document.getElementById(barId);
  if (bar) bar.style.width = Math.min(100, (val / max) * 100) + '%';
}

window.changeWater = function (delta) {
  const daily = getDailyData();
  daily.macros.water = Math.max(0, Math.min(20, (daily.macros.water || 0) + delta));
  saveDailyData(daily);
  const el = document.getElementById('water-count');
  if (el) el.textContent = daily.macros.water;
  const bar = document.getElementById('water-bar');
  if (bar) bar.style.width = Math.min(100, (daily.macros.water / 8) * 100) + '%';
  vibrate(20);
};

window.toggleMeal = function (id) {
  const daily = getDailyData();
  daily.mealsEaten[id] = !daily.mealsEaten[id];
  saveDailyData(daily);
  vibrate(30);
  renderDiet();
};
