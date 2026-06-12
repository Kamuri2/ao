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

  if (foldersArray.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Carpetas</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>No hay carpetas cargadas.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderFolder = ({ item }: ListRenderItemInfo<Folder>) => {
    return (
      <TouchableOpacity 
        style={[styles.folderCard, { borderColor: colors.border, backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('FolderDetail', { folderName: item.name })}
        activeOpacity={0.7}
      >
        <GlassContainer style={styles.glass} intensity={40}>
          <CoverImage 
             coverUrl={item.cover} 
             style={styles.cover} 
             placeholderStyle={styles.placeholderCover} 
          />
          <View style={styles.info}>
            <Text style={[styles.folderName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.songCount}>{item.songs.length} canciones</Text>
          </View>
        </GlassContainer>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Carpetas</Text>
      </View>
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    marginTop: 10,
  },
  headerTitle: {
    color: '#30c296',
    fontSize: 28,
    fontWeight: 'bold',
    
    
    
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#000000',
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  folderCard: {
    borderWidth: 2,
    borderColor: '#000000',
    width: '48%',
    marginBottom: 5,
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
    padding: 12,
  },
  folderName: {
    color: '#000000',
    fontSize: 15,
    fontWeight: 'bold',
  },
  songCount: {
    color: '#30c296',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
});
