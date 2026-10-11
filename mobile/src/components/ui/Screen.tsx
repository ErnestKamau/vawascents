import React from 'react';
import { View, StyleSheet, ViewProps, StatusBar } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/contexts/ThemeContext';

type Props = ViewProps & {
  children: React.ReactNode;
  /** Show ambient aura wash */
  horizon?: boolean;
  edges?: Edge[];
  safe?: boolean;
};

export function Screen({ children, horizon = true, edges = ['top', 'left', 'right'], safe = true, style, ...rest }: Props) {
  const theme = useAppTheme();
  const isDark = theme.mode === 'dark';

  const content = (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }, style]} {...rest}>
      {horizon && !isDark && (
        <LinearGradient
          colors={[theme.colors.horizonStart, theme.colors.horizonMid, theme.colors.horizonEnd]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.5 }}
          style={[StyleSheet.absoluteFill, { opacity: 0.55 }]}
          pointerEvents="none"
        />
      )}
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      {children}
    </View>
  );

  if (!safe) return content;

  return (
    <SafeAreaView style={styles.fill} edges={edges}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
