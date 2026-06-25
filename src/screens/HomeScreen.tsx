import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ListRenderItemInfo, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAudio } from '../context/AudioContext';
import { Song } from '../types';
import { useTheme } from '../context/ThemeContext';
import CoverImage from '../components/CoverImage';
import tw from 'twrnc';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const SongListItem = React.memo(({ item, isPlaying, onPress, index, colors }: any) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View entering={FadeInDown.delay(index * 30).duration(400).springify()} style={styles.songCardWrapper}>
      <AnimatedTouchableOpacity
        onPressIn={() => { scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        onPress={onPress}
        activeOpacity={0.7}
        style={[
          styles.songItemContent,
          animatedStyle,
          { backgroundColor: 'transparent' } // Always transparent, relying on app background
        ]}
      >
        <CoverImage
          coverUrl={item.cover || null}
          style={styles.thumbnail}
          placeholderStyle={[styles.placeholderThumbnail, { backgroundColor: colors.card }]}
          hq={true}
          audioUri={item.uri}
        />
        <View style={styles.songInfo}>
          <Text style={[styles.songTitle, { color: isPlaying ? colors.primary : colors.text }]} numberOfLines={1}>
            {item.title || item.filename}
          </Text>
          <Text style={[styles.songArtist, { color: colors.subText }]} numberOfLines={1}>
            {item.artist || 'Desconocido'}
          </Text>
        </View>
        {isPlaying && (
          <Ionicons name="cellular" size={18} color={colors.primary} style={{ marginLeft: 10 }} />
        )}
      </AnimatedTouchableOpacity>
    </Animated.View>
  );
});

export default function HomeScreen() {
  const { songs, playSound, playWithShuffle, currentSong, loadSongsFromUri, queueLength, queuePosition } = useAudio();
  const { colors, isDarkMode, toggleTheme, backgroundImage } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  useEffect(() => {
    loadSongsFromUri();
  }, []);

  const handlePlaySound = React.useCallback((item: Song) => {
    playSound(item);
  }, [playSound]);

  const handleShuffle = () => {
    if (songs.length === 0) return;
    playWithShuffle('all', songs);
  };

  const renderItem = React.useCallback(({ item, index }: ListRenderItemInfo<Song>) => {
    return (
      <SongListItem
        item={item}
        index={index > 15 ? 15 : index}
        isPlaying={currentSong?.id === item.id}
        onPress={() => handlePlaySound(item)}
        colors={colors}
        backgroundImage={backgroundImage}
      />
    );
  }, [currentSong?.id, handlePlaySound, colors, backgroundImage]);

  const getItemLayout = (data: any, index: number) => ({
    length: 120, // Increased for bigger covers
    offset: 120 * index,
    index,
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: backgroundImage ? 'transparent' : colors.background }]}>
      {/* Floating Buttons */}
      <View style={[styles.floatingControls, { top: insets.top + 10 }]}>
        <TouchableOpacity
          style={[styles.floatingBtn, { backgroundColor: 'transparent', borderColor: colors.border }]}
          onPress={(e) => toggleTheme(e.nativeEvent.pageX, e.nativeEvent.pageY)}
          activeOpacity={0.8}
        >
          <Ionicons name={isDarkMode ? "sunny" : "moon"} size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.floatingBtn, { backgroundColor: 'transparent', borderColor: colors.border }]}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.8}
        >
          <Ionicons name="settings" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <Animated.Text entering={FadeInDown.duration(600).springify()} style={[styles.mainTitle, { color: colors.text, marginTop: insets.top + 12 }]}>
        Musica
      </Animated.Text>

      {songs.length > 0 && (
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.queueHeader}>
          <View style={styles.queueInfo}>
            <Ionicons name="list" size={30} color={colors.primary} />
            <Text style={[styles.queueText, { color: colors.subText }]}>
              {currentSong ? `Reproduciendo ${queuePosition} de ${queueLength}` : `${songs.length} canciones`}
            </Text>
          </View>
          <TouchableOpacity style={[styles.shuffleButton, { backgroundColor: colors.primary }]} onPress={handleShuffle}>
            <Ionicons name="shuffle" size={20} color="#000" />
            <Text style={styles.shuffleText}>Aleatorio</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {songs.length === 0 ? (
        <Animated.View entering={FadeInDown.duration(600)} style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>No hay canciones cargadas.</Text>
          <Text style={[styles.emptySubText, { color: colors.subText }]}>Ve a Configuración para seleccionar una carpeta.</Text>
          <TouchableOpacity
            style={[styles.selectFolderBtn, { borderColor: colors.border, backgroundColor: 'transparent', borderWidth: 1 }]}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.8}
          >
            <Text style={[styles.selectFolderText, { color: colors.text }]}>Ir a Configuración</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          extraData={currentSong?.id}
          getItemLayout={getItemLayout}
          contentContainerStyle={[styles.listContainer, currentSong ? { paddingBottom: 160 + insets.bottom } : { paddingBottom: insets.bottom }]}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingControls: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    zIndex: 100,
  },
  floatingBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  mainTitle: {
    fontSize: 50,
    fontWeight: '900',
    textTransform: 'capitalize',
    letterSpacing: 5,
    paddingHorizontal: 20,
    textAlign: 'left',
    marginTop: 20,
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 5,
  },
  queueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  shuffleText: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  selectFolderBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectFolderText: {
    fontWeight: '900',
    fontSize: 16,
  },
  listContainer: {
    padding: 15,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  songCardWrapper: {
    marginBottom: 15,
  },
  songItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  songItemActiveWrapper: {
    // handled via inline styles
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  placeholderThumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  songTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  songArtist: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
