// SPDX-License-Identifier: GPL-3.0-or-later
// ─── Route Paths ────────────────────────────────────────────────────────────

export const routes = {
  tabs: '/(tabs)' as const,
  workout: (sessionId: number) => `/workout/${sessionId}` as const,
  workoutSummary: (sessionId: number) => `/workout/summary/${sessionId}` as const,
  exercise: (exerciseId: number) => `/exercise/${exerciseId}` as const,
  programDay: (dayId: number) => `/program/day/${dayId}` as const,
  programWeek: (weekNumber: number) => `/program/week/${weekNumber}` as const,
  settings: '/(tabs)/settings' as const,
} as const;
