import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  Landmark,
  TrendingUp,
  Gift,
  Share2,
  Receipt,
  Eye,
  EyeOff,
  Bell,
  Copy,
} from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Screen, Text, IconButton, Avatar, Surface, SegmentedControl } from '@/components/ui';
import { softWhite } from '@/design';

const onGradient = { color: softWhite.primary };

type TxFilter = 'all' | 'topup' | 'payment';

export default function WalletScreen() {
  const theme = useAppTheme();
  const { user } = useAuth();
  const toast = useToast();
  const [hideBalance, setHideBalance] = useState(false);
  const [filter, setFilter] = useState<TxFilter>('all');

  const comingSoon = (title: string) =>
    toast.info(title, 'Equity Pesalink wallet funding launches soon.');

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: theme.spacing[9], gap: theme.spacing[6] }}>
        <View
          style={{
            paddingHorizontal: theme.spacing[5],
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: theme.spacing[2],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] }}>
            <IconButton icon={<ArrowLeft size={20} color={theme.colors.text} />} onPress={() => router.back()} accessibilityLabel="Back" />
            <Avatar name={user?.name ?? 'Guest'} size={38} />
            <View>
              <Text variant="caption" color="muted">
                Hello, {user?.name?.split(' ')[0] ?? 'Guest'}
              </Text>
              <Text variant="title">Wallet</Text>
            </View>
          </View>
          <IconButton
            icon={<Bell size={20} color={theme.colors.text} />}
            onPress={() => {}}
            accessibilityLabel="Notifications"
            style={{ backgroundColor: theme.colors.backgroundSecondary }}
          />
        </View>

        <View style={{ paddingHorizontal: theme.spacing[5] }}>
          <View style={[{ borderRadius: theme.radius.xl, overflow: 'hidden' }, theme.getElevation('elv400')]}>
            <LinearGradient
              colors={[theme.colors.secondary, theme.colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: theme.spacing[6], gap: theme.spacing[5] }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text variant="overline" style={onGradient}>
                  AVAILABLE BALANCE
                </Text>
                <Pressable
                  onPress={() => setHideBalance((v) => !v)}
                  hitSlop={8}
                  accessibilityLabel={hideBalance ? 'Show balance' : 'Hide balance'}
                >
                  {hideBalance ? (
                    <EyeOff size={18} color={softWhite.secondary} />
                  ) : (
                    <Eye size={18} color={softWhite.secondary} />
                  )}
                </Pressable>
              </View>

              <Text variant="display" style={[onGradient, { fontSize: 36 }]}>
                {hideBalance ? 'KES ••••••' : 'KES 0.00'}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] }}>
                <View>
                  <Text variant="caption" style={{ color: softWhite.muted }}>
                    WALLET ID
                  </Text>
                  <Text variant="label" style={onGradient}>
                    •••• •••• 0000
                  </Text>
                </View>
                <Copy size={14} color={softWhite.muted} />
              </View>

              <View style={{ flexDirection: 'row', gap: theme.spacing[3], marginTop: theme.spacing[1] }}>
                <Pressable
                  onPress={() => comingSoon('Top up')}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: theme.radius.pill,
                    backgroundColor: softWhite.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: theme.spacing[2],
                  }}
                >
                  <ArrowDownToLine size={16} color={theme.colors.secondary} />
                  <Text variant="button" style={{ color: theme.colors.secondary }}>
                    Top up
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => comingSoon('Withdraw')}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: theme.radius.pill,
                    borderWidth: 1.5,
                    borderColor: 'rgba(255,255,255,0.4)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: theme.spacing[2],
                  }}
                >
                  <ArrowUpFromLine size={16} color={softWhite.primary} />
                  <Text variant="button" style={onGradient}>
                    Withdraw
                  </Text>
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        </View>

        <View style={{ paddingHorizontal: theme.spacing[5], flexDirection: 'row', gap: theme.spacing[3] }}>
          <Surface
            variant="elevated"
            padding={4}
            style={{ flex: 1, gap: theme.spacing[2], borderWidth: 1, borderColor: theme.colors.border }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text variant="caption" color="muted">
                Spent this month
              </Text>
              <TrendingUp size={14} color={theme.colors.textMuted} />
            </View>
            <Text variant="h3">KES 0</Text>
          </Surface>
          <Surface
            variant="elevated"
            padding={4}
            style={{ flex: 1, gap: theme.spacing[2], borderWidth: 1, borderColor: theme.colors.border }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text variant="caption" color="muted">
                Cashback earned
              </Text>
              <Gift size={14} color={theme.colors.gold} />
            </View>
            <Text variant="h3" color="gold">
              KES 0
            </Text>
          </Surface>
        </View>

        <View style={{ paddingHorizontal: theme.spacing[5] }}>
          <Surface variant="elevated" padding={4}>
            <View style={{ flexDirection: 'row', gap: theme.spacing[3] }}>
              <WalletAction
                icon={<ArrowDownToLine size={20} color={theme.colors.primary} />}
                label="Top up"
                onPress={() => comingSoon('Top up')}
              />
              <WalletAction
                icon={<ArrowUpFromLine size={20} color={theme.colors.primary} />}
                label="Withdraw"
                onPress={() => comingSoon('Withdraw')}
              />
              <WalletAction
                icon={<Landmark size={20} color={theme.colors.primary} />}
                label="Link bank"
                onPress={() => comingSoon('Link bank')}
              />
              <WalletAction
                icon={<Receipt size={20} color={theme.colors.primary} />}
                label="Statements"
                onPress={() => comingSoon('Statements')}
              />
            </View>
          </Surface>
        </View>

        <View style={{ paddingHorizontal: theme.spacing[5] }}>
          <Surface variant="elevated" padding={5} style={{ borderWidth: 1, borderColor: theme.colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[4] }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.colors.goldMuted,
                }}
              >
                <Gift size={20} color={theme.colors.gold} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="label">Refer & earn</Text>
                <Text variant="caption" color="muted">
                  Share VawaScents, earn wallet credit per friend.
                </Text>
              </View>
              <Pressable
                onPress={() => toast.info('Coming soon', 'Referral rewards launch with Equity Pesalink.')}
                hitSlop={8}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.colors.backgroundSecondary,
                }}
              >
                <Share2 size={16} color={theme.colors.text} />
              </Pressable>
            </View>
          </Surface>
        </View>

        <View style={{ paddingHorizontal: theme.spacing[5], gap: theme.spacing[4] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="title">Transactions</Text>
            <Pressable hitSlop={8} onPress={() => {}}>
              <Text variant="caption" color="brand">
                See all
              </Text>
            </Pressable>
          </View>

          <SegmentedControl
            options={[
              { value: 'all', label: 'All' },
              { value: 'topup', label: 'Top ups' },
              { value: 'payment', label: 'Payments' },
            ]}
            value={filter}
            onChange={setFilter}
          />

          <Surface variant="elevated" style={{ alignItems: 'center', gap: theme.spacing[2], paddingVertical: theme.spacing[8] }}>
            <Receipt size={24} color={theme.colors.textMuted} />
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

function WalletAction({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress?: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', gap: theme.spacing[2] }} hitSlop={4}>
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: theme.radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.primaryMuted,
        }}
      >
        {icon}
      </View>
      <Text variant="caption" color="secondary" style={{ textAlign: 'center' }}>
        {label}
      </Text>
    </Pressable>
  );
}
