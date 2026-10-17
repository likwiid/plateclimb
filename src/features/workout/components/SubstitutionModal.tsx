// SPDX-License-Identifier: GPL-3.0-or-later
import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from 'react-native';

interface SubstitutionModalProps {
  visible: boolean;
  substitutions: { exerciseId: number; exerciseName: string; priority: number }[];
  bottomInset: number;
  onSelect: (sub: { exerciseId: number; exerciseName: string }) => void;
  onClose: () => void;
}

export function SubstitutionModal({
  visible,
  substitutions,
  bottomInset,
  onSelect,
  onClose,
}: SubstitutionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View
          className="bg-surface rounded-t-3xl p-6"
          style={{ paddingBottom: Math.max(bottomInset, 16) + 8 }}
        >
          <Text className="text-text-primary text-lg font-bold mb-4">
            Swap Exercise
          </Text>
          {substitutions.length === 0 ? (
            <Text className="text-text-muted py-4">
              No substitutions available
            </Text>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 320 }}>
              {substitutions.map((sub) => (
                <Pressable
                  key={sub.exerciseId}
                  onPress={() => onSelect(sub)}
                  className="bg-surface-elevated rounded-xl p-4 mb-3"
                  style={({ pressed }: { pressed: boolean }) => [
                    pressed && styles.subPressed,
                  ]}
                >
                  <Text className="text-text-primary font-medium">
                    {sub.exerciseName}
                  </Text>
                  <Text className="text-text-muted text-xs mt-1">
                    {sub.priority === 0 ? 'Original exercise' : `Option ${sub.priority}`}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
          <Pressable onPress={onClose} className="py-3 items-center mt-2">
            <Text className="text-text-muted font-medium">Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  subPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
});
