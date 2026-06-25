import { NativeModule, requireNativeModule } from 'expo';

type SongData = {
  id: string;
  uri: string;
  filename: string;
  folder: string;
  duration: number;
  title: string;
  artist: string;
  album: string;
  cover: string;
};

declare class ExpoMusicScannerModule extends NativeModule<{}> {
  getAudioFiles(folderPath?: string | null): Promise<SongData[]>;
  getSongDetails(uri: string): Promise<{ lyrics?: string; bitrate?: number; sampleRate?: number; format?: string }>;
  getHighQualityCover(uri: string): Promise<string | null>;
  getLyrics(uri: string): Promise<string | null>;
  initAudioEngine(): Promise<boolean>;
  getEqualizerBands(): Promise<{ index: number; frequency: number; minLevel: number; maxLevel: number }[]>;
  setEqualizerBandLevel(bandIndex: number, level: number): Promise<boolean>;
  setBassBoost(strength: number): Promise<boolean>;
}

export default requireNativeModule<ExpoMusicScannerModule>('ExpoMusicScanner');
