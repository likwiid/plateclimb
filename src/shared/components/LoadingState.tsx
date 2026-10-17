// SPDX-License-Identifier: GPL-3.0-or-later
import React from 'react';
import { View, ActivityIndicator } from 'react-native';

import { colors } from '@shared/theme';

interface LoadingStateProps {
  size?: 'small' | 'large';
  color?: string;
}

export function LoadingState({
  size = 'large',
  color = colors.indigo,
}: LoadingStateProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg.base,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}
