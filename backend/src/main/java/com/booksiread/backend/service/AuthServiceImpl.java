package com.booksiread.backend.service;

import com.booksiread.backend.dto.AuthResponse;
import com.booksiread.backend.dto.LoginRequest;
import com.booksiread.backend.dto.RegisterRequest;
import com.booksiread.backend.entity.User;
import com.booksiread.backend.exception.ValidationException;
import com.booksiread.backend.repository.UserRepository;
import com.booksiread.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * AuthServiceImpl - Authentication and user management service
 * 
 * Handles:
 * - User registration with validation
 * - User login with JWT generation
 * - Password encryption
 */
@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        // Validate username uniqueness
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ValidationException("Username already exists");
        }

        // Validate email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already exists");
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // Save user
        User savedUser = userRepository.save(user);

        // Load UserDetails and generate JWT token
        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getUsername());
        String token = jwtUtil.generateToken(userDetails);

        // Return auth response
        return new AuthResponse(
            token,
            savedUser.getId(),
            savedUser.getUsername(),
            savedUser.getEmail()
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsername(),
                    request.getPassword()
                )
            );

            // Get user
            User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ValidationException("User not found"));

            // Load UserDetails and generate JWT token
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
            String token = jwtUtil.generateToken(userDetails);

            // Return auth response
            return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail()
            );
        } catch (BadCredentialsException e) {
            throw new ValidationException("Invalid username or password");
        }
    }

    @Override
    public User getUserFromToken(String token) {
        String username = jwtUtil.getUserNameFromJwtToken(token);
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new ValidationException("User not found"));
    }
}
