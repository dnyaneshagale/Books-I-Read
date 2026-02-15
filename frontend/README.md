# Books I Read

A full-stack social book tracking platform where readers can manage their personal library, share reflections, write reviews, follow other readers, and get AI-powered reading insights.

Built with **React 19 + Vite** on the frontend and **Spring Boot + PostgreSQL** on the backend.

---

## Features

### Library Management
- Add books with cover images, author, genre, tags, and page count
- Track reading progress with visual progress bars
- Set reading status — Want to Read, Reading, Finished
- Rate books on a 5-star scale
- Tag and categorize books for organization
- Batch delete books in select mode
- Public/private book visibility toggle

### Social
- Follow/unfollow other readers (with follow request support for private accounts)
- Activity feed showing updates from followed users
- Write and share reflections (thoughts tied to specific books)
- Like, comment, and reply on reflections
- Save/bookmark reflections for later
- Discover page to find new readers
- User suggestions based on similar reading interests
- Profile pages with reading stats, books, reflections, and reviews

### Reviews
- Write detailed book reviews with ratings
- Browseable reviews feed with sorting and search
- Like, comment, and reply on reviews
- Save/bookmark reviews

### Reading Lists
- Create custom reading lists (public or private)
- Browse popular public lists from the community
- Search lists by title or description
- Like/save lists from other users
- Add/remove books from lists

### AI-Powered Features
- Auto-generated reading notes for each book (powered by Google Gemini)
- AI book recommendations based on your library
- Custom preference-based recommendations
- Reading insights and analytics

### Analytics & Goals
- Daily reading activity tracking (last 7 days)
- Weekly, monthly, and yearly page counts
- Reading streak tracking
- Reading pace calculator
- Set yearly reading goals with progress tracking
- Goal history across years

### Notifications
- In-app notification bell with unread count
- Notifications for follows, likes, comments, and replies
- Mark individual or all notifications as read

### Import & Export
- Import books from Goodreads CSV
- Share reading list

### Other
- Dark mode support
- Fully responsive (mobile-first) design
- Password reset via email (Brevo/Sendinblue)
- Inspirational reading quotes on the dashboard

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 7 | Build tool & dev server |
| Tailwind CSS 4 | Utility-first styling |
| React Router 7 | Client-side routing |
| Axios | HTTP client |
| Lucide React | Icon library |
| Firebase Storage | Profile photo uploads |
| React Hot Toast | Toast notifications |
| React Easy Crop | Profile photo crop/upload |
| Capacitor | Mobile app shell (optional) |

### Backend
| Technology | Purpose |
|---|---|
| Spring Boot 3.3 | Application framework |
| Java 21 | Language |
| PostgreSQL | Database |
| Spring Security + JWT | Authentication & authorization |
| Spring Data JPA | Data access layer |
| Google Gemini 1.5 Flash | AI notes & recommendations |
| Brevo API | Transactional emails (password reset) |
| Maven | Build tool |
| Docker | Containerized deployment |

---

## Project Structure

```
backend/
  src/main/java/com/booksiread/backend/
    BackendApplication.java
    client/             # External API clients (Gemini)
    config/             # CORS, Security, Async configs
    controller/         # 10 REST controllers
    dto/                # 23 request/response DTOs
    entity/             # 20 JPA entities
    exception/          # Global error handling
    repository/         # 20 Spring Data repositories
    security/           # JWT filter, UserDetailsService
    service/            # 11 service interfaces + implementations

frontend/
  src/
    api/                # 7 API modules (book, goal, list, notification, review, social, axios)
    components/         # 13 UI components
    components/social/  # 7 social feature components
    data/               # Static data (quotes)
    pages/              # 13 page components
    App.jsx             # Router & layout (14 routes)
    AuthContext.jsx     # Auth state management
    authApi.js          # Auth API client
    firebase.js         # Firebase initialization
    main.jsx            # React entry point
    index.css           # Global styles (Tailwind)
```

---

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register new user |
| POST | `/login` | Login (username or email) |
| GET | `/validate` | Validate JWT token |
| GET | `/check-username/{username}` | Check username availability |
| POST | `/reset-password` | Request password reset email |
| POST | `/reset-password/confirm` | Confirm password reset |

### Books — `/api/books`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create a book |
| GET | `/` | Get all books for current user |
| GET | `/{id}` | Get a single book |
| PUT | `/{id}` | Update a book |
| PATCH | `/{id}/privacy` | Toggle book privacy |
| DELETE | `/{id}` | Delete a book |
| DELETE | `/batch` | Delete multiple books |
| POST | `/{id}/regenerate-notes` | Regenerate AI notes |
| GET | `/{id}/community-stats` | Get community rating & review count |

### AI — `/api/ai`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/generate-notes/{id}` | Generate AI notes for a book |
| POST | `/recommendations/library` | Recommendations from user's library |
| POST | `/recommendations/custom` | Recommendations from custom preferences |

### Social — `/api/social`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/profile/me` | Current user's profile |
| GET | `/profile/{username}` | Profile by username |
| PUT | `/profile` | Update profile |
| GET | `/profile/{username}/books` | User's books (respects privacy) |
| POST | `/follow/{userId}` | Follow / send follow request |
| DELETE | `/follow/{userId}` | Unfollow |
| GET | `/followers/{userId}` | Paginated followers |
| GET | `/following/{userId}` | Paginated following |
| GET | `/requests` | Pending follow requests |
| POST | `/requests/{id}/approve` | Approve follow request |
| POST | `/requests/{id}/reject` | Reject follow request |
| GET | `/search` | Search users |
| GET | `/discover` | Discover public users |
| GET | `/suggestions` | Suggested users to follow |
| GET | `/similar` | Users with similar taste |
| GET | `/feed` | Activity feed |
| POST | `/reflections` | Create a reflection |
| GET | `/reflections/{id}` | Get a reflection |
| DELETE | `/reflections/{id}` | Delete a reflection |
| PATCH | `/reflections/{id}/privacy` | Update reflection privacy |
| GET | `/reflections/following` | Reflections from followed users |
| GET | `/reflections/everyone` | Public reflections |
| GET | `/reflections/search` | Search reflections |
| POST | `/reflections/{id}/like` | Toggle like |
| POST | `/reflections/{id}/comments` | Add comment/reply |
| GET | `/reflections/{id}/comments` | Get comments (paginated) |
| POST | `/reflections/{id}/save` | Toggle bookmark |
| GET | `/reflections/saved` | Saved reflections |

### Reviews — `/api/reviews`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/book/{bookId}` | Create a review |
| PUT | `/{reviewId}` | Update a review |
| DELETE | `/{reviewId}` | Delete a review |
| GET | `/{reviewId}` | Get a review |
| GET | `/book/{bookId}` | Reviews for a book |
| GET | `/user/{userId}` | Reviews by a user |
| GET | `/feed` | Reviews from followed users |
| GET | `/search` | Search reviews |
| POST | `/{reviewId}/like` | Toggle like |
| POST | `/{reviewId}/save` | Toggle bookmark |
| GET | `/saved` | Saved reviews |
| POST | `/{reviewId}/comments` | Add comment |
| GET | `/{reviewId}/comments` | Get comments |

### Reading Goals — `/api/goals`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Set or update reading goal |
| GET | `/current` | Current year's goal |
| GET | `/{year}` | Goal by year |
| GET | `/all` | All goals (history) |
| DELETE | `/{goalId}` | Delete a goal |

### Reading Lists — `/api/lists`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create a list |
| PUT | `/{listId}` | Update a list |
| DELETE | `/{listId}` | Delete a list |
| GET | `/{listId}` | Get a list with items |
| GET | `/mine` | My lists |
| GET | `/user/{userId}` | User's public lists |
| GET | `/browse` | Browse popular public lists |
| GET | `/search` | Search public lists |
| GET | `/saved` | Liked/saved lists |
| POST | `/{listId}/items` | Add book to list |
| DELETE | `/{listId}/items/{itemId}` | Remove book from list |
| POST | `/{listId}/like` | Toggle like |

### Notifications — `/api/notifications`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | All notifications (paginated) |
| GET | `/unread` | Unread notifications |
| GET | `/count` | Unread count |
| POST | `/{id}/read` | Mark as read |
| POST | `/read-all` | Mark all as read |

### Reading Activity — `/api/activities`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dates` | Activity dates (for streak) |
| GET | `/details` | Activity dates with page counts |
| GET | `/daily-stats` | Daily stats (last 7 days) |
| GET | `/period-stats` | Pages read this week/month/year |

---

## Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Java 21**
- **PostgreSQL**
- **Google Gemini API key** (for AI features)
- **Firebase project** (for photo storage)
- **Brevo account** (optional, for password reset emails)

### Backend Setup

1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE booksiread_db;
   ```

2. Configure environment — copy and edit the properties file:
   ```bash
   cd backend/src/main/resources
   copy application.properties.example application.properties
   ```

   Set your database credentials, JWT secret, Gemini API key, CORS origins, and email config.

3. Run the backend:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

   The API will be available at `http://localhost:8080/api`.

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Create `.env` file:
   ```bash
   copy .env.example .env
   ```

3. Set the required environment variables:
   ```env
   VITE_API_URL=http://localhost:8080/api
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173)

---

## Deployment

### Frontend — Firebase Hosting

```bash
cd frontend
npm run build
firebase deploy
```

The app is deployed to Firebase Hosting with SPA rewrites and static asset caching configured in `firebase.json`.

### Backend — Docker

```bash
cd backend
docker build -t booksiread-backend .
docker run -p 8080:8080 --env-file .env booksiread-backend
```

The Dockerfile uses a multi-stage Maven build with Eclipse Temurin JDK 21 and runs as a non-root user.

---

## Available Scripts

### Frontend
| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Backend
| Command | Description |
|---|---|
| `./mvnw spring-boot:run` | Start Spring Boot server |
| `./mvnw clean package` | Build JAR for production |
| `./mvnw test` | Run tests |

---

## Database Schema

The application uses 20 JPA entities:

**Core:** `User`, `Book`, `ReadingGoal`, `ReadingActivity`

**Social:** `UserFollow`, `FollowRequest`, `UserActivity`, `Notification`

**Reflections:** `Reflection`, `ReflectionComment`, `ReflectionLike`, `SavedReflection`

**Reviews:** `BookReview`, `ReviewComment`, `ReviewLike`, `SavedReview`

**Lists:** `ReadingList`, `ReadingListItem`, `ReadingListLike`

**Auth:** `PasswordResetToken`

---

## License

MIT
