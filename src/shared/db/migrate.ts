// SPDX-License-Identifier: GPL-3.0-or-later
import type { SQLiteDatabase } from "expo-sqlite";

const SCHEMA_VERSION = 1;

/**
 * Creates the schema on first launch. Later versions add a migration step
 * here for each schema change, keyed on PRAGMA user_version.
 */
export async function runMigrations(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version;"
  );
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= SCHEMA_VERSION) return;

  await db.execAsync("BEGIN TRANSACTION;");
  try {
    if (currentVersion < 1) {
      await createSchema(db);
    }
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
    await db.execAsync("COMMIT;");
  } catch (e) {
    await db.execAsync("ROLLBACK;");
    throw e;
  }
}

async function createSchema(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      video_url TEXT,
      muscle_group TEXT NOT NULL,
      equipment TEXT NOT NULL DEFAULT '',
      notes TEXT
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS program_weeks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_number INTEGER NOT NULL UNIQUE,
      block_name TEXT NOT NULL,
      block_type TEXT NOT NULL,
      is_deload INTEGER NOT NULL DEFAULT 0
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS program_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_id INTEGER NOT NULL REFERENCES program_weeks(id),
      day_number INTEGER NOT NULL,
      day_name TEXT NOT NULL,
      day_type TEXT NOT NULL,
      focus TEXT NOT NULL DEFAULT '',
      session_key TEXT NOT NULL DEFAULT ''
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS program_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_id INTEGER NOT NULL REFERENCES program_days(id),
      exercise_id INTEGER NOT NULL REFERENCES exercises(id),
      "order" INTEGER NOT NULL,
      warmup_sets INTEGER NOT NULL DEFAULT 0,
      working_sets INTEGER NOT NULL,
      target_reps TEXT NOT NULL,
      intensity_technique TEXT,
      early_set_rpe REAL,
      last_set_rpe REAL,
      rest_seconds INTEGER NOT NULL DEFAULT 120,
      notes TEXT,
      slot_key TEXT,
      unit TEXT NOT NULL DEFAULT 'kg' CHECK(unit IN ('kg','bodyweight','seconds')),
      prescribed_weight REAL,
      superset_group INTEGER
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS exercise_substitutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      program_exercise_id INTEGER NOT NULL REFERENCES program_exercises(id),
      substitution_exercise_id INTEGER NOT NULL REFERENCES exercises(id),
      priority INTEGER NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      program_day_id INTEGER NOT NULL REFERENCES program_days(id),
      week_number INTEGER NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      duration_seconds INTEGER
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES workout_sessions(id),
      program_exercise_id INTEGER NOT NULL REFERENCES program_exercises(id),
      exercise_id INTEGER NOT NULL REFERENCES exercises(id),
      set_number INTEGER NOT NULL,
      set_type TEXT NOT NULL DEFAULT 'working',
      weight REAL,
      reps INTEGER,
      rpe REAL,
      completed_at TEXT,
      skipped INTEGER NOT NULL DEFAULT 0
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS exercise_last_performed (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_id INTEGER NOT NULL UNIQUE REFERENCES exercises(id),
      last_weight REAL,
      last_reps INTEGER,
      last_rpe REAL
    );
  `);

  // Full text search over exercise names, muscles and equipment
  await db.execAsync(`
    CREATE VIRTUAL TABLE IF NOT EXISTS exercises_fts USING fts5(
      name,
      muscle_group,
      equipment,
      content='exercises',
      content_rowid='id'
    );
  `);

  await db.execAsync(`
    CREATE TRIGGER IF NOT EXISTS exercises_ai AFTER INSERT ON exercises BEGIN
      INSERT INTO exercises_fts(rowid, name, muscle_group, equipment)
      VALUES (new.id, new.name, new.muscle_group, new.equipment);
    END;
  `);

  await db.execAsync(`
    CREATE TRIGGER IF NOT EXISTS exercises_ad AFTER DELETE ON exercises BEGIN
      INSERT INTO exercises_fts(exercises_fts, rowid, name, muscle_group, equipment)
      VALUES ('delete', old.id, old.name, old.muscle_group, old.equipment);
    END;
  `);

  await db.execAsync(`
    CREATE TRIGGER IF NOT EXISTS exercises_au AFTER UPDATE ON exercises BEGIN
      INSERT INTO exercises_fts(exercises_fts, rowid, name, muscle_group, equipment)
      VALUES ('delete', old.id, old.name, old.muscle_group, old.equipment);
      INSERT INTO exercises_fts(rowid, name, muscle_group, equipment)
      VALUES (new.id, new.name, new.muscle_group, new.equipment);
    END;
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_program_days_week ON program_days(week_id);
    CREATE INDEX IF NOT EXISTS idx_program_exercises_day ON program_exercises(day_id);
    CREATE INDEX IF NOT EXISTS idx_exercise_substitutions_slot ON exercise_substitutions(program_exercise_id);
    CREATE INDEX IF NOT EXISTS idx_workout_sessions_day ON workout_sessions(program_day_id);
    CREATE INDEX IF NOT EXISTS idx_workout_sets_session ON workout_sets(session_id);
  `);
}
