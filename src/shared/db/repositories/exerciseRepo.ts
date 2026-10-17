// SPDX-License-Identifier: GPL-3.0-or-later
import { getDatabase } from "@shared/db/client";

export interface ExerciseRow {
  id: number;
  name: string;
  videoUrl: string | null;
  muscleGroup: string;
  equipment: string;
  notes: string | null;
}

function mapRow(r: {
  id: number;
  name: string;
  video_url: string | null;
  muscle_group: string;
  equipment: string;
  notes: string | null;
}): ExerciseRow {
  return {
    id: r.id,
    name: r.name,
    videoUrl: r.video_url,
    muscleGroup: r.muscle_group,
    equipment: r.equipment,
    notes: r.notes,
  };
}

type RawExerciseRow = {
  id: number;
  name: string;
  video_url: string | null;
  muscle_group: string;
  equipment: string;
  notes: string | null;
};

export async function getExerciseById(id: number): Promise<ExerciseRow | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<RawExerciseRow>(
    `SELECT * FROM exercises WHERE id = ?`,
    [id]
  );
  if (!row) return null;
  return mapRow(row);
}

export async function searchExercises(query: string): Promise<ExerciseRow[]> {
  const db = getDatabase();
  if (!query.trim()) return [];

  const ftsQuery = query
    .trim()
    .split(/\s+/)
    .map((w) => `${w}*`)
    .join(" ");
  const rows = await db.getAllAsync<RawExerciseRow>(
    `SELECT e.*
     FROM exercises e
     JOIN exercises_fts fts ON e.id = fts.rowid
     WHERE exercises_fts MATCH ?
     ORDER BY rank
     LIMIT 20`,
    [ftsQuery]
  );
  return rows.map(mapRow);
}

export async function getAllExercises(): Promise<ExerciseRow[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<RawExerciseRow>(
    `SELECT * FROM exercises ORDER BY name`
  );
  return rows.map(mapRow);
}

export async function getExerciseCount(): Promise<number> {
  const db = getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM exercises`
  );
  return row?.count ?? 0;
}
