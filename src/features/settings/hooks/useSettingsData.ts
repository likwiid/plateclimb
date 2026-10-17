// SPDX-License-Identifier: GPL-3.0-or-later
import { useState, useEffect } from 'react';

import { useTimerStore } from '@features/workout/stores/timerStore';
import { useWorkoutStore } from '@features/workout/stores/workoutStore';
import { getExerciseCount } from '@shared/db/repositories/exerciseRepo';
import { getAllWeeks } from '@shared/db/repositories/programRepo';
import { resetAppData } from '@shared/services/appReset';
import { usePreferencesStore } from '@shared/stores/preferencesStore';
import { triggerMedium } from '@shared/utils/haptics';

export function useSettingsData() {
  const [exerciseCount, setExerciseCount] = useState(0);
  const [totalWeeks, setTotalWeeks] = useState(12);
  const [showResetAlert, setShowResetAlert] = useState(false);

  useEffect(() => {
    async function load() {
      const [count, weeksData] = await Promise.all([
        getExerciseCount(),
        getAllWeeks(),
      ]);
      setExerciseCount(count);
      if (weeksData.length > 0) {
        setTotalWeeks(weeksData.length);
      }
    }
    load();
  }, []);

  async function handleResetData() {
    triggerMedium();
    try {
      useWorkoutStore.getState().resetWorkout();
      useTimerStore.getState().resetTimer();
      usePreferencesStore.getState().setCurrentWeek(1);
      await resetAppData();
    } catch (err) {
      console.error('[Settings] Failed to reset data:', err);
    }
  }

  return {
    exerciseCount,
    totalWeeks,
    showResetAlert,
    setShowResetAlert,
    handleResetData,
  };
}
