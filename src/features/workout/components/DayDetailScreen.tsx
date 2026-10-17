// SPDX-License-Identifier: GPL-3.0-or-later
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ExerciseCard } from './ExerciseCard';
import { useDayDetail } from '../hooks/useDayDetail';

import { AnimatedPressable } from '@shared/components';
import { colors } from '@shared/theme';
import { formatDurationShort } from '@shared/utils/format';

// ─── Constants ────────────────────────────────────────────────────────────

const BUTTON_HEIGHT = 56;
const BUTTON_RADIUS = 16;
const COMPLETED_SPACER_HEIGHT = 190;
const DEFAULT_SPACER_HEIGHT = 140;

// ─── Types ────────────────────────────────────────────────────────────────

interface DayDetailScreenProps {
  dayId: string;
}

// ─── Component ────────────────────────────────────────────────────────────

export function DayDetailScreen({ dayId }: DayDetailScreenProps) {
  const insets = useSafeAreaInsets();

  const {
    exercises,
    dayInfo,
    extrasState,
    completedSession,
    incompleteSession,
    extraCategories,
    handleToggleExtra,
    handleStartWorkout,
    handleMarkComplete,
    handleExercisePress,
    handleViewSummary,
  } = useDayDetail(dayId);

  const buttonScale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  function onPressIn() {
    buttonScale.value = withSpring(0.94);
  }
  function onPressOut() {
    buttonScale.value = withSpring(1);
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {dayInfo && (
          <View className="px-4 pt-4 pb-2">
            <Text className="text-text-primary text-2xl font-bold">
              {dayInfo.dayName}
            </Text>
            {dayInfo.focus ? (
              <Text className="text-text-secondary text-sm mt-1">
                {dayInfo.focus}
              </Text>
            ) : null}
            {exercises.length > 0 ? (
              <Text className="text-text-muted text-sm mt-1">
                {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
              </Text>
            ) : null}
          </View>
        )}

        <View className="px-4 pt-2">
          {exercises.map((ex, index) => (
            <Animated.View
              key={ex.programExerciseId}
              entering={FadeInDown.delay(index * 80).springify()}
            >
              <ExerciseCard
                exercise={ex}
                index={index}
                onExercisePress={handleExercisePress}
              />
            </Animated.View>
          ))}
        </View>

        {/* Add Extras Section */}
        {exercises.length > 0 && (
          <View className="px-4 mt-2 mb-4">
            <Text className="text-text-muted text-xs uppercase tracking-wider mb-2">
              Quick Add
            </Text>
            <View className="flex-row gap-3">
              {extraCategories.map((cat) => {
                const isActive = extrasState[cat.key];
                return (
                  <Pressable
                    key={cat.key}
                    onPress={() => handleToggleExtra(cat.key)}
                    style={({ pressed }: { pressed: boolean }) => [
                      dayDetailStyles.extraButton,
                      {
                        borderColor: isActive ? colors.indigo : colors.border.light,
                        backgroundColor: isActive ? colors.indigo + '15' : colors.bg.surface,
                      },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={20}
                      color={isActive ? colors.indigo : colors.text.muted}
                    />
                    <Text
                      style={{
                        color: isActive ? colors.indigoLight : colors.text.secondary,
                        fontWeight: '600',
                        fontSize: 14,
                      }}
                    >
                      {cat.label}
                    </Text>
                    <Ionicons
                      name={isActive ? 'checkmark-circle' : 'add-circle-outline'}
                      size={20}
                      color={isActive ? colors.success : colors.border.light}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: completedSession ? COMPLETED_SPACER_HEIGHT : DEFAULT_SPACER_HEIGHT }} />
      </ScrollView>

      {/* CTA */}
      <View
        className="absolute bottom-0 left-0 right-0 px-4 pt-4 bg-background/90"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        {completedSession ? (
          <CompletedCTA
            completedSession={completedSession}
            exerciseCount={exercises.length}
            buttonAnimatedStyle={buttonAnimatedStyle}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onStartWorkout={handleStartWorkout}
            onViewSummary={handleViewSummary}
          />
        ) : exercises.length === 0 ? (
          <RestDayCTA
            sessionKey={dayInfo?.sessionKey ?? ''}
            buttonAnimatedStyle={buttonAnimatedStyle}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onMarkComplete={handleMarkComplete}
          />
        ) : (
          <WorkoutDayCTA
            incompleteSession={incompleteSession}
            buttonAnimatedStyle={buttonAnimatedStyle}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onStartWorkout={handleStartWorkout}
            onMarkComplete={handleMarkComplete}
          />
        )}
      </View>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────

function CompletedCTA({
  completedSession,
  exerciseCount,
  buttonAnimatedStyle,
  onPressIn,
  onPressOut,
  onStartWorkout,
  onViewSummary,
}: {
  completedSession: { durationSeconds?: number | null };
  exerciseCount: number;
  buttonAnimatedStyle: { transform: { scale: number }[] };
  onPressIn: () => void;
  onPressOut: () => void;
  onStartWorkout: () => void;
  onViewSummary: () => void;
}) {
  return (
    <View>
      <View style={dayDetailStyles.completedBanner}>
        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
        <Text style={dayDetailStyles.completedText}>Completed</Text>
        {completedSession.durationSeconds ? (
          <>
            <Text style={dayDetailStyles.durationText}>
              {formatDurationShort(completedSession.durationSeconds)}
            </Text>
            <Pressable onPress={onViewSummary} style={{ marginLeft: 10, padding: 4 }}>
              <Ionicons name="eye-outline" size={18} color={colors.text.secondary} />
            </Pressable>
          </>
        ) : null}
      </View>
      {exerciseCount > 0 && (
        <AnimatedPressable
          style={[buttonAnimatedStyle, { borderRadius: BUTTON_RADIUS, overflow: 'hidden' }]}
          onPress={onStartWorkout}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <View style={dayDetailStyles.redoButton}>
            <Ionicons name="refresh" size={20} color={colors.text.secondary} />
            <Text style={dayDetailStyles.redoButtonText}>Redo Workout</Text>
          </View>
        </AnimatedPressable>
      )}
    </View>
  );
}

/** How a day without lifts is labelled, from the program's session key. */
function noLiftDay(sessionKey: string): { label: string; icon: React.ComponentProps<typeof Ionicons>['name'] } {
  if (sessionKey.includes('cardio')) return { label: 'Cardio day', icon: 'heart' };
  if (sessionKey === 'week_off') return { label: 'Week off', icon: 'leaf' };
  return { label: 'Rest day', icon: 'moon' };
}

function RestDayCTA({
  sessionKey,
  buttonAnimatedStyle,
  onPressIn,
  onPressOut,
  onMarkComplete,
}: {
  sessionKey: string;
  buttonAnimatedStyle: { transform: { scale: number }[] };
  onPressIn: () => void;
  onPressOut: () => void;
  onMarkComplete: () => void;
}) {
  const { label, icon } = noLiftDay(sessionKey);
  return (
    <View style={{ alignItems: 'center', gap: 12 }}>
      <Ionicons name={icon} size={32} color={colors.text.muted} />
      <Text style={{ color: colors.text.secondary, fontSize: 15, fontWeight: '500' }}>
        {label}
      </Text>
      <AnimatedPressable
        style={[buttonAnimatedStyle, { borderRadius: BUTTON_RADIUS, overflow: 'hidden', width: '100%' }]}
        onPress={onMarkComplete}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <LinearGradient
          colors={[colors.indigoDark, colors.indigo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={dayDetailStyles.gradientButton}
        >
          <Ionicons name="checkmark-circle" size={22} color={colors.text.white} />
          <Text className="text-white font-bold text-lg">Mark Complete</Text>
        </LinearGradient>
      </AnimatedPressable>
    </View>
  );
}

function WorkoutDayCTA({
  incompleteSession,
  buttonAnimatedStyle,
  onPressIn,
  onPressOut,
  onStartWorkout,
  onMarkComplete,
}: {
  incompleteSession: unknown | null;
  buttonAnimatedStyle: { transform: { scale: number }[] };
  onPressIn: () => void;
  onPressOut: () => void;
  onStartWorkout: () => void;
  onMarkComplete: () => void;
}) {
  return (
    <View>
      <AnimatedPressable
        style={[buttonAnimatedStyle, { borderRadius: BUTTON_RADIUS, overflow: 'hidden' }]}
        onPress={onStartWorkout}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <LinearGradient
          colors={incompleteSession ? [colors.warning, colors.warning + 'CC'] : [colors.indigoDark, colors.indigo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={dayDetailStyles.startButton}
        >
          <Ionicons name={incompleteSession ? 'play-circle' : 'play'} size={22} color={colors.text.white} />
          <Text className="text-white font-bold text-lg">
            {incompleteSession ? 'Resume Workout' : 'Start Workout'}
          </Text>
        </LinearGradient>
      </AnimatedPressable>
      {!incompleteSession && (
        <Pressable
          onPress={onMarkComplete}
          style={{ alignItems: 'center', paddingVertical: 12 }}
        >
          <Text style={{ color: colors.text.muted, fontSize: 14, fontWeight: '500' }}>
            Skip Day
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const dayDetailStyles = StyleSheet.create({
  extraButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    minHeight: 52,
    gap: 8,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '10',
    borderWidth: 1,
    borderColor: colors.success + '30',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  completedText: {
    color: colors.success,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  durationText: {
    color: colors.text.muted,
    fontSize: 12,
  },
  redoButton: {
    height: BUTTON_HEIGHT,
    borderRadius: BUTTON_RADIUS,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  redoButtonText: {
    color: colors.text.secondary,
    fontWeight: '700',
    fontSize: 16,
  },
  gradientButton: {
    height: BUTTON_HEIGHT,
    borderRadius: BUTTON_RADIUS,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButton: {
    height: 64,
    borderRadius: BUTTON_RADIUS,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
