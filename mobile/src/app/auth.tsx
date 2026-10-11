import React, { useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Mail, Lock, User as UserIcon, Phone } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/services/api';
import {
  Text,
  Button,
  Input,
  Divider,
  Checkbox,
  SegmentedControl,
  DateField,
  GoogleIcon,
  LottieIcon,
  AuthBackdrop,
} from '@/components/ui';
import { GOOGLE_CLIENT_IDS } from '@/config/env';

WebBrowser.maybeCompleteAuthSession();

// expo-auth-session needs the client ID for the *current* platform specifically —
// the web client ID doesn't cover native iOS/Android requests.
const googleNotConfigured = !(Platform.OS === 'ios'
  ? GOOGLE_CLIENT_IDS.ios
  : Platform.OS === 'android'
    ? GOOGLE_CLIENT_IDS.android
    : GOOGLE_CLIENT_IDS.web);

type Mode = 'login' | 'register';
type Gender = 'male' | 'female' | 'other';

const thirteenYearsAgo = new Date();
thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13);

export default function AuthScreen() {
  const theme = useAppTheme();
  const { loginWithPassword, registerWithPassword, signInWithGoogle, needsPhoneVerification } = useAuth();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<Mode>(params.mode === 'register' ? 'register' : 'login');

  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
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

  const switchMode = (next: Mode) => {
    setErrors({});
    setFormError(null);
    setMode(next);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (isRegister) {
      if (!name.trim()) next.name = 'Enter your full name';
      if (!identifier.trim() || !identifier.includes('@')) next.identifier = 'Enter a valid email';
      if (!phone.trim() || !/^\+[1-9]\d{6,14}$/.test(phone.trim())) next.phone = 'Use the format +2547XXXXXXXX';
      if (!dateOfBirth) next.dateOfBirth = 'Select your date of birth';
      else if (dateOfBirth > thirteenYearsAgo) next.dateOfBirth = 'You must be at least 13 years old';
      if (!gender) next.gender = 'Select an option';
      if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match';
      if (!termsAccepted) next.terms = 'You must accept the terms to continue';
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
        await registerWithPassword({
          name,
          email: identifier,
          phone: phone.trim(),
          dateOfBirth: dateOfBirth!.toISOString().slice(0, 10),
          gender: gender!,
          password,
          termsAccepted,
        });
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
    <AuthBackdrop
      showBack={false}
      icon={<LottieIcon source="sparkle" size={76} />}
      title={isRegister ? 'Create account' : 'Welcome back'}
      subtitle={
        isRegister
          ? 'Join VawaScents to shop fragrances and manage your wallet.'
          : 'Log in with your email or phone number.'
      }
      footer={
        <View style={{ gap: theme.spacing[5] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[4] }}>
            <Divider style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
            <Text variant="caption" style={{ color: 'rgba(255,255,255,0.75)' }}>
              OR
            </Text>
            <Divider style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
          </View>

          {googleNotConfigured ? (
            <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
              Google sign-in isn&apos;t configured yet — add EXPO_PUBLIC_GOOGLE_*_CLIENT_ID to your .env.
            </Text>
          ) : (
            <Button
              title="Continue with Google"
              variant="secondary"
              leftIcon={<GoogleIcon size={18} />}
              onPress={() => promptGoogle()}
              disabled={!googleRequest}
              loading={googleSubmitting}
              fullWidth
            />
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing[2] }}>
            <Text variant="body" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {isRegister ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <Text variant="body" style={{ color: theme.colors.gold }} onPress={() => switchMode(isRegister ? 'login' : 'register')}>
              {isRegister ? 'Log in' : 'Sign up'}
            </Text>
          </View>
        </View>
      }
    >
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
          <>
            <Input
              label="Phone number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              error={errors.phone}
              helper="Include your country code, e.g. +2547XXXXXXXX"
              leftIcon={<Phone size={18} color={theme.colors.textMuted} />}
            />
            <DateField label="Date of birth" value={dateOfBirth} onChange={setDateOfBirth} error={errors.dateOfBirth} maximumDate={thirteenYearsAgo} />
            <SegmentedControl
              label="Gender"
              value={gender}
              onChange={setGender}
              error={errors.gender}
              options={[
                { value: 'female', label: 'Female' },
                { value: 'male', label: 'Male' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </>
        )}
        <Input
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          leftIcon={<Lock size={18} color={theme.colors.textMuted} />}
        />
        {isRegister && (
          <Input
            label="Confirm password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            leftIcon={<Lock size={18} color={theme.colors.textMuted} />}
          />
        )}
        {!isRegister && (
          <Text variant="bodySmall" color="brand" style={{ textAlign: 'right' }} onPress={() => router.push('/forgot-password')}>
            Forgot password?
          </Text>
        )}
        {isRegister && (
          <Checkbox
            checked={termsAccepted}
            onChange={setTermsAccepted}
            error={errors.terms}
            label={
              <Text variant="bodySmall" color="secondary">
                I agree to the{' '}
                <Text variant="bodySmall" color="brand">
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text variant="bodySmall" color="brand">
                  Privacy Policy
                </Text>
              </Text>
            }
          />
        )}
      </View>

      {formError && (
        <Text variant="bodySmall" color="error" style={{ marginTop: theme.spacing[3] }}>
          {formError}
        </Text>
      )}

      <Button
        title={isRegister ? 'Create account' : 'Log in'}
        onPress={submit}
        loading={submitting}
        fullWidth
        style={{ marginTop: theme.spacing[6] }}
      />
    </AuthBackdrop>
  );
}
