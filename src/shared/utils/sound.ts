// SPDX-License-Identifier: GPL-3.0-or-later
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { usePreferencesStore } from '@shared/stores/preferencesStore';

let setCompletePlayer: AudioPlayer | null = null;
let timerDonePlayer: AudioPlayer | null = null;
let workoutDonePlayer: AudioPlayer | null = null;
let tapPlayer: AudioPlayer | null = null;
let repTickPlayer: AudioPlayer | null = null;

let audioModeSet = false;

async function ensureAudioMode(): Promise<void> {
  if (audioModeSet) return;
  audioModeSet = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    });
  } catch {
    // Non-critical
  }
}

function isEnabled(): boolean {
  return usePreferencesStore.getState().soundEnabled;
}

async function playSound(
  getter: () => AudioPlayer | null,
  setter: (p: AudioPlayer) => void,
  source: number
): Promise<void> {
  if (!isEnabled()) return;
  try {
    // Must set audio mode BEFORE creating any player
    await ensureAudioMode();

    let player = getter();
    if (!player) {
      player = createAudioPlayer(source);
      player.volume = 1.0;
      setter(player);
    }

    player.seekTo(0);
    player.play();
  } catch {
    // Silently fail - sounds are non-critical
  }
}

export function playSetComplete(): Promise<void> {
  return playSound(
    () => setCompletePlayer,
    (p) => { setCompletePlayer = p; },
    require('../../../assets/sounds/set-complete.wav')
  );
}

export function playTimerDone(): Promise<void> {
  return playSound(
    () => timerDonePlayer,
    (p) => { timerDonePlayer = p; },
    require('../../../assets/sounds/timer-done.wav')
  );
}

export function playWorkoutDone(): Promise<void> {
  return playSound(
    () => workoutDonePlayer,
    (p) => { workoutDonePlayer = p; },
    require('../../../assets/sounds/workout-done.wav')
  );
}

export function playTap(): Promise<void> {
  return playSound(
    () => tapPlayer,
    (p) => { tapPlayer = p; },
    require('../../../assets/sounds/tap.wav')
  );
}

export function playRepTick(): Promise<void> {
  return playSound(
    () => repTickPlayer,
    (p) => { repTickPlayer = p; },
    require('../../../assets/sounds/set-complete.wav')
  );
}
