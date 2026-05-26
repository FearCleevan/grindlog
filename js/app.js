'use strict';

const tabs = document.querySelectorAll('.tab');
const navBtns = document.querySelectorAll('.nav-btn');

function switchTab(name) {
  tabs.forEach(t => t.classList.remove('active'));
  navBtns.forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelector(`.nav-btn[data-tab="${name}"]`).classList.add('active');
}

navBtns.forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

function renderAll() {
  try { renderToday(); }    catch (e) { console.error('renderToday:', e); }
  try { renderWorkout(); }  catch (e) { console.error('renderWorkout:', e); }
  try { renderBoxing(); }   catch (e) { console.error('renderBoxing:', e); }
  try { renderDiet(); }     catch (e) { console.error('renderDiet:', e); }
  try { renderProgress(); } catch (e) { console.error('renderProgress:', e); }
  try { renderSleepModal(); }catch(e) { console.error('renderSleepModal:', e); }
}

function midnightReset() {
  const last = load('lastOpened');
  const today = dateStr();
  if (last === today) return;
  store('lastOpened', today);
  if (!last) return;
  const dailyData = load(todayKey(), {});
  if (dailyData.checklistItems) {
    dailyData.checklistItems = dailyData.checklistItems.map(i => ({ ...i, done: false }));
  }
  dailyData.macros = { protein: 0, calories: 0, water: 0 };
  dailyData.mealsEaten = {};
  store(todayKey(), dailyData);
}

function init() {
  midnightReset();
  const profile = load('profile');
  if (!profile) {
    showOnboarding();
  } else {
    renderAll();
  }
  registerSW();
  handleInstallPrompt();
}

init();
