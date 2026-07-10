# QuillForge

A retro-themed, terminal-aesthetic blogging platform for developers and writers. Draft, publish, and read engineering posts with a dark-mode CRT pixel UI, AI-assisted writing via Groq Cloud AI, secure JWT + Google OAuth authentication, real-time email verification, offline draft safety, text-to-speech narration, and a full admin moderation dashboard.

**Live:** [quillforge.unitedtechlab.com](https://quillforge.unitedtechlab.com)  
**API Docs (Swagger):** available at `/api-docs` on any running backend instance

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Repository Layout](#repository-layout)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Running Locally](#running-locally)
7. [Testing](#testing)
8. [API Reference](#api-reference)
9. [Frontend Pages and Routing](#frontend-pages-and-routing)
10. [AI Blog Generation](#ai-blog-generation)
11. [Authentication Flow](#authentication-flow)
12. [Image Upload Pipeline](#image-upload-pipeline)
13. [Rate Limiting](#rate-limiting)
14. [Deployment](#deployment)
15. [Contributing](#contributing)
16. [License](#license)

---

## Architecture Overview

QuillForge is a decoupled client-server monorepo. The backend is a stateless REST API; the frontend is a React SPA that communicates via Axios with credentials (httpOnly cookies).

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                         │
│  React SPA (CRA) · Tailwind · Framer Motion · Recharts     │
└────────────────────────────┬────────────────────────────────┘
                             │  Axios (withCredentials)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  Node.js / Express 5 API                    │
│  Helmet · CORS · Cookie-Parser · Express-Session            │
│  Passport (Google OAuth 2.0) · JWT (httpOnly cookies)       │
│  Express-Rate-Limit · Multer (memory storage)               │
│  Sanitize-HTML · Swagger UI                                 │
├──────────┬──────────┬───────────┬───────────┬───────────────┤
│ MongoDB  │Cloudinary│  Groq AI  │ Unsplash  │ DNS MX Lookup │
│ (Atlas)  │ (images) │ (content) │ (covers)  │ (email check) │
└──────────┴──────────┴───────────┴───────────┴───────────────┘
```

---

## Repository Layout

```
QuillForge_/
├── Frontend/                   # React SPA (Create React App)
│   ├── public/                 # Static assets (favicon, pixel art, sitemap)
│   ├── src/
│   │   ├── api/axios.js        # Axios instance (env-configurable base URL)
│   │   ├── pages/
│   │   │   ├── home.jsx            # Landing page with live blog preview
│   │   │   ├── login.jsx           # Login (email/password + Google OAuth)
│   │   │   ├── register.jsx        # Registration with real-time email validation
│   │   │   ├── dashboard.jsx       # User dashboard (tabs: overview, create, my blogs, feed, AI)
│   │   │   ├── admin_dashboard.jsx # Admin moderation panel
│   │   │   ├── BlogDetails.jsx     # Single blog view with TTS narration
│   │   │   ├── CreateBlogPage.jsx  # Rich blog editor (used as dashboard tab)
│   │   │   ├── ReadBlogsFeed.jsx   # Public blog feed (used as dashboard tab)
│   │   │   ├── UserOwnBlogs.jsx    # User's own blogs list (used as dashboard tab)
│   │   │   └── AIAssistantPage.jsx # AI blog generator UI (used as dashboard tab)
│   │   ├── __tests__/          # Vitest test suites
│   │   ├── App.jsx             # Router setup
│   │   ├── index.jsx           # React entry point
│   │   ├── App.css             # CRT overlay and retro theme styles
│   │   └── index.css           # Tailwind directives and base styles
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vitest.config.js
│   └── package.json
│
├── backend/                    # Express 5 REST API (ES Modules)
│   ├── start/
│   │   ├── server.js           # Bootstrap: env loading, DB connect, listen
│   │   ├── app.js              # Express app setup, middleware, routes
│   │   ├── config/
│   │   │   ├── passport.js     # Google OAuth 2.0 strategy
│   │   │   └── swagger.json    # OpenAPI 3 spec
│   │   ├── controllers/
│   │   │   ├── user.controller.js  # Register, login, logout, email validation
│   │   │   ├── blog.controller.js  # CRUD, views, likes, image upload
│   │   │   └── ai.controller.js    # Groq content generation, presets
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js   # verifyjwt (strict) + optionalAuth (soft)
│   │   │   ├── admin.middleware.js  # Admin role gate
│   │   │   ├── quota.middleware.js  # Free-tier AI generation limit (3/month)
│   │   │   └── multer.middleware.js # Memory-based file upload (Docker-safe)
│   │   ├── models/
│   │   │   ├── user.model.js       # User schema (bcrypt, JWT, AI quota)
│   │   │   ├── blog.model.js       # Blog schema (slug, views, likes)
│   │   │   └── aiPreset.model.js   # Saved AI writing presets
│   │   ├── routes/
│   │   │   ├── user.routes.js      # /api/v1/users/*
│   │   │   └── blog.routes.js      # /api/v1/blogs/*
│   │   └── db/
│   │       └── connectmongo.js     # Mongoose connection
│   ├── utilities/
│   │   ├── asynchandler.js     # Promise-based express error wrapper
│   │   ├── errors.js           # ApiError class
     │   ├── response.js         # ApiResponse class
│   │   └── cloudinary.js       # Stream-based Cloudinary uploader
│   ├── tests/                  # Jest test suites
│   ├── Dockerfile              # Production Docker image (Node 20)
│   └── package.json
│
├── .github/workflows/
│   └── backend-deploy.yml      # CI/CD: build Docker → SCP to EC2 → deploy
│   └── backend-deploy.yml      # CI/CD: build Docker → SCP to EC2 → deploy
│
├── .github/workflows/
│   └── backend-deploy.yml      # CI/CD: build Docker → SCP to EC2 → deploy
├── API_DOCUMENTATION.md
├── CONTRIBUTING.md
├── DEPLOYMENT.md
└── README.md
```

---

## Tech Stack

**Frontend:** React 19, React Router 7, Tailwind CSS 3, Framer Motion, Recharts, Lucide Icons, DOMPurify, Axios, Vitest

**Backend:** Node.js 20, Express 5, Mongoose 9, Passport.js (Google OAuth 2.0), JSON Web Tokens, bcryptjs, Helmet, express-rate-limit, Multer, sanitize-html, Swagger UI, Jest + Supertest

**External Services:** MongoDB Atlas, Cloudinary (image hosting), Groq AI SDK (content generation), Unsplash (cover images), Google OAuth 2.0

---

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **npm** >= 10
- **MongoDB** (local instance or MongoDB Atlas connection string)
- **Cloudinary** account (for blog image uploads)
- **Google Cloud Console** project (for OAuth credentials)
- **Groq API key** (for AI blog generation)

### Clone

```bash
git clone https://github.com/unitedtechlab/QUillForge_.git
cd QUillForge_
```

### Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../Frontend
npm install
```

---

## Environment Variables

### Backend (`backend/.env`)

Create a `.env` file in the `backend/` directory:

```env
# ─── Required ────────────────────────────────────────
PORT=8102
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/quillforge
JWT_SECRET=your-random-256-bit-secret
JWT_EXPIRES_IN=7d
SESSION_SECRET=your-random-session-secret
GROQ_API_KEY=your-groq-api-key

# ─── Google OAuth ────────────────────────────────────
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8102/api/v1/users/google/callback

# ─── Cloudinary ──────────────────────────────────────
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# ─── Optional ────────────────────────────────────────
UNSPLASH_ACCESS_KEY=your-unsplash-key          # AI cover images; falls back to local pixel art
GROQ_MODEL=openai/gpt-oss-20b                  # Overrides the default model
FRONTEND_URL=http://localhost:3000              # OAuth redirect target
NODE_ENV=development
```

The server will refuse to start if any of the five required variables (`MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `SESSION_SECRET`, `GROQ_API_KEY`) are missing.

### Frontend

The frontend reads a single optional variable. Set it before running `npm start`, or add a `.env` file in `Frontend/`:

```env
REACT_APP_BACKEND_BASE_URL=http://localhost:8102
```

Defaults to `http://localhost:8102` when unset.

---

## Running Locally

Start the backend first (it must be running for the frontend to function):

```bash
# Terminal 1 — Backend (with hot-reload via nodemon)
cd backend
npm run dev
# → Server is running on port 8102

# Terminal 2 — Frontend (CRA dev server)
cd Frontend
npm start
# → Opens http://localhost:3000
```

The frontend proxies all API calls to the backend via the Axios instance configured in `src/api/axios.js`.

---

## Testing

### Backend (Jest + Supertest)

```bash
cd backend
npm test
```

Runs 19 unit tests covering user authentication (register, login, JWT verification, admin middleware), blog CRUD (create, read, update, delete, views, likes), and AI generation (quota enforcement, preset management). All tests use mocked Mongoose models — no live database required.

### Frontend (Vitest + Testing Library)

```bash
cd Frontend
npm test
```

Runs 9 tests covering auth flows (login form validation, registration, Google OAuth button rendering) and blog functionality (create page draft saving, blog detail rendering, text-to-speech narration).

### Production Build

```bash
cd Frontend
npm run build
```

Outputs optimized static files to `Frontend/build/` ready for deployment behind any static file server (Nginx, Vercel, Netlify, S3 + CloudFront).

---

## API Reference

Base URL: `/api/v1`

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/users/register` | — | Create a new account (username, email, password) |
| `POST` | `/users/login` | — | Log in and receive a JWT httpOnly cookie |
| `GET` | `/users/validate-email` | — | Real-time DNS MX email validation (rate-limited) |
| `GET` | `/users/current-user` | JWT | Get the authenticated user's profile |
| `POST` | `/users/logout` | JWT | Clear the access token cookie |
| `GET` | `/users/google` | — | Initiate Google OAuth 2.0 flow |
| `GET` | `/users/google/callback` | — | Google OAuth callback (sets JWT cookie, redirects) |

### Blogs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/blogs` | Optional | List blogs (published for all; + own drafts if logged in; all if admin) |
| `POST` | `/blogs` | JWT | Create a new blog post |
| `GET` | `/blogs/:id` | — | Get a single blog by ID |
| `PUT` | `/blogs/:id` | JWT | Update a blog (author or admin only) |
| `DELETE` | `/blogs/:id` | JWT | Delete a blog (author or admin only) |
| `PATCH` | `/blogs/:id/view` | — | Increment view count (rate-limited: 1/min per IP) |
| `PATCH` | `/blogs/:id/like` | JWT | Toggle like on a blog |
| `POST` | `/blogs/upload` | JWT | Upload a blog image to Cloudinary |

### AI Generation

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/blogs/ai-generate` | JWT | Generate a full blog post via Groq Cloud AI |
| `GET` | `/blogs/ai-presets` | JWT | List the user's saved AI writing presets |
| `DELETE` | `/blogs/ai-presets/:id` | JWT | Delete a saved preset |

Interactive Swagger documentation is available at `/api-docs` on any running backend instance.

---

## Frontend Pages and Routing

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `home.jsx` | Public landing page with feature showcase and live blog previews |
| `/login` | `login.jsx` | Login form with real-time email validation and Google OAuth |
| `/register` | `register.jsx` | Registration with password strength meter and email verification |
| `/dashboard` | `dashboard.jsx` | Authenticated user hub with tabbed sub-pages: Overview (analytics), Create Blog, My Blogs, Read Feed, AI Assistant |
| `/admin` | `admin_dashboard.jsx` | Admin moderation panel (all blogs, user management, analytics) |
| `/blog/:id` | `BlogDetails.jsx` | Full blog view with text-to-speech, likes, share, and structured data |

The dashboard uses internal tab navigation rather than separate routes. `CreateBlogPage`, `UserOwnBlogs`, `ReadBlogsFeed`, and `AIAssistantPage` are rendered as child components within the dashboard layout.

---

## AI Blog Generation

QuillForge integrates Groq Cloud AI for AI-assisted blog writing:

1. The user provides a subject, tone (Professional/Casual/Humorous/Enthusiastic/Academic), and blog type (Technical/Tutorial/Case Study/Narrative/Creative/Opinion), plus optional context.
2. The backend sanitizes all inputs to prevent prompt injection, then sends a structured prompt to Groq requesting JSON output with `title`, `excerpt`, `content` (HTML), and `imageKeywords`.
3. The response is parsed with a robust JSON parser that falls back to regex extraction if the model returns malformed JSON.
4. A cover image is fetched from Unsplash using the generated keywords (falls back to local pixel art placeholders if no Unsplash key is configured).
5. The generated content is returned to the frontend editor where the user can review, edit, and publish.

**Quota System:** Free users get 3 AI generations per month (resets automatically). Admin and Pro users have unlimited access. The quota is only charged after a successful generation.

**Presets:** Users can save their preferred tone/type/context combinations as named presets for quick reuse.

---

## Authentication Flow

QuillForge supports two authentication methods:

### Email/Password
1. Registration validates the email domain via DNS MX record lookup to ensure it has valid mail servers.
2. Passwords are hashed with bcryptjs (10 salt rounds) before storage.
3. On login, a signed JWT is issued as an `httpOnly`, `secure`, `sameSite=none` cookie.
4. Protected routes verify the JWT via the `verifyjwt` middleware.

### Google OAuth 2.0
1. User clicks "Continue with Google" → redirected to Google's consent screen.
2. Google returns the user's profile to the callback URL.
3. The Passport strategy finds or creates the user in MongoDB.
4. A JWT cookie is set and the user is redirected to `/dashboard` (or `/admin` for admin users).

### Role System
- **user** — Standard access (create, edit, delete own blogs; 3 AI generations/month)
- **pro** — Unlimited AI generations
- **admin** — Full access to all blogs, moderation dashboard, unlimited AI

---

## Image Upload Pipeline

Blog images are uploaded through a memory-based Multer middleware (no disk writes, Docker-safe) and streamed directly to Cloudinary:

1. Frontend sends a multipart form with the image file to `POST /blogs/upload`.
2. Multer captures the file buffer in memory (max 5 MB).
3. The buffer is streamed to Cloudinary via `upload_stream`.
4. The Cloudinary `secure_url` is returned to the frontend for embedding in the blog.

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /users/register` | 5 requests | 1 hour |
| `POST /users/login` | 10 requests | 15 minutes |
| `GET /users/validate-email` | 10 requests | 1 minute |
| `POST /blogs/ai-generate` | 1 request | 15 seconds |
| `PATCH /blogs/:id/view` | 1 request | 1 minute |

All limits are per IP address. Standard `RateLimit-*` headers are included in responses.

---

## Deployment

### Backend (Docker + EC2)

The included GitHub Actions workflow (`.github/workflows/backend-deploy.yml`) automates deployment:

1. Builds a Docker image from `backend/Dockerfile` (Node 20 base).
2. SCPs the image tarball to an EC2 instance.
3. Loads the image, stops the old container, and starts a new one with environment variables from GitHub Secrets.

To deploy manually:

```bash
cd backend
docker build -t quillforge-backend .
docker run -d \
  --name quillforge-backend \
  --env-file .env \
  -p 8102:8102 \
  --restart unless-stopped \
  quillforge-backend
```

### Frontend (Static Hosting)

```bash
cd Frontend
npm run build
```

Deploy the `build/` folder to any static hosting provider. Set `REACT_APP_BACKEND_BASE_URL` to your backend's public URL before building.

For production, configure your reverse proxy (Nginx/Caddy) to serve the SPA with a fallback to `index.html` for client-side routing.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines. In short:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and ensure all tests pass (`npm test` in both `backend/` and `Frontend/`).
4. Ensure the frontend builds with zero warnings: `npm run build` in `Frontend/`.
5. Open a pull request with a clear description of your changes.

---

## License

Frontend: see [Frontend/LICENSE](./Frontend/LICENSE).  
Backend: ISC.
