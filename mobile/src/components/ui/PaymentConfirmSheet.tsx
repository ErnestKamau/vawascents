import React, { useEffect } from 'react';
import { View, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wallet } from 'lucide-react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Text } from './Text';
import { Button } from './Button';
import { PriceText } from './PriceText';
import { Divider } from './Divider';
import { Badge } from './Badge';

type Props = {
  visible: boolean;
  amount: number;
  onConfirm: () => void;
  onClose: () => void;
};

/** Explicit payment-method confirmation before an order is placed — checkout never skips straight to success. */
export function PaymentConfirmSheet({ visible, amount, onConfirm, onClose }: Props) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(400);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : 400, { duration: visible ? 260 : 200, easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic) });
  }, [visible, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: theme.colors.overlay }} onPress={onClose} />

        <Animated.View
          style={[
            theme.getElevation('elv700'),
            {
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radius['2xl'],
              borderTopRightRadius: theme.radius['2xl'],
              padding: theme.spacing[6],
              paddingBottom: insets.bottom + theme.spacing[6],
              gap: theme.spacing[4],
            },
            sheetStyle,
          ]}
        >
          <View style={{ alignSelf: 'center', width: 44, height: 4, borderRadius: 2, backgroundColor: theme.colors.border }} />

          <Text variant="h3">Confirm payment</Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing[3],
              padding: theme.spacing[4],
              borderRadius: theme.radius.lg,
              backgroundColor: theme.colors.backgroundSecondary,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.primaryMuted,
              }}
            >
              <Wallet size={18} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="label">VawaScents Wallet</Text>
              <Text variant="caption" color="muted">
                Balance KES 0.00
              </Text>
            </View>
            <Badge label="Coming soon" intent="gold" />
          </View>

          <Divider />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="body" color="muted">
              Amount to pay
            </Text>
            <PriceText amount={amount} size="lg" />
          </View>

          <Button title={`Pay KES ${amount.toLocaleString()}`} fullWidth onPress={onConfirm} />
          <Button title="Cancel" variant="ghost" fullWidth onPress={onClose} />
        </Animated.View>
      </View>
    </Modal>
  );
}
