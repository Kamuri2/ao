import React, { createContext, useState, useEffect, useContext } from 'react';
import TrackPlayer, { Event, State, usePlaybackState, useProgress, useTrackPlayerEvents, Capability, RepeatMode, Track } from 'react-native-track-player';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setupPlayer } from '../services/TrackPlayerSetup';
import { Song, Album, Folder, Artist, AudioContextType, Playlist } from '../types';
import { fetchArtistImage } from '../services/ArtistImageService';

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Record<string, Album>>({});
  const [folders, setFolders] = useState<Record<string, Folder>>({});
  const [artists, setArtists] = useState<Record<string, Artist>>({});
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [audioDetails, setAudioDetails] = useState<{ bitrate?: number; sampleRate?: number; format?: string } | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentContextId, setCurrentContextId] = useState<string>('all');
  const [queuePosition, setQueuePosition] = useState(0);
  const [queueLength, setQueueLength] = useState(0);

  const [repeatMode, setRepeatMode] = useState<'off' | 'track' | 'queue'>('off');
  const [isShuffle, setIsShuffle] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const playbackState = usePlaybackState();

  // RNTP mapped to boolean
  const isPlaying = playbackState.state === State.Playing;

  useEffect(() => {
    const init = async () => {
      const ready = await setupPlayer();
      setIsPlayerReady(ready);

      try {
        const ExpoMusicScannerModule = require('../../modules/expo-music-scanner/src/ExpoMusicScannerModule').default;
        await ExpoMusicScannerModule.initAudioEngine();

        // Load saved EQ and Bass
        const savedEq = await AsyncStorage.getItem('@eq_levels');
        if (savedEq) {
          const parsed = JSON.parse(savedEq);
          Object.keys(parsed).forEach(bandIdx => {
            ExpoMusicScannerModule.setEqualizerBandLevel(parseInt(bandIdx), parsed[bandIdx]);
          });
        }
        const savedBass = await AsyncStorage.getItem('@bass_boost');
        if (savedBass) {
          ExpoMusicScannerModule.setBassBoost(parseInt(savedBass, 10));
        }
      } catch (e) {
        console.log("Error inicializando motor de audio", e);
      }
    };
    init();
  }, []);

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async (event) => {
    if (event.type === Event.PlaybackActiveTrackChanged && event.track) {
      const matchingSong = songs.find(s => s.id === event.track?.id);
      if (matchingSong) {
        const updatedSong = { ...matchingSong, cover: event.track.artwork || matchingSong.cover };
        setCurrentSong(updatedSong);

        // Load lyrics and details natively
        if (updatedSong.uri) {
          try {
            const ExpoMusicScannerModule = require('../../modules/expo-music-scanner/src/ExpoMusicScannerModule').default;
            const details = await ExpoMusicScannerModule.getSongDetails(updatedSong.uri);
            if (details) {
              setLyrics(details.lyrics || null);
              setAudioDetails({
                bitrate: details.bitrate,
                sampleRate: details.sampleRate,
                format: details.format
              });
              if (details.cover) {
                setCurrentSong(prev => prev ? { ...prev, cover: details.cover } : prev);
                const currentTrackIndex = await TrackPlayer.getActiveTrackIndex();
                if (currentTrackIndex !== undefined) {
                  await TrackPlayer.updateMetadataForTrack(currentTrackIndex, { artwork: details.cover });
                }
              }
            } else {
              setLyrics(null);
              setAudioDetails(null);
            }
          } catch (e) {
            setLyrics(null);
            setAudioDetails(null);
          }
        } else {
          setLyrics(null);
          setAudioDetails(null);
        }
      }
    }

    // Update queue status
    try {
      const q = await TrackPlayer.getQueue();
      const idx = await TrackPlayer.getActiveTrackIndex();
      setQueueLength(q.length);
      setQueuePosition((idx ?? 0) + 1);
    } catch (e) { }
  });

  const loadSongsFromMediaLibrary = async () => {

    try {
      // Import local module dynamically
      const ExpoMusicScannerModule = require('../../modules/expo-music-scanner/src/ExpoMusicScannerModule').default;

      let folderPath: string | null = await AsyncStorage.getItem('@music_folder');

      if (!folderPath) {
        try {
          // Ask for global media permissions first
          const mediaPerms = await MediaLibrary.requestPermissionsAsync();
          
          if (mediaPerms.granted) {
            // Wait a tiny bit to prevent Android UI glitch where opening SAF right after MediaLibrary dismisses it
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const permissions = await (FileSystem as any).StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (permissions.granted) {
              const uri = permissions.directoryUri;
              if (uri && uri.includes('primary%3A')) {
                const pathPart = decodeURIComponent(uri.split('primary%3A')[1]);
                folderPath = '/storage/emulated/0/' + pathPart;
              }
              if (folderPath) {
                await AsyncStorage.setItem('@music_folder', folderPath);
              }
            }
          } else {
            console.warn("Media permissions denied");
          }
        } catch (e) {
          console.warn("SAF error", e);
        }
      }

      const nativeSongs = await ExpoMusicScannerModule.getAudioFiles(folderPath);

      const formattedSongs: Song[] = nativeSongs.map((asset: any) => ({
        id: asset.id,
        uri: asset.uri,
        filename: asset.filename,
        folder: asset.folder,
        duration: asset.duration,
        title: asset.title,
        artist: asset.artist,
        album: asset.album,
        cover: asset.cover,
        trackNumber: asset.trackNumber
      }));

      setSongs(formattedSongs);

      let albumsObj: Record<string, Album> = {};
      let foldersObj: Record<string, Folder> = {};
      let artistsObj: Record<string, Artist> = {};

      formattedSongs.forEach(song => {
        let fName = song.folder || 'Desconocido';
        if (!foldersObj[fName]) foldersObj[fName] = { name: fName, cover: song.cover || null, songs: [] };
        foldersObj[fName].songs.push(song);

        let aName = song.album || 'Desconocido';
        if (!albumsObj[aName]) albumsObj[aName] = { name: aName, artist: song.artist || 'Desconocido', cover: song.cover || null, songs: [] };
        albumsObj[aName].songs.push(song);

        let artName = song.artist || 'Desconocido';
        if (!artistsObj[artName]) artistsObj[artName] = { name: artName, cover: song.cover || null, songs: [] };
        artistsObj[artName].songs.push(song);
      });

      // Acomoda las canciones de cada álbum de acuerdo a su metadata de orden o alfabéticamente
      Object.values(albumsObj).forEach(album => {
        album.songs.sort((a, b) => {
          if (a.trackNumber && b.trackNumber && a.trackNumber !== b.trackNumber) {
            return a.trackNumber - b.trackNumber;
          }
          const strA = a.title || a.filename || '';
          const strB = b.title || b.filename || '';
          return strA.localeCompare(strB);
        });
      });

      // Acomoda las canciones de cada carpeta alfabéticamente
      Object.values(foldersObj).forEach(folder => {
        folder.songs.sort((a, b) => {
          const strA = a.title || a.filename || '';
          const strB = b.title || b.filename || '';
          return strA.localeCompare(strB);
        });
      });

      setAlbums(albumsObj);
      setFolders(foldersObj);
      setArtists(artistsObj);

      // Fetch high-quality artist covers in the background
      Object.values(artistsObj).forEach(async (artist) => {
        if (artist.name !== 'Desconocido') {
          const coverUrl = await fetchArtistImage(artist.name);
          if (coverUrl) {
            setArtists(prev => {
              const updated = { ...prev };
              if (updated[artist.name]) {
                updated[artist.name] = { ...updated[artist.name], cover: coverUrl };
              }
              return updated;
            });
          }
        }
      });

    } catch (error) {
      console.error("Error loading songs from native module", error);
    }
  };

  const changeMusicFolder = async () => {
    try {
      const permissions = await (FileSystem as any).StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        let folderPath = permissions.directoryUri;
        if (folderPath && folderPath.includes('primary%3A')) {
          const pathPart = decodeURIComponent(folderPath.split('primary%3A')[1]);
          folderPath = '/storage/emulated/0/' + pathPart;
        }
        if (folderPath) {
          await AsyncStorage.setItem('@music_folder', folderPath);
          await loadSongsFromMediaLibrary();
        }
      }
    } catch (e) {
      console.warn("Error changing music folder", e);
    }
  };

  useEffect(() => {
    if (isPlayerReady && songs.length > 0) {
      const loadTracksToPlayer = async () => {
        try {
          const currentQueue = await TrackPlayer.getQueue();
          if (currentQueue.length > 0) {
            const idx = await TrackPlayer.getActiveTrackIndex();
            if (idx !== undefined && idx !== null && currentQueue[idx]) {
               const activeTrack = currentQueue[idx];
               const savedSong = songs.find(s => s.id === activeTrack.id);
               if (savedSong && !currentSong) {
                 setCurrentSong(savedSong);
                 const savedContext = await AsyncStorage.getItem('@last_context_id');
                 if (savedContext) setCurrentContextId(savedContext);
               }
            }
            return;
          }

          const savedSongId = await AsyncStorage.getItem('@last_played_song_id');
          const savedContextId = await AsyncStorage.getItem('@last_context_id') || 'all';

          const tracks: Track[] = songs.map(s => ({
            id: s.id,
            url: s.uri,
            title: s.title,
            artist: s.artist,
            album: s.album,
            artwork: s.cover,
            duration: s.duration,
          }));
          await TrackPlayer.reset();
          await TrackPlayer.add(tracks);
          setCurrentContextId(savedContextId);

          if (savedSongId) {
             const savedIndex = tracks.findIndex(t => t.id === savedSongId);
             if (savedIndex !== -1) {
                await TrackPlayer.skip(savedIndex);
                setCurrentSong(songs[savedIndex]);
             }
          }
        } catch (e) {
          console.error("Failed to load tracks to player", e);
        }
      };
      loadTracksToPlayer();
    }
  }, [isPlayerReady, songs]);

  useEffect(() => {
    if (currentSong) {
      AsyncStorage.setItem('@last_played_song_id', currentSong.id).catch(() => {});
      AsyncStorage.setItem('@last_context_id', currentContextId).catch(() => {});
    }
  }, [currentSong, currentContextId]);

  const playSound = async (song: Song, contextId?: string, contextList?: Song[], forceShuffle?: boolean) => {
    let targetList = contextList && contextList.length > 0 ? contextList : songs;
    let targetContextId = contextId || 'all';

    const trackIndex = targetList.findIndex(s => s.id === song.id);
    const effectiveShuffle = isShuffle || forceShuffle;
    
    if (forceShuffle && !isShuffle) {
      setIsShuffle(true);
    }

    if (trackIndex !== -1 && isPlayerReady) {
      if (currentContextId !== targetContextId || effectiveShuffle) {
        let tracks: Track[] = targetList.map(s => ({
          id: s.id,
          url: s.uri,
          title: s.title,
          artist: s.artist,
          album: s.album,
          artwork: s.cover,
          duration: s.duration,
        }));

        if (effectiveShuffle) {
          // Shuffle tracks but keep the selected song at index 0
          const selectedTrack = tracks[trackIndex];
          const otherTracks = tracks.filter((_, i) => i !== trackIndex);
          for (let i = otherTracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [otherTracks[i], otherTracks[j]] = [otherTracks[j], otherTracks[i]];
          }
          tracks = [selectedTrack, ...otherTracks];
        }

        await TrackPlayer.reset();
        for (let i = 0; i < tracks.length; i += 500) {
          await TrackPlayer.add(tracks.slice(i, i + 500));
          if (i + 500 < tracks.length) {
            await new Promise(r => setTimeout(r, 10));
          }
        }
        
        setCurrentContextId(targetContextId);
        if (!effectiveShuffle && trackIndex > 0) {
          await TrackPlayer.skip(trackIndex);
        }
        await TrackPlayer.play();
        setCurrentSong(song);
      } else {
        await TrackPlayer.skip(trackIndex);
        await TrackPlayer.play();
        setCurrentSong(song);
      }
    }
  };

  const playWithShuffle = async (contextId?: string, contextList?: Song[]) => {
    let targetList = contextList && contextList.length > 0 ? contextList : songs;
    if (targetList.length === 0) return;
    const randomSong = targetList[Math.floor(Math.random() * targetList.length)];
    await playSound(randomSong, contextId, targetList, true);
  };

  const pauseOrResumeSound = async () => {
    if (isPlaying) await TrackPlayer.pause();
    else await TrackPlayer.play();
  };

  const playNext = async () => { await TrackPlayer.skipToNext(); };
  const playPrevious = async () => { await TrackPlayer.skipToPrevious(); };
  const seekTo = async (millis: number) => { await TrackPlayer.seekTo(millis / 1000); };

  const extractMetadataOnDemand = async (uri: string) => {
    const song = songs.find(s => s.uri === uri);
    if (song) {
      try {
        const ExpoMusicScannerModule = require('../../modules/expo-music-scanner/src/ExpoMusicScannerModule').default;
        const details = await ExpoMusicScannerModule.getSongDetails(uri);
        return {
          title: song.title,
          artist: song.artist,
          album: song.album,
          cover: song.cover || null,
          lyrics: details?.lyrics || null
        };
      } catch (e) {
        return {
          title: song.title,
          artist: song.artist,
          album: song.album,
          cover: song.cover || null,
          lyrics: null
        };
      }
    }
    return { title: null, artist: null, album: null, cover: null, lyrics: null };
  };

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const stored = await AsyncStorage.getItem('@playlists');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (!parsed.find((p: Playlist) => p.id === 'favorites')) {
            parsed.unshift({ id: 'favorites', name: 'Me Gusta', songIds: [] });
          }
          setPlaylists(parsed);
        } else {
          setPlaylists([{ id: 'favorites', name: 'Me Gusta', songIds: [] }]);
        }
      } catch (e) { }
    };
    loadPlaylists();
  }, []);

  const savePlaylists = async (newPlaylists: import('../types').Playlist[]) => {
    setPlaylists(newPlaylists);
    try {
      await AsyncStorage.setItem('@playlists', JSON.stringify(newPlaylists));
    } catch (e) { }
  };

  const createPlaylist = async (name: string) => {
    const newPlaylist: Playlist = { id: Date.now().toString(), name, songIds: [] };
    await savePlaylists([...playlists, newPlaylist]);
  };

  const deletePlaylist = async (id: string) => {
    if (id === 'favorites') return;
    await savePlaylists(playlists.filter(p => p.id !== id));
  };

  const addSongToPlaylist = async (playlistId: string, songId: string) => {
    const song = songs.find(s => s.id === songId);
    const updated = playlists.map(p => {
      if (p.id === playlistId && !p.songIds.includes(songId)) {
        return {
          ...p,
          songIds: [...p.songIds, songId],
          cover: p.cover ? p.cover : (song?.cover || null)
        };
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

  const updatePlaylistCover = async (playlistId: string, coverUri: string) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, cover: coverUri };
      }
      return p;
    });
    await savePlaylists(updated);
  };

  const toggleFavorite = async (songId: string) => {
    const isFav = isFavorite(songId);
    if (isFav) {
      await removeSongFromPlaylist('favorites', songId);
    } else {
      await addSongToPlaylist('favorites', songId);
    }
  };

  const isFavorite = (songId: string) => {
    const fav = playlists.find(p => p.id === 'favorites');
    return fav ? fav.songIds.includes(songId) : false;
  };

  const toggleRepeatMode = async () => {
    import('react-native-track-player').then(async ({ RepeatMode: RM }) => {
      if (repeatMode === 'off') {
        await TrackPlayer.setRepeatMode(RM.Queue);
        setRepeatMode('queue');
      } else if (repeatMode === 'queue') {
        await TrackPlayer.setRepeatMode(RM.Track);
        setRepeatMode('track');
      } else {
        await TrackPlayer.setRepeatMode(RM.Off);
        setRepeatMode('off');
      }
    });
  };

  const toggleShuffle = async () => {
    const newShuffle = !isShuffle;
    setIsShuffle(newShuffle);

    if (currentSong) {
      let targetList = songs;
      if (currentContextId !== 'all') {
        if (playlists.find(p => p.id === currentContextId)) {
          const p = playlists.find(p => p.id === currentContextId);
          targetList = songs.filter(s => p?.songIds.includes(s.id));
        } else if (albums[currentContextId]) {
          targetList = albums[currentContextId].songs;
        } else if (folders[currentContextId]) {
          targetList = folders[currentContextId].songs;
        } else if (artists[currentContextId]) {
          targetList = artists[currentContextId].songs;
        }
      }

      const q = await TrackPlayer.getQueue();
      const currentIndex = await TrackPlayer.getActiveTrackIndex();
      if (currentIndex !== undefined && currentIndex !== null) {
        // Remove all tracks except the current one to prevent playback interruption
        const indicesToRemove = [];
        for (let i = 0; i < q.length; i++) {
          if (i !== currentIndex) indicesToRemove.push(i);
        }
        if (indicesToRemove.length > 0) {
          await TrackPlayer.remove(indicesToRemove);
        }

        const originalIndex = currentSong ? targetList.findIndex(s => s.id === currentSong.id) : -1;
        const mapTrack = (s: Song) => ({ id: s.id, url: s.uri, title: s.title, artist: s.artist, album: s.album, artwork: s.cover, duration: s.duration });

        if (newShuffle) {
          let tracksToShuffle = [...targetList];
          if (originalIndex !== -1) tracksToShuffle.splice(originalIndex, 1);

          for (let i = tracksToShuffle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tracksToShuffle[i], tracksToShuffle[j]] = [tracksToShuffle[j], tracksToShuffle[i]];
          }
          if (tracksToShuffle.length > 0) {
            const mappedTracks = tracksToShuffle.map(mapTrack);
            await TrackPlayer.add(mappedTracks);
          }
        } else {
          // Restore original order
          const beforeTracks = targetList.slice(0, originalIndex).map(mapTrack);
          const afterTracks = targetList.slice(originalIndex + 1).map(mapTrack);

          if (afterTracks.length > 0) {
            await TrackPlayer.add(afterTracks);
          }
          if (beforeTracks.length > 0) {
            await TrackPlayer.add(beforeTracks, 0);
          }
        }
      }
    }
  };

  return (
    <AudioContext.Provider value={{
      songs, setSongs: () => { }, albums, folders, artists, playlists,
      createPlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist, updatePlaylistCover,
      currentSong, isPlaying, metadata: { cover: currentSong?.cover || null, lyrics: lyrics, audioDetails },
      playSound, playWithShuffle, pauseOrResumeSound, playNext, playPrevious, seekTo,
      metadataCache: {}, extractMetadataOnDemand, currentContextId,
      loadSongsFromUri: loadSongsFromMediaLibrary,
      queuePosition, queueLength,
      toggleFavorite, isFavorite, repeatMode, toggleRepeatMode, isShuffle,
      toggleShuffle,
      changeMusicFolder
    }}>
      {children}
    </AudioContext.Provider>
  );
};
