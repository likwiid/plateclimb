// SPDX-License-Identifier: GPL-3.0-or-later
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';

import { getExerciseById } from '@shared/db/repositories/exerciseRepo';
import { useResponsive } from '@shared/hooks';
import { colors } from '@shared/theme';

import { ExerciseImage } from './ExerciseImage';
import { ExerciseInfoPills } from './ExerciseInfoPills';
import { FormCuesCard } from './FormCuesCard';

// ── Types ─────────────────────────────────────────────────────────────

interface ExerciseData {
  id: number;
  name: string;
  videoUrl: string | null;
  muscleGroup: string;
  equipment: string;
  notes: string | null;
}

// ── Component ─────────────────────────────────────────────────────────

export default function ExerciseDetailScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const [exercise, setExercise] = useState<ExerciseData | null>(null);

  const { cardPadding } = useResponsive();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    async function load() {
      const ex = await getExerciseById(parseInt(exerciseId!, 10));
      setExercise(ex);
    }
    load();
  }, [exerciseId]);

  if (!exercise) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-text-muted">Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: exercise.name }} />
      <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
        <ExerciseImage name={exercise.name} />

        <ExerciseInfoPills
          muscleGroup={exercise.muscleGroup}
          equipment={exercise.equipment}
        />

        {exercise.videoUrl ? (
          <View className="px-4 mb-4">
            <Pressable
              accessibilityRole="link"
              onPress={() => Linking.openURL(exercise.videoUrl!).catch(() => {})}
              style={({ pressed }) => [styles.videoButton, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="logo-youtube" size={20} color={colors.text.primary} />
              <Text style={styles.videoText}>Watch a form video</Text>
              <Ionicons name="open-outline" size={16} color={colors.text.muted} />
            </Pressable>
          </View>
        ) : null}

        {exercise.notes && (
          <FormCuesCard
            notes={exercise.notes}
            padding={cardPadding}
          />
        )}

        <View style={{ height: Math.max(insets.bottom, 16) + 8 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.surface,
  },
  videoText: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
