import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { Image, ImageStyle } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

interface CoverImageProps {
  coverUrl?: string | null;
  style?: ImageStyle | ImageStyle[];
  placeholderStyle?: ViewStyle | ViewStyle[];
  iconSize?: number;
  blurRadius?: number;
  audioUri?: string;
  hq?: boolean;
}

export default function CoverImage({ coverUrl, style, placeholderStyle, iconSize = 24, blurRadius, audioUri, hq = false }: CoverImageProps) {
  const [activeCover, setActiveCover] = useState(coverUrl);

  useEffect(() => {
    setActiveCover(coverUrl);
    if (hq && audioUri && audioUri.startsWith('file://')) {
      let mounted = true;
      const fetchHq = async () => {
        try {
          const ExpoMusicScannerModule = require('../../modules/expo-music-scanner/src/ExpoMusicScannerModule').default;
          const hqCover = await ExpoMusicScannerModule.getHighQualityCover(audioUri);
          if (mounted && hqCover) setActiveCover(hqCover);
        } catch (e) {}
      };
      fetchHq();
      return () => { mounted = false; };
    }
  }, [coverUrl, audioUri, hq]);

  if (activeCover) {
    return (
      <View style={[style as any, { overflow: 'hidden' }]}>
        <Image 
          key={activeCover}
          source={{ uri: activeCover }} 
          style={{ width: '100%', height: '100%' }} 
          contentFit="cover"
          blurRadius={blurRadius}
          transition={200}
          cachePolicy="memory-disk"
        />
      </View>
    );
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
