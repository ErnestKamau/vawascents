import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Text, TextColor } from './Text';

type Intent = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'neutral';

type Props = {
  label: string;
  intent?: Intent;
  style?: StyleProp<ViewStyle>;
};

export function Badge({ label, intent = 'brand', style }: Props) {
  const theme = useAppTheme();

  const map: Record<Intent, { bg: string; fg: TextColor }> = {
    brand: { bg: theme.colors.primaryMuted, fg: 'brand' },
    success: { bg: theme.colors.successMuted, fg: 'success' },
    warning: { bg: theme.colors.warningMuted, fg: 'warning' },
    danger: { bg: theme.colors.dangerMuted, fg: 'error' },
    info: { bg: theme.colors.infoMuted, fg: 'info' },
    gold: { bg: theme.colors.goldMuted, fg: 'gold' },
    neutral: { bg: theme.colors.backgroundSecondary, fg: 'secondary' },
  };
  const { bg, fg } = map[intent];

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          paddingHorizontal: theme.spacing[3],
          paddingVertical: theme.spacing[1],
          borderRadius: theme.radius.pill,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text variant="overline" color={fg}>
        {label}
      </Text>
    </View>
  );
}
