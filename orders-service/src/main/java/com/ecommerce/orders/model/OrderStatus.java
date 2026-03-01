package com.ecommerce.orders.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "order_statuses")
public class OrderStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;
}
