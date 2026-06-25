import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import CoverImage from '../components/CoverImage';
import { Folder } from 'lucide-react';
import { motion } from 'framer-motion';

import { useNavigate, useLocation } from 'react-router-dom';
import { VirtuosoGrid } from 'react-virtuoso';
import React from 'react';

const GridList = React.forwardRef<HTMLDivElement, any>(({ style, children, ...props }, ref) => (
  <div ref={ref} {...props} style={style} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pb-8">
    {children}
  </div>
));

const GridItem = ({ children, ...props }: any) => <div {...props}>{children}</div>;

export default function FoldersScreen() {
  const { folders } = useAudio();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex-1 px-8 py-8 max-w-full w-full animate-fade-in">
      <h1 className="text-4xl font-black uppercase tracking-widest mb-8" style={{ color: theme.colors.text }}>Carpetas</h1>
      
      <VirtuosoGrid
        customScrollParent={document.getElementById('main-scroll-container') as HTMLElement}
        data={Object.values(folders)}
        computeItemKey={(index, item: any) => item.name}
        components={{
          List: GridList,
          Item: GridItem,
          Footer: () => <div style={{ height: '120px', width: '100%' }} />
        }}
        itemContent={(_, folder: any) => (
          <div className="flex flex-row items-center p-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer h-full group"
               onClick={() => navigate(`/detail/folder/${encodeURIComponent(folder.name)}`)}>
            <div 
              className="w-16 h-16 rounded-lg overflow-hidden transition-all duration-300 group-hover:brightness-110"
            >
              <CoverImage 
                coverUrl={folder.cover} 
                audioPath={folder.songs[0]?.path}
                hq={true}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 ml-4 overflow-hidden">
              <h2 className="text-lg font-bold truncate" style={{ color: theme.colors.text }}>{folder.name}</h2>
              <p className="text-sm opacity-70" style={{ color: theme.colors.subText }}>
                {folder.songs.length} pistas
              </p>
            </div>
            <Folder size={24} className="opacity-20" style={{ color: theme.colors.text }} />
          </div>
        )}
      />
    </div>
  );
}
