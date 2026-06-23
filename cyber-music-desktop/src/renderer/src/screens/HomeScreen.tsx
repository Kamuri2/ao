import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Settings, ListMusic, Shuffle, Activity } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import CoverImage from '../components/CoverImage';
import { Virtuoso } from 'react-virtuoso';

const SongListItem = React.memo(({ item, isPlaying, onPress, index }: any) => {
  const { colors } = useTheme();

  return (
    <div 
      className="flex flex-row items-center p-3 rounded-xl mb-3 cursor-pointer hover:bg-black/5 transition-all duration-200 hover:scale-[1.01] active:scale-95"
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
          className="text-lg font-black mb-1 truncate" 
          style={{ color: isPlaying ? colors.primary : colors.text }}
        >
          {item.title || item.filename.replace(/\.[^/.]+$/, "")}
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
  const { songs, playSound, playWithShuffle, currentSong, loadSongsFromUri, queueLength, queuePosition } = useAudio();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    // If no songs and no folder saved, the context handles it or prompts.
    // In desktop we can just show empty state.
    if (songs.length === 0 && !localStorage.getItem('@music_folder')) {
      // Nothing
    } else if (songs.length === 0) {
       loadSongsFromUri();
    }
  }, []);

  const handlePlaySound = React.useCallback((item: any) => {
    playSound(item);
  }, [playSound]);

  const handleShuffle = () => {
    if (songs.length === 0) return;
    playWithShuffle('all', songs);
  };

  return (
    <div className="flex-1 min-h-screen px-8 pb-24 max-w-full w-full pt-10">
      {/* Floating Buttons */}
      <div className="fixed top-6 right-6 flex flex-row z-50">
        <button
          className="w-11 h-11 rounded-lg border-2 border-b-4 border-r-4 flex justify-center items-center ml-4 transition-transform active:scale-95"
          style={{ borderColor: colors.border }}
          onClick={toggleTheme}
        >
          {isDarkMode ? <Sun size={24} color={colors.text} /> : <Moon size={24} color={colors.text} />}
        </button>
        <button
          className="w-11 h-11 rounded-lg border-2 border-b-4 border-r-4 flex justify-center items-center ml-4 transition-transform active:scale-95"
          style={{ borderColor: colors.border }}
          onClick={() => navigate('/settings')}
        >
          <Settings size={24} color={colors.text} />
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
        <Virtuoso
          customScrollParent={document.getElementById('main-scroll-container') as HTMLElement}
          data={songs}
          itemContent={(index, item) => (
            <SongListItem
              item={item}
              index={index}
              isPlaying={currentSong?.id === item.id}
              onPress={() => handlePlaySound(item)}
            />
          )}
        />
      )}
    </div>
  );
}
