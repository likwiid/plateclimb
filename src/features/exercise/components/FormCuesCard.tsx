// SPDX-License-Identifier: GPL-3.0-or-later
import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@shared/theme';

const ANIMATION_DELAY = 200;

interface FormCuesCardProps {
  notes: string;
  padding: number;
}

export function FormCuesCard({ notes, padding }: FormCuesCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(ANIMATION_DELAY).springify()}
      style={{ paddingHorizontal: padding }}
    >
      <LinearGradient
        colors={[colors.bg.elevated, colors.bg.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border.default,
        }}
      >
        <View style={{ padding }}>
          <View className="flex-row">
            <View
              style={{
                width: 3,
                backgroundColor: colors.indigo,
                borderRadius: 2,
                marginRight: 12,
              }}
            />
            <View className="flex-1">
              <Text className="text-text-muted text-xs uppercase tracking-wider mb-2">
                Form Cues
              </Text>
              <Text className="text-text-primary leading-6">
                {notes}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}
