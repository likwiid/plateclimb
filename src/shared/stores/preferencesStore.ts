// SPDX-License-Identifier: GPL-3.0-or-later
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFERENCES_KEY = 'plateclimb-preferences';

type WeightUnit = 'kg' | 'lb';

interface PreferencesState {
  weightUnit: WeightUnit;
  defaultIncrement: number;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  repCounterEnabled: boolean;
  currentWeek: number;
  setWeightUnit: (unit: WeightUnit) => void;
  setDefaultIncrement: (increment: number) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setRepCounterEnabled: (enabled: boolean) => void;
  setCurrentWeek: (week: number) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      weightUnit: 'kg',
      defaultIncrement: 2.5,
      hapticsEnabled: true,
      soundEnabled: true,
      repCounterEnabled: false,
      currentWeek: 1,
      setWeightUnit: (unit) => set({ weightUnit: unit }),
      setDefaultIncrement: (increment) => set({ defaultIncrement: increment }),
      setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setRepCounterEnabled: (enabled) => set({ repCounterEnabled: enabled }),
      setCurrentWeek: (week) => set({ currentWeek: week }),
    }),
    {
      name: PREFERENCES_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
