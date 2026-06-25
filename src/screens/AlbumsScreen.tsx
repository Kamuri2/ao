import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudio } from '../context/AudioContext';
import GlassContainer from '../components/GlassContainer';
import CoverImage from '../components/CoverImage';
import { Album } from '../types';

export default function AlbumsScreen({ navigation }: any) {
  const { colors, isDarkMode } = useTheme();
  const { albums, currentSong } = useAudio();
  const insets = useSafeAreaInsets();

  const albumsList = Object.values(albums);

  const renderItem = React.useCallback(({ item }: ListRenderItemInfo<Album>) => (
    <TouchableOpacity 
      style={styles.albumCard}
      onPress={() => navigation.navigate('FolderDetail', { folderName: item.name, isAlbum: true })}
    >
      <CoverImage
        coverUrl={item.cover}
        style={styles.cover}
        placeholderStyle={[styles.placeholderCover, { backgroundColor: colors.card }]}
        hq={true}
        audioUri={item.songs?.[0]?.uri}
      />
      <View style={styles.info}>
        <Text style={[styles.albumName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.artistName, { color: colors.subText }]} numberOfLines={1}>{item.artist}</Text>
        <Text style={[styles.songCount, { color: colors.subText }]} numberOfLines={1}>{item.songs.length} canciones</Text>
      </View>
    </TouchableOpacity>
  ), [navigation, colors]);

  if (albumsList.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text, marginTop: insets.top + 10 }]}>Albums</Text>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>No hay álbumes cargados.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.text, marginTop: insets.top + 10 }]}>Albums</Text>
      <FlatList
        data={albumsList}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={[styles.listContainer, currentSong ? { paddingBottom: 160 + insets.bottom } : { paddingBottom: insets.bottom }]}
        columnWrapperStyle={styles.columnWrapper}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '900',
    textTransform: 'capitalize',
    letterSpacing: 1,
    paddingHorizontal: 20,
    textAlign: 'left',
    marginTop: 20,
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 100,
    paddingHorizontal: 10,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  albumCard: {
    width: '47%',
    marginBottom: 20,
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
  },
  placeholderCover: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  info: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  albumName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  artistName: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  songCount: {
    fontSize: 12,
    marginTop: 2,
  },
});
