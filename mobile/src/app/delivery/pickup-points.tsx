import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, LocateFixed, MapPin, Clock, Check } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useOrders } from '@/contexts/OrderContext';
import { DeliveryMap, DeliveryMapMarker, Text, IconButton, GlassSurface, Surface, Button, Skeleton } from '@/components/ui';
import { deliveryApi, PickupPoint } from '@/services/deliveryApi';

const NAIROBI_CBD = { lat: -1.2833, lng: 36.8172 };

// Mock fallback so the screen is fully walkable during dev before auth/orders are wired end to end.
const MOCK_POINTS: PickupPoint[] = [
  { id: 1, name: 'CBD Stage — Tom Mboya St', address: 'Tom Mboya Street', town: 'Nairobi', lat: -1.2833, lng: 36.8172, operating_hours: '06:00–21:00' },
  { id: 2, name: 'Westlands Sacco Office', address: 'Waiyaki Way', town: 'Nairobi', lat: -1.2673, lng: 36.8028, operating_hours: '07:00–20:00' },
  { id: 3, name: 'Ngong Road Terminus', address: 'Ngong Road', town: 'Nairobi', lat: -1.3031, lng: 36.7794, operating_hours: '06:30–20:30' },
];

export default function PickupPointsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { refreshOrder } = useOrders();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();

  const [center, setCenter] = useState(NAIROBI_CBD);
  const [points, setPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [locating, setLocating] = useState(false);

  const search = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const results = await deliveryApi.searchPickupPoints(lat, lng);
      setPoints(results);
    } catch {
      setPoints(MOCK_POINTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    search(center.lat, center.lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const position = await Location.getCurrentPositionAsync({});
        const next = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCenter(next);
        await search(next.lat, next.lng);
      }
    } catch {
      // Location unavailable — keep the current center.
    } finally {
      setLocating(false);
    }
  };

  const selected = points.find((p) => p.id === selectedId) ?? null;

  const markers: DeliveryMapMarker[] = [
    { id: 'origin', coordinates: center, kind: 'origin', title: 'Your location' },
    ...points.map((p) => ({
      id: `point-${p.id}`,
      coordinates: { lat: p.lat, lng: p.lng },
      title: p.name,
      kind: (p.id === selectedId ? 'selected' : 'pickup') as DeliveryMapMarker['kind'],
    })),
  ];

  const confirm = async () => {
    if (!selected) return;
    setConfirming(true);

    if (orderId) {
      try {
        await deliveryApi.createDelivery(Number(orderId), selected.id);
        // Pull the order again so its nested `delivery` reflects the booking
        // the line above just created.
        await refreshOrder(Number(orderId));
      } catch {
        // Backend unreachable — the order tracking screen falls back to its
        // cached copy of the order.
      }
      setConfirming(false);
      router.replace(`/order/${orderId}`);
      return;
    }

    // No order in context (e.g. a direct link) — just preview tracking.
    setConfirming(false);
    router.push(`/order/demo?pickup=${encodeURIComponent(selected.name)}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <DeliveryMap center={center} markers={markers} style={StyleSheet.absoluteFill} onMapPress={(c) => { setCenter(c); search(c.lat, c.lng); }} />

      <View style={{ position: 'absolute', top: insets.top + theme.spacing[3], left: theme.spacing[5], right: theme.spacing[5], flexDirection: 'row', justifyContent: 'space-between' }}>
        <GlassSurface level={3} borderRadius={theme.radius.circle}>
          <IconButton icon={<ChevronLeft size={20} color={theme.colors.text} />} onPress={() => router.back()} accessibilityLabel="Back" />
        </GlassSurface>
        <GlassSurface level={3} borderRadius={theme.radius.circle}>
          <IconButton
            icon={<LocateFixed size={18} color={locating ? theme.colors.textMuted : theme.colors.primary} />}
            onPress={useMyLocation}
            disabled={locating}
            accessibilityLabel="Use my location"
          />
        </GlassSurface>
      </View>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <GlassSurface level={5} borderRadius={theme.radius['2xl']} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
          <View style={{ paddingTop: theme.spacing[4], paddingHorizontal: theme.spacing[5], paddingBottom: insets.bottom + theme.spacing[4] }}>
            <View style={{ alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: theme.colors.border, marginBottom: theme.spacing[4] }} />
            <Text variant="title">Choose a pickup point</Text>
            <Text variant="bodySmall" color="muted" style={{ marginTop: theme.spacing[1], marginBottom: theme.spacing[4] }}>
              Nearest stages to your selected location
            </Text>

            <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
              <View style={{ gap: theme.spacing[3] }}>
                {loading
                  ? [0, 1, 2].map((i) => <Skeleton key={i} height={72} borderRadius={theme.radius.md} />)
                  : points.map((point) => {
                      const isSelected = point.id === selectedId;
                      return (
                        <Pressable key={point.id} onPress={() => setSelectedId(point.id)}>
                          <Surface
                            variant={isSelected ? 'filled' : 'outlined'}
                            padding={4}
                            radius="md"
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: theme.spacing[3],
                              backgroundColor: isSelected ? theme.colors.primaryMuted : theme.colors.surface,
                              borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                            }}
                          >
                            <View
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: isSelected ? theme.colors.primary : theme.colors.backgroundSecondary,
                              }}
                            >
                              <MapPin size={16} color={isSelected ? theme.colors.textOnPrimary : theme.colors.textMuted} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text variant="label" numberOfLines={1}>{point.name}</Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[1], marginTop: 2 }}>
                                <Clock size={11} color={theme.colors.textMuted} />
                                <Text variant="caption" color="muted">{point.operating_hours ?? 'Hours vary'}</Text>
                              </View>
                            </View>
                            {isSelected && (
                              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                                <Check size={13} color={theme.colors.textOnPrimary} />
                              </View>
                            )}
                          </Surface>
                        </Pressable>
                      );
                    })}
              </View>
            </ScrollView>

            <Button
              title={selected ? `Confirm ${selected.name}` : 'Select a pickup point'}
              fullWidth
              disabled={!selected}
              loading={confirming}
              onPress={confirm}
              style={{ marginTop: theme.spacing[4] }}
            />
          </View>
        </GlassSurface>
      </View>
    </View>
  );
}
