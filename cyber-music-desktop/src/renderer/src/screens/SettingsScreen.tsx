import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FolderOpen, Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { loadSongsFromUri, songs } = useAudio();
  const currentFolder = localStorage.getItem('@music_folder');

  const handleClearFolder = () => {
    localStorage.removeItem('@music_folder');
    window.location.reload();
  };

  return (
    <div className="flex-1 min-h-screen px-6 py-8 max-w-4xl mx-auto w-full">
      <div className="flex flex-row items-center mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-black/10 transition-colors mr-4"
        >
          <ArrowLeft size={28} color={colors.text} />
        </button>
        <h1 className="text-3xl font-black" style={{ color: colors.text }}>
          Configuración
        </h1>
      </div>

      <div className="space-y-6">
        <div className="p-6 rounded-2xl border border-white/10 shadow-sm" style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: colors.text }}>Apariencia</h2>
          <div className="flex flex-row items-center justify-between">
            <span className="font-medium" style={{ color: colors.subText }}>Modo Oscuro</span>
            <button 
              className="px-4 py-2 rounded-lg font-bold transition-transform active:scale-95"
              style={{ backgroundColor: colors.primary, color: '#000' }}
              onClick={toggleTheme}
            >
              Cambiar Tema
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 shadow-sm" style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: colors.text }}>Librería de Música</h2>
          
          {currentFolder ? (
            <div className="mb-4 p-3 rounded-lg bg-black/5 dark:bg-white/5 break-all">
              <span className="text-sm font-bold opacity-70 block mb-1">Carpeta actual:</span>
              <span className="text-sm font-medium" style={{ color: colors.text }}>{currentFolder}</span>
            </div>
          ) : (
            <p className="text-sm mb-4" style={{ color: colors.subText }}>
              No has seleccionado una carpeta. Selecciona una para cargar tu música.
            </p>
          )}

          <div className="flex flex-row gap-4 mt-4">
            <button 
              className="flex-1 flex flex-row items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-transform active:scale-95"
              style={{ backgroundColor: colors.primary, color: '#000' }}
              onClick={() => loadSongsFromUri()}
            >
              <FolderOpen size={20} />
              Seleccionar Carpeta
            </button>

            {currentFolder && (
              <button 
                className="flex flex-row items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-transform active:scale-95 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                onClick={handleClearFolder}
              >
                <Trash2 size={20} />
                Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 shadow-sm" style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: colors.text }}>Acerca de</h2>
          <p className="text-sm" style={{ color: colors.subText }}>
            CyberMusic Desktop v1.0.0<br/>
            Canciones en memoria: {songs.length}
          </p>
        </div>
      </div>
    </div>
  );
}
