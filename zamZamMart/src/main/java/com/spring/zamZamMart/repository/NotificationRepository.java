package com.spring.zamZamMart.repository;

import com.spring.zamZamMart.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @Query("SELECT n FROM Notification n WHERE n.userEmail = :userEmail OR n.userEmail IS NULL ORDER BY n.createdAt DESC")
    List<Notification> findForUserOrBroadcast(@Param("userEmail") String userEmail);

    @Query("SELECT COUNT(n) FROM Notification n WHERE (n.userEmail = :userEmail OR n.userEmail IS NULL) AND n.isRead = false")
    long countUnreadForUserOrBroadcast(@Param("userEmail") String userEmail);
}
