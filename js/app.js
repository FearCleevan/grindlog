'use strict';

function switchTab(name) {
  window.location.href = name === 'today' ? 'index.html' : name + '.html';
}

function renderAll() {
  try { renderToday(); }     catch (e) { console.error('renderToday:', e); }
  try { renderSleepModal(); }catch (e) { console.error('renderSleepModal:', e); }
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
