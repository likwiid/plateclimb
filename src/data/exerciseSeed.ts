// SPDX-License-Identifier: GPL-3.0-or-later
import type { SQLiteDatabase } from "expo-sqlite";
import rawExercises from "./exercises.json";

// ---------- free-exercise-db types ----------

export interface FreeExercise {
  id: string;
  name: string;
  force: "push" | "pull" | "static" | null;
  level: "beginner" | "intermediate" | "expert";
  mechanic: "compound" | "isolation" | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category:
    | "strength"
    | "stretching"
    | "plyometrics"
    | "strongman"
    | "powerlifting"
    | "cardio"
    | "olympic weightlifting";
  images: string[];
}

// ---------- Mapping helpers ----------

/**
 * Maps a free-exercise-db primaryMuscles array to the single muscle-group
 * string the app's `exercises` table expects.
 *
 * The app already uses values like "Chest", "Back", "Quads", "Hamstrings",
 * "Shoulders", "Biceps", "Triceps", "Abs", "Glutes", "Calves", "Traps",
 * "Rear Delts", "Abductors", "Adductors", and "Warmup".
 */
const MUSCLE_MAP: Record<string, string> = {
  abdominals: "Abs",
  abductors: "Abductors",
  adductors: "Adductors",
  biceps: "Biceps",
  calves: "Calves",
  chest: "Chest",
  forearms: "Forearms",
  glutes: "Glutes",
  hamstrings: "Hamstrings",
  lats: "Back",
  "lower back": "Back",
  "middle back": "Back",
  neck: "Neck",
  quadriceps: "Quads",
  shoulders: "Shoulders",
  traps: "Traps",
  triceps: "Triceps",
};

function mapMuscleGroup(primaryMuscles: string[]): string {
  if (primaryMuscles.length === 0) return "Other";
  return MUSCLE_MAP[primaryMuscles[0]] ?? "Other";
}

/**
 * Maps free-exercise-db equipment strings to the app's equipment vocabulary:
 * "Barbell", "Dumbbell", "Cable", "Machine", "Bodyweight", "Accessory", "Other"
 */
const EQUIPMENT_MAP: Record<string, string> = {
  barbell: "Barbell",
  dumbbell: "Dumbbell",
  cable: "Cable",
  machine: "Machine",
  "body only": "Bodyweight",
  "e-z curl bar": "Barbell",
  kettlebells: "Kettlebell",
  bands: "Bands",
  "exercise ball": "Accessory",
  "foam roll": "Accessory",
  "medicine ball": "Accessory",
  other: "Other",
};

function mapEquipment(equipment: string | null): string {
  if (equipment == null) return "Bodyweight";
  return EQUIPMENT_MAP[equipment] ?? "Other";
}

/**
 * Builds the notes string from the exercise instructions array.
 * If the instructions array is empty, returns null.
 */
function buildNotes(instructions: string[]): string | null {
  if (instructions.length === 0) return null;
  // Join with numbered steps for readability
  if (instructions.length === 1) return instructions[0];
  return instructions.map((s, i) => `${i + 1}. ${s}`).join(" ");
}

// ---------- Typed raw data export ----------

export const freeExercises: FreeExercise[] = rawExercises as FreeExercise[];

// ---------- Mapped exercise records ----------

export interface MappedExercise {
  /** Original free-exercise-db id (e.g. "Barbell_Bench_Press_-_Medium_Grip") */
  sourceId: string;
  name: string;
  videoUrl: string | null;
  muscleGroup: string;
  equipment: string;
  notes: string | null;
}

export function mapExercises(): MappedExercise[] {
  return freeExercises.map((ex) => ({
    sourceId: ex.id,
    name: ex.name,
    videoUrl: null,
    muscleGroup: mapMuscleGroup(ex.primaryMuscles),
    equipment: mapEquipment(ex.equipment),
    notes: buildNotes(ex.instructions),
  }));
}

// ---------- Seed function ----------

function esc(v: string | null): string {
  if (v == null) return "NULL";
  return "'" + v.replace(/'/g, "''") + "'";
}

/**
 * Seeds the `exercises` table with all exercises from the free-exercise-db.
 *
 * This is designed to run **independently** of the program seed in seed.ts.
 * It will skip seeding if exercises already exist (same guard as the
 * existing seed).
 *
 * @param db - The expo-sqlite database instance
 * @param options.force - When true, inserts even if exercises already exist
 */
export async function seedExercises(
  db: SQLiteDatabase,
  options?: { force?: boolean }
): Promise<void> {
  if (!options?.force) {
    const row = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM exercises;"
    );
    if (row && row.count > 0) return;
  }

  const mapped = mapExercises();
  const statements: string[] = [];

  for (const ex of mapped) {
    statements.push(
      `INSERT OR IGNORE INTO exercises (name, video_url, muscle_group, equipment, notes) VALUES (${esc(ex.name)}, ${esc(ex.videoUrl)}, ${esc(ex.muscleGroup)}, ${esc(ex.equipment)}, ${esc(ex.notes)});`
    );
  }

  // Rebuild the full text search index
  statements.push("INSERT INTO exercises_fts(exercises_fts) VALUES ('rebuild');");

  const BATCH_SIZE = 50;
  await db.execAsync("BEGIN TRANSACTION;");
  try {
    for (let i = 0; i < statements.length; i += BATCH_SIZE) {
      const batch = statements.slice(i, i + BATCH_SIZE).join("\n");
      await db.execAsync(batch);
    }
    await db.execAsync("COMMIT;");
  } catch (e) {
    await db.execAsync("ROLLBACK;");
    throw e;
  }
}
