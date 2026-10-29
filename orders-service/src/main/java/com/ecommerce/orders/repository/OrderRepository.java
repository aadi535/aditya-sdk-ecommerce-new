package com.ecommerce.orders.repository;
import com.ecommerce.orders.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUserIdOrderByIdDesc(Integer userId);
}
