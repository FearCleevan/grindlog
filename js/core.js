'use strict';

function store(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
}
function load(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch (e) { return fallback; }
}
function todayKey() {
  return 'daily_' + new Date().toISOString().slice(0, 10);
}
function dateStr(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function fmtTime(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
function beep(freq = 440, duration = 0.15) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}
function toggleCollapsible(trigger) {
  trigger.classList.toggle('open');
  trigger.nextElementSibling.classList.toggle('open');
}
function getProfile() {
  return load('profile', {
    name: '', startDate: dateStr(), startWeight: 82, targetWeight: 72,
    startPushups: 8, startRun: 0
  });
}
function getStats() {
  return load('current_stats', {
    weight: 82, pushupPR: 8, longestRun: 0, streak: 0,
    longestStreak: 0, totalSessions: 0, lastSessionDate: null
  });
}
function getDailyData() {
  const key = todayKey();
  const existing = load(key);
  if (existing) return existing;
  const defaults = {
    date: dateStr(),
    checklistItems: defaultChecklist(),
    macros: { protein: 0, calories: 0, water: 0 },
    mealsEaten: {}
  };
  store(key, defaults);
  return defaults;
}
function saveDailyData(data) { store(todayKey(), data); }
function defaultChecklist() {
  const base = [
    { id: 'water',     label: 'Drank 8+ glasses of water',        done: false },
    { id: 'protein',   label: 'Hit protein target (130–150g)',     done: false },
    { id: 'shower',    label: 'Took cold shower before sleep',     done: false },
    { id: 'nophone',   label: 'No phone 30 min before bed',        done: false },
    { id: 'flux',      label: 'Installed f.lux / night mode on',   done: false },
    { id: 'breathing', label: 'Did 4-7-8 breathing before sleep',  done: false },
    { id: 'windows',   label: 'Covered windows for dark room',     done: false }
  ];
  const custom = load('custom_checklist', []);
  return [...base, ...custom.map(c => ({ ...c, done: false }))];
}
function updateStreak() {
  const stats = getStats();
  const today = dateStr();
  const yesterday = dateStr(new Date(Date.now() - 86400000));
  if (stats.lastSessionDate === today) return;
  stats.streak = stats.lastSessionDate === yesterday ? (stats.streak || 0) + 1 : 1;
  stats.longestStreak = Math.max(stats.streak, stats.longestStreak || 0);
  stats.lastSessionDate = today;
  stats.totalSessions = (stats.totalSessions || 0) + 1;
  store('current_stats', stats);
}
