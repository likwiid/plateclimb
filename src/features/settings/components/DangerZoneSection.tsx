// SPDX-License-Identifier: GPL-3.0-or-later
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { SectionHeader } from '@shared/components';
import { colors } from '@shared/theme';
import { triggerMedium } from '@shared/utils/haptics';

interface DangerZoneSectionProps {
  onResetPress: () => void;
}

export function DangerZoneSection({ onResetPress }: DangerZoneSectionProps) {
  return (
    <View>
      <SectionHeader title="Danger Zone" />
      <Pressable
        onPress={() => {
          triggerMedium();
          onResetPress();
        }}
        className="bg-surface border border-danger/30 rounded-xl p-4 flex-row items-center mb-6"
        style={({ pressed }: { pressed: boolean }) => [
          pressed && { opacity: 0.7 },
        ]}
      >
        <Ionicons
          name="trash-outline"
          size={20}
          color={colors.error}
          style={{ marginRight: 10 }}
        />
        <View className="flex-1">
          <Text className="text-danger font-medium">Reset All Data</Text>
          <Text className="text-text-muted text-xs mt-0.5">
            Deletes all workouts and progress
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.error} />
      </Pressable>
    </View>
  );
}
