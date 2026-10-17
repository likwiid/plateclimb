// SPDX-License-Identifier: GPL-3.0-or-later
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@shared/theme';

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <View className="mb-3">
      <Text className="text-text-muted text-xs uppercase tracking-wider mb-1.5">
        {title}
      </Text>
      <LinearGradient
        colors={[colors.indigo, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 2, borderRadius: 1, width: '40%' }}
      />
    </View>
  );
}
