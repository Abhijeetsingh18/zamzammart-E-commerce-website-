package com.spring.zamZamMart.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_returns")
public class OrderReturn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String reason;

    private String itemsDescription;
    private String upiIdForRefund;
    private String status = "RETURN_REQUESTED"; // RETURN_REQUESTED, APPROVED, REJECTED, REFUNDED
    private String adminNotes;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public OrderReturn() {}

    public OrderReturn(Order order, User user, String reason, String itemsDescription, String upiIdForRefund) {
        this.order = order;
        this.user = user;
        this.reason = reason;
        this.itemsDescription = itemsDescription;
        this.upiIdForRefund = upiIdForRefund;
        this.status = "RETURN_REQUESTED";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getItemsDescription() { return itemsDescription; }
    public void setItemsDescription(String itemsDescription) { this.itemsDescription = itemsDescription; }
    public String getUpiIdForRefund() { return upiIdForRefund; }
    public void setUpiIdForRefund(String upiIdForRefund) { this.upiIdForRefund = upiIdForRefund; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; this.updatedAt = LocalDateTime.now(); }
    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
