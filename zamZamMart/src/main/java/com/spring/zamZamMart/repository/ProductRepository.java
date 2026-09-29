package com.spring.zamZamMart.repository;

import com.spring.zamZamMart.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    List<Product> findByIsDeletedFalse();
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByCategoryIdAndIsDeletedFalse(Long categoryId);
    List<Product> findByCategoryIdAndIdNot(Long categoryId, Long id);
    List<Product> findByCategoryIdNot(Long categoryId);
    List<Product> findByIsFeaturedTrue();
    List<Product> findByIsFeaturedTrueAndIsDeletedFalse();
    List<Product> findByIsHalalTrue();
    List<Product> findByIsHalalTrueAndIsDeletedFalse();
    List<Product> findByStockQuantityLessThanEqualAndIsDeletedFalse(Integer threshold);
    List<Product> findByExpiryDateBeforeAndIsDeletedFalse(LocalDate date);

    @Query("SELECT DISTINCT p.brand FROM Product p WHERE p.brand IS NOT NULL AND p.brand <> '' AND (p.isDeleted = false OR p.isDeleted IS NULL)")
    List<String> findDistinctBrands();

    @Query("SELECT p FROM Product p WHERE (p.isDeleted = false OR p.isDeleted IS NULL) AND (" +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Product> searchProducts(@Param("query") String query);
}
