import { registerWebModule, NativeModule } from 'expo';

class ExpoMusicScannerModule extends NativeModule<{}> {}

export default registerWebModule(ExpoMusicScannerModule, 'ExpoMusicScannerModule');
