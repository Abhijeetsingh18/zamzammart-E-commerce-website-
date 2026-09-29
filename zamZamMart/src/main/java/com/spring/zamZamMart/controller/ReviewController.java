package com.spring.zamZamMart.controller;

import com.spring.zamZamMart.dto.ApiResponse;
import com.spring.zamZamMart.entity.Review;
import com.spring.zamZamMart.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/api/reviews/product/{productId}")
    public ResponseEntity<?> getProductReviews(@PathVariable Long productId) {
        List<Review> reviews = reviewService.getReviewsForProduct(productId);
        return ResponseEntity.ok(new ApiResponse(true, "Reviews retrieved successfully", reviews));
    }

    @PostMapping("/api/reviews")
    public ResponseEntity<?> addReview(@RequestBody Map<String, Object> body, Authentication authentication) {
        Long productId = body.get("productId") != null ? Long.valueOf(body.get("productId").toString()) : null;
        if (productId == null) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "productId is required"));
        }

        Integer rating = body.get("rating") != null ? Integer.valueOf(body.get("rating").toString()) : 5;
        String title = body.get("title") != null ? body.get("title").toString() : "Verified Customer Review";
        String comment = body.get("comment") != null ? body.get("comment").toString() : "";
        String authorName = body.get("authorName") != null ? body.get("authorName").toString() : "ZamZam Customer";

        String userEmail = authentication != null ? authentication.getName() : null;
        if (userEmail == null && body.get("customerEmail") != null) {
            userEmail = body.get("customerEmail").toString();
        }

        Review review = reviewService.addReview(productId, rating, title, comment, authorName, userEmail);
        return ResponseEntity.ok(new ApiResponse(true, "Review added and rating updated successfully", review));
    }

    @DeleteMapping({"/api/admin/reviews/{id}", "/api/reviews/{id}"})
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(new ApiResponse(true, "Review removed successfully"));
    }
}
