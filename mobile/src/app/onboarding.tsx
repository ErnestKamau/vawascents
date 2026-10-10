import React from 'react';
import { View, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Screen, Text, Button, GlassSurface } from '@/components/ui';
import { softWhite } from '@/design';

const ONBOARDING_KEY = '@vawascents_has_seen_onboarding';
const { height } = Dimensions.get('window');
/** Always-light text over the hero photo, independent of light/dark theme mode. */
const onImage = { color: softWhite.primary };

export default function OnboardingScreen() {
  const theme = useAppTheme();

  const finish = async (mode: 'login' | 'register') => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace(`/auth?mode=${mode}` as any);
  };

  return (
    <ImageBackground
      source={require('../../assets/backgrounds/aura-onboarding.jpg')}
      style={styles.fill}
      resizeMode="cover"
    >
      <View style={[styles.scrim, { backgroundColor: theme.colors.overlay }]} />
      <Screen horizon={false} safe edges={['top', 'left', 'right', 'bottom']} style={{ backgroundColor: 'transparent' }}>
        <View style={[styles.fill, { paddingHorizontal: theme.spacing[6], paddingBottom: theme.spacing[6] }]}>
          <View style={{ flex: 1, justifyContent: 'center', minHeight: height * 0.3 }}>
            <Animated.View entering={FadeIn.duration(theme.duration.slow)}>
              <Text variant="overline" style={[onImage, { letterSpacing: 4, marginBottom: theme.spacing[3] }]}>
                VAWASCENTS
              </Text>
              <Text variant="display" style={[onImage, { fontSize: 44, lineHeight: 50 }]}>
                Find your{'\n'}signature scent
              </Text>
              <Text variant="bodyLarge" style={[onImage, { marginTop: theme.spacing[4], opacity: 0.85 }]}>
                Curated fragrances, delivered with care — and a wallet that pays your
                favorite store directly.
              </Text>
            </Animated.View>
          </View>

          <GlassSurface level={3} borderRadius={theme.radius.xl}>
            <Animated.View entering={FadeInDown.duration(theme.duration.normal)} style={{ padding: theme.spacing[6], gap: theme.spacing[3] }}>
              <Button
                title="Create account"
                onPress={() => finish('register')}
                fullWidth
                rightIcon={<ArrowRight size={18} color={theme.colors.textOnPrimary} />}
              />
              <Button title="Log in" variant="ghost" onPress={() => finish('login')} fullWidth />
            </Animated.View>
          </GlassSurface>
        </View>
      </Screen>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
