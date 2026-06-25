import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'artist_cover_';

export const fetchArtistImage = async (artistName: string): Promise<string | undefined> => {
  if (!artistName || artistName.trim().toLowerCase() === 'desconocido') {
    return undefined;
  }

  const cacheKey = `${CACHE_PREFIX}${artistName.toLowerCase()}`;

  try {
    // 1. Check Cache
    const cachedUrl = await AsyncStorage.getItem(cacheKey);
    if (cachedUrl) {
      if (cachedUrl === 'NOT_FOUND') return undefined; // Avoid re-fetching failed queries
      return cachedUrl;
    }

    // 2. Fetch from Deezer API
    const response = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}`);
    const data = await response.json();

    if (data && data.data && data.data.length > 0) {
      // Deezer returns picture, picture_small, picture_medium, picture_big, picture_xl
      // We will prefer picture_xl, then picture_big
      const artist = data.data[0];
      const imageUrl = artist.picture_xl || artist.picture_big || artist.picture_medium || artist.picture;

      if (imageUrl) {
        // 3. Save to cache
        await AsyncStorage.setItem(cacheKey, imageUrl);
        return imageUrl;
      }
    }

    // Cache NOT_FOUND to prevent spamming the API for artists that don't exist
    await AsyncStorage.setItem(cacheKey, 'NOT_FOUND');
    return undefined;

  } catch (error) {
    console.warn(`Error fetching cover for artist ${artistName}:`, error);
    return undefined;
  }
};
