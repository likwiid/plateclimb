// SPDX-License-Identifier: GPL-3.0-or-later
// ─── Touch ───────────────────────────────────────────────────────────────────

/** Minimum touch target size per accessibility guidelines (in px) */
export const MIN_TOUCH_SIZE = 48;

// ─── Weight ──────────────────────────────────────────────────────────────────

/** Common weight plate increments for quick adjustment */
export const WEIGHT_INCREMENTS = [1.25, 2.5, 5, 10] as const;

// ─── Timer ───────────────────────────────────────────────────────────────────

/** Default rest timer duration in seconds (2 minutes) */
export const REST_TIMER_DEFAULT = 120;

/** Quick-adjust rest timer increments in seconds */
export const REST_TIMER_ADJUSTMENTS = [15, 30, 60] as const;
