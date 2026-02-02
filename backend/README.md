# Books I Read - Backend

Spring Boot REST API for the Books I Read application.

## 🔒 Security & Environment Setup

### Required Environment Variables

Create a `.env` file in the backend directory (never commit this to git):

```bash
# Database Configuration (PostgreSQL)
DATABASE_URL=jdbc:postgresql://your-host:5432/your-database
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-256-bit-secret-key
JWT_EXPIRATION=86400000

# CORS Configuration  
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Gemini AI (optional - for AI features)
GEMINI_API_KEY=your-gemini-api-key
```

### Generating Secure Secrets

```bash
# Generate a secure JWT secret (Windows PowerShell)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Generate a secure JWT secret (Linux/Mac)
openssl rand -base64 64
```

## 🚀 Development Setup

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- PostgreSQL database

### Running Locally

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd books-i-read/backend
```

2. **Set up environment variables**
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual values
```

3. **Run the application**
```bash
# Using Maven wrapper
./mvnw spring-boot:run

# Or using Maven
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

## 📦 Building for Production

```bash
# Build the JAR file
./mvnw clean package -DskipTests

# The JAR will be in target/backend-0.0.1-SNAPSHOT.jar
```

## 🌐 Deployment

See [PRODUCTION.md](../PRODUCTION.md) for detailed deployment instructions.

### Quick Deployment Checklist

- [ ] Set all required environment variables
- [ ] Use strong random JWT secret (not the development one)
- [ ] Configure production database connection
- [ ] Set CORS_ALLOWED_ORIGINS to your frontend domain
- [ ] Set HIBERNATE_DDL_AUTO to `validate` (not `update`)
- [ ] Disable SQL logging in production
- [ ] Set appropriate log levels
- [ ] Enable HTTPS
- [ ] Review security configurations

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Books
- `GET /api/books` - Get all books for authenticated user
- `POST /api/books` - Create new book
- `GET /api/books/{id}` - Get book by ID
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Delete book

### Activity Tracking
- `POST /api/activities` - Log reading activity
- `GET /api/activities/book/{bookId}` - Get activities for a book

### AI Features (Optional)
- `POST /api/ai/generate-notes/{bookId}` - Generate AI notes for a book

## 🛠️ Technology Stack

- **Framework**: Spring Boot 3.x
- **Language**: Java 17
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: Google Gemini 2.5 Flash
- **Build Tool**: Maven

## 📝 Configuration

All configuration is in [application.properties](src/main/resources/application.properties).

**Important**: Never commit secrets to git. All sensitive values use environment variables with the `${VARIABLE_NAME}` syntax.

## 🔍 Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL format: `jdbc:postgresql://host:port/database?sslmode=require`
- Check database credentials
- Ensure PostgreSQL is running and accessible

### JWT Issues
- Ensure JWT_SECRET is set and is sufficiently long (min 256 bits)
- Check JWT_EXPIRATION is in milliseconds (86400000 = 24 hours)

### CORS Issues
- Verify CORS_ALLOWED_ORIGINS matches your frontend URL exactly
- Include protocol (http:// or https://)
- No trailing slash

## 📄 License

Private project
