// SPDX-License-Identifier: GPL-3.0-or-later
import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export type IoniconsName = ComponentProps<typeof Ionicons>["name"];

export type BlockType = "Base" | "Build" | "Peak" | "Deload" | (string & {});
export type DayType = "Upper" | "Pull" | "Push" | "Legs" | "Specialty" | "Rest";
export type SetType = "warmup" | "working" | "dropset" | "myo" | "lengthened_partial";
export type WeightUnit = "kg" | "lb";
export type IntensityTechnique =
  | "Failure"
  | "Failure + LLPs (Extend set)"
  | "Myo-reps"
  | "Static Stretch (30s)"
  | null;

export interface ExerciseData {
  id: number;
  name: string;
  videoUrl: string | null;
  muscleGroup: string;
  equipment: string;
  notes: string | null;
}

export interface ProgramWeekData {
  weekNumber: number;
  blockName: string;
  blockType: BlockType;
  isDeload: boolean;
}

export interface ProgramDayData {
  weekNumber: number;
  dayNumber: number;
  dayName: string;
  dayType: DayType;
  focus: string;
}

export interface ProgramExerciseData {
  weekNumber: number;
  dayNumber: number;
  exerciseOrder: number;
  exerciseName: string;
  warmupSets: number;
  workingSets: number;
  targetReps: string;
  intensityTechnique: IntensityTechnique;
  earlySetRpe: number | null;
  lastSetRpe: number | null;
  restSeconds: number;
  notes: string | null;
}

export interface SubstitutionData {
  exerciseName: string;
  substitution1Name: string | null;
  substitution2Name: string | null;
}

