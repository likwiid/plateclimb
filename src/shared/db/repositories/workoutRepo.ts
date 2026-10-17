// SPDX-License-Identifier: GPL-3.0-or-later
import { getDatabase } from "@shared/db/client";
import type { DayType, SetType } from "@shared/types";

export interface SessionRow {
  id: number;
  programDayId: number;
  weekNumber: number;
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number | null;
  dayName: string;
  dayType: DayType;
}

export interface SetRow {
  id: number;
  sessionId: number;
  programExerciseId: number;
  exerciseId: number;
  setNumber: number;
  setType: SetType;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  completedAt: string | null;
  skipped: boolean;
}

export async function createSession(
  programDayId: number,
  weekNumber: number
): Promise<number> {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO workout_sessions (program_day_id, week_number, started_at)
     VALUES (?, ?, ?)`,
    [programDayId, weekNumber, new Date().toISOString()]
  );
  return result.lastInsertRowId;
}

export async function completeSession(sessionId: number): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();
  const session = await db.getFirstAsync<{ started_at: string }>(
    `SELECT started_at FROM workout_sessions WHERE id = ?`,
    [sessionId]
  );
  if (!session) return;
  const duration = Math.floor(
    (Date.now() - new Date(session.started_at).getTime()) / 1000
  );
  await db.runAsync(
    `UPDATE workout_sessions SET completed_at = ?, duration_seconds = ? WHERE id = ?`,
    [now, duration, sessionId]
  );
}

export async function saveSet(
  sessionId: number,
  programExerciseId: number,
  exerciseId: number,
  setNumber: number,
  setType: string,
  weight: number | null,
  reps: number | null,
  rpe: number | null
): Promise<number> {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO workout_sets (session_id, program_exercise_id, exercise_id, set_number, set_type, weight, reps, rpe, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sessionId,
      programExerciseId,
      exerciseId,
      setNumber,
      setType,
      weight,
      reps,
      rpe,
      new Date().toISOString(),
    ]
  );
  // Update last performed (only for working sets to avoid warmup corruption)
  if (setType === 'working') {
    await db.runAsync(
      `INSERT INTO exercise_last_performed (exercise_id, last_weight, last_reps, last_rpe)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(exercise_id) DO UPDATE SET
         last_weight = excluded.last_weight,
         last_reps = excluded.last_reps,
         last_rpe = excluded.last_rpe`,
      [exerciseId, weight, reps, rpe]
    );
  }
  return result.lastInsertRowId;
}

export async function skipSet(
  sessionId: number,
  programExerciseId: number,
  exerciseId: number,
  setNumber: number,
  setType: string
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO workout_sets (session_id, program_exercise_id, exercise_id, set_number, set_type, skipped, completed_at)
     VALUES (?, ?, ?, ?, ?, 1, ?)`,
    [
      sessionId,
      programExerciseId,
      exerciseId,
      setNumber,
      setType,
      new Date().toISOString(),
    ]
  );
}

export async function getLastPerformedBatch(
  exerciseIds: number[]
): Promise<Map<number, number>> {
  if (exerciseIds.length === 0) return new Map();
  const db = getDatabase();
  const placeholders = exerciseIds.map(() => '?').join(',');
  const rows = await db.getAllAsync<{ exercise_id: number; last_weight: number }>(
    `SELECT exercise_id, last_weight FROM exercise_last_performed WHERE exercise_id IN (${placeholders}) AND last_weight IS NOT NULL`,
    exerciseIds
  );
  const result = new Map<number, number>();
  for (const row of rows) {
    result.set(row.exercise_id, row.last_weight);
  }
  return result;
}

export async function getLastPerformed(
  exerciseId: number
): Promise<{ lastWeight: number | null; lastReps: number | null; lastRpe: number | null } | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<{
    last_weight: number | null;
    last_reps: number | null;
    last_rpe: number | null;
  }>(
    `SELECT last_weight, last_reps, last_rpe FROM exercise_last_performed WHERE exercise_id = ?`,
    [exerciseId]
  );
  if (!row) return null;
  return {
    lastWeight: row.last_weight,
    lastReps: row.last_reps,
    lastRpe: row.last_rpe,
  };
}

export async function getSessionSets(sessionId: number): Promise<SetRow[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<{
    id: number;
    session_id: number;
    program_exercise_id: number;
    exercise_id: number;
    set_number: number;
    set_type: string;
    weight: number | null;
    reps: number | null;
    rpe: number | null;
    completed_at: string | null;
    skipped: number;
  }>(
    `SELECT * FROM workout_sets WHERE session_id = ? ORDER BY id`,
    [sessionId]
  );
  return rows.map((r) => ({
    id: r.id,
    sessionId: r.session_id,
    programExerciseId: r.program_exercise_id,
    exerciseId: r.exercise_id,
    setNumber: r.set_number,
    setType: r.set_type as SetType,
    weight: r.weight,
    reps: r.reps,
    rpe: r.rpe,
    completedAt: r.completed_at,
    skipped: r.skipped === 1,
  }));
}

export async function getAllSessions(): Promise<SessionRow[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<{
    id: number;
    program_day_id: number;
    week_number: number;
    started_at: string;
    completed_at: string | null;
    duration_seconds: number | null;
    day_name: string;
    day_type: string;
  }>(`
    SELECT
      ws.id, ws.program_day_id, ws.week_number, ws.started_at,
      ws.completed_at, ws.duration_seconds,
      pd.day_name, pd.day_type
    FROM workout_sessions ws
    JOIN program_days pd ON ws.program_day_id = pd.id
    ORDER BY ws.started_at DESC
  `);
  return rows.map((r) => ({
    id: r.id,
    programDayId: r.program_day_id,
    weekNumber: r.week_number,
    startedAt: r.started_at,
    completedAt: r.completed_at,
    durationSeconds: r.duration_seconds,
    dayName: r.day_name,
    dayType: r.day_type as DayType,
  }));
}

export async function getIncompleteSession(): Promise<SessionRow | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<{
    id: number;
    program_day_id: number;
    week_number: number;
    started_at: string;
    completed_at: string | null;
    duration_seconds: number | null;
    day_name: string;
    day_type: string;
  }>(`
    SELECT
      ws.id, ws.program_day_id, ws.week_number, ws.started_at,
      ws.completed_at, ws.duration_seconds,
      pd.day_name, pd.day_type
    FROM workout_sessions ws
    JOIN program_days pd ON ws.program_day_id = pd.id
    WHERE ws.completed_at IS NULL
    ORDER BY ws.started_at DESC
    LIMIT 1
  `);
  if (!row) return null;
  return {
    id: row.id,
    programDayId: row.program_day_id,
    weekNumber: row.week_number,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    durationSeconds: row.duration_seconds,
    dayName: row.day_name,
    dayType: row.day_type as DayType,
  };
}

export async function deleteSession(sessionId: number): Promise<void> {
  const db = getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync(`DELETE FROM workout_sets WHERE session_id = ?`, [sessionId]);
    await db.runAsync(`DELETE FROM workout_sessions WHERE id = ?`, [sessionId]);
  });
}

export async function revertSet(
  sessionId: number,
  programExerciseId: number,
  setNumber: number
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `DELETE FROM workout_sets WHERE session_id = ? AND program_exercise_id = ? AND set_number = ?`,
    [sessionId, programExerciseId, setNumber]
  );
}

export async function restartSession(sessionId: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `DELETE FROM workout_sets WHERE session_id = ?`,
    [sessionId]
  );
}

export async function getIncompleteSessionForDay(
  programDayId: number
): Promise<SessionRow | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<{
    id: number;
    program_day_id: number;
    week_number: number;
    started_at: string;
    completed_at: string | null;
    duration_seconds: number | null;
    day_name: string;
    day_type: string;
  }>(
    `SELECT ws.id, ws.program_day_id, ws.week_number, ws.started_at,
            ws.completed_at, ws.duration_seconds,
            pd.day_name, pd.day_type
     FROM workout_sessions ws
     JOIN program_days pd ON ws.program_day_id = pd.id
     WHERE ws.program_day_id = ? AND ws.completed_at IS NULL
     ORDER BY ws.started_at DESC
     LIMIT 1`,
    [programDayId]
  );
  if (!row) return null;
  return {
    id: row.id,
    programDayId: row.program_day_id,
    weekNumber: row.week_number,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    durationSeconds: row.duration_seconds,
    dayName: row.day_name,
    dayType: row.day_type as DayType,
  };
}

export async function getCompletedSessionForDay(
  programDayId: number
): Promise<SessionRow | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<{
    id: number;
    program_day_id: number;
    week_number: number;
    started_at: string;
    completed_at: string | null;
    duration_seconds: number | null;
    day_name: string;
    day_type: string;
  }>(
    `SELECT ws.id, ws.program_day_id, ws.week_number, ws.started_at,
            ws.completed_at, ws.duration_seconds,
            pd.day_name, pd.day_type
     FROM workout_sessions ws
     JOIN program_days pd ON ws.program_day_id = pd.id
     WHERE ws.program_day_id = ? AND ws.completed_at IS NOT NULL
     ORDER BY ws.completed_at DESC
     LIMIT 1`,
    [programDayId]
  );
  if (!row) return null;
  return {
    id: row.id,
    programDayId: row.program_day_id,
    weekNumber: row.week_number,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    durationSeconds: row.duration_seconds,
    dayName: row.day_name,
    dayType: row.day_type as DayType,
  };
}

export async function getActualExerciseIdsForSlot(
  programExerciseId: number
): Promise<number[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<{ exercise_id: number }>(
    `SELECT DISTINCT exercise_id FROM workout_sets WHERE program_exercise_id = ?`,
    [programExerciseId]
  );
  return rows.map((r) => r.exercise_id);
}

export async function markDayComplete(
  programDayId: number,
  weekNumber: number
): Promise<void> {
  const db = getDatabase();
  const existing = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM workout_sessions
     WHERE program_day_id = ? AND week_number = ? AND completed_at IS NOT NULL
     LIMIT 1`,
    [programDayId, weekNumber]
  );
  if (existing) return;
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO workout_sessions (program_day_id, week_number, started_at, completed_at, duration_seconds)
     VALUES (?, ?, ?, ?, 0)`,
    [programDayId, weekNumber, now, now]
  );
}

export async function getExerciseHistory(
  exerciseId: number,
  maxWeeks: number = 4,
  excludeSessionId?: number
): Promise<
  { weekNumber: number; weight: number; reps: number; rpe: number; setType: string }[]
> {
  const db = getDatabase();
  const sessionFilter = excludeSessionId != null ? ' AND wset.session_id != ?' : '';
  const params: (number)[] = [exerciseId];
  if (excludeSessionId != null) params.push(excludeSessionId);
  params.push(maxWeeks * 8);

  const rows = await db.getAllAsync<{
    week_number: number;
    weight: number;
    reps: number;
    rpe: number;
    set_type: string;
  }>(
    `SELECT ws.week_number, wset.weight, wset.reps, wset.rpe, wset.set_type
     FROM workout_sets wset
     JOIN workout_sessions ws ON wset.session_id = ws.id
     WHERE wset.exercise_id = ? AND wset.skipped = 0 AND wset.weight IS NOT NULL${sessionFilter}
     ORDER BY ws.week_number DESC, wset.set_number ASC
     LIMIT ?`,
    params
  );
  return rows.map((r) => ({
    weekNumber: r.week_number,
    weight: r.weight,
    reps: r.reps,
    rpe: r.rpe,
    setType: r.set_type,
  }));
}
