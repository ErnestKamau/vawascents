import React from 'react';
import { View, Pressable, ImageSourcePropType } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Text } from './Text';
import { MediaContainer } from './MediaContainer';

type CardImage = { uri?: string | null; source?: ImageSourcePropType };

type Props = {
  images: CardImage[];
  caption: string;
  ctaLabel: string;
  onPress?: () => void;
};

const CARD_SIZE = 148;
const OFFSETS = [
  { x: -56, y: 6, rotate: '-10deg' },
  { x: 0, y: -10, rotate: '2deg' },
  { x: 56, y: 10, rotate: '9deg' },
];

/** Fanned photo-deck feature: a few offset, rotated square cards over a caption + pill CTA. */
export function StackedCards({ images, caption, ctaLabel, onPress }: Props) {
  const theme = useAppTheme();
  const slides = images.slice(0, 3);

  return (
    <View style={{ alignItems: 'center', gap: theme.spacing[6] }}>
      <View style={{ width: CARD_SIZE + 112, height: CARD_SIZE + 24, alignItems: 'center', justifyContent: 'center' }}>
        {slides.map((img, i) => {
          const offset = OFFSETS[i] ?? OFFSETS[OFFSETS.length - 1];
          return (
            <View
              key={i}
              style={[
                theme.getElevation('elv300'),
                {
                  position: 'absolute',
                  width: CARD_SIZE,
                  height: CARD_SIZE,
                  borderRadius: theme.radius.lg,
                  overflow: 'hidden',
                  borderWidth: 3,
                  borderColor: theme.colors.surface,
                  transform: [{ translateX: offset.x }, { translateY: offset.y }, { rotate: offset.rotate }],
                  zIndex: i,
                },
              ]}
            >
              <MediaContainer uri={img.uri} source={img.source} aspectRatio={1} borderRadius={0} style={{ width: CARD_SIZE, height: CARD_SIZE }} />
            </View>
          );
        })}
      </View>

      <Text variant="bodyLarge" color="secondary" style={{ textAlign: 'center', paddingHorizontal: theme.spacing[8] }}>
        {caption}
      </Text>

      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing[2],
            paddingHorizontal: theme.spacing[6],
            height: 48,
            borderRadius: theme.radius.pill,
            borderWidth: 1.5,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? theme.pressScale : 1 }],
          },
        ]}
      >
        <Text variant="button" color="primary">
          {ctaLabel}
        </Text>
        <ArrowRight size={16} color={theme.colors.text} />
      </Pressable>
    </View>
  );
}
