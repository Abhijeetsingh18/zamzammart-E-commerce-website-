package com.spring.zamZamMart.service;

import com.spring.zamZamMart.dto.AuthRequest;
import com.spring.zamZamMart.dto.AuthResponse;
import com.spring.zamZamMart.dto.RegisterRequest;
import com.spring.zamZamMart.entity.Role;
import com.spring.zamZamMart.entity.User;
import com.spring.zamZamMart.repository.UserRepository;
import com.spring.zamZamMart.util.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered: " + request.getEmail());
        }

        User user = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getPhone(),
                request.getAddress(),
                Role.ROLE_CUSTOMER
        );

        User savedUser = userRepository.save(user);

        // Send welcoming greeting email from admin to new customer
        try {
            emailService.sendWelcomeGreetingEmail(savedUser.getEmail(), savedUser.getName());
            savedUser.setWelcomed(true);
            userRepository.save(savedUser);
        } catch (Exception e) {
            logger.warn("Could not dispatch welcome email on registration: {}", e.getMessage());
        }

        String token = jwtUtils.generateToken(savedUser.getEmail(), savedUser.getRole().name());

        return new AuthResponse(token, savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole());
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

        // Send welcoming greeting email if customer hasn't received one yet
        if (!user.isWelcomed() && user.getRole() == Role.ROLE_CUSTOMER) {
            try {
                emailService.sendWelcomeGreetingEmail(user.getEmail(), user.getName());
                user.setWelcomed(true);
                userRepository.save(user);
            } catch (Exception e) {
                logger.warn("Could not dispatch welcome email on login: {}", e.getMessage());
            }
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    public AuthResponse loginOrRegisterGoogle(String email, String name) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Gmail address is required");
        }
        String cleanEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail).orElseGet(() -> {
            String userName = (name != null && !name.trim().isEmpty()) 
                    ? name.trim() 
                    : cleanEmail.split("@")[0];
            Role role = cleanEmail.equalsIgnoreCase("zamzammart08@gmail.com") ? Role.ROLE_ADMIN : Role.ROLE_CUSTOMER;
            User newUser = new User(
                    userName,
                    cleanEmail,
                    passwordEncoder.encode(java.util.UUID.randomUUID().toString()),
                    "",
                    "",
                    role
            );
            return userRepository.save(newUser);
        });

        if (cleanEmail.equalsIgnoreCase("zamzammart08@gmail.com") && user.getRole() != Role.ROLE_ADMIN) {
            user.setRole(Role.ROLE_ADMIN);
            user = userRepository.save(user);
        }

        // Send welcoming greeting email if new customer login
        if (!user.isWelcomed() && user.getRole() == Role.ROLE_CUSTOMER) {
            try {
                emailService.sendWelcomeGreetingEmail(user.getEmail(), user.getName());
                user.setWelcomed(true);
                user = userRepository.save(user);
            } catch (Exception e) {
                logger.warn("Could not dispatch welcome email on Google login: {}", e.getMessage());
            }
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public Map<String, Object> processForgotPassword(String email, String requestOrigin) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Please enter your registered Gmail ID / email address.");
        }
        String cleanEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new RuntimeException("No account found with email: " + cleanEmail + ". Please verify your email or sign up."));

        // Generate secure reset token
        String resetToken = UUID.randomUUID().toString().replace("-", "");
        user.setResetPasswordToken(resetToken);
        user.setResetPasswordExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        // Determine base frontend URL
        String baseUrl = (requestOrigin != null && !requestOrigin.trim().isEmpty()) ? requestOrigin.trim() : frontendUrl;
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        String resetLink = baseUrl + "/?resetToken=" + resetToken + "&email=" + user.getEmail();

        // Dispatch email automatically from admin email (zamzammart08@gmail.com) to customer login email
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), resetLink, resetToken);
        } catch (Exception e) {
            logger.warn("Could not dispatch password reset email: {}", e.getMessage());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("email", user.getEmail());
        response.put("resetLink", resetLink);
        response.put("token", resetToken);
        response.put("message", "Password reset link has been dispatched to " + user.getEmail() + " from zamzammart08@gmail.com!");
        return response;
    }

    public Map<String, Object> processResetPassword(String token, String newPassword) {
        if (token == null || token.trim().isEmpty()) {
            throw new RuntimeException("Password reset token is required.");
        }
        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters.");
        }

        User user = userRepository.findByResetPasswordToken(token.trim())
                .orElseThrow(() -> new RuntimeException("Invalid or expired password reset link. Please request a new one."));

        if (user.getResetPasswordExpiry() == null || user.getResetPasswordExpiry().isBefore(LocalDateTime.now())) {
            user.setResetPasswordToken(null);
            user.setResetPasswordExpiry(null);
            userRepository.save(user);
            throw new RuntimeException("Password reset link has expired (valid for 60 minutes). Please request a new reset link.");
        }

        // Update password with BCrypt
        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpiry(null);
        userRepository.save(user);

        logger.info("✅ Password successfully reset for user: {}", user.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("email", user.getEmail());
        response.put("message", "Password reset successfully! You can now log in with your new password.");
        return response;
    }
}
