package com.spring.zamZamMart.controller;

import com.spring.zamZamMart.dto.ApiResponse;
import com.spring.zamZamMart.dto.ProductDTO;
import com.spring.zamZamMart.entity.AuditLog;
import com.spring.zamZamMart.entity.Order;
import com.spring.zamZamMart.entity.Product;
import com.spring.zamZamMart.service.AuditLogService;
import com.spring.zamZamMart.service.OrderService;
import com.spring.zamZamMart.service.ProductService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
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

    @Autowired
    private AuditLogService auditLogService;

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductDTO dto, Authentication authentication) {
        Product saved = productService.saveProduct(dto);
        String adminEmail = authentication != null ? authentication.getName() : "admin@zamzammart.com";
        auditLogService.logAction(adminEmail, "CREATE_PRODUCT", "Created product: " + saved.getName() + " (SKU: " + saved.getSku() + ")");
        return ResponseEntity.ok(new ApiResponse(true, "Product created successfully", saved));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductDTO dto, Authentication authentication) {
        dto.setId(id);
        Product updated = productService.saveProduct(dto);
        String adminEmail = authentication != null ? authentication.getName() : "admin@zamzammart.com";
        auditLogService.logAction(adminEmail, "UPDATE_PRODUCT", "Updated product ID " + id + ": " + updated.getName());
        return ResponseEntity.ok(new ApiResponse(true, "Product updated successfully", updated));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, Authentication authentication) {
        productService.deleteProduct(id);
        String adminEmail = authentication != null ? authentication.getName() : "admin@zamzammart.com";
        auditLogService.logAction(adminEmail, "DELETE_PRODUCT", "Deleted product ID: " + id);
        return ResponseEntity.ok(new ApiResponse(true, "Product deleted successfully"));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(new ApiResponse(true, "All orders retrieved", orders));
    }

    @PutMapping("/orders/{orderIdentifier}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderIdentifier, @RequestBody Map<String, String> body, Authentication authentication) {
        String status = body.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Status is required"));
        }
        Order updated = orderService.updateOrderStatus(orderIdentifier, status);
        String adminEmail = authentication != null ? authentication.getName() : "admin@zamzammart.com";
        auditLogService.logAction(adminEmail, "UPDATE_ORDER_STATUS", "Order " + orderIdentifier + " changed to " + status);
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

    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs() {
        List<AuditLog> logs = auditLogService.getAllAuditLogs();
        return ResponseEntity.ok(new ApiResponse(true, "Audit logs retrieved", logs));
    }

    @GetMapping("/export/orders.csv")
    public void exportOrdersCsv(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"zamzam_orders.csv\"");

        PrintWriter writer = response.getWriter();
        writer.println("OrderNumber,CustomerName,Email,Phone,City,Status,PaymentStatus,PaymentMethod,Subtotal,Discount,DeliveryFee,Total,Date");

        List<Order> orders = orderService.getAllOrders();
        for (Order o : orders) {
            String line = String.format("%s,%s,%s,%s,%s,%s,%s,%s,%.2f,%.2f,%.2f,%.2f,%s",
                    csvField(o.getOrderNumber()),
                    csvField(o.getCustomerName()),
                    csvField(o.getCustomerEmail()),
                    csvField(o.getPhone()),
                    csvField(o.getCity()),
                    csvField(o.getStatus()),
                    csvField(o.getPaymentStatus()),
                    csvField(o.getPaymentMethod()),
                    o.getSubtotal() != null ? o.getSubtotal() : BigDecimal.ZERO,
                    o.getDiscountAmount() != null ? o.getDiscountAmount() : BigDecimal.ZERO,
                    o.getDeliveryFee() != null ? o.getDeliveryFee() : BigDecimal.ZERO,
                    o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO,
                    o.getOrderDate() != null ? o.getOrderDate().toString() : ""
            );
            writer.println(line);
        }
        writer.flush();
    }

    @GetMapping("/export/inventory.csv")
    public void exportInventoryCsv(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"zamzam_inventory.csv\"");

        PrintWriter writer = response.getWriter();
        writer.println("ID,SKU,Name,Category,Brand,Price,DiscountPrice,StockQuantity,Unit,ExpiryDate,Halal,Featured");

        List<Product> products = productService.getAllProducts();
        for (Product p : products) {
            String line = String.format("%d,%s,%s,%s,%s,%.2f,%.2f,%d,%s,%s,%b,%b",
                    p.getId(),
                    csvField(p.getSku()),
                    csvField(p.getName()),
                    p.getCategory() != null ? csvField(p.getCategory().getName()) : "\"\"",
                    csvField(p.getBrand()),
                    p.getPrice() != null ? p.getPrice() : BigDecimal.ZERO,
                    p.getDiscountPrice() != null ? p.getDiscountPrice() : BigDecimal.ZERO,
                    p.getStockQuantity() != null ? p.getStockQuantity() : 0,
                    csvField(p.getUnit()),
                    p.getExpiryDate() != null ? p.getExpiryDate().toString() : "N/A",
                    Boolean.TRUE.equals(p.getIsHalal()),
                    Boolean.TRUE.equals(p.getIsFeatured())
            );
            writer.println(line);
        }
        writer.flush();
    }

    private String csvField(String val) {
        if (val == null) return "\"\"";
        return "\"" + val.replace("\"", "\"\"") + "\"";
    }
}