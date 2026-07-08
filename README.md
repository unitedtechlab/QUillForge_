# 🖋️ QuillForge — Developer Blogging Platform

QuillForge is a premium, retro-themed terminal-aesthetic blogging platform designed specifically for developers and writers to draft, manage, and read clean engineering posts. It features a dark-mode CRT pixelated UI system, secure JWT and OAuth session handling, automated email verification, offline draft safety, and text-to-speech reader services.

**🌐 Live Demo:** [quillforge.unitedtechlab.com](https://quillforge.unitedtechlab.com)  
**📖 API Interactive Docs:** `/api-docs` (Available on running instance)

---

## 🏗️ System Architecture

QuillForge is built as a decoupled Client-Server architecture structured as a monorepo. It features a secure REST API back-end, database models managed via ODM, and a responsive React Single Page Application (SPA) front-end.

```mermaid
flowchart TD
    User([User Browser]) -->|Interacts| FE[React.js SPA Frontend]
    
    subgraph FE [Frontend Workspace]
        Vite[Vite/React Engine]
        CRT[CRT Overlay & Vanilla CSS]
        Sanitizer[DOMPurify Sanitization]
        TTS[Web Speech Synthesis]
        Drafts[LocalStorage Offline Drafts]
    end

    FE -->|Axios REST Calls with Credentials| BE[Node.js / Express API]
    
    subgraph BE [Backend Service]
        Routes[Express Router]
        Passport[Passport.js Local/Google]
        JWT[JWT Cookie Middleware]
        Limiter[Express Rate Limiters]
        Multer[Multer Uploads handler]
    end

    Passport -->|User Identity Verification| OAuth[Google OAuth 2.0]
    Routes -->|Real-time Gmail Check| Gxlu[Google gxlu Validator]
    Routes -->|Domain MX Records Lookup| DNS[Node DNS MX Resolver]
    Multer -->|Direct Media Streaming| Cloudinary[Cloudinary Cloud Storage]
    Routes -->|Mongoose ODM| Mongo[(MongoDB Atlas)]
```

### 1. Frontend Architecture
The frontend is a lightweight Single Page Application (SPA) designed to compile and feel like a cozy, responsive, nostalgic software suite:
- **State & Routing**: Managed dynamically using React standard hooks and `react-router-dom` to support subpages, feed browsing, writing workspaces, and administration panels.
- **CRT Glassmorphic Theme**: Implemented via Vanilla CSS utility definitions using a Tokyo Night-inspired palette (soft lavender background, deep navy card grids, violet primary accents). An custom scanline noise overlay overlay is used to capture a pixelated monitor feel.
- **Speech Synthesis Narrator**: Integration with the native Web Speech API allows users to listen to article readouts directly in-browser.
- **Offline Safety**: Real-time writing auto-saves to LocalStorage drafts, protecting user posts against sudden connection drops.

### 2. Backend Architecture
The backend is a native ES Module Node.js application built with Express.js exposing a clean REST API:
- **Session Security**: Uses a stateless HTTPOnly cookie strategy. JSON Web Tokens (JWT) are signed and attached as `httpOnly`, `secure` cookies to protect routes from Cross-Site Scripting (XSS) and CSRF attacks.
- **Authentication Strategies**: Passport.js is integrated with a Local strategy (utilizing `bcryptjs` for secure password hashing) and a Google OAuth 2.0 gateway for simple one-tap logins.
- **Real-Time Gmail Validator**: A custom validator endpoint (`/validate-email`) resolves DNS MX records for custom domain emails and queries Google's internal `gxlu` endpoint to verify Gmail account existence prior to account registration.
- **Upload Pipeline**: Multer middleware captures multipart form images and streams them directly onto Cloudinary cloud storage to populate blog headers.

---

## 📁 Repository Layout

The codebase is organized under `quillforge/` as a monorepo containing distinct front-end and back-end modules:

```text
quillforge/
├── Frontend/               # React SPA Application
│   ├── src/
│   │   ├── api/            # Axios API config & interceptors
│   │   ├── pages/          # Home, Login, Register, Dashboards, Blog details
│   │   ├── App.jsx         # Navigation routing tree
│   │   └── index.css       # Tokyo Night theme styling tokens & CRT animation
│   └── package.json
│
├── backend/                # Node.js/Express REST API
│   ├── start/
│   │   ├── config/         # Swagger JSON & passport credentials
│   │   ├── controllers/    # Users & blog endpoint controllers
│   │   ├── db/             # Mongoose connection bootstrap
│   │   ├── middlewares/    # Auth verification, rate limiting & multer
│   │   ├── models/         # User and Blog schemas
│   │   ├── routes/         # Express endpoint definitions
│   │   ├── app.js          # Express app configurations
│   │   └── server.js       # App entry point & DB connector
│   └── package.json
│
├── API_DOCUMENTATION.md    # Detail specification of API endpoints
├── DEPLOYMENT.md           # AWS EC2 / Amplify Docker instructions
└── README.md               # Main repository documentation
```

---

## 🛠️ Tech Stack

| Layer | Technology | Key Features / Purpose |
|---|---|---|
| **Frontend** | **React.js** | Modular component structures, reactive state hooks. |
| | **React Router** | Client-side routing for seamless page transitions. |
| | **Axios** | Configured with credentials support for HTTPOnly JWT sessions. |
| | **Vanilla CSS** | Neobrutalist layouts, scanline overlays, offset shadows. |
| | **Lucide React** | Retro-styled outline pixel-like iconography. |
| | **Vitest / RTL** | Unit testing for UI pages and components. |
| **Backend** | **Node.js (ESM)** | Modern, native modular JavaScript runtime execution. |
| | **Express.js** | Lightweight HTTP routing framework. |
| | **Passport.js** | Local credentials authentication & Google OAuth 2.0 integration. |
| | **JWT & Cookies** | Encrypted token transfer via secure browser cookies. |
| | **MongoDB Atlas** | Fully managed NoSQL storage for articles, user profiles & likes. |
| | **Mongoose ODM** | Strongly typed models with schema-level validation. |
| | **Cloudinary** | Distributed cloud hosting for featured blog banner images. |
| | **Jest / Supertest** | Backend API endpoint unit and integration tests. |

---

## 🔒 Security & Middleware Integration

- **Security Headers & Cookies**: Cookie configuration employs `httpOnly: true`, `secure: true`, and `sameSite: "none"` to safeguard users.
- **Strict Rate Limiting**: The `/login` endpoint limits clients to 10 attempts per 15 minutes, while `/register` limits signups to 5 accounts per hour per IP to prevent brute-force attacks.
- **DOM Sanitization**: Features frontend DOMPurify filtration to sanitize custom HTML blogs and block Cross-Site Scripting (XSS).
- **Google Account Existence Validation**: Querying the Google gxlu service ensures registered Gmail accounts exist on real Google servers.

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
3. Set up your `.env` configuration:
   ```env
   PORT=8102
   MONGODB_URI="your-mongodb-atlas-url"
   JWT_SECRET="your-jwt-signing-secret"
   JWT_EXPIRES_IN=7d
   GOOGLE_CLIENT_ID="your-google-oauth-client-id"
   GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
   SESSION_SECRET="your-session-key"
   CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
   The backend API will start on port `8102` and expose its Swagger interface at `http://localhost:8102/api-docs`.
5. Run the backend tests:
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
3. Set up your `.env` configuration:
   ```env
   VITE_API_URL="http://localhost:8102/api/v1"
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend dev server will start and be accessible at `http://localhost:3000`.
5. Run the frontend tests:
   ```bash
   npm test
   ```
