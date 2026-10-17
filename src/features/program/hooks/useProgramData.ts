// SPDX-License-Identifier: GPL-3.0-or-later
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getAllWeeks, type WeekRow } from '@shared/db/repositories/programRepo';
import { getIncompleteSession } from '@shared/db/repositories/workoutRepo';
import { usePreferencesStore } from '@shared/stores/preferencesStore';

export function useProgramData() {
  const [weeks, setWeeks] = useState<WeekRow[]>([]);
  const currentWeek = usePreferencesStore((s) => s.currentWeek);
  const setCurrentWeek = usePreferencesStore((s) => s.setCurrentWeek);
  const [incompleteSessionId, setIncompleteSessionId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadData = useCallback(async () => {
    const [weeksData, incomplete] = await Promise.all([
      getAllWeeks(),
      getIncompleteSession(),
    ]);
    setWeeks(weeksData);
    setIncompleteSessionId(incomplete?.id ?? null);
    setLoaded(true);

    // Auto-advance currentWeek to the latest week with activity
    const latestActive = weeksData
      .filter((w) => w.completedDays > 0)
      .sort((a, b) => b.weekNumber - a.weekNumber)[0];
    if (latestActive && latestActive.weekNumber !== currentWeek) {
      setCurrentWeek(latestActive.weekNumber);
    }
  }, [currentWeek, setCurrentWeek]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Group weeks into their blocks, keeping the block's full name
  const blockGroups = weeks.reduce<{ blockType: string; blockName: string; weeks: WeekRow[] }[]>(
    (acc, week) => {
      const existing = acc.find((g) => g.blockType === week.blockType);
      if (existing) {
        existing.weeks.push(week);
      } else {
        acc.push({ blockType: week.blockType, blockName: week.blockName, weeks: [week] });
      }
      return acc;
    },
    []
  );

  return {
    loaded,
    weeks,
    blockGroups,
    currentWeek,
    incompleteSessionId,
    refreshing,
    onRefresh,
  };
}
