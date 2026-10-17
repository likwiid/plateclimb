// SPDX-License-Identifier: GPL-3.0-or-later
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PROGRAM_DISCLAIMER } from '@data/program';
import { colors } from '@shared/theme';

interface AppInfoSectionProps {
  exerciseCount: number;
}

export function AppInfoSection({ exerciseCount }: AppInfoSectionProps) {
  return (
    <View className="bg-surface border border-border rounded-xl p-4 mb-6">
      <View className="flex-row items-center mb-3">
        <Ionicons
          name="barbell"
          size={24}
          color={colors.indigo}
          style={{ marginRight: 10 }}
        />
        <View>
          <Text className="text-text-primary font-bold text-lg">
            PlateClimb
          </Text>
          <Text className="text-text-muted text-xs">v1.0.0</Text>
        </View>
      </View>
      <Text className="text-text-secondary text-sm">
        The Foundational Fitness protocol as a free, offline workout app. Built by Likwiid.
      </Text>
      <Text className="text-text-muted text-sm mt-2">
        {exerciseCount} exercises loaded
      </Text>
      <Text className="text-text-muted text-xs mt-2">{PROGRAM_DISCLAIMER}</Text>
    </View>
  );
}
