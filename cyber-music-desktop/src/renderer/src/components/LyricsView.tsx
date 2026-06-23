import { useState, useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioContext';

interface LyricLine {
  time: number;
  text: string;
}

export default function LyricsView() {
  const { metadata, progress } = useAudio();
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!metadata.lyrics) {
      setLyrics([]);
      return;
    }

    const parseLrc = (lrcRaw: any) => {
      const content = typeof lrcRaw === 'string' ? lrcRaw : (lrcRaw?.text || lrcRaw?.syncText || String(lrcRaw));
      const lines = content.split('\n');
      const parsed: LyricLine[] = [];
      const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
      
      for (const line of lines) {
        const match = timeRegex.exec(line);
        if (match) {
          const m = parseInt(match[1]);
          const s = parseInt(match[2]);
          const ms = match[3].length === 2 ? parseInt(match[3]) * 10 : parseInt(match[3]);
          const text = line.replace(timeRegex, '').trim();
          if (text) {
            parsed.push({ time: m * 60 + s + ms / 1000, text });
          }
        }
      }
      return parsed;
    };

    setLyrics(parseLrc(metadata.lyrics));
  }, [metadata.lyrics]);

  // Find active line index
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (progress >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Auto-scroll
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeEl = activeLineRef.current;
      const scrollPos = activeEl.offsetTop - container.offsetHeight / 2 + activeEl.offsetHeight / 2;
      container.scrollTo({ top: scrollPos, behavior: 'smooth' });
    }
  }, [activeIndex]);

  if (!metadata.lyrics || lyrics.length === 0) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 w-full max-w-md mx-auto overflow-y-auto mb-8 px-4 scrollbar-hide"
      style={{ maxHeight: '30vh', maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)' }}
    >
      <div className="py-[15vh]">
        {lyrics.map((line, i) => {
          const isActive = i === activeIndex;
          const isPassed = i < activeIndex;
          
          return (
            <div 
              key={i}
              ref={isActive ? activeLineRef : null}
              className={`text-center py-2 transition-all duration-300 font-bold ${
                isActive 
                  ? 'text-white text-xl scale-110' 
                  : isPassed 
                    ? 'text-white/40 text-lg' 
                    : 'text-white/20 text-lg'
              }`}
            >
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
