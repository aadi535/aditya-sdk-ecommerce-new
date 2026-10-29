package com.ecommerce.orders.controller;

import com.ecommerce.orders.model.Order;
import com.ecommerce.orders.model.OrderStatus;
import com.ecommerce.orders.repository.OrderRepository;
import com.ecommerce.orders.repository.OrderStatusRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
public class OrderController {
    private final OrderRepository orders;
    private final OrderStatusRepository statuses;
    private final JdbcTemplate db;
    private final RestClient users;

    public OrderController(OrderRepository orders, OrderStatusRepository statuses, JdbcTemplate db,
                           @Value("${users.api.url:http://localhost:8000}") String usersUrl) {
        this.orders = orders;
        this.statuses = statuses;
        this.db = db;
        var factory = new org.springframework.http.client.JdkClientHttpRequestFactory(
            java.net.http.HttpClient.newBuilder().connectTimeout(java.time.Duration.ofSeconds(10)).build());
        factory.setReadTimeout(java.time.Duration.ofSeconds(60));
        this.users = RestClient.builder().baseUrl(usersUrl).requestFactory(factory).build();
    }

    private Map<?,?> identity(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer "))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in");
        try {
            var user = users.get().uri("/me").header("Authorization", authorization).retrieve().body(Map.class);
            if (user == null || !(user.get("id") instanceof Number))
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid session");
            return user;
        } catch (RestClientResponseException e) {
            if (e.getStatusCode().value() == 401)
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session expired. Please log in again.");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Login service is starting. Please retry.");
        } catch (org.springframework.web.client.ResourceAccessException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Login service is starting. Please retry.");
        }
    }

    @GetMapping("/health")
    public Map<String,String> health() {
        db.queryForObject("SELECT 1", Integer.class);
        return Map.of("status", "ok");
    }

    @GetMapping("/orders")
    public List<Order> getOrders(@RequestHeader(value="Authorization", required=false) String authorization) {
        var user = identity(authorization);
        return "admin".equals(user.get("role")) ? orders.findAll() : orders.findByUserIdOrderByIdDesc(((Number)user.get("id")).intValue());
    }

    @GetMapping("/orders/user/{userId}")
    public List<Order> userOrders(@PathVariable Integer userId, @RequestHeader(value="Authorization", required=false) String authorization) {
        var user = identity(authorization);
        if (!"admin".equals(user.get("role")) && ((Number)user.get("id")).intValue() != userId)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return orders.findByUserIdOrderByIdDesc(userId);
    }

    @PostMapping("/orders")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Order createOrder(@RequestBody CreateOrderRequest request, @RequestHeader(value="Authorization", required=false) String authorization) {
        var user = identity(authorization);
        if (request.items() == null || request.items().isEmpty() || request.items().size() > 50)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Add between 1 and 50 items");
        // Lock products in a consistent order; calculate prices on the server.
        var quantities = new TreeMap<Integer,Integer>();
        for (var item : request.items()) {
            if (item.productId() == null || item.quantity() == null || item.quantity() < 1 || item.quantity() > 20)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid item quantity");
            quantities.merge(item.productId(), item.quantity(), Integer::sum);
        }
        BigDecimal total = BigDecimal.ZERO;
        var lines = new ArrayList<Map<String,Object>>();
        for (var item : quantities.entrySet()) {
            var matches = db.queryForList("SELECT id,name,price,stock FROM \"Product\" WHERE id=? FOR UPDATE", item.getKey());
            if (matches.isEmpty() || item.getValue() > 20 || ((Number)matches.get(0).get("stock")).intValue() < item.getValue())
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product unavailable or insufficient stock");
            var product = matches.get(0);
            var price = (BigDecimal)product.get("price");
            total = total.add(price.multiply(BigDecimal.valueOf(item.getValue())));
            lines.add(Map.of("id", item.getKey(), "name", product.get("name"), "price", price, "quantity", item.getValue()));
        }
        var order = new Order();
        order.setUserId(((Number)user.get("id")).intValue());
        order.setTotalAmount(total);
        order.setStatus(statuses.findByName("Pending").orElseThrow());
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        orders.saveAndFlush(order);
        for (var line : lines) {
            db.update("INSERT INTO order_items(order_id,product_id,name,quantity,price) VALUES(?,?,?,?,?)",
                order.getId(),line.get("id"),line.get("name"),line.get("quantity"),line.get("price"));
            db.update("UPDATE \"Product\" SET stock=stock-?,\"updatedAt\"=NOW() WHERE id=?",line.get("quantity"),line.get("id"));
        }
        return order;
    }

    @PutMapping("/orders/{id}/status")
    @Transactional
    public Order updateStatus(@PathVariable Integer id, @RequestBody Map<String,Integer> body,
                              @RequestHeader(value="Authorization", required=false) String authorization) {
        if (!"admin".equals(identity(authorization).get("role")))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        var order = orders.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        var target = body.get("statusId");
        var allowed = switch(order.getStatus().getName()) {
            case "Pending" -> Set.of(2,6);
            case "Confirmed" -> Set.of(5,6);
            default -> Set.<Integer>of();
        };
        if (target == null || !allowed.contains(target))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status transition");
        OrderStatus status = statuses.findById(target).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));
        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        return orders.save(order);
    }
}
