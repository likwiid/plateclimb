// SPDX-License-Identifier: GPL-3.0-or-later
import { View, Pressable, Modal, Platform, KeyboardAvoidingView, useWindowDimensions, type ViewStyle } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, dimensions } from '@shared/theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Background color of the sheet. Defaults to bg.surface. */
  backgroundColor?: string;
  /** Whether to stop propagation on inner press. Defaults to true. */
  stopPropagation?: boolean;
  /** Max height constraint (e.g. '85%'). No default. */
  maxHeight?: string | number;
  /** Extra bottom padding for safe area. Defaults to true. */
  safeBottom?: boolean;
  /** Wrap in KeyboardAvoidingView for sheets with text inputs. Defaults to false. */
  avoidKeyboard?: boolean;
}

export function BottomSheet({
  visible,
  onClose,
  children,
  backgroundColor = colors.bg.surface,
  stopPropagation = true,
  maxHeight,
  safeBottom = true,
  avoidKeyboard = false,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  // Resolve percentage maxHeight to pixels so Yoga can properly bound the layout.
  // Percentage strings don't resolve when the parent (Animated.View) has no explicit height.
  const resolvedMaxHeight = maxHeight != null
    ? typeof maxHeight === 'string' && maxHeight.endsWith('%')
      ? windowHeight * parseFloat(maxHeight) / 100
      : (maxHeight as number)
    : undefined;

  const content = (
    <Pressable
      style={{
        flex: 1,
        backgroundColor: colors.overlay.medium,
        justifyContent: 'flex-end',
      }}
      onPress={onClose}
    >
      <Animated.View entering={SlideInDown.duration(300)}>
        {/* Use View instead of Pressable so Android scroll gestures inside children
            are not captured by a competing Pressable gesture recognizer.
            onStartShouldSetResponder prevents taps from bubbling to the overlay Pressable. */}
        <View
          onStartShouldSetResponder={stopPropagation ? () => true : undefined}
          style={{
            backgroundColor,
            borderTopLeftRadius: dimensions.bottomSheetRadius,
            borderTopRightRadius: dimensions.bottomSheetRadius,
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: colors.border.default,
            ...(resolvedMaxHeight != null ? { maxHeight: resolvedMaxHeight } : {}),
          } as ViewStyle}
        >
          {/* Handle bar */}
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
            <View
              style={{
                width: dimensions.handleWidth,
                height: dimensions.handleHeight,
                borderRadius: dimensions.handleHeight / 2,
                backgroundColor: colors.border.light,
              }}
            />
          </View>

          {children}

          {/* Safe area spacer - applies to both iOS and Android navigation bars */}
          {safeBottom && insets.bottom > 0 && <View style={{ height: insets.bottom }} />}
        </View>
      </Animated.View>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {avoidKeyboard ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </Modal>
  );
}
