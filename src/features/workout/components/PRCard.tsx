// SPDX-License-Identifier: GPL-3.0-or-later
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@shared/theme';
import { triggerLight } from '@shared/utils/haptics';

export interface PRCardData {
  id: string;
  title: string;
  message: string;
}

interface Props {
  card: PRCardData;
  onDismiss: () => void;
}

/** Banner shown on the workout screen when a set beats the previous best weight. */
export function PRCard({ card, onDismiss }: Props) {
  const accentColor = colors.pink;

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(15)}
      exiting={FadeOutUp.duration(200)}
      className="mx-4 mb-3 rounded-xl overflow-hidden"
      style={{
        borderWidth: 1,
        borderColor: accentColor + '40',
        backgroundColor: accentColor + '0A',
      }}
    >
      <View className="flex-row items-start px-3 py-3">
        <Pressable
          onPress={() => {
            triggerLight();
            onDismiss();
          }}
          className="w-7 h-7 items-center justify-center mr-1"
          hitSlop={8}
        >
          <Ionicons name="close" size={16} color={colors.text.dim} />
        </Pressable>

        <View
          className="w-7 h-7 rounded-full items-center justify-center mr-2.5 mt-0.5"
          style={{ backgroundColor: accentColor + '20' }}
        >
          <Ionicons name="trophy" size={14} color={accentColor} />
        </View>

        <View className="flex-1">
          <Text className="text-xs font-semibold mb-1" style={{ color: accentColor }}>
            {card.title}
          </Text>
          <Text className="text-sm" style={{ color: colors.text.secondary }}>
            {card.message}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
