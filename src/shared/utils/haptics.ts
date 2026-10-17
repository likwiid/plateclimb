// SPDX-License-Identifier: GPL-3.0-or-later
import * as Haptics from 'expo-haptics';
import { usePreferencesStore } from '@shared/stores/preferencesStore';

function isEnabled(): boolean {
  return usePreferencesStore.getState().hapticsEnabled;
}

// Basic impacts
export function triggerLight(): void {
  if (!isEnabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function triggerMedium(): void {
  if (!isEnabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function triggerHeavy(): void {
  if (!isEnabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

// Notifications
export function triggerSuccess(): void {
  if (!isEnabled()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function triggerWarning(): void {
  if (!isEnabled()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

export function triggerError(): void {
  if (!isEnabled()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

// Selection (picker-style feedback)
export function triggerSelection(): void {
  if (!isEnabled()) return;
  Haptics.selectionAsync();
}

// Compound patterns
export async function triggerSetComplete(): Promise<void> {
  if (!isEnabled()) return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  await new Promise(r => setTimeout(r, 60));
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export async function triggerWorkoutDone(): Promise<void> {
  if (!isEnabled()) return;
  for (let i = 0; i < 3; i++) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (i < 2) await new Promise(r => setTimeout(r, 150));
  }
}

export async function triggerTimerDone(): Promise<void> {
  if (!isEnabled()) return;
  for (let i = 0; i < 3; i++) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (i < 2) await new Promise(r => setTimeout(r, 120));
  }
}

export function triggerNavigation(): void {
  if (!isEnabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function triggerTick(): void {
  if (!isEnabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
