// SPDX-License-Identifier: GPL-3.0-or-later
import { useCallback, useState, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import { routes } from '@shared/constants/routes';
import {
  getExercisesForDay,
  getDayInfo,
  type DayExerciseRow,
  getExtraCategories,
  addExtrasToDayIfNeeded,
  removeExtrasFromDay,
  dayHasExtras,
} from '@shared/db/repositories/programRepo';
import {
  createSession,
  getCompletedSessionForDay,
  getIncompleteSessionForDay,
  markDayComplete,
  type SessionRow,
} from '@shared/db/repositories/workoutRepo';
import { triggerLight, triggerMedium, triggerSelection } from '@shared/utils/haptics';

export type DayInfo = {
  dayName: string;
  dayType: string;
  weekNumber: number;
  dayNumber: number;
  focus: string;
  sessionKey: string;
};

export function useDayDetail(dayId: string) {
  const id = parseInt(dayId, 10);
  const router = useRouter();

  const [exercises, setExercises] = useState<DayExerciseRow[]>([]);
  const [dayInfo, setDayInfo] = useState<DayInfo | null>(null);
  const [extrasState, setExtrasState] = useState<Record<string, boolean>>({});
  const [completedSession, setCompletedSession] = useState<SessionRow | null>(null);
  const [incompleteSession, setIncompleteSession] = useState<SessionRow | null>(null);

  const isStartingRef = useRef(false);

  const loadExercises = useCallback(async () => {
    setExercises(await getExercisesForDay(id));
  }, [id]);

  const loadExtrasState = useCallback(async () => {
    const categories = getExtraCategories();
    const state: Record<string, boolean> = {};
    for (const cat of categories) {
      state[cat.key] = await dayHasExtras(id, cat.key);
    }
    setExtrasState(state);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        loadExercises();
        setDayInfo(await getDayInfo(id));
        loadExtrasState();
        const [completed, incomplete] = await Promise.all([
          getCompletedSessionForDay(id),
          getIncompleteSessionForDay(id),
        ]);
        setCompletedSession(completed);
        setIncompleteSession(incomplete);
      }
      load();
    }, [id, loadExercises, loadExtrasState])
  );

  async function handleToggleExtra(category: string) {
    triggerSelection();
    const isActive = extrasState[category];
    if (isActive) {
      await removeExtrasFromDay(id, category);
    } else {
      await addExtrasToDayIfNeeded(id, category);
    }
    setExtrasState((prev) => ({ ...prev, [category]: !isActive }));
    loadExercises();
  }

  async function handleStartWorkout() {
    if (!dayInfo || isStartingRef.current) return;
    isStartingRef.current = true;
    triggerMedium();

    if (incompleteSession) {
      isStartingRef.current = false;
      router.push(routes.workout(incompleteSession.id));
      return;
    }

    const sessionId = await createSession(id, dayInfo.weekNumber);
    isStartingRef.current = false;
    router.push(routes.workout(sessionId));
  }

  async function handleMarkComplete() {
    if (!dayInfo) return;
    triggerMedium();
    await markDayComplete(id, dayInfo.weekNumber);
    const completed = await getCompletedSessionForDay(id);
    setCompletedSession(completed);
  }

  const handleExercisePress = useCallback(
    (exerciseId: number) => {
      triggerLight();
      router.push(routes.exercise(exerciseId));
    },
    [router]
  );

  const handleViewSummary = useCallback(() => {
    if (!completedSession) return;
    triggerLight();
    router.push(routes.workoutSummary(completedSession.id));
  }, [completedSession, router]);

  const extraCategories = getExtraCategories();

  return {
    exercises,
    dayInfo,
    extrasState,
    completedSession,
    incompleteSession,
    extraCategories,
    handleToggleExtra,
    handleStartWorkout,
    handleMarkComplete,
    handleExercisePress,
    handleViewSummary,
  };
}
