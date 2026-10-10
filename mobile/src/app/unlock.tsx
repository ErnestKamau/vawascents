import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Fingerprint } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Screen, Text, Button } from '@/components/ui';

export default function UnlockScreen() {
  const theme = useAppTheme();
  const { unlock, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const tryUnlock = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const ok = await unlock();
      if (!ok) setError('Could not verify it was you. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const signOutInstead = async () => {
    await logout();
    router.replace('/onboarding');
  };

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing[8], gap: theme.spacing[6] }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.primaryMuted,
          }}
        >
          <Fingerprint size={32} color={theme.colors.primary} />
        </View>

        <View style={{ gap: theme.spacing[2] }}>
          <Text variant="h2" style={{ textAlign: 'center' }}>
            Welcome back
          </Text>
          <Text variant="body" color="secondary" style={{ textAlign: 'center' }}>
            Use Face ID or your fingerprint to unlock VawaScents.
          </Text>
        </View>

        {error && (
          <Text variant="bodySmall" color="error">
            {error}
          </Text>
        )}

        <Button title="Unlock" onPress={tryUnlock} loading={submitting} fullWidth />
        <Text variant="label" color="brand" onPress={signOutInstead}>
          Sign in a different way
        </Text>
      </View>
    </Screen>
  );
}
