const fs = require('fs');
const path = './node_modules/react-native-track-player/android/src/main/java/com/doublesymmetry/trackplayer/module/MusicModule.kt';
let content = fs.readFileSync(path, 'utf8');

const regex = /fun\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*=\s*scope\.launch\s*\{/g;
let match;
while ((match = regex.exec(content)) !== null) {
    const start = match.index;
    const end = match.index + match[0].length;
    
    const newStr = match[0].replace('=', '{');
    content = content.substring(0, start) + newStr + content.substring(end);
    
    let braceCount = 1;
    let i = start + newStr.length;
    while (i < content.length && braceCount > 0) {
        if (content[i] === '{') braceCount++;
        else if (content[i] === '}') braceCount--;
        i++;
    }
    
    content = content.substring(0, i) + ' }' + content.substring(i);
    regex.lastIndex = i + 2;
}

fs.writeFileSync(path, content, 'utf8');
console.log('Patched successfully!');
