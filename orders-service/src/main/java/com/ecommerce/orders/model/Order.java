package com.ecommerce.orders.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
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
}
