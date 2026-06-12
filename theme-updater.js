const fs = require('fs');

const files = [
  'src/screens/FoldersScreen.tsx',
  'src/screens/FolderDetailScreen.tsx',
  'src/screens/AlbumsScreen.tsx',
  'src/screens/PlaylistsScreen.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let c = fs.readFileSync(file, 'utf8');

  // Add import if missing
  if (!c.includes('useTheme')) {
    c = c.replace(/import \{ View, Text/g, 'import { useTheme } from \'../context/ThemeContext\';\nimport { View, Text');
    if (!c.includes('useTheme')) {
        c = c.replace(/import React/g, 'import { useTheme } from \'../context/ThemeContext\';\nimport React');
    }
  }

  // Inject useTheme in component
  c = c.replace(/(export default function \w+\(.*?\) \{)/, '$1\n  const { colors } = useTheme();');

  // Specific elements JSX replacements
  c = c.replace(/style=\{styles\.headerTitle\}/g, 'style={[styles.headerTitle, { color: colors.primary }]}');
  c = c.replace(/style=\{styles\.folderName\}/g, 'style={[styles.folderName, { color: colors.text }]}');
  c = c.replace(/style=\{styles\.folderPath\}/g, 'style={[styles.folderPath, { color: colors.subText }]}');
  c = c.replace(/style=\{styles\.folderCount\}/g, 'style={[styles.folderCount, { color: colors.text }]}');
  c = c.replace(/style=\{styles\.albumName\}/g, 'style={[styles.albumName, { color: colors.text }]}');
  c = c.replace(/style=\{styles\.albumArtist\}/g, 'style={[styles.albumArtist, { color: colors.subText }]}');
  c = c.replace(/style=\{styles\.playlistName\}/g, 'style={[styles.playlistName, { color: colors.text }]}');
  c = c.replace(/style=\{styles\.playlistCount\}/g, 'style={[styles.playlistCount, { color: colors.subText }]}');
  c = c.replace(/style=\{styles\.emptyText\}/g, 'style={[styles.emptyText, { color: colors.text }]}');
  c = c.replace(/style=\{styles\.emptySubText\}/g, 'style={[styles.emptySubText, { color: colors.subText }]}');
  c = c.replace(/style=\{styles\.songTitle\}/g, 'style={[styles.songTitle, { color: colors.text }]}');
  c = c.replace(/style=\{styles\.songArtist\}/g, 'style={[styles.songArtist, { color: colors.subText }]}');
  c = c.replace(/style=\{styles\.backButtonText\}/g, 'style={[styles.backButtonText, { color: colors.text }]}');

  c = c.replace(/style=\{styles\.folderCard\}/g, 'style={[styles.folderCard, { borderColor: colors.border, backgroundColor: colors.card }]}');
  c = c.replace(/style=\{styles\.albumCard\}/g, 'style={[styles.albumCard, { borderColor: colors.border, backgroundColor: colors.card }]}');
  c = c.replace(/style=\{styles\.playlistCard\}/g, 'style={[styles.playlistCard, { borderColor: colors.border, backgroundColor: colors.card }]}');
  c = c.replace(/style=\{styles\.createBtn\}/g, 'style={[styles.createBtn, { borderLeftColor: colors.border }]}');
  c = c.replace(/style=\{styles\.createContainer\}/g, 'style={[styles.createContainer, { borderColor: colors.border, backgroundColor: colors.card }]}');
  c = c.replace(/style=\{styles\.input\}/g, 'style={[styles.input, { color: colors.text }]}');
  c = c.replace(/placeholderTextColor=".*?"/g, 'placeholderTextColor={colors.subText}');
  
  c = c.replace(/style=\{styles\.container\}/g, 'style={[styles.container, { backgroundColor: colors.background }]}');
  c = c.replace(/style=\{styles\.header\}/g, 'style={[styles.header, { borderBottomColor: colors.border }]}');
  c = c.replace(/style=\{styles\.songItemContent\}/g, 'style={[styles.songItemContent, { backgroundColor: colors.card, borderColor: colors.border }]}');
  c = c.replace(/style=\{styles\.thumbnail\}/g, 'style={[styles.thumbnail, { borderColor: colors.border }]}');
  
  fs.writeFileSync(file, c, 'utf8');
}
console.log('Done');
