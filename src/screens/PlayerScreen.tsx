import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, FlatList, useWindowDimensions, BackHandler, Modal, TextInput, Pressable, LogBox } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import TrackPlayer, { State, usePlaybackState, useProgress } from 'react-native-track-player';
import type { Track } from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import CoverImage from '../components/CoverImage';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
  useAnimatedScrollHandler,
  SlideInDown,
  SlideOutDown,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { GestureDetector, Gesture, TouchableOpacity as GHTouchableOpacity } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';


LogBox.ignoreLogs(['VirtualizedList: You have a large list that is slow to update']);

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

interface LyricLine {
  time: number;
  text: string;
}

const parseLyrics = (lyrics: string): LyricLine[] | null => {
  if (!lyrics) return null;
  const lines = lyrics.split('\n');
  const parsed: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  let isLrc = false;

  lines.forEach(line => {
    const match = timeRegex.exec(line);
    if (match) {
      isLrc = true;
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3], 10) * (match[3].length === 2 ? 10 : 1);
      const time = minutes * 60 + seconds + milliseconds / 1000;
      const text = line.replace(/\[.*?\]/g, '').trim();
      if (text) {
        parsed.push({ time, text });
      }
    }
  });

  return isLrc ? parsed.sort((a, b) => a.time - b.time) : null;
};

const LyricLineItem = React.memo(({ text, isActive, colors, textStyle }: { text: string, isActive: boolean, colors: any, textStyle: any }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      color: withTiming(isActive ? colors.primary : colors.text, { duration: 250 }),
      opacity: withTiming(isActive ? 1 : 0.4, { duration: 250 }),
      transform: [{ scale: withTiming(isActive ? 1.02 : 0.95, { duration: 250 }) }]
    };
  }, [isActive, colors]);

  return (
    <Animated.Text style={[textStyle, animatedStyle, { paddingVertical: 8, textAlign: 'center', fontWeight: 'bold' }]}>
      {text}
    </Animated.Text>
  );
});

const CarouselItem = React.memo(({ item, index, scrollX, colors, itemWidth }: { item: Track, index: number, scrollX: any, colors: any, itemWidth: number }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * itemWidth, index * itemWidth, (index + 1) * itemWidth];
    const scale = interpolate(scrollX.value, inputRange, [0.95, 1, 0.95], Extrapolation.CLAMP);
    return {
      transform: [{ scale }],
      opacity: 1,
    };
  }, [itemWidth]);
  return (
    <View style={{ width: itemWidth, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={[{ width: itemWidth * 0.98, height: itemWidth * 0.98, borderRadius: 20, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15 }, animatedStyle]}>
        <CoverImage hq={true} audioUri={item.url} coverUrl={item.artwork || item.url} style={{ width: '100%', height: '100%', borderRadius: 20 }} placeholderStyle={{ width: '100%', height: '100%', borderRadius: 20, backgroundColor: colors.card }} />
      </Animated.View>
    </View>
  );
});

export default function PlayerScreen({ navigation }: any) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const ITEM_WIDTH = isLandscape ? Math.min(width * 0.5, 600) : Math.min(width * 0.94, 500);
  const SPACING = isLandscape ? (width / 2 - ITEM_WIDTH) / 2 : (width - ITEM_WIDTH) / 2;

  const {
    currentSong, pauseOrResumeSound, playNext, playPrevious, seekTo, metadata, currentContextId, songs,
    toggleFavorite, isFavorite, repeatMode, toggleRepeatMode, isShuffle, toggleShuffle,
    playlists, createPlaylist, addSongToPlaylist
  } = useAudio();
  const playbackState = usePlaybackState();
  const { position, duration } = useProgress(50);
  const isPlaying = playbackState.state === State.Playing;
  const { colors, isDarkMode, backgroundImage } = useTheme();
  const insets = useSafeAreaInsets();

  const [isSliding, setIsSliding] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'cover' | 'lyrics' | 'queue'>('cover');

  const soundwaveHeights = React.useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => Math.abs(10 + Math.sin(i * 0.5) * 20 + Math.cos(i * 1.2) * 10) + 5);
  }, []);

  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const flatListRef = useRef<FlatList>(null);

  const [localLyrics, setLocalLyrics] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (currentSong?.uri && currentSong.uri.startsWith('file://')) {
      const fetchLyrics = async () => {
        try {
          const ExpoMusicScannerModule = require('../../modules/expo-music-scanner/src/ExpoMusicScannerModule').default;
          const lyrics = await ExpoMusicScannerModule.getLyrics(currentSong.uri);
          if (mounted) {
            setLocalLyrics(lyrics || null);
          }
        } catch (e) { }
      };
      fetchLyrics();
    } else {
      setLocalLyrics(null);
    }
    return () => { mounted = false; };
  }, [currentSong?.uri]);

  const activeLyrics = localLyrics || metadata.lyrics;
  const parsedLyrics = React.useMemo(() => parseLyrics(activeLyrics || ''), [activeLyrics]);

  const activeLyricIndex = React.useMemo(() => {
    if (!parsedLyrics) return -1;
    let active = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (parsedLyrics[i].time <= sliderValue + 0.1) {
        active = i;
      } else {
        break;
      }
    }
    return active;
  }, [parsedLyrics, sliderValue]);

  useEffect(() => {
    if (activeTab === 'lyrics' && activeLyricIndex !== -1 && flatListRef.current && parsedLyrics) {
      try {
        flatListRef.current.scrollToIndex({ index: activeLyricIndex, animated: true, viewPosition: 0.5 });
      } catch (e) { }
    }
  }, [activeLyricIndex, activeTab]);

  const screenHeight = Dimensions.get('screen').height;
  const [fullQueue, setFullQueue] = useState<Track[]>([]);
  const carouselRef = useRef<FlatList>(null);
  const isAutoScrolling = useRef(false);
  const scrollX = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({ onScroll: (event) => { scrollX.value = event.contentOffset.x; } });
  const [queueTracks, setQueueTracks] = useState<Track[]>([]);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    TrackPlayer.getQueue().then(tracks => {
      setFullQueue(prev => prev.length === tracks.length ? prev : tracks);
      let idx = tracks.findIndex(t => t.id === currentSong?.id);
      if (idx !== -1) {
        setStartIndex(idx);
        setQueueTracks(tracks.slice(idx));
        if (carouselRef.current && activeTab === 'cover') {
          try {
            isAutoScrolling.current = true;
            carouselRef.current.scrollToIndex({ index: idx, animated: true });
          } catch (e) { }
        }
      }
    });
  }, [currentSong, activeTab]);

  // Navigation safe goBack
  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.setOptions({ animation: 'none' });
      navigation.goBack();
    }
  };

  const translateY = useSharedValue(0);

  const queuePanGesture = Gesture.Pan()
    .onEnd((event) => {
      if (event.translationY > 50 || event.velocityY > 500) {
        runOnJS(setActiveTab)('cover');
      }
    });

  const panGesture = Gesture.Pan()
    .enabled(activeTab === 'cover')
    .activeOffsetY(20)
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        translateY.value = withTiming(screenHeight, { duration: 250 }, () => {
          runOnJS(handleGoBack)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 18, stiffness: 180, mass: 0.8 });
      }
    });

  const closePlayer = () => {
    translateY.value = withTiming(screenHeight, { duration: 250 }, () => {
      runOnJS(handleGoBack)();
    });
  };

  useEffect(() => {
    if (!isSliding) {
      setSliderValue(position || 0);
    }
  }, [position, isSliding]);

  const handleSlidingComplete = (val: number) => {
    seekTo(val * 1000);
    setIsSliding(false);
  };

  const animatedSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });





  if (!currentSong) return null;

  const contextText = currentContextId === 'all' ? 'Todas las canciones' : currentContextId;
  const isFav = currentSong ? isFavorite(currentSong.id) : false;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgroundImage ? 'transparent' : colors.background }}>
      {/* FULL PLAYER */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[styles.fullPlayerContent, animatedSheetStyle, { backgroundColor: backgroundImage ? 'transparent' : colors.background, flex: 1 }]}
        >
          <Pressable style={StyleSheet.absoluteFill} />

          {/* BLUR BACKGROUND */}
          {metadata.cover && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <CoverImage hq={true} coverUrl={metadata.cover} style={StyleSheet.absoluteFill} />
              <BlurView intensity={90} tint={isDarkMode ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)' }]} />
            </View>
          )}
          {backgroundImage && (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.5)', pointerEvents: 'none' }]} />
          )}

          <Animated.View style={(activeTab === 'cover' || activeTab === 'queue') ? { flex: 1 } : {}}>
            <View style={styles.header}>
              <TouchableOpacity onPress={closePlayer} style={styles.backButton}>
                <Ionicons name="chevron-down" size={32} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.headerSubTitle, { color: colors.subText }]}>REPRODUCIENDO DESDE</Text>
                <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{contextText}</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveTab(activeTab === 'lyrics' ? 'cover' : 'lyrics')} style={styles.iconBtn}>
                <Ionicons name="text-outline" size={24} color={activeTab === 'lyrics' ? colors.primary : colors.text} />
              </TouchableOpacity>
            </View>

            {(activeTab === 'cover' || activeTab === 'queue') && (
              <View style={{ flex: 1, flexDirection: isLandscape ? 'row' : 'column' }}>
                <View style={[styles.content, isLandscape && { flex: 1, justifyContent: 'center' }]}>
                  <View style={{ height: ITEM_WIDTH, marginBottom: 40, marginTop: 10 }}>
                    {fullQueue.length > 0 ? (
                      <Animated.FlatList
                        ref={carouselRef}
                        data={fullQueue}
                        keyExtractor={(item, idx) => `${item.id}-${idx}`}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={ITEM_WIDTH}
                        decelerationRate="fast"
                        contentContainerStyle={{ paddingHorizontal: SPACING }}
                        initialNumToRender={5}
                        windowSize={21}
                        maxToRenderPerBatch={10}
                        updateCellsBatchingPeriod={50}
                        removeClippedSubviews={true}
                        disableIntervalMomentum={true}
                        onScroll={scrollHandler}
                        scrollEventThrottle={16}
                        getItemLayout={(data, index) => ({ length: ITEM_WIDTH, offset: ITEM_WIDTH * index, index })}
                        initialScrollIndex={fullQueue.findIndex(t => t.id === currentSong?.id) !== -1 ? fullQueue.findIndex(t => t.id === currentSong?.id) : 0}
                        onScrollBeginDrag={() => { isAutoScrolling.current = false; }}
                        onMomentumScrollEnd={(e) => {
                          if (isAutoScrolling.current) return;
                          const newIndex = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
                          if (fullQueue[newIndex] && fullQueue[newIndex].id !== currentSong?.id) {
                            TrackPlayer.skip(newIndex);
                          }
                        }}
                        renderItem={({ item, index }) => <CarouselItem item={item} index={index} scrollX={scrollX} colors={colors} itemWidth={ITEM_WIDTH} />}
                      />
                    ) : null}
                  </View>

                  <View style={[styles.pillInfoContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{currentSong.title || currentSong.filename}</Text>
                    <Text style={[styles.subtitle, { color: colors.subText }]} numberOfLines={1}>{currentSong.artist || 'Desconocido'} {currentSong.album ? `- ${currentSong.album}` : ''}</Text>
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity style={[styles.actionCircleBtn, { backgroundColor: isFav ? colors.primary : colors.card }]} onPress={() => toggleFavorite(currentSong.id)}>
                      <Ionicons name={isFav ? "thumbs-up" : "thumbs-up-outline"} size={20} color={isFav ? '#fff' : colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionCircleBtn, { backgroundColor: colors.card }]}><Ionicons name="thumbs-down-outline" size={20} color={colors.text} /></TouchableOpacity>
                    <TouchableOpacity style={[styles.actionCircleBtn, { backgroundColor: colors.card }]} onPress={() => setPlaylistModalVisible(true)}>
                      <Ionicons name="add-outline" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionCircleBtn, { backgroundColor: colors.card }]}><Ionicons name="ellipsis-vertical" size={20} color={colors.text} /></TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.bottomControlsArea, isLandscape && { flex: 1, justifyContent: 'center', paddingBottom: 0 }]}>

                  <View style={styles.soundwaveContainer}>
                    <View style={styles.soundwaveBars}>
                      {Array.from({ length: 40 }).map((_, i) => {
                        const isPlayed = (i / 40) <= (duration > 0 ? sliderValue / duration : 0);
                        return (
                          <View
                            key={i}
                            style={[
                              styles.soundwaveBar,
                              {
                                height: soundwaveHeights[i],
                                backgroundColor: isPlayed ? colors.primary : (isDarkMode ? '#333' : '#ccc')
                              }
                            ]}
                          />
                        );
                      })}
                    </View>
                    <Slider
                      style={StyleSheet.absoluteFill}
                      minimumValue={0}
                      maximumValue={duration || 1}
                      value={sliderValue}
                      minimumTrackTintColor="transparent"
                      maximumTrackTintColor="transparent"
                      thumbTintColor="transparent"
                      onSlidingStart={() => setIsSliding(true)}
                      onValueChange={(val) => setSliderValue(val)}
                      onSlidingComplete={handleSlidingComplete}
                    />
                    <View style={styles.timeContainerOverlay}>
                      <Text style={[styles.timeText, { color: colors.primary }]}>{formatTime(sliderValue)}</Text>
                      <Text style={[styles.timeText, { color: colors.primary }]}>{formatTime(duration)}</Text>
                    </View>
                  </View>

                  <View style={styles.controlsContainer}>
                    <TouchableOpacity style={[styles.secondaryControlBtn, { backgroundColor: repeatMode !== 'off' ? colors.primary + '20' : 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' }]} onPress={toggleRepeatMode}>
                      <Ionicons name="repeat" size={24} color={repeatMode !== 'off' ? colors.primary : colors.subText} />
                      {repeatMode === 'track' && (
                        <View style={{ position: 'absolute', backgroundColor: colors.background, borderRadius: 10, width: 14, height: 14, justifyContent: 'center', alignItems: 'center', bottom: 4, right: 4 }}>
                          <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.primary }}>1</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={playPrevious} style={styles.controlButton}>
                      <Ionicons name="play-skip-back" size={32} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={pauseOrResumeSound} style={[styles.playButton, { backgroundColor: colors.primary }]}>
                      <Ionicons name={isPlaying ? "pause" : "play"} size={45} color="#FFF" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={playNext} style={styles.controlButton}>
                      <Ionicons name="play-skip-forward" size={32} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.secondaryControlBtn, { backgroundColor: isShuffle ? colors.primary + '20' : 'rgba(0,0,0,0.1)' }]} onPress={toggleShuffle}>
                      <Ionicons name="shuffle" size={24} color={isShuffle ? colors.primary : colors.subText} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.bottomTabsArea}>
                    <TouchableOpacity><Ionicons name="grid" size={24} color={colors.text} /></TouchableOpacity>
                    <View style={styles.audioBadge}>
                      <Text style={[styles.audioBadgeText, { color: colors.subText }]}>
                        {metadata.audioDetails ? `${metadata.audioDetails.sampleRate ? (metadata.audioDetails.sampleRate / 1000).toFixed(1).replace('.0', '') + ' KHZ ' : ''}${metadata.audioDetails.bitrate && metadata.audioDetails.bitrate > 0 ? Math.round(metadata.audioDetails.bitrate / 1000) + ' KBPS ' : ''}${metadata.audioDetails.format || 'MP3'}`.trim() : 'MP3'}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setActiveTab('queue')}><Ionicons name="list" size={28} color={colors.text} /></TouchableOpacity>
                  </View>

                </View>
              </View>
            )}
          </Animated.View>

          {activeTab === 'lyrics' && (
            <View style={styles.lyricsLayout}>
              <TouchableOpacity style={styles.lyricsHeader} onPress={() => setActiveTab('cover')} activeOpacity={0.8}>
                <CoverImage coverUrl={metadata.cover} style={styles.tinyCover} placeholderStyle={[styles.tinyCover, { backgroundColor: colors.card }]} />
                <View style={styles.lyricsInfo}>
                  <Text style={[styles.lyricsTitle, { color: colors.text }]} numberOfLines={1}>{currentSong.title || currentSong.filename}</Text>
                  <Text style={[styles.lyricsArtist, { color: colors.primary }]} numberOfLines={1}>{currentSong.artist || 'Desconocido'}</Text>
                </View>
              </TouchableOpacity>
              {parsedLyrics ? (
                <FlatList
                  ref={flatListRef}
                  data={parsedLyrics}
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={styles.lyricsScrollContent}
                  showsVerticalScrollIndicator={false}
                  initialNumToRender={20}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  onScrollToIndexFailed={(info) => {
                    setTimeout(() => {
                      flatListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.5 });
                    }, 500);
                  }}
                  renderItem={({ item, index }) => {
                    return (
                      <LyricLineItem
                        text={item.text}
                        isActive={index === activeLyricIndex}
                        colors={colors}
                        textStyle={{ fontSize: 20 }}
                      />
                    );
                  }}
                />
              ) : activeLyrics ? (
                <ScrollView contentContainerStyle={styles.lyricsScrollContent} showsVerticalScrollIndicator={false}>
                  <Text style={[styles.lyricsText, { color: colors.text }]}>{activeLyrics}</Text>
                </ScrollView>
              ) : (
                <ScrollView contentContainerStyle={styles.lyricsScrollContent} showsVerticalScrollIndicator={false}>
                  <View style={styles.noLyricsContainer}>
                    <Ionicons name="musical-notes-outline" size={64} color={colors.subText} style={{ opacity: 0.5, marginBottom: 20 }} />
                    <Text style={[styles.noLyricsText, { color: colors.subText }]}>No hay letras disponibles para esta canción.</Text>
                  </View>
                </ScrollView>
              )}
            </View>
          )}

          {activeTab === 'queue' && (
            <View style={[StyleSheet.absoluteFill, { zIndex: 100, elevation: 10 }]}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={() => setActiveTab('cover')}
              >
                <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
              </TouchableOpacity>

              <Animated.View
                entering={SlideInDown.duration(200)}
                exiting={SlideOutDown.duration(200)}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: height * 0.75,
                  backgroundColor: colors.background,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  padding: 20
                }}>
                <GestureDetector gesture={queuePanGesture}>
                  <View style={{ alignItems: 'center', marginBottom: 20, paddingTop: 10, paddingBottom: 10, backgroundColor: 'transparent' }}>
                    <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: colors.subText, opacity: 0.5, marginBottom: 15 }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold' }}>Cola de reproducción</Text>
                      <TouchableOpacity style={{ backgroundColor: colors.card, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 }}>
                        <Text style={{ color: colors.text, fontWeight: '600' }}>Editar</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={{ color: colors.primary, fontSize: 13, marginTop: 5, alignSelf: 'flex-start' }}>Reproduciendo {contextText}</Text>
                  </View>
                </GestureDetector>

                <DraggableFlatList
                  data={queueTracks}
                  keyExtractor={(item, index) => item.id + '-' + index}
                  contentContainerStyle={{ paddingBottom: 100 }}
                  showsVerticalScrollIndicator={false}
                  initialNumToRender={8}
                  maxToRenderPerBatch={8}
                  windowSize={5}
                  removeClippedSubviews={true}
                  onDragEnd={({ data, from, to }) => {
                    setQueueTracks(data);
                    if (from !== to) {
                      TrackPlayer.move(startIndex + from, startIndex + to).catch(console.error);
                    }
                  }}
                  renderItem={({ item, getIndex, drag, isActive }) => (
                    <ScaleDecorator>
                      <GHTouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          const idx = getIndex();
                          if (idx !== undefined) TrackPlayer.skip(startIndex + idx).catch(console.error);
                          TrackPlayer.play().catch(console.error);
                        }}
                        onLongPress={drag}
                        style={[
                          styles.queueItem,
                          currentSong.id === item.id && { backgroundColor: colors.primary + '20' },
                          isActive && { backgroundColor: colors.card, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2 }
                        ]}
                      >
                        <CoverImage audioUri={item.url} coverUrl={item.artwork?.toString() || songs.find(s => s.id === item.id)?.cover} style={styles.queueItemCover} placeholderStyle={[styles.queueItemCover, { backgroundColor: colors.card }]} />
                        <View style={styles.queueItemInfo}>
                          <Text style={[styles.queueItemTitle, { color: colors.text, fontWeight: currentSong.id === item.id ? 'bold' : 'normal' }]} numberOfLines={1}>{item.title}</Text>
                          <Text style={[styles.queueItemArtist, { color: colors.subText }]} numberOfLines={1}>{item.artist}</Text>
                        </View>
                        <Ionicons name="menu" size={24} color={colors.subText} style={{ marginLeft: 10 }} />
                      </GHTouchableOpacity>
                    </ScaleDecorator>
                  )}
                />
              </Animated.View>
            </View>
          )}



        </Animated.View>
      </GestureDetector>

      <Modal visible={playlistModalVisible} transparent animationType="fade" onRequestClose={() => setPlaylistModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Añadir a Playlist</Text>

            <ScrollView style={{ maxHeight: 200, width: '100%', marginBottom: 15 }}>
              {playlists.filter(p => p.id !== 'favorites').map(p => (
                <TouchableOpacity key={p.id} style={[styles.playlistRow, { backgroundColor: colors.card }]} onPress={() => { addSongToPlaylist(p.id, currentSong.id); setPlaylistModalVisible(false); }}>
                  <Ionicons name="list" size={24} color={colors.primary} />
                  <Text style={[styles.playlistRowText, { color: colors.text }]}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={{ color: colors.subText, marginBottom: 5, alignSelf: 'flex-start' }}>Crear nueva playlist</Text>
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
              placeholder="Nombre de la playlist"
              placeholderTextColor={colors.subText}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 15, width: '100%' }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.card, flex: 1 }]} onPress={() => setPlaylistModalVisible(false)}>
                <Text style={{ color: colors.text, textAlign: 'center', fontWeight: 'bold' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary, flex: 1 }]} onPress={() => {
                if (newPlaylistName.trim()) {
                  createPlaylist(newPlaylistName.trim());
                  setNewPlaylistName('');
                }
              }}>
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    elevation: 10,
    zIndex: 1000,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  fullPlayerContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTextContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 5,
  },
  iconBtn: {
    padding: 8,
  },
  headerSubTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverContainerWrapper: {
    width: 300,
    height: 300,
    borderRadius: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  placeholderCover: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  pillInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 15,
    maxWidth: '90%',
  },
  title: {
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 5,
  },
  actionCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  audioBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  bottomControlsArea: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  soundwaveContainer: {
    height: 60,
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  soundwaveBars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    paddingHorizontal: 10,
  },
  soundwaveBar: {
    width: 4,
    borderRadius: 2,
  },
  timeContainerOverlay: {
    position: 'absolute',
    bottom: -5,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  controlButton: {
    padding: 10,
  },
  secondaryControlBtn: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
  },
  bottomTabsArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  // Lyrics View
  lyricsLayout: {
    flex: 1,
    paddingHorizontal: 20,
  },
  lyricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  tinyCover: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  lyricsInfo: {
    marginLeft: 15,
    flex: 1,
  },
  lyricsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lyricsArtist: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  lyricsScrollContent: {
    paddingBottom: 40,
  },
  lyricsText: {
    fontSize: 22,
    lineHeight: 40,
    fontWeight: '600',
    textAlign: 'center',
  },
  noLyricsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  noLyricsText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  // Mini Player
  miniPlayerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  miniPlayerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  miniCover: {
    width: 45,
    height: 45,
    borderRadius: 6,
  },
  miniPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniInfo: {
    marginLeft: 10,
    flex: 1,
    justifyContent: 'center',
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  miniArtist: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  miniControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  miniPlayBtn: {
    padding: 10,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  queueItemCover: {
    width: 48,
    height: 48,
    borderRadius: 6,
  },
  queueItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  queueItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  queueItemArtist: {
    fontSize: 14,
    marginTop: 2,
  },
  queueItemActions: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginLeft: 10,
  },
  queueMoveBtn: {
    padding: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  playlistRowText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 15,
  },
  modalInput: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  modalBtn: {
    paddingVertical: 12,
    borderRadius: 10,
  }
});
