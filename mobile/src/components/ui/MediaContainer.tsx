import React, { useEffect, useState } from 'react';
import { View, Image, ImageSourcePropType, ImageStyle, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { ImageOff } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Skeleton } from './Skeleton';

type Aspect = '1:1' | '4:3' | '16:9' | '3:4' | number;

type MediaContainerProps = {
  uri?: string | null;
  source?: ImageSourcePropType;
  aspectRatio?: Aspect;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

function resolveAspect(a: Aspect): number {
  if (typeof a === 'number') return a;
  const map = { '1:1': 1, '4:3': 4 / 3, '16:9': 16 / 9, '3:4': 3 / 4 };
  return map[a];
}

/** Never place media raw — always through MediaContainer (Content-First). */
export function MediaContainer({ uri, source, aspectRatio = '1:1', borderRadius, style, imageStyle }: MediaContainerProps) {
  const theme = useAppTheme();
  const [loading, setLoading] = useState(!!uri);
  const [error, setError] = useState(false);
  const rad = borderRadius ?? theme.radius.md;
  const ratio = resolveAspect(aspectRatio);

  useEffect(() => {
    setError(false);
    setLoading(!!uri);
  }, [uri]);

  const resolvedSource: ImageSourcePropType | undefined = source ?? (uri ? { uri } : undefined);

  // On native, aspectRatio + an explicit height together can make Yoga derive
  // width from the ratio instead of the percentage — so drop the ratio
  // whenever a caller-supplied style sets a fixed height.
  const flatOverride = StyleSheet.flatten(style) ?? {};
  const hasExplicitHeight = flatOverride.height != null;

  return (
    <View
      style={[
        {
          width: '100%',
          ...(hasExplicitHeight ? null : { aspectRatio: ratio }),
          borderRadius: rad,
          overflow: 'hidden',
          backgroundColor: theme.colors.skeleton,
        },
        style,
      ]}
    >
      {resolvedSource && !error ? (
        <>
          <Image
            source={resolvedSource}
            style={[StyleSheet.absoluteFill, imageStyle]}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setError(true);
              setLoading(false);
            }}
            resizeMode="cover"
          />
          {loading && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Skeleton width="100%" height="100%" borderRadius={0} />
            </View>
          )}
        </>
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ImageOff size={28} color={theme.colors.textMuted} />
        </View>
      )}
    </View>
  );
}
