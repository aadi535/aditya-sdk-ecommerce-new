package com.ecommerce.orders.model;

import jakarta.persistence.*;


@Entity
@Table(name = "order_statuses")
public class OrderStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;
    public Integer getId() { return id; }
    public void setId(Integer value) { this.id = value; }
    public String getName() { return name; }
    public void setName(String value) { this.name = value; }
}
