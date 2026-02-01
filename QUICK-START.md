# Quick Start Guide - JWT Authentication

## 🚀 Get Started in 5 Minutes

This guide will help you set up the **Books I Read** application with JWT authentication.

---

## Prerequisites

- Java 21
- PostgreSQL 14+
- Node.js 18+
- Maven 3.9+

---

## Step 1: Database Setup (2 minutes)

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE booksiread_db;

# Exit psql
\q
```

### Run Migration

Option 1: Using the provided script
```bash
psql -U postgres -d booksiread_db -f DATABASE-MIGRATION.md
```

Option 2: Manual SQL
```sql
-- Connect to database
psql -U postgres booksiread_db

-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create books table
CREATE TABLE books (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    total_pages INTEGER NOT NULL,
    pages_read INTEGER NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_books_user_id ON books(user_id);
```

---

## Step 2: Configure Backend (1 minute)

### Update application.properties

Edit `backend/src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/booksiread_db
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD_HERE

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# JWT Configuration
jwt.secret=booksIReadSecretKeyForJWTTokenSigningPleaseChangeThisInProduction2026
jwt.expiration=86400000
```

**Important**: Change `YOUR_PASSWORD_HERE` to your PostgreSQL password.

---

## Step 3: Start Backend (1 minute)

```bash
cd backend
mvn spring-boot:run
```

Wait for:
```
Started BackendApplication in X seconds
```

---

## Step 4: Start Frontend (1 minute)

```bash
cd frontend
npm install
npm run dev
```

Wait for:
```
Local: http://localhost:5173/
```

---

## Step 5: Test the Application!

### Register a New User

1. Open browser: http://localhost:5173
2. Click **"Sign up"**
3. Fill in:
   - Username: `yourname`
   - Email: `your@email.com`
   - Password: `password123`
4. Click **"Sign Up"**
5. You'll be redirected to the dashboard!

### Add Your First Book

1. Click **"+ Add Book"**
2. Fill in:
   - Title: `The Hobbit`
   - Author: `J.R.R. Tolkien`
   - Total Pages: `310`
   - Pages Read: `0`
3. Click **"Add Book"**
4. Your book appears in the library!

### Update Reading Progress

1. Click **"Update Progress"** on any book
2. Drag the slider or type pages read
3. Watch the progress bar update in real-time!
4. Click **"Update"**
5. See the toast notification confirming the update

### Test User Isolation

1. Click **"Logout"** in the top-right
2. Click **"Sign up"** to create another account
3. Username: `testuser2`
4. Add books as this new user
5. Logout and login as your first user
6. Verify you can't see `testuser2`'s books!

---

## Troubleshooting

### Backend won't start

**Error**: `Connection refused: localhost:5432`
- **Solution**: PostgreSQL is not running. Start it:
  ```bash
  # Windows
  net start postgresql-x64-14
  
  # Mac
  brew services start postgresql
  
  # Linux
  sudo systemctl start postgresql
  ```

**Error**: `password authentication failed`
- **Solution**: Update `application.properties` with correct password

**Error**: `relation "users" does not exist`
- **Solution**: Run the database migration script (Step 1)

### Frontend won't start

**Error**: `Cannot find module 'react-router-dom'`
- **Solution**: Install dependencies:
  ```bash
  cd frontend
  npm install
  ```

### Can't login after registration

**Error**: `Invalid username or password`
- **Solution**: Make sure backend is running and check browser console for errors

### 401 Unauthorized on book requests

**Solution**: 
1. Open browser DevTools → Application → Local Storage
2. Verify `token` exists
3. If missing, logout and login again

---

## What's Next?

Now that your app is running:

1. **Read the Documentation**
   - [AUTHENTICATION-GUIDE.md](./AUTHENTICATION-GUIDE.md) - Full authentication details
   - [DATABASE-MIGRATION.md](./DATABASE-MIGRATION.md) - Database schema info
   - [backend/README.md](./backend/README.md) - Backend API docs
   - [frontend/README.md](./frontend/README.md) - Frontend component docs

2. **Customize Your App**
   - Change JWT secret key (important for production!)
   - Adjust token expiration time
   - Modify color scheme in CSS variables
   - Add more book metadata (genre, ISBN, cover image)

3. **Deploy to Production**
   - Set up environment variables
   - Use HTTPS
   - Configure production database
   - Enable CORS for your domain
   - Add email verification
   - Implement rate limiting

---

## Quick Reference

### Default Ports
- Backend: http://localhost:8080
- Frontend: http://localhost:5173
- PostgreSQL: localhost:5432

### API Endpoints
- **Register**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login`
- **Get Books**: `GET /api/books` (requires auth)
- **Add Book**: `POST /api/books` (requires auth)
- **Update Book**: `PUT /api/books/{id}` (requires auth)
- **Delete Book**: `DELETE /api/books/{id}` (requires auth)

### Key Technologies
- **Backend**: Spring Boot 4.0.2, Spring Security, JWT, PostgreSQL
- **Frontend**: React 19, React Router, Axios, Vite
- **Auth**: JWT with BCrypt password hashing

---

## Need Help?

1. Check the detailed guides in the root directory
2. Review error messages in:
   - Backend console
   - Browser console (F12)
   - Network tab (F12 → Network)
3. Verify database is running and accessible
4. Ensure all dependencies are installed

---

## Success Checklist

- [x] PostgreSQL running
- [x] Database created (`booksiread_db`)
- [x] Tables created (`users`, `books`)
- [x] Backend running on port 8080
- [x] Frontend running on port 5173
- [x] Can register new user
- [x] Can login
- [x] Can add books
- [x] Can update progress
- [x] Books are isolated by user
- [x] Logout works

🎉 **You're all set! Happy reading tracking!**
