// SPDX-License-Identifier: GPL-3.0-or-later
import { Text, Pressable, StyleSheet } from 'react-native';
import {
  STEP_BUTTON_MIN_WIDTH,
  STEP_BUTTON_MIN_HEIGHT,
} from '../types';

// ─── Component ────────────────────────────────────────────────────────────

export function StepButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-surface-elevated rounded-xl items-center justify-center mx-1 px-2"
      style={({ pressed }: { pressed: boolean }) => [
        stepStyles.button,
        pressed && stepStyles.buttonPressed,
      ]}
    >
      <Text
        className="text-text-secondary font-semibold text-sm"
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {label}
      </Text>
    </Pressable>
  );
}

const stepStyles = StyleSheet.create({
  button: {
    minWidth: STEP_BUTTON_MIN_WIDTH,
    minHeight: STEP_BUTTON_MIN_HEIGHT,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
