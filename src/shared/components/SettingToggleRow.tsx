// SPDX-License-Identifier: GPL-3.0-or-later
import { View, Text, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { triggerLight } from '@shared/utils/haptics';
import { colors } from '@shared/theme';

interface SettingToggleRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** Additional bottom margin class. Defaults to "mb-3". */
  className?: string;
}

export function SettingToggleRow({
  icon,
  label,
  value,
  onValueChange,
  className = 'mb-3',
}: SettingToggleRowProps) {
  return (
    <View
      className={`bg-surface border border-border rounded-xl p-4 flex-row items-center justify-between ${className}`}
    >
      <View className="flex-row items-center">
        <Ionicons
          name={icon}
          size={20}
          color={colors.text.secondary}
          style={{ marginRight: 10 }}
        />
        <Text className="text-text-primary font-medium">{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(val) => {
          triggerLight();
          onValueChange(val);
        }}
        trackColor={{ false: colors.border.default, true: colors.indigo }}
        thumbColor={colors.text.primary}
      />
    </View>
  );
}
