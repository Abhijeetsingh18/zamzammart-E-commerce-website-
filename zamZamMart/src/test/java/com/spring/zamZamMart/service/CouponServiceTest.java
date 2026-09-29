package com.spring.zamZamMart.service;

import com.spring.zamZamMart.entity.Coupon;
import com.spring.zamZamMart.repository.CouponRepository;
import com.spring.zamZamMart.repository.CouponUsageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private CouponUsageRepository couponUsageRepository;

    @InjectMocks
    private CouponService couponService;

    private Coupon percentageCoupon;
    private Coupon fixedCoupon;

    @BeforeEach
    void setUp() {
        percentageCoupon = new Coupon(
                "ZAMZAM10", "10% off", "PERCENTAGE",
                new BigDecimal("10.00"), new BigDecimal("499.00"), new BigDecimal("150.00"),
                LocalDateTime.now().plusDays(30), 100
        );

        fixedCoupon = new Coupon(
                "FREESHIP", "Free delivery", "FIXED",
                new BigDecimal("40.00"), new BigDecimal("299.00"), new BigDecimal("40.00"),
                LocalDateTime.now().plusDays(30), 100
        );
    }

    @Test
    void testValidateCoupon_Percentage_Success() {
        when(couponRepository.findByCodeIgnoreCaseAndActiveTrue("ZAMZAM10"))
                .thenReturn(Optional.of(percentageCoupon));

        Map<String, Object> result = couponService.validateCoupon("ZAMZAM10", new BigDecimal("1000.00"), "test@user.com");

        assertTrue((Boolean) result.get("valid"));
        assertEquals(new BigDecimal("100.00"), result.get("discountAmount"));
    }

    @Test
    void testValidateCoupon_MaxDiscountCap() {
        when(couponRepository.findByCodeIgnoreCaseAndActiveTrue("ZAMZAM10"))
                .thenReturn(Optional.of(percentageCoupon));

        // 10% of 2000 is 200, but cap is 150
        Map<String, Object> result = couponService.validateCoupon("ZAMZAM10", new BigDecimal("2000.00"), "test@user.com");

        assertTrue((Boolean) result.get("valid"));
        assertEquals(new BigDecimal("150.00"), result.get("discountAmount"));
    }

    @Test
    void testValidateCoupon_BelowMinOrderAmount() {
        when(couponRepository.findByCodeIgnoreCaseAndActiveTrue("ZAMZAM10"))
                .thenReturn(Optional.of(percentageCoupon));

        Map<String, Object> result = couponService.validateCoupon("ZAMZAM10", new BigDecimal("300.00"), "test@user.com");

        assertFalse((Boolean) result.get("valid"));
        assertTrue(((String) result.get("message")).contains("Minimum order amount"));
    }

    @Test
    void testValidateCoupon_InvalidCode() {
        when(couponRepository.findByCodeIgnoreCaseAndActiveTrue("INVALID"))
                .thenReturn(Optional.empty());

        Map<String, Object> result = couponService.validateCoupon("INVALID", new BigDecimal("1000.00"), "test@user.com");

        assertFalse((Boolean) result.get("valid"));
        assertTrue(((String) result.get("message")).contains("Invalid or inactive"));
    }
}
