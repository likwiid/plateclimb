// SPDX-License-Identifier: GPL-3.0-or-later
import Animated from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { cssInterop } from 'nativewind';

export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Animated components are not registered with nativewind by default, so
// className would be dropped. Map it onto style explicitly.
cssInterop(AnimatedPressable, { className: 'style' });
