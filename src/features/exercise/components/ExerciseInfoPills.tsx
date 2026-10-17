// SPDX-License-Identifier: GPL-3.0-or-later
import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@shared/theme';
import type { IoniconsName } from '@shared/types';

// ── Muscle Icon Mapping ───────────────────────────────────────────────

const MUSCLE_ICONS: Record<string, IoniconsName> = {
  chest: 'body-outline',
  back: 'arrow-down-outline',
  shoulders: 'chevron-up-circle-outline',
  legs: 'walk-outline',
  quads: 'walk-outline',
  hamstrings: 'walk-outline',
  glutes: 'walk-outline',
  calves: 'walk-outline',
  biceps: 'fitness-outline',
  triceps: 'fitness-outline',
  arms: 'fitness-outline',
  core: 'ellipse-outline',
  abs: 'ellipse-outline',
};

function getMuscleIcon(muscleGroup: string): IoniconsName {
  const key = muscleGroup.toLowerCase();
  for (const [k, v] of Object.entries(MUSCLE_ICONS)) {
    if (key.includes(k)) return v;
  }
  return 'body-outline';
}

/** "Other" says nothing useful, so it gets no pill. */
function isKnown(value: string): boolean {
  return value !== '' && value.toLowerCase() !== 'other';
}

// ── Component ─────────────────────────────────────────────────────────

const ANIMATION_DELAY = 100;

interface ExerciseInfoPillsProps {
  muscleGroup: string;
  equipment: string;
}

export function ExerciseInfoPills({ muscleGroup, equipment }: ExerciseInfoPillsProps) {
  return (
    <Animated.View entering={FadeInDown.delay(ANIMATION_DELAY).springify()} className="px-4 mt-4">
      <View className="flex-row gap-2 mb-4">
        {isKnown(muscleGroup) ? (
          <View className="bg-indigo/20 px-4 py-2 rounded-full flex-row items-center">
            <Ionicons
              name={getMuscleIcon(muscleGroup)}
              size={16}
              color={colors.indigoLight}
              style={{ marginRight: 6 }}
            />
            <Text className="text-indigo-light text-sm font-medium">{muscleGroup}</Text>
          </View>
        ) : null}
        {isKnown(equipment) ? (
          <View className="bg-surface-elevated px-4 py-2 rounded-full flex-row items-center">
            <Ionicons
              name="barbell-outline"
              size={16}
              color={colors.text.secondary}
              style={{ marginRight: 6 }}
            />
            <Text className="text-text-secondary text-sm font-medium">{equipment}</Text>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}
