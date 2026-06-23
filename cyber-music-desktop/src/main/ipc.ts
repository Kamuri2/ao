import { ipcMain, dialog } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import * as mm from 'music-metadata';

class LRUCache<K, V> {
  private max: number;
  private cache: Map<K, V>;
  constructor(max = 500) {
    this.max = max;
    this.cache = new Map();
  }
  get(key: K) {
    if (!this.cache.has(key)) return undefined;
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }
  set(key: K, val: V) {
    if (this.cache.has(key)) this.cache.delete(key);
    else if (this.cache.size >= this.max) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.set(key, val);
  }
}

const coverCache = new LRUCache<string, string | null>(500);

export function setupIpc() {
  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    if (canceled) {
      return null;
    } else {
      return filePaths[0];
    }
  });

  ipcMain.handle('fs:readMusicFiles', async (_, folderPath: string) => {
    if (!folderPath) return [];
    try {
      const files = await getAudioFilesRecursive(folderPath);
      return files;
    } catch (err) {
      console.error('Error reading music files:', err);
      return [];
    }
  });

  ipcMain.handle('fs:getCover', async (_, filePath: string) => {
    const cached = coverCache.get(filePath);
    if (cached !== undefined) return cached;
    
    try {
      const metadata = await mm.parseFile(filePath, { duration: false, skipPostHeaders: true });
      let coverBase64: string | null = null;
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0];
        coverBase64 = `data:${picture.format};base64,${Buffer.from(picture.data).toString('base64')}`;
      }
      coverCache.set(filePath, coverBase64);
      return coverBase64;
    } catch (e) {
      coverCache.set(filePath, null);
      return null;
    }
  });

  ipcMain.handle('fs:getMetadata', async (_, filePath: string) => {
    try {
      const metadata = await mm.parseFile(filePath, { duration: true });
      let coverBase64: string | null = null;
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0];
        coverBase64 = `data:${picture.format};base64,${Buffer.from(picture.data).toString('base64')}`;
      }
      coverCache.set(filePath, coverBase64);
      
      let lyrics: any = metadata.common.lyrics?.length ? metadata.common.lyrics[0] : null;
      
      try {
        const dir = path.dirname(filePath);
        const base = path.basename(filePath, path.extname(filePath));
        const extensions = ['.lrc', '.txt', '.srt', '.vtt'];
        for (const ext of extensions) {
            const extPath = path.join(dir, base + ext);
            try {
                const stat = await fs.stat(extPath);
                if (stat.isFile()) {
                    lyrics = await fs.readFile(extPath, 'utf8');
                    break;
                }
            } catch(e) {}
        }
      } catch(e) {}
      
      return {
        title: metadata.common.title || path.basename(filePath, path.extname(filePath)),
        artist: metadata.common.artist || 'Desconocido',
        album: metadata.common.album || 'Desconocido',
        duration: metadata.format.duration || 0,
        cover: coverBase64,
        lyrics: lyrics,
        format: metadata.format.container,
        bitrate: metadata.format.bitrate,
        sampleRate: metadata.format.sampleRate
      };
    } catch (e) {
      console.error('Error reading metadata for', filePath, e);
      return {
        title: path.basename(filePath, path.extname(filePath)),
        artist: 'Desconocido',
        album: 'Desconocido',
        duration: 0,
        cover: null,
      };
    }
  });
}

async function getAudioFilesRecursive(dir: string): Promise<any[]> {
  let results: any[] = [];
  try {
    const list = await fs.readdir(dir, { withFileTypes: true });
    for (const dirent of list) {
      const fullPath = path.join(dir, dirent.name);
      if (dirent.isDirectory()) {
        const subFiles = await getAudioFilesRecursive(fullPath);
        results = results.concat(subFiles);
      } else {
        const ext = path.extname(fullPath).toLowerCase();
        if (['.mp3', '.m4a', '.wav', '.flac', '.aac', '.ogg', '.wma', '.opus', '.m4b', '.alac', '.aiff', '.ape'].includes(ext)) {
          let title = dirent.name;
          let artist = 'Desconocido';
          let album = 'Desconocido';
          let trackNumber = 0;
          try {
            const meta = await mm.parseFile(fullPath, { skipCovers: true, duration: false });
            if (meta.common.title) title = meta.common.title;
            if (meta.common.artist) artist = meta.common.artist;
            if (meta.common.album) album = meta.common.album;
            if (meta.common.track.no) trackNumber = meta.common.track.no;
          } catch(e) {}
          
          results.push({
            id: fullPath,
            uri: 'file:///' + encodeURI(fullPath.replace(/\\/g, '/')).replace(/#/g, '%23').replace(/\?/g, '%3F'),
            filename: dirent.name,
            title,
            artist,
            album,
            trackNumber,
            folder: path.basename(dir),
            path: fullPath
          });
        }
      }
    }
  } catch (e) {
    console.error('Error traversing directory', dir, e);
  }
  return results;
}
