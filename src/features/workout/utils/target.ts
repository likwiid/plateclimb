// SPDX-License-Identifier: GPL-3.0-or-later
import type { ProgramUnit } from '@data/program';

const LB_PER_KG = 2.20462;

/** "8-12 reps", or "45-60 s" for a timed slot such as a carry. */
export function formatTarget(targetReps: string, unit: ProgramUnit): string {
  return unit === 'seconds' ? `${targetReps} s` : `${targetReps} reps`;
}

/**
 * The program's starting weight as a label in the user's unit: "60 kg",
 * "130 lb" or "Bodyweight". Returns null when the slot has no weight.
 */
export function formatPrescribed(
  prescribedWeight: number | null,
  unit: ProgramUnit,
  weightUnit: 'kg' | 'lb',
): string | null {
  if (unit === 'bodyweight') return 'Bodyweight';
  if (prescribedWeight == null) return null;
  const weight =
    weightUnit === 'lb' ? Math.round(prescribedWeight * LB_PER_KG) : prescribedWeight;
  return `${weight} ${weightUnit}`;
}

/**
 * The program's effort target: "RPE 10" when every set aims at the same
 * effort, "RPE 8 to 9" when the last set goes harder. RPE 10 means no reps
 * left in reserve.
 */
export function formatRpe(earlySetRpe: number | null, lastSetRpe: number | null): string | null {
  const early = earlySetRpe ?? lastSetRpe;
  const last = lastSetRpe ?? earlySetRpe;
  if (early == null || last == null) return null;
  return early === last ? `RPE ${early}` : `RPE ${early} to ${last}`;
}
