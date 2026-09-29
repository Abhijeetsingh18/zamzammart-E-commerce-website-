package com.spring.zamZamMart.controller;

import com.spring.zamZamMart.dto.ApiResponse;
import com.spring.zamZamMart.dto.ProductDTO;
import com.spring.zamZamMart.entity.Product;
import com.spring.zamZamMart.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<?> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean isHalal,
            @RequestParam(required = false) Boolean inStockOnly
    ) {
        List<Product> products;
        if (search != null || category != null || brand != null || minPrice != null || maxPrice != null || isHalal != null || inStockOnly != null) {
            products = productService.filterProducts(search, category, brand, minPrice, maxPrice, isHalal, inStockOnly);
        } else {
            products = productService.getAllProducts();
        }
        return ResponseEntity.ok(new ApiResponse(true, "Products retrieved successfully", products));
    }

    @GetMapping("/brands")
    public ResponseEntity<?> getBrands() {
        return ResponseEntity.ok(new ApiResponse(true, "Distinct product brands", productService.getDistinctBrands()));
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

    @PostMapping
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductDTO dto) {
        Product saved = productService.saveProduct(dto);
        return ResponseEntity.ok(new ApiResponse(true, "Product created successfully", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductDTO dto) {
        dto.setId(id);
        Product updated = productService.saveProduct(dto);
        return ResponseEntity.ok(new ApiResponse(true, "Product updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(new ApiResponse(true, "Product deleted successfully"));
    }
}
