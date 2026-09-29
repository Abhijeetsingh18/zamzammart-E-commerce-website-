package com.spring.zamZamMart.repository;

import com.spring.zamZamMart.entity.OrderReturn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderReturnRepository extends JpaRepository<OrderReturn, Long> {
    List<OrderReturn> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<OrderReturn> findAllByOrderByCreatedAtDesc();
}
