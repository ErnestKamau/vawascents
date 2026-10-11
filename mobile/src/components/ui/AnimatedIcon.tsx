import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/contexts/ThemeContext';

type Props = {
  icon: React.ReactNode;
  size?: number;
};

/** A glowing gradient badge with a gently breathing halo — used for one-off screen icons that aren't sparkle/success Lotties. */
export function AnimatedIcon({ icon, size = 96 }: Props) {
  const theme = useAppTheme();
  const pulse = useSharedValue(0.92);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.92, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={{ width: size * 1.5, height: size * 1.5, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          { position: 'absolute', width: size * 1.5, height: size * 1.5, borderRadius: size, backgroundColor: theme.colors.gold, opacity: 0.22 },
          haloStyle,
        ]}
      />
      <LinearGradient
        colors={[theme.colors.gold, theme.colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
      >
        {icon}
      </LinearGradient>
    </View>
  );
}
