#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Builds src/data/program/foundationalFitness.json, the program that ships
// with the app, from a JSON export of the program tables.
//
// Usage: node scripts/build-program-data.mjs <path-to-export.json>
//
// The export holds { data: { exercises, program_weeks, program_days,
// program_exercises, exercise_substitutions, ... } }. Only those five tables
// are read. Anything else in the file is ignored and never copied.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = join(ROOT, 'src/data/program/foundationalFitness.json');

// Public wording for each slot's coaching note, keyed by slot. Every slot in
// the export must have an entry here, so a new slot can not slip through
// with unreviewed text.
const SLOT_NOTES = {
  L1: 'Main quad compound. Block 2 uses the 12 to 20 rep squat that Protocols recommends for quads.',
  L2: 'Quad isolation. Knees in line with the machine axis; squeeze hard at the top.',
  L3: 'Hamstring isolation. Some hamstrings respond best to heavier 5 to 7 rep curls, so experiment in Block 1.',
  L4: 'Hamstring compound, the stiff-legged deadlift from Protocols: lower under control as far as a flat back allows. It doubles as posterior chain flexibility work. Block 1 load is per dumbbell.',
  L5: 'The optional third quad compound in Protocols (rear-leg-elevated split squat or lunges); glutes work here too. Reps per leg, load per dumbbell.',
  L6: 'Calves, straight knee. Full range: deep stretch, full lockout. Block 2 goes high rep, as Protocols suggests for calves.',
  L7: 'Calves, bent knee (soleus). Controlled, full range.',
  L8: 'From the Huberman Lab podcast rather than Protocols. A light primer before squats, stopping 2 reps short of failure. Hold a plate once 30 reps is easy.',
  S1: 'Shoulder compound. Block 2 load is per dumbbell.',
  S2: 'Side delt isolation. Two sets of 12 to 15 taken to true failure are their own kind of intense (Protocols).',
  S3: 'A must-do in Protocols for rear delts, posture and shoulder health (Cavaliere): rope high, pull to the forehead, elbows high, finish with external rotation.',
  S4: 'Triceps compound (dips, as on the arms day in Protocols). Use the assist machine as needed; add load once you get 10 to 12 clean reps.',
  S5: 'Triceps isolation, the overhead extension that Protocols names.',
  S6: 'Biceps compound, the palms-facing-you pull-up that Protocols puts on arms day. Assist or band if needed; add load once you get 10 to 12.',
  S7: 'Biceps isolation. Block 2 load is per dumbbell.',
  S8: 'Forearms, optional in Protocols: 3 to 4 sets of wrist flexor or extensor work at 12 to 30 reps, no heavy low rep forearm work. Block 1 trains the flexors (palms up), Block 2 the extensors (palms down); swap any time.',
  S10: 'Not from Protocols: an optional grip finisher. Load is per hand, tall posture.',
  S11: 'Second weekly ab session, since Protocols lists abs and core on arms day too. Loaded and progressive, like any other muscle.',
  T1: 'Chest compound. Machine or dumbbells, never a barbell bench to failure without a spotter (Protocols). Block 2 load is per dumbbell.',
  T2: "Chest isolation. Can't feel your chest on the press? Do this one first (the pre-exhaustion trick from Protocols).",
  T3: 'Vertical pull compound. Band or assist machine if you cannot get 5 clean reps; add load once you get 10 to 12.',
  T4: 'Horizontal pull compound. Full range, controlled lowering.',
  T5: 'Lat isolation, an optional extra. Protocols says the two back compounds are usually enough and a pullover machine is a fine extra. Big stretch at the top.',
  T6: 'Core, the hanging progression from Protocols: knee raises, then chair sits or L-sits, then pikes (shins to the bar, sets of 3 to 5). Once the top of the range is clean, move to the next variation. No swinging.',
  T8: 'Neck is optional on this day in Protocols, which gives no reps for it. Slow, small range. Stopping 2 reps short of failure is a safety choice, not from Protocols.',
  T9: 'Towel on the forehead, chin tuck, slow. Stopping 2 reps short of failure is a safety choice, not from Protocols.',
};

// Exercise notes that need more than the generic clean up below.
const EXERCISE_NOTES = {
  'Tibialis Raise':
    'Heels on the floor, back against a wall or on a tib bar; lift the toes as high as you can, with a 2 second pause at the top. Huberman opens leg day with these.',
};

// Text that must never reach the bundled data.
// Personal phrasing such as "kept at your request" counts too.
const FORBIDDEN = [/[\u2013\u2014]/, /\brequest\b/i];

function clean(text) {
  if (text == null) return null;
  return text
    .replace(/(\d)\s*[\u2013\u2014]\s*(\d)/g, '$1 to $2')
    .replace(/\s*[\u2013\u2014]\s*/g, ', ')
    .trim();
}

function fail(message) {
  console.error(`build-program-data: ${message}`);
  process.exit(1);
}

const inputPath = process.argv[2];
if (!inputPath) {
  fail('pass the path to the program export, for example: node scripts/build-program-data.mjs ./export.json');
}

const raw = JSON.parse(readFileSync(inputPath, 'utf8'));
const tables = raw.data ?? raw;
const {
  exercises,
  program_weeks: weeks,
  program_days: days,
  program_exercises: slots,
  exercise_substitutions: substitutions,
} = tables;
for (const [name, rows] of Object.entries({ exercises, weeks, days, slots, substitutions })) {
  if (!Array.isArray(rows)) fail(`missing table: ${name}`);
}

const exerciseById = new Map(exercises.map((e) => [e.id, e]));
const exerciseName = (id) => {
  const exercise = exerciseById.get(id);
  if (!exercise) fail(`unknown exercise id ${id}`);
  return exercise.name;
};

// One note per slot, and every slot needs public wording.
const notesBySlot = new Map();
for (const slot of slots) {
  const seen = notesBySlot.get(slot.slot_key) ?? new Set();
  seen.add(slot.notes ?? '');
  notesBySlot.set(slot.slot_key, seen);
}
for (const [slotKey, notes] of notesBySlot) {
  if (notes.size > 1) fail(`slot ${slotKey} has ${notes.size} different notes`);
  if (!(slotKey in SLOT_NOTES)) fail(`slot ${slotKey} has no public note in SLOT_NOTES`);
}

const substitutionsBySlot = new Map();
for (const sub of [...substitutions].sort((a, b) => a.priority - b.priority)) {
  const list = substitutionsBySlot.get(sub.program_exercise_id) ?? [];
  list.push(exerciseName(sub.substitution_exercise_id));
  substitutionsBySlot.set(sub.program_exercise_id, list);
}

const referenced = new Set();
const program = {
  weeks: [...weeks]
    .sort((a, b) => a.week_number - b.week_number)
    .map((week) => ({
      weekNumber: week.week_number,
      blockName: clean(week.block_name),
      blockType: clean(week.block_type),
      isDeload: week.is_deload === 1,
      days: days
        .filter((day) => day.week_id === week.id)
        .sort((a, b) => a.day_number - b.day_number)
        .map((day) => ({
          dayNumber: day.day_number,
          dayName: clean(day.day_name),
          dayType: day.day_type,
          focus: clean(day.focus) ?? '',
          sessionKey: day.session_key,
          exercises: slots
            .filter((slot) => slot.day_id === day.id)
            .sort((a, b) => a.order - b.order)
            .map((slot) => {
              const subs = substitutionsBySlot.get(slot.id) ?? [];
              referenced.add(slot.exercise_id);
              for (const sub of substitutions) {
                if (sub.program_exercise_id === slot.id) referenced.add(sub.substitution_exercise_id);
              }
              return {
                order: slot.order,
                exercise: exerciseName(slot.exercise_id),
                slotKey: slot.slot_key,
                warmupSets: slot.warmup_sets,
                workingSets: slot.working_sets,
                targetReps: slot.target_reps,
                intensityTechnique: slot.intensity_technique,
                earlySetRpe: slot.early_set_rpe,
                lastSetRpe: slot.last_set_rpe,
                restSeconds: slot.rest_seconds,
                unit: slot.unit,
                prescribedWeight: slot.prescribed_weight,
                supersetGroup: slot.superset_group,
                notes: SLOT_NOTES[slot.slot_key],
                substitutions: subs,
              };
            }),
        })),
    })),
};

const catalog = [...referenced]
  .map((id) => exerciseById.get(id))
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((e) => ({
    name: e.name,
    videoUrl: e.video_url,
    muscleGroup: e.muscle_group,
    equipment: e.equipment,
    notes: EXERCISE_NOTES[e.name] ?? clean(e.notes),
  }));

const output = JSON.stringify({ exercises: catalog, ...program }, null, 2) + '\n';
for (const pattern of FORBIDDEN) {
  if (pattern.test(output)) fail(`output matches ${pattern}, fix the wording first`);
}

writeFileSync(OUTPUT, output);
const dayCount = program.weeks.reduce((n, w) => n + w.days.length, 0);
const slotCount = program.weeks.reduce(
  (n, w) => n + w.days.reduce((m, d) => m + d.exercises.length, 0),
  0,
);
console.log(
  `Wrote ${OUTPUT}: ${program.weeks.length} weeks, ${dayCount} days, ${slotCount} exercises, ${catalog.length} catalog entries`,
);
