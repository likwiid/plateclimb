// SPDX-License-Identifier: GPL-3.0-or-later
import { useState, useEffect, useRef } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { triggerMedium } from '@shared/utils/haptics';
import { usePreferencesStore } from '@shared/stores/preferencesStore';

import type { WorkoutExercise } from '../types';
import { useRestTimer } from './useRestTimer';
import { useExerciseNavigation } from './useExerciseNavigation';
import { useSetActions } from './useSetActions';
import {
  loadSessionData,
  loadExtrasExercises,
} from '../services/workoutSessionLoader';

export type { AlertConfig } from '@shared/hooks/useAlertDialog';

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useWorkoutSession(sessionId: number) {
  const weightUnit = usePreferencesStore((s) => s.weightUnit);
  const defaultIncrement = usePreferencesStore((s) => s.defaultIncrement);

  const { restTimerEnd, setRestTimerEnd, restRemaining, skipRestTimer, addRestTime } = useRestTimer();

  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [showSubModal, setShowSubModal] = useState(false);
  const [substitutions, setSubstitutions] = useState<
    { exerciseId: number; exerciseName: string; priority: number }[]
  >([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [exerciseUnits, setExerciseUnits] = useState<Record<number, 'kg' | 'lb'>>({});

  const startTimeRef = useRef(Date.now());
  const dayIdRef = useRef<number>(0);

  const nav = useExerciseNavigation({ exercises });
  const {
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
  } = nav;

  const setActions = useSetActions({
    sessionId,
    exercises,
    setExercises,
    currentExIdx,
    currentSetIdx,
    currentEx,
    currentSet,
    setCurrentExIdx,
    setCurrentSetIdx,
    setExerciseKey,
    setRestTimerEnd,
    setShowSubModal,
    setSubstitutions,
    startTimeRef,
  });

  const allDone = exercises.every((ex) =>
    ex.sets.every((s) => s.completed || s.skipped)
  );
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed || s.skipped).length,
    0
  );

  // ─── Per-exercise unit helpers ──────────────────────────────────────

  function getExerciseUnit(exIdx: number): 'kg' | 'lb' {
    return exerciseUnits[exIdx] ?? weightUnit;
  }

  function toggleExerciseUnit(exIdx: number) {
    setActions.toggleExerciseUnit(exIdx, exerciseUnits, setExerciseUnits);
  }

  // ─── Load session ───────────────────────────────────────────────────

  async function loadWorkout(): Promise<WorkoutExercise[]> {
    const result = await loadSessionData(sessionId);
    if (!result) return [];

    startTimeRef.current = result.metadata.startedAt;
    dayIdRef.current = result.metadata.programDayId;

    setExercises(result.exercises);
    setCurrentExIdx(result.resumeExIdx);
    setCurrentSetIdx(result.resumeSetIdx);
    setIsLoaded(true);

    activateKeepAwakeAsync();
    return result.exercises;
  }

  // ─── Elapsed timer ──────────────────────────────────────────────────

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(
        Math.floor((Date.now() - startTimeRef.current) / 1000)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ─── Cleanup on unmount ─────────────────────────────────────────────

  useEffect(() => {
    return () => {
      deactivateKeepAwake();
    };
  }, []);

  // ─── Add extras mid-workout ─────────────────────────────────────────

  async function addExtras(category: string): Promise<WorkoutExercise[]> {
    const dayId = dayIdRef.current;
    if (!dayId) return exercises;

    const newWorkoutExercises = await loadExtrasExercises(dayId, exercises, category);
    if (newWorkoutExercises.length === 0) return exercises;

    const updated = [...exercises, ...newWorkoutExercises];
    setExercises(updated);

    const firstNewIdx = exercises.length;
    setCurrentExIdx(firstNewIdx);
    setCurrentSetIdx(0);
    setExerciseKey((k) => k + 1);
    triggerMedium();

    return updated;
  }

  return {
    // State
    exercises,
    setExercises,
    currentExIdx,
    setCurrentExIdx,
    currentSetIdx,
    setCurrentSetIdx,
    elapsedSeconds,
    restTimerEnd,
    setRestTimerEnd,
    restRemaining,
    showSubModal,
    setShowSubModal,
    substitutions,
    isLoaded,
    exerciseKey,
    alertConfig: setActions.alertConfig,
    dismissAlert: setActions.dismissAlert,

    // Derived
    currentEx,
    currentSet,
    allDone,
    totalSets,
    completedSets,

    // Preferences
    weightUnit,
    defaultIncrement,
    getExerciseUnit,
    toggleExerciseUnit,

    // Actions
    loadWorkout,
    updateSet: setActions.updateSet,
    advanceFromState: setActions.advanceFromState,
    handleCompleteSet: setActions.handleCompleteSet,
    handleSkipSet: setActions.handleSkipSet,
    finishWorkout: setActions.finishWorkout,
    handleFinish: setActions.handleFinish,
    handleSwap: setActions.handleSwap,
    handleSelectSub: setActions.handleSelectSub,
    handleSkipWarmup: setActions.handleSkipWarmup,
    handleRevertSet: setActions.handleRevertSet,
    handleUndoLastSet: setActions.handleUndoLastSet,
    handleRestartDay: setActions.handleRestartDay,
    goExercise,
    goToExercise,
    skipRestTimer,
    addRestTime,
    formatElapsedTime,
    showAlert: setActions.showAlert,
    addExtras,

    // Refs
    sessionId,
  };
}
