import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Play, Shuffle, Activity } from 'lucide-react';
import CoverImage from '../components/CoverImage';
import { Virtuoso } from 'react-virtuoso';

const SongListItem = React.memo(({ item, isPlaying, onPress, index }: any) => {
  const { colors } = useTheme();

  return (
    <div 
      className="flex flex-row items-center p-3 rounded-xl mb-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 hover:scale-[1.01] active:scale-95 group"
      onClick={onPress}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="w-8 text-center text-sm font-bold opacity-50 group-hover:opacity-100" style={{ color: colors.text }}>
        {isPlaying ? <Activity size={16} color={colors.primary} className="mx-auto" /> : index + 1}
      </div>
      <CoverImage
        coverUrl={item.cover || null}
        audioPath={item.path}
        hq={true}
        className="w-12 h-12 rounded-md ml-2"
        placeholderClassName="w-12 h-12 rounded-md bg-black/10 dark:bg-white/10 ml-2"
      />
      <div className="flex-1 ml-4 flex flex-col justify-center">
        <span 
          className="text-base font-bold mb-0.5 truncate" 
          style={{ color: isPlaying ? colors.primary : colors.text }}
        >
          {item.title || item.filename.replace(/\.[^/.]+$/, "")}
        </span>
        <span className="text-xs font-medium truncate" style={{ color: colors.subText }}>
          {item.artist || 'Desconocido'}
        </span>
      </div>
    </div>
  );
});

export default function ListDetailScreen() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { albums, folders, artists, playSound, playWithShuffle, currentSong } = useAudio();
  const { colors } = useTheme();

  let dataList: any = null;
  let title = '';
  let subtitle = '';
  let cover: string | null = null;
  let audioPath: string | undefined = undefined;

  if (type === 'album' && id && albums[id]) {
    dataList = albums[id].songs;
    title = albums[id].name;
    subtitle = albums[id].artist;
    cover = albums[id].cover;
    audioPath = dataList[0]?.path;
  } else if (type === 'folder' && id && folders[id]) {
    dataList = folders[id].songs;
    title = folders[id].name;
    subtitle = 'Carpeta';
    cover = folders[id].cover;
    audioPath = dataList[0]?.path;
  } else if (type === 'artist' && id && artists[id]) {
    dataList = artists[id].songs;
    title = artists[id].name;
    subtitle = 'Artista';
    cover = artists[id].cover;
    audioPath = dataList[0]?.path;
  }

  if (!dataList) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <p className="text-xl font-bold mb-4" style={{ color: colors.text }}>No se encontró el elemento.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 rounded-full font-bold" style={{ backgroundColor: colors.primary, color: '#000' }}>Volver</button>
      </div>
    );
  }

  const totalDuration = dataList.reduce((acc: number, song: any) => acc + (song.duration || 0), 0);
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h} h ${m} min`;
    return `${m} min`;
  };

  return (
    <div className="flex-1 min-h-screen pb-24 flex flex-col animate-slide-up">
      {/* Header Section (Spotify Style) */}
      <div className="relative pt-12 pb-8 px-8 flex flex-col md:flex-row items-end border-b border-black/5 dark:border-white/5">
        <div className="absolute top-6 left-6 z-10">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-md">
            <ArrowLeft size={24} />
          </button>
        </div>
        
        {/* Cover */}
        <div className="w-48 h-48 md:w-60 md:h-60 shadow-2xl rounded-xl overflow-hidden flex-shrink-0 z-10 mt-8 md:mt-0">
          <CoverImage 
            coverUrl={cover} 
            audioPath={audioPath}
            hq={true}
            className="w-full h-full object-cover" 
            placeholderClassName="w-full h-full bg-black/10 dark:bg-white/10" 
            iconSize={80}
          />
        </div>

        {/* Text Details */}
        <div className="mt-6 md:mt-0 md:ml-6 flex flex-col z-10 flex-1 w-full">
          <span className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: colors.text }}>{type === 'album' ? 'Álbum' : type === 'folder' ? 'Carpeta' : 'Artista'}</span>
          <h1 className="text-4xl md:text-6xl font-black text-wrap mb-4" style={{ color: colors.text }}>{title}</h1>
          <div className="flex flex-row items-center flex-wrap gap-2 text-sm font-bold opacity-80" style={{ color: colors.text }}>
            <span>{subtitle}</span>
            <span>•</span>
            <span>{dataList.length} canciones</span>
            {totalDuration > 0 && (
              <>
                <span>•</span>
                <span>{formatDuration(totalDuration)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-8 py-6 flex flex-row items-center gap-4">
        <button 
          className="w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-lg"
          style={{ backgroundColor: colors.primary, color: '#000' }}
          onClick={() => playWithShuffle('list', dataList)}
        >
          <Play size={28} fill="currentColor" className="ml-1" />
        </button>
        <button 
          className="p-3 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
          style={{ color: colors.text }}
          title="Reproducción aleatoria"
          onClick={() => playWithShuffle('list', dataList)}
        >
          <Shuffle size={28} />
        </button>
      </div>

      {/* Track List */}
      <div className="flex-1">
        <Virtuoso
          customScrollParent={document.getElementById('main-scroll-container') as HTMLElement}
          data={dataList}
          className="px-8"
          itemContent={(index, song) => (
            <SongListItem 
              item={song} 
              index={index} 
              isPlaying={currentSong?.id === song.id}
              onPress={() => playSound(song, 'list', dataList)}
            />
          )}
        />
      </div>
    </div>
  );
}
