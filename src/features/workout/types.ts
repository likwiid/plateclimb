// SPDX-License-Identifier: GPL-3.0-or-later
import type { DayExerciseRow } from '@shared/db/repositories/programRepo';

export type SetState = {
  weight: number;
  reps: number;
  rpe: number;
  completed: boolean;
  skipped: boolean;
  setType: 'warmup' | 'working';
  /** True when the weight was filled in from the program or from history. */
  prefilled?: boolean;
};

export type LastWeekSummary = {
  weight: number;
  reps: number;
  sets: number;
};

export type WorkoutExercise = DayExerciseRow & {
  actualExerciseId: number;
  actualExerciseName: string;
  sets: SetState[];
  lastWeekSummary?: LastWeekSummary | null;
};

// ─── Constants ────────────────────────────────────────────────────────────

/** Valid RPE values from 6 to 10 in 0.5 steps */
export const RPE_VALUES = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10] as const;

/** RPE bounds */
export const RPE_MIN = 6;
export const RPE_MAX = 10;

/** Min reps allowed */
export const MIN_REPS = 1;

/** Circular rest timer visual constants */
export const TIMER_SIZE = 200;
export const TIMER_STROKE = 8;
export const TIMER_RADIUS = (TIMER_SIZE - TIMER_STROKE) / 2;
export const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS;

/** Rest timer increment when user taps "+30s" (ms) */
export const REST_TIMER_INCREMENT_MS = 30_000;

/** Default RPE when no target is specified */
export const DEFAULT_RPE = 8;

/** Default warmup RPE */
export const DEFAULT_WARMUP_RPE = 5;

/** Personal record card auto-dismiss delay (ms) */
export const PR_CARD_DISMISS_MS = 20_000;

/** Skip rest timer button min height (px) */
export const REST_SKIP_BUTTON_HEIGHT = 56;

/** Navigation button size (px) */
export const NAV_BUTTON_SIZE = 14;

/** Step button minimum dimensions */
export const STEP_BUTTON_MIN_WIDTH = 52;
export const STEP_BUTTON_MIN_HEIGHT = 56;

/** RPE chip size */
export const RPE_CHIP_SIZE = 14;

/** Exercises where weight = assistance (less weight = harder) */
const SUPPORTED_WEIGHT_PATTERNS = ['pull-up', 'pull up', 'chin-up', 'chin up'];

export function isSupportedWeight(exerciseName: string): boolean {
  const lower = exerciseName.toLowerCase();
  return SUPPORTED_WEIGHT_PATTERNS.some((p) => lower.includes(p));
}

/** Animation durations (ms) */
export const ANIM_FADE_IN = 300;
export const ANIM_PULSE_DURATION = 800;
export const ANIM_ZOOM_DURATION = 250;
