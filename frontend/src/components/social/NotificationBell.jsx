import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationApi from '../../api/notificationApi';
import './NotificationBell.css';

/**
 * NotificationBell - Bell icon with dropdown for notifications
 * Shows unread count badge and dropdown panel
 */
const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Poll for unread count every 30s
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      setUnreadCount(res.data.count || 0);
    } catch {
      // silently fail
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getNotifications(0, 15);
      setNotifications(res.data.content || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {
      // silently fail
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        await notificationApi.markAsRead(notification.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      } catch {
        // silently fail
      }
    }

    // Navigate based on type
    setIsOpen(false);
    switch (notification.type) {
      case 'FOLLOW':
      case 'FOLLOW_ACCEPTED':
        navigate(`/profile/${notification.actorUsername}`);
        break;
      case 'FOLLOW_REQUEST':
        navigate('/profile'); // Go to own profile to manage requests
        break;
      case 'BOOK_REVIEW':
      case 'COMMENT':
      case 'COMMENT_REPLY':
      case 'MENTION':
      case 'LIKE_REVIEW':
        if (notification.reflectionId) {
          navigate(`/reflections/${notification.reflectionId}`);
        } else if (notification.reviewId) {
          navigate(`/reviews/${notification.reviewId}`);
        }
        break;
      case 'BOOK_FINISHED':
        if (notification.actorUsername) {
          navigate(`/profile/${notification.actorUsername}`);
        }
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'FOLLOW': return '👤';
      case 'FOLLOW_REQUEST': return '🔒';
      case 'FOLLOW_ACCEPTED': return '✅';
      case 'LIKE_REVIEW': return '❤️';
      case 'COMMENT': return '💬';
      case 'COMMENT_REPLY': return '↩️';
      case 'MENTION': return '🏷️';
      case 'BOOK_FINISHED': return '📖';
      case 'BOOK_REVIEW': return '✍️';
      default: return '🔔';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        className="notification-bell__trigger"
        onClick={toggleDropdown}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-bell__badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-bell__dropdown">
          <div className="notification-bell__header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="notification-bell__mark-read"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-bell__list">
            {loading ? (
              <div className="notification-bell__empty">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-bell__empty">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-item__icon">
                    {notification.actorProfilePictureUrl ? (
                      <img
                        src={notification.actorProfilePictureUrl}
                        alt=""
                        className="notification-item__avatar"
                      />
                    ) : (
                      <span className="notification-item__type-icon">
                        {getNotificationIcon(notification.type)}
                      </span>
                    )}
                  </div>
                  <div className="notification-item__content">
                    <p className="notification-item__message">
                      {notification.message}
                    </p>
                    <span className="notification-item__time">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.isRead && (
                    <div className="notification-item__dot" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
