// SPDX-License-Identifier: GPL-3.0-or-later
import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  color: string;
}

export const Badge = React.memo(function Badge({ label, color }: BadgeProps) {
  return (
    <View
      className="px-2.5 py-1 rounded-full"
      style={{
        backgroundColor: color + '18',
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Text style={{ color, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </View>
  );
});
