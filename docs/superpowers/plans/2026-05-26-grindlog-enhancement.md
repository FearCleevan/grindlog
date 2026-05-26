# GrindLog Enhancement Implementation Plan

> **For agentic workers:** Execute ONE phase at a time. After each phase: STOP, report what was done, then ask "Continue to Phase N+1?" — only proceed when user replies "Yes, proceed".

**Goal:** Refactor GrindLog from a single index.html monolith into a multi-file PWA with enhanced personalized onboarding (gender, age, equipment, goal analysis) while keeping the existing dark red design unchanged.

**Architecture:** Multi-page PWA — each tab is its own HTML file sharing `css/base.css`, `css/components.css`, and `js/core.js`. The onboarding overlay lives on `index.html` (Today page). A new `js/analyzer.js` runs fully offline to generate personalized workout and diet plans from onboarding inputs. All logic is localStorage-based with zero external API calls post-font-cache.

**Tech Stack:** Vanilla HTML/CSS/JS, localStorage, Service Worker (Cache API), no build tools, no frameworks.

---

## ⚠️ PHASE GATE RULE
After executing each phase Claude Code must:
1. Stop all work
2. List every file created or modified
3. Describe what was done in plain language
4. Ask: **"Phase N complete. Continue to Phase N+1?"**
5. Wait for user to reply **"Yes, proceed"** before touching any code

---

## Memory Anchor — Design Tokens (DO NOT CHANGE)
```
--bg: #0d0d0d
--surface: #1a1a1a
--border: #2a2a2a
--accent: #e63946
--text: #f0f0f0
--muted: #888
Font headings: 'Bebas Neue', sans-serif
Font body: 'DM Sans', sans-serif
Nav height: 60px
Max width: 430px
Border-radius: 0 (sharp corners everywhere)
```

---

## File Map (Final State After All Phases)

```
grindlog/
├── index.html              ← Today tab (modified from current)
├── workout.html            ← NEW
├── boxing.html             ← NEW
├── diet.html               ← NEW
├── progress.html           ← NEW
├── css/
│   ├── base.css            ← NEW — variables, reset, typography, utils, animations
│   └── components.css      ← NEW — all shared UI components + layout
├── js/
│   ├── core.js             ← NEW — store/load, dateStr, todayKey, vibrate
│   ├── data.js             ← NEW — EXERCISES, WARMUP, DAYS, WEEKLY_PLAN, COMBOS, MEALS, etc.
│   ├── analyzer.js         ← NEW — personalization engine (BMR, plan generator)
│   ├── onboarding.js       ← NEW — enhanced multi-step onboarding
│   ├── today.js            ← NEW — renderToday, checklist
│   ├── workout.js          ← NEW — renderWorkout, cardio, rest timer, session
│   ├── boxing.js           ← NEW — renderBoxing, boxing timer
│   ├── diet.js             ← NEW — renderDiet, macros, meals
│   ├── progress.js         ← NEW — renderProgress, tests, milestones
│   └── pwa.js              ← NEW — service worker registration, install banner
├── manifest.json           ← modified (start_url, scope)
├── sw.js                   ← modified (cache all new files)
└── icons/                  ← unchanged
```

---

## Phase 1 — CSS Extraction

**Goal:** Extract all CSS from `index.html` into `css/base.css` and `css/components.css`. `index.html` gets `<link>` tags replacing the `<style>` block. Zero visual change.

### Execution Details

**Files to create:**
- `css/base.css`
- `css/components.css`

**Files to modify:**
- `index.html` — remove `<style>` block, add two `<link>` tags

---

#### Step 1 — Create `css/base.css`

Create file `css/base.css` with this exact content:

```css
/* ── Design Tokens ── */
:root {
  --bg: #0d0d0d;
  --surface: #1a1a1a;
  --border: #2a2a2a;
  --accent: #e63946;
  --text: #f0f0f0;
  --muted: #888;
}

/* ── Reset ── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

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

/* ── Typography ── */
h1, h2, h3, .heading {
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 0.05em;
  font-weight: 400;
}

/* ── Animations ── */
@keyframes pop {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.25); }
}
.pop { animation: pop 0.2s ease; }

@keyframes pulse-border {
  0%, 100% { border-color: var(--border); }
  50% { border-color: var(--accent); }
}
.timer-active { animation: pulse-border 1.5s infinite; }

/* ── Utilities ── */
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
```

#### Step 2 — Create `css/components.css`

Create file `css/components.css` with this exact content:

```css
/* ── Tabs ── */
.tab {
  display: none;
  padding: 20px 16px 80px;
  min-height: 100dvh;
}
.tab.active { display: block; }

/* ── Bottom Nav ── */
#bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
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

/* ── Progress Bar ── */
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
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s;
}
.check-dot.done { background: var(--accent); border-color: var(--accent); }
.check-dot.done::after {
  content: '';
  width: 5px;
  height: 9px;
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

/* ── Section Header ── */
.section-header { font-size: 22px; margin-bottom: 16px; }

/* ── Badge ── */
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

/* ── Stat Row ── */
.stat-row { display: flex; gap: 8px; margin-bottom: 16px; }
.stat-box {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 12px 10px;
  text-align: center;
}
.stat-val { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 0.05em; line-height: 1; }
.stat-lbl { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }

/* ── Editable Inline ── */
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

/* ── Timer ── */
.timer-display {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 72px;
  letter-spacing: 0.05em;
  text-align: center;
  line-height: 1;
  color: var(--text);
}
.timer-label {
  text-align: center;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 6px;
}

/* ── Set Circles ── */
.set-circles { display: flex; gap: 8px; margin-top: 8px; }
.set-circle {
  width: 36px;
  height: 36px;
  border: 2px solid var(--border);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--muted);
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
.input-label {
  font-size: 12px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
  display: block;
}

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
  width: 4px;
  height: 4px;
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
.cal-month-label { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 0.05em; }

/* ── Install Banner ── */
#install-banner {
  display: none;
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  background: var(--surface);
  border-top: 1px solid var(--accent);
  padding: 10px 16px;
  align-items: center;
  justify-content: space-between;
  z-index: 150;
}

/* ── Onboarding Extras ── */
.ob-option-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
}
.ob-option {
  border: 1px solid var(--border);
  padding: 16px 12px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  user-select: none;
}
.ob-option.selected {
  border-color: var(--accent);
  background: rgba(230,57,70,0.08);
}
.ob-option-icon { font-size: 28px; margin-bottom: 6px; }
.ob-option-label {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 14px;
  letter-spacing: 0.08em;
}
.ob-option-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }
.ob-option-3col { grid-template-columns: 1fr 1fr 1fr; }
.ob-equip-list { margin-bottom: 16px; }
.ob-equip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  user-select: none;
}
.ob-equip-box {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s;
}
.ob-equip-box.checked {
  background: var(--accent);
  border-color: var(--accent);
}
.ob-equip-box.checked::after {
  content: '';
  width: 5px;
  height: 9px;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(45deg) translate(-1px, -1px);
  display: block;
}
.ob-analyze-screen {
  text-align: center;
  padding: 32px 0;
}
.ob-analyze-ring {
  width: 80px;
  height: 80px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.ob-plan-summary { margin-bottom: 16px; }
.ob-plan-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}
.ob-plan-row:last-child { border-bottom: none; }
.ob-plan-key { color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; font-size: 11px; }
.ob-plan-val { font-family: 'Bebas Neue', sans-serif; font-size: 15px; color: var(--accent); }
```

#### Step 3 — Modify `index.html`: replace `<style>` block with `<link>` tags

In `index.html`, find the entire `<style>` block (from `<style>` to `</style>` in the `<head>`) and replace it with:

```html
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/components.css">
```

Keep the Google Fonts `<link>` tags above these.

#### Step 4 — Verify

Open `https://grindlog-chi.vercel.app/` (or locally via Live Server). The app must look identical to before. Check all 5 tabs.

#### Step 5 — Commit

```
git add css/base.css css/components.css index.html
git commit -m "refactor: extract CSS into css/base.css and css/components.css"
git push
```

---

## Phase 2 — Core & Data JS Extraction

**Goal:** Extract utility functions and static data from `index.html` into `js/core.js` and `js/data.js`.

### Execution Details

**Files to create:**
- `js/core.js`
- `js/data.js`

**Files to modify:**
- `index.html` — remove extracted code, add `<script src>` tags before the closing `</body>`

---

#### Step 1 — Create `js/core.js`

```js
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
```

#### Step 2 — Create `js/data.js`

```js
'use strict';

const WEEKLY_PLAN = {
  0: { type: 'Rest',           label: 'REST DAY',          badge: 'rest'   },
  1: { type: 'Push + Boxing',  label: 'PUSH DAY + BOXING', badge: 'push'   },
  2: { type: 'Cardio',         label: 'CARDIO',            badge: 'cardio' },
  3: { type: 'Pull + Core',    label: 'PULL + CORE',       badge: 'pull'   },
  4: { type: 'Cardio',         label: 'CARDIO',            badge: 'cardio' },
  5: { type: 'Legs + Boxing',  label: 'LEGS + BOXING',     badge: 'legs'   },
  6: { type: 'Full Body',      label: 'FULL BODY',         badge: 'full'   }
};

const EXERCISES = {
  push: [
    { name: 'Push-ups',          sets: 3, reps: '8–12',   cue: 'Hands shoulder-width, lower chest to 2cm from floor, full lockout at top.' },
    { name: 'Pike Push-ups',     sets: 3, reps: '6–10',   cue: 'Hips high, form an inverted V. Lower your head toward the floor.' },
    { name: 'Chair Tricep Dips', sets: 3, reps: '8–12',   cue: 'Elbows track back — not flared. Keep hips close to the chair edge.' },
    { name: 'Plank',             sets: 3, reps: '30–60s', cue: 'Straight line head to heels. Squeeze glutes and brace core.' }
  ],
  pull: [
    { name: 'Bedsheet Rows', sets: 3, reps: '8–12',   cue: 'Secure sheet in door, lean back, pull chest to hands. Elbows tight.' },
    { name: 'Superman Hold', sets: 3, reps: '10×3s',  cue: 'Lie face down, lift arms and legs simultaneously. Hold 3 sec each rep.' },
    { name: 'Plank',         sets: 3, reps: '30–60s', cue: 'Straight line head to heels. Squeeze glutes and brace core.' }
  ],
  legs: [
    { name: 'Squats',        sets: 4, reps: '12–15',   cue: 'Feet shoulder-width, chest up, break parallel if mobility allows.' },
    { name: 'Lunges',        sets: 3, reps: '10 each', cue: 'Step forward, both knees to 90°. Keep front shin vertical.' },
    { name: 'Glute Bridges', sets: 3, reps: '15–20',   cue: 'Lie on back, feet flat, drive hips up. Squeeze at top for 1 sec.' }
  ],
  full: [
    { name: 'Push-ups',      sets: 3, reps: '8–12',  cue: 'Hands shoulder-width, lower chest to 2cm from floor.' },
    { name: 'Squats',        sets: 3, reps: '12–15', cue: 'Feet shoulder-width, chest up, break parallel.' },
    { name: 'Bedsheet Rows', sets: 3, reps: '8–12',  cue: 'Secure sheet in door, pull chest to hands.' },
    { name: 'Glute Bridges', sets: 3, reps: '15–20', cue: 'Lie on back, drive hips up, squeeze at top.' },
    { name: 'Plank',         sets: 3, reps: '30–60s',cue: 'Straight line head to heels. Brace hard.' }
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

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const WORKOUT_SHORT = {
  push: 'PUSH', pull: 'PULL', legs: 'LEGS', full: 'FULL',
  cardio: 'RUN', boxing: 'BOX', rest: 'REST'
};

const COMBOS = [
  { num: '1', name: 'Jab',          desc: 'Quick lead hand snap. Extend fully, snap back fast.' },
  { num: '2', name: 'Cross',        desc: 'Rear hand with hip rotation. Drive from the back foot.' },
  { num: '3', name: 'Lead Hook',    desc: 'Horizontal arc, elbow at 90°. Pivot on lead foot.' },
  { num: '4', name: 'Rear Hook',    desc: 'Opposite side to lead hook. Rotate hips through.' },
  { num: '5', name: 'Lead Uppercut',desc: 'Upward scoop, bend knees to load.' },
  { num: '6', name: 'Rear Uppercut',desc: 'Drive from legs, rotate hips, scoop upward.' }
];

const COMBO_SEQUENCES = ['1-2', '1-2-3', '1-1-2', '1-2-3-2', '1-2-5-2'];

const MEALS = [
  { id: 'meal1', time: '7:00 AM',  label: 'Post-shift: 2 boiled eggs + banana' },
  { id: 'meal2', time: '2:00 PM',  label: 'Pre-workout: Oats or kamote + eggs' },
  { id: 'meal3', time: '4:00 PM',  label: 'Post-workout: Rice + protein + veggies' },
  { id: 'meal4', time: '7:00 PM',  label: 'Pre-shift: Tuna rice bowl or viand' },
  { id: 'meal5', time: '1:00 AM',  label: 'Mid-shift: Boiled eggs + banana' },
  { id: 'meal6', time: '5:00 AM',  label: 'Optional small snack' }
];

const MEAL_PREP = [
  { title: 'Tinolang Manok (Batch)',  steps: 'Boil chicken with ginger + tanglad. Add sayote. Season with patis. Portion into containers for 3 days.' },
  { title: 'Tuna Rice Bowl (5-min)', steps: 'Open canned tuna. Mix with rice + soy sauce + calamansi. Top with chopped kangkong (raw or blanched).' },
  { title: 'Kamote + Egg Meal',      steps: 'Boil kamote 15 min. Pan-fry or boil 2 eggs. Season with salt and pepper.' },
  { title: 'Overnight Oats',         steps: '½ cup rolled oats + ½ cup water or coconut milk. Add banana slices. Refrigerate overnight.' },
  { title: 'Batch Boiled Eggs',      steps: 'Boil 10–12 eggs for 10 minutes. Ice bath for 5 min. Peel and refrigerate up to 5 days.' }
];

const PROTEIN_SOURCES = [
  { food: 'Egg',            protein: '6g',  note: 'per piece'  },
  { food: 'Canned Tuna',    protein: '25g', note: 'per can'    },
  { food: 'Chicken Breast', protein: '31g', note: 'per 100g'   },
  { food: 'Bangus',         protein: '22g', note: 'per 100g'   },
  { food: 'Tokwa',          protein: '8g',  note: 'per 100g'   }
];

const GROCERY_LIST = [
  { item: 'Eggs (1 tray)',          price: '₱180–200' },
  { item: 'Chicken breast 1kg',     price: '₱200–240' },
  { item: 'Canned tuna ×4',         price: '₱120–160' },
  { item: 'Brown rice 1kg',         price: '₱60–80'   },
  { item: 'Rolled oats',            price: '₱80–100'  },
  { item: 'Kamote',                 price: '₱40–60'   },
  { item: 'Bananas (1 kilo)',        price: '₱40–60'   },
  { item: 'Kangkong/sitaw/sayote',  price: '₱40–60'   },
  { item: 'Peanut butter',          price: '₱60–80'   }
];

const MILESTONES = [
  { id: 'pushup20',    label: '20 clean push-ups',           unlock: 'Creatine + harder push-up variations' },
  { id: 'run30',       label: '30 min continuous run',       unlock: 'HIIT sessions'                       },
  { id: 'consistent3mo',label: '3 months consistent training',unlock: '4–5 day split'                      },
  { id: 'protein130',  label: '130g protein/day consistent', unlock: 'Consider creatine'                   },
  { id: 'boxing5rounds',label: '5 rounds shadow boxing',     unlock: 'Resistance bands'                    }
];

const MONTHLY_TARGETS = [
  { month: 1, pushups: 12,         run: '8 min',  weight: '-0 kg',     note: 'Habit focus'         },
  { month: 2, pushups: 15,         run: '15 min', weight: '-2 to 3 kg',note: ''                    },
  { month: 3, pushups: 20,         run: '22 min', weight: '-4 to 5 kg',note: 'Push-up goal done ✓' },
  { month: 4, pushups: 'Diamond',  run: '28 min', weight: '-6 to 7 kg',note: ''                    },
  { month: 5, pushups: 'Diamond+', run: '30 min', weight: '-8 to 10 kg',note: 'Creatine unlocked'  }
];

const CARDIO_PHASES = [
  { weeks:[1,2], label:'Phase 1 — Walk/Jog Intro',     intervals:[{type:'walk',duration:120,label:'2 min Walk'},{type:'jog',duration:30,label:'30 sec Jog'}], rounds:6 },
  { weeks:[3,4], label:'Phase 2 — Equal Intervals',    intervals:[{type:'walk',duration:60,label:'1 min Walk'},{type:'jog',duration:60,label:'1 min Jog'}],   rounds:8 },
  { weeks:[5,6], label:'Phase 3 — 5-Minute Runs',      intervals:[{type:'walk',duration:120,label:'2 min Warmup Walk'},{type:'jog',duration:300,label:'5 min Jog'},{type:'walk',duration:120,label:'2 min Rest Walk'},{type:'jog',duration:300,label:'5 min Jog'}], rounds:1 },
  { weeks:[7,8], label:'Phase 4 — Continuous Run',     intervals:[{type:'walk',duration:120,label:'2 min Warmup Walk'},{type:'jog',duration:1200,label:'20 min Jog'}], rounds:1 }
];
```

#### Step 3 — Update `index.html` script block

Inside the `<script>` in index.html, remove the definitions of: `store`, `load`, `todayKey`, `dateStr`, `vibrate`, `openModal`, `closeModal`, `fmtTime`, `beep`, `toggleCollapsible`, `getProfile`, `getStats`, `getDailyData`, `saveDailyData`, `defaultChecklist`, `updateStreak`, and all the `const` data variables (`WEEKLY_PLAN`, `EXERCISES`, `WARMUP`, `DAYS`, `WORKOUT_SHORT`, `COMBOS`, `COMBO_SEQUENCES`, `MEALS`, `MEAL_PREP`, `PROTEIN_SOURCES`, `GROCERY_LIST`, `MILESTONES`, `MONTHLY_TARGETS`, `CARDIO_PHASES`).

Add before the closing `</body>` tag (in this order, before the existing `<script>`):

```html
<script src="js/core.js"></script>
<script src="js/data.js"></script>
```

#### Step 4 — Commit

```
git add js/core.js js/data.js index.html
git commit -m "refactor: extract core utilities and data into js/core.js and js/data.js"
git push
```

---

## Phase 3 — Page JS Extraction

**Goal:** Extract each render function into its own file. `index.html` becomes a thin shell that imports all JS files. Zero visual change.

### Execution Details

**Files to create:** `js/today.js`, `js/workout.js`, `js/boxing.js`, `js/diet.js`, `js/progress.js`, `js/pwa.js`, `js/app.js`

**Files to modify:** `index.html` — remove all remaining `<script>` content, add `<script src>` tags

---

#### Step 1 — Create `js/today.js`

Extract `renderToday`, `renderChecklist`, `window.toggleCheck`, `window.addCustomCheckItem` and the sleep modal / breathing functions (`renderSleepModal`, `breathingStart`, `breathTick`, `updateBreathing`, `breathingReset`, `breathTimer`, `BREATH_PHASES`) into this file. Wrap with `'use strict';` at top.

The file contains exactly these functions as they exist in `index.html` currently — no logic changes.

#### Step 2 — Create `js/workout.js`

Extract: `renderWorkout`, `selectDay`, `renderCalendar`, `calSelectDate`, `calPrevMonth`, `calNextMonth`, `renderExerciseList`, `toggleSet`, `renderExerciseLibrary`, `finishSession`, `renderCardio`, `cardioTick`, `updateCardioDisplay`, `cardioStart`, `cardioPause`, `cardioReset`, `showRestTimer`, `updateRestDisplay`, `skipRest`, and state variables `selectedDay`, `sessionSets`, `calViewYear`, `calViewMonth`, `cardio`, `restTimer`.

#### Step 3 — Create `js/boxing.js`

Extract: `renderBoxing`, `boxTick`, `updateBoxDisplay`, `boxEnd`, `selectFeeling`, `saveBoxingSession`, `countPunch`, `boxStart`, `boxPause`, `boxReset`, `getBoxingPlan`, and state variables `boxing`, `boxFeeling`.

#### Step 4 — Create `js/diet.js`

Extract: `renderDiet`, `updateMacro`, `changeWater`, `toggleMeal`.

#### Step 5 — Create `js/progress.js`

Extract: `renderProgress`, `toggleTestForm`, `saveTest`, `toggleMilestone`.

#### Step 6 — Create `js/pwa.js`

```js
'use strict';

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
  const banner = document.getElementById('install-banner');
  if (banner) banner.style.display = 'flex';
}

window.installPWA = function () {
  if (deferredInstall) {
    deferredInstall.prompt();
    deferredInstall.userChoice.then(() => { deferredInstall = null; dismissInstall(); });
  }
};

window.dismissInstall = function () {
  store('install-dismissed', true);
  const banner = document.getElementById('install-banner');
  if (banner) banner.style.display = 'none';
};
```

#### Step 7 — Create `js/app.js`

```js
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
```

#### Step 8 — Update `index.html` script section

Remove the entire `<script>` block. Replace with:

```html
<script src="js/core.js"></script>
<script src="js/data.js"></script>
<script src="js/pwa.js"></script>
<script src="js/today.js"></script>
<script src="js/workout.js"></script>
<script src="js/boxing.js"></script>
<script src="js/diet.js"></script>
<script src="js/progress.js"></script>
<script src="js/onboarding.js"></script>
<script src="js/app.js"></script>
```

Create a placeholder `js/onboarding.js` for now (will be replaced in Phase 5):

```js
'use strict';
// Onboarding — replaced in Phase 5
function showOnboarding() {
  // placeholder — Phase 5 will implement enhanced version
}
```

#### Step 9 — Commit

```
git add js/today.js js/workout.js js/boxing.js js/diet.js js/progress.js js/pwa.js js/app.js js/onboarding.js index.html
git commit -m "refactor: extract all page scripts into js/ modules"
git push
```

---

## Phase 4 — HTML Page Separation

**Goal:** Create `workout.html`, `boxing.html`, `diet.html`, `progress.html` as standalone pages. Update `index.html` to only contain the Today tab. Navigation uses `<a href>` page links.

### Execution Details

**Files to create:** `workout.html`, `boxing.html`, `diet.html`, `progress.html`

**Files to modify:** `index.html` — remove non-Today tab sections, update nav to use `<a href>` links

---

#### Step 1 — Shared HTML shell pattern

Every page shares this `<head>` structure (copy exactly, changing only `<title>` and active nav button):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#e63946">
  <link rel="manifest" href="manifest.json">
  <link rel="apple-touch-icon" href="icons/192.png">
  <link rel="icon" type="image/png" href="icons/icon-192.png">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="GrindLog">
  <title>GrindLog — [PAGE NAME]</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/components.css">
</head>
```

Shared nav (copy into every page, change `active` class to the current page's button):

```html
<nav id="bottom-nav">
  <a class="nav-btn" href="index.html">
    <!-- Today SVG icon -->
    <svg width="22" height="22" viewBox="0 0 1024 1024" fill="currentColor">
      <path d="M650.564314 118.483673s25.088756-95.013547-28.002289-97.117765-120.102302-2.75167-178.049235 25.088756-103.430419 136.936048-103.43042 136.936048-103.430419 89.348344-120.102302 206.860839a784.387813 784.387813 0 0 0-10.197366 176.106881s-35.124258 80.122156-1.294903 114.598962 109.257485 54.062222 109.257485 54.062222 90.319521 74.456953 190.027093 70.734106a495.948052 495.948052 0 0 0 190.998271-53.091045s107.153267 160.244312 159.273134 162.995982 40.951324-59.565562 40.951324-59.565563l0.971178-323.725882s0.809315-75.428131-66.201943-104.401597a125.443779 125.443779 0 0 0-117.350632 6.474517s-60.53674-52.119867-131.270846-33.505628a434.440134 434.440134 0 0 0-127.547998 59.565562 187.922875 187.922875 0 0 0 7.445696-69.924791c-3.722848-36.257299-46.616527-97.117765-16.186294-162.995982s71.705283-43.702994 71.705283-43.702994a55.195263 55.195263 0 0 0 40.951324 24.279441 108.286308 108.286308 0 0 0 51.310552-17.64306s47.425842 13.110898 56.813893-18.614238 3.399122-41.436913-20.071005-53.414771z"/>
      <path d="M857.748879 1023.944967h-4.694026c-10.844817 0-69.601065-11.815995-180.639042-173.678936a553.08567 553.08567 0 0 1-202.814266 52.929181c-105.372775 4.208436-199.577007-64.745177-218.676833-79.636567-17.966786-5.017751-89.186481-26.869248-125.120054-63.450273-40.951324-41.760639-13.272761-120.911617-4.532162-142.763114A946.736344 946.736344 0 0 1 133.088491 424.080906c17.643061-123.339561 115.084551-217.867519 135.155556-236.319894 9.873639-22.660812 57.461344-126.091231 121.559068-156.521464 67.334984-32.372588 141.9538-32.372588 206.051525-29.459056a52.767319 52.767319 0 0 1 41.27505 21.689634c19.585416 27.031111 14.729528 72.190872 10.359228 95.660999 24.279441 16.186294 28.649741 36.581025 18.128649 72.352735s-45.645349 41.760639-77.694211 35.77171a128.19545 128.19545 0 0 1-59.727426 18.128649 77.04676 77.04676 0 0 1-57.137618-29.944644 26.383659 26.383659 0 0 0-15.215117 0.809315 70.572242 70.572242 0 0 0-33.991217 39.332694c-20.718456 44.512309-6.150792 86.758537 6.798243 123.987013a210.421824 210.421824 0 0 1 12.301584 45.321624 199.900732 199.900732 0 0 1 0 39.008969 476.03891 476.03891 0 0 1 107.962582-44.512309c68.144298-17.966786 127.062409 16.186294 151.018124 32.372588a159.273134 159.273134 0 0 1 135.155556-1.780492c84.654318 36.419162 84.654318 129.490353 84.492455 132.727612l-0.971177 355.289156a88.862755 88.862755 0 0 1-16.186295 67.820572 57.946933 57.946933 0 0 1-44.674171 18.12865z"/>
    </svg>
    Today
  </a>
  <a class="nav-btn [active-class]" href="workout.html">
    <svg width="22" height="22" viewBox="0 -131.5 1287 1287" fill="currentColor">
      <path d="M1128.170143 656.727291h-9.881771v147.19722a55.996704 55.996704 0 0 1-61.761071 48.791246c-33.762719 0-61.761071-21.822245-61.761071-48.791246V315.188568c0-26.969001 27.586612-48.791246 61.761071-48.791246a55.996704 55.996704 0 0 1 61.761071 48.791246v168.607724h9.881771c60.114109 0 108.905355 38.909475 108.905356 86.87724s-48.997116 87.08311-108.905356 87.08311M898.213089 1023.999794a97.582492 97.582492 0 0 1-97.788363-97.582492V193.107518a97.685427 97.685427 0 1 1 195.370855 0v732.486303a97.582492 97.582492 0 0 1-97.582492 97.788362z m-440.562307-367.272503v-195.370855h342.773944v195.370855H457.650782z m-95.729661 366.243152a97.582492 97.582492 0 0 1-97.582492-97.582492V193.107518a97.582492 97.582492 0 0 1 97.582492-97.582493 95.93553 95.93553 0 0 1 95.729661 97.582493v732.486303a95.93553 95.93553 0 0 1-95.729661 97.788362z m-157.078991-170.872297c-33.968589 0-61.761071-21.822245-61.761071-48.791246v-146.579609h-9.675901c-61.761071 0-110.140577-38.909475-110.140577-87.08311s49.202987-86.87724 110.140577-86.87724h9.675901v-168.607724c0-26.969001 27.792482-48.791246 61.761071-48.791246a53.938002 53.938002 0 0 1 59.290629 48.791246v488.324202a53.938002 53.938002 0 0 1-59.290629 49.820597z"/>
    </svg>
    Workout
  </a>
  <a class="nav-btn [active-class]" href="boxing.html">
    <svg width="22" height="22" viewBox="0 -21 1066 1066" fill="currentColor">
      <path d="M812.148503 580.828743a288.80479 288.80479 0 0 1-119.262275-23.453893s-14.102994 100.713772 19.468263 134.438324 67.908982 32.191617 103.626347 32.191616 103.166467 5.82515 120.641916-41.082634 8.277844-115.736527 8.277845-115.736527a674.491018 674.491018 0 0 1-132.752096 13.643114z"/>
      <path d="M629.729341 251.401198s-34.950898 23.913772-34.950898 89.370059 89.37006 168.622754 89.37006 168.622755a321.916168 321.916168 0 0 0 133.058683 26.213174 752.517365 752.517365 0 0 0 148.23473-15.329342s82.931737-87.223952 82.931737-268.263473-196.215569-183.952096-226.874252-183.952096S605.662275 87.837126 629.729341 251.401198z"/>
    </svg>
    Boxing
  </a>
  <a class="nav-btn [active-class]" href="diet.html">
    <svg width="22" height="22" viewBox="0 0 1024 1024" fill="currentColor">
      <path d="M64 448h896v80H64z"/>
      <path d="M128 528c0 0 64 352 384 352s384-352 384-352H128z"/>
      <path d="M192 448c0 0 72-224 320-224s320 224 320 224H192z"/>
    </svg>
    Diet
  </a>
  <a class="nav-btn [active-class]" href="progress.html">
    <svg width="22" height="22" viewBox="0 0 1024 1024" fill="currentColor">
      <path d="M160 576h160v384H160z"/>
      <path d="M432 320h160v640H432z"/>
      <path d="M704 128h160v832H704z"/>
      <path d="M64 960h896v64H64z"/>
    </svg>
    Progress
  </a>
</nav>
```

> **Important CSS note:** Add this to `css/components.css` — nav links need text-decoration removed:
> ```css
> #bottom-nav a.nav-btn { text-decoration: none; }
> ```

#### Step 2 — Create `workout.html`

Full file. Active nav button is Workout (`class="nav-btn active"`). Body contains:

```html
<body>
  <!-- REST TIMER OVERLAY -->
  <div class="overlay" id="rest-overlay" style="align-items:center;justify-content:center">
    <div class="modal" style="border:1px solid var(--border);max-width:300px;text-align:center">
      <div class="card-title" style="text-align:center">REST</div>
      <div class="timer-display" id="rest-countdown">1:00</div>
      <div class="btn-row mt-12" style="justify-content:center">
        <button class="btn btn-ghost" onclick="skipRest()">SKIP</button>
      </div>
    </div>
  </div>

  <main id="app">
    <section id="tab-workout" class="tab active"></section>
  </main>

  [nav here with Workout as active]

  <script src="js/core.js"></script>
  <script src="js/data.js"></script>
  <script src="js/pwa.js"></script>
  <script src="js/workout.js"></script>
  <script>
    'use strict';
    function switchTab(name) { window.location.href = name + '.html'; }
    function selectDay(day) {
      window._selectedDay = day;
      window._sessionSets = {};
      renderWorkout();
    }
    renderWorkout();
    registerSW();
  </script>
</body>
```

> Note: `workout.js` uses `selectedDay` and `sessionSets` as module-level vars — they stay in `workout.js`.

#### Step 3 — Create `boxing.html`

Same pattern. Active nav = Boxing. Body contains:

```html
<main id="app">
  <section id="tab-boxing" class="tab active"></section>
</main>
[nav — Boxing active]
<script src="js/core.js"></script>
<script src="js/data.js"></script>
<script src="js/pwa.js"></script>
<script src="js/boxing.js"></script>
<script>
  'use strict';
  renderBoxing();
  registerSW();
</script>
```

#### Step 4 — Create `diet.html`

Active nav = Diet.

```html
<main id="app">
  <section id="tab-diet" class="tab active"></section>
</main>
[nav — Diet active]
<script src="js/core.js"></script>
<script src="js/data.js"></script>
<script src="js/pwa.js"></script>
<script src="js/diet.js"></script>
<script>
  'use strict';
  renderDiet();
  registerSW();
</script>
```

#### Step 5 — Create `progress.html`

Active nav = Progress.

```html
<main id="app">
  <section id="tab-progress" class="tab active"></section>
</main>
[nav — Progress active]
<script src="js/core.js"></script>
<script src="js/data.js"></script>
<script src="js/pwa.js"></script>
<script src="js/progress.js"></script>
<script>
  'use strict';
  renderProgress();
  registerSW();
</script>
```

#### Step 6 — Update `index.html`

- Remove `<section id="tab-workout">`, `<section id="tab-boxing">`, `<section id="tab-diet">`, `<section id="tab-progress">` from the HTML
- Keep only `<section id="tab-today" class="tab active"></section>`
- Replace nav `<button>` elements with `<a>` elements pointing to the correct `.html` files (Today = `index.html`, active class on Today)
- Remove `js/workout.js`, `js/boxing.js`, `js/diet.js`, `js/progress.js` from script tags (not needed on index)
- Keep: `js/core.js`, `js/data.js`, `js/pwa.js`, `js/today.js`, `js/onboarding.js`, `js/app.js`
- Update `js/app.js` init: remove `renderWorkout/Boxing/Diet/Progress` calls — Today page only renders Today

#### Step 7 — Update `js/app.js` for single-page Today

```js
'use strict';

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
```

#### Step 8 — Commit

```
git add workout.html boxing.html diet.html progress.html index.html js/app.js css/components.css
git commit -m "refactor: split into multi-page PWA (workout/boxing/diet/progress HTML pages)"
git push
```

---

## Phase 5 — Service Worker Update

**Goal:** Update `sw.js` to cache all new pages and JS/CSS files. Bump cache version so all devices get the new structure.

### Execution Details

**Files to modify:** `sw.js`

#### Step 1 — Replace `sw.js`

```js
const CACHE = 'grindlog-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/workout.html',
  '/boxing.html',
  '/diet.html',
  '/progress.html',
  '/manifest.json',
  '/css/base.css',
  '/css/components.css',
  '/js/core.js',
  '/js/data.js',
  '/js/analyzer.js',
  '/js/onboarding.js',
  '/js/today.js',
  '/js/workout.js',
  '/js/boxing.js',
  '/js/diet.js',
  '/js/progress.js',
  '/js/pwa.js',
  '/js/app.js',
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

Also create a placeholder `js/analyzer.js` (will be replaced in Phase 7):

```js
'use strict';
// Personalization engine — implemented in Phase 7
```

#### Step 2 — Commit

```
git add sw.js js/analyzer.js
git commit -m "feat: update service worker to cache all multi-page assets (v3)"
git push
```

---

## Phase 6 — Enhanced Onboarding UI

**Goal:** Replace the 3-step onboarding with a 8-step onboarding that collects: name, gender, age, weight, goal, workout environment, equipment (conditional), fitness level. Shows an analysis loading screen then a plan summary. Zero external calls — all logic runs in browser.

### Execution Details

**Files to modify:** `js/onboarding.js` — complete replacement

The new onboarding steps:
1. Welcome + Name
2. Gender + Age
3. Current Weight + Target Weight
4. Goal (4 options: Weight Loss, Muscle Gain, General Fitness, Boxing Focus)
5. Workout Environment (3 options: Gym, Home w/ Equipment, Home Bodyweight)
6. Equipment Checklist (only if Step 5 = "Home w/ Equipment"; skipped otherwise)
7. Fitness Level (Beginner, Intermediate, Advanced)
8. Analyzing... (2-second spinner)
9. Your Plan Summary (generated by `analyzer.js`)
10. Let's Go button

#### Step 1 — Replace `js/onboarding.js` with full content

```js
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
      Array.from({length:8}, (_,i) => `<div style="flex:1;height:3px;background:${i < s ? 'var(--accent)' : 'var(--border)'}"></div>`).join('')
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
        <div class="ob-option${data.gender==='male'?' selected':''}" data-gender="male">
          <div class="ob-option-icon">♂</div>
          <div class="ob-option-label">MALE</div>
        </div>
        <div class="ob-option${data.gender==='female'?' selected':''}" data-gender="female">
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
        <div class="ob-option${data.goal==='weightloss'?' selected':''}" data-goal="weightloss">
          <div class="ob-option-icon">🔥</div>
          <div class="ob-option-label">WEIGHT LOSS</div>
          <div class="ob-option-sub">Burn fat, lean out</div>
        </div>
        <div class="ob-option${data.goal==='muscle'?' selected':''}" data-goal="muscle">
          <div class="ob-option-icon">💪</div>
          <div class="ob-option-label">MUSCLE GAIN</div>
          <div class="ob-option-sub">Build strength</div>
        </div>
        <div class="ob-option${data.goal==='fitness'?' selected':''}" data-goal="fitness">
          <div class="ob-option-icon">⚡</div>
          <div class="ob-option-label">GENERAL FITNESS</div>
          <div class="ob-option-sub">Stay active & healthy</div>
        </div>
        <div class="ob-option${data.goal==='boxing'?' selected':''}" data-goal="boxing">
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
      <div class="ob-option-grid ob-option-3col" id="env-grid" style="grid-template-columns:1fr">
        <div class="ob-option${data.workoutEnv==='gym'?' selected':''}" data-env="gym" style="display:flex;align-items:center;gap:12px;text-align:left;padding:14px 16px">
          <div style="font-size:28px">🏋️</div>
          <div>
            <div class="ob-option-label">GYM</div>
            <div class="ob-option-sub">Full equipment access</div>
          </div>
        </div>
        <div class="ob-option${data.workoutEnv==='home_equip'?' selected':''}" data-env="home_equip" style="display:flex;align-items:center;gap:12px;text-align:left;padding:14px 16px">
          <div style="font-size:28px">🏠</div>
          <div>
            <div class="ob-option-label">HOME — WITH EQUIPMENT</div>
            <div class="ob-option-sub">Dumbbells, bands, pull-up bar, etc.</div>
          </div>
        </div>
        <div class="ob-option${data.workoutEnv==='home_bw'?' selected':''}" data-env="home_bw" style="display:flex;align-items:center;gap:12px;text-align:left;padding:14px 16px">
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
          {id:'dumbbells',    label:'Dumbbells',            sub:'Any weight'},
          {id:'bands',        label:'Resistance Bands',     sub:'Light / medium / heavy'},
          {id:'pullupbar',    label:'Pull-up Bar',          sub:'Door frame or wall mount'},
          {id:'bench',        label:'Bench / Sturdy Chair', sub:'For step-ups, dips'},
          {id:'kettlebell',   label:'Kettlebell',           sub:'Any weight'},
          {id:'jumprope',     label:'Jump Rope',            sub:'For cardio'},
          {id:'mat',          label:'Exercise Mat',         sub:'Yoga / foam mat'}
        ].map(eq => `
          <div class="ob-equip-item" data-equip="${eq.id}" id="equip-${eq.id}">
            <div class="ob-equip-box${data.equipment.includes(eq.id)?' checked':''}"></div>
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
        <div class="ob-option${data.fitnessLevel==='beginner'?' selected':''}" data-level="beginner" style="display:flex;align-items:center;gap:12px;text-align:left;padding:14px 16px">
          <div style="font-size:24px">🌱</div>
          <div>
            <div class="ob-option-label">BEGINNER</div>
            <div class="ob-option-sub">New to training or returning after a long break</div>
          </div>
        </div>
        <div class="ob-option${data.fitnessLevel==='intermediate'?' selected':''}" data-level="intermediate" style="display:flex;align-items:center;gap:12px;text-align:left;padding:14px 16px">
          <div style="font-size:24px">⚡</div>
          <div>
            <div class="ob-option-label">INTERMEDIATE</div>
            <div class="ob-option-sub">Training 3–6 months consistently</div>
          </div>
        </div>
        <div class="ob-option${data.fitnessLevel==='advanced'?' selected':''}" data-level="advanced" style="display:flex;align-items:center;gap:12px;text-align:left;padding:14px 16px">
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

    if (backBtn) backBtn.addEventListener('click', () => { step--; if (step === 6 && data.workoutEnv !== 'home_equip') step--; render(); });

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
```

#### Step 2 — Commit

```
git add js/onboarding.js
git commit -m "feat: replace onboarding with 8-step personalized setup flow"
git push
```

---

## Phase 7 — Personalization Engine

**Goal:** Implement `js/analyzer.js` — a fully offline engine that takes profile data and returns a complete personalized plan including calorie target, protein target, workout routine type, and difficulty.

### Execution Details

**Files to modify:** `js/analyzer.js` — full implementation

#### Step 1 — Replace `js/analyzer.js`

```js
'use strict';

function analyzePlan(data) {
  const { gender, age, startWeight, targetWeight, goal, workoutEnv, equipment, fitnessLevel } = data;

  // ── BMR (Mifflin-St Jeor) ──
  const weightKg = startWeight || 82;
  const heightCm = 170; // default, no height input — conservative estimate
  const ageYrs   = age || 25;
  const bmr = gender === 'female'
    ? (10 * weightKg) + (6.25 * heightCm) - (5 * ageYrs) - 161
    : (10 * weightKg) + (6.25 * heightCm) - (5 * ageYrs) + 5;

  // ── Activity multiplier ──
  const activityMap = { beginner: 1.375, intermediate: 1.55, advanced: 1.725 };
  const tdee = Math.round(bmr * (activityMap[fitnessLevel] || 1.375));

  // ── Calorie target by goal ──
  let calories;
  if (goal === 'weightloss') calories = Math.max(1200, tdee - 400);
  else if (goal === 'muscle') calories = tdee + 250;
  else calories = tdee;

  // ── Protein target ──
  let proteinMultiplier;
  if (goal === 'muscle')      proteinMultiplier = 2.2;
  else if (goal === 'weightloss') proteinMultiplier = 2.0;
  else                        proteinMultiplier = 1.8;
  const protein = Math.round(weightKg * proteinMultiplier);

  // ── Training type label ──
  const envLabels = { gym: 'GYM SPLIT', home_equip: 'HOME + EQUIPMENT', home_bw: 'BODYWEIGHT' };
  const trainingType = envLabels[workoutEnv] || 'BODYWEIGHT';

  // ── Weekly sessions ──
  const sessionsMap = { beginner: 4, intermediate: 5, advanced: 6 };
  const weeklySessions = sessionsMap[fitnessLevel] || 4;

  // ── Difficulty label ──
  const difficultyMap = { beginner: 'FOUNDATION', intermediate: 'BUILD', advanced: 'INTENSITY' };
  const difficulty = difficultyMap[fitnessLevel] || 'FOUNDATION';

  // ── Focus label ──
  const focusMap = {
    weightloss: 'FAT LOSS + CARDIO',
    muscle:     'HYPERTROPHY + STRENGTH',
    fitness:    'ENDURANCE + CONDITIONING',
    boxing:     'BOXING + CONDITIONING'
  };
  const focus = focusMap[goal] || 'GENERAL FITNESS';

  // ── Custom exercise library by environment ──
  const customExercises = buildCustomExercises(workoutEnv, equipment, fitnessLevel, goal);

  return {
    calories,
    protein,
    trainingType,
    weeklySessions,
    difficulty,
    focus,
    customExercises,
    bmr: Math.round(bmr),
    tdee
  };
}

function buildCustomExercises(env, equipment, level, goal) {
  const hasEquip = id => Array.isArray(equipment) && equipment.includes(id);
  const sets = level === 'beginner' ? 2 : level === 'intermediate' ? 3 : 4;

  // ── Push exercises ──
  const push = [];
  if (env === 'gym') {
    push.push({ name: 'Bench Press',      sets, reps: level==='beginner'?'8–10':'6–10',  cue: 'Retract scapula, bar to lower chest, full lockout.' });
    push.push({ name: 'Overhead Press',   sets, reps: '8–10', cue: 'Bar starts at clavicle, press straight up, lock out overhead.' });
    push.push({ name: 'Incline Dumbbell Press', sets, reps: '10–12', cue: '30–45° incline, lower to upper chest, controlled descent.' });
    push.push({ name: 'Tricep Pushdown',  sets, reps: '12–15', cue: 'Elbows pinned to sides, full extension at bottom.' });
  } else if (env === 'home_equip') {
    push.push({ name: 'Push-ups',        sets, reps: '8–15', cue: 'Hands shoulder-width, chest to 2cm from floor.' });
    if (hasEquip('dumbbells')) push.push({ name: 'Dumbbell Press (floor)', sets, reps: '10–12', cue: 'Lie on floor, press dumbbells up, full lockout.' });
    if (hasEquip('bands'))     push.push({ name: 'Band Chest Press',  sets, reps: '12–15', cue: 'Anchor band behind you, press forward at chest height.' });
    if (hasEquip('bench'))     push.push({ name: 'Decline Push-ups',  sets, reps: '8–12',  cue: 'Feet elevated on bench, hands on floor, lower chest.' });
    push.push({ name: 'Chair Tricep Dips', sets, reps: '8–12', cue: 'Elbows back, hips close to chair, full dip.' });
  } else {
    push.push({ name: 'Push-ups',       sets, reps: level==='beginner'?'5–10':'10–20', cue: 'Hands shoulder-width, chest to 2cm from floor.' });
    push.push({ name: 'Pike Push-ups',  sets, reps: '6–10',  cue: 'Hips high, inverted V, lower head to floor.' });
    push.push({ name: 'Chair Tricep Dips', sets, reps: '8–12', cue: 'Elbows back, hips close to chair, full dip.' });
    if (level !== 'beginner') push.push({ name: 'Diamond Push-ups', sets, reps: '6–10', cue: 'Hands form diamond under chest, elbows track back.' });
  }

  // ── Pull exercises ──
  const pull = [];
  if (env === 'gym') {
    pull.push({ name: 'Barbell Row',       sets, reps: '8–10',  cue: 'Hinge at hips, bar to lower chest, elbows drive back.' });
    pull.push({ name: 'Lat Pulldown',      sets, reps: '10–12', cue: 'Wide grip, pull to upper chest, lean back slightly.' });
    pull.push({ name: 'Seated Cable Row',  sets, reps: '10–12', cue: 'Neutral grip, pull to navel, squeeze shoulder blades.' });
    pull.push({ name: 'Face Pulls',        sets, reps: '15–20', cue: 'Rope to face level, elbows high, external rotation.' });
  } else if (env === 'home_equip') {
    if (hasEquip('pullupbar')) pull.push({ name: 'Pull-ups / Chin-ups', sets, reps: level==='beginner'?'3–5':'6–10', cue: 'Dead hang start, chin over bar, controlled descent.' });
    if (hasEquip('bands'))     pull.push({ name: 'Band Pull-Apart',     sets, reps: '15–20', cue: 'Arms straight in front, pull band apart to chest level.' });
    if (hasEquip('dumbbells')) pull.push({ name: 'Dumbbell Row (1-arm)',sets, reps: '10–12', cue: 'Support on bench/chair, row to hip, elbow back.' });
    pull.push({ name: 'Bedsheet Rows', sets, reps: '8–12', cue: 'Secure sheet in door, lean back 45°, pull chest to hands.' });
    pull.push({ name: 'Superman Hold', sets, reps: '10×3s', cue: 'Lie face down, lift arms and legs, hold 3s each.' });
  } else {
    pull.push({ name: 'Bedsheet Rows', sets, reps: '8–12', cue: 'Secure sheet in door, lean back, pull chest to hands.' });
    pull.push({ name: 'Superman Hold', sets, reps: '10×3s', cue: 'Lie face down, lift arms and legs, hold 3s each.' });
    pull.push({ name: 'Reverse Snow Angels', sets, reps: '12–15', cue: 'Face down, arms at sides, sweep to overhead, pinch blades.' });
  }

  // ── Leg exercises ──
  const legs = [];
  if (env === 'gym') {
    legs.push({ name: 'Barbell Squat',      sets, reps: '6–10',  cue: 'Bar on traps, break parallel, knees track toes.' });
    legs.push({ name: 'Romanian Deadlift',  sets, reps: '8–10',  cue: 'Hinge at hips, bar drags down legs, feel hamstring stretch.' });
    legs.push({ name: 'Leg Press',          sets, reps: '12–15', cue: 'Feet shoulder-width, push through heels, don\'t lock knees.' });
    legs.push({ name: 'Standing Calf Raise',sets, reps: '15–20', cue: 'Full range of motion, pause at top and bottom.' });
  } else if (env === 'home_equip') {
    if (hasEquip('dumbbells')) {
      legs.push({ name: 'Goblet Squat',    sets, reps: '12–15', cue: 'Hold dumbbell at chest, squat deep, elbows inside knees.' });
      legs.push({ name: 'DB Romanian Deadlift', sets, reps: '10–12', cue: 'Hold DBs at thighs, hinge at hips, lower to mid-shin.' });
    }
    if (hasEquip('bands'))     legs.push({ name: 'Banded Squat',    sets, reps: '15–20', cue: 'Band above knees, push knees out against band.' });
    legs.push({ name: 'Bulgarian Split Squat', sets, reps: '10 each', cue: 'Rear foot on chair, lower front knee to 90°.' });
    legs.push({ name: 'Glute Bridges',         sets, reps: '15–20',   cue: 'Feet flat, drive hips up, squeeze at top 1s.' });
  } else {
    legs.push({ name: 'Squats',              sets, reps: '12–20',   cue: 'Feet shoulder-width, chest up, break parallel.' });
    legs.push({ name: 'Reverse Lunges',      sets, reps: '10 each', cue: 'Step back, both knees 90°, push through front heel.' });
    legs.push({ name: 'Glute Bridges',       sets, reps: '15–20',   cue: 'Feet flat, drive hips up, squeeze at top 1s.' });
    if (level !== 'beginner') legs.push({ name: 'Jump Squats', sets, reps: '8–12', cue: 'Squat to parallel, explode up, land soft.' });
    if (level === 'advanced') legs.push({ name: 'Pistol Squat Progression', sets: 2, reps: '3–5 each', cue: 'Hold support, lower on one leg as deep as possible.' });
  }

  return { push, pull, legs };
}
```

Also update `js/data.js` — at the bottom, add a function that returns exercises from the saved plan if available, falling back to defaults. Modify `EXERCISES` to be a function call:

Add to the **bottom of `js/data.js`**:
```js
function getPersonalizedExercises() {
  const profile = load('profile');
  if (profile && profile.plan && profile.plan.customExercises) {
    return {
      ...profile.plan.customExercises,
      cardio: [],
      rest: []
    };
  }
  return EXERCISES;
}
```

Then in `js/workout.js`, replace all references to `EXERCISES[plan.badge]` with `getPersonalizedExercises()[plan.badge]`.

#### Step 2 — Update diet targets from plan

In `js/diet.js`, update `renderDiet` to use personalized calorie/protein targets:

```js
// At top of renderDiet():
const profile = getProfile();
const planCalories = (profile.plan && profile.plan.calories) || 1900;
const planProtein  = (profile.plan && profile.plan.protein)  || 140;
```

Replace hardcoded `140` and `1900` with `planProtein` and `planCalories`.

#### Step 3 — Commit

```
git add js/analyzer.js js/data.js js/workout.js js/diet.js
git commit -m "feat: add offline personalization engine and wire plan into workout/diet"
git push
```

---

## Phase 8 — Progress Page Personalization

**Goal:** Update `progress.html` / `js/progress.js` to show personalized targets from the profile plan instead of hardcoded 20 push-ups / 30 min run / 72kg.

### Execution Details

**Files to modify:** `js/progress.js`

#### Step 1 — Update `renderProgress()` to use profile targets

At the top of `renderProgress()`, read from profile:

```js
const profile = getProfile();
const plan = profile.plan || {};
const pushupTarget = plan.goal === 'beginner' ? 15 : plan.goal === 'advanced' ? 30 : 20;
const runTarget    = plan.goal === 'boxing' ? 20 : 30;
const weightTarget = profile.targetWeight || 72;
const weightStart  = profile.startWeight  || 82;
```

Replace hardcoded `20` (push-up goal), `30` (run goal), `72` (weight target), `82` (start weight) with these variables throughout `renderProgress()`.

Also update monthly targets to show the personalized difficulty:
```js
const diffLabel = (plan.difficulty || 'FOUNDATION');
```
Add a line below the section header: `<p class="muted text-sm mb-12">Program: ${diffLabel} · ${plan.focus || 'GENERAL'}</p>`

#### Step 2 — Commit

```
git add js/progress.js
git commit -m "feat: personalize progress targets from onboarding plan"
git push
```

---

## Phase 9 — Final Verification & Polish

**Goal:** Verify all pages work, all JS loads without errors, onboarding flows end-to-end, and the app installs as PWA.

### Execution Details

**Checklist to verify (manually in browser):**

- [ ] Open `https://grindlog-chi.vercel.app/` — Today tab renders, no console errors
- [ ] Nav links: Workout → `workout.html` loads, Boxing → `boxing.html` loads, Diet → `diet.html` loads, Progress → `progress.html` loads
- [ ] Each page: correct nav item is highlighted in red
- [ ] Clear localStorage, refresh — onboarding overlay appears
- [ ] Complete all 8 onboarding steps — plan summary shows personalized calories/protein
- [ ] Click "Let's Go" — Today page renders with greeting
- [ ] Go to Workout — exercises match the selected environment (gym/home/bodyweight)
- [ ] Go to Diet — calorie and protein targets match the plan
- [ ] Go to Progress — targets match profile
- [ ] Install banner appears, tap INSTALL — app installs to home screen
- [ ] Open installed app — works offline after first load
- [ ] No console errors on any page

**Files to check if any page is blank:** Open browser devtools → Console tab → look for `renderX:` errors.

#### Step 1 — Fix any issues found during verification

Address all console errors before marking this phase complete.

#### Step 2 — Final commit

```
git add -A
git commit -m "feat: complete GrindLog multi-page refactor with personalized onboarding"
git push
```

---

## Summary Table

| Phase | What it does | Files touched |
|-------|-------------|---------------|
| 1 | CSS extraction | css/base.css, css/components.css, index.html |
| 2 | Core/Data JS | js/core.js, js/data.js, index.html |
| 3 | Page JS modules | js/today.js … js/app.js, index.html |
| 4 | HTML page split | workout.html, boxing.html, diet.html, progress.html, index.html |
| 5 | Service Worker | sw.js, js/analyzer.js (placeholder) |
| 6 | Enhanced onboarding | js/onboarding.js |
| 7 | Personalization engine | js/analyzer.js, js/data.js, js/workout.js, js/diet.js |
| 8 | Progress personalization | js/progress.js |
| 9 | Verification & polish | all |

---

*End of plan. Execute Phase 1 first.*
