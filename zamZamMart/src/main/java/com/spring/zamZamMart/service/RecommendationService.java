package com.spring.zamZamMart.service;

import com.spring.zamZamMart.entity.Product;
import com.spring.zamZamMart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecommendationService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getSimilarProducts(Long productId) {
        Product p = productRepository.findById(productId).orElse(null);
        if (p == null || p.getCategory() == null) {
            return productRepository.findByIsFeaturedTrueAndIsDeletedFalse();
        }
        return productRepository.findByCategoryIdAndIdNot(p.getCategory().getId(), productId);
    }

    public List<Product> getFrequentlyBoughtTogether(Long productId) {
        Product p = productRepository.findById(productId).orElse(null);
        if (p != null && p.getCategory() != null) {
            return productRepository.findByCategoryIdNot(p.getCategory().getId()).stream().limit(4).toList();
        }
        return productRepository.findByIsFeaturedTrueAndIsDeletedFalse().stream().limit(4).toList();
    }
}
