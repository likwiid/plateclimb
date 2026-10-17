// SPDX-License-Identifier: GPL-3.0-or-later
import type { SetState } from '../types';

/**
 * Returns the personal record card for a completed working set that beats the
 * previous best weight, or null. A first ever set is not a record.
 */
export function checkPR(
  completedSet: SetState,
  prMaxWeight: number,
  exerciseName: string,
  weightUnit: 'kg' | 'lb',
): { title: string; message: string } | null {
  if (
    completedSet.weight > prMaxWeight &&
    completedSet.setType === 'working' &&
    prMaxWeight > 0
  ) {
    return {
      title: 'New PR!',
      message: `${completedSet.weight} ${weightUnit} on ${exerciseName}, a new personal record.`,
    };
  }
  return null;
}
