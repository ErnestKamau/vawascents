import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useAppTheme } from '@/contexts/ThemeContext';

type Props = {
  style?: StyleProp<ViewStyle>;
  vertical?: boolean;
};

export function Divider({ style, vertical = false }: Props) {
  const theme = useAppTheme();
  return (
    <View
      style={[
        vertical
          ? { width: StyleSheet.hairlineWidth, alignSelf: 'stretch' }
          : { height: StyleSheet.hairlineWidth, alignSelf: 'stretch' },
        { backgroundColor: theme.colors.divider },
        style,
      ]}
    />
  );
}
