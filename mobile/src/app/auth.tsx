import React, { useEffect, useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { ArrowLeft, Mail, Lock, User as UserIcon, Phone } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/services/api';
import { Screen, Text, Button, IconButton, Input, Divider } from '@/components/ui';
import { GOOGLE_CLIENT_IDS } from '@/config/env';

WebBrowser.maybeCompleteAuthSession();

const googleNotConfigured = !GOOGLE_CLIENT_IDS.ios && !GOOGLE_CLIENT_IDS.android && !GOOGLE_CLIENT_IDS.web;

type Mode = 'login' | 'register';

export default function AuthScreen() {
  const theme = useAppTheme();
  const { loginWithPassword, registerWithPassword, signInWithGoogle, needsPhoneVerification } = useAuth();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<Mode>(params.mode === 'register' ? 'register' : 'login');

  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isRegister = mode === 'register';

  const [googleRequest, googleResponse, promptGoogle] = Google.useIdTokenAuthRequest({
    iosClientId: GOOGLE_CLIENT_IDS.ios || 'not-configured',
    androidClientId: GOOGLE_CLIENT_IDS.android || 'not-configured',
    webClientId: GOOGLE_CLIENT_IDS.web || 'not-configured',
  });
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  useEffect(() => {
    if (googleResponse?.type !== 'success') return;
    const idToken = googleResponse.params.id_token;
    if (!idToken) return;

    (async () => {
      setGoogleSubmitting(true);
      setFormError(null);
      try {
        await signInWithGoogle(idToken);
        router.replace(needsPhoneVerification ? '/otp' : '/(tabs)');
      } catch {
        setFormError('Could not sign you in with Google. Please try again.');
      } finally {
        setGoogleSubmitting(false);
      }
    })();
  }, [googleResponse, signInWithGoogle, needsPhoneVerification]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (isRegister) {
      if (!name.trim()) next.name = 'Enter your full name';
      if (!identifier.trim() || !identifier.includes('@')) next.identifier = 'Enter a valid email';
      if (phone.trim() && !/^\+[1-9]\d{6,14}$/.test(phone.trim())) next.phone = 'Use the format +2547XXXXXXXX';
    } else if (!identifier.trim()) {
      next.identifier = 'Enter your email or phone number';
    }
    if (password.length < 8) next.password = 'At least 8 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (isRegister) {
        await registerWithPassword(name, identifier, phone.trim() || null, password);
      } else {
        await loginWithPassword(identifier, password);
      }
      router.replace(needsPhoneVerification ? '/otp' : '/(tabs)');
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: theme.spacing[6], paddingBottom: theme.spacing[8] }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing[4] }}>
            <IconButton icon={<ArrowLeft size={20} color={theme.colors.text} />} onPress={() => router.back()} accessibilityLabel="Back" />
          </View>

          <View style={{ gap: theme.spacing[2], marginBottom: theme.spacing[7] }}>
            <Text variant="h1">{isRegister ? 'Create account' : 'Welcome back'}</Text>
            <Text variant="body" color="secondary">
              {isRegister
                ? 'Join VawaScents to shop fragrances and manage your wallet.'
                : 'Log in with your email or phone number.'}
            </Text>
          </View>

          <View style={{ gap: theme.spacing[4] }}>
            {isRegister && (
              <Input
                label="Full name"
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
                error={errors.name}
                leftIcon={<UserIcon size={18} color={theme.colors.textMuted} />}
              />
            )}
            <Input
              label={isRegister ? 'Email' : 'Email or phone'}
              autoCapitalize="none"
              keyboardType={isRegister ? 'email-address' : 'default'}
              value={identifier}
              onChangeText={setIdentifier}
              error={errors.identifier}
              leftIcon={<Mail size={18} color={theme.colors.textMuted} />}
            />
            {isRegister && (
              <Input
                label="Phone (optional)"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                error={errors.phone}
                helper="You can verify this later from your profile."
                leftIcon={<Phone size={18} color={theme.colors.textMuted} />}
              />
            )}
            <Input
              label="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              leftIcon={<Lock size={18} color={theme.colors.textMuted} />}
            />
          </View>

          {formError && (
            <Text variant="bodySmall" color="error" style={{ marginTop: theme.spacing[3] }}>
              {formError}
            </Text>
          )}

          <View style={{ marginTop: theme.spacing[6], gap: theme.spacing[4] }}>
            <Button title={isRegister ? 'Create account' : 'Log in'} onPress={submit} loading={submitting} fullWidth />

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing[2] }}>
              <Text variant="body" color="secondary">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}
              </Text>
              <Text
                variant="body"
                color="brand"
                onPress={() => {
                  setErrors({});
                  setFormError(null);
                  setMode(isRegister ? 'login' : 'register');
                }}
              >
                {isRegister ? 'Log in' : 'Sign up'}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[4], marginVertical: theme.spacing[7] }}>
            <Divider style={{ flex: 1 }} />
            <Text variant="caption" color="muted">
              OR
            </Text>
            <Divider style={{ flex: 1 }} />
          </View>

          {googleNotConfigured ? (
            <Text variant="bodySmall" color="muted" style={{ textAlign: 'center' }}>
              Google sign-in isn&apos;t configured yet — add EXPO_PUBLIC_GOOGLE_*_CLIENT_ID to your .env.
            </Text>
          ) : (
            <Button
              title="Continue with Google"
              variant="secondary"
              onPress={() => promptGoogle()}
              disabled={!googleRequest}
              loading={googleSubmitting}
              fullWidth
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
