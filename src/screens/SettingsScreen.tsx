import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, baseThemes, ParticleType } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAudio } from '../context/AudioContext';

export default function SettingsScreen() {
  const { colors, themeFamily, setThemeFamily, particles, setParticles, isDarkMode, toggleTheme, pickBackgroundImage, backgroundImage } = useTheme();
  const navigation = useNavigation();
  const { loadSongsFromUri, changeMusicFolder } = useAudio();

  const rescanMusic = async () => {
    alert('Buscando música en el dispositivo...');
    await loadSongsFromUri();
    alert('¡Escaneo completo!');
  };



  return (
    <SafeAreaView style={[styles.container, { backgroundColor: backgroundImage ? 'transparent' : colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={32} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Sección: Apariencia */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Apariencia y Temas</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          
          <View style={[styles.settingRow, { marginBottom: 20 }]}>
            <View style={styles.settingInfo}>
              <Ionicons name={isDarkMode ? "moon" : "sunny"} size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Modo Oscuro</Text>
            </View>
            <TouchableOpacity 
              style={[styles.toggleBtn, { backgroundColor: isDarkMode ? colors.primary : '#EFEFEF', borderColor: colors.border }]} 
              onPress={(e) => toggleTheme(e.nativeEvent.pageX, e.nativeEvent.pageY)}
            >
              <View style={[styles.toggleCircle, { 
                borderColor: colors.border,
                transform: [{ translateX: isDarkMode ? 20 : 0 }] 
              }]} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.settingSubText, { color: colors.text, marginBottom: 10, marginLeft: 0 }]}>Estilo Base</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
            {baseThemes.map((theme) => {
              const isActive = theme.id === themeFamily;
              const previewColor = theme.id === 'mint' ? '#40c49d' : theme.id === 'cyberpunk' ? '#ff007f' : theme.id === 'ocean' ? '#00bcd4' : theme.id === 'sunset' ? '#ff9800' : '#9b72cf';
              return (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.themeBtn,
                    { backgroundColor: colors.background, borderColor: isActive ? colors.primary : colors.border },
                    isActive && styles.themeBtnActive
                  ]}
                  onPress={() => setThemeFamily(theme.id)}
                >
                  <View style={[styles.themeColorCircle, { backgroundColor: previewColor }]} />
                  <Text style={[styles.themeBtnText, { color: colors.text }]}>{theme.name}</Text>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.activeIcon} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Sección: Partículas */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Efectos de Partículas</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.optionsGrid}>
            {(['none', 'snow', 'bubbles', 'stars'] as ParticleType[]).map(type => {
              const isActive = particles === type;
              const labels = {
                none: 'Ninguno',
                snow: 'Nieve',
                bubbles: 'Burbujas',
                stars: 'Estrellas'
              };
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.particleBtn,
                    { 
                      backgroundColor: isActive ? colors.primary : colors.background, 
                      borderColor: colors.border 
                    }
                  ]}
                  onPress={() => setParticles(type)}
                >
                  <Text style={[styles.particleBtnText, { color: isActive ? '#000' : colors.text }]}>
                    {labels[type]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Sección: Almacenamiento */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Almacenamiento</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="sync" size={24} color={colors.text} />
              <View>
                <Text style={[styles.settingText, { color: colors.text }]}>Escanear Música</Text>
                <Text style={[styles.settingSubText, { color: colors.subText }]}>Buscar nuevas canciones en el dispositivo</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={[styles.primaryBtn, { borderColor: colors.border, backgroundColor: colors.primary }]} onPress={rescanMusic}>
            <Text style={styles.primaryBtnText}>Escanear Ahora</Text>
          </TouchableOpacity>

          <View style={[styles.settingRow, { marginTop: 20 }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="folder-open" size={24} color={colors.text} />
              <View>
                <Text style={[styles.settingText, { color: colors.text }]}>Carpeta de Música</Text>
                <Text style={[styles.settingSubText, { color: colors.subText }]}>Elegir la ruta específica de música</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={[styles.primaryBtn, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={changeMusicFolder}>
            <Text style={[styles.primaryBtnText, { color: colors.text }]}>Cambiar Ruta Específica</Text>
          </TouchableOpacity>
        </View>

        {/* Sección: Fondo Personalizado */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Fondo Personalizado</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="image-outline" size={24} color={colors.text} />
              <View>
                <Text style={[styles.settingText, { color: colors.text }]}>Fondo de Pantalla</Text>
                <Text style={[styles.settingSubText, { color: colors.subText }]}>Seleccionar una imagen de galería</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={[styles.primaryBtn, { borderColor: colors.border, backgroundColor: colors.primary }]} onPress={pickBackgroundImage}>
            <Text style={[styles.primaryBtnText, { color: '#000' }]}>Elegir Fondo</Text>
          </TouchableOpacity>
        </View>

        {/* Sección: Motor de Audio */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Motor de Audio</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="musical-notes" size={24} color={colors.text} />
              <View>
                <Text style={[styles.settingText, { color: colors.text }]}>Ecualizador y Bajos</Text>
                <Text style={[styles.settingSubText, { color: colors.subText }]}>Ajustes DSP Avanzados</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={[styles.primaryBtn, { borderColor: colors.border, backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Equalizer' as never)}>
            <Text style={[styles.primaryBtnText, { color: '#000' }]}>Abrir Ecualizador</Text>
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
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 6,
    borderRightWidth: 6,
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
    fontWeight: '900',
    marginLeft: 15,
  },
  settingSubText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 15,
    marginTop: 2,
  },
  primaryBtn: {
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  primaryBtnText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 16,
  },
  themeBtn: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    position: 'relative',
  },
  themeBtnActive: {
    borderWidth: 4,
  },
  themeColorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  themeBtnText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  particleBtn: {
    width: '48%',
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  particleBtnText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  toggleBtn: {
    width: 54,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
  },
});
