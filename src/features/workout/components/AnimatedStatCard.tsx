// SPDX-License-Identifier: GPL-3.0-or-later
import { useState, useEffect, useCallback } from 'react';
import { Text } from 'react-native';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedReaction,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@shared/theme';
import type { IoniconsName } from '@shared/types';

type AnimatedStatCardProps = {
  label: string;
  targetValue: number;
  displayValue?: string;
  sublabel?: string;
  icon: IoniconsName;
  index: number;
};

export function AnimatedStatCard({
  label,
  targetValue,
  displayValue,
  sublabel,
  icon,
  index,
}: AnimatedStatCardProps) {
  const animatedVal = useSharedValue(0);
  const [displayText, setDisplayText] = useState(displayValue === '--' ? '--' : '0');

  const updateText = useCallback((val: number) => {
    if (displayValue === '--') {
      setDisplayText('--');
      return;
    }
    setDisplayText(Math.round(val).toString());
  }, [displayValue]);

  useAnimatedReaction(
    () => animatedVal.value,
    (current) => {
      runOnJS(updateText)(current);
    },
    [updateText]
  );

  useEffect(() => {
    animatedVal.value = withTiming(targetValue, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [targetValue]);

  return (
    <Animated.View
      className="flex-1"
      entering={FadeInUp.delay(index * 100 + 200).springify()}
    >
      <LinearGradient
        colors={[colors.indigo, colors.border.default]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 15, padding: 1 }}
      >
        <LinearGradient
          colors={[colors.bg.surface, '#1a1a24']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 14, padding: 16, alignItems: 'center' }}
        >
          <Ionicons name={icon} size={28} color={colors.indigo} />
          <Text
            style={{
              color: colors.text.primary,
              fontSize: 24,
              fontWeight: '700',
              marginTop: 10,
            }}
          >
            {displayText}
          </Text>
          {sublabel && (
            <Text className="text-text-muted text-xs">{sublabel}</Text>
          )}
          <Text className="text-text-muted text-xs mt-1">{label}</Text>
        </LinearGradient>
      </LinearGradient>
    </Animated.View>
  );
}
