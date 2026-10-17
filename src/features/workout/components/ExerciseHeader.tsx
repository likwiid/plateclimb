// SPDX-License-Identifier: GPL-3.0-or-later
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@shared/theme';
import { usePreferencesStore } from '@shared/stores/preferencesStore';
import type { WorkoutExercise } from '../types';
import { ANIM_FADE_IN, isSupportedWeight } from '../types';
import { formatRpe, formatTarget } from '../utils/target';

interface ExerciseHeaderProps {
  exercise: WorkoutExercise;
  currentSetIdx: number;
  exerciseKey: number;
  onExercisePress: () => void;
  onSwapPress: () => void;
  onSkipWarmup: () => void;
}

export function ExerciseHeader({
  exercise,
  currentSetIdx,
  exerciseKey,
  onExercisePress,
  onSwapPress,
  onSkipWarmup,
}: ExerciseHeaderProps) {
  const weightUnit = usePreferencesStore((s) => s.weightUnit);
  const currentSet = exercise.sets[currentSetIdx];
  const hasUnskippedWarmups = exercise.sets.some(
    (s) => s.setType === 'warmup' && !s.completed && !s.skipped
  );

  return (
    <Animated.View
      key={exerciseKey}
      entering={FadeIn.duration(ANIM_FADE_IN)}
      className="px-4 pt-4 pb-2"
    >
      <View className="flex-row items-center justify-between">
        <Pressable onPress={onExercisePress} className="flex-1">
          <Text className="text-text-primary text-xl font-bold">
            {exercise.actualExerciseName}
          </Text>
        </Pressable>
        <Pressable
          onPress={onSwapPress}
          hitSlop={8}
          className="ml-2 w-10 h-10 items-center justify-center bg-surface-elevated rounded-lg"
        >
          <Ionicons name="swap-horizontal" size={20} color={colors.text.secondary} />
        </Pressable>
      </View>

      <View className="flex-row items-center mt-1">
        <Text className="text-text-secondary text-sm">
          Set {currentSetIdx + 1} of {exercise.sets.length}
          {currentSet?.setType === 'warmup' && (
            <Text className="text-warning"> (Warmup)</Text>
          )}
        </Text>
        {exercise.intensityTechnique && (
          <Text className="text-purple-400 text-sm ml-2">
            {exercise.intensityTechnique}
          </Text>
        )}
      </View>

      <View className="flex-row items-center mt-1 gap-3">
        {exercise.targetReps && (
          <Text className="text-text-muted text-xs">
            Target: {formatTarget(exercise.targetReps, exercise.unit)}
            {formatRpe(exercise.earlySetRpe, exercise.lastSetRpe)
              ? ` at ${formatRpe(exercise.earlySetRpe, exercise.lastSetRpe)}`
              : ''}
          </Text>
        )}
        {exercise.equipment === 'Barbell' && (
          <Text className="text-text-muted text-xs">
            Bar: {weightUnit === 'kg' ? '20kg' : '45lb'}
          </Text>
        )}
        {isSupportedWeight(exercise.actualExerciseName) && (
          <Text className="text-warning text-xs">
            Assist weight (less = harder)
          </Text>
        )}
      </View>

      {exercise.lastWeekSummary && (
        <Text className="text-text-muted text-xs mt-0.5">
          Last: {exercise.lastWeekSummary.weight}{weightUnit} x {exercise.lastWeekSummary.reps}
          {exercise.lastWeekSummary.sets > 0 ? ` (${exercise.lastWeekSummary.sets} sets)` : ''}
        </Text>
      )}

      {hasUnskippedWarmups && (
        <Pressable
          onPress={onSkipWarmup}
          className="mt-2 self-start bg-surface-elevated px-3 py-1.5 rounded-lg"
        >
          <Text className="text-text-muted text-xs font-medium">
            Skip Warmup
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
}
