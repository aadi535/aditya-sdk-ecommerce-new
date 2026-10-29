package com.ecommerce.orders.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "\"userId\"", nullable = false)
    private Integer userId;

    @Column(name = "\"totalAmount\"", nullable = false)
    private BigDecimal totalAmount;

    @ManyToOne
    @JoinColumn(name = "\"statusId\"", nullable = false)
    private OrderStatus status;

    @Column(name = "\"createdAt\"", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "\"updatedAt\"", nullable = false)
    private LocalDateTime updatedAt;
    public Integer getId() { return id; }
    public void setId(Integer value) { this.id = value; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer value) { this.userId = value; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal value) { this.totalAmount = value; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus value) { this.status = value; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime value) { this.createdAt = value; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime value) { this.updatedAt = value; }
}
