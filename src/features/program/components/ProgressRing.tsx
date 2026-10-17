// SPDX-License-Identifier: GPL-3.0-or-later
import React from 'react';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@shared/theme';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

export const ProgressRing = React.memo(function ProgressRing({
  progress,
  size = 32,
  strokeWidth = 3,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={colors.border.default}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={colors.indigo}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${circumference}`}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
});
