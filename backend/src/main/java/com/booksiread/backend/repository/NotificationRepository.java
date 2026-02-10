package com.booksiread.backend.repository;

import com.booksiread.backend.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /** Get all notifications for a user, newest first */
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    /** Get unread notifications for a user */
    Page<Notification> findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    /** Count unread notifications */
    long countByRecipientIdAndIsReadFalse(Long recipientId);

    /** Mark all notifications as read for a user */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient.id = :userId AND n.isRead = false")
    void markAllAsRead(@Param("userId") Long userId);

    /** Mark a single notification as read */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :notificationId AND n.recipient.id = :userId")
    void markAsRead(@Param("notificationId") Long notificationId, @Param("userId") Long userId);

    /** Delete old read notifications (cleanup) */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.recipient.id = :userId AND n.isRead = true AND n.createdAt < :before")
    void deleteOldReadNotifications(@Param("userId") Long userId, @Param("before") java.time.LocalDateTime before);
}
