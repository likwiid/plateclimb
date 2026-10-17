// SPDX-License-Identifier: GPL-3.0-or-later
import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PROGRAM_NAME, PROGRAM_SUMMARY } from '@data/program';
import { routes } from '@shared/constants';
import { useResponsive } from '@shared/hooks';
import { colors } from '@shared/theme';

import { ResumeWorkoutBanner } from './ResumeWorkoutBanner';
import { BlockSection } from './BlockSection';
import { useProgramData } from '../hooks/useProgramData';

export default function ProgramScreen() {
  const router = useRouter();
  const { isWide } = useResponsive();
  const insets = useSafeAreaInsets();

  const {
    blockGroups,
    currentWeek,
    incompleteSessionId,
    refreshing,
    onRefresh,
  } = useProgramData();

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.indigo}
          colors={[colors.indigo]}
        />
      }
    >
      {incompleteSessionId && (
        <ResumeWorkoutBanner
          onPress={() => router.push(routes.workout(incompleteSessionId))}
        />
      )}

      <View className="mx-4 mt-4">
        <Text className="text-text-muted text-xs uppercase tracking-wider">Your program</Text>
        <Text className="text-text-primary text-xl font-bold mt-1">{PROGRAM_NAME}</Text>
        <Text className="text-text-secondary text-sm mt-1 leading-5">{PROGRAM_SUMMARY}</Text>
      </View>

      {blockGroups.map((group) => {
        const weekNums = group.weeks.map((w) => w.weekNumber).sort((a, b) => a - b);
        const range = weekNums.length === 1
          ? `Week ${weekNums[0]}`
          : `Weeks ${weekNums[0]} to ${weekNums[weekNums.length - 1]}`;
        const detail = group.blockName.startsWith(`${group.blockType} · `)
          ? group.blockName.slice(group.blockType.length + 3)
          : '';
        const subtitle = detail ? `${range} · ${detail}` : range;
        return (
          <BlockSection
            key={group.blockType}
            title={group.blockType}
            subtitle={subtitle}
            weeks={group.weeks}
            currentWeek={currentWeek}
            router={router}
            isWide={isWide}
          />
        );
      })}

      <View style={{ height: insets.bottom + 90 }} />
    </ScrollView>
  );
}
