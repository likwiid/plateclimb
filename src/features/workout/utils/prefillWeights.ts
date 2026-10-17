// SPDX-License-Identifier: GPL-3.0-or-later
import type { WorkoutExercise } from '../types';
import { defaultWarmupWeight } from './warmupRamp';

/**
 * Fills the open sets of each exercise from a map of exercise id to working
 * weight. Working sets get that weight and warm-up sets get the default ramp.
 * With `onlyIfNotUserAdjusted`, a set the user already changed keeps its weight.
 * Returns the same array when nothing changed.
 */
export function applyWeightsToExercises(
  exercises: WorkoutExercise[],
  workingWeights: Map<number, number>,
  defaultIncrement: number,
  onlyIfNotUserAdjusted = false,
): WorkoutExercise[] {
  const next = [...exercises];
  let changed = false;

  for (let exIdx = 0; exIdx < next.length; exIdx++) {
    const workingWeight = workingWeights.get(next[exIdx].actualExerciseId);
    if (workingWeight === undefined) continue;

    const ex = { ...next[exIdx] };
    const sets = [...ex.sets];
    let warmupIdx = 0;
    const warmupCount = sets.filter((s) => s.setType === 'warmup').length;

    for (let i = 0; i < sets.length; i++) {
      if (sets[i].completed || sets[i].skipped) continue;
      if (onlyIfNotUserAdjusted && sets[i].weight > 0 && !sets[i].prefilled) continue;

      if (sets[i].setType === 'warmup') {
        const weight = defaultWarmupWeight(workingWeight, warmupIdx, warmupCount, defaultIncrement);
        sets[i] = { ...sets[i], weight, prefilled: true };
        warmupIdx++;
      } else {
        sets[i] = { ...sets[i], weight: workingWeight, prefilled: true };
      }
    }

    ex.sets = sets;
    next[exIdx] = ex;
    changed = true;
  }

  return changed ? next : exercises;
}

const LB_PER_KG = 2.20462;

/**
 * The program's starting weight for each exercise in the session, keyed by
 * exercise id and converted to the user's unit. A slot the user swapped for a
 * substitute has no prescribed weight, since the number belongs to the
 * original exercise. Bodyweight slots have none either.
 */
export function prescribedWeights(
  exercises: WorkoutExercise[],
  weightUnit: 'kg' | 'lb',
  increment: number,
): Map<number, number> {
  const weights = new Map<number, number>();
  for (const ex of exercises) {
    if (ex.prescribedWeight == null || ex.actualExerciseId !== ex.exerciseId) continue;
    if (weights.has(ex.actualExerciseId)) continue;
    let weight = ex.prescribedWeight;
    if (weightUnit === 'lb') {
      const step = increment > 0 ? increment : 1;
      weight = Math.round((weight * LB_PER_KG) / step) * step;
    }
    weights.set(ex.actualExerciseId, weight);
  }
  return weights;
}
