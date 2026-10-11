import React, { useEffect } from 'react';
import { View, Modal, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, XCircle } from 'lucide-react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Text } from './Text';
import { Button } from './Button';

export type StatusSheetState = 'processing' | 'success' | 'error';

type Props = {
  visible: boolean;
  state: StatusSheetState;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
};

/** Bottom-sheet status feedback (processing → success/error) for blocking flows like checkout. */
export function StatusSheet({ visible, state, title, subtitle, actionLabel, onAction, onClose }: Props) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const translateY = useSharedValue(height);
  const iconScale = useSharedValue(0.6);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
    } else {
      translateY.value = withTiming(height, { duration: 220, easing: Easing.in(Easing.cubic) });
    }
  }, [visible, height, translateY]);

  useEffect(() => {
    if (state !== 'processing') {
      iconScale.value = withSequence(withTiming(0.6, { duration: 0 }), withSpring(1, theme.spring.snappy));
    }
  }, [state, iconScale, theme.spring]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }));

  const palette =
    state === 'success'
      ? { bg: theme.colors.successMuted, fg: theme.colors.success, Icon: CheckCircle2 }
      : state === 'error'
        ? { bg: theme.colors.dangerMuted, fg: theme.colors.error, Icon: XCircle }
        : { bg: theme.colors.backgroundSecondary, fg: theme.colors.primary, Icon: null };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: theme.colors.overlay }}
          onPress={state === 'processing' ? undefined : onClose}
        />

        <Animated.View
          style={[
            theme.getElevation('elv700'),
            {
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radius['2xl'],
              borderTopRightRadius: theme.radius['2xl'],
              paddingTop: theme.spacing[6],
              paddingBottom: insets.bottom + theme.spacing[6],
              paddingHorizontal: theme.spacing[6],
              alignItems: 'center',
              gap: theme.spacing[3],
            },
            sheetStyle,
          ]}
        >
          <View style={{ width: 44, height: 4, borderRadius: 2, backgroundColor: theme.colors.border, marginBottom: theme.spacing[3] }} />

          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: palette.bg,
            }}
          >
            {state === 'processing' ? (
              <ActivityIndicator size="large" color={palette.fg} />
            ) : (
              <Animated.View style={iconStyle}>
                {palette.Icon && <palette.Icon size={36} color={palette.fg} />}
              </Animated.View>
            )}
          </View>

          <Text variant="h3" style={{ textAlign: 'center', marginTop: theme.spacing[2] }}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="body" color="muted" style={{ textAlign: 'center' }}>
              {subtitle}
            </Text>
          )}

          {state !== 'processing' && actionLabel && (
            <Button title={actionLabel} fullWidth onPress={onAction} style={{ marginTop: theme.spacing[4] }} />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}
