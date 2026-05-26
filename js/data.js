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
