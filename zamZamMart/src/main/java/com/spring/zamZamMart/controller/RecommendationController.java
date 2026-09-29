package com.spring.zamZamMart.controller;

import com.spring.zamZamMart.dto.ApiResponse;
import com.spring.zamZamMart.entity.Product;
import com.spring.zamZamMart.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @GetMapping("/similar/{productId}")
    public ResponseEntity<?> getSimilarProducts(@PathVariable Long productId) {
        List<Product> products = recommendationService.getSimilarProducts(productId);
        return ResponseEntity.ok(new ApiResponse(true, "Similar products retrieved", products));
    }

    @GetMapping("/frequently-bought/{productId}")
    public ResponseEntity<?> getFrequentlyBoughtTogether(@PathVariable Long productId) {
        List<Product> products = recommendationService.getFrequentlyBoughtTogether(productId);
        return ResponseEntity.ok(new ApiResponse(true, "Frequently bought together products retrieved", products));
    }
}
