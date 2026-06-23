import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import CoverImage from '../components/CoverImage';

import { useNavigate } from 'react-router-dom';

export default function ArtistsScreen() {
  const { artists } = useAudio();
  const { colors } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="flex-1 px-8 py-8 max-w-full w-full">
      <h1 className="text-4xl font-black uppercase tracking-widest mb-8" style={{ color: colors.text }}>Artistas</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Object.values(artists).map((artist: any, i: number) => (
          <div key={artist.name} className="flex flex-col items-center group cursor-pointer"
               style={{ animationDelay: `${i * 30}ms` }}
               onClick={() => navigate(`/detail/artist/${encodeURIComponent(artist.name)}`)}>
            <div className="w-full aspect-square rounded-full mb-4 overflow-hidden border-4 transition-transform group-hover:scale-105"
                 style={{ borderColor: 'transparent' }}>
              <CoverImage 
                coverUrl={artist.cover} 
                audioPath={artist.songs[0]?.path}
                hq={true}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-center font-bold text-lg truncate w-full" style={{ color: colors.text }}>{artist.name}</h2>
            <p className="text-center text-sm opacity-70 truncate w-full" style={{ color: colors.subText }}>{artist.songs.length} pistas</p>
          </div>
        ))}
      </div>
    </div>
  );
}
