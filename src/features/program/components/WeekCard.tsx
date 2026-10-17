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

import { AnimatedPressable } from '@shared/components';
import type { WeekRow } from '@shared/db/repositories/programRepo';
import { colors } from '@shared/theme';

import { ProgressRing } from './ProgressRing';

interface WeekCardProps {
  week: WeekRow;
  isCurrent: boolean;
  onWeekPress: (weekNumber: number) => void;
}

export const WeekCard = React.memo(function WeekCard({
  week,
  isCurrent,
  onWeekPress,
}: WeekCardProps) {
  const progress =
    week.totalDays > 0 ? week.completedDays / week.totalDays : 0;

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    onWeekPress(week.weekNumber);
  }, [onWeekPress, week.weekNumber]);

  const cardContent = (
    <View className="flex-row items-center justify-between">
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className="text-text-primary font-semibold text-base">
            Week {week.weekNumber}
          </Text>
          {isCurrent && (
            <View className="ml-2 bg-indigo px-2 py-0.5 rounded-full">
              <Text className="text-white text-xs font-medium">Current</Text>
            </View>
          )}
          {week.isDeload && (
            <View className="ml-2 bg-success/20 px-2 py-0.5 rounded-full">
              <Text className="text-success text-xs font-medium">Week off</Text>
            </View>
          )}
        </View>
        <Text className="text-text-secondary text-sm mt-1">
          {weekSummary(week)}
        </Text>
      </View>
      <View className="items-center mr-2">
        <ProgressRing progress={progress} />
        <Text className="text-text-muted text-[10px] mt-1">
          {week.completedDays}/{week.totalDays}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.text.muted}
      />
    </View>
  );

  if (isCurrent) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={() => {
          scale.value = withSpring(0.97);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        style={[
          animatedStyle,
          {
            marginBottom: 12,
            borderRadius: 12,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.indigo,
            shadowColor: colors.indigo,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          },
        ]}
      >
        <LinearGradient
          colors={[colors.indigo + '20', colors.indigo + '0A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 16, backgroundColor: colors.bg.surface }}
        >
          {cardContent}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withSpring(0.97);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      className="mb-3 rounded-xl p-4 border bg-surface border-border"
      style={animatedStyle}
    >
      {cardContent}
    </AnimatedPressable>
  );
});

/** "3 lifting, 3 cardio, 1 rest", or "No lifting, 3 cardio" for the week off. */
function weekSummary(week: WeekRow): string {
  const rest = week.totalDays - week.liftingDays - week.cardioDays;
  const parts = [
    week.liftingDays > 0 ? `${week.liftingDays} lifting` : 'No lifting',
    week.cardioDays > 0 ? `${week.cardioDays} cardio` : null,
    rest > 0 ? `${rest} rest` : null,
  ];
  return parts.filter(Boolean).join(', ');
}
