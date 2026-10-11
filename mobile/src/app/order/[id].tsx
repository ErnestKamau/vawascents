import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Clock3 } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useOrders } from '@/contexts/OrderContext';
import { DeliveryMap, DeliveryMapMarker, Text, IconButton, GlassSurface, Badge, Divider, DeliveryStatusTimeline, Skeleton } from '@/components/ui';
import { deliveryApi, Delivery, DeliveryStatus, DELIVERY_STATUS_LABEL } from '@/services/deliveryApi';

const HUB = { lat: -1.2833, lng: 36.8172 };

function mockDelivery(pickupName: string): Delivery {
  const now = Date.now();
  return {
    id: 1,
    order_id: 1,
    status: 'with_driver',
    estimated_arrival: new Date(now + 18 * 60 * 1000).toISOString(),
    pickup_point: {
      id: 2,
      name: pickupName || 'Westlands Sacco Office',
      address: 'Waiyaki Way',
      town: 'Nairobi',
      lat: -1.2673,
      lng: 36.8028,
      operating_hours: '07:00–20:00',
    },
    status_events: [
      { id: 1, status: 'booked', occurred_at: new Date(now - 90 * 60 * 1000).toISOString(), notes: null },
      { id: 2, status: 'dispatched', occurred_at: new Date(now - 60 * 60 * 1000).toISOString(), notes: null },
      { id: 3, status: 'at_hub', occurred_at: new Date(now - 35 * 60 * 1000).toISOString(), notes: null },
      { id: 4, status: 'with_driver', occurred_at: new Date(now - 6 * 60 * 1000).toISOString(), notes: null },
    ],
  };
}

const STATUS_HEADLINE: Record<DeliveryStatus, string> = {
  booked: 'Booking confirmed',
  dispatched: 'Your package is dispatched',
  at_hub: 'Arrived at the hub',
  with_driver: 'On its way to your pickup point',
  at_pickup_point: 'Ready for pickup!',
  collected: 'Collected — enjoy!',
  failed: 'Delivery failed',
  returned: 'Returned to sender',
};

export default function OrderTrackingScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { id, pickup } = useLocalSearchParams<{ id: string; pickup?: string }>();
  const { getOrder, refreshOrder } = useOrders();
  const [delivery, setDelivery] = useState<Delivery | null>(null);

  useEffect(() => {
    let cancelled = false;
    const orderId = Number(id);

    (async () => {
      if (Number.isFinite(orderId)) {
        try {
          const result = await deliveryApi.getDelivery(orderId);
          if (!cancelled) setDelivery(result);
          return;
        } catch {
          // Delivery not booked yet, or backend unreachable — fall back below.
        }

        const cached = getOrder(orderId);
        if (cached?.delivery) {
          if (!cancelled) setDelivery(cached.delivery);
          return;
        }

        try {
          const fresh = await refreshOrder(orderId);
          if (!cancelled && fresh?.delivery) {
            setDelivery(fresh.delivery);
            return;
          }
        } catch {
          // Still nothing — fall through to the demo preview below.
        }
      }

      // Direct/demo link with no known order — fine for a one-off preview.
      if (!cancelled) setDelivery(mockDelivery(pickup ?? ''));
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, pickup]);

  const vehiclePosition = useMemo(() => {
    if (!delivery) return HUB;
    const t = delivery.status === 'with_driver' ? 0.6 : delivery.status === 'at_pickup_point' || delivery.status === 'collected' ? 1 : 0.1;
    return {
      lat: HUB.lat + (delivery.pickup_point.lat - HUB.lat) * t,
      lng: HUB.lng + (delivery.pickup_point.lng - HUB.lng) * t,
    };
  }, [delivery]);

  if (!delivery) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing[5], paddingTop: insets.top + theme.spacing[5], gap: theme.spacing[3] }}>
        <Skeleton height={240} borderRadius={theme.radius.lg} />
        <Skeleton height={20} width="60%" />
        <Skeleton height={16} width="40%" />
      </View>
    );
  }

  const markers: DeliveryMapMarker[] = [
    { id: 'hub', coordinates: HUB, kind: 'origin', title: 'CBD Hub' },
    { id: 'pickup', coordinates: { lat: delivery.pickup_point.lat, lng: delivery.pickup_point.lng }, kind: 'selected', title: delivery.pickup_point.name },
    { id: 'vehicle', coordinates: vehiclePosition, kind: 'vehicle', title: 'Your package' },
  ];

  const center = { lat: (HUB.lat + delivery.pickup_point.lat) / 2, lng: (HUB.lng + delivery.pickup_point.lng) / 2 };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ height: '48%' }}>
        <DeliveryMap
          center={center}
          zoom={13}
          markers={markers}
          polylines={[{ id: 'route', coordinates: [HUB, delivery.pickup_point], color: theme.colors.primary }]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={{ position: 'absolute', top: insets.top + theme.spacing[3], left: theme.spacing[5] }}>
        <GlassSurface level={3} borderRadius={theme.radius.circle}>
          <IconButton icon={<ChevronLeft size={20} color={theme.colors.text} />} onPress={() => router.back()} accessibilityLabel="Back" />
        </GlassSurface>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + theme.spacing[6] }} bounces={false}>
        <View style={{ marginTop: -theme.spacing[6] }}>
          <GlassSurface level={5} borderRadius={theme.radius['2xl']} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
            <View style={{ padding: theme.spacing[5] }}>
              <View style={{ alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: theme.colors.border, marginBottom: theme.spacing[4] }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text variant="h3">{STATUS_HEADLINE[delivery.status]}</Text>
                  {delivery.estimated_arrival && delivery.status !== 'collected' && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[1], marginTop: theme.spacing[1] }}>
                      <Clock3 size={13} color={theme.colors.textMuted} />
                      <Text variant="bodySmall" color="muted">
                        Estimated {new Date(delivery.estimated_arrival).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </Text>
                    </View>
                  )}
                </View>
                <Badge label={DELIVERY_STATUS_LABEL[delivery.status]} intent={delivery.status === 'collected' ? 'success' : 'brand'} />
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2], marginTop: theme.spacing[4] }}>
                <MapPin size={15} color={theme.colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text variant="label" numberOfLines={1}>{delivery.pickup_point.name}</Text>
                  <Text variant="caption" color="muted" numberOfLines={1}>{delivery.pickup_point.address}, {delivery.pickup_point.town}</Text>
                </View>
              </View>

              <Divider style={{ marginVertical: theme.spacing[5] }} />

              <Text variant="overline" color="muted" style={{ marginBottom: theme.spacing[4] }}>
                Delivery timeline
              </Text>
              <DeliveryStatusTimeline status={delivery.status} events={delivery.status_events} />
            </View>
          </GlassSurface>
        </View>
      </ScrollView>
    </View>
  );
}
