import React, { useRef, useState } from 'react';
import { View, FlatList, NativeSyntheticEvent, NativeScrollEvent, useWindowDimensions, StyleProp, ViewStyle, ImageSourcePropType } from 'react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { MediaContainer } from './MediaContainer';
import { ProgressDots } from './ProgressDots';

type Slide = { uri?: string | null; source?: ImageSourcePropType };

type Props = {
  slides: Slide[];
  aspectRatio?: '1:1' | '4:3' | '16:9' | '3:4' | number;
  borderRadius?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  /** Static overlay content, or a per-slide renderer (e.g. headline text that changes per promo slide). */
  overlay?: React.ReactNode | ((index: number) => React.ReactNode);
  dots?: boolean;
};

/** Horizontal pager with ProgressDots — shared by Home's promo hero and Product detail's gallery. */
export function ImageCarousel({ slides, aspectRatio = '1:1', borderRadius, height, style, overlay, dots = true }: Props) {
  const theme = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [slideWidth, setSlideWidth] = useState(screenWidth);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!slideWidth) return;
    const next = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
    if (next !== index) setIndex(next);
  };

  return (
    <View style={style}>
      <View
        onLayout={(e) => setSlideWidth(e.nativeEvent.layout.width)}
        style={{ borderRadius: borderRadius ?? theme.radius.xl, overflow: 'hidden' }}
      >
        <FlatList
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          onScroll={onScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <View style={{ width: slideWidth }}>
              <MediaContainer
                uri={item.uri}
                source={item.source}
                aspectRatio={aspectRatio}
                borderRadius={0}
                style={height ? { aspectRatio: undefined, height } : undefined}
              />
            </View>
          )}
        />
        {typeof overlay === 'function' ? overlay(index) : overlay}
      </View>
      {dots && slides.length > 1 && <ProgressDots count={slides.length} index={index} />}
    </View>
  );
}
