// SPDX-License-Identifier: GPL-3.0-or-later
import type { SQLiteDatabase } from "expo-sqlite";
import { seedExercises } from "@data/exerciseSeed";
import { seedProgram } from "@data/seedProgram";

/**
 * Seeds the exercise catalog (free-exercise-db) and the bundled program on
 * first launch and after a reset. Everything ships in the app bundle, so no
 * network is needed. On a normal launch both are present and this returns
 * straight away.
 */
export async function seedDatabase(db: SQLiteDatabase): Promise<void> {
  const exerciseCount = await countRows(db, "exercises");
  const weekCount = await countRows(db, "program_weeks");
  if (exerciseCount > 0 && weekCount > 0) return;

  // The catalog goes first: the program links its exercises by name.
  if (exerciseCount === 0) {
    await seedExercises(db);
  }
  if (weekCount === 0) {
    await seedProgram(db);
  }
}

async function countRows(db: SQLiteDatabase, table: string): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${table};`,
  );
  return row?.count ?? 0;
}
