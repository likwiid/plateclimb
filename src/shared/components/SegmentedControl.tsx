// SPDX-License-Identifier: GPL-3.0-or-later
import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import type { DimensionValue } from 'react-native';

import { colors } from '@shared/theme';
import { triggerSelection } from '@shared/utils/haptics';

interface SegmentedControlProps<T extends string | number> {
  options: T[];
  selected: T;
  onSelect: (value: T) => void;
  renderLabel: (value: T) => string;
}

export function SegmentedControl<T extends string | number>({
  options,
  selected,
  onSelect,
  renderLabel,
}: SegmentedControlProps<T>) {
  const selectedIndex = options.indexOf(selected);
  const indicatorX = useSharedValue(selectedIndex * (1 / options.length) * 100);

  useEffect(() => {
    const idx = options.indexOf(selected);
    indicatorX.value = withSpring(idx * (1 / options.length) * 100, {
      damping: 18,
      stiffness: 200,
    });
  }, [selected, options]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: `${indicatorX.value}%` as DimensionValue,
    width: `${100 / options.length}%` as DimensionValue,
  }));

  return (
    <View className="bg-surface border border-border rounded-xl overflow-hidden mb-6">
      <View className="flex-row" style={{ minHeight: 48 }}>
        <Animated.View
          style={[
            indicatorStyle,
            {
              position: 'absolute',
              top: 4,
              bottom: 4,
              borderRadius: 10,
              backgroundColor: colors.indigo,
            },
          ]}
        />
        {options.map((opt) => (
          <Pressable
            key={String(opt)}
            className="flex-1 py-3 items-center justify-center z-10"
            accessibilityRole="button"
            accessibilityState={{ selected: selected === opt }}
            onPress={() => {
              triggerSelection();
              onSelect(opt);
            }}
          >
            <Text
              className={`font-semibold text-sm ${
                selected === opt ? 'text-white' : 'text-text-secondary'
              }`}
            >
              {renderLabel(opt)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
