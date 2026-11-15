const db = require("../config/db");

function getNotificationsByUserId(userId) {
  const notifications = db.table("notifications");
  return Promise.resolve(
    notifications
      .filter((n) => Number(n.userId || n.user_id) === Number(userId))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  );
}

function createNotification({ userId, title, message, type = "SYSTEM", data = {} }) {
  const notifications = db.table("notifications");
  const nextId = notifications.length + 1;
  const newNotif = {
    id: nextId,
    userId: Number(userId),
    user_id: Number(userId),
    title,
    message,
    type,
    data,
    is_read: false,
    created_at: new Date().toISOString()
  };
  notifications.push(newNotif);
  db.save();
  return Promise.resolve(newNotif);
}

function updateNotification(id, userId, { title, message, type, data, isRead }) {
  const notifications = db.table("notifications");
  const notif = notifications.find((n) => Number(n.id) === Number(id) && Number(n.userId || n.user_id) === Number(userId));
  if (!notif) return Promise.resolve(null);

  if (title !== undefined) notif.title = title;
  if (message !== undefined) notif.message = message;
  if (type !== undefined) notif.type = type;
  if (data !== undefined) notif.data = data;
  if (isRead !== undefined) notif.is_read = Boolean(isRead);

  db.save();
  return Promise.resolve(notif);
}

function setReadState(id, userId, isRead) {
  const notifications = db.table("notifications");
  const notif = notifications.find((n) => Number(n.id) === Number(id) && Number(n.userId || n.user_id) === Number(userId));
  if (!notif) return Promise.resolve(null);

  notif.is_read = Boolean(isRead);
  db.save();
  return Promise.resolve(notif);
}

function deleteNotification(id, userId) {
  const notifications = db.table("notifications");
  const idx = notifications.findIndex((n) => Number(n.id) === Number(id) && Number(n.userId || n.user_id) === Number(userId));
  if (idx === -1) return Promise.resolve(null);

  const [removed] = notifications.splice(idx, 1);
  db.save();
  return Promise.resolve(removed);
}

function getUnreadCount(userId) {
  const notifications = db.table("notifications");
  const count = notifications.filter(
    (n) => Number(n.userId || n.user_id) === Number(userId) && !n.is_read
  ).length;
  return Promise.resolve(count);
}

function markAllAsRead(userId) {
  const notifications = db.table("notifications");
  const updated = [];
  notifications.forEach((n) => {
    if (Number(n.userId || n.user_id) === Number(userId) && !n.is_read) {
      n.is_read = true;
      updated.push(n);
    }
  });
  db.save();
  return Promise.resolve(updated);
}

module.exports = {
  getNotificationsByUserId,
  createNotification,
  updateNotification,
  setReadState,
  deleteNotification,
  getUnreadCount,
  markAllAsRead
};
