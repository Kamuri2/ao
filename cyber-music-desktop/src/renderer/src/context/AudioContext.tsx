import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Song, Album, Folder, Artist, AudioContextType, Playlist } from '../types';

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
  const [currentContextId, setCurrentContextId] = useState<string>('all');
  const [queue, setQueue] = useState<Song[]>([]);
  const [queuePosition, setQueuePosition] = useState(0);
  const [queueLength, setQueueLength] = useState(0);

  const [repeatMode, setRepeatMode] = useState<'off' | 'track' | 'queue'>('off');
  const [isShuffle, setIsShuffle] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<Song[]>([]);
  const currentQueueIndex = useRef(-1);
  const originalQueueRef = useRef<Song[]>([]);
  const repeatModeRef = useRef(repeatMode);
  const isShuffleRef = useRef(isShuffle);
  const currentContextIdRef = useRef(currentContextId);

  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { currentContextIdRef.current = currentContextId; }, [currentContextId]);

  const [isScanning, setIsScanning] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => handleTrackEnded();
    audio.ontimeupdate = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };
    audio.onloadedmetadata = () => {
      setDuration(audio.duration || 0);
    };
    audioRef.current = audio;

    const loadPlaylists = () => {
      const stored = localStorage.getItem('@playlists');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (!parsed.find((p: Playlist) => p.id === 'favorites')) {
            parsed.unshift({ id: 'favorites', name: 'Me Gusta', songIds: [] });
          }
          setPlaylists(parsed);
        } catch (e) {
          setPlaylists([{ id: 'favorites', name: 'Me Gusta', songIds: [] }]);
        }
      } else {
        setPlaylists([{ id: 'favorites', name: 'Me Gusta', songIds: [] }]);
      }
    };
    loadPlaylists();

    const storedFolder = localStorage.getItem('@music_folder');
    const cached = localStorage.getItem('@cached_songs');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setSongs(parsed);
        buildLists(parsed);
      } catch (e) {}
    }
    
    if (storedFolder) {
      loadSongsFromUri(storedFolder, true);
    }
  }, []);

  const buildLists = (formattedSongs: Song[]) => {
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

    // Fetch artist profile images asynchronously in batch
    const fetchArtistImages = async () => {
      const artistNames = Object.keys(artistsObj).filter(n => n !== 'Desconocido');
      
      for (const name of artistNames) {
        const url = await window.api.getArtistImage(name);
        if (url && url !== artistsObj[name].cover) {
          setArtists(prev => ({
            ...prev,
            [name]: { ...prev[name], cover: url }
          }));
        }
        // Small delay to be polite to APIs and avoid rate limits
        await new Promise(r => setTimeout(r, 200));
      }
    };
    fetchArtistImages();
  };

  const handleTrackEnded = () => {
    if (repeatModeRef.current === 'track') {
      audioRef.current!.currentTime = 0;
      audioRef.current!.play();
    } else {
      playNext();
    }
  };

  const loadSongsFromUri = async (folderPath?: string, _isBackgroundLoad?: boolean) => {
    let targetFolder: string | null | undefined = folderPath;
    if (!targetFolder) {
      targetFolder = await window.api.openDirectory();
      if (targetFolder) {
        localStorage.setItem('@music_folder', targetFolder);
      } else {
        return;
      }
    }

    setIsScanning(true);
    try {
      const nativeSongs = await window.api.readMusicFiles(targetFolder);
      
      const formattedSongs: Song[] = nativeSongs.map((asset: any) => ({
        ...asset,
        duration: 0,
      }));

      formattedSongs.sort((a, b) => {
        const strA = a.title || a.filename || '';
        const strB = b.title || b.filename || '';
        return strA.localeCompare(strB);
      });

      setSongs(formattedSongs);
      buildLists(formattedSongs);

      try {
        localStorage.setItem('@cached_songs', JSON.stringify(formattedSongs));
      } catch(e) {}
    } catch (e) {
      console.error("Error loading songs:", e);
    } finally {
      setIsScanning(false);
    }
  };

  const changeMusicFolder = async () => {
    await loadSongsFromUri();
  };

  const savePlaylists = (newPlaylists: Playlist[]) => {
    setPlaylists(newPlaylists);
    localStorage.setItem('@playlists', JSON.stringify(newPlaylists));
  };

  const createPlaylist = async (name: string) => {
    const newPlaylist: Playlist = { id: Date.now().toString(), name, songIds: [] };
    savePlaylists([...playlists, newPlaylist]);
  };

  const deletePlaylist = async (id: string) => {
    if (id === 'favorites') return;
    savePlaylists(playlists.filter(p => p.id !== id));
  };

  const addSongToPlaylist = async (playlistId: string, songId: string) => {
    const song = songs.find(s => s.id === songId);
    const updated = playlists.map(p => {
      if (p.id === playlistId && !p.songIds.includes(songId)) {
        return { ...p, songIds: [...p.songIds, songId], cover: p.cover ? p.cover : (song?.cover || null) };
      }
      return p;
    });
    savePlaylists(updated);
  };

  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, songIds: p.songIds.filter(id => id !== songId) };
      }
      return p;
    });
    savePlaylists(updated);
  };

  const updatePlaylistCover = async (playlistId: string, coverUri: string) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) return { ...p, cover: coverUri };
      return p;
    });
    savePlaylists(updated);
  };

  const toggleFavorite = async (songId: string) => {
    if (isFavorite(songId)) {
      await removeSongFromPlaylist('favorites', songId);
    } else {
      await addSongToPlaylist('favorites', songId);
    }
  };

  const isFavorite = (songId: string) => {
    const fav = playlists.find(p => p.id === 'favorites');
    return fav ? fav.songIds.includes(songId) : false;
  };

  const loadMetadataForSong = async (song: Song) => {
    try {
      const meta = await window.api.getMetadata(song.path);
      setLyrics(meta.lyrics);
      setAudioDetails({ bitrate: meta.bitrate, sampleRate: meta.sampleRate, format: meta.format });
      const updatedSong = { ...song, title: meta.title, artist: meta.artist, album: meta.album, cover: meta.cover, duration: meta.duration };
      setCurrentSong(updatedSong);
      return updatedSong;
    } catch (e) {
      console.error(e);
      return song;
    }
  };

  const playSound = async (song: Song, contextId?: string, contextList?: Song[], forceShuffle?: boolean, rebuildQueue: boolean = true) => {
    if (rebuildQueue) {
      let targetList = contextList && contextList.length > 0 ? contextList : songs;
      let targetContextId = contextId || 'all';
      
      setCurrentContextId(targetContextId);
      originalQueueRef.current = [...targetList];
      
      let tracks = [...targetList];
      if (isShuffleRef.current || forceShuffle) {
        const otherTracks = tracks.filter(s => s.id !== song.id);
        for (let i = otherTracks.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [otherTracks[i], otherTracks[j]] = [otherTracks[j], otherTracks[i]];
        }
        tracks = [song, ...otherTracks];
      }
      
      queueRef.current = tracks;
      setQueue(tracks);
      currentQueueIndex.current = tracks.findIndex(s => s.id === song.id);
      
      setQueueLength(tracks.length);
      setQueuePosition(currentQueueIndex.current + 1);
    } else {
      currentQueueIndex.current = queueRef.current.findIndex(s => s.id === song.id);
      setQueuePosition(currentQueueIndex.current + 1);
    }
    
    if (audioRef.current) {
      audioRef.current.src = song.uri;
      audioRef.current.play();
    }
    
    setCurrentSong(song);
    loadMetadataForSong(song);
  };

  const playWithShuffle = async (contextId?: string, contextList?: Song[]) => {
    let targetList = contextList && contextList.length > 0 ? contextList : songs;
    if (targetList.length === 0) return;
    const randomSong = targetList[Math.floor(Math.random() * targetList.length)];
    await playSound(randomSong, contextId, targetList, true);
  };

  const pauseOrResumeSound = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const playNext = async () => {
    if (currentQueueIndex.current >= 0 && currentQueueIndex.current < queueRef.current.length - 1) {
      currentQueueIndex.current += 1;
      const nextSong = queueRef.current[currentQueueIndex.current];
      playSound(nextSong, currentContextIdRef.current, undefined, false, false);
    } else if (repeatModeRef.current === 'queue' && queueRef.current.length > 0) {
      currentQueueIndex.current = 0;
      const nextSong = queueRef.current[0];
      playSound(nextSong, currentContextIdRef.current, undefined, false, false);
    }
  };

  const playPrevious = async () => {
    if (currentQueueIndex.current > 0) {
      currentQueueIndex.current -= 1;
      const prevSong = queueRef.current[currentQueueIndex.current];
      playSound(prevSong, currentContextIdRef.current, undefined, false, false);
    }
  };

  const seekTo = async (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
  };

  const extractMetadataOnDemand = async (uri: string) => {
    const song = songs.find(s => s.uri === uri);
    if (song) {
      const meta = await window.api.getMetadata(song.path);
      return meta;
    }
    return { title: null, artist: null, album: null, cover: null, lyrics: null };
  };

  const toggleRepeatMode = async () => {
    if (repeatMode === 'off') setRepeatMode('queue');
    else if (repeatMode === 'queue') setRepeatMode('track');
    else setRepeatMode('off');
  };

  const toggleShuffle = async () => {
    const newState = !isShuffle;
    setIsShuffle(newState);
    
    if (!currentSong) return;
    
    if (newState) {
      const otherTracks = originalQueueRef.current.filter(s => s.id !== currentSong.id);
      for (let i = otherTracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherTracks[i], otherTracks[j]] = [otherTracks[j], otherTracks[i]];
      }
      const newQueue = [currentSong, ...otherTracks];
      queueRef.current = newQueue;
      setQueue(newQueue);
      currentQueueIndex.current = 0;
      setQueuePosition(1);
    } else {
      const newQueue = [...originalQueueRef.current];
      queueRef.current = newQueue;
      setQueue(newQueue);
      currentQueueIndex.current = newQueue.findIndex(s => s.id === currentSong.id);
      setQueuePosition(currentQueueIndex.current + 1);
    }
  };

  const reorderQueue = (startIndex: number, endIndex: number) => {
    const result = Array.from(queueRef.current);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    queueRef.current = result;
    setQueue(result);
    
    if (currentSong) {
      currentQueueIndex.current = result.findIndex(s => s.id === currentSong.id);
      setQueuePosition(currentQueueIndex.current + 1);
    }
  };

  return (
    <AudioContext.Provider value={{
      isScanning, songs, setSongs, albums, folders, artists, playlists,
      createPlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist, updatePlaylistCover,
      currentSong, isPlaying, metadata: { cover: currentSong?.cover || null, lyrics, audioDetails },
      playSound, playWithShuffle, pauseOrResumeSound, playNext, playPrevious, seekTo,
      progress, duration,
      metadataCache: {}, extractMetadataOnDemand, currentContextId,
      loadSongsFromUri, queue, queuePosition, queueLength, reorderQueue,
      toggleFavorite, isFavorite, repeatMode, toggleRepeatMode, isShuffle,
      toggleShuffle, changeMusicFolder, isPlayerOpen, setIsPlayerOpen
    }}>
      {children}
    </AudioContext.Provider>
  );
};
