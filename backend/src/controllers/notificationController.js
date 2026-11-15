const service = require("../services/notificationService");
const AppError = require("../utils/AppError");
const emit = (req, event, notification) => req.app.get("io")?.to(`user:${notification.user_id}`).emit(event, notification);
async function getNotifications(req, res) { res.json({ success: true, data: await service.getUserNotifications(req.user.id) }); }
async function createNotification(req, res) { const notification = await service.createNotification({ userId: req.user.id, ...req.body }); emit(req, "notification:created", notification); res.status(201).json({ success: true, data: notification }); }
async function updateNotification(req, res) { const notification = await service.updateNotification(req.params.id, req.user.id, req.body); if (!notification) throw new AppError("Notification not found", 404); emit(req, "notification:updated", notification); res.json({ success: true, data: notification }); }
async function setReadState(req, res) { const notification = await service.setReadState(req.params.id, req.user.id, req.body.isRead); if (!notification) throw new AppError("Notification not found", 404); emit(req, "notification:updated", notification); res.json({ success: true, data: notification }); }
async function deleteNotification(req, res) { const notification = await service.deleteNotification(req.params.id, req.user.id); if (!notification) throw new AppError("Notification not found", 404); req.app.get("io")?.to(`user:${req.user.id}`).emit("notification:deleted", { id: notification.id }); res.json({ success: true, message: "Notification deleted successfully" }); }
async function getUnreadCount(req, res) { res.json({ success: true, count: await service.getUnreadCount(req.user.id) }); }
async function markAllAsRead(req, res) { const notifications = await service.markAllAsRead(req.user.id); const io = req.app.get("io"); notifications.forEach((notification) => io?.to(`user:${req.user.id}`).emit("notification:updated", notification)); res.json({ success: true, data: notifications }); }
module.exports = { getNotifications, createNotification, updateNotification, setReadState, deleteNotification, getUnreadCount, markAllAsRead };
