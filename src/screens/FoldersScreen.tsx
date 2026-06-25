import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudio } from '../context/AudioContext';
import GlassContainer from '../components/GlassContainer';
import CoverImage from '../components/CoverImage';
import { Folder } from '../types';

export default function FoldersScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { folders, currentSong } = useAudio();
  const insets = useSafeAreaInsets();
  const foldersArray = Object.values(folders || {});

  const renderFolder = React.useCallback(({ item }: ListRenderItemInfo<Folder>) => {
    return (
      <TouchableOpacity
        style={styles.folderCard}
        onPress={() => navigation.navigate('FolderDetail', { folderName: item.name })}
        activeOpacity={0.7}
      >
        <CoverImage
          coverUrl={item.cover}
          style={styles.cover}
          placeholderStyle={[styles.placeholderCover, { backgroundColor: colors.card }]}
          hq={true}
          audioUri={item.songs?.[0]?.uri}
        />
        <View style={styles.info}>
          <Text style={[styles.folderName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.songCount, { color: colors.subText }]}>{item.songs.length} canciones</Text>
        </View>
      </TouchableOpacity>
    );
  }, [navigation, colors]);

  if (foldersArray.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Carpetas</Text>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>No hay carpetas cargadas.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Carpetas</Text>
      <FlatList
        data={foldersArray}
        keyExtractor={(item) => item.name}
        numColumns={2}
        renderItem={renderFolder}
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
    fontSize: 40,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
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
  folderCard: {
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
  folderName: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  songCount: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
});
