// SPDX-License-Identifier: GPL-3.0-or-later
import { useState } from 'react';
import { View, Text, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getExerciseImageUrlByName } from '@data/exerciseImages';
import { colors } from '@shared/theme';

interface ExerciseImageProps {
  name: string;
}

/**
 * Start position photo from free-exercise-db. Falls back to a bundled icon
 * when the exercise has no photo or the device is offline.
 */
export function ExerciseImage({ name }: ExerciseImageProps) {
  const uri = getExerciseImageUrlByName(name);
  const [failed, setFailed] = useState(false);
  // Size the frame to the photo itself so it never gets letterbox bars.
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const showPhoto = uri !== null && !failed;

  return (
    <View
      className="mx-4 mt-4 overflow-hidden rounded-2xl"
      style={Platform.select({
        ios: {
          shadowColor: colors.bg.black,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: { elevation: 6 },
        default: {},
      })}
    >
      {showPhoto ? (
        <View className="w-full bg-surface" style={{ aspectRatio }}>
          <Image
            source={{ uri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
            onLoad={(e) => {
              const { width, height } = e.nativeEvent.source;
              if (width > 0 && height > 0) setAspectRatio(width / height);
            }}
            onError={() => setFailed(true)}
            accessibilityLabel={`${name} start position`}
          />
        </View>
      ) : (
        <View className="w-full aspect-video bg-surface items-center justify-center">
          <Ionicons name="barbell-outline" size={48} color={colors.text.muted} />
          <Text className="text-text-muted mt-2">No photo available</Text>
        </View>
      )}
    </View>
  );
}
