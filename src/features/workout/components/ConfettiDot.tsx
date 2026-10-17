// SPDX-License-Identifier: GPL-3.0-or-later
import Animated, { FadeIn } from 'react-native-reanimated';

type ConfettiDotProps = {
  delay: number;
  x: number;
  y: number;
  color: string;
};

export function ConfettiDot({ delay, x, y, color }: ConfettiDotProps) {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(800)}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: color,
        opacity: 0.6,
      }}
    />
  );
}
