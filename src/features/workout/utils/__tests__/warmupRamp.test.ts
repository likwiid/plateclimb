// SPDX-License-Identifier: GPL-3.0-or-later
import { defaultWarmupWeight } from '../warmupRamp';

describe('defaultWarmupWeight', () => {
  it('uses half the working weight for a single warmup', () => {
    expect(defaultWarmupWeight(100, 0, 1, 2.5)).toBe(50);
  });

  it('ramps from 40% to 80% across several warmups', () => {
    expect([0, 1, 2].map((i) => defaultWarmupWeight(100, i, 3, 2.5))).toEqual([40, 60, 80]);
    expect([0, 1].map((i) => defaultWarmupWeight(82.5, i, 2, 2.5))).toEqual([32.5, 65]);
  });

  it('falls back to whole units when the increment is not set', () => {
    expect(defaultWarmupWeight(61, 0, 1, 0)).toBe(31);
  });
});
