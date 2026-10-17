// SPDX-License-Identifier: GPL-3.0-or-later
import { useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from '@shared/components';
import { usePreferencesStore } from '@shared/stores/preferencesStore';
import { colors } from '@shared/theme';
import type { SetState } from '../types';
import { WeightInput } from './WeightInput';
import { RepCounter } from './RepCounter';
import { RepInput } from './RepInput';
import { styles as setInputStyles } from './setInputStyles';

// ─── Types ────────────────────────────────────────────────────────────────

interface SetInputControlsProps {
  currentSet: SetState;
  weightUnit: string;
  defaultIncrement: number;
  buttonHeight: number;
  cardPadding: number;
  onUpdateSet: (field: keyof SetState, value: number) => void;
  onComplete: () => void;
  onSkip: () => void;
  exerciseUnit?: string;
  onToggleUnit?: () => void;
  isSupportedWeight?: boolean;
  exerciseName?: string;
  exerciseEquipment?: string;
}

// ─── Component ────────────────────────────────────────────────────────────

export function SetInputControls({
  currentSet,
  weightUnit,
  defaultIncrement,
  buttonHeight,
  cardPadding,
  onUpdateSet,
  onComplete,
  onSkip,
  exerciseUnit,
  onToggleUnit,
  isSupportedWeight: isSupported,
  exerciseName = '',
  exerciseEquipment = '',
}: SetInputControlsProps) {
  const displayUnit = exerciseUnit ?? weightUnit;

  const repCounterEnabled = usePreferencesStore((s) => s.repCounterEnabled);
  const setRepCounterEnabled = usePreferencesStore((s) => s.setRepCounterEnabled);

  const isRunningRef = useRef(false);

  // Complete button scale animation
  const completeScale = useSharedValue(1);
  const completeButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: completeScale.value }],
  }));

  function handleComplete() {
    if (isRunningRef.current) return;
    onComplete();
  }

  return (
    <View
      className="bg-surface border border-border rounded-2xl mb-4 overflow-hidden"
      style={{ padding: cardPadding }}
    >
      {/* Weight */}
      <WeightInput
        currentSet={currentSet}
        displayUnit={displayUnit}
        defaultIncrement={defaultIncrement}
        isSupported={isSupported}
        onUpdateWeight={(value) => onUpdateSet('weight', value)}
        onToggleUnit={onToggleUnit}
      />

      {/* Reps header */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-text-muted text-xs uppercase tracking-wider">
          Reps
        </Text>
        <Pressable
          onPress={() => setRepCounterEnabled(!repCounterEnabled)}
          style={[
            setInputStyles.repCounterToggle,
            {
              backgroundColor: repCounterEnabled ? colors.success + '20' : colors.bg.elevated,
            },
          ]}
        >
          <Ionicons
            name={repCounterEnabled ? 'radio-button-on' : 'radio-button-off'}
            size={12}
            color={repCounterEnabled ? colors.success : colors.text.muted}
          />
          <Text style={{
            color: repCounterEnabled ? colors.success : colors.text.muted,
            fontSize: 11,
            fontWeight: '600',
          }}>
            Counter
          </Text>
        </Pressable>
      </View>

      {repCounterEnabled ? (
        <RepCounter
          exerciseName={exerciseName}
          exerciseEquipment={exerciseEquipment}
          onRepCount={(n) => onUpdateSet('reps', n)}
          onStop={() => {}}
          isRunningRef={isRunningRef}
        />
      ) : (
        <RepInput
          currentSet={currentSet}
          onUpdateReps={(value) => onUpdateSet('reps', value)}
        />
      )}

      {/* Complete Set */}
      <AnimatedPressable
        onPress={handleComplete}
        className="rounded-xl items-center mt-3 overflow-hidden"
        style={[{ minHeight: buttonHeight }, completeButtonStyle]}
        onPressIn={() => {
          completeScale.value = withSpring(0.96);
        }}
        onPressOut={() => {
          completeScale.value = withSpring(1);
        }}
      >
        <LinearGradient
          colors={[colors.indigo, colors.indigoDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-full items-center justify-center rounded-xl"
          style={{ minHeight: buttonHeight }}
        >
          <Text className="text-white font-bold text-lg">
            Complete Set
          </Text>
        </LinearGradient>
      </AnimatedPressable>

      {/* Skip Set */}
      <Pressable onPress={onSkip} className="py-3 items-center mt-2">
        <Text className="text-text-muted text-sm">Skip Set</Text>
      </Pressable>
    </View>
  );
}
