import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ErrorState({ title = "Something went wrong", message, onRetry, compact = false }) {
  return <View style={[styles.container, compact && styles.compact]}>
    <Text style={styles.icon}>!</Text>
    <View style={styles.copy}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message || "Please try again."}</Text>
    </View>
    {onRetry && <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}>
      <Text style={styles.retryText}>Try again</Text>
    </Pressable>}
  </View>;
}

const styles = StyleSheet.create({
  container: { margin: 20, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#F2B8B5", backgroundColor: "#FFF4F2", flexDirection: "row", alignItems: "center", gap: 12 },
  compact: { margin: 0, marginBottom: 12, padding: 12 },
  icon: { width: 28, height: 28, borderRadius: 14, textAlign: "center", paddingTop: 3, color: "#FFFFFF", backgroundColor: "#B42318", fontWeight: "800" },
  copy: { flex: 1 },
  title: { color: "#7A271A", fontWeight: "800", fontSize: 14 },
  message: { marginTop: 3, color: "#912018", fontSize: 13, lineHeight: 18 },
  retry: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 7, backgroundColor: "#B42318" },
  retryText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
});
