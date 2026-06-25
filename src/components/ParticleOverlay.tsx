import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const Particle = ({ type, index, color }: { type: string, index: number, color: string }) => {
  // We use different starting positions depending on the particle type
  const translateY = useSharedValue(type === 'bubbles' ? height : -50);
  const translateX = useSharedValue(Math.random() * width);
  const opacity = useSharedValue(type === 'stars' ? Math.random() : 1);
  const scale = useSharedValue(Math.random() * 0.5 + 0.5);

  const duration = Math.random() * 4000 + 4000; // 4s to 8s
  const delay = Math.random() * 5000;
  
  // Stars get scattered randomly vertically
  const starY = (index * (height / 30) + Math.random() * 20) % height;

  useEffect(() => {
    if (type === 'snow') {
      translateY.value = withDelay(delay, withRepeat(withTiming(height + 50, { duration, easing: Easing.linear }), -1, false));
      translateX.value = withRepeat(
        withSequence(
          withTiming(translateX.value + 30, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(translateX.value - 30, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else if (type === 'bubbles') {
      translateY.value = withDelay(delay, withRepeat(withTiming(-50, { duration, easing: Easing.linear }), -1, false));
      translateX.value = withRepeat(
        withSequence(
          withTiming(translateX.value + 20, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(translateX.value - 20, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      // Fade out as it goes up
      opacity.value = withDelay(delay, withRepeat(withSequence(withTiming(1, {duration: 1000}), withTiming(0, {duration: duration - 1000})), -1, false));
    } else if (type === 'stars') {
      opacity.value = withDelay(delay, withRepeat(
        withSequence(
          withTiming(0.1, { duration: 1000 + Math.random() * 1000 }),
          withTiming(0.8, { duration: 1000 + Math.random() * 1000 })
        ),
        -1,
        true
      ));
    }
  }, [type]);

  const animatedStyle = useAnimatedStyle(() => {
    if (type === 'stars') {
      return {
        transform: [
          { translateY: starY },
          { translateX: translateX.value },
          { scale: scale.value }
        ] as any,
        opacity: opacity.value,
      };
    }
    return {
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }] as any,
      opacity: type === 'bubbles' ? opacity.value : 0.8,
    };
  });

  const size = type === 'snow' ? 14 : type === 'bubbles' ? 20 : 12;

  let iconName: keyof typeof Ionicons.glyphMap = 'ellipse';
  if (type === 'snow') iconName = 'snow-outline';
  else if (type === 'bubbles') iconName = 'ellipse-outline';
  else if (type === 'stars') iconName = 'star';

  return (
    <Animated.View style={[
      {
        position: 'absolute',
        width: size,
        height: size,
        top: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center',
      },
      animatedStyle
    ]}>
      <Ionicons name={iconName} size={size} color={color} />
    </Animated.View>
  );
};

export default function ParticleOverlay() {
  const { particles, colors } = useTheme();

  if (particles === 'none') return null;

  const count = 12; // 12 particles for optimized performance
  const items = Array.from({ length: count }, (_, i) => i);
  
  const particleColor = particles === 'snow' ? '#ffffff' : colors.primary;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {items.map((i) => (
        <Particle key={i} index={i} type={particles} color={particleColor} />
      ))}
    </View>
  );
}
