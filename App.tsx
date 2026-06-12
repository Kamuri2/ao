import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { BlurView } from 'expo-blur';
import { NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AudioProvider, useAudio } from './src/context/AudioContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import HomeScreen from './src/screens/HomeScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import AlbumsScreen from './src/screens/AlbumsScreen';
import FoldersScreen from './src/screens/FoldersScreen';
import FolderDetailScreen from './src/screens/FolderDetailScreen';
import PlaylistsScreen from './src/screens/PlaylistsScreen';
import MiniPlayer from './src/components/MiniPlayer';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      id="RootTabNavigator"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 3,
          borderTopColor: colors.border,
          elevation: 0,
          height: 65,
          backgroundColor: colors.card,
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarLabelStyle: {
          fontFamily: 'sans-serif-medium',
          fontSize: 11,
          paddingBottom: 5,
          fontWeight: '900',
        }
      }}
    >
      <Tab.Screen
        name="Canciones"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="musical-notes" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Carpetas"
        component={FoldersScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="folder" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Álbumes"
        component={AlbumsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="albums" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Listas"
        component={PlaylistsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}

function MainTabsWithMiniPlayer() {
  const { currentSong } = useAudio();
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TabNavigator />
      {currentSong && <MiniPlayer />}
    </View>
  );
}

function MainNavigator() {
  const { colors, isDarkMode } = useTheme();

  const reactNavigationTheme: Theme = {
    dark: isDarkMode,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: '#ff4757',
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' },
      medium: { fontFamily: 'System', fontWeight: '700' },
      bold: { fontFamily: 'System', fontWeight: '900' },
      heavy: { fontFamily: 'System', fontWeight: '900' },
    },
  };

  return (
    <NavigationContainer theme={reactNavigationTheme}>
      <Stack.Navigator
        id="RootStackNavigator"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabsWithMiniPlayer} />
        <Stack.Screen
          name="FolderDetail"
          component={FolderDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            gestureEnabled: true,
            gestureDirection: 'vertical',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AppContent() {
  const { colors, isDarkMode } = useTheme();

  return (
    <>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <MainNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AudioProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AudioProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
    shadowColor: '#a540beff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 3,
  }
});
