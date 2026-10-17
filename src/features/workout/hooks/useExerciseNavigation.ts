// SPDX-License-Identifier: GPL-3.0-or-later
import { useState, useCallback } from 'react';
import { triggerLight } from '@shared/utils/haptics';

import type { WorkoutExercise } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────

interface UseExerciseNavigationParams {
  exercises: WorkoutExercise[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useExerciseNavigation({ exercises }: UseExerciseNavigationParams) {
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSetIdx, setCurrentSetIdx] = useState(0);
  const [exerciseKey, setExerciseKey] = useState(0);

  const currentEx = exercises[currentExIdx];
  const currentSet = currentEx?.sets[currentSetIdx];

  // ─── Navigate between exercises ────────────────────────────────────

  function goExercise(dir: 'prev' | 'next') {
    triggerLight();
    if (dir === 'prev' && currentExIdx > 0) {
      setCurrentExIdx(currentExIdx - 1);
      setCurrentSetIdx(0);
      setExerciseKey((k) => k + 1);
    } else if (dir === 'next' && currentExIdx < exercises.length - 1) {
      setCurrentExIdx(currentExIdx + 1);
      setCurrentSetIdx(0);
      setExerciseKey((k) => k + 1);
    }
  }

  function goToExercise(idx: number) {
    triggerLight();
    setCurrentExIdx(idx);
    setExerciseKey((k) => k + 1);
    const firstIncomplete = exercises[idx]?.sets.findIndex(
      (s) => !s.completed && !s.skipped
    );
    setCurrentSetIdx(Math.max(0, firstIncomplete ?? 0));
  }

  // ─── Format elapsed time ───────────────────────────────────────────

  const formatElapsedTime = useCallback((s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0)
      return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${m}:${String(sec).padStart(2, '0')}`;
  }, []);

  return {
    currentExIdx,
    setCurrentExIdx,
    currentSetIdx,
    setCurrentSetIdx,
    exerciseKey,
    setExerciseKey,
    currentEx,
    currentSet,
    goExercise,
    goToExercise,
    formatElapsedTime,
  };
}
