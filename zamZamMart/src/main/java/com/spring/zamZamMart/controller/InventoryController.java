package com.spring.zamZamMart.controller;

import com.spring.zamZamMart.dto.ApiResponse;
import com.spring.zamZamMart.entity.InventoryTransaction;
import com.spring.zamZamMart.entity.Product;
import com.spring.zamZamMart.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/inventory")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @PostMapping("/adjust-stock")
    public ResponseEntity<?> adjustStock(@RequestBody Map<String, Object> body, Authentication authentication) {
        Long productId = body.get("productId") != null ? Long.valueOf(body.get("productId").toString()) : null;
        Integer change = body.get("quantityChange") != null ? Integer.valueOf(body.get("quantityChange").toString()) : 0;
        String reason = body.get("reason") != null ? body.get("reason").toString() : "Admin stock adjustment";
        String adminEmail = authentication != null ? authentication.getName() : "admin@zamzammart.com";

        if (productId == null) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "productId is required"));
        }

        Product updated = inventoryService.adjustStock(productId, change, reason, adminEmail);
        return ResponseEntity.ok(new ApiResponse(true, "Stock adjusted successfully", updated));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<?> getLowStock(@RequestParam(name = "threshold", defaultValue = "15") Integer threshold) {
        List<Product> list = inventoryService.getLowStockProducts(threshold);
        return ResponseEntity.ok(new ApiResponse(true, "Low stock products retrieved", list));
    }

    @GetMapping("/expiring")
    public ResponseEntity<?> getExpiring(@RequestParam(name = "days", defaultValue = "30") Integer days) {
        List<Product> list = inventoryService.getExpiringProducts(days);
        return ResponseEntity.ok(new ApiResponse(true, "Expiring soon products retrieved", list));
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions() {
        List<InventoryTransaction> list = inventoryService.getRecentTransactions();
        return ResponseEntity.ok(new ApiResponse(true, "Inventory transactions audit trail", list));
    }
}
