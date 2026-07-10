# 📖 QuillForge API Documentation

This document describes all REST API routes exposed by the QuillForge backend.  
Interactive Swagger UI is always available at `/api-docs` on any running instance.

**Base URL:** `/api/v1`  
**Auth mechanism:** `httpOnly` JWT cookie named `accessToken` — sent automatically by the browser on every credentialed Axios request.

---

## 🗺️ Route Overview

```
/api/v1/users/*   → user.routes.js → user.controller.js
/api/v1/blogs/*   → blog.routes.js → blog.controller.js / ai.controller.js
```

---

## 🔒 Authentication Routes — `/api/v1/users`

### 1. Register
- **`POST /api/v1/users/register`**
- **Auth:** None · **Rate limit:** 5 req / 1 hour per IP
- **Request Body:**
  ```json
  {
    "username": "coder_writer",
    "email": "writer@gmail.com",
    "password": "SecurePassword123!"
  }
  ```
- **Success (201):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "createdUser": {
        "_id": "65893a72cb123e4567890def",
        "username": "coder_writer",
        "email": "writer@gmail.com",
        "role": "user"
      }
    }
  }
  ```
- **Flow:** `registerLimiter` → `registerUser` (hashes password w/ bcrypt, saves to MongoDB)

---

### 2. Login
- **`POST /api/v1/users/login`**
- **Auth:** None · **Rate limit:** 10 req / 15 min per IP
- **Request Body:**
  ```json
  {
    "email": "writer@gmail.com",
    "password": "SecurePassword123!"
  }
  ```
- **Success (200):** Sets an `httpOnly` JWT cookie named `accessToken`.
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "65893a72cb123e4567890def",
        "username": "coder_writer",
        "email": "writer@gmail.com",
        "role": "user"
      }
    }
  }
  ```
- **Flow:** `loginLimiter` → `loginUser` (verifies password, signs JWT, sets cookie)

---

### 3. Validate Email (Real-time DNS Check)
- **`GET /api/v1/users/validate-email?email=writer@gmail.com`**
- **Auth:** None · **Rate limit:** 10 req / 1 min per IP (prevents bulk enumeration)
- **Success (200):**
  ```json
  {
    "success": true,
    "data": {
      "isValid": true,
      "exists": true,
      "isGoogle": true,
      "reason": "Gmail account exists on Google"
    }
  }
  ```
- **Flow:** `validateEmailLimiter` → `validateEmail` (DNS MX record lookup)

---

### 4. Get Current User
- **`GET /api/v1/users/current-user`**
- **Auth:** JWT required
- **Success (200):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "65893a72cb123e4567890def",
      "username": "coder_writer",
      "email": "writer@gmail.com",
      "role": "user",
      "aiGenerationsThisMonth": 1,
      "aiGenerationsResetAt": "2026-08-01T00:00:00.000Z"
    }
  }
  ```
- **Flow:** `verifyjwt` → `getCurrentUser`

---

### 5. Logout
- **`POST /api/v1/users/logout`**
- **Auth:** JWT required
- **Success (200):** Clears the `accessToken` cookie.
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```
- **Flow:** `verifyjwt` → `logoutUser`

---

### 6. Admin Smoke Test
- **`GET /api/v1/users/admin-test`**
- **Auth:** JWT required + `role === "admin"`
- **Success (200):**
  ```json
  { "success": true, "message": "You da real admin" }
  ```
- **Flow:** `verifyjwt` → `verifyadmin` → inline handler

---

### 7. Google OAuth — Initiate
- **`GET /api/v1/users/google`**
- **Auth:** None
- **Action:** Redirects browser to Google's consent screen (`profile` + `email` scopes).
- **Flow:** `passport.authenticate("google", { scope: ["profile","email"] })`

---

### 8. Google OAuth — Callback
- **`GET /api/v1/users/google/callback`**
- **Auth:** None (Google POSTs back here)
- **Action:** Passport exchanges the code, finds/creates the user in MongoDB, mints a JWT cookie, then redirects to:
  - `/admin` if `role === "admin"`
  - `/dashboard` for all other users
- **Flow:** `passport.authenticate("google", { session: false })` → inline handler → redirect

---

## 📝 Blog Routes — `/api/v1/blogs`

> **Route ordering matters:** `ai-generate`, `ai-presets`, and `upload` are declared **before** `/:id` routes so Express doesn't mistake those literal strings for Mongo IDs.

---

### 9. List All Blogs
- **`GET /api/v1/blogs`**
- **Auth:** Optional (soft — uses `optionalAuth`)
- **Behaviour by caller:**
  | Caller | Sees |
  |---|---|
  | Unauthenticated visitor | Published posts only |
  | Logged-in user | Published posts + own drafts |
  | Admin | All posts (published + all drafts) |
- **Success (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "65893b82cb123e4567890abc",
        "title": "Clean Coding Practices",
        "slug": "clean-coding-practices",
        "excerpt": "Write simple code.",
        "content": "<p>Keep methods small...</p>",
        "category": "Technology",
        "author": { "_id": "...", "username": "coder_writer" },
        "isPublished": true,
        "views": 42,
        "likes": [],
        "createdAt": "2026-06-15T10:00:00.000Z"
      }
    ]
  }
  ```
- **Flow:** `optionalAuth` → `getAllBlogs`

---

### 10. Get Single Blog
- **`GET /api/v1/blogs/:id`**
- **Auth:** None
- **Path Param:** `id` — MongoDB `_id` of the blog document
- **Success (200):** Full populated blog document (same shape as above, with full `content`).
- **Flow:** `getBlogById`

---

### 11. Create Blog
- **`POST /api/v1/blogs`**
- **Auth:** JWT required
- **Request Body:**
  ```json
  {
    "title": "Creating Microservices",
    "content": "<p>Content HTML...</p>",
    "excerpt": "Brief summary",
    "category": "Technology",
    "isPublished": true,
    "featuredImage": "https://res.cloudinary.com/demo/image.png"
  }
  ```
- **Success (201):** Returns the newly created blog document.
- **Flow:** `verifyjwt` → `createBlog` (auto-generates `slug` from title)

---

### 12. Update Blog
- **`PUT /api/v1/blogs/:id`**
- **Auth:** JWT required (author or admin only — checked inside controller)
- **Request Body:** Any partial blog fields to update.
- **Success (200):** Returns the updated blog document.
- **Flow:** `verifyjwt` → `updateBlog`

---

### 13. Delete Blog
- **`DELETE /api/v1/blogs/:id`**
- **Auth:** JWT required (author or admin only)
- **Success (200):**
  ```json
  { "success": true, "message": "Blog deleted successfully" }
  ```
- **Flow:** `verifyjwt` → `deleteBlog`

---

### 14. Upload Blog Image
- **`POST /api/v1/blogs/upload`**
- **Auth:** JWT required
- **Request Body:** `multipart/form-data` with field name `image` (max 5 MB)
- **Success (200):**
  ```json
  {
    "success": true,
    "url": "https://res.cloudinary.com/demo/image/upload/v1/featured.png"
  }
  ```
- **Flow:** `verifyjwt` → `multer.single("image")` (memory buffer, Docker-safe) → `uploadBlogImage` (streams buffer to Cloudinary, returns `secure_url`)

---

### 15. Increment View Count
- **`PATCH /api/v1/blogs/:id/view`**
- **Auth:** None · **Rate limit:** 1 req / 1 min per IP (prevents inflation)
- **Success (200):**
  ```json
  { "success": true, "views": 43 }
  ```
- **Flow:** `viewRateLimiter` → `incrementView`

---

### 16. Toggle Like
- **`PATCH /api/v1/blogs/:id/like`**
- **Auth:** JWT required
- **Action:** Adds the user's `_id` to `likes[]` if not present; removes it if already there (toggle).
- **Success (200):**
  ```json
  {
    "success": true,
    "data": { "likes": 5, "liked": true }
  }
  ```
- **Flow:** `verifyjwt` → `toggleLike`

---

## 🤖 AI Generation Routes — `/api/v1/blogs`

### 17. Generate Blog Content
- **`POST /api/v1/blogs/ai-generate`**
- **Auth:** JWT required
- **Rate limits:** 1 req / 15 sec per IP (burst guard) + monthly quota per user
  - Free `user` role: **3 generations/month** (resets automatically)
  - `pro` and `admin` roles: **unlimited**
- **Request Body:**
  ```json
  {
    "subject": "Kubernetes networking",
    "tone": "Professional",
    "blogType": "Technical",
    "context": "Focus on CNI plugins and pod-to-pod routing"
  }
  ```
  **Tone options:** `Professional` · `Casual` · `Humorous` · `Enthusiastic` · `Academic`  
  **Blog type options:** `Technical` · `Tutorial` · `Case Study` · `Narrative` · `Creative` · `Opinion`
- **Success (200):**
  ```json
  {
    "success": true,
    "data": {
      "title": "Inside Kubernetes Networking: CNI Plugins Explained",
      "excerpt": "A deep dive into how pods talk to each other.",
      "content": "<h2>Introduction</h2><p>...</p>",
      "coverImage": "https://images.unsplash.com/...",
      "preset": { "_id": "...", "subject": "...", "tone": "..." }
    }
  }
  ```
- **Flow:** `verifyjwt` → `aiRateLimiter` → `verifyAiLimit` (quota check) → `generateBlogContent` (sanitizes input, calls Groq Cloud AI, parses JSON response, fetches Unsplash cover image) → quota is incremented only on success

---

### 18. List AI Presets
- **`GET /api/v1/blogs/ai-presets`**
- **Auth:** JWT required
- **Success (200):** Array of the current user's saved prompt presets.
  ```json
  {
    "success": true,
    "data": [
      { "_id": "...", "subject": "Kubernetes", "tone": "Professional", "blogType": "Technical", "context": "CNI plugins" }
    ]
  }
  ```
- **Flow:** `verifyjwt` → `getUserPresets`

---

### 19. Delete AI Preset
- **`DELETE /api/v1/blogs/ai-presets/:id`**
- **Auth:** JWT required
- **Path Param:** `id` — MongoDB `_id` of the preset document
- **Success (200):**
  ```json
  { "success": true, "message": "Preset deleted" }
  ```
- **Flow:** `verifyjwt` → `deleteUserPreset`

---

## 🚦 Rate Limit Reference

| Endpoint | Limit | Window | Guard |
|---|---|---|---|
| `POST /users/register` | 5 req | 1 hour | `registerLimiter` |
| `POST /users/login` | 10 req | 15 min | `loginLimiter` |
| `GET /users/validate-email` | 10 req | 1 min | `validateEmailLimiter` |
| `POST /blogs/ai-generate` | 1 req | 15 sec | `aiRateLimiter` |
| `PATCH /blogs/:id/view` | 1 req | 1 min | `viewRateLimiter` |

All limits are per IP. Standard `RateLimit-*` response headers are included.  
`aiRateLimiter` is **disabled in the test environment** (`NODE_ENV=test`) so quota tests can assert 403 cleanly.

---

## ❌ Error Shape

All errors — including validation failures, 401/403 guards, and unhandled throws — return the same shape via the global error handler in `app.js`:

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

Custom `ApiError` instances (in `utilities/errors.js`) carry their own `statusCode`; everything else defaults to `500`.
