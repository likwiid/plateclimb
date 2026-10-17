// SPDX-License-Identifier: GPL-3.0-or-later
/**
 * Format a duration in seconds into a human-readable string.
 * - Under 1 minute: "0:45"
 * - Under 1 hour: "45:30"
 * - 1 hour or more: "1:30:05"
 */
export function formatDuration(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format a weight value with its unit.
 * Returns "100 kg" or "225 lb".
 */
export function formatWeight(weight: number, unit: 'kg' | 'lb'): string {
  const display = Number.isInteger(weight) ? weight.toString() : weight.toFixed(1);
  return `${display} ${unit}`;
}

/**
 * Format an RPE value to always show one decimal place.
 * Returns "8.0" or "10.0".
 */
export function formatRpe(rpe: number): string {
  return rpe.toFixed(1);
}

/**
 * Format an ISO date string into a readable date.
 * Returns "Feb 16, 2026".
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format an ISO date string into a readable time.
 * Returns "3:45 PM".
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format duration as short human string: "1h 30m" or "45m".
 */
export function formatDurationShort(seconds: number | null): string {
  if (seconds == null) return "--";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/**
 * Capitalize the first letter of a string.
 * Returns "Beginner" from "beginner".
 */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

import { colors } from '@shared/theme';

/**
 * Get RPE color: green (easy), yellow (moderate), orange (hard), red (max).
 */
export function getRpeColor(rpe: number | null): string {
  if (rpe == null) return colors.text.muted;
  if (rpe <= 7) return colors.success;
  if (rpe <= 8) return colors.warning;
  if (rpe <= 9) return colors.orange;
  return colors.error;
}

/**
 * Consistent day-type color mapping across all screens.
 * Keys are lowercase substrings matched against day types.
 */
export const DAY_TYPE_COLORS: Record<string, string> = {
  push: colors.indigo,
  pull: colors.violet,
  legs: colors.success,
  upper: colors.info,
  lower: colors.teal,
  full: colors.warning,
  specialty: colors.purple,
};

export function getDayTypeColor(dayType: string): string {
  const key = dayType.toLowerCase();
  for (const [k, v] of Object.entries(DAY_TYPE_COLORS)) {
    if (key.includes(k)) return v;
  }
  return colors.indigo;
}
