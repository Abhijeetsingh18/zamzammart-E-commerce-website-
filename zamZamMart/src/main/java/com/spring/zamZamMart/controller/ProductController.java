package com.spring.zamZamMart.controller;

import com.spring.zamZamMart.dto.ApiResponse;
import com.spring.zamZamMart.entity.Product;
import com.spring.zamZamMart.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(new ApiResponse(true, "Products retrieved successfully", products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .<ResponseEntity<?>>map(product -> ResponseEntity.ok(new ApiResponse(true, "Product found", product)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getProductsByCategory(@PathVariable Long categoryId) {
        List<Product> products = productService.getProductsByCategory(categoryId);
        return ResponseEntity.ok(new ApiResponse(true, "Products by category retrieved", products));
    }

    @GetMapping("/featured")
    public ResponseEntity<?> getFeaturedProducts() {
        List<Product> products = productService.getFeaturedProducts();
        return ResponseEntity.ok(new ApiResponse(true, "Featured products retrieved", products));
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(@RequestParam(name = "q", defaultValue = "") String query) {
        List<Product> products = productService.searchProducts(query);
        return ResponseEntity.ok(new ApiResponse(true, "Search results", products));
    }
}

