package com.spring.zamZamMart.service;

import com.spring.zamZamMart.dto.OrderItemRequest;
import com.spring.zamZamMart.dto.OrderRequest;
import com.spring.zamZamMart.entity.Order;
import com.spring.zamZamMart.entity.Product;
import com.spring.zamZamMart.exception.BadRequestException;
import com.spring.zamZamMart.repository.OrderRepository;
import com.spring.zamZamMart.repository.OrderStatusHistoryRepository;
import com.spring.zamZamMart.repository.ProductRepository;
import com.spring.zamZamMart.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private CouponService couponService;

    @Mock
    private InventoryService inventoryService;

    @Mock
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @InjectMocks
    private OrderService orderService;

    private Product product;
    private OrderRequest orderRequest;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setId(1L);
        product.setName("Organic Shimla Apples");
        product.setPrice(new BigDecimal("180.00"));
        product.setDiscountPrice(new BigDecimal("150.00"));
        product.setStockQuantity(10);

        OrderItemRequest itemReq = new OrderItemRequest();
        itemReq.setProductId(1L);
        itemReq.setQuantity(2);

        orderRequest = new OrderRequest();
        orderRequest.setCustomerName("Amina Rahman");
        orderRequest.setCustomerEmail("amina@example.com");
        orderRequest.setPhone("+91 98200 12345");
        orderRequest.setShippingAddress("Bandra West, Mumbai");
        orderRequest.setItems(List.of(itemReq));
    }

    @Test
    void testCreateOrder_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order order = orderService.createOrder(orderRequest, "amina@example.com");

        assertNotNull(order);
        assertNotNull(order.getOrderNumber());
        assertEquals("PENDING", order.getStatus());
        assertEquals(new BigDecimal("300.00"), order.getSubtotal()); // 2 * 150
        // Delivery fee added since subtotal < 499 and no FREESHIP coupon
        assertEquals(new BigDecimal("40.00"), order.getDeliveryFee());
        assertEquals(new BigDecimal("340.00"), order.getTotalAmount());
        assertEquals(8, product.getStockQuantity()); // 10 - 2
        verify(productRepository).save(product);
    }

    @Test
    void testCreateOrder_InsufficientStock() {
        product.setStockQuantity(1);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        assertThrows(BadRequestException.class, () -> {
            orderService.createOrder(orderRequest, "amina@example.com");
        });
    }

    @Test
    void testCancelOrder_RestocksInventory() {
        Order existingOrder = new Order();
        existingOrder.setId(10L);
        existingOrder.setOrderNumber("ZZM-TEST001");
        existingOrder.setStatus("PENDING");

        com.spring.zamZamMart.entity.OrderItem item = new com.spring.zamZamMart.entity.OrderItem(
                existingOrder, product, 3, new BigDecimal("150.00"), new BigDecimal("450.00")
        );
        existingOrder.setItems(List.of(item));

        when(orderRepository.findById(10L)).thenReturn(Optional.of(existingOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order cancelled = orderService.cancelOrder(10L, "Found better deal");

        assertEquals("CANCELLED", cancelled.getStatus());
        assertEquals("Found better deal", cancelled.getCancellationReason());
        assertEquals(13, product.getStockQuantity()); // 10 + 3 restocked
        verify(productRepository).save(product);
    }
}
