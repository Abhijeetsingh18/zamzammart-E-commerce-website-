package com.spring.zamZamMart.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(precision = 10, scale = 2)
    private BigDecimal discountPrice;

    private String unit; // e.g. "1 kg", "500 g", "1 pack", "1 liter"
    private String weight; // e.g. "1 kg", "500 g", "2 L"
    private String brand; // e.g. "Daawat", "Fortune", "Amul", "ZamZam Fresh"
    private String sku; // e.g. "ZZM-APP-001"
    private LocalDate expiryDate;

    private Integer stockQuantity = 50;

    @Column(length = 1000)
    private String imageUrl;

    private Boolean isHalal = true;
    private Boolean isFeatured = false;
    private Double rating = 4.8;
    private Integer ratingCount = 24;
    private Boolean isDeleted = false;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Product() {}

    public Product(String name, String description, BigDecimal price, BigDecimal discountPrice,
                   String unit, Integer stockQuantity, String imageUrl, Boolean isHalal,
                   Boolean isFeatured, Double rating, Integer ratingCount, Category category) {
        this(name, description, price, discountPrice, unit, unit, "ZamZam Fresh",
                "ZZM-" + Math.abs((name != null ? name.hashCode() : 0) % 10000),
                LocalDate.now().plusMonths(6), stockQuantity, imageUrl, isHalal, isFeatured, rating, ratingCount, category);
    }

    public Product(String name, String description, BigDecimal price, BigDecimal discountPrice,
                   String unit, String weight, String brand, String sku, LocalDate expiryDate,
                   Integer stockQuantity, String imageUrl, Boolean isHalal,
                   Boolean isFeatured, Double rating, Integer ratingCount, Category category) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.discountPrice = discountPrice;
        this.unit = unit;
        this.weight = weight != null ? weight : unit;
        this.brand = brand != null ? brand : "ZamZam Fresh";
        this.sku = sku != null ? sku : "ZZM-" + Math.abs((name != null ? name.hashCode() : 0) % 10000);
        this.expiryDate = expiryDate != null ? expiryDate : LocalDate.now().plusMonths(6);
        this.stockQuantity = stockQuantity;
        this.imageUrl = imageUrl;
        this.isHalal = isHalal;
        this.isFeatured = isFeatured;
        this.rating = rating;
        this.ratingCount = ratingCount;
        this.category = category;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getDiscountPrice() { return discountPrice; }
    public void setDiscountPrice(BigDecimal discountPrice) { this.discountPrice = discountPrice; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getWeight() { return weight; }
    public void setWeight(String weight) { this.weight = weight; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Boolean getIsHalal() { return isHalal; }
    public void setIsHalal(Boolean isHalal) { this.isHalal = isHalal; }
    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getRatingCount() { return ratingCount; }
    public void setRatingCount(Integer ratingCount) { this.ratingCount = ratingCount; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }
}