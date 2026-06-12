import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudio } from '../context/AudioContext';
import GlassContainer from '../components/GlassContainer';
import { Playlist } from '../types';

export default function PlaylistsScreen() {
  const { colors } = useTheme();
  const { playlists, createPlaylist, deletePlaylist, currentSong } = useAudio();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const insets = useSafeAreaInsets();

  const handleCreate = () => {
    if (newPlaylistName.trim().length > 0) {
      createPlaylist(newPlaylistName);
      setNewPlaylistName('');
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<Playlist>) => (
    <GlassContainer style={[styles.playlistCard, { borderColor: colors.border, backgroundColor: colors.card }]} intensity={40}>
      <View style={styles.playlistInfo}>
        <Text style={[styles.playlistName, { color: colors.text }]}>{item.name}</Text>
        <Text style={styles.songCount}>{item.songIds.length} canciones</Text>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => deletePlaylist(item.id)}>
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </GlassContainer>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.primary }]}>Playlists</Text>

      <GlassContainer style={[styles.createContainer, { borderColor: colors.border, backgroundColor: colors.card }]} intensity={30}>
        <TextInput 
          style={[styles.input, { color: colors.text }]}
          placeholder="Nueva Playlist..."
          placeholderTextColor={colors.subText}
          value={newPlaylistName}
          onChangeText={setNewPlaylistName}
        />
        <TouchableOpacity style={[styles.createBtn, { borderLeftColor: colors.border }]} onPress={handleCreate}>
          <Text style={styles.createBtnText}>Crear</Text>
        </TouchableOpacity>
      </GlassContainer>

      {playlists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>No tienes Playlists.</Text>
          <Text style={[styles.emptySubText, { color: colors.subText }]}>Crea una arriba para comenzar a agregar música.</Text>
        </View>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContainer, currentSong ? { paddingBottom: 160 + insets.bottom } : { paddingBottom: insets.bottom }]}
        />
      )}
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
  createContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
  },
  input: {
    flex: 1,
    color: '#000000',
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  createBtn: {
    backgroundColor: 'rgba(212, 163, 115, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  createBtnText: {
    color: '#30c296',
    fontWeight: 'bold',
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
    paddingHorizontal: 20,
  },
  playlistCard: {
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    flexDirection: 'row',
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  songCount: {
    color: '#000000',
    fontSize: 14,
    marginTop: 5,
  },
  deleteBtn: {
    padding: 10,
    backgroundColor: 'rgba(255, 0, 127, 0.1)',
    borderRadius: 8,
  },
  deleteText: {
    color: '#ff007f',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
