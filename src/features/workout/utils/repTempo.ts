// SPDX-License-Identifier: GPL-3.0-or-later
/**
 * Derive seconds-per-rep tempo from exercise name and equipment.
 * Uses a controlled-eccentric, explosive-concentric approach.
 */
export function getRepTempo(exerciseName: string, equipment: string): number {
  const name = exerciseName.toLowerCase();

  // Slow eccentric exercises (6s)
  if (name.includes('nordic') || name.includes('reverse nordic')) return 6;

  // Hinge / RDL movements (5s - slow eccentric stretch)
  if (name.includes('rdl') || name.includes('romanian') || name.includes('stiff leg') || name.includes('stiff-leg')) return 5;

  // Lateral / rear delt isolation (5s - prevent momentum)
  if (name.includes('lateral raise') || name.includes('rear delt') || name.includes('face pull')) return 5;

  // Machine squeeze movements (5s - hold at contraction)
  if (name.includes('leg curl') || name.includes('leg extension') || name.includes('hip abduction') || name.includes('hip adduction')) return 5;

  // Conventional deadlift (3s - starts concentric)
  if (name.includes('deadlift') && !name.includes('romanian') && !name.includes('rdl') && !name.includes('stiff')) return 3;

  // Bodyweight push / abs (3s - lighter, faster)
  if (name.includes('push-up') || name.includes('pushup')) return 3;
  if (name.includes('crunch') || name.includes('leg raise') || name.includes('candlestick') || name.includes('plank')) return 3;

  // Dips (3s)
  if (name.includes('dip')) return 3;

  // Pull-ups / chin-ups (4s)
  if (name.includes('pull-up') || name.includes('pull up') || name.includes('chin-up') || name.includes('chin up')) return 4;

  // Calf raises (4s)
  if (name.includes('calf')) return 4;

  // Equipment-based defaults
  if (equipment === 'Machine') return 5;
  if (equipment === 'Cable') return 4;
  if (equipment === 'Barbell') return 4;
  if (equipment === 'Dumbbell') return 4;
  if (equipment === 'Bodyweight') return 4;

  // Universal fallback
  return 4;
}

/** Available tempo options for manual adjustment */
export const TEMPO_OPTIONS = [2, 3, 4, 5, 6] as const;
