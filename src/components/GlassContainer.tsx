import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import type { BlurTint } from 'expo-blur';

interface GlassContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: BlurTint;
}

export default function GlassContainer({ children, style, contentContainerStyle, intensity = 40, tint = 'light' }: GlassContainerProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.content, contentContainerStyle]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    borderColor: '#000000',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 15,
  }
});
