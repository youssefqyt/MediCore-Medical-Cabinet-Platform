import { request } from "./api";
export async function getNotifications() { const response = await request("/notifications"); return response.data || []; }
export async function getUnreadCount() { const response = await request("/notifications/unread-count"); return response.count || 0; }
export async function markNotificationAsRead(id) { return request(`/notifications/${id}/read-state`, { method: "PATCH", body: JSON.stringify({ isRead: true }) }); }
export async function markAllNotificationsAsRead() { return request("/notifications/read-all", { method: "PATCH" }); }
export async function deleteNotification(id) { return request(`/notifications/${id}`, { method: "DELETE" }); }
