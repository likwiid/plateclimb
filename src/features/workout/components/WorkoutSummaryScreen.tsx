// SPDX-License-Identifier: GPL-3.0-or-later
import { View, Text, ScrollView, Platform, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { AnimatedStatCard } from './AnimatedStatCard';
import { ConfettiDot } from './ConfettiDot';
import { useWorkoutSummary, EXERCISE_COLORS } from '../hooks/useWorkoutSummary';

import { AnimatedPressable } from '@shared/components';
import { routes } from '@shared/constants';
import { useResponsive } from '@shared/hooks';
import { colors } from '@shared/theme';
import { triggerLight } from '@shared/utils';

// ─── Constants ────────────────────────────────────────────────────────────

const SUCCESS_ICON_SIZE = 64;
const DONE_BUTTON_RADIUS = 16;
const EXERCISE_SIDE_WIDTH = 4;

// ─── Types ────────────────────────────────────────────────────────────────

interface WorkoutSummaryScreenProps {
  sessionId: number;
}

// ─── Component ────────────────────────────────────────────────────────────

export function WorkoutSummaryScreen({ sessionId }: WorkoutSummaryScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cardPadding, buttonHeight } = useResponsive();

  const {
    summary,
    weightUnit,
    confettiDots,
  } = useWorkoutSummary(sessionId);

  const doneScale = useSharedValue(1);
  const doneStyle = useAnimatedStyle(() => ({
    transform: [{ scale: doneScale.value }],
  }));

  if (!summary) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-text-muted">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      {/* Success Header */}
      <View className="items-center pt-8 pb-4" style={{ minHeight: 100 }}>
        {confettiDots.map((dot, i) => (
          <ConfettiDot key={i} delay={dot.delay} x={dot.x} y={dot.y} color={dot.color} />
        ))}
        <Animated.View entering={ZoomIn.delay(100).springify()}>
          <View className="items-center justify-center" style={summaryStyles.successIcon}>
            <Ionicons name="checkmark-circle" size={44} color={colors.success} />
          </View>
        </Animated.View>
        <Animated.Text
          entering={FadeIn.delay(300).duration(500)}
          className="text-text-primary text-2xl font-bold mt-4"
        >
          Workout Complete!
        </Animated.Text>
      </View>

      {/* Stats cards */}
      <View className="px-4 flex-row gap-3">
        <AnimatedStatCard
          label="Sets"
          targetValue={summary.completedSets}
          icon="checkmark-circle-outline"
          index={0}
        />
        <AnimatedStatCard
          label="Volume"
          targetValue={Math.round(summary.totalVolume)}
          sublabel={weightUnit}
          icon="barbell-outline"
          index={1}
        />
      </View>

      {summary.skippedSets > 0 && (
        <View className="mx-4 mt-3 bg-warning/10 border border-warning/30 rounded-xl p-3">
          <Text className="text-warning text-sm">
            {summary.skippedSets} set{summary.skippedSets > 1 ? 's' : ''}{' '}
            skipped
            {summary.skippedWarmupSets > 0 && summary.skippedWorkingSets === 0
              ? ' (warmups)'
              : summary.skippedWarmupSets > 0
              ? ` (${summary.skippedWarmupSets} warmup, ${summary.skippedWorkingSets} working)`
              : ''}
          </Text>
        </View>
      )}

      {/* Per-exercise breakdown */}
      <View className="px-4 mt-6">
        <Text className="text-text-muted text-xs uppercase tracking-wider mb-3">
          Exercise Breakdown
        </Text>
        {summary.exercises.map((ex, i) => {
          const sideColor = EXERCISE_COLORS[i % EXERCISE_COLORS.length];
          return (
            <Animated.View
              key={i}
              entering={FadeInDown.delay(i * 80 + 300).springify()}
              className="bg-surface border border-border rounded-xl mb-3 overflow-hidden"
            >
              <View className="flex-row">
                <View
                  style={[summaryStyles.exerciseSide, { backgroundColor: sideColor }]}
                />
                <View className="flex-1" style={{ padding: cardPadding }}>
                  <Text className="text-text-primary font-semibold mb-2">
                    {ex.exerciseName}
                  </Text>
                  {ex.sets.map((set, j) => (
                    <View key={j} className="flex-row items-center py-1.5">
                      <Text className="text-text-muted w-8 text-sm">
                        {set.setNumber}
                      </Text>
                      {set.skipped ? (
                        <Text className="text-text-muted text-sm italic">
                          Skipped
                        </Text>
                      ) : (
                        <Text className="text-text-primary text-sm flex-1">
                          {set.weight ?? '--'} {weightUnit} x{' '}
                          {set.reps ?? '--'}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>
          );
        })}
      </View>

      {/* Done button */}
      <View className="px-4 pt-6" style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}>
        <AnimatedPressable
          style={doneStyle}
          onPressIn={() => {
            doneScale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
          }}
          onPressOut={() => {
            doneScale.value = withSpring(1, { damping: 12, stiffness: 200 });
          }}
          onPress={() => {
            triggerLight();
            router.replace(routes.tabs);
          }}
        >
          <LinearGradient
            colors={[colors.indigo, colors.indigoDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              summaryStyles.doneButton,
              { height: buttonHeight },
              Platform.select({
                ios: {
                  shadowColor: colors.indigo,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                },
                android: { elevation: 6 },
                default: {},
              }),
            ]}
          >
            <Text style={summaryStyles.doneButtonText}>Done</Text>
          </LinearGradient>
        </AnimatedPressable>
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const summaryStyles = StyleSheet.create({
  successIcon: {
    width: SUCCESS_ICON_SIZE,
    height: SUCCESS_ICON_SIZE,
    borderRadius: SUCCESS_ICON_SIZE / 2,
    backgroundColor: colors.success + '26',
  },
  exerciseSide: {
    width: EXERCISE_SIDE_WIDTH,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  doneButton: {
    borderRadius: DONE_BUTTON_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: colors.text.white,
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.3,
  },
});
