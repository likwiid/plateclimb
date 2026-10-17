// SPDX-License-Identifier: GPL-3.0-or-later
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { usePreferencesStore } from '@shared/stores/preferencesStore';

export function speakNumber(n: number): void {
  if (!usePreferencesStore.getState().soundEnabled) return;

  try {
    Speech.stop();
    Speech.speak(String(n), {
      language: 'en-US',
      pitch: 0.95,
      rate: 1.1,
      volume: 1.0,
      ...(Platform.OS === 'ios' && { useApplicationAudioSession: true }),
    });
  } catch {
    // Non-critical
  }
}

export function stopSpeaking(): void {
  try {
    Speech.stop();
  } catch {
    // Non-critical
  }
}
