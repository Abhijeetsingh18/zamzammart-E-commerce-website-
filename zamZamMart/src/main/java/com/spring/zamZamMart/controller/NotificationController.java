package com.spring.zamZamMart.controller;

import com.spring.zamZamMart.dto.ApiResponse;
import com.spring.zamZamMart.entity.Notification;
import com.spring.zamZamMart.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/api/notifications")
    public ResponseEntity<?> getNotifications(Authentication authentication, @RequestParam(required = false) String email) {
        String target = authentication != null ? authentication.getName() : email;
        List<Notification> list = notificationService.getUserNotifications(target);
        return ResponseEntity.ok(new ApiResponse(true, "Notifications retrieved", list));
    }

    @GetMapping("/api/notifications/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication, @RequestParam(required = false) String email) {
        String target = authentication != null ? authentication.getName() : email;
        long count = notificationService.getUnreadCount(target);
        return ResponseEntity.ok(new ApiResponse(true, "Unread count", Map.of("unreadCount", count)));
    }

    @PutMapping("/api/notifications/mark-read")
    public ResponseEntity<?> markRead(Authentication authentication, @RequestParam(required = false) String email) {
        String target = authentication != null ? authentication.getName() : email;
        notificationService.markAllAsRead(target);
        return ResponseEntity.ok(new ApiResponse(true, "All notifications marked as read"));
    }

    @PostMapping("/api/admin/notifications")
    public ResponseEntity<?> createNotification(@RequestBody Map<String, String> body) {
        String target = body.get("userEmail"); // null or blank = broadcast
        String title = body.get("title");
        String message = body.get("message");
        String type = body.get("type") != null ? body.get("type") : "INFO";

        Notification created = notificationService.createNotification(target, title, message, type);
        return ResponseEntity.ok(new ApiResponse(true, "Notification dispatched", created));
    }
}
