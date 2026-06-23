import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AudioProvider } from './context/AudioContext';
import { ThemeProvider } from './context/ThemeContext';
import HomeScreen from './screens/HomeScreen';
import MiniPlayer from './components/MiniPlayer';
import Sidebar from './components/Sidebar';

import PlayerScreen from './screens/PlayerScreen';
import SettingsScreen from './screens/SettingsScreen';
import AlbumsScreen from './screens/AlbumsScreen';
import ArtistsScreen from './screens/ArtistsScreen';
import FoldersScreen from './screens/FoldersScreen';
import ListDetailScreen from './screens/ListDetailScreen';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-transparent">
      <Sidebar />
      <div id="main-scroll-container" className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/player" element={<PlayerScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/albums" element={<AlbumsScreen />} />
          <Route path="/artists" element={<ArtistsScreen />} />
          <Route path="/folders" element={<FoldersScreen />} />
          <Route path="/detail/:type/:id" element={<ListDetailScreen />} />
        </Routes>
      </div>
      <MiniPlayer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AudioProvider>
          <Router>
            <AppContent />
          </Router>
        </AudioProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
