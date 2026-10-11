import React from 'react';
import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Text } from './Text';
import { DeliveryStatus, DeliveryStatusEvent, DELIVERY_STATUS_LABEL, DELIVERY_STATUS_ORDER } from '@/services/deliveryApi';

type Props = {
  status: DeliveryStatus;
  events?: DeliveryStatusEvent[];
};

function formatTime(iso?: string) {
  if (!iso) return undefined;
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function DeliveryStatusTimeline({ status, events = [] }: Props) {
  const theme = useAppTheme();
  const currentIndex = DELIVERY_STATUS_ORDER.indexOf(status);
  const eventByStatus = new Map(events.map((e) => [e.status, e]));

  return (
    <View>
      {DELIVERY_STATUS_ORDER.map((step, index) => {
        const isDone = index < currentIndex || (index === currentIndex && status === 'collected');
        const isCurrent = index === currentIndex && status !== 'collected';
        const isLast = index === DELIVERY_STATUS_ORDER.length - 1;
        const event = eventByStatus.get(step);

        const lineColor = index < currentIndex ? theme.colors.primary : theme.colors.border;

        return (
          <View key={step} style={{ flexDirection: 'row' }}>
            <View style={{ alignItems: 'center', width: 28 }}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDone || isCurrent ? theme.colors.primary : theme.colors.surface,
                  borderWidth: isDone || isCurrent ? 0 : 1.5,
                  borderColor: theme.colors.border,
                }}
              >
                {isDone ? (
                  <Check size={13} color={theme.colors.textOnPrimary} />
                ) : isCurrent ? (
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.textOnPrimary }} />
                ) : null}
              </View>
              {!isLast && <View style={{ width: 2, flex: 1, minHeight: 28, backgroundColor: lineColor, marginTop: 2 }} />}
            </View>

            <View style={{ flex: 1, paddingBottom: theme.spacing[5] }}>
              <Text variant="label" color={isDone || isCurrent ? 'primary' : 'muted'}>
                {DELIVERY_STATUS_LABEL[step]}
              </Text>
              {event?.occurred_at && (
                <Text variant="caption" color="muted">
                  {formatTime(event.occurred_at)}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
