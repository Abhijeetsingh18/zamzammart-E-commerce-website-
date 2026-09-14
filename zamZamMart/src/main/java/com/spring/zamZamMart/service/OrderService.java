package com.spring.zamZamMart.service;

import com.spring.zamZamMart.dto.OrderItemRequest;
import com.spring.zamZamMart.dto.OrderRequest;
import com.spring.zamZamMart.entity.Order;
import com.spring.zamZamMart.entity.OrderItem;
import com.spring.zamZamMart.entity.Product;
import com.spring.zamZamMart.entity.User;
import com.spring.zamZamMart.repository.OrderRepository;
import com.spring.zamZamMart.repository.ProductRepository;
import com.spring.zamZamMart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Transactional
    public Order createOrder(OrderRequest request, String userEmail) {
        Order order = new Order();
        order.setOrderNumber("ZZM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setCustomerName(request.getCustomerName());
        String effectiveEmail = (userEmail != null && !userEmail.trim().isEmpty()) 
                ? userEmail.trim() 
                : (request.getCustomerEmail() != null ? request.getCustomerEmail().trim() : null);
        order.setCustomerEmail(effectiveEmail);
        order.setPhone(request.getPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setCity(request.getCity());
        order.setPostalCode(request.getPostalCode());
        order.setDeliverySlot(request.getDeliverySlot() != null ? request.getDeliverySlot() : "Express 2-Hour");
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "COD");
        order.setPaymentStatus("COD".equalsIgnoreCase(request.getPaymentMethod()) ? "PENDING" : "PAID");
        order.setStatus("PENDING");
        order.setOrderDate(LocalDateTime.now());

        if (userEmail != null) {
            userRepository.findByEmail(userEmail).ifPresent(order::setUser);
        }

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemReq.getProductId()));

            BigDecimal price = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
            BigDecimal subtotal = price.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            total = total.add(subtotal);

            // Deduct stock
            if (product.getStockQuantity() >= itemReq.getQuantity()) {
                product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
                productRepository.save(product);
            }

            OrderItem orderItem = new OrderItem(order, product, itemReq.getQuantity(), price, subtotal);
            items.add(orderItem);
        }

        order.setItems(items);
        order.setTotalAmount(total);

        Order savedOrder = orderRepository.save(order);
        try {
            emailService.sendOrderConfirmationEmail(savedOrder);
        } catch (Exception e) {
            // Non-blocking email dispatch
        }

        return savedOrder;
    }

    public List<Order> getUserOrders(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            return orderRepository.findByUserIdOrderByOrderDateDesc(user.get().getId());
        }
        return new ArrayList<>();
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public Optional<Order> getOrderByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        order.setStatus(status.toUpperCase());
        if ("DELIVERED".equalsIgnoreCase(status)) {
            order.setPaymentStatus("PAID");
        }
        return orderRepository.save(order);
    }
}

