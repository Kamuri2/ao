/// <reference types="vite/client" />

interface Window {
  api: {
    openDirectory: () => Promise<string | null>;
    openImageFile: () => Promise<string | null>;
    readMusicFiles: (folderPath: string) => Promise<any[]>;
    getMetadata: (filePath: string) => Promise<any>;
    getCover: (filePath: string) => Promise<string | null>;
    getArtistImage: (artistName: string) => Promise<string | null>;
    getArtistCache: () => Promise<Record<string, string | null>>;
  };
}
