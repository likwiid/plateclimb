// SPDX-License-Identifier: GPL-3.0-or-later
import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { BackHandler } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { useWorkoutSession } from './useWorkoutSession';
import { useWorkoutPrefill } from './useWorkoutPrefill';
import { ANIM_PULSE_DURATION, PR_CARD_DISMISS_MS } from '../types';
import type { PRCardData } from '../components/PRCard';
import { checkPR } from '../utils/personalRecord';

import { routes } from '@shared/constants';
import { usePreferencesStore } from '@shared/stores/preferencesStore';

export function useActiveWorkout(sessionId: number) {
  const router = useRouter();

  const session = useWorkoutSession(sessionId);
  const { setExercises, restTimerEnd, currentEx, restRemaining, handleCompleteSet } = session;
  const weightUnit = usePreferencesStore((s) => s.weightUnit);

  const { loadPrefillWeights } = useWorkoutPrefill({ setExercises });

  // ─── Load session data ────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      const loadedExercises = await session.loadWorkout();
      if (loadedExercises.length > 0) {
        const isResume = loadedExercises.some((ex) =>
          ex.sets.some((s) => s.completed || s.skipped)
        );
        loadPrefillWeights(loadedExercises, isResume);
      }
    })();
  }, [sessionId]);

  // ─── Personal record card ─────────────────────────────────────────────

  const [prCard, setPrCard] = useState<PRCardData | null>(null);

  useEffect(() => {
    if (!prCard) return;
    const timer = setTimeout(() => setPrCard(null), PR_CARD_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [prCard]);

  // ─── Prevent accidental back navigation ─────────────────────────────

  const handleBackPress = useCallback(() => {
    session.showAlert(
      'Leave Workout?',
      'Your progress is saved. You can resume this workout later.',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
    return true;
  }, [session, router]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => sub.remove();
  }, [handleBackPress]);

  // ─── Animations ───────────────────────────────────────────────────────

  const lastCompletedSetIdx = useRef<number | null>(null);
  const setCardScale = useSharedValue(1);
  const setCardPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: setCardScale.value }],
  }));

  const restPulse = useSharedValue(1);
  const restPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: restPulse.value }],
    opacity: 0.7 + 0.3 * restPulse.value,
  }));

  useEffect(() => {
    if (restTimerEnd === null) {
      restPulse.value = 1;
    } else {
      restPulse.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: ANIM_PULSE_DURATION }),
          withTiming(1, { duration: ANIM_PULSE_DURATION })
        ),
        -1,
        true
      );
    }
  }, [restTimerEnd]);

  // ─── Complete set with animation + PR check ───────────────────────────

  async function onCompleteSet() {
    lastCompletedSetIdx.current = session.currentSetIdx;
    setCardScale.value = withSpring(1.02, { damping: 8, stiffness: 400 }, () => {
      setCardScale.value = withSpring(1, { damping: 12, stiffness: 200 });
    });

    const result = await handleCompleteSet();
    if (result) {
      const pr = checkPR(result.set, result.prMaxWeight, result.exercise.actualExerciseName, weightUnit);
      if (pr) setPrCard({ id: `pr-${Date.now()}`, ...pr });
    }
  }

  // ─── Finish handler with navigation ──────────────────────────────────

  function onFinish() {
    session.handleFinish(async () => {
      await session.finishWorkout();
      router.replace(routes.workoutSummary(sessionId));
    });
  }

  // ─── Timer progress ──────────────────────────────────────────────────

  const timerProgress = useMemo(() => {
    if (!currentEx?.restSeconds || restRemaining <= 0) return 0;
    return (currentEx.restSeconds - restRemaining) / currentEx.restSeconds;
  }, [currentEx?.restSeconds, restRemaining]);

  return {
    session,
    prCard,
    dismissPrCard: () => setPrCard(null),
    lastCompletedSetIdx,
    setCardPulseStyle,
    restPulseStyle,
    timerProgress,
    onCompleteSet,
    onFinish,
  };
}
