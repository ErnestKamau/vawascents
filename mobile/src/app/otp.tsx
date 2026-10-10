import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Phone, ShieldCheck } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/services/api';
import { Screen, Text, Button, Input } from '@/components/ui';

type Step = 'phone' | 'code';

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
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid or expired code.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: theme.spacing[7], gap: theme.spacing[6] }}>
          {step === 'phone' ? (
            <>
              <View style={{ gap: theme.spacing[2] }}>
                <Text variant="h2">Verify your phone</Text>
                <Text variant="body" color="secondary">
                  We&apos;ll text you a 6-digit code to confirm it&apos;s really you.
                </Text>
              </View>
              <Input
                label="Phone number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                leftIcon={<Phone size={18} color={theme.colors.textMuted} />}
                helper="Include your country code, e.g. +2547XXXXXXXX"
              />
              {error && (
                <Text variant="bodySmall" color="error">
                  {error}
                </Text>
              )}
              <Button title="Send code" onPress={requestCode} loading={submitting} fullWidth />
            </>
          ) : (
            <>
              <View style={{ gap: theme.spacing[2] }}>
                <Text variant="h2">Enter the code</Text>
                <Text variant="body" color="secondary">
                  Sent to {phone}.{' '}
                  <Text variant="body" color="brand" onPress={() => setStep('phone')}>
                    Change
                  </Text>
                </Text>
              </View>
              <Input
                label="6-digit code"
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={setCode}
                leftIcon={<ShieldCheck size={18} color={theme.colors.textMuted} />}
              />
              {error && (
                <Text variant="bodySmall" color="error">
                  {error}
                </Text>
              )}
              <Button title="Verify" onPress={confirmCode} loading={submitting} disabled={code.length !== 6} fullWidth />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
