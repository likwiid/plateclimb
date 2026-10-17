// SPDX-License-Identifier: GPL-3.0-or-later
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@shared/theme';
import type { WorkoutExercise } from '../types';

interface ExerciseNavigatorProps {
  exercises: WorkoutExercise[];
  currentExIdx: number;
  bottomInset: number;
  keyboardVisible: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoToExercise: (idx: number) => void;
}

export function ExerciseNavigator({
  exercises,
  currentExIdx,
  bottomInset,
  keyboardVisible,
  onPrev,
  onNext,
  onGoToExercise,
}: ExerciseNavigatorProps) {
  const isFirst = currentExIdx === 0;
  const isLast = currentExIdx === exercises.length - 1;

  return (
    <View
      className="flex-row items-center justify-between px-4 py-3 bg-surface border-t border-border"
      style={{ paddingBottom: keyboardVisible ? 8 : Math.max(bottomInset, 8) }}
    >
      {/* Prev button */}
      <Pressable
        onPress={onPrev}
        disabled={isFirst}
        className="w-14 h-14 items-center justify-center rounded-xl bg-surface-elevated"
        style={({ pressed }: { pressed: boolean }) => [
          pressed && !isFirst && styles.navPressed,
        ]}
      >
        <Ionicons
          name="chevron-back"
          size={28}
          color={isFirst ? colors.border.default : colors.text.primary}
        />
      </Pressable>

      {/* Progress dots */}
      <View className="flex-row gap-1.5 items-center">
        {exercises.map((ex, idx) => {
          const allCompleted = ex.sets.every(
            (s) => s.completed || s.skipped
          );
          const isCurrent = idx === currentExIdx;
          return (
            <Pressable
              key={idx}
              onPress={() => onGoToExercise(idx)}
              hitSlop={8}
              style={{ padding: 4 }}
            >
              <View
                className={`rounded-full ${
                  isCurrent
                    ? 'w-3 h-3 bg-indigo'
                    : allCompleted
                      ? 'w-2.5 h-2.5 bg-success'
                      : 'w-2.5 h-2.5 bg-border'
                }`}
              />
            </Pressable>
          );
        })}
      </View>

      {/* Next button */}
      <Pressable
        onPress={onNext}
        disabled={isLast}
        className="w-14 h-14 items-center justify-center rounded-xl bg-surface-elevated"
        style={({ pressed }: { pressed: boolean }) => [
          pressed && !isLast && styles.navPressed,
        ]}
      >
        <Ionicons
          name="chevron-forward"
          size={28}
          color={isLast ? colors.border.default : colors.text.primary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  navPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
