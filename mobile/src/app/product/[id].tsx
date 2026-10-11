import React, { useMemo, useState } from 'react';
import { View, ScrollView, FlatList, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Minus, Plus, Sparkles, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { Screen, Text, Button, IconButton, PriceText, Badge, GlassSurface, ImageCarousel, ProductCard } from '@/components/ui';
import { findProduct, MOCK_PRODUCTS, MockProduct } from '@/data/mockProducts';

function sizeOptions(product: MockProduct) {
  const base = product.volumeMl;
  const ratios = [0.6, 1, 1.6];
  return ratios.map((r) => ({
    ml: Math.round((base * r) / 5) * 5,
    price: Math.round((product.price * r) / 10) * 10,
  }));
}

export default function ProductDetailScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = findProduct(id);
  const { add } = useCart();
  const toast = useToast();
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);
  const [sizeIndex, setSizeIndex] = useState(1);
  const heartScale = useSharedValue(1);
  const ctaScale = useSharedValue(1);

  const sizes = useMemo(() => (product ? sizeOptions(product) : []), [product]);
  const related = useMemo(
    () => (product ? MOCK_PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4) : []),
    [product],
  );

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

  const selectedSize = sizes[sizeIndex];

  const toggleSaved = () => {
    const next = !saved;
    setSaved(next);
    heartScale.value = withSequence(withTiming(1.3, { duration: 120 }), withSpring(1, theme.spring.snappy));
    if (next) {
      toast.success('Added to wishlist', product.name);
    } else {
      toast.info('Removed from wishlist', product.name);
    }
  };

  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));
  const ctaStyle = useAnimatedStyle(() => ({ transform: [{ scale: ctaScale.value }] }));

  const handleAddToCart = () => {
    ctaScale.value = withSequence(withTiming(0.94, { duration: 90 }), withSpring(1, theme.spring.snappy));
    add({ ...product, volumeMl: selectedSize.ml, price: selectedSize.price }, quantity);
    toast.success('Added to cart', `${quantity} × ${product.name} (${selectedSize.ml} ml)`, {
      actionLabel: 'View cart',
      onAction: () => router.push('/(tabs)/cart' as any),
    });
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

          {product.rating != null && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] }}>
              <View style={{ flexDirection: 'row', gap: 2 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    size={14}
                    color={theme.colors.gold}
                    fill={i < Math.round(product.rating!) ? theme.colors.gold : 'transparent'}
                  />
                ))}
              </View>
              <Text variant="label">{product.rating!.toFixed(1)}</Text>
              <Text variant="bodySmall" color="muted">
                ({product.reviewCount ?? 0} reviews)
              </Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing[1] }}>
            <PriceText amount={selectedSize.price} compareAt={product.compareAt} size="lg" />
          </View>

          <View style={{ marginTop: theme.spacing[3] }}>
            <Text variant="label" color="muted" style={{ marginBottom: theme.spacing[2] }}>
              Size
            </Text>
            <View style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
              {sizes.map((s, i) => {
                const selected = i === sizeIndex;
                return (
                  <Pressable
                    key={s.ml}
                    onPress={() => setSizeIndex(i)}
                    style={{
                      paddingHorizontal: theme.spacing[4],
                      height: 40,
                      borderRadius: theme.radius.pill,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selected ? theme.colors.primaryMuted : theme.colors.backgroundSecondary,
                      borderWidth: selected ? 1.5 : 0,
                      borderColor: theme.colors.primary,
                    }}
                  >
                    <Text variant="label" color={selected ? 'brand' : 'secondary'}>
                      {s.ml} ml
                    </Text>
                  </Pressable>
                );
              })}
            </View>
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

          {related.length > 0 && (
            <View style={{ marginTop: theme.spacing[7], gap: theme.spacing[3] }}>
              <Text variant="title">You may also like</Text>
              <FlatList
                data={related}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ gap: theme.spacing[4] }}
                renderItem={({ item }) => (
                  <View style={{ width: 160 }}>
                    <ProductCard
                      id={item.id}
                      name={item.name}
                      brand={item.brand}
                      volumeMl={item.volumeMl}
                      price={item.price}
                      compareAt={item.compareAt}
                      imageUri={item.imageUri}
                      onPress={() => router.push(`/product/${item.id}` as any)}
                    />
                  </View>
                )}
              />
            </View>
          )}
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
