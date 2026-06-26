import { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { useNavigate } from 'react-router-dom';
import { Music2, Play, MoreVertical, Trash2 } from 'lucide-react'; // eslint-disable-line no-unused-vars
import PlaylistCreateModal from '../components/PlaylistCreateModal';

export default function PlaylistsScreen(): React.JSX.Element {
  const { playlists, deletePlaylist, currentContextId } = useAudio();
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleDelete = (e: React.MouseEvent, id: string): void => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar esta lista?')) {
      deletePlaylist(id);
      setContextMenuId(null);
    }
  };

  return (
    <div className="p-8 pb-32 min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Playlists</h1>
          <p className="text-gray-400">{playlists.length} lista{playlists.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-bold transition-all"
        >
          + Nueva Lista
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {playlists.map((playlist) => {
          const isPlayingContext = currentContextId === `playlist-${playlist.id}`;

          return (
            <div
              key={playlist.id}
              className="group relative flex flex-col cursor-pointer bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300"
              onMouseEnter={() => setHoveredId(playlist.id)}
              onMouseLeave={() => {
                setHoveredId(null);
                setContextMenuId(null);
              }}
              onClick={() => navigate(`/detail/playlist/${playlist.id}`)}
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-white/5 shadow-lg group-hover:shadow-2xl transition-all duration-300">
                {playlist.cover ? (
                  <img src={playlist.cover} alt={playlist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-blue-900/40 group-hover:scale-105 transition-transform duration-500">
                    <Music2 size={64} className="text-white/30" />
                  </div>
                )}

                {/* Play Button Overlay */}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${hoveredId === playlist.id || isPlayingContext ? 'opacity-100' : 'opacity-0'}`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/detail/playlist/${playlist.id}`);
                    }}
                    className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 hover:bg-white text-white hover:text-black transition-all transform translate-y-2 group-hover:translate-y-0"
                  >
                    <Play fill="currentColor" size={24} className="ml-1" />
                  </button>
                </div>

                {/* Context Menu Button */}
                {!playlist.isAuto && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenuId(contextMenuId === playlist.id ? null : playlist.id);
                    }}
                    className={`absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white backdrop-blur-md transition-opacity duration-300 ${hoveredId === playlist.id ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <MoreVertical size={16} />
                  </button>
                )}

                {/* Context Menu Dropdown */}
                {contextMenuId === playlist.id && (
                  <div className="absolute top-10 right-2 w-48 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                    <button
                      onClick={(e) => handleDelete(e, playlist.id)}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 text-red-400 flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Eliminar lista
                    </button>
                  </div>
                )}
              </div>

              <h3 className="font-bold text-lg truncate text-white/90 group-hover:text-white transition-colors">{playlist.name}</h3>
              <p className="text-sm text-gray-400 truncate mt-1">
                {playlist.description || 'Lista de reproducción'}
              </p>
            </div>
          );
        })}
      </div>

      <PlaylistCreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
}
