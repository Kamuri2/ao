import { useState, useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioContext';

interface LyricLine {
  time: number;
  text: string;
}

export default function LyricsView() {
  const { metadata, progress } = useAudio();
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [staticLyrics, setStaticLyrics] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!metadata.lyrics) {
      setLyrics([]);
      setStaticLyrics(null);
      setIsSynced(false);
      return;
    }

    const lrcRaw = metadata.lyrics;

    // 1. SYLT Object Support (from music-metadata)
    if (lrcRaw && typeof lrcRaw === 'object' && Array.isArray((lrcRaw as any).syncText)) {
      setIsSynced(true);
      const parsed = (lrcRaw as any).syncText.map((item: any) => ({
          time: item.timestamp / 1000, 
          text: item.text || ''
      })).filter((item: any) => item.text.trim() !== '');
      setLyrics(parsed);
      setStaticLyrics(null);
      return;
    }

    // 2. String Parsing Support (Aligning with Android Logic)
    const content = typeof lrcRaw === 'string' ? lrcRaw : ((lrcRaw as any)?.text || String(lrcRaw));
    const lines = content.split('\n');
    const parsed: LyricLine[] = [];
    const timeRegexGlobal = /\[(\d{1,}):(\d{2})(?:\.(\d{1,3}))?\]/g;
    
    let isLrc = false;

    lines.forEach(line => {
      let match;
      const text = line.replace(/\[.*?\]/g, '').trim();
      
      while ((match = timeRegexGlobal.exec(line)) !== null) {
        isLrc = true;
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        let milliseconds = 0;
        if (match[3]) {
          const msStr = match[3];
          milliseconds = msStr.length === 1 ? parseInt(msStr) * 100 : (msStr.length === 2 ? parseInt(msStr) * 10 : parseInt(msStr));
        }
        
        const time = minutes * 60 + seconds + milliseconds / 1000;
        
        if (text) {
          parsed.push({ time, text });
        }
      }
    });

    if (isLrc) {
      setIsSynced(true);
      setLyrics(parsed.sort((a, b) => a.time - b.time));
      setStaticLyrics(null);
    } else {
      setIsSynced(false);
      setLyrics([]);
      setStaticLyrics(content);
    }

  }, [metadata.lyrics]);

  // Find active line index
  let activeIndex = -1;
  if (isSynced && lyrics.length > 0) {
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].time <= progress + 0.1) {
        activeIndex = i;
      } else {
        break;
      }
    }
  }

  // Auto-scroll
  useEffect(() => {
    if (isSynced && activeLineRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeEl = activeLineRef.current;
      const scrollPos = activeEl.offsetTop - container.offsetHeight / 2 + activeEl.offsetHeight / 2;
      container.scrollTo({ top: scrollPos, behavior: 'smooth' });
    }
  }, [activeIndex, isSynced]);

  if (!metadata.lyrics) {
    return (
      <div className="flex-1 w-full flex items-center justify-center mb-8 px-4 h-full min-h-[300px]">
        <p className="text-white/40 text-2xl font-bold text-center tracking-widest uppercase">Letras no disponibles</p>
      </div>
    );
  }

  if (!isSynced && staticLyrics) {
    return (
      <div className="flex-1 w-full max-w-2xl mx-auto overflow-y-auto mb-8 px-4 scrollbar-hide py-8 space-y-4">
        <div className="text-white/80 text-xl whitespace-pre-wrap text-center font-bold">
          {staticLyrics}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 w-full max-w-2xl mx-auto overflow-y-auto mb-8 px-4 scrollbar-hide"
      style={{ 
        maxHeight: '70vh', 
        maskImage: isSynced ? 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)' : 'none', 
        WebkitMaskImage: isSynced ? 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)' : 'none' 
      }}
    >
      <div className="py-[30vh]">
        {lyrics.map((line, i) => {
          const isActive = i === activeIndex;
          const isPassed = i < activeIndex;
          
          return (
            <div 
              key={i}
              ref={isActive ? activeLineRef : null}
              className={`text-center transition-all duration-500 font-bold ${
                isActive 
                  ? 'text-white text-3xl md:text-4xl scale-105 py-4 drop-shadow-lg' 
                  : isPassed 
                    ? 'text-white/40 text-xl py-2' 
                    : 'text-white/20 text-xl py-2'
              }`}
              style={{
                 transformOrigin: 'center center'
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
