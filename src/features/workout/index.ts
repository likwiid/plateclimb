// SPDX-License-Identifier: GPL-3.0-or-later
// Workout feature barrel exports

// Types
export type { SetState, WorkoutExercise } from './types';
export {
  RPE_VALUES,
  RPE_MIN,
  RPE_MAX,
  MIN_REPS,
  TIMER_SIZE,
  TIMER_STROKE,
  TIMER_RADIUS,
  TIMER_CIRCUMFERENCE,
  REST_TIMER_INCREMENT_MS,
  DEFAULT_RPE,
  DEFAULT_WARMUP_RPE,
  ANIM_FADE_IN,
  ANIM_PULSE_DURATION,
  isSupportedWeight,
} from './types';

// Components
export { PRCard } from './components/PRCard';
export { AnimatedStatCard } from './components/AnimatedStatCard';
export { ConfettiDot } from './components/ConfettiDot';
export { ExerciseCard } from './components/ExerciseCard';
export { SetRow } from './components/SetRow';
export { ExerciseHeader } from './components/ExerciseHeader';
export { RestTimer } from './components/RestTimer';
export { WorkoutTopBar } from './components/WorkoutTopBar';
export { ExerciseNavigator } from './components/ExerciseNavigator';
export { SetInputControls } from './components/SetInputControls';
export { SubstitutionModal } from './components/SubstitutionModal';
export { DayDetailScreen } from './components/DayDetailScreen';
export { WorkoutSummaryScreen } from './components/WorkoutSummaryScreen';
export { StepButton } from './components/StepButton';
export { WeightInput } from './components/WeightInput';
export { RepCounter } from './components/RepCounter';
export { RepInput } from './components/RepInput';

// Hooks
export { useActiveWorkout } from './hooks/useActiveWorkout';
export { useDayDetail } from './hooks/useDayDetail';
export type { DayInfo } from './hooks/useDayDetail';
export { useWorkoutSession } from './hooks/useWorkoutSession';
export { useWorkoutPrefill } from './hooks/useWorkoutPrefill';
export { useWorkoutSummary, EXERCISE_COLORS } from './hooks/useWorkoutSummary';
export { useRestTimer } from './hooks/useRestTimer';
export { useExerciseNavigation } from './hooks/useExerciseNavigation';
export { useSetActions } from './hooks/useSetActions';

// Stores
export { useWorkoutStore } from './stores/workoutStore';
export { useTimerStore } from './stores/timerStore';
