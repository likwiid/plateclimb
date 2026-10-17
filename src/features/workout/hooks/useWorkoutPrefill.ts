// SPDX-License-Identifier: GPL-3.0-or-later
import { getLastPerformedBatch } from '@shared/db/repositories/workoutRepo';
import { usePreferencesStore } from '@shared/stores/preferencesStore';

import type { WorkoutExercise } from '../types';
import { applyWeightsToExercises, prescribedWeights } from '../utils/prefillWeights';

interface UseWorkoutPrefillParams {
  setExercises: React.Dispatch<React.SetStateAction<WorkoutExercise[]>>;
}

/**
 * Pre-fills set weights with the program's prescribed weight, then with the
 * weight last performed for that exercise, which wins once there is history.
 * Nothing progresses automatically: the user raises the weight when ready.
 */
export function useWorkoutPrefill({ setExercises }: UseWorkoutPrefillParams) {
  const defaultIncrement = usePreferencesStore((s) => s.defaultIncrement);
  const weightUnit = usePreferencesStore((s) => s.weightUnit);

  async function loadPrefillWeights(workoutExercises: WorkoutExercise[], keepUserWeights = false) {
    try {
      const programWeights = prescribedWeights(workoutExercises, weightUnit, defaultIncrement);
      if (programWeights.size > 0) {
        setExercises((prev) =>
          applyWeightsToExercises(prev, programWeights, defaultIncrement, keepUserWeights)
        );
      }
      const exerciseIds = [...new Set(workoutExercises.map((e) => e.actualExerciseId))];
      const historyWeights = await getLastPerformedBatch(exerciseIds);
      if (historyWeights.size > 0) {
        setExercises((prev) =>
          applyWeightsToExercises(prev, historyWeights, defaultIncrement, keepUserWeights)
        );
      }
    } catch {
      // Pre-fill is a convenience; the user can always type a weight.
    }
  }

  return { loadPrefillWeights };
}
