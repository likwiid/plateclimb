// SPDX-License-Identifier: GPL-3.0-or-later
import React, { useEffect, useMemo } from 'react';
import { View, Text } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { AnimatedPressable, SectionHeader } from '@shared/components';
import { colors } from '@shared/theme';
import { triggerSelection } from '@shared/utils/haptics';
const WEEK_CIRCLE_SIZE = 44;

// ── Week Grid Item ────────────────────────────────────────────────────

function WeekGridItem({
  week,
  isSelected,
  onPress,
}: {
  week: number;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(isSelected ? 1.05 : 1);

  useEffect(() => {
    scale.value = withSpring(isSelected ? 1.05 : 1, {
      damping: 15,
      stiffness: 200,
    });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[animatedStyle, { width: '25%' }]}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={() => {
        triggerSelection();
        onPress();
      }}
      className="items-center py-3"
    >
      <View
        style={{
          width: WEEK_CIRCLE_SIZE,
          height: WEEK_CIRCLE_SIZE,
          borderRadius: WEEK_CIRCLE_SIZE / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isSelected ? colors.indigo : 'transparent',
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? colors.indigoLight : colors.border.default,
        }}
      >
        <Text
          className={`font-bold text-sm ${
            isSelected ? 'text-white' : 'text-text-secondary'
          }`}
        >
          {week}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

// ── Week Selector ─────────────────────────────────────────────────────

interface WeekSelectorProps {
  totalWeeks: number;
  currentWeek: number;
  onSelectWeek: (week: number) => void;
}

export function WeekSelector({ totalWeeks, currentWeek, onSelectWeek }: WeekSelectorProps) {
  const weeks = useMemo(
    () => Array.from({ length: totalWeeks }, (_, i) => i + 1),
    [totalWeeks]
  );

  return (
    <View>
      <SectionHeader title="Current Week" />
      <View className="bg-surface border border-border rounded-xl overflow-hidden mb-6 py-2">
        <View className="flex-row flex-wrap">
          {weeks.map((week) => (
            <WeekGridItem
              key={week}
              week={week}
              isSelected={currentWeek === week}
              onPress={() => onSelectWeek(week)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
