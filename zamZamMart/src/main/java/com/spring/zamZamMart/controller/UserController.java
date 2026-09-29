package com.spring.zamZamMart.controller;

import com.spring.zamZamMart.dto.ApiResponse;
import com.spring.zamZamMart.entity.Order;
import com.spring.zamZamMart.entity.User;
import com.spring.zamZamMart.exception.BadRequestException;
import com.spring.zamZamMart.exception.ResourceNotFoundException;
import com.spring.zamZamMart.repository.OrderRepository;
import com.spring.zamZamMart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/api/users/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Authentication required"));
        }
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authentication.getName()));

        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("name", user.getName());
        map.put("email", user.getEmail());
        map.put("phone", user.getPhone());
        map.put("address", user.getAddress());
        map.put("role", user.getRole());
        map.put("createdAt", user.getCreatedAt());

        return ResponseEntity.ok(new ApiResponse(true, "User profile retrieved", map));
    }

    @PutMapping("/api/users/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Authentication required"));
        }
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authentication.getName()));

        if (body.containsKey("name") && body.get("name") != null) {
            user.setName(body.get("name").trim());
        }
        if (body.containsKey("phone") && body.get("phone") != null) {
            user.setPhone(body.get("phone").trim());
        }
        if (body.containsKey("address") && body.get("address") != null) {
            user.setAddress(body.get("address").trim());
        }

        User updated = userRepository.save(user);

        Map<String, Object> map = new HashMap<>();
        map.put("id", updated.getId());
        map.put("name", updated.getName());
        map.put("email", updated.getEmail());
        map.put("phone", updated.getPhone());
        map.put("address", updated.getAddress());
        map.put("role", updated.getRole());

        return ResponseEntity.ok(new ApiResponse(true, "Profile updated successfully", map));
    }

    @PutMapping("/api/users/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Authentication required"));
        }
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authentication.getName()));

        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (currentPassword == null || !passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);

        return ResponseEntity.ok(new ApiResponse(true, "Password changed successfully"));
    }

    @GetMapping("/api/admin/customers")
    public ResponseEntity<?> getAllCustomers() {
        List<User> users = userRepository.findAll();
        List<Order> allOrders = orderRepository.findAll();

        List<Map<String, Object>> customerList = new ArrayList<>();
        for (User u : users) {
            List<Order> userOrders = allOrders.stream()
                    .filter(o -> (o.getUser() != null && Objects.equals(o.getUser().getId(), u.getId())) ||
                                 (o.getCustomerEmail() != null && o.getCustomerEmail().equalsIgnoreCase(u.getEmail())))
                    .toList();

            BigDecimal totalSpent = userOrders.stream()
                    .filter(o -> !"CANCELLED".equalsIgnoreCase(o.getStatus()))
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("phone", u.getPhone() != null ? u.getPhone() : "Not provided");
            map.put("address", u.getAddress() != null ? u.getAddress() : "Not provided");
            map.put("role", u.getRole());
            map.put("createdAt", u.getCreatedAt());
            map.put("orderCount", userOrders.size());
            map.put("totalSpent", totalSpent);

            customerList.add(map);
        }

        return ResponseEntity.ok(new ApiResponse(true, "Registered customers list", customerList));
    }
}
