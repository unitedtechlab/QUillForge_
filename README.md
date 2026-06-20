# 🖋️ QuillForge — Developer Blogging Platform

QuillForge is a premium, retro-themed terminal-aesthetic blogging platform designed specifically for developers and writers to write, manage, and read clean engineering posts.

---

## 📁 Repository Layout

The project is structured as a monorepo containing distinct frontend and backend directories under `quillforge/`:

- **`quillforge/Frontend/`**: React SPA application styled using a dark-mode CRT pixelated UI system. Contains pages for author registration, login, blog creation with offline drafts, and blog reading with speech synthesis narrator.
- **`quillforge/backend/`**: Node.js/Express REST API supporting database validation, secure JWT HTTPOnly cookie verification, atomic counter updates, file streaming, and custom middleware flows.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js
- **Routing**: React Router
- **HTTP Client**: Axios (configured with credentials and base URL routing)
- **Styling**: Vanilla CSS (CRT glassmorphic styles and retro elements)
- **Icons**: Lucide React
- **Test Runner**: Vitest + JSDOM + React Testing Library

### Backend
- **Runtime**: Node.js (configured as native ESM modules)
- **Framework**: Express.js
- **Authentication**: Passport.js (Local credentials & Google OAuth 2.0 integration)
- **Tokens & Cookies**: JSON Web Tokens (JWT) + Cookie Parser
- **Database**: MongoDB Atlas + Mongoose ODM
- **Testing**: Jest + Supertest

---

## 🚀 Getting Started

### 1. Backend Setup & Run

1. Navigate to the backend directory:
   ```bash
   cd quillforge/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The backend API will start on port `8102` and expose its Swagger interface at `http://localhost:8102/api-docs`.

4. Run the backend tests:
   ```bash
   npm test
   ```

### 2. Frontend Setup & Run

1. Navigate to the frontend directory:
   ```bash
   cd quillforge/Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend dev server will start and be accessible at `http://localhost:3000`.

4. Run the frontend tests:
   ```bash
   npm test
   ```

---

## 🔒 Security & Middleware Features

- **JWT Cookie Protection**: Private routes on the backend require JWT validation using `verifyjwt` middleware.
- **Google Validation Check**: Signups and logins query a real-time Google account validator endpoint checking domain and account existence.
- **CSRF & Cookie Protection**: Cookie configuration employs `httpOnly: true`, `secure: true`, and cross-site protections.
- **HTML Sanitization**: DOMPurify checks are used on the frontend to sanitize custom blog HTML layouts.
