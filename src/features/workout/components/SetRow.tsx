// SPDX-License-Identifier: GPL-3.0-or-later
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { ZoomIn, type AnimatedStyle } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { triggerLight } from '@shared/utils/haptics';
import { colors } from '@shared/theme';
import type { SetState } from '../types';
import { ANIM_ZOOM_DURATION } from '../types';

interface SetRowProps {
  set: SetState;
  index: number;
  isCurrent: boolean;
  weightUnit: string;
  /** Animated style applied when this set was just completed */
  pulseStyle?: AnimatedStyle;
  onSelect: () => void;
  onRevert: () => void;
}

export const SetRow = React.memo(function SetRow({
  set,
  index,
  isCurrent,
  weightUnit,
  pulseStyle,
  onSelect,
  onRevert,
}: SetRowProps) {
  const isCompleted = set.completed || set.skipped;
  const isWarmupSet = set.setType === 'warmup';
  const dimStyle = isWarmupSet && !isCurrent && !isCompleted ? styles.dimmed : undefined;

  return (
    <Animated.View style={pulseStyle}>
      <Pressable
        onPress={() => {
          if (isCompleted) {
            onRevert();
          } else {
            triggerLight();
            onSelect();
          }
        }}
        className={`flex-row items-center py-3 rounded-xl mb-2 ${
          isCurrent
            ? 'bg-indigo/10'
            : isCompleted
              ? 'bg-surface/50'
              : isWarmupSet
                ? 'bg-surface/30 border border-border/50'
                : 'bg-surface border border-border'
        }`}
        // Every state sets all four border widths. On Android, a row that
        // drops the current set's thicker left border without resetting it
        // kept a stale clip and drew its text invisible until remounted.
        style={[
          { paddingRight: 16 },
          isCurrent ? styles.currentSetBorder : isCompleted ? styles.noBorder : styles.plainBorder,
        ]}
      >
        {/* Set number */}
        <Text
          className={`w-6 text-sm font-bold ${
            isCompleted
              ? 'text-text-muted'
              : isWarmupSet
                ? 'text-text-muted'
                : 'text-text-secondary'
          }`}
          style={dimStyle}
        >
          {index + 1}
        </Text>

        {/* Warmup indicator */}
        <Text
          className={`w-8 text-xs ${
            set.setType === 'warmup' ? 'text-warning' : 'text-text-muted'
          }`}
          style={dimStyle}
        >
          {set.setType === 'warmup' ? 'W' : ''}
        </Text>

        {/* Weight x Reps */}
        <View className="flex-1 flex-row items-center">
          <Text
            numberOfLines={1}
            className={`text-sm ${
              isCompleted
                ? 'text-text-muted'
                : isWarmupSet
                  ? 'text-text-secondary'
                  : 'text-text-primary'
            }`}
            style={dimStyle}
          >
            {set.weight} {weightUnit} x {set.reps}
          </Text>
        </View>

        {/* Completion icon */}
        {isCompleted && (
          <Animated.View entering={ZoomIn.duration(ANIM_ZOOM_DURATION).springify()}>
            <Ionicons
              name={set.skipped ? 'close-circle' : 'checkmark-circle'}
              size={20}
              color={set.skipped ? colors.text.muted : colors.success}
              style={[
                styles.checkIcon,
                !set.skipped && styles.checkGlow,
              ]}
            />
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  dimmed: {
    opacity: 0.6,
  },
  currentSetBorder: {
    borderWidth: 1,
    borderColor: colors.indigo,
    borderLeftWidth: 4,
    paddingLeft: 12,
  },
  noBorder: {
    borderWidth: 0,
    borderLeftWidth: 0,
    paddingLeft: 16,
  },
  plainBorder: {
    borderWidth: 1,
    borderLeftWidth: 1,
    paddingLeft: 16,
  },
  checkIcon: {
    marginLeft: 8,
  },
  checkGlow: {
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
});
