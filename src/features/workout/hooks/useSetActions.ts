// SPDX-License-Identifier: GPL-3.0-or-later
import {
  triggerSetComplete,
  triggerMedium,
  triggerHeavy,
  triggerWorkoutDone,
} from '@shared/utils/haptics';
import {
  getExerciseHistory,
  getLastPerformed,
} from '@shared/db/repositories/workoutRepo';
import { getSubstitutionsForExercise } from '@shared/db/repositories/programRepo';
import {
  showRestCountdownNotification,
  scheduleRestDoneNotification,
} from '@shared/utils/restNotification';
import {
  playSetComplete,
  playWorkoutDone,
} from '@shared/utils/sound';
import { usePreferencesStore } from '@shared/stores/preferencesStore';
import { useAlertDialog } from '@shared/hooks/useAlertDialog';

import type { SetState, WorkoutExercise } from '../types';
import {
  findNextIncompleteSet,
  persistCompletedSet,
  getPrMaxWeight,
  persistSkippedSet,
  persistSkippedWarmups,
  persistRevertSet,
  persistRestartSession,
  finishSession,
  markSetCompleted,
  markSetSkipped,
  markWarmupsSkipped,
  markSetReverted,
  markAllSetsReset,
  convertWeight,
  type CompleteSetResult,
} from '../services/setManager';

export type { AlertConfig } from '@shared/hooks/useAlertDialog';

// ─── Types ────────────────────────────────────────────────────────────────

interface UseSetActionsParams {
  sessionId: number;
  exercises: WorkoutExercise[];
  setExercises: React.Dispatch<React.SetStateAction<WorkoutExercise[]>>;
  currentExIdx: number;
  currentSetIdx: number;
  currentEx: WorkoutExercise | undefined;
  currentSet: SetState | undefined;
  setCurrentExIdx: React.Dispatch<React.SetStateAction<number>>;
  setCurrentSetIdx: React.Dispatch<React.SetStateAction<number>>;
  setExerciseKey: React.Dispatch<React.SetStateAction<number>>;
  setRestTimerEnd: React.Dispatch<React.SetStateAction<number | null>>;
  setShowSubModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSubstitutions: React.Dispatch<React.SetStateAction<{ exerciseId: number; exerciseName: string; priority: number }[]>>;
  startTimeRef: React.MutableRefObject<number>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useSetActions({
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
}: UseSetActionsParams) {
  const weightUnit = usePreferencesStore((s) => s.weightUnit);
  const { alertConfig, showAlert, dismissAlert } = useAlertDialog();

  // ─── Advance logic ──────────────────────────────────────────────────

  function advanceFromState(updatedExercises: WorkoutExercise[], exIdx: number, setIdx: number) {
    const next = findNextIncompleteSet(updatedExercises, exIdx, setIdx);
    if (!next) return;
    if (next.exIdx !== exIdx) {
      setCurrentExIdx(next.exIdx);
      setExerciseKey((k) => k + 1);
    }
    setCurrentSetIdx(next.setIdx);
  }

  // ─── Set mutation ───────────────────────────────────────────────────

  function updateSet(field: keyof SetState, value: number) {
    setExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[currentExIdx] };
      const sets = [...ex.sets];
      sets[currentSetIdx] = {
        ...sets[currentSetIdx],
        [field]: value,
        prefilled: field === 'weight' ? false : sets[currentSetIdx].prefilled,
      };
      ex.sets = sets;
      next[currentExIdx] = ex;
      return next;
    });
  }

  // ─── Complete set ───────────────────────────────────────────────────

  async function handleCompleteSet(): Promise<CompleteSetResult | null> {
    if (!currentEx || !currentSet) return null;
    triggerSetComplete();
    playSetComplete();

    let prMaxWeight = 0;
    if (currentSet.setType === 'working') {
      prMaxWeight = await getPrMaxWeight(currentEx.actualExerciseId);
    }

    await persistCompletedSet(
      sessionId,
      currentEx.programExerciseId,
      currentEx.actualExerciseId,
      currentSetIdx + 1,
      currentSet.setType,
      currentSet.weight,
      currentSet.reps,
      currentSet.rpe
    );

    const hasMoreSetsInExercise = currentEx.sets.some(
      (s, i) => i > currentSetIdx && !s.completed && !s.skipped
    );
    if (hasMoreSetsInExercise && currentEx.restSeconds > 0) {
      setRestTimerEnd(Date.now() + currentEx.restSeconds * 1000);
      showRestCountdownNotification(currentEx.restSeconds);
      scheduleRestDoneNotification(currentEx.restSeconds);
    }

    const capturedExIdx = currentExIdx;
    const capturedSetIdx = currentSetIdx;
    const capturedEx = currentEx;
    const capturedSet = currentSet;

    setExercises((prev) => {
      const next = markSetCompleted(prev, capturedExIdx, capturedSetIdx);
      advanceFromState(next, capturedExIdx, capturedSetIdx);
      return next;
    });

    return {
      exercise: capturedEx,
      set: capturedSet,
      prMaxWeight,
    };
  }

  // ─── Skip set ──────────────────────────────────────────────────────

  async function handleSkipSet() {
    if (!currentEx) return;
    triggerMedium();
    await persistSkippedSet(
      sessionId,
      currentEx.programExerciseId,
      currentEx.actualExerciseId,
      currentSetIdx + 1,
      currentSet?.setType ?? 'working'
    );

    setExercises((prev) => {
      const next = markSetSkipped(prev, currentExIdx, currentSetIdx);
      advanceFromState(next, currentExIdx, currentSetIdx);
      return next;
    });
  }

  // ─── Skip warmup ───────────────────────────────────────────────────

  async function handleSkipWarmup() {
    if (!currentEx) return;
    triggerMedium();
    const skippedIndices = await persistSkippedWarmups(sessionId, currentEx);

    setExercises((prev) => {
      const next = markWarmupsSkipped(prev, currentExIdx, skippedIndices);
      const firstWorking = next[currentExIdx].sets.findIndex(
        (s) => s.setType === 'working' && !s.completed && !s.skipped
      );
      if (firstWorking >= 0) {
        setCurrentSetIdx(firstWorking);
      }
      return next;
    });
  }

  // ─── Revert set ─────────────────────────────────────────────────────

  async function handleRevertSet(exIdx: number, setIdx: number) {
    const ex = exercises[exIdx];
    if (!ex) return;

    const doRevert = async () => {
      triggerMedium();
      await persistRevertSet(sessionId, ex.programExerciseId, setIdx + 1);
      setExercises((prev) => markSetReverted(prev, exIdx, setIdx));
      setCurrentExIdx(exIdx);
      setCurrentSetIdx(setIdx);
    };

    showAlert('Revert Set', 'Revert this set to uncompleted?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Revert', style: 'destructive', onPress: doRevert },
    ]);
  }

  // ─── Undo last set ─────────────────────────────────────────────────

  async function handleUndoLastSet() {
    for (let e = exercises.length - 1; e >= 0; e--) {
      for (let s = exercises[e].sets.length - 1; s >= 0; s--) {
        if (exercises[e].sets[s].completed) {
          await handleRevertSet(e, s);
          return;
        }
      }
    }
  }

  // ─── Finish ─────────────────────────────────────────────────────────

  async function finishWorkout() {
    triggerWorkoutDone();
    playWorkoutDone();
    await finishSession(sessionId);
  }

  function handleFinish(onConfirm: () => void) {
    showAlert('Finish Workout', 'Are you sure you want to finish?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Finish', style: 'default', onPress: onConfirm },
    ]);
  }

  // ─── Swap ───────────────────────────────────────────────────────────

  async function handleSwap() {
    if (!currentEx) return;
    triggerHeavy();
    const subs = await getSubstitutionsForExercise(currentEx.programExerciseId);

    const fullList = [...subs];
    const isSwapped = currentEx.actualExerciseId !== currentEx.exerciseId;
    if (isSwapped) {
      fullList.unshift({
        exerciseId: currentEx.exerciseId,
        exerciseName: currentEx.exerciseName,
        priority: 0,
      });
    }
    const filtered = fullList.filter((s) => s.exerciseId !== currentEx.actualExerciseId);

    setSubstitutions(filtered);
    setShowSubModal(true);
  }

  async function handleSelectSub(sub: { exerciseId: number; exerciseName: string }): Promise<WorkoutExercise[]> {
    const next = [...exercises];
    const ex = { ...next[currentExIdx] };
    ex.actualExerciseId = sub.exerciseId;
    ex.actualExerciseName = sub.exerciseName;

    try {
      const history = await getExerciseHistory(sub.exerciseId, 1, sessionId);
      const working = history.filter((h) => h.setType === 'working');
      if (working.length > 0) {
        const avgWeight = working.reduce((s, x) => s + x.weight, 0) / working.length;
        const avgReps = working.reduce((s, x) => s + x.reps, 0) / working.length;
        ex.lastWeekSummary = {
          weight: Math.round(avgWeight * 10) / 10,
          reps: Math.round(avgReps),
          sets: working.length,
        };
      } else {
        const lastPerf = await getLastPerformed(sub.exerciseId);
        if (lastPerf?.lastWeight && lastPerf?.lastReps) {
          ex.lastWeekSummary = {
            weight: lastPerf.lastWeight,
            reps: lastPerf.lastReps,
            sets: 0,
          };
        } else {
          ex.lastWeekSummary = null;
        }
      }
    } catch {
      ex.lastWeekSummary = null;
    }

    next[currentExIdx] = ex;
    setExercises(next);
    setShowSubModal(false);
    return next;
  }

  // ─── Restart day ────────────────────────────────────────────────────

  async function handleRestartDay() {
    const doRestart = async () => {
      triggerHeavy();
      await persistRestartSession(sessionId);
      setExercises((prev) => markAllSetsReset(prev));
      setCurrentExIdx(0);
      setCurrentSetIdx(0);
      setExerciseKey((k) => k + 1);
      startTimeRef.current = Date.now();
      setRestTimerEnd(null);
    };

    showAlert('Restart Day', 'This will delete all logged sets.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Restart', style: 'destructive', onPress: doRestart },
    ]);
  }

  // ─── Per-exercise unit toggle ──────────────────────────────────────

  function toggleExerciseUnit(
    exIdx: number,
    exerciseUnits: Record<number, 'kg' | 'lb'>,
    setExerciseUnits: React.Dispatch<React.SetStateAction<Record<number, 'kg' | 'lb'>>>,
  ) {
    const currentUnit = exerciseUnits[exIdx] ?? weightUnit;
    const newUnit = currentUnit === 'kg' ? 'lb' : 'kg';

    setExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[exIdx] };
      const sets = [...ex.sets];
      for (let i = 0; i < sets.length; i++) {
        if (!sets[i].completed && !sets[i].skipped) {
          sets[i] = { ...sets[i], weight: convertWeight(sets[i].weight, currentUnit) };
        }
      }
      ex.sets = sets;
      next[exIdx] = ex;
      return next;
    });

    setExerciseUnits((prev) => ({ ...prev, [exIdx]: newUnit }));
  }

  return {
    alertConfig,
    showAlert,
    dismissAlert,
    advanceFromState,
    updateSet,
    handleCompleteSet,
    handleSkipSet,
    handleSkipWarmup,
    handleRevertSet,
    handleUndoLastSet,
    finishWorkout,
    handleFinish,
    handleSwap,
    handleSelectSub,
    handleRestartDay,
    toggleExerciseUnit,
  };
}
