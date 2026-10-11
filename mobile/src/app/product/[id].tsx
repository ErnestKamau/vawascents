import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Minus, Plus, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { Screen, Text, Button, IconButton, PriceText, Badge, GlassSurface, ImageCarousel } from '@/components/ui';
import { findProduct } from '@/data/mockProducts';

export default function ProductDetailScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = findProduct(id);
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);
  const heartScale = useSharedValue(1);
  const ctaScale = useSharedValue(1);

  if (!product) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="body" color="muted">
            Fragrance not found.
          </Text>
        </View>
      </Screen>
    );
  }

  const toggleSaved = () => {
    setSaved((s) => !s);
    heartScale.value = withSequence(withTiming(1.3, { duration: 120 }), withSpring(1, theme.spring.snappy));
  };

  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));
  const ctaStyle = useAnimatedStyle(() => ({ transform: [{ scale: ctaScale.value }] }));

  const handleAddToCart = () => {
    ctaScale.value = withSequence(withTiming(0.94, { duration: 90 }), withSpring(1, theme.spring.snappy));
    add(product, quantity);
    router.push('/(tabs)/cart' as any);
  };

  return (
    <Screen edges={['left', 'right']} horizon={false} safe={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: theme.spacing[13] }}>
        <View>
          <ImageCarousel slides={[{ uri: product.imageUri }]} aspectRatio={1} borderRadius={0} dots={false} />
          <LinearGradient
            colors={['transparent', theme.colors.background]}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 100 }}
            pointerEvents="none"
          />
          <View style={{ position: 'absolute', top: insets.top + theme.spacing[3], left: theme.spacing[5], right: theme.spacing[5], flexDirection: 'row', justifyContent: 'space-between' }}>
            <IconButton
              icon={<ArrowLeft size={20} color={theme.colors.text} />}
              onPress={() => router.back()}
              accessibilityLabel="Back"
              style={{ backgroundColor: theme.colors.surface, opacity: 0.92 }}
            />
            <Animated.View style={heartStyle}>
              <IconButton
                icon={<Heart size={20} color={saved ? theme.colors.error : theme.colors.text} fill={saved ? theme.colors.error : 'transparent'} />}
                onPress={toggleSaved}
                accessibilityLabel="Save to wishlist"
                style={{ backgroundColor: theme.colors.surface, opacity: 0.92 }}
              />
            </Animated.View>
          </View>
        </View>

        <Animated.View
          entering={FadeInDown.duration(theme.duration.normal)}
          style={{
            marginTop: -theme.spacing[7],
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: theme.radius['2xl'],
            borderTopRightRadius: theme.radius['2xl'],
            padding: theme.spacing[6],
            gap: theme.spacing[3],
          }}
        >
          <View style={{ alignSelf: 'center', width: 44, height: 4, borderRadius: 2, backgroundColor: theme.colors.border, marginBottom: theme.spacing[2] }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] }}>
            <Badge label={product.category} intent="neutral" />
            <Badge label="Eau de Parfum" intent="gold" />
          </View>
          <Text variant="overline" color="muted">
            {product.brand}
          </Text>
          <Text variant="h1" style={{ fontFamily: theme.fontFamily.display.extraBold }}>
            {product.name}
          </Text>
          <Text variant="body" color="muted">
            {product.volumeMl} ml bottle
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing[2] }}>
            <PriceText amount={product.price} compareAt={product.compareAt} size="lg" />
          </View>

          <View style={{ height: 1, backgroundColor: theme.colors.divider, marginVertical: theme.spacing[4] }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2], marginBottom: theme.spacing[2] }}>
            <Sparkles size={16} color={theme.colors.gold} />
            <Text variant="title">Fragrance notes</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
            {product.notes.map((note) => (
              <Badge key={note} label={note} intent="gold" />
            ))}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.spacing[6] }}>
            <Text variant="label" color="muted">
              Quantity
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[4] }}>
              <IconButton
                icon={<Minus size={16} color={theme.colors.text} />}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                accessibilityLabel="Decrease quantity"
                size={36}
                style={{ backgroundColor: theme.colors.backgroundSecondary }}
              />
              <Text variant="title">{quantity}</Text>
              <IconButton
                icon={<Plus size={16} color={theme.colors.text} />}
                onPress={() => setQuantity((q) => q + 1)}
                accessibilityLabel="Increase quantity"
                size={36}
                style={{ backgroundColor: theme.colors.backgroundSecondary }}
              />
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: theme.spacing[5], paddingBottom: Math.max(insets.bottom, theme.spacing[5]) }}>
        <GlassSurface level={4} borderRadius={theme.radius.xl}>
          <Animated.View style={[{ padding: theme.spacing[4] }, ctaStyle]}>
            <Button title="Add to cart" fullWidth onPress={handleAddToCart} />
          </Animated.View>
        </GlassSurface>
      </View>
    </Screen>
  );
}
