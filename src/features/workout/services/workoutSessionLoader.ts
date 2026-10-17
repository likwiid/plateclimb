// SPDX-License-Identifier: GPL-3.0-or-later
import {
  getExercisesForDay,
  addExtrasToDayIfNeeded,
  dayHasExtras,
} from '@shared/db/repositories/programRepo';
import {
  getLastPerformed,
  getSessionSets,
  getExerciseHistory,
} from '@shared/db/repositories/workoutRepo';
import { getDatabase } from '@shared/db/client';

import type { SetState, WorkoutExercise, LastWeekSummary } from '../types';
import { DEFAULT_RPE, DEFAULT_WARMUP_RPE } from '../types';

export interface SessionMetadata {
  programDayId: number;
  startedAt: number;
}

export interface LoadWorkoutResult {
  exercises: WorkoutExercise[];
  metadata: SessionMetadata;
  resumeExIdx: number;
  resumeSetIdx: number;
}

export async function loadSessionData(sessionId: number): Promise<LoadWorkoutResult | null> {
  const db = getDatabase();
  const session = await db.getFirstAsync<{
    program_day_id: number;
    week_number: number;
    started_at: string;
  }>(`SELECT * FROM workout_sessions WHERE id = ?`, [sessionId]);

  if (!session) return null;

  const metadata: SessionMetadata = {
    programDayId: session.program_day_id,
    startedAt: new Date(session.started_at).getTime(),
  };

  const dayExercises = await getExercisesForDay(session.program_day_id);
  const existingSets = await getSessionSets(sessionId);

  const workoutExercises: WorkoutExercise[] = [];
  for (const ex of dayExercises) {
    const totalSetCount = ex.warmupSets + ex.workingSets;
    const sets: SetState[] = [];
    const lastPerf = await getLastPerformed(ex.exerciseId);

    for (let i = 0; i < totalSetCount; i++) {
      const isWarmup = i < ex.warmupSets;
      const setNum = i + 1;

      const existing = existingSets.find(
        (s) =>
          s.programExerciseId === ex.programExerciseId &&
          s.setNumber === setNum
      );

      if (existing) {
        sets.push({
          weight: existing.weight ?? 0,
          reps: existing.reps ?? 0,
          rpe: existing.rpe ?? 0,
          completed: !existing.skipped,
          skipped: existing.skipped,
          setType: isWarmup ? 'warmup' : 'working',
        });
      } else {
        sets.push({
          weight: isWarmup ? 0 : (lastPerf?.lastWeight ?? 0),
          reps: isWarmup
            ? parseInt(ex.targetReps?.split('-')[0] ?? '10', 10)
            : (lastPerf?.lastReps ??
              parseInt(ex.targetReps?.split('-')[0] ?? '10', 10)),
          rpe: isWarmup ? DEFAULT_WARMUP_RPE : (ex.lastSetRpe ?? DEFAULT_RPE),
          completed: false,
          skipped: false,
          setType: isWarmup ? 'warmup' : 'working',
        });
      }
    }

    let lastWeekSummary: LastWeekSummary | null = null;
    try {
      const history = await getExerciseHistory(ex.exerciseId, 1, sessionId);
      const working = history.filter((h) => h.setType === 'working');
      if (working.length > 0) {
        const avgWeight = working.reduce((s, x) => s + x.weight, 0) / working.length;
        const avgReps = working.reduce((s, x) => s + x.reps, 0) / working.length;
        lastWeekSummary = {
          weight: Math.round(avgWeight * 10) / 10,
          reps: Math.round(avgReps),
          sets: working.length,
        };
      } else if (lastPerf?.lastWeight && lastPerf?.lastReps) {
        lastWeekSummary = {
          weight: lastPerf.lastWeight,
          reps: lastPerf.lastReps,
          sets: 0,
        };
      }
    } catch {}

    workoutExercises.push({
      ...ex,
      actualExerciseId: ex.exerciseId,
      actualExerciseName: ex.exerciseName,
      sets,
      lastWeekSummary,
    });
  }

  let resumeExIdx = 0;
  let resumeSetIdx = 0;
  let found = false;
  for (let e = 0; e < workoutExercises.length && !found; e++) {
    for (let s = 0; s < workoutExercises[e].sets.length; s++) {
      if (
        !workoutExercises[e].sets[s].completed &&
        !workoutExercises[e].sets[s].skipped
      ) {
        resumeExIdx = e;
        resumeSetIdx = s;
        found = true;
        break;
      }
    }
  }

  return { exercises: workoutExercises, metadata, resumeExIdx, resumeSetIdx };
}

export async function loadExtrasExercises(
  dayId: number,
  existingExercises: WorkoutExercise[],
  category: string,
): Promise<WorkoutExercise[]> {
  const has = await dayHasExtras(dayId, category);
  if (has) {
    const dayExercises = await getExercisesForDay(dayId);
    const existingIds = new Set(existingExercises.map((e) => e.programExerciseId));
    const newOnes = dayExercises.filter((e) => !existingIds.has(e.programExerciseId));
    if (newOnes.length === 0) return [];
  } else {
    await addExtrasToDayIfNeeded(dayId, category);
  }

  const dayExercises = await getExercisesForDay(dayId);
  const existingIds = new Set(existingExercises.map((e) => e.programExerciseId));
  const newOnes = dayExercises.filter((e) => !existingIds.has(e.programExerciseId));

  if (newOnes.length === 0) return [];

  const newWorkoutExercises: WorkoutExercise[] = [];
  for (const ex of newOnes) {
    const totalSetCount = ex.warmupSets + ex.workingSets;
    const sets: SetState[] = [];
    const lastPerf = await getLastPerformed(ex.exerciseId);

    for (let i = 0; i < totalSetCount; i++) {
      const isWarmup = i < ex.warmupSets;
      sets.push({
        weight: isWarmup ? 0 : (lastPerf?.lastWeight ?? 0),
        reps: isWarmup
          ? parseInt(ex.targetReps?.split('-')[0] ?? '10', 10)
          : (lastPerf?.lastReps ??
            parseInt(ex.targetReps?.split('-')[0] ?? '10', 10)),
        rpe: isWarmup ? DEFAULT_WARMUP_RPE : (ex.lastSetRpe ?? DEFAULT_RPE),
        completed: false,
        skipped: false,
        setType: isWarmup ? 'warmup' : 'working',
      });
    }

    newWorkoutExercises.push({
      ...ex,
      actualExerciseId: ex.exerciseId,
      actualExerciseName: ex.exerciseName,
      sets,
    });
  }

  return newWorkoutExercises;
}

export function findResumePosition(
  exercises: WorkoutExercise[],
): { exIdx: number; setIdx: number } {
  for (let e = 0; e < exercises.length; e++) {
    for (let s = 0; s < exercises[e].sets.length; s++) {
      if (!exercises[e].sets[s].completed && !exercises[e].sets[s].skipped) {
        return { exIdx: e, setIdx: s };
      }
    }
  }
  return { exIdx: 0, setIdx: 0 };
}
