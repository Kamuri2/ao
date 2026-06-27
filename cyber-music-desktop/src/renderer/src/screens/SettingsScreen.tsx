import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FolderOpen, Trash2, RefreshCw } from 'lucide-react';
import { useTheme, baseThemes, ParticleType } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';
import { Image as ImageIcon } from 'lucide-react';

const popularFonts = [
  "Inter", "Roboto", "Outfit", "Space Grotesk", "Syne", 
  "Montserrat", "Poppins", "Oswald", "Raleway", "Nunito", 
  "Playfair Display", "Cinzel", "Cormorant Garamond", "Josefin Sans", 
  "Caveat", "Pacifico", "Dancing Script", "VT323", "Press Start 2P"
];

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { colors, isDarkMode, toggleTheme, themeFamily, setThemeFamily, particles, setParticles, customFont, setCustomFont, mascots, addMascot, removeMascot, lyricsFontSize, setLyricsFontSize } = useTheme();
  const { loadSongsFromUri, songs, isScanning, isCrossfadeEnabled, setIsCrossfadeEnabled, crossfadeDuration, setCrossfadeDuration } = useAudio();
  const currentFolder = localStorage.getItem('@music_folder');

  const [draftFont, setDraftFont] = useState(customFont);

  useEffect(() => {
    setDraftFont(customFont);
  }, [customFont]);

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

          <span className="font-medium mb-3 block mt-6" style={{ color: colors.subText }}>Tipografía (Google Fonts)</span>
          <div className="flex flex-col gap-3">
            <div className="flex flex-row gap-3">
              <select 
                value={popularFonts.includes(draftFont) ? draftFont : (draftFont === '' ? '' : 'custom')}
                onChange={(e) => {
                  if (e.target.value !== 'custom') {
                    setDraftFont(e.target.value);
                  }
                }}
                className="flex-1 px-4 py-3 rounded-lg border bg-transparent font-bold appearance-none cursor-pointer outline-none"
                style={{ borderColor: colors.border, color: colors.text }}
              >
                <option value="" style={{ color: '#000' }}>Fuente del Sistema (Predeterminada)</option>
                {popularFonts.map(font => (
                  <option key={font} value={font} style={{ color: '#000', fontFamily: `"${font}", sans-serif` }}>{font}</option>
                ))}
                {!popularFonts.includes(draftFont) && draftFont !== '' && (
                  <option value="custom" style={{ color: '#000' }}>Personalizada ({draftFont})</option>
                )}
              </select>
              <button
                onClick={() => setCustomFont('')}
                className="px-4 py-3 rounded-lg border font-bold transition-transform active:scale-95 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                style={{ borderColor: colors.border }}
              >
                Restablecer
              </button>
            </div>
            
            <div className="flex flex-row gap-3">
              <input 
                type="text" 
                placeholder="O escribe otra (ej. Roboto Mono)..." 
                value={draftFont}
                onChange={(e) => setDraftFont(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border bg-transparent font-bold outline-none focus:border-white/30"
                style={{ borderColor: colors.border, color: colors.text }}
              />
              <button
                onClick={() => setCustomFont(draftFont)}
                className="px-6 py-3 rounded-lg font-bold transition-transform active:scale-95"
                style={{ backgroundColor: colors.primary, color: '#000' }}
              >
                Aplicar
              </button>
            </div>
          </div>
          <p className="text-xs opacity-70 mt-2" style={{ color: colors.subText }}>Elige una fuente rápida o escribe su nombre y pulsa Aplicar para descargarla.</p>
          
          <span className="font-medium mb-3 block mt-8" style={{ color: colors.subText }}>Tamaño de Letras de Canciones</span>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between">
              <span className="text-sm opacity-70" style={{ color: colors.subText }}>Más pequeño</span>
              <span className="font-bold" style={{ color: colors.text }}>{lyricsFontSize}%</span>
              <span className="text-sm opacity-70" style={{ color: colors.subText }}>Más grande</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="150" 
              step="5" 
              value={lyricsFontSize}
              onChange={(e) => setLyricsFontSize(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-white/10 mt-1"
              style={{ accentColor: colors.primary }}
            />
            <p className="text-xs opacity-70 mt-1" style={{ color: colors.subText }}>Ajusta el tamaño para que las letras largas quepan en una sola línea sin saltos.</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 shadow-sm" style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: colors.text }}>Mascota Virtual</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between">
              <div>
                <span className="font-medium block" style={{ color: colors.text }}>Mascotas Flotantes (Max 3)</span>
                <span className="text-sm opacity-70" style={{ color: colors.subText }}>Sube GIFs o PNGs con fondo transparente.</span>
              </div>
              <button
                className="flex items-center gap-2 px-4 py-3 rounded-lg font-bold transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100"
                style={{ backgroundColor: colors.primary, color: '#000' }}
                disabled={mascots.length >= 3}
                onClick={async () => {
                  try {
                    const url = await window.api.openImageFile();
                    if (url) addMascot(url);
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                <ImageIcon size={20} />
                Importar
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              {mascots.map((m, index) => (
                <div key={m.id} className="flex flex-row justify-between items-center bg-black/5 dark:bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <img src={m.url} className="w-12 h-12 object-contain" alt="Mascot" />
                    <span className="font-bold text-sm" style={{ color: colors.text }}>Mascota {index + 1}</span>
                  </div>
                  <button
                    onClick={() => removeMascot(m.id)}
                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
              {mascots.length === 0 && (
                <p className="text-sm text-center py-4 opacity-50" style={{ color: colors.text }}>No hay mascotas importadas.</p>
              )}
            </div>
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
                Eliminar Carpeta
              </button>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 shadow-sm" style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: colors.text }}>Reproducción</h2>

          <div className="flex flex-row items-center justify-between">
            <div>
              <span className="font-medium block" style={{ color: colors.text }}>Crossfade</span>
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
            CybeCat Desktop v1.0.0<br />
            Canciones Leídas: {songs.length}
          </p>
        </div>
      </div>
    </div>
  );
}
