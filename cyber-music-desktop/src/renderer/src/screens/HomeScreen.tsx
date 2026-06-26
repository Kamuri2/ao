import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Settings, ListMusic, Shuffle, Activity, Search, RefreshCw, Mic2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import CoverImage from '../components/CoverImage';
import { Virtuoso } from 'react-virtuoso';

const SongListItem = React.memo(({ item, isPlaying, onPress, index }: any) => {
  const { colors } = useTheme();

  return (
    <div 
      className="flex flex-row items-center p-3 rounded-xl mb-3 cursor-pointer hover:bg-black/5 transition-colors"
      onClick={onPress}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <CoverImage
        coverUrl={item.cover || null}
        audioPath={item.path}
        hq={true}
        className="w-[70px] h-[70px] rounded-lg"
        placeholderClassName="w-[70px] h-[70px] rounded-lg bg-black/10"
      />
      <div className="flex-1 ml-4 flex flex-col justify-center">
        <span 
          className="text-lg font-black mb-1 truncate flex items-center gap-2" 
          style={{ color: isPlaying ? colors.primary : colors.text }}
        >
          {item.title || item.filename.replace(/\.[^/.]+$/, "")}
          {item.hasLyrics && <Mic2 size={16} className="opacity-50" />}
        </span>
        <span className="text-sm font-bold truncate" style={{ color: colors.subText }}>
          {item.artist || 'Desconocido'}
        </span>
      </div>
      {isPlaying && (
        <Activity size={18} color={colors.primary} className="ml-3" />
      )}
    </div>
  );
});

export default function HomeScreen() {
  const { songs, albums, artists, playSound, playWithShuffle, currentSong, loadSongsFromUri, queueLength, queuePosition } = useAudio();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // AudioContext is responsible for loading the initial folder on startup.
    // We shouldn't force open the directory picker here.
  }, []);

  const handlePlaySound = React.useCallback((item: any) => {
    playSound(item);
  }, [playSound]);

  const handleShuffle = () => {
    if (songs.length === 0) return;
    playWithShuffle('all', songs);
  };

  const getSearchResults = () => {
    if (!searchQuery) return songs.map(s => ({ type: 'song', data: s }));

    const lowerQuery = searchQuery.toLowerCase();
    
    const matchedArtists = Object.values(artists).filter(a => a.name.toLowerCase().includes(lowerQuery));
    const matchedAlbums = Object.values(albums).filter(a => a.name.toLowerCase().includes(lowerQuery) || a.artist.toLowerCase().includes(lowerQuery));
    const matchedSongs = songs.filter(s => (s.title || s.filename).toLowerCase().includes(lowerQuery) || (s.artist || '').toLowerCase().includes(lowerQuery));

    const results: any[] = [];
    
    if (matchedArtists.length > 0) {
      results.push({ type: 'header', title: 'Artistas' });
      matchedArtists.forEach(a => results.push({ type: 'artist', data: a }));
    }
    
    if (matchedAlbums.length > 0) {
      results.push({ type: 'header', title: 'Álbumes' });
      matchedAlbums.forEach(a => results.push({ type: 'album', data: a }));
    }

    if (matchedSongs.length > 0) {
      results.push({ type: 'header', title: 'Canciones' });
      matchedSongs.forEach(s => results.push({ type: 'song', data: s }));
    }

    if (results.length === 0) {
      results.push({ type: 'empty' });
    }

    return results;
  };

  return (
    <div className="flex-1 min-h-screen px-8 pb-24 max-w-full w-full pt-10 animate-fade-in">
      {/* Floating Buttons */}
      <div className="fixed top-6 right-6 flex flex-row z-50">
        <button
          className="w-11 h-11 rounded-lg border-2 border-b-4 border-r-4 flex justify-center items-center ml-4 transition-transform active:scale-95 bg-black/5 dark:bg-white/5 backdrop-blur-md"
          style={{ borderColor: colors.border }}
          onClick={() => {
            const folder = localStorage.getItem('@music_folder');
            if (folder) loadSongsFromUri(folder);
            else loadSongsFromUri();
          }}
          title="Refrescar Música"
        >
          <RefreshCw size={20} color={colors.text} />
        </button>
        <button
          className="w-11 h-11 rounded-lg border-2 border-b-4 border-r-4 flex justify-center items-center ml-4 transition-transform active:scale-95 bg-black/5 dark:bg-white/5 backdrop-blur-md"
          style={{ borderColor: colors.border }}
          onClick={toggleTheme}
          title="Cambiar Tema"
        >
          {isDarkMode ? <Sun size={20} color={colors.text} /> : <Moon size={20} color={colors.text} />}
        </button>
        <button
          className="w-11 h-11 rounded-lg border-2 border-b-4 border-r-4 flex justify-center items-center ml-4 transition-transform active:scale-95 bg-black/5 dark:bg-white/5 backdrop-blur-md"
          style={{ borderColor: colors.border }}
          onClick={() => navigate('/settings')}
          title="Ajustes"
        >
          <Settings size={20} color={colors.text} />
        </button>
      </div>

      <h1 className="text-5xl font-black uppercase tracking-[5px] mt-8 mb-6" style={{ color: colors.text }}>
        Música
      </h1>

      {songs.length > 0 && (
        <div className="flex flex-row items-center justify-between px-2 mb-4">
          <div className="flex flex-row items-center">
            <ListMusic size={28} color={colors.primary} />
            <span className="text-sm font-bold ml-2" style={{ color: colors.subText }}>
              {currentSong ? `Reproduciendo ${queuePosition} de ${queueLength}` : `${songs.length} canciones`}
            </span>
          </div>
          <button 
            className="flex flex-row items-center px-4 py-2 rounded-full transition-transform active:scale-95 hover:opacity-90" 
            style={{ backgroundColor: colors.primary }} 
            onClick={handleShuffle}
          >
            <Shuffle size={18} color="#000" />
            <span className="text-black font-bold ml-2 text-sm">Aleatorio</span>
          </button>
        </div>
      )}

      {songs.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 mt-20 p-8">
          <h2 className="text-2xl font-black mb-3 text-center" style={{ color: colors.text }}>No hay canciones cargadas.</h2>
          <p className="text-base font-bold text-center mb-8" style={{ color: colors.subText }}>
            Haz clic abajo para seleccionar la carpeta donde tienes tu música.
          </p>
          <button
            className="px-6 py-3 rounded-lg border border-opacity-50 transition-transform active:scale-95 hover:bg-black/5"
            style={{ borderColor: colors.border, color: colors.text }}
            onClick={() => loadSongsFromUri()}
          >
            <span className="font-black text-base">Seleccionar Carpeta</span>
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 px-2 relative">
            <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 opacity-50" style={{ color: colors.text }} />
            <input 
              type="text" 
              placeholder="Buscar canción o artista..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-4 pl-12 pr-4 rounded-xl border-2 bg-transparent transition-all outline-none"
              style={{ 
                borderColor: colors.border, 
                color: colors.text,
                backgroundColor: 'rgba(0,0,0,0.02)'
              }}
            />
          </div>
          <Virtuoso
            customScrollParent={document.getElementById('main-scroll-container') as HTMLElement}
            data={getSearchResults()}
            itemContent={(index, item) => {
              if (item.type === 'header') {
                return <h2 className="text-2xl font-black mt-6 mb-4 ml-2 uppercase tracking-wider" style={{ color: colors.text }}>{item.title}</h2>;
              }
              if (item.type === 'empty') {
                return <div className="text-center mt-10 text-lg font-bold" style={{ color: colors.subText }}>No se encontraron resultados</div>;
              }
              if (item.type === 'artist') {
                return (
                  <div className="flex flex-row items-center p-3 rounded-xl mb-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all" onClick={() => navigate(`/detail/artist/${encodeURIComponent(item.data.name)}`)}>
                    <CoverImage coverUrl={item.data.cover} audioPath={item.data.songs[0]?.path} hq={true} className="w-16 h-16 rounded-full" placeholderClassName="w-16 h-16 rounded-full bg-black/10 dark:bg-white/10" />
                    <div className="ml-4 flex flex-col justify-center">
                      <span className="text-xl font-black" style={{ color: colors.text }}>{item.data.name}</span>
                      <span className="text-sm font-bold opacity-70" style={{ color: colors.text }}>Artista</span>
                    </div>
                  </div>
                );
              }
              if (item.type === 'album') {
                return (
                  <div className="flex flex-row items-center p-3 rounded-xl mb-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all" onClick={() => navigate(`/detail/album/${encodeURIComponent(item.data.name)}`)}>
                    <CoverImage coverUrl={item.data.cover} audioPath={item.data.songs[0]?.path} hq={true} className="w-16 h-16 rounded-lg" placeholderClassName="w-16 h-16 rounded-lg bg-black/10 dark:bg-white/10" />
                    <div className="ml-4 flex flex-col justify-center">
                      <span className="text-xl font-black" style={{ color: colors.text }}>{item.data.name}</span>
                      <span className="text-sm font-bold opacity-70" style={{ color: colors.text }}>Álbum • {item.data.artist}</span>
                    </div>
                  </div>
                );
              }
              if (item.type === 'song') {
                return (
                  <SongListItem
                    item={item.data}
                    index={index}
                    isPlaying={currentSong?.id === item.data.id}
                    onPress={() => handlePlaySound(item.data)}
                  />
                );
              }
              return null;
            }}
          />
        </>
      )}
    </div>
  );
}
