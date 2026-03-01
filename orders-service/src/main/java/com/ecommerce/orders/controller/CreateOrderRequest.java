package com.ecommerce.orders.controller;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateOrderRequest {
    private Integer userId;
    private BigDecimal totalAmount;
}