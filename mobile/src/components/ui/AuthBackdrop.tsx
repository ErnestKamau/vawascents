import React from 'react';
import { View, StyleSheet, ImageBackground, ScrollView, KeyboardAvoidingView, Platform, ViewStyle, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useAppTheme, AuthThemeProvider } from '@/contexts/ThemeContext';
import { softWhite } from '@/design';
import { Text } from './Text';
import { IconButton } from './Button';
import { GlassSurface } from './GlassSurface';

type Props = {
  /** Shows a back chevron over the hero image; omit on the root auth screen. */
  showBack?: boolean;
  /** Where to land if there's no navigation history to go back to (e.g. opened via a deep link). */
  fallbackHref?: string;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  cardStyle?: StyleProp<ViewStyle>;
};

const onImage = { color: softWhite.primary };

/**
 * Shared visual shell for auth-adjacent screens (login, register, OTP, forgot password):
 * the onboarding hero photo behind a scrim, with content in a floating glass card.
 * The back button is pinned to the top edge independently so centering the form
 * content vertically (on screens short enough to allow it) never drags it along.
 */
export function AuthBackdrop(props: Props) {
  return (
    <AuthThemeProvider>
      <AuthBackdropInner {...props} />
    </AuthThemeProvider>
  );
}

function AuthBackdropInner({ showBack = true, fallbackHref = '/auth', icon, title, subtitle, children, footer, cardStyle }: Props) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackHref as any);
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/backgrounds/aura-onboarding.jpg')}
      style={styles.fill}
      resizeMode="cover"
    >
      <View style={[styles.scrim, { backgroundColor: theme.colors.overlay }]} />

      {showBack && (
        <View style={{ position: 'absolute', top: insets.top + theme.spacing[3], left: theme.spacing[4], zIndex: 1 }}>
          <IconButton icon={<ArrowLeft size={20} color={softWhite.primary} />} onPress={goBack} accessibilityLabel="Back" />
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: theme.spacing[6],
            paddingTop: (showBack ? insets.top + theme.spacing[10] : insets.top) + theme.spacing[7],
            paddingBottom: theme.spacing[8],
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(theme.duration.slow)} style={{ alignItems: icon ? 'center' : 'flex-start', marginBottom: theme.spacing[7] }}>
            {icon && <View style={{ marginBottom: theme.spacing[4] }}>{icon}</View>}
            <Text variant="h1" style={[onImage, !!icon && { textAlign: 'center' }]}>
              {title}
            </Text>
            {subtitle && (
              <Text variant="body" style={[onImage, { opacity: 0.85, marginTop: theme.spacing[2] }, !!icon && { textAlign: 'center' }]}>
                {subtitle}
              </Text>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(theme.duration.normal).delay(80)}>
            <GlassSurface level={3} borderRadius={theme.radius.xl} style={cardStyle}>
              <View style={{ padding: theme.spacing[6] }}>{children}</View>
            </GlassSurface>
          </Animated.View>

          {footer && <View style={{ marginTop: theme.spacing[6] }}>{footer}</View>}
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
