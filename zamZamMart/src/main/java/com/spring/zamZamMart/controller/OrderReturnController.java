package com.spring.zamZamMart.controller;

import com.spring.zamZamMart.dto.ApiResponse;
import com.spring.zamZamMart.entity.OrderReturn;
import com.spring.zamZamMart.service.OrderReturnService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrderReturnController {

    @Autowired
    private OrderReturnService orderReturnService;

    @PostMapping("/api/returns/request")
    public ResponseEntity<?> requestReturn(@RequestBody Map<String, Object> body, Authentication authentication) {
        Long orderId = body.get("orderId") != null ? Long.valueOf(body.get("orderId").toString()) : null;
        if (orderId == null) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "orderId is required"));
        }
        String reason = body.get("reason") != null ? body.get("reason").toString() : "Not specified";
        String itemsDesc = body.get("itemsDescription") != null ? body.get("itemsDescription").toString() : "";
        String upiId = body.get("upiIdForRefund") != null ? body.get("upiIdForRefund").toString() : "";

        String userEmail = authentication != null ? authentication.getName() : null;
        if (userEmail == null && body.get("customerEmail") != null) {
            userEmail = body.get("customerEmail").toString();
        }

        OrderReturn created = orderReturnService.requestReturn(orderId, reason, itemsDesc, upiId, userEmail);
        return ResponseEntity.ok(new ApiResponse(true, "Doorstep return request registered successfully", created));
    }

    @GetMapping("/api/returns/my-returns")
    public ResponseEntity<?> getMyReturns(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok(new ApiResponse(true, "No authenticated user", List.of()));
        }
        List<OrderReturn> returns = orderReturnService.getUserReturns(authentication.getName());
        return ResponseEntity.ok(new ApiResponse(true, "User returns retrieved", returns));
    }

    @GetMapping("/api/admin/returns")
    public ResponseEntity<?> getAllReturns() {
        List<OrderReturn> returns = orderReturnService.getAllReturns();
        return ResponseEntity.ok(new ApiResponse(true, "All return requests retrieved", returns));
    }

    @PutMapping("/api/admin/returns/{id}/status")
    public ResponseEntity<?> updateReturnStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Status is required"));
        }
        String notes = body.get("adminNotes");
        OrderReturn updated = orderReturnService.updateReturnStatus(id, status, notes);
        return ResponseEntity.ok(new ApiResponse(true, "Return request updated to " + status, updated));
    }
}
