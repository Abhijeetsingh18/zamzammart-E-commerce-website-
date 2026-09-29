package com.spring.zamZamMart.service;

import com.spring.zamZamMart.entity.InventoryTransaction;
import com.spring.zamZamMart.entity.Product;
import com.spring.zamZamMart.exception.BadRequestException;
import com.spring.zamZamMart.exception.ResourceNotFoundException;
import com.spring.zamZamMart.repository.InventoryTransactionRepository;
import com.spring.zamZamMart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class InventoryService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional
    public Product adjustStock(Long productId, Integer quantityChange, String reason, String adminEmail) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        int current = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        int updated = current + quantityChange;
        if (updated < 0) {
            throw new BadRequestException("Stock cannot be negative. Current stock is " + current);
        }

        product.setStockQuantity(updated);
        Product saved = productRepository.save(product);

        InventoryTransaction tx = new InventoryTransaction(
                saved,
                quantityChange,
                updated,
                quantityChange >= 0 ? "RESTOCK" : "ADJUSTMENT",
                reason != null ? reason : "Manual adjustment by admin"
        );
        inventoryTransactionRepository.save(tx);

        if (adminEmail != null) {
            auditLogService.logAction(adminEmail, "ADJUST_STOCK", "Product " + product.getName() + " changed by " + quantityChange + " to " + updated);
        }

        return saved;
    }

    public List<Product> getLowStockProducts(Integer threshold) {
        int th = threshold != null ? threshold : 15;
        return productRepository.findByStockQuantityLessThanEqualAndIsDeletedFalse(th);
    }

    public List<Product> getExpiringProducts(int days) {
        LocalDate limit = LocalDate.now().plusDays(days);
        return productRepository.findByExpiryDateBeforeAndIsDeletedFalse(limit);
    }

    @Transactional
    public void recordTransaction(Product product, Integer quantityChange, String type, String notes) {
        int current = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        InventoryTransaction tx = new InventoryTransaction(product, quantityChange, current, type, notes);
        inventoryTransactionRepository.save(tx);
    }

    public List<InventoryTransaction> getRecentTransactions() {
        return inventoryTransactionRepository.findTop50ByOrderByTimestampDesc();
    }
}
