import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Buffer } from 'buffer';
import { Song, Playlist, Album, Folder, AudioContextType, Metadata } from '../types';

// AudioContext.tsx

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Record<string, Album>>({});
  const [folders, setFolders] = useState<Record<string, Folder>>({});
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [metadata, setMetadata] = useState<{ cover: string | null; lyrics: string | null }>({ cover: null, lyrics: null });
  const [metadataCache, setMetadataCache] = useState<Record<string, { coverUri: string | null; lyrics: string | null }>>({});
  const playRequestId = React.useRef<string | null>(null);

  // expo-audio API
  const player = useAudioPlayer(currentSong ? currentSong.uri : null);
  const status = useAudioPlayerStatus(player);

  const isPlaying = status.playing;
  const position = status.currentTime;
  const duration = status.duration;

  useEffect(() => {
    loadPlaylists();
    loadMetadataCache();
    setupAudio();
  }, []);

  const loadMetadataCache = async () => {
    try {
      const stored = await AsyncStorage.getItem('@metadata_cache');
      if (stored) setMetadataCache(JSON.parse(stored));
    } catch (e) { }
  };

  const saveMetadataToCache = async (uri: string, data: { coverUri: string | null; lyrics: string | null }) => {
    try {
      setMetadataCache(prev => {
        const newCache = { ...prev, [uri]: data };
        AsyncStorage.setItem('@metadata_cache', JSON.stringify(newCache)).catch(() => { });
        return newCache;
      });
    } catch (e) { }
  };

  const setupAudio = async () => {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        shouldRouteThroughEarpiece: false,
        interruptionMode: 'mixWithOthers',
      });
    } catch (e) {
      console.warn('Failed to set audio mode', e);
    }
  };

  // Auto play next song when current finishes
  useEffect(() => {
    if (status.didJustFinish) {
      playNext();
    }
  }, [status.didJustFinish]);

  // Auto play when song is ready
  useEffect(() => {
    if (currentSong && player && playRequestId.current === currentSong.id) {
      playRequestId.current = null; // Consume the request
      if (typeof player.play === 'function') {
        player.play();
      }
    }
  }, [currentSong, player, status.isLoaded]);

  const loadPlaylists = async () => {
    try {
      const stored = await AsyncStorage.getItem('@playlists');
      if (stored !== null) setPlaylists(JSON.parse(stored));
    } catch (e) {
      console.error("Error loading playlists", e);
    }
  };

  const savePlaylists = async (newPlaylists: Playlist[]) => {
    try {
      setPlaylists(newPlaylists);
      await AsyncStorage.setItem('@playlists', JSON.stringify(newPlaylists));
    } catch (e) {
      console.error("Error saving playlists", e);
    }
  };

  const createPlaylist = async (name: string) => {
    const newPlaylist: Playlist = { id: Date.now().toString(), name, songIds: [] };
    await savePlaylists([...playlists, newPlaylist]);
  };

  const addSongToPlaylist = async (playlistId: string, songId: string) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId && !p.songIds.includes(songId)) {
        return { ...p, songIds: [...p.songIds, songId] };
      }
      return p;
    });
    await savePlaylists(updated);
  };

  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, songIds: p.songIds.filter(id => id !== songId) };
      }
      return p;
    });
    await savePlaylists(updated);
  };

  const deletePlaylist = async (playlistId: string) => {
    const updated = playlists.filter(p => p.id !== playlistId);
    await savePlaylists(updated);
  };

  // Extract Metadata ON DEMAND via custom Buffer parsing
  const extractMetadataOnDemand = async (uri: string): Promise<{ cover: string | null; lyrics: string | null }> => {
    try {
      // Leer como string Base64 con un límite de 2MB
      const dataB64 = await FileSystem.readAsStringAsync(uri, { 
        encoding: FileSystem.EncodingType.Base64,
        position: 0,
        length: 2097152
      });
      
      const buffer = Buffer.from(dataB64, 'base64');
      
      let coverUri: string | null = null;
      let lyricsText: string | null = null;

      try {
        if (buffer.length >= 10 && buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) {
          const version = buffer[3];
          const flags = buffer[5];
          const size = (buffer[6] << 21) | (buffer[7] << 14) | (buffer[8] << 7) | buffer[9];

          let offset = 10;
          if (flags & 0x40) {
            if (version === 3) {
              const extSize = buffer.readUInt32BE(offset);
              offset += extSize + 4;
            } else if (version === 4) {
              const extSize = (buffer[offset] << 21) | (buffer[offset+1] << 14) | (buffer[offset+2] << 7) | buffer[offset+3];
              offset += extSize;
            }
          }

          while (offset < size + 10 && offset < buffer.length) {
            if (offset + 10 > buffer.length) break;
            const frameId = buffer.toString('utf8', offset, offset + 4);
            if (frameId.charCodeAt(0) === 0) break;

            let frameSize = 0;
            if (version === 3) {
              frameSize = buffer.readUInt32BE(offset + 4);
            } else if (version === 4) {
              frameSize = (buffer[offset + 4] << 21) | (buffer[offset + 5] << 14) | (buffer[offset + 6] << 7) | buffer[offset + 7];
            } else {
              break;
            }

            offset += 10;
            if (frameSize === 0 || offset + frameSize > buffer.length) break;

            if (frameId === 'APIC') {
              const textEncoding = buffer[offset];
              let p = offset + 1;
              let mimeTypeStart = p;
              while (p < offset + frameSize && buffer[p] !== 0) p++;
              let mimeType = buffer.toString('utf8', mimeTypeStart, p);
              p++; // null byte
              p++; // picture type
              
              if (textEncoding === 1 || textEncoding === 2) {
                 while (p < offset + frameSize - 1 && (buffer[p] !== 0 || buffer[p+1] !== 0)) p += 2;
                 p += 2;
              } else {
                 while (p < offset + frameSize && buffer[p] !== 0) p++;
                 p++;
              }

              const pictureData = buffer.slice(p, offset + frameSize);
              if (pictureData.length > 0 && !coverUri) {
                 const base64 = pictureData.toString('base64');
                 const mime = (mimeType === 'image/' || mimeType === 'image') ? 'image/jpeg' : mimeType;
                 
                 // Guardar en caché
                 const localCoverUri = FileSystem.cacheDirectory + 'cover_' + Math.abs(uri.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)) + '.jpg';
                 await FileSystem.writeAsStringAsync(localCoverUri, base64, { encoding: FileSystem.EncodingType.Base64 });
                 coverUri = localCoverUri;
              }
            } else if (frameId === 'USLT') {
              const textEncoding = buffer[offset];
              let p = offset + 1;
              p += 3; // lang
              
              if (textEncoding === 1 || textEncoding === 2) {
                 while (p < offset + frameSize - 1 && (buffer[p] !== 0 || buffer[p+1] !== 0)) p += 2;
                 p += 2;
              } else {
                 while (p < offset + frameSize && buffer[p] !== 0) p++;
                 p++;
              }

              const lyricsData = buffer.slice(p, offset + frameSize);
              if (lyricsData.length > 0 && !lyricsText) {
                 lyricsText = (textEncoding === 1 || textEncoding === 2) ? lyricsData.toString('utf16le') : lyricsData.toString('utf8');
              }
            }
            offset += frameSize;
          }
        }
      } catch (e) {
        console.log("ID3 parsing error:", e);
      }

      return { cover: coverUri, lyrics: lyricsText };
    } catch (e: any) {
      console.log(`Failed to extract deep metadata for ${uri}`, e.message);
      return { cover: null, lyrics: null };
    }
  };

  const loadSongsFromUri = async (directoryUri: string) => {
    try {
      const files = await FileSystem.StorageAccessFramework.readDirectoryAsync(directoryUri);
      
      const audioFiles = files.filter(uri => 
        uri.endsWith('.mp3') || uri.endsWith('.m4a') || uri.endsWith('.flac') || uri.endsWith('.wav')
      );

      const formattedSongs: Song[] = audioFiles.map((uri, index) => {
        const decodedUri = decodeURIComponent(uri);
        const parts = decodedUri.split('/');
        let filename = parts[parts.length - 1];
        
        let parentFolder = "Desconocido";
        if (parts.length >= 2) {
            parentFolder = parts[parts.length - 2];
        }

        if (parentFolder.includes('%3A')) {
            parentFolder = parentFolder.split('%3A').pop() || 'Raíz';
        }

        return {
          id: index.toString(),
          uri: uri,
          filename: filename,
          folder: parentFolder,
          duration: 0
        };
      });
      
      setSongs(formattedSongs);
    } catch (error) {
      console.error("Error al leer el directorio:", error);
    }
  };

  const handleSetSongs = (newSongs: Song[]) => {
    // 1. Instantly set the songs list with basic filenames
    let albumsObj: Record<string, Album> = {};
    let foldersObj: Record<string, Folder> = {};

    const processedSongs = newSongs.map(song => {
      let cleanFilename = song.filename.replace(/\.[^/.]+$/, "");
      let title = cleanFilename;
      let artist = 'Desconocido';
      let album = 'Desconocido';
      let folderName = song.folder || 'Desconocido';

      const updatedSong: Song = {
        ...song,
        filename: title,
        cover: metadataCache[song.uri] ? metadataCache[song.uri].coverUri : null,
        album,
        artist,
        lyrics: metadataCache[song.uri] ? metadataCache[song.uri].lyrics : 'Letra no disponible'
      };

      if (!albumsObj[album]) {
        albumsObj[album] = { name: album, artist, cover: updatedSong.cover, songs: [] };
      } else if (!albumsObj[album].cover && updatedSong.cover) {
        albumsObj[album].cover = updatedSong.cover;
      }
      albumsObj[album].songs.push(updatedSong);

      if (!foldersObj[folderName]) {
        foldersObj[folderName] = { name: folderName, cover: updatedSong.cover, songs: [] };
      } else if (!foldersObj[folderName].cover && updatedSong.cover) {
        foldersObj[folderName].cover = updatedSong.cover;
      }
      foldersObj[folderName].songs.push(updatedSong);

      return updatedSong;
    });

    setSongs(processedSongs);
    setAlbums(albumsObj);
    setFolders(foldersObj);
  };

  const playSound = async (song: Song) => {
    try {
      setMetadata({ cover: null, lyrics: 'Cargando...' });

      // Update current song. This will trigger useAudioPlayer hook to replace the source
      playRequestId.current = song.id;
      setCurrentSong(song);

      // Eliminamos player.play() aquí porque lanza "undefined is not a function" 
      // si el objeto player aún no se ha instanciado con la nueva fuente en este render.
      // Un useEffect se encargará de darle play cuando esté listo.

      // Check cache first
      if (metadataCache[song.uri]) {
        setMetadata({ cover: metadataCache[song.uri].coverUri, lyrics: metadataCache[song.uri].lyrics });
        return;
      }

      // Perform deep extraction ON DEMAND since it's not cached
      const deepMeta = await extractMetadataOnDemand(song.uri);

      if (deepMeta) {
        setMetadata(deepMeta);
        saveMetadataToCache(song.uri, { coverUri: deepMeta.cover, lyrics: deepMeta.lyrics });
      } else {
        setMetadata({ cover: null, lyrics: 'No disponible' });
        saveMetadataToCache(song.uri, { coverUri: null, lyrics: 'No disponible' });
      }

    } catch (error) {
      console.error('Error al reproducir audio:', error);
    }
  };

  const pauseOrResumeSound = async () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const playNext = async () => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    await playSound(songs[nextIndex]);
  };

  const playPrevious = async () => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    await playSound(songs[prevIndex]);
  };

  const seekTo = async (millis: number) => {
    // expo-audio takes seconds as argument
    player.seekTo(millis);
  }

  return (
    <AudioContext.Provider
      value={{
        songs,
        setSongs: handleSetSongs,
        albums,
        folders,
        playlists,
        createPlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        currentSong,
        isPlaying,
        metadata,
        position,
        duration,
        playSound,
        pauseOrResumeSound,
        playNext,
        playPrevious,
        seekTo,
        metadataCache,
        extractMetadataOnDemand,
        loadSongsFromUri
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
