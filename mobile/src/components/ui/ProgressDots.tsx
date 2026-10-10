import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useAppTheme } from '@/contexts/ThemeContext';

type Props = {
  count: number;
  index: number;
};

export function ProgressDots({ count, index }: Props) {
  const theme = useAppTheme();

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing[2], paddingVertical: theme.spacing[4] }}>
      {Array.from({ length: count }).map((_, i) => (
        <Dot key={i} active={i === index} />
      ))}
    </View>
  );
}

function Dot({ active }: { active: boolean }) {
  const theme = useAppTheme();
  const style = useAnimatedStyle(() => ({
    width: withTiming(active ? 22 : 8, { duration: theme.duration.normal }),
    backgroundColor: active ? theme.colors.primary : theme.colors.border,
  }));

  return <Animated.View style={[{ height: 8, borderRadius: theme.radius.pill }, style]} />;
}
