import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  /**
   * Load notifications
   */
  async function loadNotifications() {
    if (!user?.id) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getNotifications(
        user.id
      );

      setNotifications(data);

      const count = await getUnreadCount(
        user.id
      );

      setUnreadCount(count);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );

      setError(
        error.message ||
          "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * Load only unread count
   */
  async function refreshUnreadCount() {
    if (!user?.id) {
      return;
    }

    try {
      const count = await getUnreadCount(
        user.id
      );

      setUnreadCount(count);
    } catch (error) {
      console.error(
        "Failed to load unread count:",
        error
      );
    }
  }

  /**
   * Mark one notification as read
   */
  async function markAsRead(notificationId) {
    try {
      await markNotificationAsRead(
        notificationId
      );

      setNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    is_read: true,
                  }
                : notification
          )
      );

      setUnreadCount(
        (currentCount) =>
          currentCount > 0
            ? currentCount - 1
            : 0
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );

      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async function markAllAsRead() {
    if (!user?.id) {
      return;
    }

    try {
      await markAllNotificationsAsRead(
        user.id
      );

      setNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (notification) => ({
              ...notification,
              is_read: true,
            })
          )
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );

      throw error;
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?.id]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,

        loadNotifications,
        refreshUnreadCount,

        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(
    NotificationContext
  );

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
}