package com.spring.zamZamMart.service;

import com.spring.zamZamMart.dto.ProductDTO;
import com.spring.zamZamMart.entity.Category;
import com.spring.zamZamMart.entity.Product;
import com.spring.zamZamMart.repository.CategoryRepository;
import com.spring.zamZamMart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Product> getAllProducts() {
        return productRepository.findByIsDeletedFalse();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id).filter(p -> p.getIsDeleted() == null || !p.getIsDeleted());
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryIdAndIsDeletedFalse(categoryId);
    }

    public List<Product> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrueAndIsDeletedFalse();
    }

    public List<Product> searchProducts(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllProducts();
        }
        return productRepository.searchProducts(query.trim());
    }

    public List<Product> filterProducts(String search, Long categoryId, String brand, BigDecimal minPrice, BigDecimal maxPrice, Boolean isHalal, Boolean inStockOnly) {
        return productRepository.findAll(ProductSpecification.filter(search, categoryId, brand, minPrice, maxPrice, isHalal, inStockOnly));
    }

    public List<String> getDistinctBrands() {
        return productRepository.findDistinctBrands();
    }

    public Product saveProduct(ProductDTO dto) {
        Product product = new Product();
        if (dto.getId() != null) {
            product = productRepository.findById(dto.getId()).orElse(new Product());
        }

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setDiscountPrice(dto.getDiscountPrice());
        product.setUnit(dto.getUnit() != null ? dto.getUnit() : "1 kg");
        product.setWeight(dto.getWeight() != null ? dto.getWeight() : dto.getUnit());
        product.setBrand(dto.getBrand() != null ? dto.getBrand() : "ZamZam Fresh");
        product.setSku(dto.getSku() != null ? dto.getSku() : "ZZM-SKU-" + System.currentTimeMillis() % 100000);
        product.setExpiryDate(dto.getExpiryDate());
        product.setStockQuantity(dto.getStockQuantity() != null ? dto.getStockQuantity() : 50);
        product.setImageUrl(dto.getImageUrl());
        product.setIsHalal(dto.getIsHalal() != null ? dto.getIsHalal() : true);
        product.setIsFeatured(dto.getIsFeatured() != null ? dto.getIsFeatured() : false);
        product.setIsDeleted(false);

        if (dto.getRating() != null) {
            product.setRating(dto.getRating());
        } else if (product.getRating() == null) {
            product.setRating(4.8);
        }

        if (dto.getRatingCount() != null) {
            product.setRatingCount(dto.getRatingCount());
        } else if (product.getRatingCount() == null) {
            product.setRatingCount(20);
        }

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseGet(() -> categoryRepository.findAll().stream().findFirst().orElse(null));
            product.setCategory(category);
        }

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.findById(id).ifPresent(p -> {
            p.setIsDeleted(true);
            p.setStockQuantity(0);
            productRepository.save(p);
        });
    }
}
