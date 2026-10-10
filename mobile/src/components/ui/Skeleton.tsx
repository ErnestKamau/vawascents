import React, { useEffect } from 'react';
import { DimensionValue } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useAppTheme } from '@/contexts/ThemeContext';

type Props = {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
};

export function Skeleton({ width = '100%', height = 16, borderRadius }: Props) {
  const theme = useAppTheme();
  const pulse = useSharedValue(0.5);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: borderRadius ?? theme.radius.sm,
          backgroundColor: theme.colors.skeleton,
        },
        style,
      ]}
    />
  );
}
