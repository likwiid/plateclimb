// SPDX-License-Identifier: GPL-3.0-or-later
import { create } from 'zustand';
import type { SetType } from '@shared/types';

interface WorkoutExercise {
  programExerciseId: number;
  exerciseId: number;
  exerciseName: string;
  order: number;
  warmupSets: number;
  workingSets: number;
  targetReps: string;
  intensityTechnique: string | null;
  earlySetRpe: number | null;
  lastSetRpe: number | null;
  restSeconds: number;
  notes: string | null;
  videoUrl: string | null;
}

interface SetState {
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  completed: boolean;
  skipped: boolean;
  setType: SetType;
}

interface WorkoutState {
  sessionId: number | null;
  programDayId: number | null;
  weekNumber: number;
  exercises: WorkoutExercise[];
  currentExerciseIndex: number;
  currentSetIndex: number;
  setStates: Record<string, SetState>;
  isActive: boolean;

  startWorkout: (params: {
    sessionId: number;
    programDayId: number;
    weekNumber: number;
    exercises: WorkoutExercise[];
  }) => void;
  completeSet: (
    programExerciseId: number,
    setNumber: number,
    data: { weight: number | null; reps: number | null; rpe: number | null }
  ) => void;
  skipSet: (programExerciseId: number, setNumber: number) => void;
  nextExercise: () => void;
  prevExercise: () => void;
  swapExercise: (index: number, newExercise: WorkoutExercise) => void;
  finishWorkout: () => void;
  resetWorkout: () => void;
}

function buildSetKey(programExerciseId: number, setNumber: number): string {
  return `${programExerciseId}-${setNumber}`;
}

function buildInitialSetStates(
  exercises: WorkoutExercise[]
): Record<string, SetState> {
  const states: Record<string, SetState> = {};

  for (const exercise of exercises) {
    const totalSets = exercise.warmupSets + exercise.workingSets;
    for (let i = 1; i <= totalSets; i++) {
      const key = buildSetKey(exercise.programExerciseId, i);
      states[key] = {
        weight: null,
        reps: null,
        rpe: null,
        completed: false,
        skipped: false,
        setType: i <= exercise.warmupSets ? 'warmup' : 'working',
      };
    }
  }

  return states;
}

const initialState: Pick<
  WorkoutState,
  | 'sessionId'
  | 'programDayId'
  | 'weekNumber'
  | 'exercises'
  | 'currentExerciseIndex'
  | 'currentSetIndex'
  | 'setStates'
  | 'isActive'
> = {
  sessionId: null,
  programDayId: null,
  weekNumber: 1,
  exercises: [],
  currentExerciseIndex: 0,
  currentSetIndex: 0,
  setStates: {},
  isActive: false,
};

export const useWorkoutStore = create<WorkoutState>()((set, get) => ({
  ...initialState,

  startWorkout: ({ sessionId, programDayId, weekNumber, exercises }) => {
    set({
      sessionId,
      programDayId,
      weekNumber,
      exercises,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      setStates: buildInitialSetStates(exercises),
      isActive: true,
    });
  },

  completeSet: (programExerciseId, setNumber, data) => {
    const key = buildSetKey(programExerciseId, setNumber);
    const { setStates, currentSetIndex, currentExerciseIndex, exercises } =
      get();

    const existing = setStates[key];
    if (!existing) return;

    const updatedStates = {
      ...setStates,
      [key]: {
        ...existing,
        weight: data.weight,
        reps: data.reps,
        rpe: data.rpe,
        completed: true,
        skipped: false,
      },
    };

    const currentExercise = exercises[currentExerciseIndex];
    if (!currentExercise) {
      set({ setStates: updatedStates });
      return;
    }

    const totalSets =
      currentExercise.warmupSets + currentExercise.workingSets;
    const nextSetIndex = currentSetIndex + 1;

    set({
      setStates: updatedStates,
      currentSetIndex: nextSetIndex < totalSets ? nextSetIndex : currentSetIndex,
    });
  },

  skipSet: (programExerciseId, setNumber) => {
    const key = buildSetKey(programExerciseId, setNumber);
    const { setStates, currentSetIndex, currentExerciseIndex, exercises } =
      get();

    const existing = setStates[key];
    if (!existing) return;

    const updatedStates = {
      ...setStates,
      [key]: {
        ...existing,
        completed: false,
        skipped: true,
      },
    };

    const currentExercise = exercises[currentExerciseIndex];
    if (!currentExercise) {
      set({ setStates: updatedStates });
      return;
    }

    const totalSets =
      currentExercise.warmupSets + currentExercise.workingSets;
    const nextSetIndex = currentSetIndex + 1;

    set({
      setStates: updatedStates,
      currentSetIndex: nextSetIndex < totalSets ? nextSetIndex : currentSetIndex,
    });
  },

  nextExercise: () => {
    const { currentExerciseIndex, exercises } = get();
    const nextIndex = currentExerciseIndex + 1;
    if (nextIndex < exercises.length) {
      set({ currentExerciseIndex: nextIndex, currentSetIndex: 0 });
    }
  },

  prevExercise: () => {
    const { currentExerciseIndex } = get();
    if (currentExerciseIndex > 0) {
      set({ currentExerciseIndex: currentExerciseIndex - 1, currentSetIndex: 0 });
    }
  },

  swapExercise: (index, newExercise) => {
    const { exercises, setStates } = get();
    if (index < 0 || index >= exercises.length) return;

    const oldExercise = exercises[index];
    const updatedExercises = [...exercises];
    updatedExercises[index] = newExercise;

    const updatedStates = { ...setStates };

    // Remove old exercise set states
    const oldTotalSets = oldExercise.warmupSets + oldExercise.workingSets;
    for (let i = 1; i <= oldTotalSets; i++) {
      delete updatedStates[buildSetKey(oldExercise.programExerciseId, i)];
    }

    // Add new exercise set states
    const newTotalSets = newExercise.warmupSets + newExercise.workingSets;
    for (let i = 1; i <= newTotalSets; i++) {
      const key = buildSetKey(newExercise.programExerciseId, i);
      updatedStates[key] = {
        weight: null,
        reps: null,
        rpe: null,
        completed: false,
        skipped: false,
        setType: i <= newExercise.warmupSets ? 'warmup' : 'working',
      };
    }

    set({
      exercises: updatedExercises,
      setStates: updatedStates,
      currentSetIndex: 0,
    });
  },

  finishWorkout: () => {
    set({ isActive: false });
  },

  resetWorkout: () => {
    set(initialState);
  },
}));
