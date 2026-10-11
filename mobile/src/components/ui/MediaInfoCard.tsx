import React from 'react';
import { View, Pressable, ImageSourcePropType } from 'react-native';
import { Star, MapPin, Heart, ArrowRight } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Text } from './Text';
import { MediaContainer } from './MediaContainer';
import { Badge } from './Badge';
import { PriceText } from './PriceText';

type Props = {
  imageUri?: string | null;
  imageSource?: ImageSourcePropType;
  rating?: number;
  statusLabel?: string;
  title: string;
  subtitle?: string;
  price?: number | string;
  primaryLabel?: string;
  onPrimaryPress?: () => void;
  saved?: boolean;
  onHeartPress?: () => void;
  onPress?: () => void;
  height?: number;
};

/**
 * Media background with a floating info card overlapping its bottom edge —
 * rating/status badges on the photo, title/price/actions in the card below.
 */
export function MediaInfoCard({
  imageUri,
  imageSource,
  rating,
  statusLabel,
  title,
  subtitle,
  price,
  primaryLabel = 'View',
  onPrimaryPress,
  saved = false,
  onHeartPress,
  onPress,
  height = 220,
}: Props) {
  const theme = useAppTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.96 : 1 }]}>
      <View>
        <MediaContainer
          uri={imageUri}
          source={imageSource}
          borderRadius={0}
          style={{ height, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl }}
        />

        <View style={{ position: 'absolute', top: theme.spacing[3], left: theme.spacing[3], right: theme.spacing[3], flexDirection: 'row', justifyContent: 'space-between' }}>
          {rating != null ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: theme.colors.surface,
                paddingHorizontal: theme.spacing[2],
                paddingVertical: 4,
                borderRadius: theme.radius.pill,
              }}
            >
              <Star size={12} color={theme.colors.gold} fill={theme.colors.gold} />
              <Text variant="caption" style={{ fontFamily: theme.fontFamily.body.semiBold }}>
                {rating.toFixed(1)}
              </Text>
            </View>
          ) : (
            <View />
          )}
          {statusLabel && <Badge label={statusLabel} intent="success" />}
        </View>

        <Pressable
          onPress={onHeartPress}
          hitSlop={8}
          style={{
            position: 'absolute',
            bottom: theme.spacing[3] + 64,
            right: theme.spacing[3],
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.surface,
            opacity: 0.94,
          }}
        >
          <Heart size={16} color={saved ? theme.colors.error : theme.colors.textMuted} fill={saved ? theme.colors.error : 'transparent'} />
        </Pressable>
      </View>

      <View
        style={[
          theme.getElevation('elv400'),
          {
            marginTop: -theme.spacing[8],
            marginHorizontal: theme.spacing[4],
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.lg,
            padding: theme.spacing[4],
            gap: theme.spacing[1],
          },
        ]}
      >
        <Text variant="title" numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MapPin size={12} color={theme.colors.textMuted} />
            <Text variant="caption" color="muted" numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.spacing[2] }}>
          {price != null ? (
            <PriceText amount={price} size="sm" />
          ) : (
            <View />
          )}
          <Pressable
            onPress={onPrimaryPress}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingHorizontal: theme.spacing[4],
                height: 36,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.colors.primary,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text variant="label" color="onPrimary">
              {primaryLabel}
            </Text>
            <ArrowRight size={14} color={theme.colors.textOnPrimary} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
