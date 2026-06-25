import React, { useState } from 'react';
// import removed
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, ListMusic, Mic2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import CoverImage from '../components/CoverImage';
import QueuePanel from '../components/QueuePanel';
import LyricsView from '../components/LyricsView';

export default function PlayerScreen() {
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
    toggleRepeatMode,
    setIsPlayerOpen,
    currentContextId,
    playlists,
    showLyrics,
    setShowLyrics
  } = useAudio();

  if (!currentSong) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl font-bold" style={{ color: colors.text }}>No hay canción reproduciéndose</p>
        <button 
          onClick={() => setIsPlayerOpen(false)}
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
    <div className="flex flex-col h-screen relative overflow-hidden bg-[#121212] select-none pb-8">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <CoverImage 
          coverUrl={currentSong?.cover} 
          audioPath={currentSong?.path}
          hq={true}
          className="w-full h-full object-cover opacity-60 blur-[100px] animate-gradient-move origin-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#121212]/70 to-[#121212] opacity-80" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-row items-center justify-between px-8 py-6">
        <button onClick={() => setIsPlayerOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
          <ArrowLeft size={28} />
        </button>
        <div className="text-center flex-1 pr-11">
          <p className="text-xs font-bold text-white/50 tracking-widest uppercase">
            Reproduciendo desde {(() => {
              if (!currentContextId || currentContextId === 'all') return 'tu música';
              if (currentContextId === 'queue') return 'la cola de reproducción';
              if (currentContextId === 'favorites') return 'tus favoritos';
              if (currentContextId.startsWith('album:')) return `el álbum • ${currentContextId.split('album:')[1]}`;
              if (currentContextId.startsWith('artist:')) return `el artista • ${currentContextId.split('artist:')[1]}`;
              if (currentContextId.startsWith('folder:')) return `la carpeta • ${currentContextId.split('folder:')[1]}`;
              if (currentContextId.startsWith('playlist:')) {
                const pId = currentContextId.split('playlist:')[1];
                const p = playlists.find(pl => pl.id === pId);
                return `la playlist • ${p ? p.name : 'Desconocida'}`;
              }
              return 'tu música';
            })()}
          </p>
        </div>
      </div>

      {/* Main Split Area (Flex-1) */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-row items-center justify-center px-8 w-full mx-auto gap-8 transition-all duration-500 ease-in-out max-w-[1400px]">
        
        {/* Cover Art Area */}
        <div 
          className={`flex flex-col items-center justify-center transition-all duration-500 ease-in-out h-full overflow-hidden ${
            showLyrics && isQueueOpen ? 'w-0 opacity-0 scale-90 hidden' : showLyrics || isQueueOpen ? 'w-1/2 opacity-100 scale-100 flex-shrink-0' : 'w-full opacity-100 scale-100'
          }`}
        >
          <div className="relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out group aspect-square max-h-full max-w-[600px] rounded-2xl flex-shrink shrink w-full h-auto min-w-[200px]" style={{ maxHeight: '100%' }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={currentSong?.id || 'empty'}
                initial={{ opacity: 0, x: 100, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 250, damping: 30 }}
                className="w-full h-full absolute inset-0"
              >
                <CoverImage 
                  coverUrl={currentSong?.cover} 
                  audioPath={currentSong?.path}
                  hq={true}
                  className="w-full h-full object-cover rounded-inherit aspect-square"
                  iconSize={64}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Lyrics Area */}
        <div 
          className={`flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ease-in-out h-full ${
            showLyrics ? 'flex-1 opacity-100 w-1/2 translate-x-0' : 'w-0 opacity-0 flex-none translate-x-4'
          }`}
        >
          <div className="w-full h-full min-w-[300px]">
            <LyricsView />
          </div>
        </div>

        {/* Queue Area */}
        <div 
          className={`flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ease-in-out h-full ${
            isQueueOpen ? 'flex-1 opacity-100 py-4 w-1/2 translate-x-0' : 'w-0 opacity-0 flex-none py-4 translate-x-4'
          }`}
        >
          <div className="w-full h-full min-w-[300px]">
            <QueuePanel isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
          </div>
        </div>
      </div>

      {/* Bottom Controls Area */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-8 mt-6 flex flex-col">
        {/* Track Info */}
        <div className="w-full flex flex-row items-center justify-between mb-6">
          <div className="flex flex-col flex-1 overflow-hidden pr-4">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={currentSong?.id || 'empty'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 250, damping: 30 }}
                className="w-full"
              >
                <h2 className="text-3xl font-black text-white truncate mb-1">
                  {currentSong.title || currentSong.filename.replace(/\.[^/.]+$/, "")}
                </h2>
                <p className="text-lg font-medium text-white/70 truncate">
                  {currentSong.artist || 'Desconocido'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex flex-row gap-2">
            <button 
              onClick={() => setShowLyrics(!showLyrics)}
              className={`p-3 rounded-full transition-colors ${showLyrics ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}
              title="Letras"
              style={{ color: showLyrics ? colors.primary : undefined }}
            >
              <Mic2 size={24} />
            </button>
            <button 
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`p-3 rounded-full transition-colors ${isQueueOpen ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}
              title="Cola de reproducción"
              style={{ color: isQueueOpen ? colors.primary : undefined }}
            >
              <ListMusic size={24} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full mb-6">
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
            <SkipBack size={36} fill="currentColor" />
          </button>

          <button 
            className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full transition-transform active:scale-95 hover:scale-105 bg-white text-black"
            onClick={pauseOrResumeSound}
          >
            {isPlaying ? (
              <Pause size={32} fill="currentColor" />
            ) : (
              <Play size={32} fill="currentColor" className="ml-2" />
            )}
          </button>

          <button 
            className="p-3 opacity-80 hover:opacity-100 transition-transform active:scale-95 text-white"
            onClick={playNext}
          >
            <SkipForward size={36} fill="currentColor" />
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

        {/* Audio Details */}
        {metadata.audioDetails && (
          <div className="mt-6 flex flex-row items-center justify-center gap-3 text-[10px] font-bold text-white/30 uppercase tracking-widest">
            {metadata.audioDetails.format && <span className="px-2 py-1 bg-white/5 rounded border border-white/5">{metadata.audioDetails.format}</span>}
            {metadata.audioDetails.bitrate && <span>{Math.round(metadata.audioDetails.bitrate / 1000)} kbps</span>}
            {metadata.audioDetails.sampleRate && <span>{metadata.audioDetails.sampleRate / 1000} kHz</span>}
          </div>
        )}
      </div>
    </div>
  );
}
