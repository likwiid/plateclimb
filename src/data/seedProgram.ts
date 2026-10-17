// SPDX-License-Identifier: GPL-3.0-or-later
import type { SQLiteDatabase } from 'expo-sqlite';

import { foundationalFitness, type ProgramData } from './program';

/**
 * Writes the bundled program into the schedule tables: its exercises first
 * (an exercise that is already in the catalog only gets its video link),
 * then the weeks, days, exercise slots and substitutions.
 */
export async function seedProgram(
  db: SQLiteDatabase,
  program: ProgramData = foundationalFitness,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const exercise of program.exercises) {
      await db.runAsync(
        `INSERT INTO exercises (name, video_url, muscle_group, equipment, notes)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(name) DO UPDATE SET video_url = excluded.video_url`,
        [exercise.name, exercise.videoUrl, exercise.muscleGroup, exercise.equipment, exercise.notes],
      );
    }

    const rows = await db.getAllAsync<{ id: number; name: string }>(
      `SELECT id, name FROM exercises`,
    );
    const exerciseIds = new Map(rows.map((r) => [r.name, r.id]));
    const idFor = (name: string): number => {
      const id = exerciseIds.get(name);
      if (id === undefined) throw new Error(`Program exercise missing from catalog: ${name}`);
      return id;
    };

    for (const week of program.weeks) {
      const weekRow = await db.runAsync(
        `INSERT INTO program_weeks (week_number, block_name, block_type, is_deload)
         VALUES (?, ?, ?, ?)`,
        [week.weekNumber, week.blockName, week.blockType, week.isDeload ? 1 : 0],
      );
      for (const day of week.days) {
        const dayRow = await db.runAsync(
          `INSERT INTO program_days (week_id, day_number, day_name, day_type, focus, session_key)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [weekRow.lastInsertRowId, day.dayNumber, day.dayName, day.dayType, day.focus, day.sessionKey],
        );
        for (const slot of day.exercises) {
          const slotRow = await db.runAsync(
            `INSERT INTO program_exercises (
               day_id, exercise_id, "order", warmup_sets, working_sets, target_reps,
               intensity_technique, early_set_rpe, last_set_rpe, rest_seconds, notes,
               slot_key, unit, prescribed_weight, superset_group
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              dayRow.lastInsertRowId,
              idFor(slot.exercise),
              slot.order,
              slot.warmupSets,
              slot.workingSets,
              slot.targetReps,
              slot.intensityTechnique,
              slot.earlySetRpe,
              slot.lastSetRpe,
              slot.restSeconds,
              slot.notes,
              slot.slotKey,
              slot.unit,
              slot.prescribedWeight,
              slot.supersetGroup,
            ],
          );
          for (const [index, name] of slot.substitutions.entries()) {
            await db.runAsync(
              `INSERT INTO exercise_substitutions (program_exercise_id, substitution_exercise_id, priority)
               VALUES (?, ?, ?)`,
              [slotRow.lastInsertRowId, idFor(name), index + 1],
            );
          }
        }
      }
    }
  });
}
