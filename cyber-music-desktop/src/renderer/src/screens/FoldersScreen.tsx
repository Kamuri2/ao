import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import CoverImage from '../components/CoverImage';
import { Folder } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export default function FoldersScreen() {
  const { folders } = useAudio();
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <div className="flex-1 px-8 py-8 max-w-full w-full">
      <h1 className="text-4xl font-black uppercase tracking-widest mb-8" style={{ color: theme.colors.text }}>Carpetas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(folders).map((folder: any, i: number) => (
          <div key={folder.name} 
               className="flex flex-row items-center p-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer animate-slide-up hover:scale-[1.01]"
               style={{ animationDelay: `${i * 30}ms` }}
               onClick={() => navigate(`/detail/folder/${encodeURIComponent(folder.name)}`)}>
            <CoverImage 
              coverUrl={folder.cover} 
              audioPath={folder.songs[0]?.path}
              hq={true}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1 ml-4 overflow-hidden">
              <h2 className="text-lg font-bold truncate" style={{ color: theme.colors.text }}>{folder.name}</h2>
              <p className="text-sm opacity-70" style={{ color: theme.colors.subText }}>
                {folder.songs.length} pistas
              </p>
            </div>
            <Folder size={24} className="opacity-20" style={{ color: theme.colors.text }} />
          </div>
        ))}
      </div>
    </div>
  );
}
