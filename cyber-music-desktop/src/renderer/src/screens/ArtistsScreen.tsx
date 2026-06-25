import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import CoverImage from '../components/CoverImage';
import { useNavigate, useLocation } from 'react-router-dom';
import { VirtuosoGrid } from 'react-virtuoso';
import { motion } from 'framer-motion';
import React from 'react';

const GridList = React.forwardRef<HTMLDivElement, any>(({ style, children, ...props }, ref) => (
  <div ref={ref} {...props} style={style} className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full pb-8">
    {children}
  </div>
));

const GridItem = ({ children, ...props }: any) => <div {...props}>{children}</div>;

export default function ArtistsScreen() {
  const { artists } = useAudio();
  const { colors } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="flex-1 px-8 py-8 max-w-full w-full animate-fade-in">
      <h1 className="text-4xl font-black uppercase tracking-widest mb-8" style={{ color: colors.text }}>Artistas</h1>
      <VirtuosoGrid
        customScrollParent={document.getElementById('main-scroll-container') as HTMLElement}
        data={Object.values(artists)}
        computeItemKey={(index, item: any) => item.name}
        components={{
          List: GridList,
          Item: GridItem,
          Footer: () => <div style={{ height: '120px', width: '100%' }} />
        }}
        itemContent={(_, artist: any) => (
          <div className="flex flex-col items-center group cursor-pointer h-full"
               onClick={() => navigate(`/detail/artist/${encodeURIComponent(artist.name)}`)}>
            <div 
              className="w-full aspect-square rounded-full mb-4 overflow-hidden shadow-lg bg-black/5 dark:bg-white/5 transition-all duration-300 group-hover:brightness-110"
            >
              <CoverImage 
                coverUrl={artist.cover} 
                hq={true}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-center font-bold text-lg truncate w-full" style={{ color: colors.text }}>{artist.name}</h2>
            <p className="text-center text-sm opacity-70 truncate w-full" style={{ color: colors.subText }}>{artist.songs.length} pistas</p>
          </div>
        )}
      />
    </div>
  );
}
