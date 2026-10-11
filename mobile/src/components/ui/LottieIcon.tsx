import React, { useEffect, useRef } from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import LottieView from 'lottie-react-native';

type Source = 'sparkle' | 'success';

const sources: Record<Source, any> = {
  sparkle: require('../../../assets/lottie/sparkle-pulse.json'),
  success: require('../../../assets/lottie/success-check.json'),
};

type Props = {
  source: Source;
  size?: number;
  loop?: boolean;
  autoPlay?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function LottieIcon({ source, size = 72, loop = source === 'sparkle', autoPlay = true, style }: Props) {
  const ref = useRef<LottieView>(null);

  useEffect(() => {
    if (autoPlay) ref.current?.play();
  }, [autoPlay]);

  return (
    <LottieView
      ref={ref}
      source={sources[source]}
      loop={loop}
      autoPlay={autoPlay}
      style={[{ width: size, height: size }, style]}
    />
  );
}
