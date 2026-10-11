import React from 'react';
import { Pressable, View, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Text } from './Text';

type Props = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: React.ReactNode;
  error?: string;
  style?: StyleProp<ViewStyle>;
};

export function Checkbox({ checked, onChange, label, error, style }: Props) {
  const theme = useAppTheme();
  const scale = useSharedValue(1);

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    scale.value = withTiming(0.85, { duration: 80 }, () => {
      scale.value = withTiming(1, { duration: 120 });
    });
    onChange(!checked);
  };

  return (
    <View style={style}>
      <Pressable
        onPress={toggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing[3] }}
      >
        <Animated.View
          style={[
            {
              width: 22,
              height: 22,
              borderRadius: theme.radius.xs,
              borderWidth: 1.5,
              borderColor: checked ? theme.colors.primary : error ? theme.colors.error : theme.colors.border,
              backgroundColor: checked ? theme.colors.primary : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 1,
            },
            boxStyle,
          ]}
        >
          {checked && <Check size={14} color={theme.colors.textOnPrimary} strokeWidth={3} />}
        </Animated.View>
        {label && <View style={{ flex: 1 }}>{label}</View>}
      </Pressable>
      {error && (
        <Text variant="caption" color="error" style={{ marginTop: theme.spacing[1], marginLeft: 34 }}>
          {error}
        </Text>
      )}
    </View>
  );
}
