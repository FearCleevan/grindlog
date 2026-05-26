'use strict';

function analyzePlan(data) {
  const { gender, age, startWeight, targetWeight, goal, workoutEnv, equipment, fitnessLevel } = data;

  // BMR via Mifflin-St Jeor (height defaults to 170cm — no height input collected)
  const weightKg = startWeight || 82;
  const heightCm = 170;
  const ageYrs   = age || 25;
  const bmr = gender === 'female'
    ? (10 * weightKg) + (6.25 * heightCm) - (5 * ageYrs) - 161
    : (10 * weightKg) + (6.25 * heightCm) - (5 * ageYrs) + 5;

  const activityMap = { beginner: 1.375, intermediate: 1.55, advanced: 1.725 };
  const tdee = Math.round(bmr * (activityMap[fitnessLevel] || 1.375));

  let calories;
  if (goal === 'weightloss') calories = Math.max(1200, tdee - 400);
  else if (goal === 'muscle') calories = tdee + 250;
  else calories = tdee;

  const proteinMultiplier = goal === 'muscle' ? 2.2 : goal === 'weightloss' ? 2.0 : 1.8;
  const protein = Math.round(weightKg * proteinMultiplier);

  const envLabels = { gym: 'GYM SPLIT', home_equip: 'HOME + EQUIPMENT', home_bw: 'BODYWEIGHT' };
  const trainingType = envLabels[workoutEnv] || 'BODYWEIGHT';

  const sessionsMap = { beginner: 4, intermediate: 5, advanced: 6 };
  const weeklySessions = sessionsMap[fitnessLevel] || 4;

  const difficultyMap = { beginner: 'FOUNDATION', intermediate: 'BUILD', advanced: 'INTENSITY' };
  const difficulty = difficultyMap[fitnessLevel] || 'FOUNDATION';

  const focusMap = {
    weightloss: 'FAT LOSS + CARDIO',
    muscle:     'HYPERTROPHY + STRENGTH',
    fitness:    'ENDURANCE + CONDITIONING',
    boxing:     'BOXING + CONDITIONING'
  };
  const focus = focusMap[goal] || 'GENERAL FITNESS';

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

  const push = [];
  if (env === 'gym') {
    push.push({ name: 'Bench Press',           sets, reps: level === 'beginner' ? '8–10' : '6–10', cue: 'Retract scapula, bar to lower chest, full lockout.' });
    push.push({ name: 'Overhead Press',        sets, reps: '8–10',  cue: 'Bar starts at clavicle, press straight up, lock out overhead.' });
    push.push({ name: 'Incline Dumbbell Press',sets, reps: '10–12', cue: '30–45° incline, lower to upper chest, controlled descent.' });
    push.push({ name: 'Tricep Pushdown',       sets, reps: '12–15', cue: 'Elbows pinned to sides, full extension at bottom.' });
  } else if (env === 'home_equip') {
    push.push({ name: 'Push-ups', sets, reps: '8–15', cue: 'Hands shoulder-width, chest to 2cm from floor.' });
    if (hasEquip('dumbbells')) push.push({ name: 'Dumbbell Press (floor)', sets, reps: '10–12', cue: 'Lie on floor, press dumbbells up, full lockout.' });
    if (hasEquip('bands'))     push.push({ name: 'Band Chest Press',       sets, reps: '12–15', cue: 'Anchor band behind you, press forward at chest height.' });
    if (hasEquip('bench'))     push.push({ name: 'Decline Push-ups',       sets, reps: '8–12',  cue: 'Feet elevated on bench, hands on floor, lower chest.' });
    push.push({ name: 'Chair Tricep Dips', sets, reps: '8–12', cue: 'Elbows back, hips close to chair, full dip.' });
  } else {
    push.push({ name: 'Push-ups',          sets, reps: level === 'beginner' ? '5–10' : '10–20', cue: 'Hands shoulder-width, chest to 2cm from floor.' });
    push.push({ name: 'Pike Push-ups',     sets, reps: '6–10',  cue: 'Hips high, inverted V, lower head to floor.' });
    push.push({ name: 'Chair Tricep Dips', sets, reps: '8–12',  cue: 'Elbows back, hips close to chair, full dip.' });
    if (level !== 'beginner') push.push({ name: 'Diamond Push-ups', sets, reps: '6–10', cue: 'Hands form diamond under chest, elbows track back.' });
  }

  const pull = [];
  if (env === 'gym') {
    pull.push({ name: 'Barbell Row',      sets, reps: '8–10',  cue: 'Hinge at hips, bar to lower chest, elbows drive back.' });
    pull.push({ name: 'Lat Pulldown',     sets, reps: '10–12', cue: 'Wide grip, pull to upper chest, lean back slightly.' });
    pull.push({ name: 'Seated Cable Row', sets, reps: '10–12', cue: 'Neutral grip, pull to navel, squeeze shoulder blades.' });
    pull.push({ name: 'Face Pulls',       sets, reps: '15–20', cue: 'Rope to face level, elbows high, external rotation.' });
  } else if (env === 'home_equip') {
    if (hasEquip('pullupbar')) pull.push({ name: 'Pull-ups / Chin-ups', sets, reps: level === 'beginner' ? '3–5' : '6–10', cue: 'Dead hang start, chin over bar, controlled descent.' });
    if (hasEquip('bands'))     pull.push({ name: 'Band Pull-Apart',     sets, reps: '15–20', cue: 'Arms straight in front, pull band apart to chest level.' });
    if (hasEquip('dumbbells')) pull.push({ name: 'Dumbbell Row (1-arm)',sets, reps: '10–12', cue: 'Support on bench/chair, row to hip, elbow back.' });
    pull.push({ name: 'Bedsheet Rows', sets, reps: '8–12',  cue: 'Secure sheet in door, lean back 45°, pull chest to hands.' });
    pull.push({ name: 'Superman Hold', sets, reps: '10×3s', cue: 'Lie face down, lift arms and legs, hold 3s each.' });
  } else {
    pull.push({ name: 'Bedsheet Rows',       sets, reps: '8–12',  cue: 'Secure sheet in door, lean back, pull chest to hands.' });
    pull.push({ name: 'Superman Hold',       sets, reps: '10×3s', cue: 'Lie face down, lift arms and legs, hold 3s each.' });
    pull.push({ name: 'Reverse Snow Angels', sets, reps: '12–15', cue: 'Face down, arms at sides, sweep to overhead, pinch blades.' });
  }

  const legs = [];
  if (env === 'gym') {
    legs.push({ name: 'Barbell Squat',       sets, reps: '6–10',  cue: 'Bar on traps, break parallel, knees track toes.' });
    legs.push({ name: 'Romanian Deadlift',   sets, reps: '8–10',  cue: 'Hinge at hips, bar drags down legs, feel hamstring stretch.' });
    legs.push({ name: 'Leg Press',           sets, reps: '12–15', cue: 'Feet shoulder-width, push through heels, don\'t lock knees.' });
    legs.push({ name: 'Standing Calf Raise', sets, reps: '15–20', cue: 'Full range of motion, pause at top and bottom.' });
  } else if (env === 'home_equip') {
    if (hasEquip('dumbbells')) {
      legs.push({ name: 'Goblet Squat',         sets, reps: '12–15', cue: 'Hold dumbbell at chest, squat deep, elbows inside knees.' });
      legs.push({ name: 'DB Romanian Deadlift', sets, reps: '10–12', cue: 'Hold DBs at thighs, hinge at hips, lower to mid-shin.' });
    }
    if (hasEquip('bands')) legs.push({ name: 'Banded Squat', sets, reps: '15–20', cue: 'Band above knees, push knees out against band.' });
    legs.push({ name: 'Bulgarian Split Squat', sets, reps: '10 each', cue: 'Rear foot on chair, lower front knee to 90°.' });
    legs.push({ name: 'Glute Bridges',         sets, reps: '15–20',   cue: 'Feet flat, drive hips up, squeeze at top 1s.' });
  } else {
    legs.push({ name: 'Squats',         sets, reps: '12–20',   cue: 'Feet shoulder-width, chest up, break parallel.' });
    legs.push({ name: 'Reverse Lunges', sets, reps: '10 each', cue: 'Step back, both knees 90°, push through front heel.' });
    legs.push({ name: 'Glute Bridges',  sets, reps: '15–20',   cue: 'Feet flat, drive hips up, squeeze at top 1s.' });
    if (level !== 'beginner') legs.push({ name: 'Jump Squats',              sets, reps: '8–12',    cue: 'Squat to parallel, explode up, land soft.' });
    if (level === 'advanced') legs.push({ name: 'Pistol Squat Progression', sets: 2, reps: '3–5 each', cue: 'Hold support, lower on one leg as deep as possible.' });
  }

  return { push, pull, legs };
}

function getPersonalizedExercises() {
  const profile = load('profile');
  if (profile && profile.plan && profile.plan.customExercises) {
    return {
      ...profile.plan.customExercises,
      cardio: [],
      rest: []
    };
  }
  return typeof EXERCISES !== 'undefined' ? EXERCISES : { push: [], pull: [], legs: [], cardio: [], rest: [] };
}
