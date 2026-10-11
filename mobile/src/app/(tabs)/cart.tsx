import React from 'react';
import { View, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { Screen, Text, Button, IconButton, MediaContainer, PriceText, Divider, Surface, GlassSurface, AnimatedIcon } from '@/components/ui';
import { TAB_BAR } from '@/components/ui/tabBarTokens';

export default function CartScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { lines, subtotal, itemCount, updateQuantity, remove } = useCart();

  // The tab bar floats above the screen (position: absolute) rather than reserving
  // layout space, so sticky bottom content has to clear it manually.
  const tabBarClearance = Math.max(insets.bottom, theme.spacing[3]) + TAB_BAR.BUMP_RISE + TAB_BAR.BAR_H + theme.spacing[3];

  if (lines.length === 0) {
    return (
      <Screen edges={['top', 'left', 'right']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing[5], paddingHorizontal: theme.spacing[7] }}>
          <AnimatedIcon icon={<ShoppingBag size={36} color={theme.colors.textOnPrimary} />} size={88} />
          <Text variant="h2" style={{ fontFamily: theme.fontFamily.display.extraBold, textAlign: 'center' }}>
            Your cart is empty
          </Text>
          <Text variant="body" color="muted" style={{ textAlign: 'center' }}>
            Browse our fragrances and add your favorites to the cart.
          </Text>
          <Button title="Shop fragrances" onPress={() => router.push('/products' as any)} style={{ marginTop: theme.spacing[2] }} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <View style={{ paddingHorizontal: theme.spacing[5], paddingTop: theme.spacing[3], flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing[2] }}>
        <Text variant="h2" style={{ fontFamily: theme.fontFamily.display.extraBold }}>
          Your cart
        </Text>
        <Text variant="body" color="muted">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Text>
      </View>

      <FlatList
        data={lines}
        keyExtractor={(l) => l.product.id}
        contentContainerStyle={{ padding: theme.spacing[5], gap: theme.spacing[4], paddingBottom: tabBarClearance + 260 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.duration(theme.duration.fast).delay(index * 40)}>
            <Surface variant="elevated" padding={4} style={{ flexDirection: 'row', gap: theme.spacing[4] }}>
              <MediaContainer uri={item.product.imageUri} aspectRatio="1:1" borderRadius={theme.radius.md} style={{ width: 84, height: 84 }} />
              <View style={{ flex: 1, gap: theme.spacing[1] }}>
                <Text variant="overline" color="muted" numberOfLines={1}>
                  {item.product.brand}
                </Text>
                <Text variant="label" numberOfLines={1}>
                  {item.product.name}
                </Text>
                <Text variant="caption" color="muted">
                  {item.product.volumeMl} ml
                </Text>
                <PriceText amount={item.product.price * item.quantity} size="sm" />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3], marginTop: theme.spacing[1] }}>
                  <IconButton
                    icon={<Minus size={14} color={theme.colors.text} />}
                    onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                    accessibilityLabel="Decrease quantity"
                    size={32}
                    style={{ backgroundColor: theme.colors.backgroundSecondary }}
                  />
                  <Text variant="label">{item.quantity}</Text>
                  <IconButton
                    icon={<Plus size={14} color={theme.colors.text} />}
                    onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                    accessibilityLabel="Increase quantity"
                    size={32}
                    style={{ backgroundColor: theme.colors.backgroundSecondary }}
                  />
                  <View style={{ flex: 1 }} />
                  <IconButton
                    icon={<Trash2 size={16} color={theme.colors.error} />}
                    onPress={() => remove(item.product.id)}
                    accessibilityLabel="Remove item"
                    size={32}
                  />
                </View>
              </View>
            </Surface>
          </Animated.View>
        )}
      />

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: tabBarClearance, paddingHorizontal: theme.spacing[5] }}>
        <GlassSurface level={4} borderRadius={theme.radius.xl}>
          <View style={{ padding: theme.spacing[5], gap: theme.spacing[3] }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="body" color="muted">
                Subtotal
              </Text>
              <PriceText amount={subtotal} size="sm" />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="body" color="muted">
                Shipping
              </Text>
              <Text variant="bodySmall" color="muted">
                Calculated at checkout
              </Text>
            </View>
            <Divider />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="title">Total</Text>
              <PriceText amount={subtotal} size="lg" />
            </View>
            <Button title="Checkout" fullWidth onPress={() => {}} style={{ marginTop: theme.spacing[2] }} />
          </View>
        </GlassSurface>
      </View>
    </Screen>
  );
}
