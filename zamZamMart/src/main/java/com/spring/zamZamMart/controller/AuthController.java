package com.spring.zamZamMart.controller;

import com.spring.zamZamMart.dto.ApiResponse;
import com.spring.zamZamMart.dto.AuthRequest;
import com.spring.zamZamMart.dto.AuthResponse;
import com.spring.zamZamMart.dto.ForgotPasswordRequest;
import com.spring.zamZamMart.dto.RegisterRequest;
import com.spring.zamZamMart.dto.ResetPasswordRequest;
import com.spring.zamZamMart.entity.User;
import com.spring.zamZamMart.service.AuthService;
import com.spring.zamZamMart.service.EmailService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(new ApiResponse(true, "User registered successfully!", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(new ApiResponse(true, "Login successful!", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid email or password."));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody java.util.Map<String, String> payload) {
        try {
            String email = payload.get("email");
            String name = payload.get("name");
            AuthResponse response = authService.loginOrRegisterGoogle(email, name);
            return ResponseEntity.ok(new ApiResponse(true, "Gmail login successful!", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest httpRequest) {
        try {
            String origin = httpRequest.getHeader("Origin");
            if (origin == null || origin.trim().isEmpty()) {
                origin = httpRequest.getHeader("Referer");
            }
            java.util.Map<String, Object> result = authService.processForgotPassword(request.getEmail(), origin);
            return ResponseEntity.ok(new ApiResponse(true, (String) result.get("message"), result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            java.util.Map<String, Object> result = authService.processResetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(new ApiResponse(true, (String) result.get("message"), result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/recent-emails")
    public ResponseEntity<?> getRecentEmails(@RequestParam(required = false) String email) {
        return ResponseEntity.ok(new ApiResponse(true, "Recent generated emails", emailService.getRecentEmails(email)));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Not authenticated"));
        }

        return authService.getUserByEmail(authentication.getName())
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(new ApiResponse(true, "Current user fetched", user)))
                .orElseGet(() -> ResponseEntity.badRequest().body(new ApiResponse(false, "User not found")));
    }
}

