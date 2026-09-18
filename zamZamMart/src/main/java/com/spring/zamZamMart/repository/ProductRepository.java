package com.spring.zamZamMart.repository;

import com.spring.zamZamMart.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByIsDeletedFalse();
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByCategoryIdAndIsDeletedFalse(Long categoryId);
    List<Product> findByIsFeaturedTrue();
    List<Product> findByIsFeaturedTrueAndIsDeletedFalse();
    List<Product> findByIsHalalTrue();
    List<Product> findByIsHalalTrueAndIsDeletedFalse();

    @Query("SELECT p FROM Product p WHERE (p.isDeleted = false OR p.isDeleted IS NULL) AND (" +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Product> searchProducts(@Param("query") String query);
}

