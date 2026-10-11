import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Eye, EyeOff, Lock } from 'lucide-react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Input, InputProps } from './Input';

type Props = Omit<InputProps, 'secureTextEntry' | 'leftIcon' | 'rightIcon'>;

/** Input with a built-in show/hide toggle — used for every password field. */
export function PasswordInput(props: Props) {
  const theme = useAppTheme();
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      secureTextEntry={!visible}
      leftIcon={<Lock size={18} color={theme.colors.textMuted} />}
      rightIcon={
        <Pressable
          onPress={() => setVisible((v) => !v)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={18} color={theme.colors.textMuted} /> : <Eye size={18} color={theme.colors.textMuted} />}
        </Pressable>
      }
    />
  );
}
