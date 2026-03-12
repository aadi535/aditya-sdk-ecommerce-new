package com.ecommerce.orders.controller;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;
import com.ecommerce.orders.model.Order;
import com.ecommerce.orders.model.OrderStatus;
import com.ecommerce.orders.repository.OrderRepository;
import com.ecommerce.orders.repository.OrderStatusRepository;

import com.ecommerce.orders.controller.CreateOrderRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderStatusRepository orderStatusRepository;

 
    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @PutMapping("/orders/{id}/status")
public Order updateOrderStatus(@PathVariable Integer id, @RequestBody Map<String, Integer> body) {

    Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found"));

    Integer statusId = body.get("statusId");

    OrderStatus status = new OrderStatus();
    status.setId(statusId);

    order.setStatus(status);

    return orderRepository.save(order);
}
 
    @PostMapping("/orders")
    public Order createOrder(@RequestBody CreateOrderRequest request) {

        OrderStatus pendingStatus = orderStatusRepository
                .findByName("Pending")
                .orElseThrow(() -> new RuntimeException("Pending status not found"));

        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setTotalAmount(request.getTotalAmount());
        order.setStatus(pendingStatus);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    @GetMapping("/orders/user/{userId}")
public List<Order> getOrdersByUser(@PathVariable Integer userId) {
    return orderRepository.findAll()
            .stream()
            .filter(order -> order.getUserId().equals(userId))
            .toList();
}
}