// SPDX-License-Identifier: GPL-3.0-or-later
import { create } from 'zustand';

interface TimerState {
  startTimestamp: number | null;
  durationSeconds: number;
  isRunning: boolean;
  startTimer: (durationSeconds: number) => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

export const useTimerStore = create<TimerState>()((set) => ({
  startTimestamp: null,
  durationSeconds: 0,
  isRunning: false,

  startTimer: (durationSeconds) => {
    set({
      startTimestamp: Date.now(),
      durationSeconds,
      isRunning: true,
    });
  },

  stopTimer: () => {
    set({ isRunning: false });
  },

  resetTimer: () => {
    set({
      startTimestamp: null,
      durationSeconds: 0,
      isRunning: false,
    });
  },
}));
