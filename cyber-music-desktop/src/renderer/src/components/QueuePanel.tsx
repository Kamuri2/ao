import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import { X, GripVertical } from 'lucide-react';
import CoverImage from './CoverImage';

interface QueuePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QueuePanel({ isOpen, onClose }: QueuePanelProps) {
  const { queue, queuePosition, currentSong, reorderQueue, playSound } = useAudio();
  const { colors } = useTheme();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Small timeout to allow the UI to update before the drag image is snapshot
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = '0.5';
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    if (draggedIndex !== targetIndex) {
      reorderQueue(draggedIndex, targetIndex);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    (e.target as HTMLElement).style.opacity = '1';
  };

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 z-50 bg-[#121212] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col animate-slide-up border-t border-white/10"
      style={{ height: '70vh' }}
    >
      <div className="flex flex-row items-center justify-between p-6 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white">Cola de Reproducción</h2>
          <p className="text-sm text-white/50">{queue.length} canciones</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {queue.map((song, index) => {
          const isPlaying = currentSong?.id === song.id;
          const isPast = index < queuePosition - 1;
          
          return (
            <div 
              key={song.id + '-' + index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex flex-row items-center p-3 rounded-xl mb-2 transition-colors cursor-pointer group
                ${isPlaying ? 'bg-white/10' : 'hover:bg-white/5'}
                ${isPast ? 'opacity-50' : 'opacity-100'}
                ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
              `}
              onClick={() => playSound(song, 'queue', queue)}
            >
              <div className="mr-3 cursor-grab text-white/30 hover:text-white/70 active:cursor-grabbing p-1" onClick={(e) => e.stopPropagation()}>
                <GripVertical size={20} />
              </div>
              
              <div className="w-10 h-10 rounded mr-4 flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                <CoverImage 
                  coverUrl={song.cover} 
                  audioPath={song.path}
                  hq={true}
                  className="w-full h-full object-cover"
                  placeholderClassName="w-full h-full bg-white/10"
                  iconSize={16}
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-1.5 h-3 bg-white mx-0.5 animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-4 bg-white mx-0.5 animate-pulse" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-2 bg-white mx-0.5 animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
              
              <div className="flex-1 overflow-hidden">
                <p className={`font-bold text-sm truncate ${isPlaying ? 'text-white' : 'text-white/90'}`} style={{ color: isPlaying ? colors.primary : undefined }}>
                  {song.title || song.filename.replace(/\.[^/.]+$/, "")}
                </p>
                <p className="text-xs text-white/50 truncate mt-0.5">{song.artist || 'Desconocido'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
