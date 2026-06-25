import React, { useState, useEffect, useMemo } from 'react';
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
      className="flex flex-row items-center p-3 rounded-xl mb-1 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
      onClick={onPress}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="w-10 text-center text-sm font-bold opacity-50 group-hover:opacity-100" style={{ color: colors.text }}>
        {isPlaying ? <Activity size={18} color={colors.primary} className="mx-auto" /> : index + 1}
      </div>
      <CoverImage
        coverUrl={item.cover || null}
        audioPath={item.path}
        hq={true}
        className="w-12 h-12 rounded-lg ml-2 shadow-sm"
        placeholderClassName="w-12 h-12 rounded-lg bg-black/10 dark:bg-white/10 ml-2 shadow-sm"
      />
      <div className="flex-1 ml-4 flex flex-col justify-center overflow-hidden pr-4">
        <span 
          className="text-base font-bold mb-0.5 truncate" 
          style={{ color: isPlaying ? colors.primary : colors.text }}
        >
          {item.title || item.filename.replace(/\.[^/.]+$/, "")}
        </span>
        <span className="text-sm font-medium truncate opacity-70" style={{ color: colors.text }}>
          {item.artist || 'Desconocido'}
        </span>
      </div>
      {item.duration > 0 && (
        <div className="text-sm font-medium opacity-50 mr-4" style={{ color: colors.text }}>
          {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
        </div>
      )}
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

  const [artistBio, setArtistBio] = useState<string | null>(null);

  useEffect(() => {
    if (type === 'artist' && id && artists[id]) {
      const artistName = artists[id].name;
      if (artistName && artistName !== 'Desconocido') {
        fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(artistName)}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.extract) {
              setArtistBio(data.extract);
            } else {
              setArtistBio('No se encontró información del artista en Wikipedia.');
            }
          })
          .catch(() => setArtistBio('Error al obtener la información del artista.'));
      }
    } else {
      setArtistBio(null);
    }
  }, [type, id, artists]);

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
    subtitle = `${dataList.length} pistas`;
    cover = artists[id].cover;
    audioPath = undefined; // Don't fallback to song cover for artists
  }

  if (!dataList) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <p className="text-xl font-bold mb-4" style={{ color: colors.text }}>No se encontró el elemento.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 rounded-full font-bold" style={{ backgroundColor: colors.primary, color: '#000' }}>Volver</button>
      </div>
    );
  }

  const artistAlbums = useMemo(() => {
    return type === 'artist' && title
      ? Object.values(albums).filter((a: any) => a.artist === title && a.name !== 'Desconocido')
      : [];
  }, [type, title, albums]);

  const displayList = useMemo(() => {
    if (type !== 'artist') return dataList;
    const albumSongIds = new Set(artistAlbums.flatMap((a: any) => a.songs.map((s: any) => s.id)));
    return dataList.filter((s: any) => !albumSongIds.has(s.id));
  }, [type, dataList, artistAlbums]);

  const initialTopMostItemIndex = useMemo(() => {
    return Math.max(0, displayList.findIndex((s: any) => s.id === currentSong?.id));
  }, [type, id]); // Only run when changing routes

  const [scrollParent, setScrollParent] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setScrollParent(document.getElementById('main-scroll-container'));
  }, []);

  const totalDuration = dataList.reduce((acc: number, song: any) => acc + (song.duration || 0), 0);
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h} h ${m} min`;
    return `${m} min`;
  };

  return (
    <div className="flex-1 min-h-screen pb-24 flex flex-col animate-fade-in relative z-0">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 right-0 h-[500px] overflow-hidden -z-10 select-none pointer-events-none">
        <CoverImage 
          coverUrl={cover}
          audioPath={audioPath}
          hq={true}
          className="w-full h-full object-cover opacity-30 blur-[80px] transform scale-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-color-70)] to-[var(--bg-color)]" style={{
          '--bg-color': colors.background,
          '--bg-color-70': `${colors.background}B3`
        } as React.CSSProperties} />
      </div>

      {/* Header Section (Spotify Style) */}
      <div className="relative pt-20 pb-8 px-8 flex flex-col md:flex-row items-end">
        <div className="absolute top-6 left-6 z-10">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-md">
            <ArrowLeft size={24} />
          </button>
        </div>
        
        {/* Cover */}
        <div className="w-52 h-52 md:w-64 md:h-64 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden flex-shrink-0 z-10 mt-8 md:mt-0">
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
        <div className="mt-6 md:mt-0 md:ml-8 flex flex-col z-10 flex-1 w-full justify-end h-full">
          <span className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: colors.text }}>{type === 'album' ? 'Álbum' : type === 'folder' ? 'Carpeta' : 'Artista'}</span>
          <h1 className="text-5xl md:text-8xl font-black text-wrap mb-6 tracking-tighter" style={{ color: colors.text, textShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>{title}</h1>
          <div className="flex flex-row items-center flex-wrap gap-2 text-sm md:text-base font-bold opacity-90" style={{ color: colors.text }}>
            {type === 'album' && subtitle !== 'Carpeta' ? (
              <span 
                className="cursor-pointer hover:underline" 
                onClick={() => navigate(`/detail/artist/${encodeURIComponent(subtitle)}`)}
              >
                {subtitle}
              </span>
            ) : (
              <span>{subtitle}</span>
            )}
            <span className="opacity-50">•</span>
            <span>{dataList.length} canciones</span>
            {totalDuration > 0 && (
              <>
                <span className="opacity-50">•</span>
                <span>{formatDuration(totalDuration)}</span>
              </>
            )}
            {type === 'album' && albums[id!]?.year && (
              <>
                <span className="opacity-50">•</span>
                <span>{albums[id!].year}</span>
              </>
            )}
          </div>
          {type === 'artist' && artistBio && (
            <p className="mt-4 text-sm md:text-base opacity-80 max-w-3xl line-clamp-3 hover:line-clamp-none transition-all" style={{ color: colors.text }}>
              {artistBio}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-8 py-6 flex flex-row items-center gap-6 relative z-10">
        <button 
          className="w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-[0_8px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
          style={{ backgroundColor: colors.primary, color: '#000' }}
          onClick={() => playSound(dataList[0], `${type}:${id}`, dataList, false)}
        >
          <Play size={32} fill="currentColor" className="ml-1" />
        </button>
        <button 
          className="p-3 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
          style={{ color: colors.text }}
          title="Reproducción aleatoria"
          onClick={() => playWithShuffle(`${type}:${id}`, dataList)}
        >
          <Shuffle size={32} />
        </button>
      </div>

      {/* Artist Albums */}
      {type === 'artist' && artistAlbums.length > 0 && (
        <div className="px-8 mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: colors.text }}>Álbumes</h2>
          <div 
            className="flex overflow-x-auto gap-4 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            onWheel={(e) => {
              if (e.currentTarget) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
          >
            {artistAlbums.map((album: any) => (
              <div 
                key={album.name}
                className="flex flex-col flex-shrink-0 w-32 md:w-40 cursor-pointer group"
                onClick={() => navigate(`/detail/album/${encodeURIComponent(album.name)}`)}
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl shadow-lg overflow-hidden mb-3 relative bg-black/5 dark:bg-white/5">
                  <CoverImage 
                    coverUrl={album.cover} 
                    audioPath={album.songs[0]?.path}
                    hq={true}
                    className="w-full h-full object-cover" 
                    placeholderClassName="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play size={32} color="#fff" />
                  </div>
                </div>
                <span className="font-bold text-sm truncate" style={{ color: colors.text }}>{album.name}</span>
                <span className="text-xs opacity-70 truncate mt-0.5" style={{ color: colors.text }}>{album.year || `${album.songs.length} pistas`}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Track List */}
      <div className="flex-1">
        {type === 'artist' && (
          <h2 className="px-8 text-2xl font-bold mb-4" style={{ color: colors.text }}>
            {displayList.length > 0 ? "Canciones Sueltas" : ""}
          </h2>
        )}
        {displayList.length > 0 && scrollParent && (
          <Virtuoso
            customScrollParent={scrollParent}
            data={displayList}
            initialTopMostItemIndex={initialTopMostItemIndex}
            className="px-8"
            itemContent={(index, song) => (
              <SongListItem 
                item={song} 
                index={index} 
                isPlaying={currentSong?.id === song.id}
                onPress={() => playSound(song, `${type}:${id}`, displayList)}
              />
            )}
          />
        )}
      </div>
    </div>
  );
}
