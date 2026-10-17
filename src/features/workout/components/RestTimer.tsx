// SPDX-License-Identifier: GPL-3.0-or-later
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '@shared/theme';
import {
  TIMER_STROKE,
  REST_TIMER_INCREMENT_MS,
} from '../types';

const BANNER_TIMER_SIZE = 44;
const BANNER_TIMER_RADIUS = (BANNER_TIMER_SIZE - TIMER_STROKE) / 2;
const BANNER_CIRCUMFERENCE = 2 * Math.PI * BANNER_TIMER_RADIUS;

interface RestTimerProps {
  restRemaining: number;
  timerProgress: number;
  pulseStyle: AnimatedStyle;
  bottomInset: number;
  onSkip: () => void;
  onAddTime: (ms: number) => void;
}

export function RestTimer({
  restRemaining,
  timerProgress,
  pulseStyle,
  bottomInset,
  onSkip,
  onAddTime,
}: RestTimerProps) {
  const strokeDashoffset = BANNER_CIRCUMFERENCE - timerProgress * BANNER_CIRCUMFERENCE;
  const minutes = Math.floor(restRemaining / 60);
  const seconds = String(restRemaining % 60).padStart(2, '0');

  return (
    <View style={[styles.banner, { bottom: bottomInset + 70 }]}>
      {/* Circular timer */}
      <View style={styles.timerContainer}>
        <Svg
          width={BANNER_TIMER_SIZE}
          height={BANNER_TIMER_SIZE}
          style={StyleSheet.absoluteFill}
        >
          <Circle
            cx={BANNER_TIMER_SIZE / 2}
            cy={BANNER_TIMER_SIZE / 2}
            r={BANNER_TIMER_RADIUS}
            stroke={colors.border.default}
            strokeWidth={TIMER_STROKE}
            fill="none"
          />
          <Circle
            cx={BANNER_TIMER_SIZE / 2}
            cy={BANNER_TIMER_SIZE / 2}
            r={BANNER_TIMER_RADIUS}
            stroke={colors.indigo}
            strokeWidth={TIMER_STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={BANNER_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            rotation="-90"
            origin={`${BANNER_TIMER_SIZE / 2}, ${BANNER_TIMER_SIZE / 2}`}
          />
        </Svg>
        <Animated.Text style={[styles.timerText, pulseStyle]}>
          {minutes}:{seconds}
        </Animated.Text>
      </View>

      {/* Label */}
      <Text style={styles.restLabel}>Rest</Text>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => onAddTime(REST_TIMER_INCREMENT_MS)}
          style={({ pressed }: { pressed: boolean }) => [
            styles.addButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.addText}>+30s</Text>
        </Pressable>
        <Pressable
          onPress={onSkip}
          style={({ pressed }: { pressed: boolean }) => [
            styles.skipButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.indigo + '40',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 10,
    shadowColor: colors.indigo,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  timerContainer: {
    width: BANNER_TIMER_SIZE,
    height: BANNER_TIMER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  restLabel: {
    color: colors.text.muted,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.bg.elevated,
  },
  addText: {
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.indigo + '20',
  },
  skipText: {
    color: colors.indigoLight,
    fontSize: 12,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
