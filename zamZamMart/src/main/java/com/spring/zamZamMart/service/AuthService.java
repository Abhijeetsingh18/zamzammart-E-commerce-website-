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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

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
}
