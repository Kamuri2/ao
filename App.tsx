import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, LogBox } from 'react-native';
import { NavigationContainer, Theme, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AudioProvider } from './src/context/AudioContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

LogBox.ignoreLogs([
  'VirtualizedList: You have a large list that is slow to update',
  'InteractionManager has been deprecated',
]);

// ... other imports ...
import HomeScreen from './src/screens/HomeScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import AlbumsScreen from './src/screens/AlbumsScreen';
import ArtistsScreen from './src/screens/ArtistsScreen';
import FoldersScreen from './src/screens/FoldersScreen';
import FolderDetailScreen from './src/screens/FolderDetailScreen';
import PlaylistsScreen from './src/screens/PlaylistsScreen';
import MiniPlayer from './src/components/MiniPlayer';
import ParticleOverlay from './src/components/ParticleOverlay';
import SettingsScreen from './src/screens/SettingsScreen';
import EqualizerScreen from './src/screens/EqualizerScreen';

const RootStack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

const HomeStack = createNativeStackNavigator();
const FoldersStack = createNativeStackNavigator();
const AlbumsStack = createNativeStackNavigator();
const ArtistsStack = createNativeStackNavigator();
const PlaylistsStack = createNativeStackNavigator();

function HomeStackScreen() {
  const { colors, backgroundImage } = useTheme();
  return (
    <HomeStack.Navigator id="HomeStack" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: backgroundImage ? 'transparent' : colors.background } }}>
      <HomeStack.Screen name="CancionesMain" component={HomeScreen} />
      <HomeStack.Screen name="FolderDetail" component={FolderDetailScreen} options={{ animation: 'fade' }} />
    </HomeStack.Navigator>
  );
}

function FoldersStackScreen() {
  const { colors, backgroundImage } = useTheme();
  return (
    <FoldersStack.Navigator id="FoldersStack" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: backgroundImage ? 'transparent' : colors.background } }}>
      <FoldersStack.Screen name="CarpetasMain" component={FoldersScreen} />
      <FoldersStack.Screen name="FolderDetail" component={FolderDetailScreen} options={{ animation: 'fade' }} />
    </FoldersStack.Navigator>
  );
}

function AlbumsStackScreen() {
  const { colors, backgroundImage } = useTheme();
  return (
    <AlbumsStack.Navigator id="AlbumsStack" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: backgroundImage ? 'transparent' : colors.background } }}>
      <AlbumsStack.Screen name="ÁlbumesMain" component={AlbumsScreen} />
      <AlbumsStack.Screen name="FolderDetail" component={FolderDetailScreen} options={{ animation: 'fade' }} />
    </AlbumsStack.Navigator>
  );
}

function ArtistsStackScreen() {
  const { colors, backgroundImage } = useTheme();
  return (
    <ArtistsStack.Navigator id="ArtistsStack" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: backgroundImage ? 'transparent' : colors.background } }}>
      <ArtistsStack.Screen name="ArtistasMain" component={ArtistsScreen} />
      <ArtistsStack.Screen name="FolderDetail" component={FolderDetailScreen} options={{ animation: 'fade' }} />
    </ArtistsStack.Navigator>
  );
}

function PlaylistsStackScreen() {
  const { colors, backgroundImage } = useTheme();
  return (
    <PlaylistsStack.Navigator id="PlaylistsStack" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: backgroundImage ? 'transparent' : colors.background } }}>
      <PlaylistsStack.Screen name="PlaylistsMain" component={PlaylistsScreen} />
      <PlaylistsStack.Screen name="FolderDetail" component={FolderDetailScreen} options={{ animation: 'fade' }} />
    </PlaylistsStack.Navigator>
  );
}

function TabNavigator() {
  const { colors, backgroundImage, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      id="RootTabNavigator"
      tabBarPosition="bottom"
      screenOptions={{
        sceneStyle: { backgroundColor: backgroundImage ? 'transparent' : colors.background },
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#0A0A0A' : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: isDarkMode ? '#1A1A1A' : '#F0F0F0',
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        },
        tabBarIndicatorStyle: {
          backgroundColor: colors.primary,
          height: 3,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subText,
        tabBarLabelStyle: {
          fontFamily: 'sans-serif-medium',
          fontSize: 10,
          fontWeight: 'bold',
          textTransform: 'none',
        },
        swipeEnabled: true,
        animationEnabled: true,
      }}
    >
      <Tab.Screen name="Canciones" component={HomeStackScreen} options={{ tabBarLabel: 'Canciones', tabBarIcon: ({ color }) => <Ionicons name="musical-notes" size={20} color={color} /> }} />
      <Tab.Screen name="Carpetas" component={FoldersStackScreen} options={{ tabBarLabel: 'Carpetas', tabBarIcon: ({ color }) => <Ionicons name="folder" size={20} color={color} /> }} />
      <Tab.Screen name="Artistas" component={ArtistsStackScreen} options={{ tabBarLabel: 'Artistas', tabBarIcon: ({ color }) => <Ionicons name="people" size={20} color={color} /> }} />
      <Tab.Screen name="Álbumes" component={AlbumsStackScreen} options={{ tabBarLabel: 'Álbumes', tabBarIcon: ({ color }) => <Ionicons name="albums" size={20} color={color} /> }} />
      <Tab.Screen name="Playlists" component={PlaylistsStackScreen} options={{ tabBarLabel: 'Playlists', tabBarIcon: ({ color }) => <Ionicons name="list" size={20} color={color} /> }} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { colors, isDarkMode, backgroundImage } = useTheme();
  const navigationRef = useNavigationContainerRef<any>();
  const [currentRoute, setCurrentRoute] = useState<string | undefined>(undefined);

  const navigationTheme: Theme = {
    dark: isDarkMode,
    colors: {
      primary: colors.primary,
      background: backgroundImage ? 'transparent' : colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.accent,
    },
    fonts: {
      regular: { fontFamily: 'sans-serif', fontWeight: 'normal' },
      medium: { fontFamily: 'sans-serif-medium', fontWeight: '500' },
      bold: { fontFamily: 'sans-serif-medium', fontWeight: 'bold' },
      heavy: { fontFamily: 'sans-serif-medium', fontWeight: '900' },
    }
  };

  return (
    <>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer 
          theme={navigationTheme}
          ref={navigationRef}
          onReady={() => {
            const route = navigationRef.getCurrentRoute();
            if (route) setCurrentRoute(route.name);
          }}
          onStateChange={() => {
            const route = navigationRef.getCurrentRoute();
            if (route) setCurrentRoute(route.name);
          }}
        >
          <RootStack.Navigator id="RootStack" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: backgroundImage ? 'transparent' : colors.background } }}>
            <RootStack.Screen name="Tabs" component={TabNavigator} />
            <RootStack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'slide_from_bottom' }} />
            <RootStack.Screen name="Equalizer" component={EqualizerScreen} options={{ animation: 'slide_from_bottom' }} />
            <RootStack.Screen name="Player" component={PlayerScreen} options={{ animation: 'slide_from_bottom', presentation: 'transparentModal' }} />
          </RootStack.Navigator>
          
          <ParticleOverlay />
          <MiniPlayer currentRoute={currentRoute} />
        </NavigationContainer>
      </GestureHandlerRootView>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AudioProvider>
          <AppContent />
        </AudioProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
