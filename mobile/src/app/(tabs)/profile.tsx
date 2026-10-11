import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import {
  Wallet,
  MapPin,
  Bell,
  Shield,
  CircleHelp,
  LogOut,
  ChevronRight,
  Pencil,
} from 'lucide-react-native';
import { useAppTheme, useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Screen, Text, Avatar, Surface, Divider, SegmentedControl } from '@/components/ui';

type Row = {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: theme.spacing[2] }}>
      <Text variant="overline" color="muted" style={{ marginLeft: theme.spacing[1] }}>
        {title}
      </Text>
      <Surface variant="elevated" padding={0} style={{ overflow: 'hidden' }}>
        {children}
      </Surface>
    </View>
  );
}

function SectionRows({ rows }: { rows: Row[] }) {
  const theme = useAppTheme();
  return (
    <>
      {rows.map((row, i) => (
        <React.Fragment key={row.label}>
          <Pressable
            onPress={row.onPress}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing[4],
                padding: theme.spacing[5],
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            {row.icon}
            <Text variant="body" style={{ flex: 1 }}>
              {row.label}
            </Text>
            {row.value && (
              <Text variant="bodySmall" color="muted">
                {row.value}
              </Text>
            )}
            <ChevronRight size={18} color={theme.colors.textMuted} />
          </Pressable>
          {i < rows.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </>
  );
}

export default function ProfileScreen() {
  const theme = useAppTheme();
  const { user, logout } = useAuth();
  const { themeName, isSystemTheme, changeTheme, toggleSystemTheme } = useTheme();
  const appearance = isSystemTheme ? 'system' : themeName;

  const accountRows: Row[] = [
    { icon: <Wallet size={20} color={theme.colors.primary} />, label: 'Wallet', onPress: () => router.push('/wallet' as any) },
    { icon: <MapPin size={20} color={theme.colors.primary} />, label: 'Shipping addresses' },
    { icon: <Shield size={20} color={theme.colors.primary} />, label: 'Security' },
  ];

  const supportRows: Row[] = [{ icon: <CircleHelp size={20} color={theme.colors.primary} />, label: 'Help & support' }];

  const handleLogout = async () => {
    await logout();
    router.replace('/onboarding');
  };

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: theme.spacing[5], gap: theme.spacing[6], paddingBottom: theme.spacing[11] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[4] }}>
          <Avatar name={user?.name ?? 'Guest'} size={64} />
          <View style={{ gap: 2 }}>
            <Text variant="h3">{user?.name ?? 'Guest'}</Text>
            <Text variant="body" color="muted">
              {user?.email ?? ''}
            </Text>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }} hitSlop={6}>
              <Pencil size={12} color={theme.colors.primary} />
              <Text variant="bodySmall" color="brand">
                Edit profile
              </Text>
            </Pressable>
          </View>
        </View>

        <Section title="ACCOUNT">
          <SectionRows rows={accountRows} />
        </Section>

        <Section title="PREFERENCES">
          <View style={{ padding: theme.spacing[5] }}>
            <SegmentedControl
              label="Appearance"
              value={appearance as 'light' | 'dark' | 'system'}
              onChange={(v) => (v === 'system' ? toggleSystemTheme() : changeTheme(v))}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System' },
              ]}
            />
          </View>
          <Divider />
          <SectionRows rows={[{ icon: <Bell size={20} color={theme.colors.primary} />, label: 'Notifications', value: 'On' }]} />
        </Section>

        <Section title="SUPPORT">
          <SectionRows rows={supportRows} />
        </Section>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: theme.spacing[3],
              padding: theme.spacing[4],
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <LogOut size={18} color={theme.colors.error} />
          <Text variant="label" color="error">
            Log out
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
