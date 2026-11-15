import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function NotificationBadge({
  count,
}) {
  if (count <= 0) {
    return null;
  }

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>
        {count > 99 ? "99+" : count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    right: -8,
    top: -8,

    minWidth: 20,
    height: 20,

    borderRadius: 10,

    justifyContent: "center",
    alignItems: "center",

    paddingHorizontal: 4,

    backgroundColor: "#ef4444",
  },

  text: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
});