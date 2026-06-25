import re

file_path = "src/screens/PlayerScreen.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add useAnimatedScrollHandler to reanimated imports
content = content.replace("  runOnJS,", "  runOnJS,\n  useAnimatedScrollHandler,")

# 2. Add fullQueue state and carouselRef
state_decl = "  const [fullQueue, setFullQueue] = useState<Track[]>([]);\n  const carouselRef = useRef<FlatList>(null);\n  const scrollX = useSharedValue(0);\n  const scrollHandler = useAnimatedScrollHandler({ onScroll: (event) => { scrollX.value = event.contentOffset.x; } });\n"
content = content.replace("  const [queueTracks, setQueueTracks] = useState<Track[]>([]);\n  const [startIndex, setStartIndex] = useState(0);", 
                          state_decl + "  const [queueTracks, setQueueTracks] = useState<Track[]>([]);\n  const [startIndex, setStartIndex] = useState(0);")

# 3. Modify queue fetching logic to load fullQueue unconditionally
old_queue_effect = """  useEffect(() => {
    if (activeTab === 'queue') {
      TrackPlayer.getQueue().then(tracks => {
        let idx = tracks.findIndex(t => t.id === currentSong?.id);
        if (idx === -1) idx = 0;
        setStartIndex(idx);
        setQueueTracks(tracks.slice(idx));
      });
    }
  }, [activeTab, currentSong]);"""

new_queue_effect = """  useEffect(() => {
    TrackPlayer.getQueue().then(tracks => {
      setFullQueue(tracks);
      let idx = tracks.findIndex(t => t.id === currentSong?.id);
      if (idx !== -1) {
        setStartIndex(idx);
        setQueueTracks(tracks.slice(idx));
        if (carouselRef.current && activeTab === 'cover') {
          try {
            carouselRef.current.scrollToIndex({ index: idx, animated: true });
          } catch(e) {}
        }
      }
    });
  }, [currentSong, activeTab]);"""

content = content.replace(old_queue_effect, new_queue_effect)

# 4. Remove old animation logic
content = re.sub(r"  const translateXAnim = useSharedValue\(0\);\n  const opacity = useSharedValue\(1\);\n\n  useEffect\(\(\) => \{.*?\n  \}, \[currentSong\?\.id\]\);\n\n", "", content, flags=re.DOTALL)
content = re.sub(r"  const animatedCoverStyle = useAnimatedStyle\(\(\) => \{\n    return \{\n      transform: \[\{ translateX: translateXAnim\.value \}\],\n      opacity: opacity\.value,\n    \};\n  \}\);\n\n", "", content, flags=re.DOTALL)

# 5. Define ITEM_WIDTH
content = content.replace("const coverSize = width * 0.97;", "const coverSize = width * 0.97;\nconst ITEM_WIDTH = width * 0.82;\nconst SPACING = (width - ITEM_WIDTH) / 2;")

# 6. Create RenderItem Component internally
render_item_str = """
  const renderCarouselItem = ({ item, index }: { item: Track, index: number }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const inputRange = [(index - 1) * ITEM_WIDTH, index * ITEM_WIDTH, (index + 1) * ITEM_WIDTH];
      const scale = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], Extrapolation.CLAMP);
      const opacityVal = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], Extrapolation.CLAMP);
      return {
        transform: [{ scale }],
        opacity: opacityVal,
      };
    });
    return (
      <View style={{ width: ITEM_WIDTH, justifyContent: 'center', alignItems: 'center' }}>
        <Animated.View style={[{ width: ITEM_WIDTH, height: ITEM_WIDTH, borderRadius: 20, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15 }, animatedStyle]}>
           <CoverImage coverUrl={item.artwork || item.url} style={{ width: '100%', height: '100%', borderRadius: 20 }} placeholderStyle={{ width: '100%', height: '100%', borderRadius: 20, backgroundColor: colors.card }} />
        </Animated.View>
      </View>
    );
  };
"""
content = content.replace("  if (!currentSong) return null;", render_item_str + "  if (!currentSong) return null;")

# 7. Replace CoverImage render with Animated.FlatList
old_cover_render = """                    <Animated.View style={[styles.coverContainerWrapper, animatedCoverStyle]}>
                      <TouchableOpacity activeOpacity={0.9} onPress={() => setActiveTab('lyrics')} style={{ width: '100%', height: '100%' }}>
                        <CoverImage
                          coverUrl={metadata.cover}
                          style={styles.coverImage}
                          placeholderStyle={[styles.placeholderCover, { backgroundColor: colors.card }]}
                        />
                      </TouchableOpacity>
                    </Animated.View>"""

new_cover_render = """                    <View style={{ height: ITEM_WIDTH, marginBottom: 40, marginTop: 10 }}>
                      {fullQueue.length > 0 ? (
                        <Animated.FlatList
                          ref={carouselRef}
                          data={fullQueue}
                          keyExtractor={(item, idx) => `${item.id}-${idx}`}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          snapToInterval={ITEM_WIDTH}
                          decelerationRate="fast"
                          contentContainerStyle={{ paddingHorizontal: SPACING }}
                          onScroll={scrollHandler}
                          scrollEventThrottle={16}
                          getItemLayout={(data, index) => ({ length: ITEM_WIDTH, offset: ITEM_WIDTH * index, index })}
                          initialScrollIndex={fullQueue.findIndex(t => t.id === currentSong?.id) !== -1 ? fullQueue.findIndex(t => t.id === currentSong?.id) : 0}
                          onMomentumScrollEnd={(e) => {
                            const newIndex = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
                            if (fullQueue[newIndex] && fullQueue[newIndex].id !== currentSong?.id) {
                              TrackPlayer.skip(newIndex);
                            }
                          }}
                          renderItem={renderCarouselItem}
                        />
                      ) : null}
                    </View>"""

content = content.replace(old_cover_render, new_cover_render)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("PlayerScreen carousel applied successfully.")
