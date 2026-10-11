import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Phone, ShieldCheck, Lock } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { authApi, ApiError } from '@/services/api';
import { Text, Button, Input, LottieIcon, AuthBackdrop } from '@/components/ui';

type Step = 'phone' | 'reset' | 'done';

export default function ForgotPasswordScreen() {
  const theme = useAppTheme();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('+254');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const requestCode = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await authApi.forgotPassword(phone);
      setStep('reset');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send a code. Check the number and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = async () => {
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.resetPassword(phone, code, password);
      setStep('done');
      setTimeout(() => router.replace('/auth?mode=login' as any), 1200);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid or expired code.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'done') {
    return (
      <AuthBackdrop showBack={false} icon={<LottieIcon source="success" size={84} loop={false} />} title="Password updated" subtitle="Taking you to log in…">
        <View style={{ alignItems: 'center', paddingVertical: theme.spacing[4] }}>
          <Text variant="body" color="secondary">
            You can now log in with your new password.
          </Text>
        </View>
      </AuthBackdrop>
    );
  }

  return (
    <AuthBackdrop
      icon={<LottieIcon source="sparkle" size={76} />}
      title={step === 'phone' ? 'Forgot password?' : 'Set a new password'}
      subtitle={
        step === 'phone'
          ? "Enter your phone number and we'll text you a reset code."
          : `Enter the code sent to ${phone} and choose a new password.`
      }
    >
      <View style={{ gap: theme.spacing[4] }}>
        {step === 'phone' ? (
          <>
            <Input
              label="Phone number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              leftIcon={<Phone size={18} color={theme.colors.textMuted} />}
              helper="Include your country code, e.g. +2547XXXXXXXX"
            />
            {error && <Text variant="bodySmall" color="error">{error}</Text>}
            <Button title="Send reset code" onPress={requestCode} loading={submitting} fullWidth style={{ marginTop: theme.spacing[2] }} />
          </>
        ) : (
          <>
            <Text variant="bodySmall" color="brand" onPress={() => setStep('phone')}>
              Change number
            </Text>
            <Input
              label="6-digit code"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
              leftIcon={<ShieldCheck size={18} color={theme.colors.textMuted} />}
            />
            <Input
              label="New password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              leftIcon={<Lock size={18} color={theme.colors.textMuted} />}
            />
            <Input
              label="Confirm new password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              leftIcon={<Lock size={18} color={theme.colors.textMuted} />}
            />
            {error && <Text variant="bodySmall" color="error">{error}</Text>}
            <Button title="Reset password" onPress={reset} loading={submitting} disabled={code.length !== 6} fullWidth style={{ marginTop: theme.spacing[2] }} />
          </>
        )}
      </View>
    </AuthBackdrop>
  );
}
