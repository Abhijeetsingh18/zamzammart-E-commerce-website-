package com.spring.zamZamMart.controller;

import com.spring.zamZamMart.dto.ApiResponse;
import com.spring.zamZamMart.dto.ProductDTO;
import com.spring.zamZamMart.entity.Order;
import com.spring.zamZamMart.entity.Product;
import com.spring.zamZamMart.service.OrderService;
import com.spring.zamZamMart.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductDTO dto) {
        Product saved = productService.saveProduct(dto);
        return ResponseEntity.ok(new ApiResponse(true, "Product created successfully", saved));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductDTO dto) {
        dto.setId(id);
        Product updated = productService.saveProduct(dto);
        return ResponseEntity.ok(new ApiResponse(true, "Product updated successfully", updated));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(new ApiResponse(true, "Product deleted successfully"));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(new ApiResponse(true, "All orders retrieved", orders));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Status is required"));
        }
        Order updated = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(new ApiResponse(true, "Order status updated to " + status, updated));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        List<Order> orders = orderService.getAllOrders();
        List<Product> products = productService.getAllProducts();

        BigDecimal totalRevenue = orders.stream()
                .filter(o -> !"CANCELLED".equalsIgnoreCase(o.getStatus()))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingOrders = orders.stream()
                .filter(o -> "PENDING".equalsIgnoreCase(o.getStatus()))
                .count();

        long lowStockCount = products.stream()
                .filter(p -> p.getStockQuantity() <= 10)
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalOrders", orders.size());
        stats.put("pendingOrders", pendingOrders);
        stats.put("totalProducts", products.size());
        stats.put("lowStockCount", lowStockCount);

        return ResponseEntity.ok(new ApiResponse(true, "Dashboard stats", stats));
    }
}

