import { useState, useEffect } from 'react';
import { Music } from 'lucide-react';

interface CoverImageProps {
  coverUrl?: string | null;
  className?: string;
  placeholderClassName?: string;
  iconSize?: number;
  audioPath?: string;
  hq?: boolean;
}

export default function CoverImage({ coverUrl, className = '', placeholderClassName = '', iconSize = 24, audioPath, hq = false }: CoverImageProps) {
  const [activeCover, setActiveCover] = useState(coverUrl);

  useEffect(() => {
    setActiveCover(coverUrl);
    let mounted = true;
    if (hq && audioPath) {
      const fetchHq = async () => {
        try {
          const cover = await window.api.getCover(audioPath);
          if (mounted && cover) setActiveCover(cover);
        } catch (e) {}
      };
      fetchHq();
    }
    return () => { mounted = false; };
  }, [coverUrl, audioPath, hq]);

  if (activeCover) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <img 
          src={activeCover} 
          alt="Cover"
          className="w-full h-full object-cover transition-opacity duration-200"
        />
      </div>
    );
  }

  return (
    <div className={`bg-white flex justify-center items-center border-2 border-black ${placeholderClassName} ${className}`}>
      <Music size={iconSize} color="#000000" />
    </div>
  );
}
