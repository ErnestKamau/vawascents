import React, { useEffect } from 'react';
import { View, Pressable, Modal, useWindowDimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, Home, Wallet, ReceiptText, User, Sun, Moon, LogOut } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useAppTheme, useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Text } from './Text';
import { Avatar } from './Avatar';
import { Divider } from './Divider';

type Props = {
  visible: boolean;
  onClose: () => void;
};

type Row = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
};

/** Slide-in navigation drawer, opened from the Home header's hamburger button. */
export function SideDrawer({ visible, onClose }: Props) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user, logout } = useAuth();
  const { themeName, changeTheme } = useTheme();
  const panelWidth = Math.min(300, width * 0.8);
  const translateX = useSharedValue(-panelWidth);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
      backdropOpacity.value = withTiming(1, { duration: 220 });
    } else {
      translateX.value = withTiming(-panelWidth, { duration: 220, easing: Easing.in(Easing.cubic) });
      backdropOpacity.value = withTiming(0, { duration: 180 });
    }
  }, [visible, panelWidth, translateX, backdropOpacity]);

  const panelStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));

  const go = (href: string) => {
    onClose();
    router.push(href as any);
  };

  const rows: Row[] = [
    { icon: <Home size={20} color={theme.colors.primary} />, label: 'Home', onPress: () => go('/(tabs)') },
    { icon: <Wallet size={20} color={theme.colors.primary} />, label: 'Wallet', onPress: () => go('/wallet') },
    { icon: <ReceiptText size={20} color={theme.colors.primary} />, label: 'Orders', onPress: () => go('/(tabs)/orders') },
    { icon: <User size={20} color={theme.colors.primary} />, label: 'Profile', onPress: () => go('/(tabs)/profile') },
  ];

  const handleLogout = async () => {
    onClose();
    await logout();
    router.replace('/onboarding');
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1 }}>
        <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: theme.colors.overlay }, backdropStyle]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close menu" />
        </Animated.View>

        <Animated.View
          style={[
            theme.getElevation('elv700'),
            {
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: panelWidth,
              backgroundColor: theme.colors.surface,
              paddingTop: insets.top + theme.spacing[5],
              paddingBottom: insets.bottom + theme.spacing[5],
              borderTopRightRadius: theme.radius.xl,
              borderBottomRightRadius: theme.radius.xl,
            },
            panelStyle,
          ]}
        >
          <View style={{ paddingHorizontal: theme.spacing[5], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing[6] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] }}>
              <Avatar name={user?.name ?? 'Guest'} size={48} />
              <View>
                <Text variant="title">{user?.name ?? 'Guest'}</Text>
                <Text variant="caption" color="muted" numberOfLines={1}>
                  {user?.email ?? ''}
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Close menu">
              <X size={20} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing[3] }} showsVerticalScrollIndicator={false}>
            {rows.map((row) => (
              <Pressable
                key={row.label}
                onPress={row.onPress}
                style={({ pressed }) => [
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing[4],
                    paddingVertical: theme.spacing[4],
                    paddingHorizontal: theme.spacing[3],
                    borderRadius: theme.radius.md,
                    backgroundColor: pressed ? theme.colors.backgroundSecondary : 'transparent',
                  },
                ]}
              >
                {row.icon}
                <Text variant="body">{row.label}</Text>
              </Pressable>
            ))}

            <Divider style={{ marginVertical: theme.spacing[4] }} />

            <Pressable
              onPress={() => changeTheme(themeName === 'dark' ? 'light' : 'dark')}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing[4],
                  paddingVertical: theme.spacing[4],
                  paddingHorizontal: theme.spacing[3],
                  borderRadius: theme.radius.md,
                  backgroundColor: pressed ? theme.colors.backgroundSecondary : 'transparent',
                },
              ]}
            >
              {themeName === 'dark' ? <Sun size={20} color={theme.colors.primary} /> : <Moon size={20} color={theme.colors.primary} />}
              <Text variant="body">{themeName === 'dark' ? 'Light mode' : 'Dark mode'}</Text>
            </Pressable>

            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing[4],
                  paddingVertical: theme.spacing[4],
                  paddingHorizontal: theme.spacing[3],
                  borderRadius: theme.radius.md,
                  backgroundColor: pressed ? theme.colors.dangerMuted : 'transparent',
                },
              ]}
            >
              <LogOut size={20} color={theme.colors.error} />
              <Text variant="body" color="error">
                Log out
              </Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
