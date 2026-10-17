// SPDX-License-Identifier: GPL-3.0-or-later
import { resetDatabase } from '@shared/db/client';

type ResetListener = () => void;

const listeners = new Set<ResetListener>();

/** Subscribes to full data resets. Returns the unsubscribe function. */
export function onAppReset(listener: ResetListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Deletes the database, then tells the root layout to reopen, migrate and
 * seed it and remount every screen. This replaces DevSettings.reload(),
 * which does nothing in release builds.
 */
export async function resetAppData(): Promise<void> {
  await resetDatabase();
  listeners.forEach((listener) => listener());
}
