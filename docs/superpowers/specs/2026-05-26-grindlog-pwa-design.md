# GrindLog PWA — Design Spec
Date: 2026-05-26

## Overview

A mobile-first Progressive Web App fitness tracker for a 26-year-old male web developer working graveyard shift (9PM–6AM) in Davao, Philippines. Fully offline, localStorage only, no backend.

---

## Architecture

**Approach: Single `index.html`**

- All HTML, CSS, and JS embedded in one file
- `manifest.json` and `sw.js` as sibling files
- `/icons/` folder with 192px and 512px PNGs generated via Canvas API
- Zero build step — open in browser, done

**File structure:**
```
/
├── index.html        ← entire app
├── manifest.json
├── sw.js
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

---

## Design Language

**Anti-patterns (explicitly forbidden):**
- No `linear-gradient` anywhere — flat colors only
- No `box-shadow` glow effects or frosted glass
- No over-rounded corners (8px max)
- No generic wellness app chrome
- No purple, no pastel, no soft blurs

**What it is:**
- Dark background: `#0d0d0d`
- Accent: `#e63946` (electric red) — used sparingly on active/interactive states only
- Secondary surface: `#1a1a1a` for cards
- Border: `#2a2a2a` solid 1px for separation
- Typography-first: Bebas Neue headings carry visual weight
- Body text: DM Sans
- Sharp borders, not decorative chrome
- Feels like a physical training logbook

**Colors:**
```
--bg:        #0d0d0d
--surface:   #1a1a1a
--border:    #2a2a2a
--accent:    #e63946
--text:      #f0f0f0
--muted:     #888888
```

---

## Tab Structure

5 tabs in a fixed bottom navigation bar:

| Tab | Label | Icon |
|-----|-------|------|
| 1   | Today | SVG: house/home  |
| 2   | Workout | SVG: dumbbell  |
| 3   | Boxing | SVG: fist/glove  |
| 4   | Diet  | SVG: bowl/food   |
| 5   | Progress | SVG: bar chart |

All nav icons are inline SVG — no emoji, no icon font, no external library. SVGs drawn as simple geometric shapes, stroke-based, ~20x20px viewBox.

Tab switching: JS toggles `.tab-active` on `<section>` elements + `.nav-active` on nav buttons. No routing library.

---

## Tab 1 — Today

- Time-based greeting: "Good afternoon, champ." / "Pre-shift time." / "Rise and grind."
- Current date display
- Quick stat row: weight, days trained this week, streak counter (all editable inline)
- Today's Plan card: shows scheduled workout based on day of week, "Start Session" button
- Daily Checklist: 7 default items + custom items; resets at midnight; tap to complete with pop animation + `navigator.vibrate(50)`
- Sleep Tips button → modal with 4-7-8 breathing interactive

---

## Tab 2 — Workout

- 7-day strip (Mon–Sun), tap to select day, active day highlighted in accent
- Warm-up checklist (always shown at top of session)
- Exercise list for selected day with set logger (tap circles to mark sets done)
- Rest timer: 60-second countdown, optional, appears after set completion
- "Finish Session" → logs to localStorage `sessions` array
- Exercise Library: collapsible cards with form cues
- Cardio sub-section: walk-run interval timer (4 phases based on week number), START/PAUSE/RESET, `navigator.vibrate` on interval switch

---

## Tab 3 — Boxing

- Round timer: big countdown, START/PAUSE/RESET, rest countdown between rounds
- Current month plan auto-detected from `profile.startDate`
- Combo reference: collapsible cards
- Punch counter: large tap area, count vs target, resets each round
- Session log form after completion: rounds + feeling (Easy/Moderate/Hard)
- `navigator.vibrate([100, 50, 100])` on round end; Web Audio API beep (no external files)

---

## Tab 4 — Diet

- Daily macro tracker: protein + calories (editable inputs with progress bars), water (tap counter)
- Meal schedule: timeline with checkboxes, resets daily
- Meal Prep Reference: collapsible
- Budget Grocery List: static reference (PHP prices)
- Protein Sources: card grid

---

## Tab 5 — Progress

- Push-up, running, weight goal cards with progress bars
- Biweekly Test Log: form + history list with deltas
- Streak + session counter
- Milestone Unlock Tracker: tap to complete, shows unlock reward
- Monthly Checkpoints: read-only reference

---

## State Management

All state in localStorage. Key namespaces:
- `profile` — name, startDate, startWeight, targetWeight
- `daily_YYYY-MM-DD` — checklist, macros, meals
- `sessions` — workout session array
- `boxing_sessions` — boxing session array
- `progress_tests` — biweekly test array
- `milestones` — milestone completion
- `custom_checklist` — user-added checklist items (persist across days)
- `current_stats` — weight, PRs, streak, totalSessions

All localStorage writes wrapped in `try/catch`.

---

## UX Behaviors

**First Launch Onboarding:** 3-step modal (name → weight → start date), then Today tab.

**Midnight Reset:** On app open, compare today's date to `lastOpened` in localStorage. If different → reset daily checklist completion, macros, meals. Custom items persist (only done status resets).

**Streak Logic:** After logging any session → check if yesterday had a session. Yes → increment. No → reset to 1.

**Haptics:**
- Checklist item done: `vibrate(50)`
- Boxing round end: `vibrate([100, 50, 100])`
- Session complete: `vibrate(200)`

---

## PWA

**manifest.json:** name "GrindLog — Fighter's Training Journal", theme `#e63946`, background `#0d0d0d`, portrait, icons at 192+512.

**sw.js:** Cache-first strategy, cache name `grindlog-v1`, caches index.html + manifest.json + Google Fonts URLs.

**Install prompt:** Subtle bottom banner on first load if PWA installable. Dismissable, stores dismissal in localStorage.

---

## Timers (State Machine Pattern)

All 3 timers (cardio interval, boxing round, 4-7-8 breathing) use the same pattern:
```
state: idle | running | paused
setInterval stored in variable, cleared on pause/reset
START button: state idle→running, create interval
PAUSE button: state running→paused, clearInterval
RESET button: any state→idle, clearInterval, reset values
```

---

## Icons

Pre-generated PNG files committed to `/icons/`:
- 192x192 and 512x512
- Generated via a one-time Canvas script (not runtime)
- Dark `#0d0d0d` background, "GL" in bold sans-serif, `#e63946` accent border
- Actual `.png` files checked in — service worker can cache them reliably
