// SPDX-License-Identifier: GPL-3.0-or-later
import { getDatabase } from "@shared/db/client";
import type { ProgramUnit } from "@data/program";
import type { BlockType, DayType, IoniconsName } from "@shared/types";

export interface WeekRow {
  id: number;
  weekNumber: number;
  blockName: string;
  blockType: BlockType;
  isDeload: boolean;
  completedDays: number;
  totalDays: number;
  liftingDays: number;
  cardioDays: number;
}

export interface DayRow {
  id: number;
  weekId: number;
  dayNumber: number;
  dayName: string;
  dayType: DayType;
  focus: string;
  sessionKey: string;
  isCompleted: boolean;
}

export interface DayExerciseRow {
  programExerciseId: number;
  exerciseId: number;
  exerciseName: string;
  videoUrl: string | null;
  muscleGroup: string;
  equipment: string;
  order: number;
  warmupSets: number;
  workingSets: number;
  targetReps: string;
  intensityTechnique: string | null;
  earlySetRpe: number | null;
  lastSetRpe: number | null;
  restSeconds: number;
  notes: string | null;
  exerciseNotes: string | null;
  slotKey: string | null;
  unit: ProgramUnit;
  /** Starting weight in kg from the program, or null for bodyweight slots. */
  prescribedWeight: number | null;
  supersetGroup: number | null;
}

export async function getAllWeeks(): Promise<WeekRow[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<{
    id: number;
    week_number: number;
    block_name: string;
    block_type: string;
    is_deload: number;
    completed_days: number;
    total_days: number;
    lifting_days: number;
    cardio_days: number;
  }>(`
    SELECT
      pw.id,
      pw.week_number,
      pw.block_name,
      pw.block_type,
      pw.is_deload,
      COUNT(DISTINCT pd.id) as total_days,
      COUNT(DISTINCT CASE WHEN pd.day_type != 'Rest' THEN pd.id END) as lifting_days,
      COUNT(DISTINCT CASE WHEN pd.session_key LIKE '%cardio%' THEN pd.id END) as cardio_days,
      COUNT(DISTINCT ws.program_day_id) as completed_days
    FROM program_weeks pw
    LEFT JOIN program_days pd ON pd.week_id = pw.id
    LEFT JOIN workout_sessions ws ON ws.program_day_id = pd.id AND ws.completed_at IS NOT NULL
    GROUP BY pw.id
    ORDER BY pw.week_number
  `);

  return rows.map((r) => ({
    id: r.id,
    weekNumber: r.week_number,
    blockName: r.block_name,
    blockType: r.block_type as BlockType,
    isDeload: r.is_deload === 1,
    completedDays: r.completed_days,
    totalDays: r.total_days,
    liftingDays: r.lifting_days,
    cardioDays: r.cardio_days,
  }));
}

export async function getDaysForWeek(weekNumber: number): Promise<DayRow[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<{
    id: number;
    week_id: number;
    day_number: number;
    day_name: string;
    day_type: string;
    focus: string;
    session_key: string;
    is_completed: number;
  }>(
    `
    SELECT
      pd.id,
      pd.week_id,
      pd.day_number,
      pd.day_name,
      pd.day_type,
      pd.focus,
      pd.session_key,
      CASE WHEN EXISTS (
        SELECT 1 FROM workout_sessions ws
        WHERE ws.program_day_id = pd.id
        AND ws.week_number = ?
        AND ws.completed_at IS NOT NULL
      ) THEN 1 ELSE 0 END as is_completed
    FROM program_days pd
    JOIN program_weeks pw ON pd.week_id = pw.id
    WHERE pw.week_number = ?
    ORDER BY pd.day_number
  `,
    [weekNumber, weekNumber]
  );

  return rows.map((r) => ({
    id: r.id,
    weekId: r.week_id,
    dayNumber: r.day_number,
    dayName: r.day_name,
    dayType: r.day_type as DayType,
    focus: r.focus,
    sessionKey: r.session_key,
    isCompleted: r.is_completed === 1,
  }));
}

export async function getExercisesForDay(dayId: number): Promise<DayExerciseRow[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<{
    program_exercise_id: number;
    exercise_id: number;
    exercise_name: string;
    video_url: string | null;
    muscle_group: string;
    order: number;
    warmup_sets: number;
    working_sets: number;
    target_reps: string;
    intensity_technique: string | null;
    early_set_rpe: number | null;
    last_set_rpe: number | null;
    rest_seconds: number;
    notes: string | null;
    exercise_notes: string | null;
    equipment: string;
    slot_key: string | null;
    unit: ProgramUnit;
    prescribed_weight: number | null;
    superset_group: number | null;
  }>(
    `
    SELECT
      pe.id as program_exercise_id,
      e.id as exercise_id,
      e.name as exercise_name,
      e.video_url,
      e.muscle_group,
      pe."order",
      pe.warmup_sets,
      pe.working_sets,
      pe.target_reps,
      pe.intensity_technique,
      pe.early_set_rpe,
      pe.last_set_rpe,
      pe.rest_seconds,
      pe.notes,
      e.notes as exercise_notes,
      e.equipment,
      pe.slot_key,
      pe.unit,
      pe.prescribed_weight,
      pe.superset_group
    FROM program_exercises pe
    JOIN exercises e ON pe.exercise_id = e.id
    WHERE pe.day_id = ?
    ORDER BY pe."order"
  `,
    [dayId]
  );

  return rows.map((r) => ({
    programExerciseId: r.program_exercise_id,
    exerciseId: r.exercise_id,
    exerciseName: r.exercise_name,
    videoUrl: r.video_url,
    muscleGroup: r.muscle_group,
    order: r.order,
    warmupSets: r.warmup_sets,
    workingSets: r.working_sets,
    targetReps: r.target_reps,
    intensityTechnique: r.intensity_technique,
    earlySetRpe: r.early_set_rpe,
    lastSetRpe: r.last_set_rpe,
    restSeconds: r.rest_seconds,
    notes: r.notes,
    exerciseNotes: r.exercise_notes,
    equipment: r.equipment ?? '',
    slotKey: r.slot_key,
    unit: r.unit,
    prescribedWeight: r.prescribed_weight,
    supersetGroup: r.superset_group,
  }));
}

export async function getSubstitutionsForExercise(
  programExerciseId: number
): Promise<{ exerciseId: number; exerciseName: string; priority: number }[]> {
  const db = getDatabase();
  return await db.getAllAsync<{
    exerciseId: number;
    exerciseName: string;
    priority: number;
  }>(
    `
    SELECT
      e.id as exerciseId,
      e.name as exerciseName,
      es.priority
    FROM exercise_substitutions es
    JOIN exercises e ON es.substitution_exercise_id = e.id
    WHERE es.program_exercise_id = ?
    ORDER BY es.priority
  `,
    [programExerciseId]
  );
}

export async function getDayInfo(dayId: number): Promise<{
  dayName: string;
  dayType: DayType;
  weekNumber: number;
  dayNumber: number;
  focus: string;
  sessionKey: string;
} | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<{
    day_name: string;
    day_type: string;
    week_number: number;
    day_number: number;
    focus: string;
    session_key: string;
  }>(
    `
    SELECT pd.day_name, pd.day_type, pw.week_number, pd.day_number, pd.focus, pd.session_key
    FROM program_days pd
    JOIN program_weeks pw ON pd.week_id = pw.id
    WHERE pd.id = ?
  `,
    [dayId]
  );
  if (!row) return null;
  return {
    dayName: row.day_name,
    dayType: row.day_type as DayType,
    weekNumber: row.week_number,
    dayNumber: row.day_number,
    focus: row.focus,
    sessionKey: row.session_key,
  };
}

// Extra exercises (forearms / stretching) that can be added to any day
interface ExtraExerciseTemplate {
  name: string;
  muscleGroup: string;
  workingSets: number;
  targetReps: string;
  restSeconds: number;
  notes: string;
}

const EXTRA_EXERCISES: Record<string, ExtraExerciseTemplate[]> = {
  forearms: [
    {
      name: "Wrist Curls",
      muscleGroup: "Forearms",
      workingSets: 3,
      targetReps: "15-20",
      restSeconds: 60,
      notes: "Seated, rest forearms on thighs. Slow negative, full ROM.",
    },
    {
      name: "Reverse Wrist Curls",
      muscleGroup: "Forearms",
      workingSets: 3,
      targetReps: "15-20",
      restSeconds: 60,
      notes: "Overhand grip. Control the eccentric. Light weight, high reps.",
    },
    {
      name: "Cable Curls",
      muscleGroup: "Forearms",
      workingSets: 3,
      targetReps: "15-20",
      restSeconds: 60,
      notes: "Constant tension throughout ROM. Squeeze at peak contraction.",
    },
    {
      name: "Reverse Curls",
      muscleGroup: "Forearms",
      workingSets: 3,
      targetReps: "12-15",
      restSeconds: 60,
      notes: "Overhand grip on barbell or EZ bar. Builds brachioradialis and forearm extensors.",
    },
  ],
  stretching: [
    {
      name: "Full Body Static Stretch",
      muscleGroup: "Full Body",
      workingSets: 1,
      targetReps: "10 min",
      restSeconds: 0,
      notes: "Hold each stretch 30-60s: chest doorway, lat hang, hip flexor lunge, hamstring, quad, calf.",
    },
    {
      name: "Dead Hang",
      muscleGroup: "Full Body",
      workingSets: 3,
      targetReps: "30-60s",
      restSeconds: 60,
      notes: "Hang from pull-up bar with relaxed shoulders. Decompresses spine and stretches lats/forearms.",
    },
  ],
};

export function getExtraCategories(): { key: string; label: string; icon: IoniconsName }[] {
  return [
    { key: "forearms", label: "Forearms", icon: "hand-left-outline" },
    { key: "stretching", label: "Stretching", icon: "body-outline" },
  ];
}

export async function addExtrasToDayIfNeeded(
  dayId: number,
  category: string
): Promise<boolean> {
  const db = getDatabase();
  const templates = EXTRA_EXERCISES[category];
  if (!templates) return false;

  // Get max order for this day
  const maxRow = await db.getFirstAsync<{ max_order: number | null }>(
    `SELECT MAX("order") as max_order FROM program_exercises WHERE day_id = ?`,
    [dayId]
  );
  let nextOrder = (maxRow?.max_order ?? 0) + 1;

  for (const tmpl of templates) {
    // Ensure exercise exists in exercises table
    let exercise = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM exercises WHERE name = ?`,
      [tmpl.name]
    );

    if (!exercise) {
      const result = await db.runAsync(
        `INSERT INTO exercises (name, muscle_group, notes) VALUES (?, ?, ?)`,
        [tmpl.name, tmpl.muscleGroup, tmpl.notes]
      );
      exercise = { id: result.lastInsertRowId };
    }

    // Check if already added to this day
    const existing = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM program_exercises WHERE day_id = ? AND exercise_id = ?`,
      [dayId, exercise.id]
    );

    if (!existing) {
      await db.runAsync(
        `INSERT INTO program_exercises (day_id, exercise_id, "order", warmup_sets, working_sets, target_reps, rest_seconds, notes)
         VALUES (?, ?, ?, 0, ?, ?, ?, ?)`,
        [dayId, exercise.id, nextOrder, tmpl.workingSets, tmpl.targetReps, tmpl.restSeconds, tmpl.notes]
      );
      nextOrder++;
    }
  }

  return true;
}

export async function removeExtrasFromDay(
  dayId: number,
  category: string
): Promise<void> {
  const db = getDatabase();
  const templates = EXTRA_EXERCISES[category];
  if (!templates) return;

  for (const tmpl of templates) {
    const exercise = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM exercises WHERE name = ?`,
      [tmpl.name]
    );
    if (exercise) {
      await db.runAsync(
        `DELETE FROM program_exercises WHERE day_id = ? AND exercise_id = ?`,
        [dayId, exercise.id]
      );
    }
  }
}

export async function dayHasExtras(
  dayId: number,
  category: string
): Promise<boolean> {
  const db = getDatabase();
  const templates = EXTRA_EXERCISES[category];
  if (!templates || templates.length === 0) return false;

  const exercise = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM exercises WHERE name = ?`,
    [templates[0].name]
  );
  if (!exercise) return false;

  const row = await db.getFirstAsync<{ cnt: number }>(
    `SELECT COUNT(*) as cnt FROM program_exercises WHERE day_id = ? AND exercise_id = ?`,
    [dayId, exercise.id]
  );
  return (row?.cnt ?? 0) > 0;
}
