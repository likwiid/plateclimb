// SPDX-License-Identifier: GPL-3.0-or-later
import React from 'react';
import { View, Text } from 'react-native';

import { colors } from '@shared/theme';

interface StatusPillProps {
  label: string;
  color?: string;
}

export const StatusPill = React.memo(function StatusPill({
  label,
  color = colors.indigo,
}: StatusPillProps) {
  return (
    <View
      style={{
        backgroundColor: color,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        marginLeft: 8,
      }}
    >
      <Text style={{ color: colors.text.white, fontSize: 11, fontWeight: '700' }}>
        {label}
      </Text>
    </View>
  );
});
