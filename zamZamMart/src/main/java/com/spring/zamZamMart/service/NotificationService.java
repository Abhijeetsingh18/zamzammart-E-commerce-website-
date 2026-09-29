package com.spring.zamZamMart.service;

import com.spring.zamZamMart.entity.Notification;
import com.spring.zamZamMart.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getUserNotifications(String userEmail) {
        return notificationRepository.findForUserOrBroadcast(userEmail);
    }

    public long getUnreadCount(String userEmail) {
        return notificationRepository.countUnreadForUserOrBroadcast(userEmail);
    }

    @Transactional
    public void markAllAsRead(String userEmail) {
        List<Notification> list = notificationRepository.findForUserOrBroadcast(userEmail);
        for (Notification n : list) {
            if (!Boolean.TRUE.equals(n.getIsRead())) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        }
    }

    @Transactional
    public Notification createNotification(String userEmail, String title, String message, String type) {
        Notification n = new Notification(userEmail, title, message, type);
        return notificationRepository.save(n);
    }
}
