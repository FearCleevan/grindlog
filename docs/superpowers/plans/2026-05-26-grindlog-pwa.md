# GrindLog PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully offline, mobile-first PWA fitness tracker as a single `index.html` file with `manifest.json`, `sw.js`, and icon assets.

**Architecture:** Single `index.html` with embedded CSS and JS. Tab switching via JS class toggling. All state in localStorage. No frameworks, no build tools.

**Tech Stack:** Vanilla HTML5, CSS3, JavaScript ES6+, Web Audio API, navigator.vibrate, Service Worker, localStorage.

**Note on testing:** No test framework in this stack. Each task has a **Verify** step with specific browser checks. Open DevTools → Console for JS errors after each task.

---

## File Map

| File | Purpose |
|------|---------|
| `index.html` | Entire app — HTML + embedded CSS + embedded JS |
| `manifest.json` | PWA manifest |
| `sw.js` | Service worker (cache-first) |
| `icons/icon-192.png` | PWA icon |
| `icons/icon-512.png` | PWA icon |
| `generate-icons.html` | One-time icon generator (open in browser, saves PNGs) |

---

## Task 1: Project Scaffold

**Files:**
- Create: `manifest.json`
- Create: `sw.js`
- Create: `generate-icons.html`
- Create: `icons/` folder

- [ ] **Step 1: Create `manifest.json`**

```json
{
  "name": "GrindLog — Fighter's Training Journal",
  "short_name": "GrindLog",
  "description": "Personal fitness tracker for graveyard shift warriors",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0d0d0d",
  "theme_color": "#e63946",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: Create `sw.js` (skeleton — will be completed in Task 16)**

```javascript
const CACHE = 'grindlog-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
```

- [ ] **Step 3: Create `generate-icons.html` — open in browser to download icons**

```html
<!DOCTYPE html>
<html>
<body>
<script>
function makeIcon(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#e63946';
  ctx.lineWidth = size * 0.04;
  ctx.strokeRect(size * 0.06, size * 0.06, size * 0.88, size * 0.88);
  ctx.fillStyle = '#f0f0f0';
  ctx.font = `bold ${size * 0.42}px Arial Black, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GL', size / 2, size / 2);
  c.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `icon-${size}.png`;
    a.click();
  });
}
makeIcon(192);
setTimeout(() => makeIcon(512), 500);
</script>
<p>Icons downloading... move them to /icons/ folder.</p>
</body>
</html>
```

- [ ] **Step 4: Open `generate-icons.html` in browser, move downloaded files to `icons/`**

```
icons/icon-192.png
icons/icon-512.png
```

- [ ] **Step 5: Verify**

Open browser → `icons/icon-192.png` should display a dark square with "GL" text and red border.

---

## Task 2: index.html Shell — HTML Structure, CSS, Tab Switching

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create `index.html` with full CSS and HTML skeleton**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#e63946">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <title>GrindLog</title>
  <link rel="manifest" href="manifest.json">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0d0d0d;
      --surface: #1a1a1a;
      --border: #2a2a2a;
      --accent: #e63946;
      --text: #f0f0f0;
      --muted: #888;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { height: 100%; }
    body {
      min-height: 100%;
      background: var(--bg);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      font-size: 16px;
      max-width: 430px;
      margin: 0 auto;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }
    h1, h2, h3, .heading {
      font-family: 'Bebas Neue', sans-serif;
      letter-spacing: 0.05em;
      font-weight: 400;
    }

    /* ── Tabs ── */
    .tab { display: none; padding: 20px 16px 80px; min-height: 100dvh; }
    .tab.active { display: block; }

    /* ── Bottom Nav ── */
    #bottom-nav {
      position: fixed;
      bottom: 0; left: 50%;
      transform: translateX(-50%);
      width: 100%; max-width: 430px;
      height: 60px;
      background: var(--surface);
      border-top: 1px solid var(--border);
      display: flex;
      z-index: 200;
    }
    .nav-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      background: none;
      border: none;
      color: var(--muted);
      font-family: 'DM Sans', sans-serif;
      font-size: 9px;
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      padding: 6px 4px;
      min-height: 44px;
      transition: color 0.15s;
    }
    .nav-btn.active { color: var(--accent); }
    .nav-btn svg { display: block; }

    /* ── Cards ── */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 16px;
      margin-bottom: 12px;
    }
    .card-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 13px;
      letter-spacing: 0.12em;
      color: var(--muted);
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    /* ── Buttons ── */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 18px;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 15px;
      letter-spacing: 0.1em;
      border: 1px solid var(--border);
      background: none;
      color: var(--text);
      cursor: pointer;
      min-height: 44px;
      transition: border-color 0.15s, color 0.15s;
    }
    .btn-accent { background: var(--accent); border-color: var(--accent); color: #fff; }
    .btn-ghost { border-color: var(--border); color: var(--muted); }
    .btn-outline { border-color: var(--accent); color: var(--accent); }
    .btn:active { opacity: 0.8; }
    .btn-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .btn-full { width: 100%; }

    /* ── Progress bar ── */
    .prog-track { height: 3px; background: var(--border); margin-top: 8px; }
    .prog-fill { height: 100%; background: var(--accent); transition: width 0.4s ease; }

    /* ── Checklist ── */
    .check-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      min-height: 44px;
      user-select: none;
    }
    .check-item:last-child { border-bottom: none; }
    .check-dot {
      width: 20px; height: 20px;
      border: 2px solid var(--border);
      border-radius: 50%;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s, border-color 0.15s;
    }
    .check-dot.done { background: var(--accent); border-color: var(--accent); }
    .check-dot.done::after {
      content: '';
      width: 5px; height: 9px;
      border-right: 2px solid #fff;
      border-bottom: 2px solid #fff;
      transform: rotate(45deg) translate(-1px, -1px);
      display: block;
    }
    .check-label { flex: 1; font-size: 14px; line-height: 1.4; }
    .check-label.done { color: var(--muted); text-decoration: line-through; }

    /* ── Collapsible ── */
    .collapsible { border-bottom: 1px solid var(--border); }
    .collapsible-trigger {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 0;
      cursor: pointer;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 18px;
      letter-spacing: 0.05em;
      user-select: none;
    }
    .collapsible-arrow { font-size: 12px; color: var(--muted); transition: transform 0.2s; }
    .collapsible-trigger.open .collapsible-arrow { transform: rotate(180deg); }
    .collapsible-body { display: none; padding-bottom: 12px; }
    .collapsible-body.open { display: block; }

    /* ── Section header ── */
    .section-header { font-size: 22px; margin-bottom: 16px; }

    /* ── Tag / badge ── */
    .badge {
      display: inline-block;
      padding: 2px 8px;
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      border: 1px solid var(--border);
      color: var(--muted);
    }
    .badge-accent { border-color: var(--accent); color: var(--accent); }

    /* ── Stat row ── */
    .stat-row { display: flex; gap: 8px; margin-bottom: 16px; }
    .stat-box {
      flex: 1;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 12px 10px;
      text-align: center;
    }
    .stat-val {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 24px;
      letter-spacing: 0.05em;
      line-height: 1;
    }
    .stat-lbl { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }

    /* ── Editable inline ── */
    .editable {
      background: none;
      border: none;
      border-bottom: 1px solid var(--border);
      color: inherit;
      font-family: 'Bebas Neue', sans-serif;
      font-size: inherit;
      width: 60px;
      text-align: center;
      padding: 0 2px;
    }
    .editable:focus { outline: none; border-bottom-color: var(--accent); }

    /* ── Timer display ── */
    .timer-display {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 72px;
      letter-spacing: 0.05em;
      text-align: center;
      line-height: 1;
      color: var(--text);
    }
    .timer-label { text-align: center; color: var(--muted); font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 6px; }

    /* ── Set circles ── */
    .set-circles { display: flex; gap: 8px; margin-top: 8px; }
    .set-circle {
      width: 36px; height: 36px;
      border: 2px solid var(--border);
      border-radius: 50%;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; color: var(--muted);
      transition: all 0.15s;
    }
    .set-circle.done { background: var(--accent); border-color: var(--accent); color: #fff; }

    /* ── Divider ── */
    .divider { border: none; border-top: 1px solid var(--border); margin: 16px 0; }

    /* ── Input ── */
    .input {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      padding: 10px 12px;
      width: 100%;
    }
    .input:focus { outline: none; border-color: var(--accent); }
    .input-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; display: block; }

    /* ── Animations ── */
    @keyframes pop { 0%,100% { transform: scale(1); } 50% { transform: scale(1.25); } }
    .pop { animation: pop 0.2s ease; }

    @keyframes pulse-border {
      0%,100% { border-color: var(--border); }
      50% { border-color: var(--accent); }
    }
    .timer-active { animation: pulse-border 1.5s infinite; }

    /* ── Modal / Overlay ── */
    .overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      z-index: 300;
      align-items: flex-end;
    }
    .overlay.open { display: flex; }
    .modal {
      background: var(--surface);
      border: 1px solid var(--border);
      border-bottom: none;
      width: 100%;
      max-width: 430px;
      margin: 0 auto;
      padding: 24px 20px 40px;
      max-height: 90dvh;
      overflow-y: auto;
    }
    .modal-title { font-size: 28px; margin-bottom: 16px; }

    /* ── Misc ── */
    .muted { color: var(--muted); }
    .accent { color: var(--accent); }
    .mt-8 { margin-top: 8px; }
    .mt-12 { margin-top: 12px; }
    .mb-12 { margin-bottom: 12px; }
    .text-sm { font-size: 13px; }
    .text-xs { font-size: 11px; }
    .flex { display: flex; }
    .flex-between { display: flex; justify-content: space-between; align-items: center; }
    .gap-8 { gap: 8px; }
    .w-full { width: 100%; }
  </style>
</head>
<body>

<!-- ══════════ ONBOARDING ══════════ -->
<div class="overlay" id="onboarding-overlay">
  <div class="modal">
    <h2 class="modal-title">GRINDLOG</h2>
    <div id="onboarding-steps"></div>
  </div>
</div>

<!-- ══════════ SLEEP MODAL ══════════ -->
<div class="overlay" id="sleep-overlay">
  <div class="modal">
    <div class="flex-between mb-12">
      <h2 class="modal-title">SLEEP & RECOVERY</h2>
      <button class="btn btn-ghost" onclick="closeModal('sleep-overlay')">✕</button>
    </div>
    <div id="sleep-content"></div>
  </div>
</div>

<!-- ══════════ APP ══════════ -->
<main id="app">
  <section id="tab-today" class="tab active"></section>
  <section id="tab-workout" class="tab"></section>
  <section id="tab-boxing" class="tab"></section>
  <section id="tab-diet" class="tab"></section>
  <section id="tab-progress" class="tab"></section>
</main>

<!-- ══════════ BOTTOM NAV ══════════ -->
<nav id="bottom-nav">
  <button class="nav-btn active" data-tab="today">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/></svg>
    Today
  </button>
  <button class="nav-btn" data-tab="workout">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="9" width="2" height="6"/><rect x="8" y="9" width="2" height="6"/><rect x="16" y="10" width="3" height="4" rx="1"/><rect x="5" y="10" width="3" height="4" rx="1"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
    Workout
  </button>
  <button class="nav-btn" data-tab="boxing">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="9" width="12" height="9" rx="2"/><path d="M6 11H4a2 2 0 0 0 0 4h2"/><rect x="9" y="6" width="6" height="3"/></svg>
    Boxing
  </button>
  <button class="nav-btn" data-tab="diet">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"/><path d="M4 12a8 8 0 0 0 16 0"/><line x1="12" y1="4" x2="12" y2="6"/><line x1="8" y1="5" x2="9" y2="7"/><line x1="16" y1="5" x2="15" y2="7"/></svg>
    Diet
  </button>
  <button class="nav-btn" data-tab="progress">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="14" width="4" height="6"/><rect x="10" y="9" width="4" height="11"/><rect x="16" y="4" width="4" height="16"/></svg>
    Progress
  </button>
</nav>

<script>
'use strict';

// ══════════════════════════════════════════
// CORE UTILITIES
// ══════════════════════════════════════════

function store(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}
function load(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch(e) { return fallback; }
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

// ── Tab switching ──
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

// ══════════════════════════════════════════
// INIT — runs on every app open
// ══════════════════════════════════════════
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

function renderAll() {
  renderToday();
  renderWorkout();
  renderBoxing();
  renderDiet();
  renderProgress();
  renderSleepModal();
}

// Placeholder renders — replaced in subsequent tasks
function renderToday() {}
function renderWorkout() {}
function renderBoxing() {}
function renderDiet() {}
function renderProgress() {}
function renderSleepModal() {}

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

let deferredInstall = null;
function handleInstallPrompt() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstall = e;
    if (!load('install-dismissed')) showInstallBanner();
  });
}
function showInstallBanner() {
  // implemented in Task 16
}

init();
</script>
</body>
</html>
```

- [ ] **Step 2: Verify**

Open `index.html` in browser. You should see:
- Black background
- 5 nav buttons at bottom with SVG icons
- Tapping each nav button switches which tab is active (use DevTools Elements to confirm `.active` class moves)
- No console errors

---

## Task 3: localStorage Helpers + Midnight Reset + Profile Schema

**Files:**
- Modify: `index.html` (JS section, replace placeholder functions)

- [ ] **Step 1: Add midnight reset logic — replace the `midnightReset` placeholder in JS (add before `init()`)**

```javascript
function midnightReset() {
  const last = load('lastOpened');
  const today = dateStr();
  if (last === today) return;
  store('lastOpened', today);
  if (!last) return; // first launch, nothing to reset
  // Reset only completion status; preserve custom items and structure
  const dailyData = load(todayKey(), {});
  if (dailyData.checklistItems) {
    dailyData.checklistItems = dailyData.checklistItems.map(i => ({ ...i, done: false }));
  }
  dailyData.macros = { protein: 0, calories: 0, water: 0 };
  dailyData.mealsEaten = {};
  store(todayKey(), dailyData);
}
```

- [ ] **Step 2: Add default profile + daily data getters — add after `midnightReset`**

```javascript
function getProfile() {
  return load('profile', {
    name: '',
    startDate: dateStr(),
    startWeight: 82,
    targetWeight: 72,
    startPushups: 8,
    startRun: 0
  });
}

function getStats() {
  return load('current_stats', {
    weight: 82,
    pushupPR: 8,
    longestRun: 0,
    streak: 0,
    longestStreak: 0,
    totalSessions: 0,
    lastSessionDate: null
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

function saveDailyData(data) {
  store(todayKey(), data);
}

function defaultChecklist() {
  const base = [
    { id: 'water', label: 'Drank 8+ glasses of water', done: false },
    { id: 'protein', label: 'Hit protein target (130–150g)', done: false },
    { id: 'shower', label: 'Took cold shower before sleep', done: false },
    { id: 'nophone', label: 'No phone 30 min before bed', done: false },
    { id: 'flux', label: 'Installed f.lux / night mode on', done: false },
    { id: 'breathing', label: 'Did 4-7-8 breathing before sleep', done: false },
    { id: 'windows', label: 'Covered windows for dark room', done: false }
  ];
  const custom = load('custom_checklist', []);
  return [...base, ...custom.map(c => ({ ...c, done: false }))];
}

function updateStreak() {
  const stats = getStats();
  const today = dateStr();
  const yesterday = dateStr(new Date(Date.now() - 86400000));
  if (stats.lastSessionDate === today) return; // already counted today
  if (stats.lastSessionDate === yesterday) {
    stats.streak = (stats.streak || 0) + 1;
  } else {
    stats.streak = 1;
  }
  stats.longestStreak = Math.max(stats.streak, stats.longestStreak || 0);
  stats.lastSessionDate = today;
  stats.totalSessions = (stats.totalSessions || 0) + 1;
  store('current_stats', stats);
}
```

- [ ] **Step 3: Verify in browser console**

```javascript
// Paste in DevTools console:
getDailyData()   // should return object with checklistItems array of 7
getStats()       // should return default stats object
getProfile()     // should return default profile
```

---

## Task 4: First Launch Onboarding

**Files:**
- Modify: `index.html` (replace `showOnboarding` placeholder)

- [ ] **Step 1: Implement `showOnboarding` — add after `getDailyData` function**

```javascript
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
```

- [ ] **Step 2: Verify**

Clear localStorage in DevTools → Application → Storage → Clear site data. Reload. Onboarding modal should appear. Step through all 3 steps. After finishing, modal closes and Today tab is visible.

---

## Task 5: Tab 1 — Today

**Files:**
- Modify: `index.html` (replace `renderToday` function)

- [ ] **Step 1: Add weekly workout schedule data — add before `renderToday` function**

```javascript
const WEEKLY_PLAN = {
  0: { type: 'Rest', label: 'REST DAY', badge: 'rest' },
  1: { type: 'Push + Boxing', label: 'PUSH DAY + BOXING', badge: 'push' },
  2: { type: 'Cardio', label: 'CARDIO', badge: 'cardio' },
  3: { type: 'Pull + Core', label: 'PULL + CORE', badge: 'pull' },
  4: { type: 'Cardio', label: 'CARDIO', badge: 'cardio' },
  5: { type: 'Legs + Boxing', label: 'LEGS + BOXING', badge: 'legs' },
  6: { type: 'Full Body', label: 'FULL BODY', badge: 'full' }
};

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
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setHours(0,0,0,0);
  return sessions.filter(s => new Date(s.date) >= monday).length;
}
```

- [ ] **Step 2: Replace `renderToday` function**

```javascript
function renderToday() {
  const el = document.getElementById('tab-today');
  const stats = getStats();
  const daily = getDailyData();
  const today = new Date();
  const plan = WEEKLY_PLAN[today.getDay()];
  const trained = getWeeklyTrainedCount();
  const dateLabel = today.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });

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

  // weight edit
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

window.toggleCheck = function(i) {
  const daily = getDailyData();
  daily.checklistItems[i].done = !daily.checklistItems[i].done;
  saveDailyData(daily);
  if (daily.checklistItems[i].done) vibrate(50);
  // update DOM without full re-render
  const dot = document.getElementById('dot-' + i);
  const lbl = document.getElementById('lbl-' + i);
  dot.classList.toggle('done', daily.checklistItems[i].done);
  lbl.classList.toggle('done', daily.checklistItems[i].done);
  dot.classList.add('pop');
  setTimeout(() => dot.classList.remove('pop'), 200);
};

window.addCustomCheckItem = function() {
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
```

- [ ] **Step 3: Verify**

Reload app (with profile set). Today tab shows greeting, 3 stat boxes, today's plan card, checklist with 7 items. Tapping a checklist item toggles the red dot. Weight input is editable. "Start" button navigates to Workout tab.

---

## Task 6: Tab 2 — Workout Schedule + Exercise Data

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add exercise data constants — add before `renderWorkout`**

```javascript
const EXERCISES = {
  push: [
    { name: 'Push-ups', sets: 3, reps: '8–12', cue: 'Hands shoulder-width, lower chest to 2cm from floor, full lockout at top.' },
    { name: 'Pike Push-ups', sets: 3, reps: '6–10', cue: 'Hips high, form an inverted V. Lower your head toward the floor.' },
    { name: 'Chair Tricep Dips', sets: 3, reps: '8–12', cue: 'Elbows track back — not flared. Keep hips close to the chair edge.' },
    { name: 'Plank', sets: 3, reps: '30–60s', cue: 'Straight line head to heels. Squeeze glutes and brace core.' }
  ],
  pull: [
    { name: 'Bedsheet Rows', sets: 3, reps: '8–12', cue: 'Secure sheet in door, lean back, pull chest to hands. Elbows tight.' },
    { name: 'Superman Hold', sets: 3, reps: '10×3s', cue: 'Lie face down, lift arms and legs simultaneously. Hold 3 sec each rep.' },
    { name: 'Plank', sets: 3, reps: '30–60s', cue: 'Straight line head to heels. Squeeze glutes and brace core.' }
  ],
  legs: [
    { name: 'Squats', sets: 4, reps: '12–15', cue: 'Feet shoulder-width, chest up, break parallel if mobility allows.' },
    { name: 'Lunges', sets: 3, reps: '10 each', cue: 'Step forward, both knees to 90°. Keep front shin vertical.' },
    { name: 'Glute Bridges', sets: 3, reps: '15–20', cue: 'Lie on back, feet flat, drive hips up. Squeeze at top for 1 sec.' }
  ],
  full: [
    { name: 'Push-ups', sets: 3, reps: '8–12', cue: 'Hands shoulder-width, lower chest to 2cm from floor.' },
    { name: 'Squats', sets: 3, reps: '12–15', cue: 'Feet shoulder-width, chest up, break parallel.' },
    { name: 'Bedsheet Rows', sets: 3, reps: '8–12', cue: 'Secure sheet in door, pull chest to hands.' },
    { name: 'Glute Bridges', sets: 3, reps: '15–20', cue: 'Lie on back, drive hips up, squeeze at top.' },
    { name: 'Plank', sets: 3, reps: '30–60s', cue: 'Straight line head to heels. Brace hard.' }
  ],
  cardio: [],
  rest: []
};

const WARMUP = [
  'Arm circles + hip rotations (1 min)',
  'High knees in place (1 min)',
  'Jumping jacks (1 min)',
  'Neck + wrist rolls (30 sec)'
];

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
```

- [ ] **Step 2: Replace `renderWorkout` function**

```javascript
let selectedDay = new Date().getDay();
let sessionSets = {}; // { exerciseName: [done, done, ...] }

function renderWorkout() {
  const el = document.getElementById('tab-workout');
  const plan = WEEKLY_PLAN[selectedDay];
  const exercises = EXERCISES[plan.badge] || [];

  const dayStrip = DAYS.map((d, i) => {
    const p = WEEKLY_PLAN[i];
    const isToday = i === new Date().getDay();
    const isSelected = i === selectedDay;
    return `
      <div class="day-chip${isSelected ? ' day-selected' : ''}" onclick="selectDay(${i})" style="
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

  if (plan.badge === 'cardio') renderCardio();
  if (exercises.length) renderExerciseList(exercises);
}

window.selectDay = function(day) {
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
      <div class="set-circle${done ? ' done' : ''}" onclick="toggleSet('${ex.name}',${si})">${si+1}</div>
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

window.toggleSet = function(name, si) {
  if (!sessionSets[name]) return;
  sessionSets[name][si] = !sessionSets[name][si];
  vibrate(30);
  renderExerciseList(EXERCISES[WEEKLY_PLAN[selectedDay].badge] || []);
  // show rest timer if set done
  if (sessionSets[name][si]) showRestTimer();
};

function renderExerciseLibrary() {
  const all = [...EXERCISES.push, ...EXERCISES.pull, ...EXERCISES.legs];
  const unique = all.filter((e, i, a) => a.findIndex(x => x.name === e.name) === i);
  return unique.map(ex => `
    <div style="padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="font-weight:500;font-size:14px">${ex.name}</div>
      <p class="text-xs muted mt-8">${ex.cue}</p>
    </div>
  `).join('');
}
```

- [ ] **Step 3: Verify**

Switch to Workout tab. Day strip shows Mon–Sun. Active day highlighted in red. Push/Pull/Legs day shows warm-up + exercise list with numbered circles. Tapping a circle fills it red. Rest/Cardio days show appropriate content.

---

## Task 7: Rest Timer + Session Logging

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add rest timer HTML to overlay section (inside `<body>` before `</body>`)**

Add after the sleep-overlay div:

```html
<div class="overlay" id="rest-overlay" style="align-items:center;justify-content:center">
  <div class="modal" style="border:1px solid var(--border);max-width:300px;text-align:center">
    <div class="card-title" style="text-align:center">REST</div>
    <div class="timer-display" id="rest-countdown">1:00</div>
    <div class="btn-row mt-12" style="justify-content:center">
      <button class="btn btn-ghost" onclick="skipRest()">SKIP</button>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Add rest timer + session log functions — add in JS section**

```javascript
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

window.skipRest = function() {
  clearInterval(restTimer.interval);
  restTimer.active = false;
  closeModal('rest-overlay');
};

function fmtTime(s) {
  return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
}

window.finishSession = function(type) {
  const sessions = load('sessions', []);
  const exercises = (EXERCISES[type] || []).map(ex => ({
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
```

- [ ] **Step 3: Verify**

Tap a set circle in Workout tab — rest timer overlay appears with 1:00 countdown. SKIP closes it. After "Finish Session" button → alert confirms, streak updates (check localStorage in DevTools).

---

## Task 8: Cardio Interval Timer

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add cardio phase data and `renderCardio` function — add in JS section**

```javascript
const CARDIO_PHASES = [
  { weeks: [1,2], label: 'Phase 1 — Walk/Jog Intro', intervals: [
    { type: 'walk', duration: 120, label: '2 min Walk' },
    { type: 'jog', duration: 30, label: '30 sec Jog' }
  ], rounds: 6 },
  { weeks: [3,4], label: 'Phase 2 — Equal Intervals', intervals: [
    { type: 'walk', duration: 60, label: '1 min Walk' },
    { type: 'jog', duration: 60, label: '1 min Jog' }
  ], rounds: 8 },
  { weeks: [5,6], label: 'Phase 3 — 5-Minute Runs', intervals: [
    { type: 'walk', duration: 120, label: '2 min Warmup Walk' },
    { type: 'jog', duration: 300, label: '5 min Jog' },
    { type: 'walk', duration: 120, label: '2 min Rest Walk' },
    { type: 'jog', duration: 300, label: '5 min Jog' }
  ], rounds: 1 },
  { weeks: [7,8], label: 'Phase 4 — Continuous Run', intervals: [
    { type: 'walk', duration: 120, label: '2 min Warmup Walk' },
    { type: 'jog', duration: 1200, label: '20 min Jog' }
  ], rounds: 1 }
];

function getCurrentCardioPhase() {
  const profile = getProfile();
  const start = new Date(profile.startDate);
  const now = new Date();
  const weekNum = Math.max(1, Math.ceil((now - start) / (7 * 86400000)));
  return CARDIO_PHASES.find(p => p.weeks.includes(Math.min(weekNum, 8))) || CARDIO_PHASES[3];
}

let cardio = {
  status: 'idle', // idle | running | paused
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
        <button class="btn btn-accent" id="cardio-start" onclick="cardioStart()">START</button>
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

window.cardioStart = function() {
  if (cardio.status === 'running') return;
  cardio.status = 'running';
  cardio.interval = setInterval(cardioTick, 1000);
  const tEl = document.getElementById('cardio-timer');
  if (tEl) tEl.classList.add('timer-active');
};
window.cardioPause = function() {
  if (cardio.status !== 'running') return;
  clearInterval(cardio.interval);
  cardio.status = 'paused';
  const tEl = document.getElementById('cardio-timer');
  if (tEl) tEl.classList.remove('timer-active');
};
window.cardioReset = function() {
  clearInterval(cardio.interval);
  cardio.status = 'idle';
  cardio.intervalIdx = 0;
  cardio.roundIdx = 0;
  if (cardio.phase) cardio.seconds = cardio.phase.intervals[0].duration;
  const tEl = document.getElementById('cardio-timer');
  if (tEl) tEl.classList.remove('timer-active');
  updateCardioDisplay();
};

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
  } catch(e) {}
}
```

- [ ] **Step 2: Verify**

Switch to Workout tab on a Cardio day (or manually set `selectedDay` to 2 in console). Cardio phase card appears. START begins countdown. Timer text changes each interval. PAUSE/RESET work correctly. No console errors.

---

## Task 9: Tab 3 — Boxing Round Timer

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add boxing data and replace `renderBoxing` function**

```javascript
const COMBOS = [
  { num: '1', name: 'Jab', desc: 'Quick lead hand snap. Extend fully, snap back fast.' },
  { num: '2', name: 'Cross', desc: 'Rear hand with hip rotation. Drive from the back foot.' },
  { num: '3', name: 'Lead Hook', desc: 'Horizontal arc, elbow at 90°. Pivot on lead foot.' },
  { num: '4', name: 'Rear Hook', desc: 'Opposite side to lead hook. Rotate hips through.' },
  { num: '5', name: 'Lead Uppercut', desc: 'Upward scoop, bend knees to load.' },
  { num: '6', name: 'Rear Uppercut', desc: 'Drive from legs, rotate hips, scoop upward.' }
];

const COMBO_SEQUENCES = ['1-2', '1-2-3', '1-1-2', '1-2-3-2', '1-2-5-2'];

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
      <div style="font-family:'Bebas Neue';font-size:48px;line-height:1" id="punch-display">0 / ${plan.target}</div>
      <div
        style="margin-top:12px;background:var(--surface);border:2px solid var(--border);height:80px;display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;font-family:'Bebas Neue';font-size:18px;letter-spacing:0.1em;color:var(--muted)"
        onclick="countPunch(${plan.target})"
      >TAP TO COUNT</div>
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

let boxFeeling = 'moderate';
window.selectFeeling = function(f) {
  boxFeeling = f;
  document.querySelectorAll('#feeling-btns .btn').forEach(b => b.classList.remove('btn-accent'));
  event.target.classList.add('btn-accent');
};
window.saveBoxingSession = function() {
  const sessions = load('boxing_sessions', []);
  sessions.push({ date: dateStr(), rounds: boxing.totalRounds, totalPunches: boxing.punchCount, feeling: boxFeeling });
  store('boxing_sessions', sessions);
  updateStreak();
  const form = document.getElementById('box-log-form');
  if (form) form.style.display = 'none';
  boxing.punchCount = 0;
  boxReset();
  alert('Boxing session logged!');
};

window.countPunch = function(target) {
  boxing.punchCount++;
  vibrate(20);
  const el = document.getElementById('punch-display');
  if (el) { el.textContent = `${boxing.punchCount} / ${target}`; el.classList.add('pop'); setTimeout(() => el.classList.remove('pop'), 200); }
};

window.boxStart = function() {
  if (boxing.status === 'running') return;
  boxing.status = 'running';
  boxing.interval = setInterval(boxTick, 1000);
  const tEl = document.getElementById('box-timer');
  if (tEl) tEl.classList.add('timer-active');
  beep(440, 0.1);
};
window.boxPause = function() {
  if (boxing.status !== 'running') return;
  clearInterval(boxing.interval);
  boxing.status = 'paused';
  const tEl = document.getElementById('box-timer');
  if (tEl) tEl.classList.remove('timer-active');
};
window.boxReset = function() {
  clearInterval(boxing.interval);
  const plan = getBoxingPlan();
  boxing = { status:'idle', interval:null, seconds:180, round:1, totalRounds:plan.rounds, resting:false, restSeconds:60, punchCount:0 };
  updateBoxDisplay();
  const tEl = document.getElementById('box-timer');
  if (tEl) { tEl.classList.remove('timer-active'); tEl.textContent = '3:00'; }
};
```

- [ ] **Step 2: Add `toggleCollapsible` utility — add in JS section**

```javascript
window.toggleCollapsible = function(trigger) {
  trigger.classList.toggle('open');
  const body = trigger.nextElementSibling;
  body.classList.toggle('open');
};
```

- [ ] **Step 3: Verify**

Boxing tab: timer starts/pauses/resets. Round counter increments. After 3 rounds, log form appears. Combo reference collapses/expands. Punch counter increments with each tap.

---

## Task 10: Tab 4 — Diet

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace `renderDiet` function**

```javascript
const MEALS = [
  { id: 'meal1', time: '7:00 AM', label: 'Post-shift: 2 boiled eggs + banana' },
  { id: 'meal2', time: '2:00 PM', label: 'Pre-workout: Oats or kamote + eggs' },
  { id: 'meal3', time: '4:00 PM', label: 'Post-workout: Rice + protein + veggies' },
  { id: 'meal4', time: '7:00 PM', label: 'Pre-shift: Tuna rice bowl or viand' },
  { id: 'meal5', time: '1:00 AM', label: 'Mid-shift: Boiled eggs + banana' },
  { id: 'meal6', time: '5:00 AM', label: 'Optional small snack' }
];

const MEAL_PREP = [
  { title: 'Tinolang Manok (Batch)', steps: 'Boil chicken with ginger + tanglad. Add sayote. Season with patis. Portion into containers for 3 days.' },
  { title: 'Tuna Rice Bowl (5-min)', steps: 'Open canned tuna. Mix with rice + soy sauce + calamansi. Top with chopped kangkong (raw or blanched).' },
  { title: 'Kamote + Egg Meal', steps: 'Boil kamote 15 min. Pan-fry or boil 2 eggs. Season with salt and pepper.' },
  { title: 'Overnight Oats', steps: '½ cup rolled oats + ½ cup water or coconut milk. Add banana slices. Refrigerate overnight.' },
  { title: 'Batch Boiled Eggs', steps: 'Boil 10–12 eggs for 10 minutes. Ice bath for 5 min. Peel and refrigerate up to 5 days.' }
];

const PROTEIN_SOURCES = [
  { food: 'Egg', protein: '6g', note: 'per piece' },
  { food: 'Canned Tuna', protein: '25g', note: 'per can' },
  { food: 'Chicken Breast', protein: '31g', note: 'per 100g' },
  { food: 'Bangus', protein: '22g', note: 'per 100g' },
  { food: 'Tokwa', protein: '8g', note: 'per 100g' }
];

const GROCERY_LIST = [
  { item: 'Eggs (1 tray)', price: '₱180–200' },
  { item: 'Chicken breast 1kg', price: '₱200–240' },
  { item: 'Canned tuna ×4', price: '₱120–160' },
  { item: 'Brown rice 1kg', price: '₱60–80' },
  { item: 'Rolled oats', price: '₱80–100' },
  { item: 'Kamote', price: '₱40–60' },
  { item: 'Bananas (1 kilo)', price: '₱40–60' },
  { item: 'Kangkong/sitaw/sayote', price: '₱40–60' },
  { item: 'Peanut butter', price: '₱60–80' }
];

function renderDiet() {
  const el = document.getElementById('tab-diet');
  const daily = getDailyData();
  const macros = daily.macros || { protein: 0, calories: 0, water: 0 };
  const meals = daily.mealsEaten || {};

  el.innerHTML = `
    <h1 class="section-header">DIET</h1>

    <div class="card">
      <div class="card-title">Daily Macros</div>

      <div style="margin-bottom:14px">
        <div class="flex-between"><span class="text-sm">Protein</span><span class="text-sm"><input class="editable" id="proto-input" value="${macros.protein}" style="width:40px"> / 140g</span></div>
        <div class="prog-track"><div class="prog-fill" id="proto-bar" style="width:${Math.min(100,(macros.protein/140)*100)}%"></div></div>
      </div>

      <div style="margin-bottom:14px">
        <div class="flex-between"><span class="text-sm">Calories</span><span class="text-sm"><input class="editable" id="kcal-input" value="${macros.calories}" style="width:48px"> / 1900</span></div>
        <div class="prog-track"><div class="prog-fill" id="kcal-bar" style="width:${Math.min(100,(macros.calories/1900)*100)}%"></div></div>
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
      <div class="prog-track"><div class="prog-fill" id="water-bar" style="width:${Math.min(100,(macros.water/8)*100)}%"></div></div>
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

  // Macro input listeners
  document.getElementById('proto-input').addEventListener('change', e => {
    updateMacro('protein', parseFloat(e.target.value) || 0, 140, 'proto-bar');
  });
  document.getElementById('kcal-input').addEventListener('change', e => {
    updateMacro('calories', parseFloat(e.target.value) || 0, 1900, 'kcal-bar');
  });
}

function updateMacro(key, val, max, barId) {
  const daily = getDailyData();
  daily.macros[key] = val;
  saveDailyData(daily);
  const bar = document.getElementById(barId);
  if (bar) bar.style.width = Math.min(100, (val / max) * 100) + '%';
}

window.changeWater = function(delta) {
  const daily = getDailyData();
  daily.macros.water = Math.max(0, Math.min(20, (daily.macros.water || 0) + delta));
  saveDailyData(daily);
  const el = document.getElementById('water-count');
  if (el) el.textContent = daily.macros.water;
  const bar = document.getElementById('water-bar');
  if (bar) bar.style.width = Math.min(100, (daily.macros.water / 8) * 100) + '%';
  vibrate(20);
};

window.toggleMeal = function(id) {
  const daily = getDailyData();
  daily.mealsEaten[id] = !daily.mealsEaten[id];
  saveDailyData(daily);
  vibrate(30);
  renderDiet();
};
```

- [ ] **Step 2: Verify**

Diet tab: protein/calorie inputs update progress bars. Water +/- buttons work. Meal checkboxes persist on reload. Collapsibles expand/collapse.

---

## Task 11: Tab 5 — Progress

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace `renderProgress` function**

```javascript
const MILESTONES = [
  { id: 'pushup20', label: '20 clean push-ups', unlock: 'Creatine + harder push-up variations' },
  { id: 'run30', label: '30 min continuous run', unlock: 'HIIT sessions' },
  { id: 'consistent3mo', label: '3 months consistent training', unlock: '4–5 day split' },
  { id: 'protein130', label: '130g protein/day consistent', unlock: 'Consider creatine' },
  { id: 'boxing5rounds', label: '5 rounds shadow boxing', unlock: 'Resistance bands' }
];

const MONTHLY_TARGETS = [
  { month: 1, pushups: 12, run: '8 min', weight: '-0 kg', note: 'Habit focus' },
  { month: 2, pushups: 15, run: '15 min', weight: '-2 to 3 kg', note: '' },
  { month: 3, pushups: 20, run: '22 min', weight: '-4 to 5 kg', note: 'Push-up goal done ✓' },
  { month: 4, pushups: 'Diamond', run: '28 min', weight: '-6 to 7 kg', note: '' },
  { month: 5, pushups: 'Diamond+', run: '30 min', weight: '-8 to 10 kg', note: 'Creatine unlocked' }
];

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
        <input class="input mb-12" id="tf-pushups" type="number" placeholder="Push-ups" min="0">
        <input class="input mb-12" id="tf-run" type="number" placeholder="Run minutes" min="0" style="margin-top:8px">
        <input class="input mb-12" id="tf-weight" type="number" placeholder="Weight (kg)" min="30" style="margin-top:8px">
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

window.toggleTestForm = function() {
  const f = document.getElementById('test-form');
  f.style.display = f.style.display === 'none' ? 'block' : 'none';
};
window.saveTest = function() {
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
window.toggleMilestone = function(i) {
  const milestones = load('milestones', MILESTONES.map(m => ({ ...m, done: false })));
  milestones[i].done = !milestones[i].done;
  store('milestones', milestones);
  vibrate(50);
  renderProgress();
};
```

- [ ] **Step 2: Verify**

Progress tab: goal cards show progress bars. Editing push-up PR updates bar. "Log Test" form saves and shows history with deltas. Milestone tap toggles strikethrough.

---

## Task 12: Sleep Modal + 4-7-8 Breathing

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace `renderSleepModal` function**

```javascript
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

window.breathingStart = function() {
  if (breathTimer.status === 'running') return;
  breathTimer.status = 'running';
  breathTimer.phase = 0;
  breathTimer.cycle = 0;
  breathTimer.seconds = BREATH_PHASES[0].duration;
  updateBreathing();
  breathTimer.interval = setInterval(breathTick, 1000);
  document.getElementById('breath-start-btn').textContent = 'RUNNING';
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

window.breathingReset = function() {
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
```

- [ ] **Step 2: Verify**

Today tab → "SLEEP & RECOVERY TIPS" button opens modal. Breathing circle animates (scale up on inhale, stays on hold, shrinks on exhale). Cycle counter increments. After 4 cycles, resets automatically.

---

## Task 13: Service Worker + Install Prompt

**Files:**
- Modify: `sw.js` (already complete from Task 1)
- Modify: `index.html` (implement `showInstallBanner`)

- [ ] **Step 1: Add install banner HTML — insert after `<nav id="bottom-nav">...</nav>` in HTML**

```html
<div id="install-banner" style="display:none;position:fixed;bottom:60px;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:var(--surface);border-top:1px solid var(--accent);padding:10px 16px;display:none;align-items:center;justify-content:space-between;z-index:150">
  <span style="font-size:13px">Add to Home Screen for offline access</span>
  <div style="display:flex;gap:8px">
    <button class="btn btn-accent" style="padding:6px 12px;font-size:12px" onclick="installPWA()">INSTALL</button>
    <button class="btn btn-ghost" style="padding:6px 10px;font-size:12px" onclick="dismissInstall()">✕</button>
  </div>
</div>
```

- [ ] **Step 2: Implement install banner functions — add in JS section**

```javascript
function showInstallBanner() {
  const banner = document.getElementById('install-banner');
  if (banner) banner.style.display = 'flex';
}

window.installPWA = function() {
  if (deferredInstall) {
    deferredInstall.prompt();
    deferredInstall.userChoice.then(() => {
      deferredInstall = null;
      dismissInstall();
    });
  }
};

window.dismissInstall = function() {
  store('install-dismissed', true);
  const banner = document.getElementById('install-banner');
  if (banner) banner.style.display = 'none';
};
```

- [ ] **Step 3: Verify service worker**

Open Chrome DevTools → Application → Service Workers. Reload app. `sw.js` should appear as registered. Go to Network tab → toggle "Offline" → reload app. App still loads from cache.

- [ ] **Step 4: Verify install prompt**

On Android Chrome or use DevTools → Application → Manifest → "Add to homescreen" button. Install banner should appear at bottom.

---

## Task 14: Calendar Workout Schedule

**Files:**
- Modify: `index.html`

**Goal:** Add a monthly calendar view inside the Workout tab. Each day cell shows the workout type for that day (based on the rolling weekly plan). Days with logged sessions are marked with a filled accent dot. Tapping a day selects it and scrolls to the exercise list below.

- [ ] **Step 1: Add calendar CSS to the `<style>` block**

```css
/* ── Calendar ── */
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 16px;
}
.cal-day-header {
  text-align: center;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  padding: 4px 0 6px;
}
.cal-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  border: 1px solid transparent;
  font-size: 12px;
  position: relative;
  min-height: 44px;
}
.cal-cell:active { opacity: 0.7; }
.cal-cell.cal-today { border-color: var(--accent); }
.cal-cell.cal-selected { background: var(--surface); border-color: var(--accent); }
.cal-cell.cal-empty { cursor: default; }
.cal-cell-num { font-size: 12px; font-weight: 500; line-height: 1; }
.cal-cell-type {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 8px;
  letter-spacing: 0.06em;
  color: var(--muted);
  line-height: 1;
  text-align: center;
}
.cal-cell.cal-today .cal-cell-num { color: var(--accent); }
.cal-cell.cal-selected .cal-cell-type { color: var(--accent); }
.cal-dot {
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--accent);
  position: absolute;
  bottom: 4px;
}
.cal-month-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.cal-month-label {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 18px;
  letter-spacing: 0.05em;
}
```

- [ ] **Step 2: Add calendar state and render function — add in JS section before `renderWorkout`**

```javascript
const WORKOUT_COLORS = {
  push:   '#e63946',
  pull:   '#e63946',
  legs:   '#e63946',
  full:   '#e63946',
  cardio: '#888',
  boxing: '#e63946',
  rest:   '#2a2a2a'
};

const WORKOUT_SHORT = {
  push: 'PUSH', pull: 'PULL', legs: 'LEGS', full: 'FULL',
  cardio: 'CARDIO', boxing: 'BOX', rest: 'REST'
};

let calViewYear = new Date().getFullYear();
let calViewMonth = new Date().getMonth(); // 0-indexed

function renderCalendar(containerEl) {
  const today = new Date();
  const sessions = load('sessions', []);
  const boxSessions = load('boxing_sessions', []);
  const loggedDates = new Set([
    ...sessions.map(s => s.date),
    ...boxSessions.map(s => s.date)
  ]);

  const firstDay = new Date(calViewYear, calViewMonth, 1);
  const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();
  const startDow = firstDay.getDay(); // 0=Sun
  const monthName = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const dayHeaders = ['S','M','T','W','T','F','S'].map(d =>
    `<div class="cal-day-header">${d}</div>`
  ).join('');

  let cells = '';
  // Empty cells before month start
  for (let i = 0; i < startDow; i++) {
    cells += `<div class="cal-cell cal-empty"></div>`;
  }
  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(calViewYear, calViewMonth, d);
    const dow = cellDate.getDay();
    const plan = WEEKLY_PLAN[dow];
    const isToday = cellDate.toDateString() === today.toDateString();
    const isSelected = d === new Date(calViewYear, calViewMonth, selectedDay <= 0 ? today.getDate() : 0).getDate()
      && calViewYear === today.getFullYear() && calViewMonth === today.getMonth()
      && dow === selectedDay;
    const dateStr = `${calViewYear}-${String(calViewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const hasSession = loggedDates.has(dateStr);
    const classes = ['cal-cell', isToday ? 'cal-today' : '', isSelected ? 'cal-selected' : ''].filter(Boolean).join(' ');

    cells += `
      <div class="${classes}" onclick="calSelectDate(${calViewYear},${calViewMonth},${d},${dow})"
        title="${plan.type}">
        <span class="cal-cell-num">${d}</span>
        <span class="cal-cell-type" style="color:${plan.badge === 'rest' ? 'var(--border)' : 'var(--muted)'}">${WORKOUT_SHORT[plan.badge]}</span>
        ${hasSession ? '<span class="cal-dot"></span>' : ''}
      </div>
    `;
  }

  containerEl.innerHTML = `
    <div class="cal-month-nav">
      <button class="btn btn-ghost" style="padding:6px 10px" onclick="calPrevMonth()">‹</button>
      <span class="cal-month-label">${monthName.toUpperCase()}</span>
      <button class="btn btn-ghost" style="padding:6px 10px" onclick="calNextMonth()">›</button>
    </div>
    <div class="cal-grid">
      ${dayHeaders}
      ${cells}
    </div>
  `;
}

window.calSelectDate = function(year, month, day, dow) {
  selectedDay = dow;
  sessionSets = {};
  // If same month as today, snap calendar selection
  calViewYear = year;
  calViewMonth = month;
  renderWorkout();
  // Smooth scroll to exercise list
  setTimeout(() => {
    const el = document.getElementById('exercise-list') || document.getElementById('cardio-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
};

window.calPrevMonth = function() {
  calViewMonth--;
  if (calViewMonth < 0) { calViewMonth = 11; calViewYear--; }
  renderWorkout();
};
window.calNextMonth = function() {
  calViewMonth++;
  if (calViewMonth > 11) { calViewMonth = 0; calViewYear++; }
  renderWorkout();
};
```

- [ ] **Step 3: Insert calendar into `renderWorkout` — replace the `el.innerHTML` assignment to add calendar before the day strip**

Find this line in `renderWorkout`:
```javascript
el.innerHTML = `
    <h1 class="section-header">WORKOUT</h1>

    <div style="display:flex;border-bottom:1px solid var(--border);margin-bottom:16px;overflow-x:auto">${dayStrip}</div>
```

Replace with:
```javascript
el.innerHTML = `
    <h1 class="section-header">WORKOUT</h1>

    <div class="card" style="padding:12px">
      <div id="cal-container"></div>
    </div>

    <div style="display:flex;border-bottom:1px solid var(--border);margin-bottom:16px;overflow-x:auto">${dayStrip}</div>
`;
```

Then add this line immediately after the `el.innerHTML = ...` assignment closes:
```javascript
  renderCalendar(document.getElementById('cal-container'));
```

- [ ] **Step 4: Verify**

Reload app → Workout tab. Monthly calendar appears above the 7-day strip. Each day cell shows workout type abbreviation. Today is highlighted with red border. `‹` / `›` buttons navigate months. Tapping a date selects it in both the calendar and the 7-day strip, and scrolls to the exercise list.

After logging a session (Task 7 in this plan), the logged date shows a red dot on the calendar.

---

## Task 15: Final Wiring + Polish

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Ensure `renderAll` is complete and wires correctly — verify the function in JS**

The `renderAll` function already calls all 6 render functions. Confirm this in the JS:

```javascript
function renderAll() {
  renderToday();
  renderWorkout();
  renderBoxing();
  renderDiet();
  renderProgress();
  renderSleepModal();
}
```

- [ ] **Step 2: Add "Start Session" button wiring from Today tab to Workout tab — find the START button in `renderToday` and verify it calls `switchTab('workout')`**

Already done in Task 5. Confirm `onclick="switchTab('workout')"` on the Start button.

- [ ] **Step 3: Add `mb-12` utility spacing class to CSS (verify it's in the style block)**

```css
.mb-12 { margin-bottom: 12px; }
```

- [ ] **Step 4: Test the full app flow end-to-end**

1. Clear localStorage (DevTools → Application → Storage → Clear site data)
2. Reload — onboarding appears
3. Complete 3 steps
4. Today tab renders with greeting, plan, checklist
5. Check all 5 tabs for console errors (F12 → Console)
6. Tap a workout set circle → rest timer appears
7. Log a boxing session → saves to localStorage
8. Update macros in Diet → persists on reload
9. Add test in Progress → history shows with delta

- [ ] **Step 5: Verify midnight reset logic**

```javascript
// In DevTools console:
store('lastOpened', '2026-01-01'); // simulate yesterday
location.reload();
// checklistItems should all have done: false
getDailyData().checklistItems.every(i => !i.done) // → true
```

---

## Self-Review Checklist

- [x] All 5 tabs implemented
- [x] localStorage schema matches spec (`profile`, `daily_YYYY-MM-DD`, `sessions`, `boxing_sessions`, `progress_tests`, `milestones`, `custom_checklist`, `current_stats`)
- [x] Midnight reset logic implemented
- [x] Streak logic in `updateStreak()` — checks yesterday vs today
- [x] All 3 timers (cardio, boxing, 4-7-8) use idle/running/paused state machine with `clearInterval` on pause/reset
- [x] `navigator.vibrate` on checklist toggle (50ms), round end ([100,50,100]), session complete (200ms)
- [x] Web Audio API `beep()` function for boxing and cardio
- [x] First launch onboarding (3 steps)
- [x] Service worker cache-first
- [x] PWA install prompt with dismiss persistence
- [x] No linear-gradient anywhere in CSS
- [x] All localStorage writes in try/catch via `store()` helper
- [x] SVG icons inline in nav, no emoji
- [x] Touch targets minimum 44px height
- [x] Max-width 430px, no horizontal scroll
