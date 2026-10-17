// SPDX-License-Identifier: GPL-3.0-or-later
import { foundationalFitness } from '../program';

const { weeks, exercises } = foundationalFitness;
const days = weeks.flatMap((w) => w.days);
const slots = days.flatMap((d) => d.exercises);
const catalogNames = new Set(exercises.map((e) => e.name));

describe('Foundational Fitness program data', () => {
  it('has 12 weeks of 7 days', () => {
    expect(weeks.map((w) => w.weekNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (const week of weeks) {
      expect(week.days.map((d) => d.dayNumber)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    }
  });

  it('keeps cardio, rest and week off days free of lifts', () => {
    for (const day of days.filter((d) => d.dayType === 'Rest')) {
      expect(day.exercises).toEqual([]);
      expect(day.focus.length).toBeGreaterThan(0);
    }
  });

  it('marks only the last week as the week off', () => {
    expect(weeks.filter((w) => w.isDeload).map((w) => w.weekNumber)).toEqual([12]);
    expect(weeks[11].days.flatMap((d) => d.exercises)).toEqual([]);
  });

  it('references only exercises in the bundled catalog', () => {
    for (const slot of slots) {
      expect(catalogNames.has(slot.exercise)).toBe(true);
      for (const sub of slot.substitutions) expect(catalogNames.has(sub)).toBe(true);
    }
  });

  it('prescribes a weight for loaded slots only', () => {
    for (const slot of slots) {
      if (slot.unit === 'bodyweight') expect(slot.prescribedWeight).toBeNull();
      else expect(slot.prescribedWeight).toBeGreaterThan(0);
    }
  });

  it('links every exercise to a video', () => {
    for (const exercise of exercises) {
      expect(exercise.videoUrl).toMatch(/^https:\/\/(youtu\.be|www\.youtube\.com)\//);
    }
  });

  it('uses plain punctuation in all text', () => {
    expect(JSON.stringify(foundationalFitness)).not.toMatch(/[\u2013\u2014]/);
  });
});
