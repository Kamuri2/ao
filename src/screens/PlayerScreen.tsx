import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import CoverImage from '../components/CoverImage';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const coverSize = width * 0.85;

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default function PlayerScreen({ navigation }: any) {
  const { 
    currentSong, 
    isPlaying, 
    pauseOrResumeSound, 
    playNext, 
    playPrevious, 
    metadata,
    position,
    duration,
    seekTo
  } = useAudio();
  
  const { colors } = useTheme();
  const [isSliding, setIsSliding] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    if (!isSliding) {
      setSliderValue(position || 0);
    }
  }, [position, isSliding]);

  const handleSlidingComplete = (val: number) => {
    seekTo(val);
    setIsSliding(false);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Trigger swipe if moving mostly down
        return gestureState.dy > 20 && Math.abs(gestureState.vx) < Math.abs(gestureState.vy);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 50 && gestureState.vy > 0.3) {
          navigation.goBack();
        }
      },
    })
  ).current;

  if (!currentSong) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-down" size={36} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>No hay canción reproduciéndose</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} {...panResponder.panHandlers}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-down" size={36} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Reproduciendo ahora</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.coverContainerWrapper, { backgroundColor: colors.card, borderColor: colors.border, width: coverSize, height: coverSize }]}>
          <CoverImage 
             coverUrl={metadata.cover} 
             style={[styles.coverImage, { borderColor: colors.border }]} 
             placeholderStyle={[styles.placeholderCover, { backgroundColor: colors.card }]} 
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{currentSong.filename}</Text>
          <Text style={[styles.subtitle, { color: colors.subText }]}>{currentSong.artist || 'Desconocido'}</Text>
          <Text style={[styles.folderText, { color: colors.subText }]}>💿 Álbum: {currentSong.album || 'Desconocido'}</Text>
          <Text style={[styles.folderText, { color: colors.subText }]}>📁 Carpeta: {currentSong.folder || 'Desconocido'}</Text>
        </View>

        <View style={styles.controlsContainerWrapper}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration || 1}
            value={sliderValue}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.border}
            onSlidingStart={() => setIsSliding(true)}
            onValueChange={(val) => setSliderValue(val)}
            onSlidingComplete={handleSlidingComplete}
          />
          <View style={styles.timeContainer}>
            <Text style={[styles.timeText, { color: colors.text }]}>{formatTime(sliderValue)}</Text>
            <Text style={[styles.timeText, { color: colors.text }]}>{formatTime(duration)}</Text>
          </View>
          
          <View style={styles.controlsContainer}>
            <TouchableOpacity onPress={playPrevious} style={styles.controlButton}>
              <Ionicons name="play-skip-back" style={[styles.controlIcon, { color: colors.text }]} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={pauseOrResumeSound} style={[styles.playButton, { backgroundColor: colors.primary, borderColor: colors.border }]}>
              <Ionicons name={isPlaying ? "pause" : "play"} style={[styles.playIcon, { color: '#000' }]} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={playNext} style={styles.controlButton}>
              <Ionicons name="play-skip-forward" style={[styles.controlIcon, { color: colors.text }]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 20,
  },
  backButton: {
    padding: 10,
    marginLeft: -10,
  },
  backButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  coverContainerWrapper: {
    width: 320,
    height: 320,
    marginBottom: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    backgroundColor: '#FFFFFF',
  },
  coverContainer: {
    padding: 0,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  placeholderCover: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  title: {
    color: '#000000',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  folderText: {
    color: '#4A4A4A',
    fontSize: 14,
    marginTop: 5,
  },
  sliderContainer: {
    width: '100%',
    marginBottom: 30,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  timeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  controlsContainerWrapper: {
    width: '85%',
    borderRadius: 8,
    marginBottom: 40,
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  controlButton: {
    padding: 15,
  },
  controlIcon: {
    color: '#000000',
    fontSize: 28,
  },
  playButton: {
    backgroundColor: '#30c296',
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 30,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  playIcon: {
    color: '#000000',
    fontSize: 34,
    marginLeft: 4,
  },
  lyricsContainerWrapper: {
    width: '100%',
    borderRadius: 8,
    marginBottom: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  lyricsContainer: {
    padding: 25,
  },
  lyricsTitle: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 15,
  },
  lyricsText: {
    color: '#000000',
    fontSize: 16,
    lineHeight: 28,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
