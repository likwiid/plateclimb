// SPDX-License-Identifier: GPL-3.0-or-later
import data from './foundationalFitness.json';

/**
 * The one program that ships with the app. The week by week data lives in
 * foundationalFitness.json, which scripts/build-program-data.mjs generates.
 */

export type ProgramUnit = 'kg' | 'bodyweight' | 'seconds';

export interface ProgramCatalogExercise {
  name: string;
  videoUrl: string | null;
  muscleGroup: string;
  equipment: string;
  notes: string | null;
}

export interface ProgramSlot {
  order: number;
  exercise: string;
  slotKey: string;
  warmupSets: number;
  workingSets: number;
  targetReps: string;
  intensityTechnique: string | null;
  earlySetRpe: number | null;
  lastSetRpe: number | null;
  restSeconds: number;
  unit: ProgramUnit;
  /** Starting weight in kg, or null when the slot is bodyweight. */
  prescribedWeight: number | null;
  supersetGroup: number | null;
  notes: string | null;
  /** Substitute exercise names, best first. */
  substitutions: string[];
}

export interface ProgramDay {
  dayNumber: number;
  dayName: string;
  dayType: string;
  focus: string;
  sessionKey: string;
  exercises: ProgramSlot[];
}

export interface ProgramWeek {
  weekNumber: number;
  blockName: string;
  blockType: string;
  isDeload: boolean;
  days: ProgramDay[];
}

export interface ProgramData {
  exercises: ProgramCatalogExercise[];
  weeks: ProgramWeek[];
}

export const PROGRAM_NAME = 'Foundational Fitness (12 weeks)';

export const PROGRAM_SUMMARY =
  'Three lifting days and three cardio days a week, following the weekly structure Andrew Huberman describes in Protocols and on the Huberman Lab podcast.';

export const PROGRAM_DISCLAIMER =
  'Not affiliated with or endorsed by Andrew Huberman or Huberman Lab.';

export const foundationalFitness = data as ProgramData;
