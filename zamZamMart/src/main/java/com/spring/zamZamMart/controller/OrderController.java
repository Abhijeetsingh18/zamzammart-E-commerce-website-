package com.spring.zamZamMart.controller;

import com.spring.zamZamMart.dto.ApiResponse;
import com.spring.zamZamMart.dto.OrderRequest;
import com.spring.zamZamMart.entity.Order;
import com.spring.zamZamMart.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderRequest request, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            Order order = orderService.createOrder(request, userEmail);
            return ResponseEntity.ok(new ApiResponse(true, "Order placed successfully!", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Failed to place order: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        return ResponseEntity.ok(new ApiResponse(true, "All orders retrieved", orderService.getAllOrders()));
    }

    @PutMapping("/{orderIdentifier}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderIdentifier, @RequestBody java.util.Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Status is required"));
        }
        Order updated = orderService.updateOrderStatus(orderIdentifier, status);
        return ResponseEntity.ok(new ApiResponse(true, "Order status updated to " + status, updated));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Authentication required to view your orders"));
        }
        List<Order> orders = orderService.getUserOrders(authentication.getName());
        return ResponseEntity.ok(new ApiResponse(true, "Your orders", orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .<ResponseEntity<?>>map(order -> ResponseEntity.ok(new ApiResponse(true, "Order details", order)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/track/{orderNumber}")
    public ResponseEntity<?> trackOrderByNumber(@PathVariable String orderNumber) {
        return orderService.getOrderByOrderNumber(orderNumber)
                .<ResponseEntity<?>>map(order -> ResponseEntity.ok(new ApiResponse(true, "Order tracked successfully", order)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}

