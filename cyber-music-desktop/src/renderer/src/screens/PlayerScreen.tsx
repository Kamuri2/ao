import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, ListMusic } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import CoverImage from '../components/CoverImage';
import QueuePanel from '../components/QueuePanel';
import LyricsView from '../components/LyricsView';

export default function PlayerScreen() {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const { 
    currentSong, 
    metadata, 
    isPlaying, 
    pauseOrResumeSound, 
    playNext, 
    playPrevious,
    progress,
    duration,
    seekTo,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeatMode
  } = useAudio();

  if (!currentSong) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl font-bold" style={{ color: colors.text }}>No hay canción reproduciéndose</p>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 rounded-full font-bold"
          style={{ backgroundColor: colors.primary, color: '#000' }}
        >
          Volver
        </button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(Number(e.target.value));
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-[#121212] animate-slide-up select-none">
      {/* Background Blur */}
      {metadata.cover && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30 blur-3xl scale-110"
          style={{ backgroundImage: `url(${metadata.cover})` }}
        />
      )}
      
      {/* Dimmer overlay to ensure text readability */}
      <div className="absolute inset-0 z-0 bg-black/40" />

      {/* Header */}
      <div className="relative z-10 flex flex-row items-center justify-between p-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={28} color="#ffffff" />
        </button>
        <span className="font-bold text-white tracking-widest uppercase text-xs opacity-70">Reproduciendo desde tu música</span>
        <div className="w-10"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 w-full max-w-2xl mx-auto h-full pb-10">
        
        {/* Cover Art - Spotify Style Large Square */}
        <div className="w-full max-w-[550px] aspect-square mb-10 shadow-2xl rounded-md overflow-hidden bg-black/20">
          <CoverImage 
            coverUrl={metadata.cover} 
            audioPath={currentSong.path}
            hq={true}
            className="w-full h-full object-cover" 
            placeholderClassName="w-full h-full bg-white/5" 
            iconSize={100}
          />
        </div>

        {/* Track Info */}
        <div className="w-full flex flex-row items-center justify-between mb-6">
          <div className="flex flex-col flex-1 overflow-hidden pr-4">
            <h2 className="text-3xl font-black text-white truncate mb-1">
              {currentSong.title || currentSong.filename.replace(/\.[^/.]+$/, "")}
            </h2>
            <p className="text-lg font-medium text-white/70 truncate">
              {currentSong.artist || 'Desconocido'}
            </p>
          </div>
          <button 
            onClick={() => setIsQueueOpen(true)}
            className="p-3 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            title="Cola de reproducción"
          >
            <ListMusic size={28} />
          </button>
        </div>

        {/* Lyrics */}
        <LyricsView />

        {/* Progress Bar */}
        <div className="w-full mb-6 mt-4">
          <div className="flex flex-row items-center gap-4 w-full group">
            <span className="text-xs font-medium text-white/70 w-10 text-right">{formatTime(progress)}</span>
            
            <div className="flex-1 relative flex items-center h-4 cursor-pointer">
              <input 
                type="range" 
                min={0} 
                max={duration || 100} 
                value={progress} 
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden absolute z-0 pointer-events-none">
                <div 
                  className="h-full transition-all duration-75 ease-linear group-hover:bg-green-500"
                  style={{ 
                    width: `${(progress / (duration || 1)) * 100}%`,
                    backgroundColor: colors.primary 
                  }}
                />
              </div>
              <div 
                className="w-3 h-3 bg-white rounded-full absolute z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none"
                style={{ left: `calc(${(progress / (duration || 1)) * 100}% - 6px)` }}
              />
            </div>
            
            <span className="text-xs font-medium text-white/70 w-10 text-left">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex flex-row items-center justify-center gap-6 md:gap-10 w-full">
          <button 
            className="p-2 transition-colors relative"
            onClick={toggleShuffle}
            style={{ color: isShuffle ? colors.primary : 'rgba(255,255,255,0.5)' }}
          >
            <Shuffle size={24} />
            {isShuffle && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: colors.primary }} />}
          </button>

          <button 
            className="p-3 opacity-80 hover:opacity-100 transition-transform active:scale-95 text-white"
            onClick={playPrevious}
          >
            <SkipBack size={40} fill="currentColor" />
          </button>

          <button 
            className="w-20 h-20 flex items-center justify-center rounded-full transition-transform active:scale-95 hover:scale-105 bg-white text-black"
            onClick={pauseOrResumeSound}
          >
            {isPlaying ? (
              <Pause size={36} fill="currentColor" />
            ) : (
              <Play size={36} fill="currentColor" className="ml-2" />
            )}
          </button>

          <button 
            className="p-3 opacity-80 hover:opacity-100 transition-transform active:scale-95 text-white"
            onClick={playNext}
          >
            <SkipForward size={40} fill="currentColor" />
          </button>

          <button 
            className="p-2 transition-colors relative"
            onClick={toggleRepeatMode}
            style={{ color: repeatMode !== 'off' ? colors.primary : 'rgba(255,255,255,0.5)' }}
          >
            <Repeat size={24} />
            {repeatMode === 'track' && (
              <div className="absolute -top-1 -right-1 text-[10px] font-bold" style={{ color: colors.primary }}>1</div>
            )}
            {repeatMode !== 'off' && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: colors.primary }} />}
          </button>
        </div>
      </div>

      <QueuePanel isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
    </div>
  );
}
