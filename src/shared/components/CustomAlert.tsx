// SPDX-License-Identifier: GPL-3.0-or-later
import { View, Text, Pressable, Modal } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { triggerLight } from '@shared/utils/haptics';
import { colors } from '@shared/theme';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  onDismiss: () => void;
}

export function CustomAlert({ visible, title, message, buttons, onDismiss }: CustomAlertProps) {
  const cancelBtn = buttons.find((b) => b.style === 'cancel');
  const actionBtns = buttons.filter((b) => b.style !== 'cancel');

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      <Animated.View
        entering={FadeIn.duration(150)}
        className="flex-1 items-center justify-center bg-black/60 px-8"
      >
        <Animated.View
          entering={FadeInDown.duration(200).springify()}
          className="w-full bg-surface rounded-2xl overflow-hidden border border-border"
          style={{ maxWidth: 320 }}
        >
          <View className="px-5 pt-5 pb-4">
            <Text className="text-text-primary text-base font-bold text-center">
              {title}
            </Text>
            {message ? (
              <Text className="text-text-muted text-sm text-center mt-2 leading-5">
                {message}
              </Text>
            ) : null}
          </View>

          <View className="border-t border-border">
            {actionBtns.map((btn, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  triggerLight();
                  onDismiss();
                  btn.onPress?.();
                }}
                className="items-center justify-center py-3.5 border-b border-border"
                style={({ pressed }: { pressed: boolean }) => [
                  pressed && { backgroundColor: colors.bg.elevated + '80' },
                ]}
              >
                <Text
                  className="text-base font-semibold"
                  style={{
                    color: btn.style === 'destructive' ? colors.error : colors.indigoLight,
                  }}
                >
                  {btn.text}
                </Text>
              </Pressable>
            ))}

            {cancelBtn && (
              <Pressable
                onPress={() => {
                  triggerLight();
                  onDismiss();
                  cancelBtn.onPress?.();
                }}
                className="items-center justify-center py-3.5"
                style={({ pressed }: { pressed: boolean }) => [
                  pressed && { backgroundColor: colors.bg.elevated + '80' },
                ]}
              >
                <Text className="text-text-muted text-base font-medium">
                  {cancelBtn.text}
                </Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
