// SPDX-License-Identifier: GPL-3.0-or-later
import { useState, useEffect, useMemo } from 'react';

import { getSessionSummary, type SessionSummary } from '@shared/db/repositories/statsRepo';
import { usePreferencesStore } from '@shared/stores/preferencesStore';
import { colors } from '@shared/theme';
import { triggerWorkoutDone } from '@shared/utils';

const CONFETTI_COLORS = [
  colors.indigo,
  colors.indigoLight,
  colors.success,
  colors.warning,
  colors.error,
];

export const EXERCISE_COLORS = [
  colors.indigo, colors.violet, colors.info, colors.success,
  colors.teal, colors.warning, colors.error, colors.pink,
];

export function useWorkoutSummary(sessionId: number) {
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const weightUnit = usePreferencesStore((s) => s.weightUnit);

  useEffect(() => {
    async function load() {
      setSummary(await getSessionSummary(sessionId));
      triggerWorkoutDone();
    }
    load();
  }, [sessionId]);

  const confettiDots = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    delay: 400 + i * 80,
    x: 30 + Math.random() * 300,
    y: 10 + Math.random() * 60,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  })), []);

  return {
    summary,
    weightUnit,
    confettiDots,
  };
}
