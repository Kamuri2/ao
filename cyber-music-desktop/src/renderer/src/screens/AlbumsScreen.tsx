import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import CoverImage from '../components/CoverImage';
import { useNavigate, useLocation } from 'react-router-dom';
import React from 'react';

export default function AlbumsScreen() {
  const { albums } = useAudio();
  const { colors } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex-1 px-8 py-8 max-w-full w-full animate-fade-in">
      <h1 className="text-4xl font-black uppercase tracking-widest mb-8" style={{ color: colors.text }}>Álbumes</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pb-32">
        {Object.values(albums).map((album: any) => (
          <div key={album.name} className="flex flex-col items-center p-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer group h-full"
            onClick={() => navigate(`/detail/album/${encodeURIComponent(album.name)}`)}>
            <div 
              className="relative w-full aspect-square mb-3 rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:brightness-110"
            >
              <CoverImage
                coverUrl={album.cover}
                audioPath={album.songs[0]?.path}
                hq={true}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <h2 className="text-center font-bold text-sm truncate w-full" style={{ color: colors.text }}>{album.name}</h2>
            <p className="text-center text-xs opacity-70 truncate w-full" style={{ color: colors.subText }}>{album.artist} • {album.songs.length} pistas</p>
          </div>
        ))}
      </div>
    </div>
  );
}
