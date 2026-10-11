import React from 'react';
import { View, Pressable, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Text } from './Text';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: SegmentOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  label?: string;
  error?: string;
  style?: StyleProp<ViewStyle>;
};

export function SegmentedControl<T extends string>({ options, value, onChange, label, error, style }: Props<T>) {
  const theme = useAppTheme();

  return (
    <View style={style}>
      {label && (
        <Text variant="caption" color={error ? 'error' : 'muted'} style={{ marginBottom: theme.spacing[2], marginLeft: theme.spacing[1] }}>
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.radius.md,
          borderWidth: 1.5,
          borderColor: error ? theme.colors.error : theme.colors.border,
          padding: 4,
          gap: 4,
        }}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                onChange(option.value);
              }}
              style={{
                flex: 1,
                height: 40,
                borderRadius: theme.radius.sm,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: selected ? theme.colors.primary : 'transparent',
              }}
            >
              <Text variant="label" color={selected ? 'onPrimary' : 'secondary'}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error && (
        <Text variant="caption" color="error" style={{ marginTop: theme.spacing[2], marginLeft: theme.spacing[1] }}>
          {error}
        </Text>
      )}
    </View>
  );
}
