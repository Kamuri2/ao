import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animated, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

export type ThemeColors = {
  background: string;
  card: string;
  text: string;
  subText: string;
  primary: string;
  border: string;
  secondary: string;
  accent: string;
  shadow: string;
};

export type ThemeDefinition = {
  id: string;
  name: string;
  isDark: boolean;
  colors: ThemeColors;
};

export const baseThemes = [
  { id: 'mint', name: 'Mint' },
  { id: 'cyberpunk', name: 'Cyberpunk' },
  { id: 'ocean', name: 'Ocean' },
  { id: 'sunset', name: 'Sunset' },
  { id: 'lavender', name: 'Lavender' },
  { id: 'frutigerAero', name: 'Frutiger Aero (Glass)' },
  { id: 'dracula', name: 'Dracula' },
  { id: 'nord', name: 'Nordic Ice' },
  { id: 'matcha', name: 'Matcha Tea' },
  { id: 'synthwave', name: 'Synthwave' },
  { id: 'midnight', name: 'Midnight (OLED)' },
  { id: 'ruby', name: 'Crimson Ruby' },
];

export const themes: Record<string, ThemeDefinition> = {
  mintLight: {
    id: 'mintLight', name: 'Mint Claro', isDark: false,
    colors: { background: '#f2f7f4', card: '#ffffff', text: '#000000', subText: '#555555', border: '#e0e0e0', primary: '#2ab78e', secondary: '#9c66e4', accent: '#ff007f', shadow: '#000000' }
  },
  mintDark: {
    id: 'mintDark', name: 'Mint Oscuro', isDark: true,
    colors: { background: '#121212', card: '#1e1e1e', text: '#ffffff', subText: '#a0a0a0', border: '#2c2c2c', primary: '#30c296', secondary: '#b388eb', accent: '#ff007f', shadow: '#000000' }
  },
  cyberpunkLight: {
    id: 'cyberpunkLight', name: 'Cyberpunk Claro', isDark: false,
    colors: { background: '#f0e6f5', card: '#ffffff', text: '#d80073', subText: '#00a8cc', border: '#e6e6e6', primary: '#ff007f', secondary: '#00e5ff', accent: '#ffe600', shadow: '#ff007f' }
  },
  cyberpunkDark: {
    id: 'cyberpunkDark', name: 'Cyberpunk Oscuro', isDark: true,
    colors: { background: '#090117', card: '#150926', text: '#00ffcc', subText: '#ff007f', border: '#2b0052', primary: '#ff007f', secondary: '#00e5ff', accent: '#ffe600', shadow: '#ff007f' }
  },
  oceanLight: {
    id: 'oceanLight', name: 'Ocean Claro', isDark: false,
    colors: { background: '#e0f7fa', card: '#ffffff', text: '#004d40', subText: '#00796b', border: '#b2dfdb', primary: '#00acc1', secondary: '#4dd0e1', accent: '#00838f', shadow: '#000000' }
  },
  oceanDark: {
    id: 'oceanDark', name: 'Ocean Oscuro', isDark: true,
    colors: { background: '#05101f', card: '#0d1e36', text: '#e0f2fe', subText: '#7dd3fc', border: '#1e3a8a', primary: '#0ea5e9', secondary: '#38bdf8', accent: '#0284c7', shadow: '#000000' }
  },
  sunsetLight: {
    id: 'sunsetLight', name: 'Sunset Claro', isDark: false,
    colors: { background: '#fff3e0', card: '#ffffff', text: '#3e2723', subText: '#6d4c41', border: '#ffe0b2', primary: '#f57c00', secondary: '#ff7043', accent: '#e64a19', shadow: '#000000' }
  },
  sunsetDark: {
    id: 'sunsetDark', name: 'Sunset Oscuro', isDark: true,
    colors: { background: '#1c0c09', card: '#311611', text: '#ffedd5', subText: '#fdba74', border: '#5b2116', primary: '#ea580c', secondary: '#f97316', accent: '#c2410c', shadow: '#000000' }
  },
  lavenderLight: {
    id: 'lavenderLight', name: 'Lavanda Claro', isDark: false,
    colors: { background: '#f5f0fa', card: '#ffffff', text: '#3b2a4f', subText: '#6b5884', border: '#e6d9f2', primary: '#8b5fd6', secondary: '#b890eb', accent: '#ff7597', shadow: '#000000' }
  },
  lavenderDark: {
    id: 'lavenderDark', name: 'Lavanda Oscuro', isDark: true,
    colors: { background: '#130e1a', card: '#1f1629', text: '#f3e8ff', subText: '#c4b5fd', border: '#3b2f4f', primary: '#a855f7', secondary: '#c084fc', accent: '#f472b6', shadow: '#000000' }
  },
  frutigerAeroLight: {
    id: 'frutigerAeroLight', name: 'Frutiger Aero Claro', isDark: false,
    colors: { background: '#e0f7fa', card: 'rgba(255, 255, 255, 0.7)', text: '#004d40', subText: '#00796b', border: 'rgba(255, 255, 255, 0.8)', primary: '#00e5ff', secondary: '#69f0ae', accent: '#b2ebf2', shadow: '#000000' }
  },
  frutigerAeroDark: {
    id: 'frutigerAeroDark', name: 'Frutiger Aero Oscuro', isDark: true,
    colors: { background: '#001a1c', card: 'rgba(0, 30, 40, 0.6)', text: '#e0f7fa', subText: '#80cbc4', border: 'rgba(0, 229, 255, 0.3)', primary: '#00e5ff', secondary: '#00bfa5', accent: '#18ffff', shadow: '#000000' }
  },
  draculaLight: {
    id: 'draculaLight', name: 'Dracula Claro', isDark: false,
    colors: { background: '#f8f8f2', card: '#ffffff', text: '#282a36', subText: '#6272a4', border: '#e2e2dc', primary: '#ff79c6', secondary: '#bd93f9', accent: '#ffb86c', shadow: '#000000' }
  },
  draculaDark: {
    id: 'draculaDark', name: 'Dracula Oscuro', isDark: true,
    colors: { background: '#282a36', card: '#44475a', text: '#f8f8f2', subText: '#6272a4', border: '#3e4053', primary: '#ff79c6', secondary: '#bd93f9', accent: '#50fa7b', shadow: '#000000' }
  },
  nordLight: {
    id: 'nordLight', name: 'Nord Claro', isDark: false,
    colors: { background: '#eceff4', card: '#ffffff', text: '#2e3440', subText: '#4c566a', border: '#e5e9f0', primary: '#5e81ac', secondary: '#81a1c1', accent: '#88c0d0', shadow: '#000000' }
  },
  nordDark: {
    id: 'nordDark', name: 'Nord Oscuro', isDark: true,
    colors: { background: '#2e3440', card: '#3b4252', text: '#eceff4', subText: '#d8dee9', border: '#434c5e', primary: '#88c0d0', secondary: '#81a1c1', accent: '#a3be8c', shadow: '#000000' }
  },
  matchaLight: {
    id: 'matchaLight', name: 'Matcha Claro', isDark: false,
    colors: { background: '#f4f6f0', card: '#ffffff', text: '#3e4e3b', subText: '#7b8c76', border: '#e3e8de', primary: '#8da37b', secondary: '#a6b896', accent: '#c4d4b4', shadow: '#000000' }
  },
  matchaDark: {
    id: 'matchaDark', name: 'Matcha Oscuro', isDark: true,
    colors: { background: '#1c221a', card: '#252e23', text: '#e8ece6', subText: '#9ca998', border: '#2e382b', primary: '#8da37b', secondary: '#a6b896', accent: '#d2deb2', shadow: '#000000' }
  },
  synthwaveLight: {
    id: 'synthwaveLight', name: 'Synthwave Claro', isDark: false,
    colors: { background: '#fdf6e3', card: '#ffffff', text: '#2b213a', subText: '#685987', border: '#f0e6fa', primary: '#ff2a6d', secondary: '#05d9e8', accent: '#ffb200', shadow: '#ff2a6d' }
  },
  synthwaveDark: {
    id: 'synthwaveDark', name: 'Synthwave Oscuro', isDark: true,
    colors: { background: '#120422', card: '#1b0a33', text: '#05d9e8', subText: '#d1c1eb', border: '#33135c', primary: '#ff2a6d', secondary: '#05d9e8', accent: '#01ffe5', shadow: '#ff2a6d' }
  },
  midnightLight: {
    id: 'midnightLight', name: 'Midnight Claro', isDark: false,
    colors: { background: '#f8f9fa', card: '#ffffff', text: '#212529', subText: '#6c757d', border: '#e9ecef', primary: '#495057', secondary: '#adb5bd', accent: '#343a40', shadow: '#000000' }
  },
  midnightDark: {
    id: 'midnightDark', name: 'Midnight Oscuro (OLED)', isDark: true,
    colors: { background: '#000000', card: '#0a0a0a', text: '#f8f9fa', subText: '#868e96', border: '#1f1f1f', primary: '#e9ecef', secondary: '#adb5bd', accent: '#ffffff', shadow: '#000000' }
  },
  rubyLight: {
    id: 'rubyLight', name: 'Ruby Claro', isDark: false,
    colors: { background: '#fcf2f2', card: '#ffffff', text: '#4a151b', subText: '#8f4b53', border: '#f2d8da', primary: '#e63946', secondary: '#f4a261', accent: '#d90429', shadow: '#000000' }
  },
  rubyDark: {
    id: 'rubyDark', name: 'Ruby Oscuro', isDark: true,
    colors: { background: '#170608', card: '#2b0f13', text: '#ffe6e9', subText: '#b3777f', border: '#4d1e25', primary: '#e63946', secondary: '#f1faee', accent: '#ef233c', shadow: '#000000' }
  }
};

export type ParticleType = 'none' | 'snow' | 'bubbles' | 'stars';

type ThemeContextType = {
  themeFamily: string;
  setThemeFamily: (family: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  toggleTheme: (x: number, y: number) => void; // Legacy
  colors: ThemeColors;
  particles: ParticleType;
  setParticles: (type: ParticleType) => void;
  themeId: string;
  backgroundImage: string | null;
  setBackgroundImage: (uri: string | null) => void;
  pickBackgroundImage: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType>({
  themeFamily: 'mint',
  setThemeFamily: () => {},
  isDarkMode: true,
  setIsDarkMode: () => {},
  toggleTheme: () => {},
  colors: themes.mintDark.colors,
  particles: 'none',
  setParticles: () => {},
  themeId: 'mintDark',
  backgroundImage: null,
  setBackgroundImage: () => {},
  pickBackgroundImage: async () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeFamily, setThemeFamilyState] = useState<string>('mint');
  const [isDarkMode, setIsDarkModeState] = useState<boolean>(true);
  const [particles, setParticlesState] = useState<ParticleType>('none');
  const [animating, setAnimating] = useState(false);
  const [opacity] = useState(new Animated.Value(1));

  useEffect(() => {
    AsyncStorage.getItem('@theme_family').then((val) => {
      if (val && baseThemes.find(t => t.id === val)) {
        setThemeFamilyState(val);
      }
    });
    AsyncStorage.getItem('@is_dark_mode').then((val) => {
      if (val !== null) setIsDarkModeState(val === 'true');
    });
    
    AsyncStorage.getItem('@particles').then((val) => {
      if (val === 'snow' || val === 'bubbles' || val === 'stars' || val === 'none') {
        setParticlesState(val);
      }
    });
    
    AsyncStorage.getItem('@background_image').then((val) => {
      if (val) setBackgroundImageState(val);
    });
  }, []);

  const [backgroundImage, setBackgroundImageState] = useState<string | null>(null);

  const setBackgroundImage = (uri: string | null) => {
    setBackgroundImageState(uri);
    if (uri) {
      AsyncStorage.setItem('@background_image', uri);
    } else {
      AsyncStorage.removeItem('@background_image');
    }
  };

  const pickBackgroundImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setBackgroundImage(result.assets[0].uri);
    }
  };

  const setThemeFamily = (family: string) => {
    setThemeFamilyState(family);
    AsyncStorage.setItem('@theme_family', family);
  };

  const setIsDarkMode = (dark: boolean) => {
    setIsDarkModeState(dark);
    AsyncStorage.setItem('@is_dark_mode', dark ? 'true' : 'false');
  };

  const setParticles = (type: ParticleType) => {
    setParticlesState(type);
    AsyncStorage.setItem('@particles', type);
  };

  const toggleTheme = () => {
    if (animating) return;
    setAnimating(true);
    const newDark = !isDarkMode;
    
    Animated.sequence([
      Animated.timing(opacity, { toValue: 0.8, duration: 150, useNativeDriver: true }),
    ]).start(async () => {
      setIsDarkMode(newDark);
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start(() => setAnimating(false));
    });
  };

  const themeId = `${themeFamily}${isDarkMode ? 'Dark' : 'Light'}`;
  const currentTheme = themes[themeId] || themes.mintDark;

  const isFrutiger = themeFamily === 'frutigerAero';

  return (
    <ThemeContext.Provider value={{ 
      themeFamily, 
      setThemeFamily, 
      isDarkMode, 
      setIsDarkMode,
      toggleTheme, 
      colors: currentTheme.colors,
      particles,
      setParticles,
      themeId,
      backgroundImage,
      setBackgroundImage,
      pickBackgroundImage
    }}>
      <Animated.View style={{ flex: 1, backgroundColor: currentTheme.colors.background, opacity }}>
        {backgroundImage ? (
           <ImageBackground source={{ uri: backgroundImage }} style={StyleSheet.absoluteFill} blurRadius={isFrutiger ? 20 : 0} />
        ) : isFrutiger && (
          <LinearGradient
            colors={isDarkMode ? ['#001a1c', '#004d40', '#001a1c'] : ['#e0f7fa', '#b2ebf2', '#80cbc4', '#e0f7fa']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
        {children}
      </Animated.View>
    </ThemeContext.Provider>
  );
};
