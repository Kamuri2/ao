import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAudio } from '../context/AudioContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import CoverImage from './CoverImage';

type RootStackParamList = {
  Player: undefined;
};

export default function MiniPlayer() {
  const { currentSong, isPlaying, pauseOrResumeSound, playNext, playPrevious, metadata } = useAudio();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  if (!currentSong) return null;

  return (
    <View style={[styles.wrapper, { bottom: 65 + insets.bottom }]}>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => navigation.navigate('Player')}
        style={styles.touchable}
      >
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.content}>
            <CoverImage 
              coverUrl={metadata.cover} 
              style={[styles.coverImage, { borderColor: colors.border }]} 
              placeholderStyle={[styles.placeholderCover, { backgroundColor: colors.card, borderColor: colors.border }]} 
            />

            <View style={styles.info}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {currentSong.filename}
              </Text>
              <Text style={[styles.subtitle, { color: colors.subText }]} numberOfLines={1}>
                {currentSong.artist || 'Desconocido'}
              </Text>
            </View>

            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.sideButton} onPress={(e) => { e.stopPropagation(); playPrevious(); }}>
                <Ionicons name="play-skip-back" size={24} color={colors.text} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.playButton, { backgroundColor: colors.primary, borderColor: colors.border }]} 
                onPress={(e) => {
                  e.stopPropagation();
                  pauseOrResumeSound();
                }}
              >
                <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#000000" style={{ marginLeft: isPlaying ? 0 : 2 }} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.sideButton} onPress={(e) => { e.stopPropagation(); playNext(); }}>
                <Ionicons name="play-skip-forward" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 70,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  touchable: {
    flex: 1,
  },
  container: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  coverImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    borderWidth: 2,
  },
  placeholderCover: {
    width: 50,
    height: 50,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  playButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 8,
    borderWidth: 2,
  },
  sideButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
