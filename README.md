<div align="center">

# Books I Read

**A full-stack social book tracking platform for readers who love to organize, share, and discover.**

[![Live App](https://img.shields.io/badge/Live-booksiread.web.app-7c3aed?style=for-the-badge&logo=firebase&logoColor=white)](https://booksiread.web.app)

![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.5-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Google Cloud](https://img.shields.io/badge/Cloud_Run-4285F4?style=flat-square&logo=googlecloud&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

<br />

Track your reading journey, write reviews, follow fellow readers, get AI-powered recommendations, and build curated reading lists — all in one beautiful, mobile-first app.

</div>

---

## Features

### Library Management
- Add books with cover images, author, genre, tags, and page count
- Track reading progress with animated progress bars
- Reading status — **Want to Read**, **Reading**, **Finished**
- 5-star rating system
- Tag and categorize books
- Batch select and delete
- Public/private visibility per book

### Social Platform
- Follow/unfollow readers (with follow requests for private accounts)
- Activity feed with updates from followed users
- Write and share reflections tied to specific books
- Like, comment, and reply on reflections and reviews
- Save/bookmark content for later
- Discover page for finding new readers
- User suggestions based on similar reading taste
- Profile pages with stats, books, reflections, and reviews

### Reviews & Reflections
- Write detailed book reviews with ratings
- Browseable reviews feed with search, sort, and filtering
- Private reflections and public reviews
- Threaded comment system with replies

### Curated Reading Lists
- Create custom reading lists (public or private)
- Browse popular lists from the community
- Search, like, and save lists

### AI-Powered Features
- Auto-generated reading notes per book (Google Gemini)
- AI recommendations based on your library
- Custom preference-based recommendations

### Analytics & Goals
- Daily reading activity tracking (last 7 days heatmap)
- Weekly, monthly, and yearly page counts
- Reading streak tracking with pace calculator
- Yearly reading goals with progress and history

### More
- Dark mode
- Mobile-first responsive design
- In-app notifications with unread count
- Import from Goodreads CSV / export reading data
- Password reset via email (Brevo)
- Inspirational reading quotes on the dashboard

---

## Tech Stack

<table>
<tr><td>

### Frontend

| | Technology | Purpose |
|:-:|---|---|
| <img src="https://cdn.simpleicons.org/react" width="16"> | **React 19** | UI framework |
| <img src="https://cdn.simpleicons.org/vite" width="16"> | **Vite 7** | Build tool & dev server |
| <img src="https://cdn.simpleicons.org/tailwindcss" width="16"> | **Tailwind CSS 4** | Utility-first styling |
| <img src="https://cdn.simpleicons.org/reactrouter" width="16"> | **React Router 7** | Client-side routing |
| <img src="https://cdn.simpleicons.org/axios" width="16"> | **Axios** | HTTP client with JWT interceptors |
| | **Lucide React** | Icon library |
| <img src="https://cdn.simpleicons.org/firebase" width="16"> | **Firebase** | Hosting + profile photo storage |
| | **React Hot Toast** | Toast notifications |
| | **React Easy Crop** | Profile photo crop/upload |

</td><td>

### Backend

| | Technology | Purpose |
|:-:|---|---|
| <img src="https://cdn.simpleicons.org/springboot" width="16"> | **Spring Boot 3.3** | Application framework |
| <img src="https://cdn.simpleicons.org/openjdk" width="16"> | **Java 21** | Language |
| <img src="https://cdn.simpleicons.org/postgresql" width="16"> | **PostgreSQL** | Database (Neon) |
| | **Spring Security + JWT** | Authentication |
| | **Spring Data JPA** | Data access layer |
| <img src="https://cdn.simpleicons.org/googlegemini" width="16"> | **Google Gemini 1.5 Flash** | AI notes & recommendations |
| | **Brevo API** | Transactional emails |
| <img src="https://cdn.simpleicons.org/docker" width="16"> | **Docker** | Containerized deployment |
| <img src="https://cdn.simpleicons.org/googlecloud" width="16"> | **Cloud Run** | Production hosting |

</td></tr>
</table>

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│              React 19 + Tailwind CSS 4 + Vite            │
│                   Firebase Hosting                       │
└──────────────────────────┬──────────────────────────────┘
                           │  HTTPS + JWT Bearer Token
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Spring Boot 3.3 API                     │
│              Google Cloud Run (us-central1)               │
│                                                         │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────┐  │
│  │ 10 REST  │  │ 11 Service│  │ Spring Security      │  │
│  │Controllers│──│  Layer    │  │ + JWT Auth Filter    │  │
│  └──────────┘  └─────┬─────┘  └──────────────────────┘  │
│                      │                                   │
│  ┌───────────────────┴──────────────────────────────┐   │
│  │  20 JPA Repositories  →  20 Entities  →  23 DTOs │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │PostgreSQL│ │  Gemini  │ │  Brevo   │
        │  (Neon)  │ │   API    │ │   API    │
        └──────────┘ └──────────┘ └──────────┘
```

---

## Project Structure

```
books-i-read/
│
├── backend/
│   ├── src/main/java/com/booksiread/backend/
│   │   ├── client/              # External API clients (Gemini)
│   │   ├── config/              # CORS, Security, Async configs
│   │   ├── controller/          # 10 REST controllers
│   │   ├── dto/                 # 23 request/response DTOs
│   │   ├── entity/              # 20 JPA entities
│   │   ├── exception/           # Global error handling
│   │   ├── repository/          # 20 Spring Data repositories
│   │   ├── security/            # JWT filter, UserDetailsService
│   │   ├── service/             # 11 service interfaces + impls
│   │   └── BackendApplication.java
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # 7 API modules (axios, book, social, etc.)
│   │   ├── components/          # 13 UI components
│   │   ├── components/social/   # 7 social feature components
│   │   ├── data/                # Static data (reading quotes)
│   │   ├── pages/               # 13 page components
│   │   ├── AuthContext.jsx      # Auth state + proactive token expiry
│   │   ├── App.jsx              # Router & layout (14 routes)
│   │   └── index.css            # Global styles (Tailwind v4)
│   ├── firebase.json
│   └── package.json
│
└── README.md
```

---

## API Reference

<details>
<summary><strong>Auth</strong> — <code>/api/auth</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login (username or email) |
| GET | `/validate` | Validate JWT token |
| GET | `/check-username/{username}` | Check availability |
| POST | `/reset-password` | Request reset email |
| POST | `/reset-password/confirm` | Confirm password reset |

</details>

<details>
<summary><strong>Books</strong> — <code>/api/books</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a book |
| GET | `/` | Get user's books |
| GET | `/{id}` | Get a book |
| PUT | `/{id}` | Update a book |
| PATCH | `/{id}/privacy` | Toggle privacy |
| DELETE | `/{id}` | Delete a book |
| DELETE | `/batch` | Batch delete |
| POST | `/{id}/regenerate-notes` | Regenerate AI notes |
| GET | `/{id}/community-stats` | Community rating |

</details>

<details>
<summary><strong>AI</strong> — <code>/api/ai</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate-notes/{id}` | Generate AI notes |
| POST | `/recommendations/library` | Library-based recommendations |
| POST | `/recommendations/custom` | Custom preference recommendations |

</details>

<details>
<summary><strong>Social</strong> — <code>/api/social</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile/me` | Current user profile |
| GET | `/profile/{username}` | Profile by username |
| PUT | `/profile` | Update profile |
| GET | `/profile/{username}/books` | User's books (respects privacy) |
| POST | `/follow/{userId}` | Follow / send request |
| DELETE | `/follow/{userId}` | Unfollow |
| GET | `/followers/{userId}` | Paginated followers |
| GET | `/following/{userId}` | Paginated following |
| GET | `/requests` | Pending follow requests |
| POST | `/requests/{id}/approve` | Approve request |
| POST | `/requests/{id}/reject` | Reject request |
| GET | `/search` | Search users |
| GET | `/discover` | Discover users |
| GET | `/suggestions` | Suggested users |
| GET | `/similar` | Similar taste users |
| GET | `/feed` | Activity feed |
| POST | `/reflections` | Create reflection |
| GET | `/reflections/{id}` | Get reflection |
| DELETE | `/reflections/{id}` | Delete reflection |
| PATCH | `/reflections/{id}/privacy` | Update privacy |
| GET | `/reflections/following` | Following reflections |
| GET | `/reflections/everyone` | Public reflections |
| GET | `/reflections/search` | Search reflections |
| POST | `/reflections/{id}/like` | Toggle like |
| POST | `/reflections/{id}/comments` | Add comment |
| GET | `/reflections/{id}/comments` | Get comments |
| POST | `/reflections/{id}/save` | Toggle bookmark |
| GET | `/reflections/saved` | Saved reflections |

</details>

<details>
<summary><strong>Reviews</strong> — <code>/api/reviews</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/book/{bookId}` | Create review |
| PUT | `/{reviewId}` | Update review |
| DELETE | `/{reviewId}` | Delete review |
| GET | `/{reviewId}` | Get review |
| GET | `/book/{bookId}` | Reviews for a book |
| GET | `/user/{userId}` | Reviews by user |
| GET | `/feed` | Following feed |
| GET | `/search` | Search reviews |
| POST | `/{reviewId}/like` | Toggle like |
| POST | `/{reviewId}/save` | Toggle bookmark |
| GET | `/saved` | Saved reviews |
| POST | `/{reviewId}/comments` | Add comment |
| GET | `/{reviewId}/comments` | Get comments |

</details>

<details>
<summary><strong>Reading Goals</strong> — <code>/api/goals</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Set/update goal |
| GET | `/current` | Current year goal |
| GET | `/{year}` | Goal by year |
| GET | `/all` | All goals history |
| DELETE | `/{goalId}` | Delete goal |

</details>

<details>
<summary><strong>Reading Lists</strong> — <code>/api/lists</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create list |
| PUT | `/{listId}` | Update list |
| DELETE | `/{listId}` | Delete list |
| GET | `/{listId}` | Get list with items |
| GET | `/mine` | My lists |
| GET | `/user/{userId}` | User's public lists |
| GET | `/browse` | Browse popular lists |
| GET | `/search` | Search lists |
| GET | `/saved` | Saved lists |
| POST | `/{listId}/items` | Add book to list |
| DELETE | `/{listId}/items/{itemId}` | Remove from list |
| POST | `/{listId}/like` | Toggle like |

</details>

<details>
<summary><strong>Notifications</strong> — <code>/api/notifications</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | All notifications |
| GET | `/unread` | Unread notifications |
| GET | `/count` | Unread count |
| POST | `/{id}/read` | Mark as read |
| POST | `/read-all` | Mark all read |

</details>

<details>
<summary><strong>Reading Activity</strong> — <code>/api/activities</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dates` | Activity dates (streak) |
| GET | `/details` | Dates with page counts |
| GET | `/daily-stats` | Last 7 days |
| GET | `/period-stats` | Week/month/year totals |

</details>

---

## Getting Started

### Prerequisites

- **Java 21**
- **Node.js 18+**
- **PostgreSQL**
- **Google Gemini API key** (for AI features)
- **Firebase project** (for photo storage & hosting)
- **Brevo account** (optional — for password reset emails)

### Backend

```bash
cd backend

# 1. Create a PostgreSQL database
psql -U postgres -c "CREATE DATABASE booksiread_db;"

# 2. Configure environment
#    Edit src/main/resources/application.properties with your:
#    - Database credentials
#    - JWT secret
#    - Gemini API key
#    - Brevo API key
#    - CORS allowed origins

# 3. Run
./mvnw spring-boot:run
```

API available at `http://localhost:8080/api`

### Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Create .env
VITE_API_URL=http://localhost:8080/api
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id

# 3. Start dev server
npm run dev
```

Open `http://localhost:5173` — create an account and start tracking.

---

## Deployment

### Frontend — Firebase Hosting

```bash
cd frontend
npm run build
firebase deploy
```

### Backend — Docker + Cloud Run

```bash
cd backend
docker build -t booksiread-backend .
docker run -p 8080:8080 --env-file .env booksiread-backend

# Or deploy directly to Cloud Run:
gcloud run deploy booksiread-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Database Schema

20 JPA entities organized into domains:

| Domain | Entities |
|--------|----------|
| **Core** | `User`, `Book`, `ReadingGoal`, `ReadingActivity` |
| **Social** | `UserFollow`, `FollowRequest`, `UserActivity`, `Notification` |
| **Reflections** | `Reflection`, `ReflectionComment`, `ReflectionLike`, `SavedReflection` |
| **Reviews** | `BookReview`, `ReviewComment`, `ReviewLike`, `SavedReview` |
| **Lists** | `ReadingList`, `ReadingListItem`, `ReadingListLike` |
| **Auth** | `PasswordResetToken` |

---

## Scripts

| Frontend | | Backend | |
|----------|---|---------|---|
| `npm run dev` | Dev server | `./mvnw spring-boot:run` | Dev server |
| `npm run build` | Production build | `./mvnw clean package` | Build JAR |
| `npm run preview` | Preview build | `./mvnw test` | Run tests |
| `npm run lint` | ESLint | | |

---

## License

MIT

---

<div align="center">

**[Live App](https://booksiread.web.app)** · Built by [Dnyanesh Agale](https://github.com/dnyaneshagale)

</div>

