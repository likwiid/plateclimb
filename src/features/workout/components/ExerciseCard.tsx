// SPDX-License-Identifier: GPL-3.0-or-later
import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { AnimatedPressable, Badge } from '@shared/components';
import type { DayExerciseRow } from '@shared/db/repositories/programRepo';
import { usePreferencesStore } from '@shared/stores/preferencesStore';
import { colors } from '@shared/theme';

import { formatPrescribed, formatRpe, formatTarget } from '../utils/target';

type ExerciseCardProps = {
  exercise: DayExerciseRow;
  index: number;
  onExercisePress: (exerciseId: number) => void;
};

export const ExerciseCard = React.memo(function ExerciseCard({
  exercise: ex,
  index,
  onExercisePress,
}: ExerciseCardProps) {
  const weightUnit = usePreferencesStore((s) => s.weightUnit);
  const startWeight = formatPrescribed(ex.prescribedWeight, ex.unit, weightUnit);
  const rpe = formatRpe(ex.earlySetRpe, ex.lastSetRpe);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    onExercisePress(ex.exerciseId);
  }, [onExercisePress, ex.exerciseId]);

  return (
    <AnimatedPressable
      className="bg-surface border border-border rounded-xl p-4 mb-3"
      style={animatedStyle}
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withSpring(0.97);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
    >
      <View className="flex-row items-start">
        <LinearGradient
          colors={[colors.indigo + '30', colors.indigo + '10']}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            marginTop: 2,
          }}
        >
          <Text className="text-indigo text-xs font-bold">{index + 1}</Text>
        </LinearGradient>
        <View className="flex-1">
          <Text className="text-text-primary font-semibold">
            {ex.exerciseName}
          </Text>
          <View className="flex-row flex-wrap mt-2 gap-2">
            <Badge
              label={`${ex.workingSets} \u00d7 ${formatTarget(ex.targetReps, ex.unit)}`}
              color={colors.indigo}
            />
            {startWeight && <Badge label={startWeight} color={colors.text.secondary} />}
            {rpe && <Badge label={rpe} color={colors.text.muted} />}
            {ex.warmupSets > 0 && (
              <Badge label={`${ex.warmupSets} warmup`} color={colors.text.muted} />
            )}
            {ex.restSeconds > 0 && (
              <Badge
                label={`${Math.floor(ex.restSeconds / 60)}:${String(
                  ex.restSeconds % 60
                ).padStart(2, '0')} rest`}
                color={colors.text.muted}
              />
            )}
            {ex.intensityTechnique && (
              <Badge label={ex.intensityTechnique} color={colors.purple} />
            )}
          </View>
          {ex.notes && (
            <Text className="text-text-muted text-xs mt-2">{ex.notes}</Text>
          )}
        </View>
        {ex.videoUrl && (
          <Ionicons
            name="play-circle-outline"
            size={22}
            color={colors.indigo}
            style={{ marginLeft: 8, opacity: 0.8 }}
          />
        )}
      </View>
    </AnimatedPressable>
  );
});
