package com.spring.zamZamMart.service;

import com.spring.zamZamMart.entity.Product;
import com.spring.zamZamMart.entity.Review;
import com.spring.zamZamMart.exception.BadRequestException;
import com.spring.zamZamMart.exception.ResourceNotFoundException;
import com.spring.zamZamMart.repository.ProductRepository;
import com.spring.zamZamMart.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Review> getReviewsForProduct(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    @Transactional
    public Review addReview(Long productId, Integer rating, String title, String comment, String authorName, String userEmail) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (rating == null || rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5 stars");
        }

        Review review = new Review();
        review.setProduct(product);
        review.setRating(rating);
        review.setTitle(title != null && !title.trim().isEmpty() ? title.trim() : "Verified Customer Review");
        review.setComment(comment != null ? comment.trim() : "");
        review.setAuthorName(authorName != null && !authorName.trim().isEmpty() ? authorName.trim() : "ZamZam Shopper");
        review.setVerifiedPurchase(true);

        Review saved = reviewRepository.save(review);

        try {
            Double avg = reviewRepository.calculateAverageRating(productId);
            long count = reviewRepository.countByProductId(productId);
            if (avg != null) {
                product.setRating(Math.round(avg * 10.0) / 10.0);
            }
            product.setRatingCount((int) count);
            productRepository.save(product);
        } catch (Exception ignored) {}

        return saved;
    }

    public void deleteReview(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("Review not found with id: " + id);
        }
        reviewRepository.deleteById(id);
    }
}
