package com.spring.zamZamMart.controller;

import com.spring.zamZamMart.dto.ApiResponse;
import com.spring.zamZamMart.dto.PaymentOrderRequest;
import com.spring.zamZamMart.dto.PaymentOrderResponse;
import com.spring.zamZamMart.dto.PaymentVerificationRequest;
import com.spring.zamZamMart.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Value("${razorpay.key.id:rzp_test_zamzam12345678}")
    private String razorpayKeyId;

    @Value("${merchant.upi.id:zamzammart@okaxis}")
    private String merchantUpiId;

    @Value("${merchant.upi.name:ZamZam Mart}")
    private String merchantUpiName;

    @PostMapping("/create-order")
    public ResponseEntity<?> createPaymentOrder(@RequestBody PaymentOrderRequest request) {
        try {
            PaymentOrderResponse response = paymentService.createPaymentOrder(request);
            return ResponseEntity.ok(new ApiResponse(true, "Payment order created", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Failed to create payment order: " + e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationRequest request) {
        boolean verified = paymentService.verifyPayment(request);
        if (verified) {
            return ResponseEntity.ok(new ApiResponse(true, "Payment verified successfully!"));
        } else {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Payment verification failed. Invalid signature."));
        }
    }

    @GetMapping("/config")
    public ResponseEntity<?> getPaymentConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("razorpayKeyId", razorpayKeyId);
        config.put("merchantUpiId", merchantUpiId);
        config.put("merchantUpiName", merchantUpiName);
        return ResponseEntity.ok(new ApiResponse(true, "Payment configuration", config));
    }
}

