import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudio } from '../context/AudioContext';
import GlassContainer from '../components/GlassContainer';
import CoverImage from '../components/CoverImage';
import { Song } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SongListItem = React.memo(({
  item,
  index,
  isPlayingThis,
  playSound,
  folderName,
  songs,
  colors,
  styles
}: any) => {
  const formatDuration = (seconds: number) => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.songCardWrapper}>
      <TouchableOpacity
        style={[
          styles.songItemContent,
          isPlayingThis && { backgroundColor: colors.primary + '33' }
        ]}
        onPress={() => playSound(item, folderName, songs)}
        activeOpacity={0.7}
      >
        <Text style={[styles.songIndex, { color: isPlayingThis ? colors.primary : colors.text }]}>
          {index + 1}
        </Text>
        <CoverImage
          coverUrl={item.cover}
          style={[styles.thumbnail]}
          placeholderStyle={[styles.placeholderThumbnail, { backgroundColor: colors.card }]}
          hq={true}
          audioUri={item.uri}
        />
        <View style={styles.songInfo}>
          <Text style={[styles.songTitle, { color: isPlayingThis ? colors.primary : colors.text }]} numberOfLines={1}>
            {item.title || item.filename}
          </Text>
          <Text style={[styles.songArtist, { color: colors.text, opacity: 0.7 }]} numberOfLines={1}>
            {item.artist || 'Desconocido'}
          </Text>
        </View>
        {item.duration > 0 && (
          <Text style={[styles.songDuration, { color: colors.text }]}>
            {formatDuration(item.duration)}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}, (prevProps: any, nextProps: any) => {
  return prevProps.item.id === nextProps.item.id &&
    prevProps.isPlayingThis === nextProps.isPlayingThis &&
    prevProps.colors === nextProps.colors;
});

export default function FolderDetailScreen({ route, navigation }: any) {
  const { colors, isDarkMode } = useTheme();
  const { folderName, isAlbum, isPlaylist, isArtist } = route.params;
  const { folders, albums, artists, playlists, songs: allSongs, playSound, playWithShuffle, currentSong } = useAudio();
  const insets = useSafeAreaInsets();
  
  const [artistBio, setArtistBio] = useState<string | null>(null);

  useEffect(() => {
    if (isArtist && folderName && folderName !== 'Desconocido') {
      fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(folderName)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.extract) {
            setArtistBio(data.extract);
          }
        })
        .catch(() => setArtistBio(null));
    } else {
      setArtistBio(null);
    }
  }, [isArtist, folderName]);

  let songs = [];
  let screenTitle = folderName;
  let artistAlbums: any[] = [];

  if (isPlaylist) {
    const playlist = playlists.find(p => p.id === folderName);
    if (playlist) {
      screenTitle = playlist.name;
      songs = allSongs.filter(s => playlist.songIds.includes(s.id));
    }
  } else if (isAlbum) {
    songs = albums[folderName] ? albums[folderName].songs : [];
  } else if (isArtist) {
    songs = artists[folderName] ? artists[folderName].songs.slice(0, 10) : [];
    artistAlbums = Object.values(albums).filter(a => a.artist === folderName);
  } else {
    songs = folders[folderName] ? folders[folderName].songs : [];
  }

  let coverUrl = null;
  if (isAlbum) coverUrl = albums[folderName]?.cover;
  else if (isArtist) coverUrl = artists[folderName]?.cover;
  else if (isPlaylist) {
    const playlist = playlists.find(p => p.id === folderName);
    coverUrl = playlist?.cover || (songs.length > 0 ? songs[0].cover : null);
  }
  else coverUrl = folders[folderName]?.cover;

  if (!coverUrl && songs.length > 0) coverUrl = songs[0].cover;

  const getItemLayout = (data: any, index: number) => ({
    length: 98,
    offset: 98 * index,
    index,
  });

  const renderItem = React.useCallback(({ item, index }: ListRenderItemInfo<Song>) => {
    return (
      <SongListItem
        item={item}
        index={index}
        isPlayingThis={currentSong?.id === item.id}
        playSound={playSound}
        folderName={folderName}
        songs={songs}
        colors={colors}
        styles={styles}
      />
    );
  }, [currentSong?.id, playSound, folderName, songs, colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.floatingBackButton, { top: insets.top + 10 }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        extraData={currentSong?.id}
        ListHeaderComponent={
          <View style={styles.heroHeader}>
            <CoverImage
              coverUrl={coverUrl}
              style={styles.heroImage}
              placeholderStyle={[styles.heroPlaceholder, { backgroundColor: colors.card }]}
              hq={true}
              audioUri={songs.length > 0 ? songs[0].uri : undefined}
            />
            <LinearGradient
              colors={[`${colors.primary}99`, colors.background]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle} numberOfLines={2}>{screenTitle}</Text>
              <Text style={styles.heroSubtitle}>{isArtist ? 'Top canciones' : `${songs.length} canciones`}</Text>
              
              {isArtist && artistBio && (
                <Text style={[styles.artistBio, { color: '#E0E0E0' }]} numberOfLines={3}>
                  {artistBio}
                </Text>
              )}

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={async () => {
                    playWithShuffle(folderName, songs);
                  }}
                >
                  <Ionicons name="shuffle" size={20} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.primary, paddingHorizontal: 20 }]}
                  onPress={() => playSound(songs[0], folderName, songs)}
                >
                  <Ionicons name="play" size={24} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="ellipsis-vertical" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Spotify style Tracklist header */}
            {songs.length > 0 && (
              <View style={[styles.tracklistHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.tracklistHeaderText, { width: 30, textAlign: 'center', color: colors.text, opacity: 0.5 }]}>#</Text>
                <Text style={[styles.tracklistHeaderText, { flex: 1, marginLeft: 10, color: colors.text, opacity: 0.5 }]}>Título</Text>
                <Ionicons name="time-outline" size={16} color={colors.text} style={{ opacity: 0.5, marginRight: 15 }} />
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          isArtist && artistAlbums.length > 0 ? (
            <View style={styles.albumsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Álbumes</Text>
              {artistAlbums.map(album => (
                <TouchableOpacity
                  key={album.name}
                  style={[styles.albumCard, { backgroundColor: colors.card }]}
                  onPress={() => navigation.push('FolderDetail', { folderName: album.name, isAlbum: true })}
                  activeOpacity={0.7}
                >
                  <CoverImage coverUrl={album.cover} style={styles.albumCover} placeholderStyle={[styles.albumPlaceholder, { backgroundColor: colors.background }]} hq={true} audioUri={album.songs?.[0]?.uri} />
                  <View style={styles.albumInfo}>
                    <Text style={[styles.albumTitle, { color: colors.text }]} numberOfLines={1}>{album.name}</Text>
                    <Text style={[styles.albumArtist, { color: colors.subText }]} numberOfLines={1}>{album.artist}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : null
        }
        getItemLayout={getItemLayout}
        contentContainerStyle={[styles.listContainer, currentSong ? { paddingBottom: 160 + insets.bottom } : { paddingBottom: insets.bottom }]}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  artistBio: {
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
    marginBottom: 5,
  },
  tracklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  tracklistHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  songIndex: {
    width: 30,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  songDuration: {
    fontSize: 13,
    opacity: 0.5,
    fontWeight: '500',
  },
  floatingBackButton: {
    position: 'absolute',
    left: 15,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroHeader: {
    width: '100%',
    height: 350,
    position: 'relative',
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 55,
    fontWeight: '900',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  heroSubtitle: {
    color: '#E0E0E0',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 0,
    paddingBottom: 20,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  songCardWrapper: {
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  songItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  songItemActiveWrapper: {
    backgroundColor: '#30c296',
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
    color: '#000000',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },
  songTitleActive: {
    color: '#000000',
  },
  songArtist: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  albumsSection: {
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  albumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  albumCover: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  albumPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumInfo: {
    flex: 1,
    marginLeft: 15,
  },
  albumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 14,
  },
});
