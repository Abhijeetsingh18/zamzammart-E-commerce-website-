package com.spring.zamZamMart.service;

import com.spring.zamZamMart.entity.Order;
import com.spring.zamZamMart.entity.OrderReturn;
import com.spring.zamZamMart.entity.User;
import com.spring.zamZamMart.exception.BadRequestException;
import com.spring.zamZamMart.exception.ResourceNotFoundException;
import com.spring.zamZamMart.repository.OrderRepository;
import com.spring.zamZamMart.repository.OrderReturnRepository;
import com.spring.zamZamMart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderReturnService {

    @Autowired
    private OrderReturnRepository orderReturnRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public OrderReturn requestReturn(Long orderId, String reason, String itemsDescription, String upiIdForRefund, String userEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        User user = null;
        if (userEmail != null) {
            user = userRepository.findByEmail(userEmail).orElse(null);
        }

        OrderReturn orderReturn = new OrderReturn(order, user, reason, itemsDescription, upiIdForRefund);
        return orderReturnRepository.save(orderReturn);
    }

    public List<OrderReturn> getUserReturns(String userEmail) {
        if (userEmail != null) {
            User u = userRepository.findByEmail(userEmail).orElse(null);
            if (u != null) {
                return orderReturnRepository.findByUserIdOrderByCreatedAtDesc(u.getId());
            }
        }
        return List.of();
    }

    public List<OrderReturn> getAllReturns() {
        return orderReturnRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public OrderReturn updateReturnStatus(Long returnId, String status, String adminNotes) {
        OrderReturn orderReturn = orderReturnRepository.findById(returnId)
                .orElseThrow(() -> new ResourceNotFoundException("Return request not found with id: " + returnId));

        orderReturn.setStatus(status.toUpperCase());
        if (adminNotes != null) {
            orderReturn.setAdminNotes(adminNotes);
        }
        orderReturn.setUpdatedAt(LocalDateTime.now());
        return orderReturnRepository.save(orderReturn);
    }
}
