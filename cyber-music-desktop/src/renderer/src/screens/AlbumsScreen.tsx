import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import CoverImage from '../components/CoverImage';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VirtuosoGrid } from 'react-virtuoso';
import React from 'react';

export default function AlbumsScreen() {
  const { albums } = useAudio();
  const { colors } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="flex-1 px-8 py-8 max-w-full w-full animate-fade-in">
      <h1 className="text-4xl font-black uppercase tracking-widest mb-8" style={{ color: colors.text }}>Álbumes</h1>

      <VirtuosoGrid
        customScrollParent={document.getElementById('main-scroll-container') as HTMLElement}
        data={Object.values(albums)}
        components={{
          List: React.forwardRef<HTMLDivElement, any>(({ style, children, ...props }, ref) => (
            <div ref={ref} {...props} style={style} className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pb-8">
              {children}
            </div>
          )),
          Item: ({ children, ...props }) => <div {...props}>{children}</div>
        }}
        itemContent={(_, album: any) => (
          <div className="flex flex-col items-center p-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer group h-full"
            onClick={() => navigate(`/detail/album/${encodeURIComponent(album.name)}`)}>
            <div className="relative w-full aspect-square mb-3">
              <CoverImage
                coverUrl={album.cover}
                audioPath={album.songs[0]?.path}
                hq={true}
                className="w-full h-full object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play size={40} color="#fff" className="ml-2" />
              </div>
            </div>
            <h2 className="text-center font-bold text-sm truncate w-full" style={{ color: colors.text }}>{album.name}</h2>
            <p className="text-center text-xs opacity-70 truncate w-full" style={{ color: colors.subText }}>{album.artist} • {album.songs.length} pistas</p>
          </div>
        )}
      />
    </div>
  );
}
