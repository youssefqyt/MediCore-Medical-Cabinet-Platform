import React from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import NotificationItem from "../components/NotificationItem";
import ErrorState from "../components/ErrorState";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationsScreen() {
  const { notifications, loading, error, loadNotifications, markAsRead } = useNotifications();
  const [actionError, setActionError] = React.useState(null);

  if (loading && notifications.length === 0) {
    return <View style={styles.center}><ActivityIndicator size="large" /><Text style={styles.message}>Loading notifications...</Text></View>;
  }

  if (error && notifications.length === 0) {
    return <View style={styles.center}><ErrorState message={error} onRetry={loadNotifications} /></View>;
  }

  return <View style={styles.container}>
    <Text style={styles.header}>Notifications</Text>
    {error && <ErrorState message={error} onRetry={loadNotifications} />}
    {actionError && <ErrorState compact title="Could not update notification" message={actionError} />}
    <FlatList
      data={notifications}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <NotificationItem notification={item} onRead={markAsRead} onError={setActionError} />}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadNotifications} />}
      ListEmptyComponent={<View style={styles.center}><Text style={styles.message}>No notifications yet</Text></View>}
    />
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 20, color: "#111827" },
  message: { marginTop: 12, fontSize: 15, color: "#6b7280" },
  error: { marginBottom: 12, color: "#b91c1c", textAlign: "center" },
  retry: { marginTop: 20, paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8, backgroundColor: "#10b981" },
  retryText: { color: "#ffffff", fontWeight: "bold" },
});
