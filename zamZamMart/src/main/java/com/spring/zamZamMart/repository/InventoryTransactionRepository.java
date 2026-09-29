package com.spring.zamZamMart.repository;

import com.spring.zamZamMart.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findTop50ByOrderByTimestampDesc();
    List<InventoryTransaction> findByProductIdOrderByTimestampDesc(Long productId);
}
