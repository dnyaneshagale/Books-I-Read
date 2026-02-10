package com.booksiread.backend.service.impl;

import com.booksiread.backend.dto.AuthResponse;
import com.booksiread.backend.dto.LoginRequest;
import com.booksiread.backend.dto.PasswordResetRequest;
import com.booksiread.backend.dto.PasswordResetConfirmRequest;
import com.booksiread.backend.dto.RegisterRequest;
import com.booksiread.backend.entity.User;
import com.booksiread.backend.entity.PasswordResetToken;
import com.booksiread.backend.exception.ValidationException;
import com.booksiread.backend.repository.UserRepository;
import com.booksiread.backend.repository.PasswordResetTokenRepository;
import com.booksiread.backend.security.JwtUtil;
import com.booksiread.backend.service.AuthService;
import com.booksiread.backend.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

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

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private EmailService emailService;

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
        if (request.getDisplayName() != null && !request.getDisplayName().isBlank()) {
            user.setDisplayName(request.getDisplayName());
        }
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
            // Determine if input is email or username
            String usernameOrEmail = request.getUsername();
            String actualUsername = usernameOrEmail;
            
            // If input looks like an email, find the username
            if (usernameOrEmail.contains("@")) {
                User user = userRepository.findByEmail(usernameOrEmail)
                    .orElseThrow(() -> new ValidationException("Invalid email or password"));
                actualUsername = user.getUsername();
            }
            
            // Authenticate user with username
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    actualUsername,
                    request.getPassword()
                )
            );

            // Get user
            User user = userRepository.findByUsername(actualUsername)
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
            throw new ValidationException("Invalid username/email or password");
        }
    }

    @Override
    public User getUserFromToken(String token) {
        String username = jwtUtil.getUserNameFromJwtToken(token);
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new ValidationException("User not found"));
    }

    @Override
    @Transactional
    public void requestPasswordReset(PasswordResetRequest request) {
        String identifier = request.getIdentifier();
        
        // Determine if identifier is email or username
        User user;
        if (identifier.contains("@")) {
            // Treat as email
            user = userRepository.findByEmail(identifier)
                .orElseThrow(() -> new ValidationException("No account found with that email address"));
        } else {
            // Treat as username
            user = userRepository.findByUsername(identifier)
                .orElseThrow(() -> new ValidationException("No account found with that username"));
        }

        // Generate reset token (UUID)
        String resetToken = UUID.randomUUID().toString();

        // Security: Delete any existing unused tokens for this user to prevent token accumulation
        passwordResetTokenRepository.deleteByUserId(user.getId());

        // Save token to database with 15 minutes expiry (security best practice)
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(15);
        PasswordResetToken token = new PasswordResetToken(resetToken, user, expiryDate);
        passwordResetTokenRepository.save(token);

        // Send password reset email via Brevo
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), resetToken);
            logger.info("Password reset email sent to: {} ({})", user.getUsername(), user.getEmail());
        } catch (Exception e) {
            logger.error("Failed to send password reset email to: {}", user.getEmail(), e);
            throw new RuntimeException("Failed to send password reset email. Please try again later.");
        }
    }

    @Override
    @Transactional
    public void confirmPasswordReset(PasswordResetConfirmRequest request) {
        // Find token in database
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
            .orElseThrow(() -> new ValidationException("Invalid password reset token"));

        // Validate token
        if (resetToken.isUsed()) {
            throw new ValidationException("This password reset link has already been used");
        }

        if (resetToken.isExpired()) {
            throw new ValidationException("This password reset link has expired. Please request a new one.");
        }

        // Get user and update password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark token as used (security: prevent token reuse)
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        // Security: Log password reset for audit trail
        logger.warn("PASSWORD RESET COMPLETED for user: {} ({})", user.getUsername(), user.getEmail());
    }

    @Override
    public boolean isUsernameTaken(String username) {
        return userRepository.existsByUsername(username);
    }
}
