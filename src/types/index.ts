export interface Song {
  id: string;
  uri: string;
  filename: string;
  folder: string;
  duration: number;
  // Extra metadata populated later
  album?: string;
  artist?: string;
  cover?: string | null;
  lyrics?: string;
}

export interface Metadata {
  title: string | null;
  artist: string | null;
  album: string | null;
  cover: string | null;
  lyrics: string | null;
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
}

export interface Album {
  name: string;
  artist: string;
  cover: string | null;
  songs: Song[];
}

export interface Folder {
  name: string;
  cover: string | null;
  songs: Song[];
}

export interface AudioContextType {
  songs: Song[];
  setSongs: (songs: Song[]) => void;
  albums: Record<string, Album>;
  folders: Record<string, Folder>;
  playlists: Playlist[];
  createPlaylist: (name: string) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
  currentSong: Song | null;
  isPlaying: boolean;
  metadata: { cover: string | null; lyrics: string | null };
  position: number;
  duration: number;
  playSound: (song: Song) => Promise<void>;
  pauseOrResumeSound: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  seekTo: (millis: number) => Promise<void>;
  metadataCache: Record<string, { coverUri: string | null; lyrics: string | null }>;
  extractMetadataOnDemand: (uri: string) => Promise<{ cover: string | null; lyrics: string | null }>;
  loadSongsFromUri: (uri: string) => Promise<void>;
}
