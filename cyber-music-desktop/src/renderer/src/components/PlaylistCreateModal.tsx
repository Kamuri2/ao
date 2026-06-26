import { useState } from 'react';
import { X, Camera } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

interface PlaylistCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlaylistCreateModal({ isOpen, onClose }: PlaylistCreateModalProps) {
  const { createPlaylist } = useAudio();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverUri, setCoverUri] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectCover = async () => {
    try {
      const url = await window.api.openImageFile();
      if (url) {
        setCoverUri(url);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = () => {
    if (name.trim()) {
      createPlaylist(name.trim(), description.trim() || undefined, coverUri || undefined);
      setName('');
      setDescription('');
      setCoverUri(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="bg-[#1e1e1e] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/70 hover:text-white transition-all"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-white">Crear Lista</h2>

        <div className="flex flex-col gap-4">
          <div className="flex justify-center mb-2">
            <button 
              onClick={handleSelectCover}
              className="relative group w-32 h-32 rounded-xl bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center overflow-hidden hover:border-white/50 transition-all"
            >
              {coverUri ? (
                <>
                  <img src={coverUri} alt="Cover preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={24} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="text-center text-white/50 group-hover:text-white transition-colors">
                  <Camera size={28} className="mx-auto mb-2" />
                  <span className="text-xs font-bold">Subir foto</span>
                </div>
              )}
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Nombre</label>
            <input 
              type="text" 
              placeholder=""
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Descripción (Opcional)</label>
            <textarea 
              placeholder=""
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none h-24"
            />
          </div>

          <button 
            onClick={handleCreate}
            disabled={!name.trim()}
            className="mt-4 w-full bg-purple-600 hover:bg-purple-500 disabled:bg-white/10 disabled:text-white/30 text-white font-bold py-3 rounded-xl transition-all"
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}
