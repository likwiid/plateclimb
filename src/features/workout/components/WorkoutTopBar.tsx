// SPDX-License-Identifier: GPL-3.0-or-later
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { triggerLight } from '@shared/utils/haptics';
import { colors } from '@shared/theme';

interface WorkoutTopBarProps {
  elapsedFormatted: string;
  completedSets: number;
  totalSets: number;
  topInset: number;
  onRestart: () => void;
  onUndo: () => void;
  onFinish: () => void;
}

export function WorkoutTopBar({
  elapsedFormatted,
  completedSets,
  totalSets,
  topInset,
  onRestart,
  onUndo,
  onFinish,
}: WorkoutTopBarProps) {
  return (
    <LinearGradient
      colors={[colors.bg.surface, colors.bg.base]}
      className="px-4 pb-3 flex-row items-center justify-between border-b border-border"
      style={{ paddingTop: topInset + 8 }}
    >
      {/* Left: Restart + Timer */}
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onRestart}
          hitSlop={8}
          className="w-9 h-9 items-center justify-center rounded-lg bg-surface-elevated"
          style={({ pressed }: { pressed: boolean }) => [
            pressed && { opacity: 0.6 },
          ]}
        >
          <Ionicons name="refresh" size={18} color={colors.text.secondary} />
        </Pressable>
        <Text className="text-text-primary font-mono text-lg font-bold">
          {elapsedFormatted}
        </Text>
      </View>

      {/* Center: Set counter */}
      <View className="flex-row items-center gap-2">
        <Text className="text-text-secondary text-sm">
          {completedSets}/{totalSets} sets
        </Text>
      </View>

      {/* Right: Undo + Finish */}
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={onUndo}
          hitSlop={8}
          className="w-9 h-9 items-center justify-center rounded-lg bg-surface-elevated"
          disabled={completedSets === 0}
          style={[{ opacity: completedSets === 0 ? 0.5 : 1 }]}
        >
          <Ionicons
            name="arrow-undo"
            size={18}
            color={completedSets > 0 ? colors.text.secondary : colors.border.default}
          />
        </Pressable>
        <Pressable
          onPress={() => {
            triggerLight();
            onFinish();
          }}
          className="bg-indigo/20 px-4 py-2 rounded-lg"
          style={({ pressed }: { pressed: boolean }) => [
            pressed && styles.finishPressed,
          ]}
        >
          <Text className="text-indigo font-semibold">Finish</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  finishPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
});
