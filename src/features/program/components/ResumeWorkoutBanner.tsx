// SPDX-License-Identifier: GPL-3.0-or-later
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@shared/theme';
import { triggerNavigation } from '@shared/utils/haptics';

interface ResumeWorkoutBannerProps {
  onPress: () => void;
}

export function ResumeWorkoutBanner({ onPress }: ResumeWorkoutBannerProps) {
  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <Pressable
        onPress={() => {
          triggerNavigation();
          onPress();
        }}
        style={({ pressed }: { pressed: boolean }) => [
          pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        ]}
      >
        <LinearGradient
          colors={[colors.indigo + '33', colors.indigo + '0D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="mx-4 mt-4 border border-indigo rounded-xl p-4 flex-row items-center"
        >
          <Ionicons name="play-circle" size={24} color={colors.indigo} />
          <View className="ml-3 flex-1">
            <Text className="text-text-primary font-semibold">
              Resume Workout
            </Text>
            <Text className="text-text-secondary text-sm">
              You have an unfinished session
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.indigo} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}
