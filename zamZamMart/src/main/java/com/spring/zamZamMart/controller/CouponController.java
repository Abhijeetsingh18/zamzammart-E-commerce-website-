package com.spring.zamZamMart.controller;

import com.spring.zamZamMart.dto.ApiResponse;
import com.spring.zamZamMart.entity.Coupon;
import com.spring.zamZamMart.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
public class CouponController {

    @Autowired
    private CouponService couponService;

    @PostMapping("/api/coupons/validate")
    public ResponseEntity<?> validateCoupon(@RequestBody Map<String, Object> body, Authentication authentication) {
        String code = body.get("code") != null ? body.get("code").toString() : "";
        BigDecimal amount = BigDecimal.ZERO;
        if (body.get("orderAmount") != null) {
            try {
                amount = new BigDecimal(body.get("orderAmount").toString());
            } catch (Exception ignored) {}
        }
        String email = authentication != null ? authentication.getName() : null;
        if (email == null && body.get("userEmail") != null) {
            email = body.get("userEmail").toString();
        }

        Map<String, Object> res = couponService.validateCoupon(code, amount, email);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/api/admin/coupons")
    public ResponseEntity<?> getAllCoupons() {
        List<Coupon> list = couponService.getAllCoupons();
        return ResponseEntity.ok(new ApiResponse(true, "All coupons retrieved", list));
    }

    @PostMapping("/api/admin/coupons")
    public ResponseEntity<?> createCoupon(@RequestBody Coupon coupon) {
        Coupon created = couponService.createCoupon(coupon);
        return ResponseEntity.ok(new ApiResponse(true, "Coupon created successfully", created));
    }

    @DeleteMapping("/api/admin/coupons/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(new ApiResponse(true, "Coupon deleted successfully"));
    }
}
