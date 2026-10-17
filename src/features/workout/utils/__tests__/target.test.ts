// SPDX-License-Identifier: GPL-3.0-or-later
import { formatPrescribed, formatRpe, formatTarget } from '../target';

describe('formatTarget', () => {
  it('labels reps and timed slots', () => {
    expect(formatTarget('8-12', 'kg')).toBe('8-12 reps');
    expect(formatTarget('5-8', 'bodyweight')).toBe('5-8 reps');
    expect(formatTarget('45-60', 'seconds')).toBe('45-60 s');
  });
});

describe('formatPrescribed', () => {
  it('shows the weight in the user unit', () => {
    expect(formatPrescribed(60, 'kg', 'kg')).toBe('60 kg');
    expect(formatPrescribed(60, 'kg', 'lb')).toBe('132 lb');
  });

  it('labels bodyweight slots and skips missing weights', () => {
    expect(formatPrescribed(null, 'bodyweight', 'kg')).toBe('Bodyweight');
    expect(formatPrescribed(null, 'kg', 'kg')).toBeNull();
  });
});

describe('formatRpe', () => {
  it('shows one value or a range', () => {
    expect(formatRpe(10, 10)).toBe('RPE 10');
    expect(formatRpe(8, 9)).toBe('RPE 8 to 9');
    expect(formatRpe(null, 9)).toBe('RPE 9');
    expect(formatRpe(null, null)).toBeNull();
  });
});
