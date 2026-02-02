# Production Deployment Guide

## Environment Variables

Set these environment variables in your production environment:

### Required Variables

```bash
# Database
DATABASE_URL=jdbc:postgresql://your-db-host:5432/your-db-name
DATABASE_USERNAME=your_db_user
DATABASE_PASSWORD=your_secure_db_password

# JWT (Generate with: openssl rand -base64 64)
JWT_SECRET=your_256_bit_secret_key_min_32_chars
JWT_EXPIRATION=86400000

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Application
PORT=8080
HIBERNATE_DDL_AUTO=validate
LOG_LEVEL=WARN
APP_LOG_LEVEL=INFO
```

## Security Checklist

- [ ] Generate new JWT secret (min 256 bits)
- [ ] Use strong database password
- [ ] Set CORS to production domains only
- [ ] Enable HTTPS/TLS
- [ ] Set `HIBERNATE_DDL_AUTO=validate` in production
- [ ] Review and minimize logging in production
- [ ] Never commit `.env` files
- [ ] Rotate secrets regularly

## Deployment Steps

1. Set all environment variables in your hosting platform
2. Build: `mvn clean package -DskipTests`
3. Deploy JAR from `target/` directory
4. Verify health endpoint: `GET /actuator/health`
5. Monitor logs for errors

## Common Platforms

### Railway
Set environment variables in Railway dashboard

### Render
Add environment variables in Render dashboard

### AWS/Azure/GCP
Use secrets manager services

### Docker
Use docker-compose.yml with env_file or docker secrets
