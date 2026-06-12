import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ListRenderItemInfo } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAudio } from '../context/AudioContext';
import { Song } from '../types';
import { useTheme } from '../context/ThemeContext';
import CoverImage from '../components/CoverImage';

export default function HomeScreen() {
  const { songs, playSound, currentSong, loadSongsFromUri } = useAudio();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  useEffect(() => {
    checkSavedDirectory();
  }, []);

  const checkSavedDirectory = async () => {
    const savedUri = await AsyncStorage.getItem('@music_directory_uri');
    if (savedUri) {
      loadSongsFromUri(savedUri);
    }
  };

  const handlePlaySound = React.useCallback((item: Song) => {
    playSound(item);
  }, [playSound]);

  const renderItem = React.useCallback(({ item }: ListRenderItemInfo<Song>) => {
    const isPlayingThis = currentSong?.id === item.id;
    return (
      <View style={styles.songCardWrapper}>
        <TouchableOpacity
          style={[
            styles.songItemContent,
            { backgroundColor: colors.card, borderColor: colors.border },
            isPlayingThis && styles.songItemActiveWrapper
          ]}
          onPress={() => handlePlaySound(item)}
        >
          <CoverImage 
             coverUrl={item.cover || null} 
             style={[styles.thumbnail, { borderColor: colors.border }]} 
             placeholderStyle={[styles.placeholderThumbnail, { backgroundColor: colors.card, borderColor: colors.border }]} 
          />
          <View style={styles.songInfo}>
            <Text style={[styles.songTitle, { color: colors.text }, isPlayingThis && styles.songTitleActive]} numberOfLines={1}>
              {item.filename}
            </Text>
            <Text style={[styles.songArtist, { color: colors.subText }]} numberOfLines={1}>
              {item.artist || 'Desconocido'} · {item.folder}
            </Text>
          </View>
          {isPlayingThis && (
            <Ionicons name="stats-chart" size={20} color="#000000" style={{ marginLeft: 10 }} />
          )}
        </TouchableOpacity>
      </View>
    );
  }, [currentSong?.id, handlePlaySound, colors]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerContainer, { backgroundColor: colors.primary, borderBottomColor: colors.border }]}>
        <Text style={styles.headerTitle}>CyberMusic</Text>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings" size={28} color="#000000" />
        </TouchableOpacity>
      </View>

      {songs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>No hay canciones cargadas.</Text>
          <Text style={[styles.emptySubText, { color: colors.subText }]}>Ve a Configuración para seleccionar una carpeta.</Text>
          <TouchableOpacity 
            style={[styles.selectFolderBtn, { borderColor: colors.border, backgroundColor: colors.card }]} 
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={[styles.selectFolderText, { color: colors.text }]}>Ir a Configuración</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          extraData={currentSong?.id}
          contentContainerStyle={[styles.listContainer, currentSong ? { paddingBottom: 160 + insets.bottom } : { paddingBottom: insets.bottom }]}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  settingsBtn: {
    padding: 5,
  },
  selectFolderBtn: {
    marginTop: 20,
    borderWidth: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectFolderText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  songCardWrapper: {
    marginBottom: 15,
  },
  songItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  songItemActiveWrapper: {
    backgroundColor: '#30c296',
  },
  thumbnail: {
    width: 55,
    height: 55,
    borderRadius: 4,
    borderWidth: 2,
  },
  placeholderThumbnail: {
    width: 55,
    height: 55,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  songInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  songTitleActive: {
    color: '#000000',
  },
  songArtist: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});
