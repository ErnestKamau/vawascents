import React, { useState } from 'react';
import { View, FlatList, Pressable, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { ReceiptText, MapPin, Clock3, ChevronRight } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useOrders } from '@/contexts/OrderContext';
import { OrderApi, OrderStatus } from '@/services/orderApi';
import { DELIVERY_STATUS_LABEL } from '@/services/deliveryApi';
import { findProduct } from '@/data/mockProducts';
import { Screen, Text, Button, Surface, MediaContainer, PriceText, Badge, Skeleton } from '@/components/ui';

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Awaiting payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrdersScreen() {
  const theme = useAppTheme();
  const { orders, loading, refresh } = useOrders();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <Screen edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: theme.spacing[5], paddingTop: theme.spacing[3] }}>
          <Text variant="h3">Your orders</Text>
        </View>
        <View style={{ padding: theme.spacing[5], gap: theme.spacing[4] }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={120} borderRadius={theme.radius.lg} />
          ))}
        </View>
      </Screen>
    );
  }

  if (orders.length === 0) {
    return (
      <Screen edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: theme.spacing[5], paddingTop: theme.spacing[3] }}>
          <Text variant="h3">Your orders</Text>
        </View>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing[4], paddingHorizontal: theme.spacing[7] }}>
          <ReceiptText size={48} color={theme.colors.textMuted} />
          <Text variant="title">No orders yet</Text>
          <Text variant="body" color="muted" style={{ textAlign: 'center' }}>
            Once you place an order, you&apos;ll be able to track it here.
          </Text>
          <Button title="Shop fragrances" onPress={() => router.push('/products' as any)} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <View style={{ paddingHorizontal: theme.spacing[5], paddingTop: theme.spacing[3] }}>
        <Text variant="h3">Your orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(o) => String(o.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        contentContainerStyle={{ padding: theme.spacing[5], gap: theme.spacing[4], paddingBottom: theme.spacing[13] }}
        renderItem={({ item: order }: { item: OrderApi }) => {
          const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
          const summary = order.items.map((i) => i.product_name).join(', ');
          const thumbnail = findProduct(order.items[0]?.sku ?? '')?.imageUri;
          const delivery = order.delivery;

          return (
            <Pressable onPress={() => router.push(`/order/${order.id}` as any)}>
              <Surface variant="elevated" padding={4} style={{ gap: theme.spacing[3] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] }}>
                  <MediaContainer uri={thumbnail} aspectRatio="1:1" borderRadius={theme.radius.md} style={{ width: 56, height: 56 }} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="label" numberOfLines={1}>
                      {summary}
                    </Text>
                    <Text variant="caption" color="muted">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'} ·{' '}
                      {order.placed_at ? new Date(order.placed_at).toLocaleDateString() : 'Unpaid'}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={theme.colors.textMuted} />
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Badge label={ORDER_STATUS_LABEL[order.status]} intent={order.status === 'delivered' ? 'success' : 'brand'} />
                  <PriceText amount={order.total_cents / 100} size="sm" />
                </View>

                {delivery && (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] }}>
                      <MapPin size={13} color={theme.colors.textMuted} />
                      <Text variant="bodySmall" color="muted" numberOfLines={1} style={{ flex: 1 }}>
                        {delivery.pickup_point.name} · {DELIVERY_STATUS_LABEL[delivery.status]}
                      </Text>
                    </View>
                    {delivery.estimated_arrival && delivery.status !== 'collected' && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] }}>
                        <Clock3 size={13} color={theme.colors.textMuted} />
                        <Text variant="bodySmall" color="muted">
                          Estimated {new Date(delivery.estimated_arrival).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </Surface>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}
