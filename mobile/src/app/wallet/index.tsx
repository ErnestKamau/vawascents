import React from 'react';
import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, Landmark } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Screen, Text, IconButton, GlassSurface, Surface, Badge } from '@/components/ui';
import { softWhite } from '@/design';

const onGradient = { color: softWhite.primary };

export default function WalletScreen() {
  const theme = useAppTheme();

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: theme.spacing[9] }}>
        <View style={{ paddingHorizontal: theme.spacing[5], flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3], paddingTop: theme.spacing[2] }}>
          <IconButton icon={<ArrowLeft size={20} color={theme.colors.text} />} onPress={() => router.back()} accessibilityLabel="Back" />
          <Text variant="h3">Wallet</Text>
        </View>

        <View style={{ padding: theme.spacing[5] }}>
          <GlassSurface level={4} borderRadius={theme.radius.xl} style={{ backgroundColor: theme.colors.secondary }}>
            <View style={{ padding: theme.spacing[6], gap: theme.spacing[2] }}>
              <Text variant="overline" style={onGradient}>
                AVAILABLE BALANCE
              </Text>
              <Text variant="display" style={[onGradient, { fontSize: 36 }]}>
                KES 0.00
              </Text>
              <Badge label="Equity Pesalink · coming soon" intent="gold" style={{ marginTop: theme.spacing[2] }} />
            </View>
          </GlassSurface>
        </View>

        <View style={{ paddingHorizontal: theme.spacing[5], flexDirection: 'row', gap: theme.spacing[4] }}>
          <WalletAction icon={<ArrowDownToLine size={20} color={theme.colors.primary} />} label="Top up" />
          <WalletAction icon={<ArrowUpFromLine size={20} color={theme.colors.primary} />} label="Withdraw" />
          <WalletAction icon={<Landmark size={20} color={theme.colors.primary} />} label="Link bank" />
        </View>

        <View style={{ padding: theme.spacing[5], gap: theme.spacing[3] }}>
          <Text variant="title">Transactions</Text>
          <Surface variant="elevated" style={{ alignItems: 'center', gap: theme.spacing[2], paddingVertical: theme.spacing[8] }}>
            <Text variant="body" color="muted" style={{ textAlign: 'center' }}>
              No transactions yet. Once Equity Pesalink is connected, payments to the
              store will appear here.
            </Text>
          </Surface>
        </View>
      </ScrollView>
    </Screen>
  );
}

function WalletAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  const theme = useAppTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: theme.spacing[2] }}>
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.primaryMuted,
        }}
      >
        {icon}
      </View>
      <Text variant="caption" color="secondary">
        {label}
      </Text>
    </View>
  );
}
