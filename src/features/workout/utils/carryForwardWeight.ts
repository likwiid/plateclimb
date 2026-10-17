// SPDX-License-Identifier: GPL-3.0-or-later
import type { SetState } from '../types';

/**
 * After a working set is completed, copy its weight onto the later working
 * sets of the same exercise that have no weight yet (weight 0). Sets that
 * already have a planned or suggested weight are left alone.
 */
export function carryForwardWeight(sets: SetState[], completedIdx: number): SetState[] {
  const done = sets[completedIdx];
  if (!done || done.setType !== 'working' || done.weight <= 0) return sets;
  return sets.map((s, i) =>
    i > completedIdx && s.setType === 'working' && !s.completed && !s.skipped && s.weight === 0
      ? { ...s, weight: done.weight }
      : s
  );
}
