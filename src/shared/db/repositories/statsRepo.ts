// SPDX-License-Identifier: GPL-3.0-or-later
import { getDatabase } from "@shared/db/client";

export interface SessionSummary {
  sessionId: number;
  totalSets: number;
  completedSets: number;
  skippedSets: number;
  skippedWarmupSets: number;
  skippedWorkingSets: number;
  totalVolume: number;
  averageRpe: number | null;
  exercises: ExerciseSummary[];
}

export interface ExerciseSummary {
  exerciseName: string;
  sets: {
    setNumber: number;
    weight: number | null;
    reps: number | null;
    rpe: number | null;
    skipped: boolean;
  }[];
}

export async function getSessionSummary(sessionId: number): Promise<SessionSummary> {
  const db = getDatabase();

  const stats = await db.getFirstAsync<{
    total_sets: number;
    completed_sets: number;
    skipped_sets: number;
    skipped_warmup_sets: number;
    skipped_working_sets: number;
    total_volume: number;
    avg_rpe: number | null;
  }>(
    `
    SELECT
      COUNT(*) as total_sets,
      SUM(CASE WHEN skipped = 0 AND completed_at IS NOT NULL THEN 1 ELSE 0 END) as completed_sets,
      SUM(CASE WHEN skipped = 1 THEN 1 ELSE 0 END) as skipped_sets,
      SUM(CASE WHEN skipped = 1 AND set_type = 'warmup' THEN 1 ELSE 0 END) as skipped_warmup_sets,
      SUM(CASE WHEN skipped = 1 AND set_type = 'working' THEN 1 ELSE 0 END) as skipped_working_sets,
      COALESCE(SUM(CASE WHEN skipped = 0 THEN weight * reps ELSE 0 END), 0) as total_volume,
      AVG(CASE WHEN skipped = 0 AND rpe IS NOT NULL THEN rpe ELSE NULL END) as avg_rpe
    FROM workout_sets
    WHERE session_id = ?
  `,
    [sessionId]
  );

  const exerciseRows = await db.getAllAsync<{
    exercise_name: string;
    set_number: number;
    weight: number | null;
    reps: number | null;
    rpe: number | null;
    skipped: number;
  }>(
    `
    SELECT
      e.name as exercise_name,
      ws.set_number,
      ws.weight,
      ws.reps,
      ws.rpe,
      ws.skipped
    FROM workout_sets ws
    JOIN exercises e ON ws.exercise_id = e.id
    WHERE ws.session_id = ?
    ORDER BY ws.id
  `,
    [sessionId]
  );

  const exerciseMap = new Map<string, ExerciseSummary>();
  for (const row of exerciseRows) {
    if (!exerciseMap.has(row.exercise_name)) {
      exerciseMap.set(row.exercise_name, {
        exerciseName: row.exercise_name,
        sets: [],
      });
    }
    exerciseMap.get(row.exercise_name)!.sets.push({
      setNumber: row.set_number,
      weight: row.weight,
      reps: row.reps,
      rpe: row.rpe,
      skipped: row.skipped === 1,
    });
  }

  return {
    sessionId,
    totalSets: stats?.total_sets ?? 0,
    completedSets: stats?.completed_sets ?? 0,
    skippedSets: stats?.skipped_sets ?? 0,
    skippedWarmupSets: stats?.skipped_warmup_sets ?? 0,
    skippedWorkingSets: stats?.skipped_working_sets ?? 0,
    totalVolume: stats?.total_volume ?? 0,
    averageRpe: stats?.avg_rpe ?? null,
    exercises: Array.from(exerciseMap.values()),
  };
}
