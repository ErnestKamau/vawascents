import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import Animated, { FadeOut, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Text } from './Text';
import type { ToastItem } from '@/contexts/ToastContext';

const VARIANT_ICON: Record<ToastItem['variant'], React.ComponentType<any>> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const theme = useAppTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(1, theme.spring.snappy);
  }, [progress, theme.spring.snappy]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * -16 }, { scale: 0.96 + progress.value * 0.04 }],
  }));

  const variantColor: Record<ToastItem['variant'], string> = {
    success: theme.colors.success,
    error: theme.colors.error,
    warning: theme.colors.warning,
    info: theme.colors.info,
  };
  const variantMuted: Record<ToastItem['variant'], string> = {
    success: theme.colors.successMuted,
    error: theme.colors.dangerMuted,
    warning: theme.colors.warningMuted,
    info: theme.colors.infoMuted,
  };

  const Icon = VARIANT_ICON[item.variant];

  return (
    <Animated.View style={[style, theme.getElevation('elv500')]} exiting={FadeOut.duration(140)}>
      <Pressable
        onPress={onDismiss}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: theme.spacing[3],
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          padding: theme.spacing[4],
          borderWidth: 1,
          borderColor: theme.colors.borderSubtle,
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: variantMuted[item.variant],
          }}
        >
          {item.icon ?? <Icon size={16} color={variantColor[item.variant]} />}
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="label" numberOfLines={1}>
            {item.title}
          </Text>
          {item.description && (
            <Text variant="bodySmall" color="muted" numberOfLines={2}>
              {item.description}
            </Text>
          )}
          {item.actionLabel && (
            <Pressable
              onPress={() => {
                item.onAction?.();
                onDismiss();
              }}
              hitSlop={6}
              style={{ marginTop: theme.spacing[1] }}
            >
              <Text variant="label" color="brand">
                {item.actionLabel}
              </Text>
            </Pressable>
          )}
        </View>

        <Pressable onPress={onDismiss} hitSlop={8}>
          <X size={16} color={theme.colors.textMuted} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

export function ToastStack({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: string) => void }) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  if (items.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.fill,
        { position: 'absolute', top: insets.top + theme.spacing[3], left: theme.spacing[4], right: theme.spacing[4], gap: theme.spacing[2] },
      ]}
    >
      {items.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={() => onDismiss(item.id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { zIndex: 1000 },
});
