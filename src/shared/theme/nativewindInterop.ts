// SPDX-License-Identifier: GPL-3.0-or-later
import Animated from 'react-native-reanimated';
import { cssInterop } from 'nativewind';

// Reanimated components are not registered with nativewind, so their
// className would be dropped. Map className onto style once at startup.
cssInterop(Animated.View, { className: 'style' });
cssInterop(Animated.Text, { className: 'style' });
cssInterop(Animated.ScrollView, { className: 'style' });
