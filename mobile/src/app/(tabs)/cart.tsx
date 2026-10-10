import React from 'react';
import { View, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { Screen, Text, Button, IconButton, MediaContainer, PriceText, Divider } from '@/components/ui';

export default function CartScreen() {
  const theme = useAppTheme();
  const { lines, subtotal, updateQuantity, remove } = useCart();

  if (lines.length === 0) {
    return (
      <Screen edges={['top', 'left', 'right']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing[4], paddingHorizontal: theme.spacing[7] }}>
          <ShoppingBag size={48} color={theme.colors.textMuted} />
          <Text variant="title">Your cart is empty</Text>
          <Text variant="body" color="muted" style={{ textAlign: 'center' }}>
            Browse our fragrances and add your favorites to the cart.
          </Text>
          <Button title="Shop fragrances" onPress={() => router.push('/products' as any)} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <View style={{ paddingHorizontal: theme.spacing[5], paddingTop: theme.spacing[3] }}>
        <Text variant="h3">Your cart</Text>
      </View>

      <FlatList
        data={lines}
        keyExtractor={(l) => l.product.id}
        contentContainerStyle={{ padding: theme.spacing[5], gap: theme.spacing[4], paddingBottom: theme.spacing[13] }}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', gap: theme.spacing[4] }}>
            <MediaContainer uri={item.product.imageUri} aspectRatio="1:1" style={{ width: 80, height: 80 }} />
            <View style={{ flex: 1, gap: theme.spacing[1] }}>
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
                  size={28}
                  style={{ backgroundColor: theme.colors.backgroundSecondary }}
                />
                <Text variant="label">{item.quantity}</Text>
                <IconButton
                  icon={<Plus size={14} color={theme.colors.text} />}
                  onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                  accessibilityLabel="Increase quantity"
                  size={28}
                  style={{ backgroundColor: theme.colors.backgroundSecondary }}
                />
                <View style={{ flex: 1 }} />
                <IconButton
                  icon={<Trash2 size={16} color={theme.colors.error} />}
                  onPress={() => remove(item.product.id)}
                  accessibilityLabel="Remove item"
                  size={28}
                />
              </View>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <Divider style={{ marginVertical: theme.spacing[1] }} />}
      />

      <View style={{ padding: theme.spacing[5], borderTopWidth: 1, borderTopColor: theme.colors.border, gap: theme.spacing[4] }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="title">Subtotal</Text>
          <PriceText amount={subtotal} size="md" />
        </View>
        <Button title="Checkout" fullWidth onPress={() => {}} />
      </View>
    </Screen>
  );
}
