import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Disc3, Mic2, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors } = useTheme();

  // Ocultar en el reproductor
  if (location.pathname === '/player') return null;

  const NavItem = ({ to, icon: Icon, label }: any) => {
    const active = location.pathname === to;
    return (
      <button 
        onClick={() => navigate(to)}
        className={`flex flex-col md:flex-row items-center gap-1 md:gap-4 p-2 md:p-3 rounded-xl transition-all w-full md:justify-start ${
          active ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
        }`}
        style={{ color: active ? colors.primary : colors.text }}
      >
        <Icon size={24} />
        <span className="text-[10px] md:text-sm font-bold truncate">{label}</span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 md:relative md:w-64 md:h-screen flex md:flex-col items-center md:items-start justify-around md:justify-start p-2 md:p-6 z-40 border-t md:border-t-0 md:border-r border-white/10" 
         style={{ backgroundColor: colors.background }}>
      
      <div className="hidden md:block w-full mb-8 px-2">
        <h1 className="text-2xl font-black tracking-widest uppercase" style={{ color: colors.text }}>CyberMusic</h1>
      </div>

      <div className="flex flex-row md:flex-col w-full justify-around md:justify-start md:gap-2">
        <NavItem to="/" icon={Home} label="Inicio" />
        <NavItem to="/folders" icon={FolderOpen} label="Carpetas" />
        <NavItem to="/albums" icon={Disc3} label="Álbumes" />
        <NavItem to="/artists" icon={Mic2} label="Artistas" />
      </div>

      <div className="hidden md:flex flex-1 items-end w-full">
        <NavItem to="/settings" icon={Settings} label="Ajustes" />
      </div>
    </div>
  );
}
