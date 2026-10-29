package com.ecommerce.orders.controller;

import java.util.List;

public record CreateOrderRequest(List<Item> items) {
    public record Item(Integer productId, Integer quantity) {}
}
