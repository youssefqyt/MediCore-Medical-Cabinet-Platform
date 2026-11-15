const repository = require("../repositories/notificationRepository");
const getUserNotifications = (userId) => repository.getNotificationsByUserId(userId);
const createNotification = (input) => repository.createNotification(input);
const updateNotification = (id, userId, input) => repository.updateNotification(id, userId, input);
const setReadState = (id, userId, isRead) => repository.setReadState(id, userId, isRead);
const deleteNotification = (id, userId) => repository.deleteNotification(id, userId);
const getUnreadCount = (userId) => repository.getUnreadCount(userId);
const markAllAsRead = (userId) => repository.markAllAsRead(userId);
module.exports = { getUserNotifications, createNotification, updateNotification, setReadState, deleteNotification, getUnreadCount, markAllAsRead };
