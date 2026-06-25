import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudio } from '../context/AudioContext';
import GlassContainer from '../components/GlassContainer';
import { Playlist } from '../types';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import CoverImage from '../components/CoverImage';

export default function PlaylistsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { playlists, createPlaylist, deletePlaylist, currentSong, updatePlaylistCover } = useAudio();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const insets = useSafeAreaInsets();

  const handleCreate = () => {
    if (newPlaylistName.trim().length > 0) {
      createPlaylist(newPlaylistName);
      setNewPlaylistName('');
    }
  };

  const pickImage = async (playlistId: string) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      updatePlaylistCover(playlistId, result.assets[0].uri);
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<Playlist>) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => navigation.navigate('FolderDetail', { folderName: item.id, isPlaylist: true })}
    >
      <GlassContainer style={[styles.playlistCard, { borderColor: colors.border, backgroundColor: colors.card }]} intensity={40}>
        <TouchableOpacity style={styles.coverWrapper} onPress={() => pickImage(item.id)}>
          <CoverImage 
            coverUrl={item.cover} 
            style={styles.playlistCover} 
            placeholderStyle={[styles.playlistCover, { backgroundColor: colors.background }]} 
          />
          <View style={styles.editCoverOverlay}>
            <Ionicons name="camera" size={20} color="#FFF" />
          </View>
        </TouchableOpacity>
        <View style={styles.playlistInfo}>
          <Text style={[styles.playlistName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.songCount, { color: colors.subText }]}>{item.songIds.length} canciones</Text>
        </View>
        {item.id !== 'favorites' && (
          <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: colors.card }]} onPress={() => deletePlaylist(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#ff4444" />
          </TouchableOpacity>
        )}
      </GlassContainer>
    </TouchableOpacity>
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
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  playlistCard: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coverWrapper: {
    marginRight: 15,
    position: 'relative',
  },
  playlistCover: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  editCoverOverlay: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
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
    borderRadius: 8,
  },
});
