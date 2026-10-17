// SPDX-License-Identifier: GPL-3.0-or-later
import React from 'react';
import { Text, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@shared/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface EmptyStateAction {
  label: string;
  icon?: IoniconsName;
  onPress: () => void;
}

interface EmptyStateProps {
  icon: IoniconsName;
  iconColor?: string;
  title: string;
  subtitle?: string;
  action?: EmptyStateAction;
}

export function EmptyState({
  icon,
  iconColor = colors.text.dim,
  title,
  subtitle,
  action,
}: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 60,
      }}
    >
      <Ionicons
        name={icon}
        size={48}
        color={iconColor}
        style={{ marginBottom: 16 }}
      />
      <Text
        style={{
          color: colors.text.secondary,
          fontSize: 17,
          fontWeight: '600',
          marginBottom: 6,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {subtitle != null && (
        <Text
          style={{
            color: colors.text.muted,
            fontSize: 14,
            textAlign: 'center',
            marginBottom: action ? 20 : 0,
          }}
        >
          {subtitle}
        </Text>
      )}
      {action && (
        <Pressable
          onPress={action.onPress}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.indigo,
          }}
        >
          {action.icon && (
            <Ionicons name={action.icon} size={16} color={colors.indigo} />
          )}
          <Text style={{ color: colors.indigo, fontSize: 14, fontWeight: '600' }}>
            {action.label}
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
}
