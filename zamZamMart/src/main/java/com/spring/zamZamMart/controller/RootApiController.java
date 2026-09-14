package com.spring.zamZamMart.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
public class RootApiController {

    @GetMapping({"/", "/api", "/api/"})
    public ResponseEntity<?> getApiStatus() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("name", "ZamZam Mart REST API");
        response.put("status", "UP & RUNNING");
        response.put("version", "1.0.0");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("message", "Welcome to ZamZam Mart Backend API!");

        Map<String, String> endpoints = new LinkedHashMap<>();
        endpoints.put("allProducts", "http://localhost:8080/api/products");
        endpoints.put("featuredProducts", "http://localhost:8080/api/products/featured");
        endpoints.put("allCategories", "http://localhost:8080/api/categories");
        endpoints.put("searchExample", "http://localhost:8080/api/products/search?q=apple");
        endpoints.put("loginAuth", "POST http://localhost:8080/api/auth/login");
        endpoints.put("registerAuth", "POST http://localhost:8080/api/auth/register");
        endpoints.put("orders", "POST / GET http://localhost:8080/api/orders");
        endpoints.put("h2DatabaseConsole", "http://localhost:8080/h2-console");
        endpoints.put("frontendWebsite", "http://localhost:5173");

        response.put("availableEndpoints", endpoints);

        return ResponseEntity.ok(response);
    }
}

