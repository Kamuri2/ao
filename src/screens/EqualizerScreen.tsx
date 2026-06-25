import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import ExpoMusicScanner from '../../modules/expo-music-scanner/src/ExpoMusicScannerModule';

type Band = {
  index: number;
  frequency: number;
  minLevel: number;
  maxLevel: number;
};

export default function EqualizerScreen() {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation();

  const [bands, setBands] = useState<Band[]>([]);
  const [bandLevels, setBandLevels] = useState<{ [key: number]: number }>({});
  const [bassStrength, setBassStrength] = useState<number>(0);

  useEffect(() => {
    loadEngine();
  }, []);

  const loadEngine = async () => {
    await ExpoMusicScanner.initAudioEngine();
    const fetchedBands = await ExpoMusicScanner.getEqualizerBands();
    setBands(fetchedBands);

    // Load saved settings
    const savedEq = await AsyncStorage.getItem('@eq_levels');
    const savedBass = await AsyncStorage.getItem('@bass_boost');

    const initialLevels: { [key: number]: number } = {};
    
    if (savedEq) {
      const parsed = JSON.parse(savedEq);
      fetchedBands.forEach(b => {
        initialLevels[b.index] = parsed[b.index] || 0;
        ExpoMusicScanner.setEqualizerBandLevel(b.index, initialLevels[b.index]);
      });
    } else {
      fetchedBands.forEach(b => {
        initialLevels[b.index] = 0;
      });
    }
    
    setBandLevels(initialLevels);

    if (savedBass) {
      const parsedBass = parseInt(savedBass, 10);
      setBassStrength(parsedBass);
      ExpoMusicScanner.setBassBoost(parsedBass);
    }
  };

  const handleBandChange = (index: number, value: number) => {
    const newLevels = { ...bandLevels, [index]: Math.round(value) };
    setBandLevels(newLevels);
    ExpoMusicScanner.setEqualizerBandLevel(index, Math.round(value));
    AsyncStorage.setItem('@eq_levels', JSON.stringify(newLevels));
  };

  const handleBassChange = (value: number) => {
    setBassStrength(Math.round(value));
    ExpoMusicScanner.setBassBoost(Math.round(value));
    AsyncStorage.setItem('@bass_boost', Math.round(value).toString());
  };

  const formatHz = (millihertz: number) => {
    const hz = millihertz / 1000;
    if (hz >= 1000) return `${(hz / 1000).toFixed(1)}k`;
    return `${Math.round(hz)}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={32} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Motor de Audio</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Amplificador de Bajos</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, paddingVertical: 30 }]}>
          <Text style={[styles.dbText, { color: colors.text, textAlign: 'center', marginBottom: 10 }]}>{bassStrength}</Text>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={1000}
            value={bassStrength}
            onValueChange={handleBassChange}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ecualizador Gráfico</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 20 }]}>
          {bands.length === 0 ? (
            <Text style={{ color: colors.subText, textAlign: 'center' }}>No soportado en este dispositivo</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eqScroll}>
              {bands.map((band) => (
                <View key={band.index} style={styles.bandContainer}>
                  <Text style={[styles.dbText, { color: colors.text }]}>{bandLevels[band.index] > 0 ? '+' : ''}{(bandLevels[band.index] / 100).toFixed(1)} dB</Text>
                  
                  <View style={styles.sliderContainer}>
                    <Slider
                      style={styles.verticalSlider}
                      minimumValue={band.minLevel}
                      maximumValue={band.maxLevel}
                      value={bandLevels[band.index] || 0}
                      onValueChange={(val) => handleBandChange(band.index, val)}
                      minimumTrackTintColor={colors.primary}
                      maximumTrackTintColor={colors.border}
                      thumbTintColor={colors.primary}
                    />
                  </View>
                  
                  <Text style={[styles.hzText, { color: colors.subText }]}>{formatHz(band.frequency)}</Text>
                </View>
              ))}
            </ScrollView>
          )}
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
    marginTop: 10,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  card: {
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderRadius: 8,
    marginBottom: 20,
  },
  eqScroll: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  bandContainer: {
    alignItems: 'center',
    width: 60,
    marginRight: 10,
  },
  sliderContainer: {
    height: 200,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  verticalSlider: {
    width: 200,
    height: 40,
    transform: [{ rotate: '-90deg' }],
  },
  hzText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dbText: {
    fontSize: 12,
    fontWeight: '600',
  }
});
