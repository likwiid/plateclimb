// SPDX-License-Identifier: GPL-3.0-or-later
import { View, Pressable, Text, LayoutChangeEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { triggerLight } from '@shared/utils/haptics';
import { useKeyboardVisible } from '@shared/hooks/useKeyboardVisible';
import { colors } from '@shared/theme';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useState, useEffect, useRef, useMemo } from 'react';

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'barbell-outline',
  settings: 'settings-outline',
};

const TAB_ICONS_ACTIVE: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'barbell',
  settings: 'settings',
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { keyboardVisible } = useKeyboardVisible();
  const [tabWidth, setTabWidth] = useState(0);
  const translateX = useSharedValue(0);
  const prevVisibleIndex = useRef(0);

  // Filter out hidden routes (href: null)
  // expo-router extends BottomTabNavigationOptions with `href?: Href | null`
  const visibleRoutes = useMemo(
    () =>
      state.routes.filter((route) => {
        const { options } = descriptors[route.key];
        return (options as Record<string, unknown>).href !== null;
      }),
    [state.routes, descriptors]
  );

  // Map current state.index to visible index
  const currentVisibleIndex = useMemo(() => {
    const currentRoute = state.routes[state.index];
    return visibleRoutes.findIndex((r) => r.key === currentRoute.key);
  }, [state.index, state.routes, visibleRoutes]);

  // Tab bar visibility animation for keyboard show/hide
  const tabBarOpacity = useSharedValue(1);
  const tabBarTranslateY = useSharedValue(0);

  useEffect(() => {
    if (keyboardVisible) {
      tabBarOpacity.value = withTiming(0, { duration: 200 });
      tabBarTranslateY.value = withTiming(20, { duration: 200 });
    } else {
      tabBarOpacity.value = withTiming(1, { duration: 200 });
      tabBarTranslateY.value = withTiming(0, { duration: 200 });
    }
  }, [keyboardVisible]);

  const tabBarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tabBarOpacity.value,
    transform: [{ translateY: tabBarTranslateY.value }],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Animate indicator when tab changes
  useEffect(() => {
    if (tabWidth > 0 && currentVisibleIndex >= 0) {
      if (prevVisibleIndex.current === currentVisibleIndex) {
        translateX.value = currentVisibleIndex * tabWidth;
      } else {
        translateX.value = withSpring(currentVisibleIndex * tabWidth, {
          damping: 20,
          stiffness: 200,
          mass: 0.8,
        });
      }
      prevVisibleIndex.current = currentVisibleIndex;
    }
  }, [currentVisibleIndex, tabWidth]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    const singleTab = width / visibleRoutes.length;
    setTabWidth(singleTab);
  };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: insets.bottom + 8,
          left: 16,
          right: 16,
        },
        tabBarAnimatedStyle,
      ]}
      pointerEvents={keyboardVisible ? 'none' : 'auto'}
    >
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: 'rgba(20, 20, 25, 0.95)',
          borderRadius: 24,
          borderWidth: 1,
          borderColor: colors.border.default,
          paddingVertical: 8,
          overflow: 'hidden',
        }}
        onLayout={handleLayout}
      >
        {/* Sliding indicator */}
        {tabWidth > 0 && currentVisibleIndex >= 0 && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 6,
                bottom: 6,
                left: 6,
                width: tabWidth - 12,
                backgroundColor: colors.indigo + '20',
                borderRadius: 18,
              },
              indicatorStyle,
            ]}
          />
        )}

        {visibleRoutes.map((route) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = route.key === state.routes[state.index]?.key;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              triggerLight();
              navigation.navigate(route.name, route.params);
            }
          };

          const iconName = isFocused
            ? TAB_ICONS_ACTIVE[route.name] ?? TAB_ICONS[route.name]
            : TAB_ICONS[route.name];

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 6,
              }}
            >
              <Ionicons
                name={iconName ?? 'help-outline'}
                size={26}
                color={isFocused ? colors.indigo : colors.text.muted}
              />
              <Text
                style={{
                  fontSize: 11,
                  marginTop: 2,
                  fontWeight: isFocused ? '600' : '400',
                  color: isFocused ? colors.text.white : colors.text.muted,
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}
