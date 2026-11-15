import React from "react";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";

function getNotificationIcon(type) {
  switch (type) {
    case "ORDER":
      return "📦";

    case "PAYMENT":
      return "💳";

    case "SHIPPING":
      return "🚚";

    case "DELIVERY":
      return "✅";

    case "PROMOTION":
      return "🔥";

    case "PRODUCT":
      return "🛍️";

    case "CART":
      return "🛒";

    case "ACCOUNT":
      return "👤";

    case "SYSTEM":
      return "⚙️";

    default:
      return "🔔";
  }
}

export default function NotificationItem({
  notification,
  onRead,
  onError,
}) {
  const isUnread = !notification.is_read;

  const icon = getNotificationIcon(
    notification.type
  );

  async function handlePress() {
    if (!isUnread) {
      return;
    }

    try {
      await onRead(notification.id);
    } catch (error) {
      onError?.(error.message);
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.container,
        isUnread && styles.unread,
      ]}
    >
      {isUnread && (
        <View style={styles.unreadDot} />
      )}

      <View style={styles.iconContainer}>
        <Text style={styles.icon}>
          {icon}
        </Text>
      </View>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            isUnread && styles.unreadTitle,
          ]}
        >
          {notification.title}
        </Text>

        <Text style={styles.message}>
          {notification.message}
        </Text>

        <Text style={styles.type}>
          {notification.type}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    padding: 16,
    marginBottom: 10,

    borderRadius: 12,

    backgroundColor: "#ffffff",

    elevation: 2,
  },

  unread: {
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },

  unreadDot: {
    width: 8,
    height: 8,

    borderRadius: 4,

    marginTop: 6,
    marginRight: 8,

    backgroundColor: "#10b981",
  },

  iconContainer: {
    width: 45,
    height: 45,

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  icon: {
    fontSize: 26,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },

  unreadTitle: {
    fontWeight: "800",
  },

  message: {
    fontSize: 14,
    color: "#4b5563",

    marginTop: 5,
  },

  type: {
    fontSize: 12,
    color: "#6b7280",

    marginTop: 8,
  },
});