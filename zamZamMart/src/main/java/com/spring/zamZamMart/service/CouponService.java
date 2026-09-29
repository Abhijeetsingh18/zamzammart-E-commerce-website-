package com.spring.zamZamMart.service;

import com.spring.zamZamMart.entity.Coupon;
import com.spring.zamZamMart.entity.CouponUsage;
import com.spring.zamZamMart.exception.BadRequestException;
import com.spring.zamZamMart.exception.ResourceNotFoundException;
import com.spring.zamZamMart.repository.CouponRepository;
import com.spring.zamZamMart.repository.CouponUsageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CouponUsageRepository couponUsageRepository;

    public Map<String, Object> validateCoupon(String code, BigDecimal orderAmount, String userEmail) {
        Map<String, Object> res = new HashMap<>();
        if (code == null || code.trim().isEmpty()) {
            res.put("valid", false);
            res.put("message", "Coupon code cannot be empty");
            res.put("discountAmount", BigDecimal.ZERO);
            return res;
        }

        String cleanCode = code.trim().toUpperCase();
        Coupon coupon = couponRepository.findByCodeIgnoreCaseAndActiveTrue(cleanCode)
                .orElse(null);

        if (coupon == null) {
            res.put("valid", false);
            res.put("message", "Invalid or inactive coupon code: " + cleanCode);
            res.put("discountAmount", BigDecimal.ZERO);
            return res;
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getValidFrom() != null && now.isBefore(coupon.getValidFrom())) {
            res.put("valid", false);
            res.put("message", "Coupon is not active yet");
            res.put("discountAmount", BigDecimal.ZERO);
            return res;
        }

        if (coupon.getValidUntil() != null && now.isAfter(coupon.getValidUntil())) {
            res.put("valid", false);
            res.put("message", "Coupon has expired");
            res.put("discountAmount", BigDecimal.ZERO);
            return res;
        }

        if (coupon.getUsageLimit() != null && coupon.getTimesUsed() != null && coupon.getTimesUsed() >= coupon.getUsageLimit()) {
            res.put("valid", false);
            res.put("message", "Coupon usage limit reached");
            res.put("discountAmount", BigDecimal.ZERO);
            return res;
        }

        if (coupon.getMinOrderAmount() != null && orderAmount != null && orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            res.put("valid", false);
            res.put("message", "Minimum order amount of ₹" + coupon.getMinOrderAmount() + " required");
            res.put("discountAmount", BigDecimal.ZERO);
            return res;
        }

        BigDecimal discount = BigDecimal.ZERO;
        if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = orderAmount.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else {
            discount = coupon.getDiscountValue();
            if (discount.compareTo(orderAmount) > 0) {
                discount = orderAmount;
            }
        }

        res.put("valid", true);
        res.put("code", coupon.getCode());
        res.put("discountType", coupon.getDiscountType());
        res.put("discountValue", coupon.getDiscountValue());
        res.put("discountAmount", discount);
        res.put("message", "Coupon applied successfully!");
        return res;
    }

    @Transactional
    public void recordCouponUsage(String code, String userEmail, Long orderId) {
        if (code == null || code.trim().isEmpty()) return;
        couponRepository.findByCodeIgnoreCase(code.trim()).ifPresent(c -> {
            c.setTimesUsed((c.getTimesUsed() != null ? c.getTimesUsed() : 0) + 1);
            couponRepository.save(c);

            CouponUsage usage = new CouponUsage(c, userEmail, orderId);
            couponUsageRepository.save(usage);
        });
    }

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        if (coupon.getCode() == null || coupon.getCode().trim().isEmpty()) {
            throw new BadRequestException("Coupon code is required");
        }
        String clean = coupon.getCode().trim().toUpperCase();
        if (couponRepository.existsByCodeIgnoreCase(clean)) {
            throw new BadRequestException("Coupon code already exists: " + clean);
        }
        coupon.setCode(clean);
        return couponRepository.save(coupon);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Coupon not found with id: " + id);
        }
        couponRepository.deleteById(id);
    }
}
