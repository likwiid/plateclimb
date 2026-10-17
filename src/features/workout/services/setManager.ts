// SPDX-License-Identifier: GPL-3.0-or-later
import {
  saveSet,
  skipSet,
  revertSet as revertSetDb,
  restartSession as restartSessionDb,
  completeSession,
  getExerciseHistory,
} from '@shared/db/repositories/workoutRepo';

import type { SetState, WorkoutExercise } from '../types';
import { carryForwardWeight } from '../utils/carryForwardWeight';

export type CompleteSetResult = {
  exercise: WorkoutExercise;
  set: SetState;
  prMaxWeight: number;
};

export function findNextIncompleteSet(
  exercises: WorkoutExercise[],
  exIdx: number,
  setIdx: number,
): { exIdx: number; setIdx: number } | null {
  const nextSetInEx = exercises[exIdx].sets.findIndex(
    (s, i) => i > setIdx && !s.completed && !s.skipped
  );
  if (nextSetInEx >= 0) {
    return { exIdx, setIdx: nextSetInEx };
  }
  for (let e = exIdx + 1; e < exercises.length; e++) {
    const firstIncomplete = exercises[e].sets.findIndex(
      (s) => !s.completed && !s.skipped
    );
    if (firstIncomplete >= 0) {
      return { exIdx: e, setIdx: firstIncomplete };
    }
  }
  return null;
}

export async function persistCompletedSet(
  sessionId: number,
  programExerciseId: number,
  actualExerciseId: number,
  setNumber: number,
  setType: 'warmup' | 'working',
  weight: number,
  reps: number,
  rpe: number,
): Promise<void> {
  await saveSet(
    sessionId,
    programExerciseId,
    actualExerciseId,
    setNumber,
    setType,
    weight,
    reps,
    rpe,
  );
}

export async function getPrMaxWeight(
  exerciseId: number,
): Promise<number> {
  try {
    const history = await getExerciseHistory(exerciseId);
    return Math.max(0, ...history.filter((h) => h.setType === 'working').map((h) => h.weight));
  } catch {
    return 0;
  }
}

export async function persistSkippedSet(
  sessionId: number,
  programExerciseId: number,
  actualExerciseId: number,
  setNumber: number,
  setType: 'warmup' | 'working',
): Promise<void> {
  await skipSet(
    sessionId,
    programExerciseId,
    actualExerciseId,
    setNumber,
    setType,
  );
}

export async function persistSkippedWarmups(
  sessionId: number,
  exercise: WorkoutExercise,
): Promise<{ idx: number }[]> {
  const warmupSets = exercise.sets
    .map((s, i) => ({ ...s, idx: i }))
    .filter((s) => s.setType === 'warmup' && !s.completed && !s.skipped);

  for (const ws of warmupSets) {
    await skipSet(
      sessionId,
      exercise.programExerciseId,
      exercise.actualExerciseId,
      ws.idx + 1,
      'warmup',
    );
  }

  return warmupSets.map((ws) => ({ idx: ws.idx }));
}

export async function persistRevertSet(
  sessionId: number,
  programExerciseId: number,
  setNumber: number,
): Promise<void> {
  await revertSetDb(sessionId, programExerciseId, setNumber);
}

export async function persistRestartSession(sessionId: number): Promise<void> {
  await restartSessionDb(sessionId);
}

export async function finishSession(sessionId: number): Promise<void> {
  await completeSession(sessionId);
}

export function markSetCompleted(
  exercises: WorkoutExercise[],
  exIdx: number,
  setIdx: number,
): WorkoutExercise[] {
  const next = [...exercises];
  const ex = { ...next[exIdx] };
  const sets = [...ex.sets];
  sets[setIdx] = { ...sets[setIdx], completed: true };
  ex.sets = carryForwardWeight(sets, setIdx);
  next[exIdx] = ex;
  return next;
}

export function markSetSkipped(
  exercises: WorkoutExercise[],
  exIdx: number,
  setIdx: number,
): WorkoutExercise[] {
  const next = [...exercises];
  const ex = { ...next[exIdx] };
  const sets = [...ex.sets];
  sets[setIdx] = { ...sets[setIdx], skipped: true };
  ex.sets = sets;
  next[exIdx] = ex;
  return next;
}

export function markWarmupsSkipped(
  exercises: WorkoutExercise[],
  exIdx: number,
  warmupIndices: { idx: number }[],
): WorkoutExercise[] {
  const next = [...exercises];
  const ex = { ...next[exIdx] };
  const sets = [...ex.sets];
  for (const ws of warmupIndices) {
    sets[ws.idx] = { ...sets[ws.idx], skipped: true };
  }
  ex.sets = sets;
  next[exIdx] = ex;
  return next;
}

export function markSetReverted(
  exercises: WorkoutExercise[],
  exIdx: number,
  setIdx: number,
): WorkoutExercise[] {
  const next = [...exercises];
  const updatedEx = { ...next[exIdx] };
  const sets = [...updatedEx.sets];
  sets[setIdx] = { ...sets[setIdx], completed: false, skipped: false };
  updatedEx.sets = sets;
  next[exIdx] = updatedEx;
  return next;
}

export function markAllSetsReset(exercises: WorkoutExercise[]): WorkoutExercise[] {
  return exercises.map((ex) => ({
    ...ex,
    sets: ex.sets.map((s) => ({ ...s, completed: false, skipped: false })),
  }));
}

export function convertWeight(
  weight: number,
  fromUnit: 'kg' | 'lb',
): number {
  return fromUnit === 'kg'
    ? Math.round(weight * 2.20462)
    : Math.round(weight / 2.20462);
}
