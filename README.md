# 🚀 QuillForge — Production-Grade Blogging Platform

> **QuillForge** is a scalable full-stack blogging platform engineered with modern software architecture, secure authentication, containerized deployment, and CI/CD automation. It enables creators to write, publish, and manage content while demonstrating industry-standard backend and frontend engineering practices.

---

## ✨ Key Highlights

* 🔐 JWT Authentication & Google OAuth 2.0
* 📝 Rich Blog Creation & Editing Experience
* 🌍 Public Blog Discovery & Reading
* 👤 Personalized User Dashboard
* 📊 Analytics & Engagement Metrics
* 🛡️ Role-Based Access Control (Admin & User)
* ☁️ Cloud-Based Media Storage
* 🐳 Dockerized Deployment
* ⚙️ Automated CI/CD Pipeline with GitHub Actions
* 📱 Responsive UI across Desktop & Mobile
* 🔄 RESTful API Architecture
* 🚀 Production Deployment on AWS EC2

---

# 🏗️ System Architecture

```
                 ┌──────────────────────────┐
                 │       React Client        │
                 └────────────┬──────────────┘
                              │
                     HTTPS / REST API
                              │
                 ┌────────────▼──────────────┐
                 │      Express Backend      │
                 │ JWT • OAuth • Controllers │
                 └────────────┬──────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
    MongoDB Atlas        Cloudinary        Google OAuth
      (Persistence)       (Media)          Authentication

                              │
                              ▼
                   Docker Containerized Runtime
                              │
                              ▼
                   GitHub Actions CI/CD Pipeline
                              │
                              ▼
                      AWS EC2 Production Server
```

---

# 🛠️ Technology Stack

## Frontend

* React
* React Router
* Tailwind CSS
* Axios
* Framer Motion
* Lucide React

## Backend

* Node.js
* Express.js
* JWT Authentication
* Passport.js
* Google OAuth 2.0
* RESTful API Design

## Database

* MongoDB Atlas
* Mongoose ODM

## DevOps & Deployment

* Docker
* GitHub Actions
* AWS EC2
* Nginx Reverse Proxy
* CI/CD Automation

---

# 📂 Project Structure

```
quillforge/
│
├── frontend/
│   ├── src/
│   ├── components/
│   └── pages/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── models/
│   ├── config/
│   └── utils/
│
├── docs/
│   └── architecture.png
│
├── .github/
│   └── workflows/
│
└── README.md
```

---

# 🔐 Authentication

* Email & Password Authentication
* Google OAuth 2.0 Login
* JWT-based Session Management
* Secure HTTP-only Cookies
* Protected Routes & Middleware

---

# ✍️ Blog Features

* Create Blog Posts
* Edit Existing Blogs
* Publish / Save as Draft
* Read Individual Blogs
* Search & Discover Content
* View Analytics & Statistics
* Manage Personal Blogs

---

# 👨‍💼 Admin Capabilities

* Moderate Platform Content
* Manage Published Blogs
* Update Existing Articles
* Delete Inappropriate Content
* Access Administrative Dashboard

---

# 🚀 CI/CD Pipeline

```
Developer Push
        │
        ▼
 GitHub Repository
        │
        ▼
 GitHub Actions
        │
        ▼
 Build Docker Image
        │
        ▼
 Transfer to AWS EC2
        │
        ▼
 Restart Docker Container
        │
        ▼
 Live Production Deployment
```

---

# 🐳 Deployment

The backend is containerized using Docker and automatically deployed through GitHub Actions to an AWS EC2 instance.

Deployment includes:

* Docker image build
* Secure secret injection
* Container restart
* Zero manual code transfer
* Automated production updates

---

# 📈 Engineering Practices Demonstrated

* Modular MVC Architecture
* RESTful API Design
* Middleware-Based Authorization
* Role-Based Access Control
* Environment-Based Configuration
* Secure Authentication Flows
* Reusable React Components
* Production Deployment Strategy
* Containerization
* CI/CD Automation
* Clean Code & Separation of Concerns

---

# 🔮 Roadmap

* AI-Assisted Blog Generation
* Personalized Feed Recommendation Engine
* Advanced Analytics Dashboard
* Real-Time Notifications
* Collaborative Editing
* Full-Text Search
* Bookmarking & Reading History

---

# 👨‍💻 Author

**Keshav Kakani**

* GitHub: https://github.com/keshav9926
* LinkedIn: https://www.linkedin.com/in/keshav-kakani-987586282

---

⭐ If you found this project interesting, consider giving it a star and exploring the codebase.
