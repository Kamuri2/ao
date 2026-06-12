import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import type { ImageStyle, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CoverImageProps {
  coverUrl?: string | null;
  style?: ImageStyle | ImageStyle[];
  placeholderStyle?: ViewStyle | ViewStyle[];
  iconSize?: number;
}

export default function CoverImage({ coverUrl, style, placeholderStyle, iconSize = 24 }: CoverImageProps) {
  if (coverUrl) {
    return <Image source={{ uri: coverUrl }} style={style as any} resizeMode="cover" />;
  }

  return (
    <View style={[styles.placeholderThumbnail, placeholderStyle]}>
      <Ionicons name="musical-notes" size={iconSize} color="#000000" />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholderThumbnail: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
});
