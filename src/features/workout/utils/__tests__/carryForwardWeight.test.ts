// SPDX-License-Identifier: GPL-3.0-or-later
import { carryForwardWeight } from '../carryForwardWeight';
import type { SetState } from '../../types';

const set = (over: Partial<SetState>): SetState => ({
  weight: 0,
  reps: 5,
  rpe: 8,
  completed: false,
  skipped: false,
  setType: 'working',
  ...over,
});

describe('carryForwardWeight', () => {
  it('copies the completed weight onto later empty working sets', () => {
    const sets = [set({ weight: 60, completed: true }), set({}), set({})];
    const out = carryForwardWeight(sets, 0);
    expect(out.map((s) => s.weight)).toEqual([60, 60, 60]);
  });

  it('keeps planned weights and ignores warmups, earlier and skipped sets', () => {
    const sets = [
      set({ setType: 'warmup', weight: 0 }),
      set({ weight: 60, completed: true }),
      set({ weight: 62.5 }),
      set({ skipped: true }),
      set({}),
    ];
    const out = carryForwardWeight(sets, 1);
    expect(out.map((s) => s.weight)).toEqual([0, 60, 62.5, 0, 60]);
  });

  it('does nothing for warmup sets or a zero weight', () => {
    const warm = [set({ setType: 'warmup', weight: 20, completed: true }), set({})];
    expect(carryForwardWeight(warm, 0)).toBe(warm);
    const zero = [set({ completed: true }), set({})];
    expect(carryForwardWeight(zero, 0)).toBe(zero);
  });
});
