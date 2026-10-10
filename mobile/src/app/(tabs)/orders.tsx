import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { ReceiptText } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Screen, Text, Button } from '@/components/ui';

export default function OrdersScreen() {
  const theme = useAppTheme();

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
