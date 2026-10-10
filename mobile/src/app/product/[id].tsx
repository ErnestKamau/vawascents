import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Heart, Minus, Plus } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { Screen, Text, Button, IconButton, MediaContainer, PriceText, Badge } from '@/components/ui';
import { findProduct } from '@/data/mockProducts';

export default function ProductDetailScreen() {
  const theme = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = findProduct(id);
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);

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

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: theme.spacing[11] }}>
        <View style={{ paddingHorizontal: theme.spacing[5], flexDirection: 'row', justifyContent: 'space-between', paddingTop: theme.spacing[2] }}>
          <IconButton icon={<ArrowLeft size={20} color={theme.colors.text} />} onPress={() => router.back()} accessibilityLabel="Back" />
          <IconButton icon={<Heart size={20} color={theme.colors.text} />} accessibilityLabel="Save to wishlist" />
        </View>

        <View style={{ paddingHorizontal: theme.spacing[5], marginTop: theme.spacing[3] }}>
          <MediaContainer uri={product.imageUri} aspectRatio="1:1" borderRadius={theme.radius.xl} />
        </View>

        <View style={{ padding: theme.spacing[5], gap: theme.spacing[3] }}>
          <Badge label={product.category} intent="neutral" />
          <Text variant="overline" color="muted">
            {product.brand}
          </Text>
          <Text variant="h2">{product.name}</Text>
          <Text variant="body" color="muted">
            {product.volumeMl} ml · Eau de Parfum
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <PriceText amount={product.price} compareAt={product.compareAt} size="lg" />
          </View>

          <View style={{ marginTop: theme.spacing[3] }}>
            <Text variant="title" style={{ marginBottom: theme.spacing[2] }}>
              Notes
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
              {product.notes.map((note) => (
                <Badge key={note} label={note} intent="gold" />
              ))}
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[5], marginTop: theme.spacing[5] }}>
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
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: theme.spacing[5],
          backgroundColor: theme.colors.background,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        <Button
          title="Add to cart"
          fullWidth
          onPress={() => {
            add(product, quantity);
            router.push('/(tabs)/cart' as any);
          }}
        />
      </View>
    </Screen>
  );
}
