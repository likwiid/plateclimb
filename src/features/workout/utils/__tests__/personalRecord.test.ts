// SPDX-License-Identifier: GPL-3.0-or-later
import type { SetState } from '../../types';
import { checkPR } from '../personalRecord';

const working: SetState = { weight: 85, reps: 5, rpe: 8, completed: true, skipped: false, setType: 'working' };

describe('checkPR', () => {
  it('flags a working set heavier than the previous best', () => {
    expect(checkPR(working, 82.5, 'Barbell Back Squat', 'kg')).toEqual({
      title: 'New PR!',
      message: '85 kg on Barbell Back Squat, a new personal record.',
    });
  });

  it('ignores warm-ups, equal weights and first ever sets', () => {
    expect(checkPR({ ...working, setType: 'warmup' }, 50, 'Squat', 'kg')).toBeNull();
    expect(checkPR(working, 85, 'Squat', 'kg')).toBeNull();
    expect(checkPR(working, 0, 'Squat', 'kg')).toBeNull();
  });
});
