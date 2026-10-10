import React from 'react';
import { View, Image, ImageStyle, ViewStyle, StyleProp } from 'react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Text } from './Text';

type Props = {
  uri?: string | null;
  name: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function Avatar({ uri, name, size = 44, style }: Props) {
  const theme = useAppTheme();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[{ width: size, height: size, borderRadius: size / 2 }, style as StyleProp<ImageStyle>]}
      />
    );
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.primaryMuted,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text variant="label" color="brand" style={{ fontSize: size * 0.38 }}>
        {initials(name)}
      </Text>
    </View>
  );
}
