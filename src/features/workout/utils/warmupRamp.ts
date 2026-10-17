// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Default warmup weight when nothing else supplies one: ramps from 40% to 80%
 * of the working weight across the warmup sets (50% for a single warmup),
 * rounded to the plate increment.
 */
export function defaultWarmupWeight(
  workingWeight: number,
  warmupIdx: number,
  warmupCount: number,
  increment: number,
): number {
  const fraction = warmupCount <= 1 ? 0.5 : 0.4 + (0.4 * warmupIdx) / (warmupCount - 1);
  const step = increment > 0 ? increment : 1;
  return Math.round((workingWeight * fraction) / step) * step;
}
