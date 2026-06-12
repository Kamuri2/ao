import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
const { StorageAccessFramework } = FileSystem as any;
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudio } from '../context/AudioContext';

export default function SettingsScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const { loadSongsFromUri } = useAudio();

  const selectFolder = async () => {
    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
    
    if (permissions.granted) {
      await AsyncStorage.setItem('@music_directory_uri', permissions.directoryUri);
      loadSongsFromUri(permissions.directoryUri);
      alert('Carpeta de música actualizada correctamente.');
    } else {
      alert('Se necesitan permisos para acceder a la carpeta de música.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={32} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Sección: Apariencia */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Apariencia</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name={isDarkMode ? "moon" : "sunny"} size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Modo Oscuro</Text>
            </View>
            <TouchableOpacity 
              style={[styles.toggleBtn, { backgroundColor: isDarkMode ? colors.primary : '#EFEFEF', borderColor: colors.border }]} 
              onPress={toggleTheme}
            >
              <View style={[styles.toggleCircle, { 
                borderColor: colors.border,
                transform: [{ translateX: isDarkMode ? 20 : 0 }] 
              }]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sección: Almacenamiento */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Almacenamiento</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="folder-open" size={24} color={colors.text} />
              <View>
                <Text style={[styles.settingText, { color: colors.text }]}>Carpeta de Música</Text>
                <Text style={[styles.settingSubText, { color: colors.subText }]}>Selecciona de dónde leer tus canciones</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={[styles.primaryBtn, { borderColor: colors.border }]} onPress={selectFolder}>
            <Text style={styles.primaryBtnText}>Elegir Carpeta</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 3,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  card: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  settingSubText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 15,
    marginTop: 2,
  },
  toggleBtn: {
    width: 50,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
  },
  primaryBtn: {
    backgroundColor: '#30c296',
    borderWidth: 2,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  primaryBtnText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 16,
  }
});
