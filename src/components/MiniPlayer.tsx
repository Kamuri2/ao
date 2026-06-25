import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAudio } from '../context/AudioContext';
import TrackPlayer, { State, usePlaybackState } from 'react-native-track-player';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import CoverImage from './CoverImage';
import { BlurView } from 'expo-blur';

type RootStackParamList = {
  Player: undefined;
};

type MiniPlayerProps = {
  currentRoute?: string;
};

export default function MiniPlayer({ currentRoute }: MiniPlayerProps) {
  const { currentSong, pauseOrResumeSound, playNext, metadata } = useAudio();
  const playbackState = usePlaybackState();
  const isPlaying = playbackState.state === State.Playing;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();

  if (!currentSong || currentRoute === 'Settings' || currentRoute === 'Player') return null;

  return (
    <View style={[styles.wrapper, { bottom: 65 + insets.bottom }]}>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => navigation.navigate('Player')}
        style={styles.touchable}
      >
        <BlurView 
          intensity={60} 
          tint={isDarkMode ? 'dark' : 'light'} 
          style={[styles.container, { borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
        >
          <View style={styles.content}>
            <CoverImage 
              coverUrl={metadata.cover} 
              style={styles.coverImage} 
              placeholderStyle={[styles.placeholderCover, { backgroundColor: 'transparent' }]} 
              hq={true}
              audioUri={currentSong.uri}
            />

            <View style={styles.info}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{currentSong.title || currentSong.filename}</Text>
              <Text style={[styles.subtitle, { color: colors.subText }]} numberOfLines={1}>
                {currentSong.artist || 'Desconocido'}
              </Text>
            </View>

            <View style={styles.controlsRow}>              
              <TouchableOpacity 
                style={[styles.playButton]} 
                onPress={(e) => {
                  e.stopPropagation();
                  pauseOrResumeSound();
                }}
              >
                <Ionicons name={isPlaying ? "pause" : "play"} size={26} color={colors.text} style={{ marginLeft: isPlaying ? 0 : 2 }} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.sideButton} onPress={(e) => { e.stopPropagation(); playNext(); }}>
                <Ionicons name="play-skip-forward" size={24} color={colors.subText} />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  touchable: {
    flex: 1,
  },
  container: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.1)', // Subtle tint over the blur
  },
  coverImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  placeholderCover: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  playButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    marginHorizontal: 4,
  },
  sideButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
