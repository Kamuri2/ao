import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudio } from '../context/AudioContext';
import GlassContainer from '../components/GlassContainer';
import CoverImage from '../components/CoverImage';
import { Artist } from '../types';

export default function ArtistsScreen({ navigation }: any) {
  const { colors, isDarkMode } = useTheme();
  const { artists, currentSong } = useAudio();
  const insets = useSafeAreaInsets();

  const artistsList = Object.values(artists).sort((a, b) => a.name.localeCompare(b.name));

  const renderItem = React.useCallback(({ item }: ListRenderItemInfo<Artist>) => (
    <TouchableOpacity
      style={styles.artistCard}
      onPress={() => navigation.navigate('FolderDetail', { folderName: item.name, isArtist: true })}
    >
      <CoverImage
        coverUrl={item.cover}
        style={styles.cover}
        placeholderStyle={[styles.placeholderCover, { backgroundColor: colors.card }]}
        hq={true}
        audioUri={item.songs?.[0]?.uri}
      />
      <View style={styles.info}>
        <Text style={[styles.artistName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.songCount, { color: colors.subText }]} numberOfLines={1}>{item.songs.length} canciones</Text>
      </View>
    </TouchableOpacity>
  ), [navigation, colors]);

  if (artistsList.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text, marginTop: insets.top + 10 }]}>Perfiles</Text>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>No hay artistas cargados.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.text, marginTop: insets.top + 10 }]}>Perfiles</Text>
      <FlatList
        data={artistsList}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={[styles.listContainer, currentSong ? { paddingBottom: 160 + insets.bottom } : { paddingBottom: insets.bottom }]}
        columnWrapperStyle={styles.columnWrapper}
        initialNumToRender={12}
        maxToRenderPerBatch={9}
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
    fontSize: 45,
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
    paddingHorizontal: 5,
  },
  artistCard: {
    width: '30%',
    marginBottom: 25,
    alignItems: 'center',
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 1000,
  },
  placeholderCover: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 1000,
  },
  info: {
    marginTop: 10,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  artistName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  songCount: {
    fontSize: 12,
    marginTop: 3,
    textAlign: 'center',
  },
});
