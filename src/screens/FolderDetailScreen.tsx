import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudio } from '../context/AudioContext';
import GlassContainer from '../components/GlassContainer';
import CoverImage from '../components/CoverImage';
import { Song } from '../types';

export default function FolderDetailScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const { folderName } = route.params;
  const { folders, playSound, currentSong } = useAudio();
  const insets = useSafeAreaInsets();
  
  const folder = folders[folderName];
  const songs = folder ? folder.songs : [];

  const renderItem = ({ item }: ListRenderItemInfo<Song>) => {
    const isPlayingThis = currentSong?.id === item.id;
    return (
      <TouchableOpacity 
        style={styles.songCardWrapper} 
        onPress={() => playSound(item)}
        activeOpacity={0.7}
      >
        <GlassContainer style={[styles.songItemContent, isPlayingThis && styles.songItemActiveWrapper]} intensity={40}>
          <CoverImage 
             coverUrl={item.cover} 
             style={[styles.thumbnail, { borderColor: colors.border }]} 
             placeholderStyle={styles.placeholderThumbnail} 
          />
          
          <View style={styles.songInfo}>
            <Text style={[styles.songTitle, isPlayingThis && styles.songTitleActive]} numberOfLines={1}>
              {item.filename}
            </Text>
            <Text style={[styles.songArtist, { color: colors.subText }]} numberOfLines={1}>
              {item.artist || 'Desconocido'}
            </Text>
          </View>
        </GlassContainer>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.backButtonText, { color: colors.text }]}>← Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primary }]} numberOfLines={1}>{folderName}</Text>
      </View>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContainer, currentSong ? { paddingBottom: 160 + insets.bottom } : { paddingBottom: insets.bottom }]}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#30c296',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#000000',
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  songCardWrapper: {
    marginBottom: 12,
  },
  songItemContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
  },
  songItemActiveWrapper: {
    borderColor: '#30c296',
    borderWidth: 1.5,
    backgroundColor: 'rgba(212, 163, 115, 0.1)',
    shadowColor: '#30c296',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  thumbnail: {
    width: 55,
    height: 55,
    borderRadius: 16,
  },
  placeholderThumbnail: {
    width: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  songInfo: {
    flex: 1,
    marginLeft: 15,
  },
  songTitle: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  songTitleActive: {
    color: '#30c296',
    
    
    
  },
  songArtist: {
    color: '#000000',
    fontSize: 14,
  },
});
