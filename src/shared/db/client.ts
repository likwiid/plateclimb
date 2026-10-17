// SPDX-License-Identifier: GPL-3.0-or-later
import * as SQLite from "expo-sqlite";

const DB_NAME = "plateclimb.db";

let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync("PRAGMA journal_mode = WAL;");
  await db.execAsync("PRAGMA foreign_keys = ON;");
  return db;
}

export async function resetDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
  await SQLite.deleteDatabaseAsync(DB_NAME);
}
