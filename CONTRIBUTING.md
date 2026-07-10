# 🤝 Contributing to QuillForge

Thank you for your interest in contributing! This guide walks you through the project structure, development workflow, code style, and testing standards.

---

## 🗺️ Where to Start Reading the Code

Open files in this order to build a mental model:

1. `Frontend/src/index.jsx` — React entry point. Mounts `<App />`.
2. `Frontend/src/App.jsx` — All 6 client-side routes. Your frontend map.
3. `Frontend/src/pages/home.jsx` — First page visitors see. Read the top comment block.
4. `backend/start/server.js` — Backend entry. Shows `.env` → DB → listen.
5. `backend/start/app.js` — All middleware + where the two route groups mount. Read the `REQUEST FLOW` comment.

Then branch into the area you need:

```
Auth?      → routes/user.routes.js  → controllers/user.controller.js
Blogs?     → routes/blog.routes.js  → controllers/blog.controller.js
AI?        → controllers/ai.controller.js → middlewares/quota.middleware.js
DB Schema? → models/user.model.js   → models/blog.model.js
```

---

## 💻 Development Workflow

### 1. Fork & Branch
```bash
git clone https://github.com/unitedtechlab/QUillForge_.git
cd QUillForge_
git checkout -b feature/your-feature-name
```

### 2. Install Dependencies
```bash
cd backend  && npm install
cd ../Frontend && npm install
```

### 3. Configure Environment
Required variables — the server **will not start** without all five:
- `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `SESSION_SECRET`, `GROQ_API_KEY`

See `README.md → Environment Variables` for the full list.

### 4. Run Locally
```bash
# Terminal 1 — Backend (nodemon hot-reload, port 8102)
cd backend && npm run dev

# Terminal 2 — Frontend (CRA dev server, port 3000)
cd Frontend && npm start
```

### 5. Run Tests (Both Must Pass)
```bash
cd backend  && npm test   # Jest + Supertest (19 tests)
cd Frontend && npm test   # Vitest + Testing Library (9 tests)
```

### 6. Open a Pull Request
- Conventional commits title (see below)
- Description explaining what changed and why
- Reference issues with `Closes #123`

---

## 🧼 Code Style Guidelines

### General
- Every file must have a header comment explaining its role and request/data flow (see `app.js` or `admin.middleware.js` as examples).
- Route files are **mapping tables only** — business logic belongs in controllers.
- Controllers should be thin: validate input → call model → return response.

### Backend
- **ESM modules only** — `import`/`export`, never `require()`.
- **asyncHandler wrapper** — always wrap async controllers with `asynchandler` from `utilities/asynchandler.js`.
- **ApiError / ApiResponse** — use the classes in `utilities/errors.js` and `utilities/response.js` for consistent JSON shapes.
- **No disk I/O** — image processing goes through the memory-based Multer middleware (Docker containers have ephemeral filesystems).

### Frontend
- **`.jsx` extension** for any React file containing markup.
- **Page-level comment blocks** — each page must document its route, API calls it makes, and key features (see `home.jsx` or `BlogDetails.jsx`).
- **No auth guards in `App.jsx`** — guards live inside each page (call `/api/v1/users/current-user` on mount, redirect if unauthenticated).
- **DOMPurify** — always sanitize `dangerouslySetInnerHTML` content.

---

## 🧪 Testing Standards

### Backend — Jest + Supertest
```bash
cd backend && npm test
```
- 19 tests: user auth, blog CRUD, AI generation + quota enforcement.
- All tests use **mocked Mongoose models** — no live DB required.
- New tests go in `backend/tests/<feature>.test.js`.
- AI rate limiter is disabled automatically under `NODE_ENV=test`.

### Frontend — Vitest + Testing Library
```bash
cd Frontend && npm test
```
- 9 tests: auth flows, blog creation, blog detail rendering, TTS narration.
- New tests go in `Frontend/src/__tests__/<feature>.test.jsx`.
- Mock `../api/axios` for any component that makes API calls.

### PR Test Requirements
- All existing tests must pass.
- New controllers or middlewares need at least one unit test.
- New React pages need at least a render smoke test.

---

## 💬 Commit Guidelines

Format: `<type>(<scope>): <short description>`

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code restructure (no behavior change) |
| `test` | Adding or fixing tests |
| `chore` | Build, dependencies, CI |

**Examples:**
```
feat(auth): add Google OAuth registration support
fix(blogs): repair view count increment handler
docs(api): add AI preset routes to API_DOCUMENTATION.md
test(quota): add monthly quota reset unit test
chore(ci): add GROQ_MODEL to GitHub Actions env vars
```
