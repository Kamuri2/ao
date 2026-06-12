import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudio } from '../context/AudioContext';
import GlassContainer from '../components/GlassContainer';
import CoverImage from '../components/CoverImage';
import { Album } from '../types';

export default function AlbumsScreen() {
  const { colors } = useTheme();
  const { albums, currentSong } = useAudio();
  const insets = useSafeAreaInsets();

  const albumsList = Object.values(albums);

  if (albumsList.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>No hay álbumes cargados.</Text>
          <Text style={[styles.emptySubText, { color: colors.subText }]}>Ve a Inicio y selecciona una carpeta con música.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: ListRenderItemInfo<Album>) => (
    <TouchableOpacity style={[styles.albumCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <GlassContainer style={styles.glass} intensity={40}>
        <CoverImage
          coverUrl={item.cover}
          style={styles.cover}
          placeholderStyle={styles.placeholderCover}
        />
        <View style={styles.info}>
          <Text style={[styles.albumName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.artistName} numberOfLines={1}>{item.artist}</Text>
          <Text style={styles.songCount}>{item.songs.length} canciones</Text>
        </View>
      </GlassContainer>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.primary }]}>Álbumes</Text>
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
    backgroundColor: '#F5F5F5',
  },
  headerTitle: {
    color: '#30c296',
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 40,
    marginBottom: 20,



  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubText: {
    color: '#000000',
    fontSize: 14,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 100,
    paddingHorizontal: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  albumCard: {
    borderWidth: 2,
    borderColor: '#1c764dff',
    borderRadius: 8,

    width: '48%',
    aspectRatio: 0.8,
    marginBottom: 15,
  },
  glass: {
    flex: 1,
    borderRadius: 8,
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  placeholderCover: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  info: {
    padding: 10,
  },
  albumName: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  artistName: {
    color: '#000000',
    fontSize: 12,
    marginTop: 2,
  },
  songCount: {
    color: '#30c296',
    fontSize: 10,
    marginTop: 5,
  },
});
