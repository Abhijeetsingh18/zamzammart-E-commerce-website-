package com.spring.zamZamMart.repository;

import com.spring.zamZamMart.entity.FlashSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface FlashSaleRepository extends JpaRepository<FlashSale, Long> {
    Optional<FlashSale> findFirstByActiveTrueAndEndTimeAfterOrderByEndTimeAsc(LocalDateTime now);
}
