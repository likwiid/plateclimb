// SPDX-License-Identifier: GPL-3.0-or-later
import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { routes } from '@shared/constants';
import type { WeekRow } from '@shared/db/repositories/programRepo';
import { colors } from '@shared/theme';
import { triggerNavigation } from '@shared/utils/haptics';

import { WeekCard } from './WeekCard';

interface BlockSectionProps {
  title: string;
  subtitle: string;
  weeks: WeekRow[];
  currentWeek: number;
  router: ReturnType<typeof useRouter>;
  isWide: boolean;
}

export function BlockSection({
  title,
  subtitle,
  weeks,
  currentWeek,
  router,
  isWide,
}: BlockSectionProps) {
  const handleWeekPress = useCallback(
    (weekNumber: number) => {
      triggerNavigation();
      router.push(routes.programWeek(weekNumber));
    },
    [router]
  );

  return (
    <View className="mt-6 px-4">
      <View className="mb-3 overflow-hidden rounded-lg">
        <LinearGradient
          colors={[colors.indigo + '20', colors.indigo + '08']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ paddingHorizontal: 12, paddingVertical: 8 }}
        >
          <Text className="text-text-primary text-xl font-bold">{title}</Text>
          <Text className="text-text-muted text-sm">{subtitle}</Text>
        </LinearGradient>
      </View>
      <View
        style={
          isWide
            ? {
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }
            : undefined
        }
      >
        {weeks.map((week, index) => (
          <Animated.View
            key={week.weekNumber}
            entering={FadeInDown.delay(index * 80).springify()}
            style={isWide ? { width: '48%' } : undefined}
          >
            <WeekCard
              week={week}
              isCurrent={week.weekNumber === currentWeek}
              onWeekPress={handleWeekPress}
            />
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
