package com.spring.zamZamMart.repository;

import com.spring.zamZamMart.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {
    long countByCouponId(Long couponId);
    long countByCouponIdAndUserEmailIgnoreCase(Long couponId, String userEmail);
    List<CouponUsage> findByCouponId(Long couponId);
}
