import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeColors = {
  background: string;
  card: string;
  text: string;
  subText: string;
  primary: string;
  border: string;
};

export const brutalistLight: ThemeColors = {
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#000000',
  subText: '#333333',
  primary: '#30c296', // Mint green
  border: '#000000',
};

export const brutalistDark: ThemeColors = {
  background: '#121212', // Very dark gray
  card: '#1E1E1E',
  text: '#FFFFFF',
  subText: '#AAAAAA',
  primary: '#30c296', // Mint green stands out nicely on dark
  border: '#FFFFFF', // White borders for brutalism in dark mode
};

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  colors: brutalistLight,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('@dark_mode').then((val) => {
      if (val === 'true') {
        setIsDarkMode(true);
      }
    });
  }, []);

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await AsyncStorage.setItem('@dark_mode', newMode ? 'true' : 'false');
  };

  const colors = isDarkMode ? brutalistDark : brutalistLight;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
