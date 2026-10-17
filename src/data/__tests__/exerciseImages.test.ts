// SPDX-License-Identifier: GPL-3.0-or-later
import { getExerciseImageUrl, getExerciseImageUrlByName } from '../exerciseImages';
import { foundationalFitness } from '../program';

const BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

describe('exercise images', () => {
  it('resolves a free-exercise-db id', () => {
    expect(getExerciseImageUrl('Barbell_Squat')).toBe(`${BASE}/Barbell_Squat/0.jpg`);
  });
  it('resolves program names through aliases', () => {
    expect(getExerciseImageUrlByName('Pec Deck')).toBe(`${BASE}/Butterfly/0.jpg`);
    expect(getExerciseImageUrlByName('Paused Barbell RDL')).toBe(`${BASE}/Romanian_Deadlift/0.jpg`);
  });
  it('resolves exact free-exercise-db names case insensitively', () => {
    expect(getExerciseImageUrlByName('hack squat')).toBe(`${BASE}/Hack_Squat/0.jpg`);
  });
  it('finds a photo for most program exercises', () => {
    const names = foundationalFitness.exercises.map((e) => e.name);
    const withPhoto = names.filter((name) => getExerciseImageUrlByName(name) !== null);
    expect(withPhoto.length / names.length).toBeGreaterThan(0.8);
  });
  it('returns null for unknown exercises so the local placeholder is used', () => {
    expect(getExerciseImageUrlByName('Made Up Lift')).toBeNull();
    expect(getExerciseImageUrl('Made_Up_Lift')).toBeNull();
  });
});
