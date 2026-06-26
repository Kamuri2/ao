import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FolderOpen, Trash2, RefreshCw } from 'lucide-react';
import { useTheme, baseThemes, ParticleType } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { colors, isDarkMode, toggleTheme, themeFamily, setThemeFamily, particles, setParticles } = useTheme();
  const { loadSongsFromUri, songs, isScanning, isCrossfadeEnabled, setIsCrossfadeEnabled, crossfadeDuration, setCrossfadeDuration } = useAudio();
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
          <h2 className="text-xl font-bold mb-4" style={{ color: colors.text }}>Apariencia y Temas</h2>
          <div className="flex flex-row items-center justify-between mb-6">
            <span className="font-medium" style={{ color: colors.subText }}>Modo Oscuro</span>
            <button 
              className="px-4 py-2 rounded-lg font-bold transition-transform active:scale-95"
              style={{ backgroundColor: colors.primary, color: '#000' }}
              onClick={toggleTheme}
            >
              {isDarkMode ? 'Activo' : 'Inactivo'}
            </button>
          </div>

          <span className="font-medium mb-3 block" style={{ color: colors.subText }}>Tema Global</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
            {baseThemes.map(theme => (
              <button
                key={theme.id}
                onClick={() => setThemeFamily(theme.id)}
                className={`p-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center ${themeFamily === theme.id ? 'scale-105 shadow-md' : 'opacity-70 hover:opacity-100'}`}
                style={{ 
                  backgroundColor: themeFamily === theme.id ? colors.primary : 'transparent',
                  borderColor: themeFamily === theme.id ? colors.primary : colors.border,
                  color: themeFamily === theme.id ? '#000' : colors.text
                }}
              >
                {theme.name}
              </button>
            ))}
          </div>

          <span className="font-medium mb-3 block" style={{ color: colors.subText }}>Efectos de Partículas</span>
          <div className="flex flex-row gap-3 flex-wrap">
            {(['none', 'snow', 'bubbles', 'stars'] as ParticleType[]).map(pType => (
              <button
                key={pType}
                onClick={() => setParticles(pType)}
                className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all capitalize ${particles === pType ? 'scale-105 shadow-md' : 'opacity-70 hover:opacity-100'}`}
                style={{ 
                  backgroundColor: particles === pType ? colors.primary : 'transparent',
                  borderColor: particles === pType ? colors.primary : colors.border,
                  color: particles === pType ? '#000' : colors.text
                }}
              >
                {pType === 'none' ? 'Ninguno' : pType === 'snow' ? 'Nieve' : pType === 'bubbles' ? 'Burbujas' : 'Estrellas'}
              </button>
            ))}
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

          <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-row gap-4">
              <button 
                className="flex-1 flex flex-row items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100"
                style={{ backgroundColor: colors.primary, color: '#000' }}
                onClick={() => loadSongsFromUri()}
                disabled={isScanning}
              >
                <FolderOpen size={20} />
                Seleccionar Carpeta
              </button>

              {currentFolder && (
                <button 
                  className="flex-1 flex flex-row items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100"
                  style={{ backgroundColor: colors.primary, color: '#000' }}
                  onClick={() => loadSongsFromUri(currentFolder, false)}
                  disabled={isScanning}
                >
                  <RefreshCw size={20} className={isScanning ? 'animate-spin' : ''} />
                  {isScanning ? 'Escaneando...' : 'Escanear (Reparar)'}
                </button>
              )}
            </div>

            {currentFolder && (
              <button 
                className="flex flex-row items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-transform active:scale-95 bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:opacity-50 disabled:scale-100 w-full md:w-auto"
                onClick={handleClearFolder}
                disabled={isScanning}
              >
                <Trash2 size={20} />
                Limpiar Memoria
              </button>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 shadow-sm" style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: colors.text }}>Reproducción</h2>
          
          <div className="flex flex-row items-center justify-between">
            <div>
              <span className="font-medium block" style={{ color: colors.text }}>Crossfade (Transición Suave)</span>
              <span className="text-sm opacity-70" style={{ color: colors.subText }}>Desvanece la pista actual y comienza la siguiente sin cortes.</span>
            </div>
            
            <button 
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isCrossfadeEnabled ? 'bg-green-500' : 'bg-gray-400'}`}
              style={{ backgroundColor: isCrossfadeEnabled ? colors.primary : undefined }}
              onClick={() => setIsCrossfadeEnabled(!isCrossfadeEnabled)}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isCrossfadeEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {isCrossfadeEnabled && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex flex-row items-center justify-between mb-2">
                <span className="font-medium" style={{ color: colors.text }}>Duración del Crossfade</span>
                <span className="font-bold" style={{ color: colors.primary }}>{crossfadeDuration} s</span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="10" 
                step="0.1"
                value={crossfadeDuration}
                onChange={(e) => setCrossfadeDuration(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-white/10"
                style={{ accentColor: colors.primary }}
              />
              <div className="flex flex-row justify-between mt-1">
                <span className="text-xs opacity-50" style={{ color: colors.subText }}>0.1s</span>
                <span className="text-xs opacity-50" style={{ color: colors.subText }}>10s</span>
              </div>
            </div>
          )}
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
