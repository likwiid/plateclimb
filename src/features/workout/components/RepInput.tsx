// SPDX-License-Identifier: GPL-3.0-or-later
import { View, Text } from 'react-native';
import { triggerTick } from '@shared/utils/haptics';
import type { SetState } from '../types';
import { MIN_REPS } from '../types';
import { StepButton } from './StepButton';

// ─── Types ────────────────────────────────────────────────────────────────

interface RepInputProps {
  currentSet: SetState;
  onUpdateReps: (value: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────

export function RepInput({ currentSet, onUpdateReps }: RepInputProps) {
  return (
    <View className="flex-row items-center justify-center mb-5">
      <StepButton
        label="-1"
        onPress={() => {
          triggerTick();
          onUpdateReps(Math.max(MIN_REPS, currentSet.reps - 1));
        }}
      />
      <View className="flex-1 mx-4 items-center" style={{ maxWidth: 80 }}>
        <Text
          className="text-text-primary text-5xl font-bold"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {currentSet.reps}
        </Text>
      </View>
      <StepButton
        label="+1"
        onPress={() => {
          triggerTick();
          onUpdateReps(currentSet.reps + 1);
        }}
      />
    </View>
  );
}
