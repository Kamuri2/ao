import re

file_path = "src/screens/PlayerScreen.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace function signature
content = content.replace("export default function GlobalPlayerSheet() {", "export default function PlayerScreen({ navigation }: any) {")

# Remove MiniPlayer logic
# Let's just find the return block and replace the wrapper.
content = re.sub(
    r"<View style=\{StyleSheet\.absoluteFill\} pointerEvents=\"box-none\">.*?\{/\* FULL PLAYER \*/\}",
    "return (\n    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>\n        {/* FULL PLAYER */}",
    content,
    flags=re.DOTALL
)

# Remove the trailing tags of the absolute sheet wrapper
content = re.sub(
    r"</Animated\.View>\n\s*</GestureDetector>\n\s*</Animated\.View>\n\s*</View>\n\s*\);",
    "        </View>\n    </SafeAreaView>\n  );",
    content,
    flags=re.DOTALL
)

# Change backButton logic
content = content.replace("onPress={snapToCollapsed}", "onPress={() => navigation.goBack()}")

# Remove the panGesture wrapper
content = content.replace("<Animated.View style={[StyleSheet.absoluteFill, animatedFullPlayerStyle]} pointerEvents=\"box-none\">", "")
content = content.replace("<GestureDetector gesture={panGesture}>", "")
content = content.replace("style={[styles.fullPlayerContent, { paddingTop: insets.top, backgroundColor: colors.background }]} \n              pointerEvents={isExpanded ? 'auto' : 'none'}", "style={[styles.fullPlayerContent, { backgroundColor: colors.background, flex: 1 }]}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("PlayerScreen rewritten successfully.")
