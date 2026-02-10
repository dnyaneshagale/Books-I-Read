import axiosClient from './axiosClient';

/**
 * Notifications API
 */
const notificationApi = {
  /** Get all notifications */
  getNotifications: (page = 0, size = 20) =>
    axiosClient.get('/notifications', { params: { page, size } }),

  /** Get unread notifications */
  getUnreadNotifications: (page = 0, size = 20) =>
    axiosClient.get('/notifications/unread', { params: { page, size } }),

  /** Get unread count */
  getUnreadCount: () =>
    axiosClient.get('/notifications/count'),

  /** Mark one notification as read */
  markAsRead: (notificationId) =>
    axiosClient.post(`/notifications/${notificationId}/read`),

  /** Mark all notifications as read */
  markAllAsRead: () =>
    axiosClient.post('/notifications/read-all'),
};

export default notificationApi;
