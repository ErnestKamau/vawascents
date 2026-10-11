import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Phone, ShieldCheck } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/services/api';
import { Text, Button, Input, LottieIcon, AuthBackdrop } from '@/components/ui';

type Step = 'phone' | 'code' | 'done';

export default function OtpScreen() {
  const theme = useAppTheme();
  const { sendOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('+254');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const requestCode = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await sendOtp(phone);
      setStep('code');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send a code. Check the number and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmCode = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await verifyOtp(phone, code);
      setStep('done');
      setTimeout(() => router.replace('/(tabs)'), 900);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid or expired code.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'done') {
    return (
      <AuthBackdrop showBack={false} icon={<LottieIcon source="success" size={84} loop={false} />} title="You're verified!" subtitle="Taking you to VawaScents…">
        <View style={{ alignItems: 'center', paddingVertical: theme.spacing[4] }}>
          <Text variant="body" color="secondary">
            Welcome aboard.
          </Text>
        </View>
      </AuthBackdrop>
    );
  }

  return (
    <AuthBackdrop
      icon={<LottieIcon source="sparkle" size={76} />}
      title={step === 'phone' ? 'Verify your phone' : 'Enter the code'}
      subtitle={
        step === 'phone'
          ? "We'll text you a 6-digit code to confirm it's really you."
          : `Sent to ${phone}.`
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
            <Button title="Send code" onPress={requestCode} loading={submitting} fullWidth style={{ marginTop: theme.spacing[2] }} />
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
            {error && <Text variant="bodySmall" color="error">{error}</Text>}
            <Button title="Verify" onPress={confirmCode} loading={submitting} disabled={code.length !== 6} fullWidth style={{ marginTop: theme.spacing[2] }} />
          </>
        )}
      </View>
    </AuthBackdrop>
  );
}
