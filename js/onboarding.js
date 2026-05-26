'use strict';

function showOnboarding() {
  openModal('onboarding-overlay');
  let step = 1;
  const data = { name: '', startWeight: 82, startDate: dateStr() };

  function render() {
    const el = document.getElementById('onboarding-steps');
    if (step === 1) {
      el.innerHTML = `
        <p class="muted text-sm mb-12">Step 1 of 3</p>
        <h3 class="heading" style="font-size:22px;margin-bottom:12px">WHAT'S YOUR NAME?</h3>
        <p class="muted text-sm mb-12">Optional — used for greetings</p>
        <input class="input" id="ob-name" placeholder="Leave blank to be called Champ" maxlength="30">
        <button class="btn btn-accent btn-full mt-12" onclick="obNext1()">NEXT</button>
      `;
    } else if (step === 2) {
      el.innerHTML = `
        <p class="muted text-sm mb-12">Step 2 of 3</p>
        <h3 class="heading" style="font-size:22px;margin-bottom:12px">CURRENT WEIGHT?</h3>
        <input class="input" id="ob-weight" type="number" placeholder="82" value="82" min="40" max="200">
        <p class="muted text-xs mt-8">in kilograms</p>
        <button class="btn btn-accent btn-full mt-12" onclick="obNext2()">NEXT</button>
      `;
    } else {
      el.innerHTML = `
        <p class="muted text-sm mb-12">Step 3 of 3</p>
        <h3 class="heading" style="font-size:22px;margin-bottom:12px">START DATE?</h3>
        <input class="input" id="ob-date" type="date" value="${dateStr()}">
        <button class="btn btn-accent btn-full mt-12" onclick="obFinish()">LET'S GO</button>
      `;
    }
  }

  window.obNext1 = () => {
    data.name = document.getElementById('ob-name').value.trim();
    step = 2; render();
  };
  window.obNext2 = () => {
    data.startWeight = parseFloat(document.getElementById('ob-weight').value) || 82;
    step = 3; render();
  };
  window.obFinish = () => {
    data.startDate = document.getElementById('ob-date').value || dateStr();
    const profile = {
      name: data.name,
      startDate: data.startDate,
      startWeight: data.startWeight,
      targetWeight: 72,
      startPushups: 8,
      startRun: 0
    };
    store('profile', profile);
    const stats = getStats();
    stats.weight = data.startWeight;
    store('current_stats', stats);
    closeModal('onboarding-overlay');
    renderAll();
  };

  render();
}
