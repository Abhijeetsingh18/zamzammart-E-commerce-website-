package com.spring.zamZamMart.service;

import com.spring.zamZamMart.dto.OrderItemRequest;
import com.spring.zamZamMart.dto.OrderRequest;
import com.spring.zamZamMart.entity.*;
import com.spring.zamZamMart.exception.BadRequestException;
import com.spring.zamZamMart.exception.ResourceNotFoundException;
import com.spring.zamZamMart.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

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

    @Autowired
    private CouponService couponService;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Transactional
    public Order createOrder(OrderRequest request, String userEmail) {
        String effectiveEmail = userEmail != null ? userEmail : request.getCustomerEmail();
        User user = null;
        if (effectiveEmail != null) {
            user = userRepository.findByEmail(effectiveEmail).orElse(null);
        }

        String orderNumber = "ZZM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setUser(user);
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(effectiveEmail);
        order.setPhone(request.getPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setCity(request.getCity() != null ? request.getCity() : "Mumbai");
        order.setPostalCode(request.getPostalCode() != null ? request.getPostalCode() : "400001");
        order.setDeliverySlot(request.getDeliverySlot() != null ? request.getDeliverySlot() : "Morning (8 AM - 12 PM)");
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "COD");
        order.setPaymentStatus("COD".equalsIgnoreCase(request.getPaymentMethod()) ? "PENDING" : "PAID");
        order.setStatus("PENDING");
        order.setOrderDate(LocalDateTime.now());

        BigDecimal subtotalSum = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemReq.getProductId()));

            if (product.getStockQuantity() == null || product.getStockQuantity() < itemReq.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName() +
                        ". Available: " + (product.getStockQuantity() != null ? product.getStockQuantity() : 0));
            }

            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);

            if (inventoryService != null) {
                inventoryService.recordTransaction(product, -itemReq.getQuantity(), "ORDER_DEDUCTION", "Deducted for Order " + orderNumber);
            }

            BigDecimal unitPrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
            BigDecimal itemSubtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotalSum = subtotalSum.add(itemSubtotal);

            OrderItem orderItem = new OrderItem(order, product, itemReq.getQuantity(), unitPrice);
            items.add(orderItem);
        }

        order.setItems(items);
        order.setSubtotal(subtotalSum);

        BigDecimal discountAmount = BigDecimal.ZERO;
        String couponCode = request.getCouponCode();
        if (couponCode != null && !couponCode.trim().isEmpty() && couponService != null) {
            try {
                Map<String, Object> cRes = couponService.validateCoupon(couponCode, subtotalSum, effectiveEmail);
                if (Boolean.TRUE.equals(cRes.get("valid"))) {
                    discountAmount = (BigDecimal) cRes.get("discountAmount");
                    order.setCouponCode(couponCode.trim().toUpperCase());
                    order.setDiscountAmount(discountAmount);
                    couponService.recordCouponUsage(couponCode, effectiveEmail, null);
                }
            } catch (Exception ignored) {}
        }

        BigDecimal deliveryFee = BigDecimal.ZERO;
        if (subtotalSum.compareTo(new BigDecimal("499.00")) < 0 && !"FREESHIP".equalsIgnoreCase(order.getCouponCode())) {
            deliveryFee = new BigDecimal("40.00");
        }
        order.setDeliveryFee(deliveryFee);

        BigDecimal total = subtotalSum.subtract(discountAmount != null ? discountAmount : BigDecimal.ZERO)
                .max(BigDecimal.ZERO)
                .add(deliveryFee);
        order.setTotalAmount(total);

        Order savedOrder = orderRepository.save(order);

        if (orderStatusHistoryRepository != null) {
            try {
                OrderStatusHistory hist = new OrderStatusHistory(savedOrder, "PENDING", "Order received and confirmed in store");
                orderStatusHistoryRepository.save(hist);
            } catch (Exception ignored) {}
        }

        try {
            emailService.sendOrderConfirmationEmail(savedOrder);
        } catch (Exception ignored) {}

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
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return applyStatusChange(order, status);
    }

    public Order updateOrderStatus(String orderIdentifier, String status) {
        Order order = null;
        try {
            Long id = Long.parseLong(orderIdentifier);
            order = orderRepository.findById(id).orElse(null);
        } catch (NumberFormatException ignored) {}

        if (order == null) {
            order = orderRepository.findByOrderNumber(orderIdentifier)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found with identifier: " + orderIdentifier));
        }
        return applyStatusChange(order, status);
    }

    private Order applyStatusChange(Order order, String status) {
        String clean = status.toUpperCase();
        order.setStatus(clean);
        if ("DELIVERED".equalsIgnoreCase(clean)) {
            order.setPaymentStatus("PAID");
        }
        Order saved = orderRepository.save(order);

        if (orderStatusHistoryRepository != null) {
            try {
                OrderStatusHistory hist = new OrderStatusHistory(saved, clean, "Status updated to " + clean);
                orderStatusHistoryRepository.save(hist);
            } catch (Exception ignored) {}
        }

        return saved;
    }

    @Transactional
    public Order cancelOrder(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if ("DELIVERED".equalsIgnoreCase(order.getStatus()) || "CANCELLED".equalsIgnoreCase(order.getStatus())) {
            throw new BadRequestException("Cannot cancel order with status: " + order.getStatus());
        }

        order.setStatus("CANCELLED");
        order.setCancellationReason(reason != null ? reason : "Cancelled by customer");

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Product p = item.getProduct();
                if (p != null) {
                    p.setStockQuantity((p.getStockQuantity() != null ? p.getStockQuantity() : 0) + item.getQuantity());
                    productRepository.save(p);
                    if (inventoryService != null) {
                        inventoryService.recordTransaction(p, item.getQuantity(), "RETURN", "Stock returned due to cancellation of Order " + order.getOrderNumber());
                    }
                }
            }
        }

        Order saved = orderRepository.save(order);

        if (orderStatusHistoryRepository != null) {
            try {
                OrderStatusHistory hist = new OrderStatusHistory(saved, "CANCELLED", "Order cancelled: " + order.getCancellationReason());
                orderStatusHistoryRepository.save(hist);
            } catch (Exception ignored) {}
        }

        return saved;
    }
}
