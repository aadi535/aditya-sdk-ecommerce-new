package com.ecommerce.orders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${ALLOWED_ORIGINS:http://localhost:5173}") private String origins;
    @Override public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**").allowedOrigins(origins.split(",")).allowedMethods("GET","POST","PUT","OPTIONS").allowedHeaders("Authorization","Content-Type");
    }
}
