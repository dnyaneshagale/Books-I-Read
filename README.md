# 📚 Books I Read - Full Stack Application

A modern, clean, and professional full-stack application for tracking your reading progress. Built with Spring Boot (Java) and React (Vite), featuring a Notion/Linear-inspired UI design and JWT authentication.

![Tech Stack](https://img.shields.io/badge/Spring%20Boot-4.0.2-brightgreen)
![Tech Stack](https://img.shields.io/badge/React-19.2.0-blue)
![Tech Stack](https://img.shields.io/badge/PostgreSQL-Database-blue)
![Tech Stack](https://img.shields.io/badge/JWT-Authentication-orange)

---

## ✨ Features

### Core Functionality
- 🔐 **User Authentication** - Secure JWT-based login and registration
- 👤 **Multi-User Support** - Each user has their own private book library
- ✅ **Add Books** - Track books with title, author, and page count
- 📈 **Update Progress** - Update pages read anytime with live progress preview
- 📊 **Progress Tracking** - Automatic calculation of reading progress percentage
- 🏷️ **Status Labels** - Smart status: Not Started, Reading, Completed
- 🗑️ **Delete Books** - Remove books from your library
- 📱 **Responsive Design** - Works perfectly on mobile and desktop

### Security
- 🔒 **Password Encryption** - BCrypt hashing for secure password storage
- 🎫 **JWT Tokens** - Stateless authentication with 24-hour tokens
- 🛡️ **Protected Routes** - Frontend and backend route protection
- 👥 **Data Isolation** - Users can only see and modify their own books

### UI/UX
- 🎯 **Dashboard View** - Clean statistics cards showing your reading stats
- 🔍 **Smart Filtering** - Filter by All, Not Started, Reading, Completed
- 🎨 **Notion/Linear Inspired** - Professional, minimal, and modern design
- 🔔 **Toast Notifications** - Beautiful notifications for all actions
- ⚡ **Live Progress Preview** - See progress update in real-time in modal
- 🎭 **Quick Actions** - Quick buttons to add +10, +25, +50 pages
- 🚪 **Auth Pages** - Clean login and registration forms

---

## 🛠️ Tech Stack

### Backend
- **Spring Boot 4.0.2** - Java 21
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database abstraction
- **Spring Validation** - Request validation
- **JWT (jjwt 0.12.5)** - JSON Web Tokens for authentication
- **BCrypt** - Password hashing
- **PostgreSQL** - Relational database
- **Maven** - Build tool

### Frontend
- **React 19.2.0** - UI library
- **React Router 7.1.3** - Client-side routing
- **Vite 7.2.4** - Build tool & dev server
- **Axios 1.13.4** - HTTP client with JWT interceptors
- **React Hot Toast 2.4.1** - Toast notifications
- **CSS Variables** - Clean, maintainable styling

---

## 🚀 Quick Start

### Prerequisites
- Java 21
- PostgreSQL 14+
- Node.js 18+
- Maven 3.9+

### 1. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE booksiread_db;
\q

# Run migration script (creates tables)
psql -U postgres -d booksiread_db -f DATABASE-MIGRATION.md
```

### 2. Backend Setup

```bash
cd backend

# Update application.properties with your database password

# Run the application
mvn spring-boot:run
```

Backend will start on http://localhost:8080

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start on http://localhost:5173

### 4. Access the Application

1. Open http://localhost:5173
2. Click **"Sign up"** to create an account
3. Fill in username, email, and password
4. Start tracking your reading!

📖 **For detailed setup instructions, see [QUICK-START.md](./QUICK-START.md)**

---

## 📁 Project Structure

```
books-i-read/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/booksiread/backend/
│   │   │   │   ├── config/
│   │   │   │   │   └── SecurityConfig.java
│   │   │   │   ├── controller/
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   └── BookController.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── AuthResponse.java
│   │   │   │   │   ├── BookRequest.java
│   │   │   │   │   ├── BookResponse.java
│   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   └── RegisterRequest.java
│   │   │   │   ├── entity/
│   │   │   │   │   ├── Book.java
│   │   │   │   │   └── User.java
│   │   │   │   ├── exception/
│   │   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   │   └── ValidationException.java
│   │   │   │   ├── repository/
│   │   │   │   │   ├── BookRepository.java
│   │   │   │   │   └── UserRepository.java
│   │   │   │   ├── security/
│   │   │   │   │   ├── CustomUserDetailsService.java
│   │   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   │   └── JwtUtil.java
│   │   │   │   ├── service/
│   │   │   │   │   ├── AuthService.java
│   │   │   │   │   ├── AuthServiceImpl.java
│   │   │   │   │   ├── BookService.java
│   │   │   │   │   └── impl/
│   │   │   │   │       └── BookServiceImpl.java
│   │   │   │   └── BackendApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── pom.xml
│   └── README.md
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── authApi.js
    │   │   ├── axiosClient.js
    │   │   └── bookApi.js
    │   ├── components/
    │   │   ├── AddBookForm.jsx
    │   │   ├── AddBookForm.css
    │   │   ├── BookCard.jsx
    │   │   ├── BookCard.css
    │   │   ├── UpdateProgressModal.jsx
    │   │   └── UpdateProgressModal.css
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Dashboard.css
    │   │   ├── LoginPage.jsx
    │   │   ├── LoginPage.css
    │   │   └── RegisterPage.jsx
    │   ├── App.jsx
    │   ├── App.css
    │   ├── AuthContext.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── package.json
    └── README.md

📖 **Full project structure and authentication details in [AUTHENTICATION-GUIDE.md](./AUTHENTICATION-GUIDE.md)**

---

## 📡 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user | ❌ No |
| `POST` | `/api/auth/login` | Login user | ❌ No |

### Book Endpoints (Protected)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/books` | Create a new book | ✅ Yes |
| `GET` | `/api/books` | Get all books (user's only) | ✅ Yes |
| `GET` | `/api/books/{id}` | Get single book by ID | ✅ Yes |
| `PUT` | `/api/books/{id}` | Update book (including progress) | ✅ Yes |
| `DELETE` | `/api/books/{id}` | Delete a book | ✅ Yes |

### Sample Request - Register

```json
POST /api/auth/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Sample Response - Register/Login

```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com"
}
```

### Sample Request - Create Book (with Auth)

```http
POST /api/books
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...

{
  "title": "The Pragmatic Programmer",
  "author": "David Thomas, Andrew Hunt",
  "totalPages": 352,
  "pagesRead": 0
}
```

### Sample Response - Book

```json
{
  "id": 1,
  "title": "The Pragmatic Programmer",
  "author": "David Thomas, Andrew Hunt",
  "totalPages": 352,
  "pagesRead": 0,
  "progress": 0.0,
  "status": "Not Started"
}
```

---

## 🗄️ Database Schema

### Table: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | PRIMARY KEY | Auto-generated ID |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Username (3-50 chars) |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| `password` | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMP | NULL | Last update timestamp |

### Table: `books`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | PRIMARY KEY | Auto-generated ID |
| `title` | VARCHAR(255) | NOT NULL | Book title |
| `author` | VARCHAR(255) | NOT NULL | Book author |
| `total_pages` | INTEGER | NOT NULL, > 0 | Total pages in book |
| `pages_read` | INTEGER | NOT NULL, >= 0 | Pages read so far |
| `user_id` | BIGINT | FK → users(id), NOT NULL | Owner of the book |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |

### Automatic Calculations
- **progress**: `(pagesRead / totalPages) * 100`
- **status**: 
  - `pagesRead = 0` → "Not Started"
  - `0 < pagesRead < totalPages` → "Reading"
  - `pagesRead = totalPages` → "Completed"

---

## 🔐 Security Features

- **Password Encryption**: BCrypt hashing with salt
- **JWT Authentication**: Stateless token-based auth (24-hour expiration)
- **Protected Routes**: Frontend and backend route guards
- **Data Isolation**: Users can only access their own books
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Server-side validation with Jakarta Validation

---

## 🎨 UI Design Principles

This app follows **Notion/Linear** design philosophy:

✅ **Clean spacing** - Consistent padding and margins  
✅ **Subtle borders** - Light borders instead of heavy shadows  
✅ **Minimal animations** - Smooth transitions only where needed  
✅ **Professional typography** - System fonts, clear hierarchy  
✅ **Smart colors** - Blue for active, green for complete, gray for neutral  

❌ **Avoided**: Heavy gradients, neon colors, glassmorphism, excessive animations

---

## 📚 Documentation

- **[QUICK-START.md](./QUICK-START.md)** - Get up and running in 5 minutes

---

## 🔧 Extension Ideas

### Implemented ✅
- ✅ **User Authentication** - JWT-based login/register
- ✅ **Multi-user Support** - Isolated book libraries per user
- ✅ **Password Encryption** - BCrypt hashing
- ✅ **Protected Routes** - Frontend and backend guards

### Future Enhancements 💡

#### Backend
- 📧 **Email Verification** - Verify emails on registration
- 🔄 **Refresh Tokens** - Long-lived sessions
- 🔑 **Password Reset** - Forgot password flow
- 👤 **User Profiles** - Update email, password, avatar
- 📚 **Genres** - Add genre field and filtering
- 🔍 **Search** - Full-text search with JPA
- 📄 **Pagination** - Handle large book collections
- 📷 **Cover Images** - Upload book cover images

#### Frontend
- 🎨 **Dark Mode** - Theme switcher
- 📈 **Charts** - Reading progress visualization
- 🔍 **Search** - Search books by title/author
- 📱 **PWA** - Installable Progressive Web App
- 🗂️ **Advanced Sorting** - Multiple sort options
- 🎯 **Reading Goals** - Track monthly/yearly goals
- 📝 **Reading Notes** - Add notes per book
- 🔔 **Reminders** - Reading reminder notifications

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests (if you add them)
```bash
cd frontend
npm run test
```

---

## 📦 Production Build

### Backend JAR
```bash
cd backend
mvn clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Frontend Production Build
```bash
cd frontend
npm run build
# Output will be in dist/ folder
```

---

## 🐛 Troubleshooting

### Backend won't start
- ✅ Check if PostgreSQL is running: `sudo service postgresql status`
- ✅ Verify database credentials in `application.properties`
- ✅ Ensure Java 21 is installed: `java -version`

### Frontend can't connect to backend
- ✅ Check if backend is running on port 8080
- ✅ Verify `axiosClient.js` baseURL is correct
- ✅ Check browser console for CORS errors

### Database connection errors
- ✅ Verify database exists: `psql -U postgres -l`
- ✅ Check PostgreSQL is accepting connections
- ✅ Update password in `application.properties`

---

## 👨‍💻 Developer Notes

### Validation Rules
- `totalPages` must be > 0
- `pagesRead` must be >= 0 and <= totalPages
- `title` and `author` cannot be blank

### Error Handling
- 404 - Resource not found
- 400 - Validation error
- 500 - Server error

All errors return consistent JSON format:
```json
{
  "status": 404,
  "message": "Book not found with id: 1",
  "timestamp": "2026-02-01T10:30:00"
}
```

---

## 📝 License

This project is for educational purposes. Feel free to use and modify!

---

## 🙏 Acknowledgments

- Design inspired by **Notion** and **Linear**
- Built with ❤️ using Spring Boot and React

---

**Happy Reading! 📚**
