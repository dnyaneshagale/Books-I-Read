import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, CheckCircle, Heart, MessageCircle, CornerDownRight, Tag, BookOpen, PenLine, Bell } from 'lucide-react';
import notificationApi from '../../api/notificationApi';

/**
 * NotificationBell - Bell icon with dropdown for notifications
 */
const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

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
    } catch { /* silently fail */ }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getNotifications(0, 15);
      setNotifications(res.data.content || []);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  };

  const toggleDropdown = () => {
    if (!isOpen) fetchNotifications();
    setIsOpen(!isOpen);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { /* silently fail */ }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await notificationApi.markAsRead(notification.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      } catch { /* silently fail */ }
    }

    setIsOpen(false);
    switch (notification.type) {
      case 'FOLLOW':
      case 'FOLLOW_ACCEPTED':
        navigate(`/profile/${notification.actorUsername}`);
        break;
      case 'FOLLOW_REQUEST':
        navigate('/profile');
        break;
      case 'BOOK_REVIEW':
      case 'COMMENT':
      case 'COMMENT_REPLY':
      case 'MENTION':
      case 'LIKE_REVIEW':
        if (notification.reflectionId) navigate(`/reflections/${notification.reflectionId}`);
        else if (notification.reviewId) navigate(`/reviews/${notification.reviewId}`);
        break;
      case 'BOOK_FINISHED':
        if (notification.actorUsername) navigate(`/profile/${notification.actorUsername}`);
        break;
      default: break;
    }
  };

  const getNotificationIcon = (type) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'FOLLOW': return <User className={iconClass} />;
      case 'FOLLOW_REQUEST': return <Lock className={iconClass} />;
      case 'FOLLOW_ACCEPTED': return <CheckCircle className={iconClass} />;
      case 'LIKE_REVIEW': return <Heart className={iconClass} fill="currentColor" />;
      case 'COMMENT': return <MessageCircle className={iconClass} />;
      case 'COMMENT_REPLY': return <CornerDownRight className={iconClass} />;
      case 'MENTION': return <Tag className={iconClass} />;
      case 'BOOK_FINISHED': return <BookOpen className={iconClass} />;
      case 'BOOK_REVIEW': return <PenLine className={iconClass} />;
      default: return <Bell className={iconClass} />;
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
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      <button
        className="bg-transparent border-none cursor-pointer text-[1.3rem] py-1.5 px-2 rounded-lg transition-colors duration-200 relative text-inherit hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
        onClick={toggleDropdown}
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] rounded-[9px] bg-red-500 text-white text-[0.7rem] font-bold flex items-center justify-center px-1 leading-none pointer-events-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-[360px] max-h-[480px] bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15),0_2px_10px_rgba(0,0,0,0.08)] overflow-hidden z-[1000] animate-fade-in-up dark:bg-[#1e1e2e] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4),0_2px_10px_rgba(0,0,0,0.2)] max-[480px]:fixed max-[480px]:top-[60px] max-[480px]:left-2 max-[480px]:right-2 max-[480px]:w-auto max-[480px]:max-h-[70vh]">
          <div className="flex justify-between items-center py-3.5 px-4 border-b border-gray-200 dark:border-[#2d2d3f]">
            <h3 className="m-0 text-base font-bold text-gray-900 dark:text-gray-200">Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="bg-transparent border-none text-indigo-500 cursor-pointer text-[0.8rem] font-semibold py-1 px-2 rounded-md transition-colors duration-150 hover:bg-indigo-500/[0.08] dark:text-indigo-400 dark:hover:bg-indigo-400/[0.12]"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-[400px]">
            {loading ? (
              <div className="py-8 px-4 text-center text-gray-400 text-[0.9rem] dark:text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 px-4 text-center text-gray-400 text-[0.9rem] dark:text-gray-500">No notifications yet</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start py-3 px-4 gap-3 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 dark:border-b-[#2a2a3a] dark:hover:bg-[#252537] ${!notification.isRead ? 'bg-blue-50 dark:bg-[#1a1a2e]' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 overflow-hidden dark:bg-[#2d2d3f]">
                    {notification.actorProfilePictureUrl ? (
                      <img src={notification.actorProfilePictureUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span className="text-[1.1rem]">{getNotificationIcon(notification.type)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-[0.85rem] text-gray-700 leading-snug break-words dark:text-gray-300">
                      {notification.message}
                    </p>
                    <span className="text-xs text-gray-400 mt-0.5 inline-block dark:text-gray-500">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.isRead && (
                    <div className="shrink-0 w-2 h-2 rounded-full bg-indigo-500 mt-1.5" />
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
