// SPDX-License-Identifier: GPL-3.0-or-later
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

// Reanimated and expo-linear-gradient components are not registered with nativewind, so their
// className would be dropped. Map className onto style once at startup.
cssInterop(Animated.View, { className: 'style' });
cssInterop(Animated.Text, { className: 'style' });
cssInterop(Animated.ScrollView, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });
