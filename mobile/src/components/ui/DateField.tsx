import React, { useState } from 'react';
import { Pressable, View, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Text } from './Text';

type Props = {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string;
  helper?: string;
  maximumDate?: Date;
};

function format(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function DateField({ label, value, onChange, error, helper, maximumDate }: Props) {
  const theme = useAppTheme();
  const [open, setOpen] = useState(false);

  const borderColor = error ? theme.colors.error : theme.colors.border;

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          minHeight: theme.touchTarget + 8,
          borderRadius: theme.radius.md,
          borderWidth: 1.5,
          borderColor,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: theme.spacing[4],
          paddingTop: theme.spacing[4],
          paddingBottom: theme.spacing[3],
          justifyContent: 'center',
        }}
      >
        <Text variant="caption" color={error ? 'error' : 'muted'} style={{ position: 'absolute', left: theme.spacing[4] + 28, top: 6, fontSize: 11 }}>
          {label}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2], marginTop: 8 }}>
          <Calendar size={18} color={theme.colors.textMuted} />
          <Text variant="body" color={value ? 'primary' : 'muted'}>
            {value ? format(value) : 'Select date'}
          </Text>
        </View>
      </Pressable>
      {(error || helper) && (
        <Text variant="caption" color={error ? 'error' : 'muted'} style={{ marginTop: theme.spacing[2], marginLeft: theme.spacing[1] }}>
          {error || helper}
        </Text>
      )}

      {open && (
        <>
          <DateTimePicker
            value={value ?? new Date(2000, 0, 1)}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            maximumDate={maximumDate}
            onChange={(_, selected) => {
              if (Platform.OS !== 'ios') setOpen(false);
              if (selected) onChange(selected);
            }}
          />
          {Platform.OS === 'ios' && (
            <Pressable onPress={() => setOpen(false)} style={{ alignSelf: 'flex-end', paddingVertical: theme.spacing[2], paddingHorizontal: theme.spacing[3] }}>
              <Text variant="label" color="brand">
                Done
              </Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}
