// SPDX-License-Identifier: GPL-3.0-or-later
import type { SetState, WorkoutExercise } from '../../types';
import { applyWeightsToExercises, prescribedWeights } from '../prefillWeights';

function set(setType: SetState['setType'], extra: Partial<SetState> = {}): SetState {
  return { weight: 0, reps: 5, rpe: 8, completed: false, skipped: false, setType, ...extra };
}

function exercise(id: number, sets: SetState[]): WorkoutExercise {
  return { actualExerciseId: id, actualExerciseName: `Exercise ${id}`, sets } as WorkoutExercise;
}

describe('applyWeightsToExercises', () => {
  it('fills working sets and ramps the warm-ups', () => {
    const exercises = [exercise(1, [set('warmup'), set('warmup'), set('working'), set('working')])];
    const [ex] = applyWeightsToExercises(exercises, new Map([[1, 80]]), 2.5);
    expect(ex.sets.map((s) => s.weight)).toEqual([32.5, 65, 80, 80]);
    expect(ex.sets.every((s) => s.prefilled)).toBe(true);
  });

  it('returns the same array when no exercise has a weight', () => {
    const exercises = [exercise(1, [set('working')])];
    expect(applyWeightsToExercises(exercises, new Map([[2, 50]]), 2.5)).toBe(exercises);
  });

  it('leaves completed and skipped sets alone', () => {
    const exercises = [
      exercise(1, [set('working', { weight: 70, completed: true }), set('working', { skipped: true }), set('working')]),
    ];
    const [ex] = applyWeightsToExercises(exercises, new Map([[1, 72.5]]), 2.5);
    expect(ex.sets.map((s) => s.weight)).toEqual([70, 0, 72.5]);
  });

  it('keeps weights the user typed when asked to fill missing only', () => {
    const exercises = [
      exercise(1, [set('working', { weight: 60 }), set('working', { weight: 75, prefilled: true }), set('working')]),
    ];
    const [ex] = applyWeightsToExercises(exercises, new Map([[1, 80]]), 2.5, true);
    expect(ex.sets.map((s) => s.weight)).toEqual([60, 80, 80]);
  });
});

describe('prescribedWeights', () => {
  function slot(id: number, prescribedWeight: number | null, actualId = id): WorkoutExercise {
    return { exerciseId: id, actualExerciseId: actualId, prescribedWeight, sets: [] } as unknown as WorkoutExercise;
  }

  it('maps each exercise to its prescribed weight in kg', () => {
    expect(prescribedWeights([slot(1, 60), slot(2, 22.5)], 'kg', 2.5)).toEqual(
      new Map([[1, 60], [2, 22.5]]),
    );
  });

  it('converts to pounds and rounds to the increment', () => {
    expect(prescribedWeights([slot(1, 60)], 'lb', 5)).toEqual(new Map([[1, 130]]));
  });

  it('skips bodyweight slots and swapped exercises', () => {
    expect(prescribedWeights([slot(1, null), slot(2, 40, 7)], 'kg', 2.5).size).toBe(0);
  });
});
