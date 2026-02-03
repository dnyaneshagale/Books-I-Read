package com.booksiread.backend.service.impl;

import com.booksiread.backend.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * EmailServiceImpl - Email service implementation using Brevo SMTP
 */
@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.email.from:noreply@booksiread.com}")
    private String fromEmail;

    @Value("${app.email.from-name:Books I Read}")
    private String fromName;

    @Override
    public void sendPasswordResetEmail(String toEmail, String username, String resetToken) {
        try {
            String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Reset Your Password - Books I Read");

            String htmlContent = buildPasswordResetEmailHtml(username, resetUrl);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            
            logger.info("Password reset email sent successfully to: {}", toEmail);
            
        } catch (MessagingException e) {
            logger.error("Failed to send password reset email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send password reset email. Please try again later.");
        } catch (Exception e) {
            logger.error("Unexpected error sending email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send email. Please contact support.");
        }
    }

    /**
     * Build HTML email template for password reset
     */
    private String buildPasswordResetEmailHtml(String username, String resetUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: ##333;
                        margin: 0;
                        padding: 0;
                        background-color: ##f4f4f4;
                    }
                    .container {
                        max-width: 600px;
                        margin: 40px auto;
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, ##667eea 0%%, ##764ba2 100%%);
                        padding: 40px 30px;
                        text-align: center;
                        color: white;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .greeting {
                        font-size: 18px;
                        font-weight: 600;
                        color: ##333;
                        margin-bottom: 20px;
                    }
                    .message {
                        font-size: 16px;
                        color: ##555;
                        margin-bottom: 30px;
                        line-height: 1.8;
                    }
                    .button-container {
                        text-align: center;
                        margin: 35px 0;
                    }
                    .reset-button {
                        display: inline-block;
                        padding: 16px 40px;
                        background: linear-gradient(135deg, ##667eea 0%%, ##764ba2 100%%);
                        color: white;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 16px;
                        transition: transform 0.2s;
                    }
                    .reset-button:hover {
                        transform: translateY(-2px);
                    }
                    .info-box {
                        background: ##f8f9fa;
                        border-left: 4px solid ##667eea;
                        padding: 15px 20px;
                        margin: 25px 0;
                        border-radius: 4px;
                    }
                    .info-box p {
                        margin: 0;
                        font-size: 14px;
                        color: ##666;
                    }
                    .footer {
                        background: ##f8f9fa;
                        padding: 25px 30px;
                        text-align: center;
                        font-size: 14px;
                        color: ##888;
                        border-top: 1px solid ##e0e0e0;
                    }
                    .footer p {
                        margin: 5px 0;
                    }
                    .link-text {
                        word-break: break-all;
                        font-size: 13px;
                        color: ##667eea;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📚 Books I Read</h1>
                    </div>
                    <div class="content">
                        <div class="greeting">Hello %s! 👋</div>
                        <div class="message">
                            We received a request to reset your password for your Books I Read account.
                            Click the button below to create a new password:
                        </div>
                        <div class="button-container">
                            <a href="%s" class="reset-button">Reset Your Password</a>
                        </div>
                        <div class="info-box">
                            <p><strong>⏰ This link expires in 15 minutes</strong></p>
                            <p>For your security, this password reset link will only work once.</p>
                        </div>
                        <div class="message">
                            If the button doesn't work, copy and paste this link into your browser:
                        </div>
                        <div class="link-text">%s</div>
                        <div class="info-box">
                            <p><strong>🔒 Didn't request this?</strong></p>
                            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                        </div>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from Books I Read</p>
                        <p>Please do not reply to this email</p>
                        <p style="margin-top: 15px; color: ##aaa;">© 2026 Books I Read. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(username, resetUrl, resetUrl);
    }
}
