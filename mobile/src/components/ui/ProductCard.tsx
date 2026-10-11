import React, { useState } from 'react';
import { Pressable, View, useWindowDimensions, ImageSourcePropType } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { Text } from './Text';
import { MediaContainer } from './MediaContainer';
import { PriceText } from './PriceText';
import { Surface } from './Surface';

type ProductCardProps = {
  id: string | number;
  name: string;
  brand?: string;
  volumeMl?: number;
  price: number | string;
  compareAt?: number | string;
  imageUri?: string | null;
  imageSource?: ImageSourcePropType;
  variant?: 'grid' | 'horizontal';
  onPress?: () => void;
};

function WishlistHeart({ size = 16, name }: { size?: number; name: string }) {
  const theme = useAppTheme();
  const toast = useToast();
  const [saved, setSaved] = useState(false);
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={(e) => {
        e.stopPropagation?.();
        const next = !saved;
        setSaved(next);
        scale.value = withSequence(withTiming(1.3, { duration: 110 }), withSpring(1, theme.spring.snappy));
        if (next) toast.success('Added to wishlist', name);
        else toast.info('Removed from wishlist', name);
      }}
      hitSlop={8}
      style={{
        position: 'absolute',
        top: theme.spacing[3],
        right: theme.spacing[3],
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
        opacity: 0.92,
        zIndex: 1,
      }}
    >
      <Animated.View style={style}>
        <Heart size={size} color={saved ? theme.colors.error : theme.colors.textMuted} fill={saved ? theme.colors.error : 'transparent'} />
      </Animated.View>
    </Pressable>
  );
}

export function ProductCard({
  id,
  name,
  brand,
  volumeMl,
  price,
  compareAt,
  imageUri,
  imageSource,
  variant = 'grid',
  onPress,
}: ProductCardProps) {
  const theme = useAppTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const handlePress = () => {
    if (onPress) onPress();
    else router.push(`/product/${id}` as any);
  };

  if (variant === 'horizontal') {
    return (
      <Pressable onPress={handlePress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
        <Surface variant="elevated" style={{ flexDirection: 'row', padding: theme.spacing[3], gap: theme.spacing[4], alignItems: 'center' }}>
          <MediaContainer uri={imageUri} source={imageSource} aspectRatio="1:1" style={{ width: 72, height: 72 }} />
          <View style={{ flex: 1, gap: theme.spacing[1] }}>
            {brand && (
              <Text variant="overline" color="muted">
                {brand}
              </Text>
            )}
            <Text variant="body" numberOfLines={2}>
              {name}
            </Text>
            {volumeMl && (
              <Text variant="caption" color="muted">
                {volumeMl} ml
              </Text>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <PriceText amount={price} compareAt={compareAt} size="sm" />
            </View>
          </View>
        </Surface>
      </Pressable>
    );
  }

  const cardWidth = (width - theme.spacing[5] * 2 - theme.spacing[3]) / 2;
  const imageRadius = theme.radius.xl - theme.spacing[2];

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [{ width: cardWidth, opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? theme.pressScale : 1 }] }]}
    >
      <Surface variant="elevated" style={{ overflow: 'hidden' }} padding={2}>
        <View>
          <MediaContainer uri={imageUri} source={imageSource} aspectRatio="1:1" borderRadius={imageRadius} />
          <WishlistHeart name={name} />
        </View>
        <View style={{ padding: theme.spacing[3], paddingTop: theme.spacing[2], gap: theme.spacing[1] }}>
          {brand && (
            <Text variant="overline" color="muted" numberOfLines={1}>
              {brand}
            </Text>
          )}
          <Text variant="label" numberOfLines={2}>
            {name}
          </Text>
          {volumeMl && (
            <Text variant="caption" color="muted">
              {volumeMl} ml
            </Text>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <PriceText amount={price} compareAt={compareAt} size="sm" />
          </View>
        </View>
      </Surface>
    </Pressable>
  );
}
