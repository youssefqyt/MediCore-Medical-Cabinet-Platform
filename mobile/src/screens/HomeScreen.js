import React from "react";

import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import NotificationBadge from "../components/NotificationBadge";

import {
  useNotifications,
} from "../context/NotificationContext";

export default function HomeScreen({
  navigation,
}) {
  const { unreadCount } =
    useNotifications();

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.notificationButton}
        onPress={() =>
          navigation.navigate("Notifications")
        }
      >
        <Text style={styles.icon}>
          🔔
        </Text>

        <NotificationBadge
          count={unreadCount}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",
  },

  notificationButton: {
    position: "relative",

    width: 50,
    height: 50,

    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    fontSize: 28,
  },
});