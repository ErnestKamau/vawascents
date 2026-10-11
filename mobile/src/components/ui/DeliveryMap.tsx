import React, { useMemo, useState } from 'react';
import { Platform, View, StyleSheet, LayoutChangeEvent, ViewStyle, StyleProp } from 'react-native';
import Svg, { Line, Polyline as SvgPolyline, Circle } from 'react-native-svg';
import { MapPin, Navigation, Truck } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';

export type LatLng = { lat: number; lng: number };

export type DeliveryMapMarker = {
  id: string;
  coordinates: LatLng;
  title?: string;
  kind?: 'origin' | 'pickup' | 'vehicle' | 'selected';
};

export type DeliveryMapPolyline = {
  id: string;
  coordinates: LatLng[];
  color?: string;
};

type Props = {
  center: LatLng;
  zoom?: number;
  markers?: DeliveryMapMarker[];
  polylines?: DeliveryMapPolyline[];
  style?: StyleProp<ViewStyle>;
  onMapPress?: (coordinates: LatLng) => void;
};

/**
 * Cross-platform map: expo-maps (Apple/Google native tiles) on iOS/Android.
 * expo-maps has no web runtime, so web renders a stylized placeholder with the
 * same markers/route projected onto a mock grid — good enough to lay out and
 * verify the surrounding UI in browser preview; real tiles show on-device.
 */
export function DeliveryMap({ center, zoom = 14, markers = [], polylines = [], style, onMapPress }: Props) {
  if (Platform.OS === 'web') {
    return <DeliveryMapWebFallback center={center} markers={markers} polylines={polylines} style={style} />;
  }

  return <DeliveryMapNative center={center} zoom={zoom} markers={markers} polylines={polylines} style={style} onMapPress={onMapPress} />;
}

function DeliveryMapNative({ center, zoom, markers, polylines, style, onMapPress }: Required<Pick<Props, 'center' | 'zoom' | 'markers' | 'polylines'>> & Pick<Props, 'style' | 'onMapPress'>) {
  // Lazy require: expo-maps has no web entry point, so importing it at module scope
  // would break the web bundle even behind a Platform.OS check.
  const { AppleMaps, GoogleMaps } = require('expo-maps');

  const cameraPosition = { coordinates: { latitude: center.lat, longitude: center.lng }, zoom };
  const nativeMarkers = markers.map((m) => ({
    id: m.id,
    coordinates: { latitude: m.coordinates.lat, longitude: m.coordinates.lng },
    title: m.title,
  }));
  const nativePolylines = polylines.map((p) => ({
    id: p.id,
    coordinates: p.coordinates.map((c) => ({ latitude: c.lat, longitude: c.lng })),
    color: p.color,
    width: 4,
  }));
  const onMapClick = onMapPress ? (e: { coordinates: { latitude?: number; longitude?: number } }) => {
    if (e.coordinates.latitude != null && e.coordinates.longitude != null) {
      onMapPress({ lat: e.coordinates.latitude, lng: e.coordinates.longitude });
    }
  } : undefined;

  if (Platform.OS === 'ios') {
    return (
      <AppleMaps.View
        style={[StyleSheet.absoluteFill, style]}
        cameraPosition={cameraPosition}
        markers={nativeMarkers}
        polylines={nativePolylines}
        properties={{ isMyLocationEnabled: true }}
        uiSettings={{ myLocationButtonEnabled: true }}
        onMapClick={onMapClick}
      />
    );
  }

  return (
    <GoogleMaps.View
      style={[StyleSheet.absoluteFill, style]}
      cameraPosition={cameraPosition}
      markers={nativeMarkers}
      polylines={nativePolylines}
      properties={{ isMyLocationEnabled: true }}
      uiSettings={{ myLocationButtonEnabled: true }}
      onMapClick={onMapClick}
    />
  );
}

function DeliveryMapWebFallback({ center, markers = [], polylines = [], style }: Pick<Props, 'center' | 'markers' | 'polylines' | 'style'>) {
  const theme = useAppTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  // Rough equirectangular projection into the measured box, degrees-to-pixels
  // scaled so everything in the marker set fits with padding. Not geographically
  // accurate — it's a stand-in until a real web map provider is wired up.
  const project = useMemo(() => {
    const points = [center, ...markers.map((m) => m.coordinates), ...polylines.flatMap((p) => p.coordinates)];
    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    const latSpan = Math.max(Math.max(...lats) - Math.min(...lats), 0.01);
    const lngSpan = Math.max(Math.max(...lngs) - Math.min(...lngs), 0.01);
    const centerLat = center.lat;
    const centerLng = center.lng;

    return (coord: LatLng) => {
      if (size.width === 0 || size.height === 0) return { x: 0, y: 0 };
      const pad = 0.22;
      const x = size.width / 2 + ((coord.lng - centerLng) / lngSpan) * size.width * (1 - pad);
      const y = size.height / 2 - ((coord.lat - centerLat) / latSpan) * size.height * (1 - pad);
      return { x, y };
    };
  }, [center, markers, polylines, size]);

  const gridColor = theme.mode === 'dark' ? 'rgba(199,185,246,0.08)' : 'rgba(108,92,134,0.1)';
  const gridLines = Array.from({ length: 6 });

  return (
    <View
      onLayout={onLayout}
      style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.backgroundSecondary, overflow: 'hidden' }, style]}
    >
      {size.width > 0 && (
        <Svg width={size.width} height={size.height} style={StyleSheet.absoluteFill}>
          {gridLines.map((_, i) => (
            <Line key={`v${i}`} x1={(size.width / 6) * i} y1={0} x2={(size.width / 6) * i} y2={size.height} stroke={gridColor} strokeWidth={1} />
          ))}
          {gridLines.map((_, i) => (
            <Line key={`h${i}`} x1={0} y1={(size.height / 6) * i} x2={size.width} y2={(size.height / 6) * i} stroke={gridColor} strokeWidth={1} />
          ))}
          {polylines.map((p) => (
            <SvgPolyline
              key={p.id}
              points={p.coordinates.map((c) => { const pt = project(c); return `${pt.x},${pt.y}`; }).join(' ')}
              fill="none"
              stroke={p.color ?? theme.colors.primary}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {markers.map((m) => {
            const pt = project(m.coordinates);
            return <Circle key={`dot-${m.id}`} cx={pt.x} cy={pt.y} r={3} fill={theme.colors.background} opacity={0} />;
          })}
        </Svg>
      )}

      {markers.map((m) => {
        const pt = project(m.coordinates);
        const Icon = m.kind === 'vehicle' ? Truck : m.kind === 'origin' ? Navigation : MapPin;
        const tint = m.kind === 'selected' ? theme.colors.gold : m.kind === 'vehicle' ? theme.colors.info : theme.colors.primary;
        return (
          <View key={m.id} style={{ position: 'absolute', left: pt.x - 16, top: pt.y - 32, alignItems: 'center' }} pointerEvents="none">
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: tint,
                borderWidth: 2,
                borderColor: theme.colors.surface,
                ...theme.getElevation('elv200'),
              }}
            >
              <Icon size={16} color={theme.colors.textOnPrimary} />
            </View>
          </View>
        );
      })}
    </View>
  );
}
