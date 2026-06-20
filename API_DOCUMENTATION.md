# 📖 QuillForge API Documentation

This document describes all the active REST API routes exposed by the QuillForge backend server. The server mounts the complete interactive Swagger UI spec at `/api-docs`.

---

## 🔒 Authentication Routes

### 1. User Registration
* **Endpoint**: `POST /api/v1/users/register`
* **Auth Required**: None
* **Request Body**:
  ```json
  {
    "username": "coder_writer",
    "email": "writer@gmail.com",
    "password": "SecurePassword123!"
  }
  ```
* **Success Response (201)**:
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

### 2. User Login
* **Endpoint**: `POST /api/v1/users/login`
* **Auth Required**: None
* **Request Body**:
  ```json
  {
    "email": "writer@gmail.com",
    "password": "SecurePassword123!"
  }
  ```
* **Success Response (200)**:
  Sets an HTTPOnly JWT token cookie named `accessToken`.
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

### 3. Email Validator
* **Endpoint**: `GET /api/v1/users/validate-email`
* **Auth Required**: None
* **Query Parameters**:
  - `email` (string, required): Gmail address to validate.
* **Success Response (200)**:
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

### 4. Fetch Current User
* **Endpoint**: `GET /api/v1/users/current-user`
* **Auth Required**: Yes (Valid `accessToken` Cookie)
* **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "65893a72cb123e4567890def",
      "username": "coder_writer",
      "email": "writer@gmail.com",
      "role": "user"
    }
  }
  ```

### 5. Logout User
* **Endpoint**: `POST /api/v1/users/logout`
* **Auth Required**: Yes (Valid `accessToken` Cookie)
* **Success Response (200)**:
  Clears the `accessToken` Cookie.
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

### 6. Google Auth Gateway
* **Endpoint**: `GET /api/v1/users/google`
* **Auth Required**: None
* **Action**: Redirects client browser to Google accounts sign-in page.

### 7. Google Callback Target
* **Endpoint**: `GET /api/v1/users/google/callback`
* **Auth Required**: None
* **Action**: Receives OAuth redirect, generates secure session cookie, and redirects user to landing dashboard.

---

## 📝 Blog & Article Routes

### 8. Fetch All Blogs
* **Endpoint**: `GET /api/v1/blogs`
* **Auth Required**: None
* **Success Response (200)**:
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
        "author": {
          "_id": "65893a72cb123e4567890def",
          "username": "coder_writer"
        },
        "isPublished": true,
        "views": 42,
        "likes": []
      }
    ]
  }
  ```

### 9. Get Single Blog
* **Endpoint**: `GET /api/v1/blogs/:id`
* **Auth Required**: None
* **Path Parameters**:
  - `id` (string, required): Mongoose Blog document ID.
* **Success Response (200)**:
  Returns the populated blog post details.

### 10. Create Blog Post
* **Endpoint**: `POST /api/v1/blogs`
* **Auth Required**: Yes (Valid `accessToken` Cookie)
* **Request Body**:
  ```json
  {
    "title": "Creating microservices",
    "content": "<p>Content markdown...</p>",
    "excerpt": "Brief summary",
    "isPublished": true,
    "featuredImage": "https://res.cloudinary.com/image.png"
  }
  ```
* **Success Response (201)**:
  Returns the newly created blog post document.

### 11. Update Blog Post
* **Endpoint**: `PUT /api/v1/blogs/:id`
* **Auth Required**: Yes (Author ownership or Admin role required)
* **Request Body**: Partial blog properties to update.
* **Success Response (200)**:
  Returns the updated blog post document.

### 12. Delete Blog Post
* **Endpoint**: `DELETE /api/v1/blogs/:id`
* **Auth Required**: Yes (Author ownership or Admin role required)
* **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Blog deleted successfully"
  }
  ```

### 13. Image Uploader
* **Endpoint**: `POST /api/v1/blogs/upload`
* **Auth Required**: Yes (Valid `accessToken` Cookie)
* **Request Body**: Multi-part form-data file containing the file under name `image`.
* **Success Response (200)**:
  ```json
  {
    "success": true,
    "url": "https://res.cloudinary.com/demo/image/upload/v1/featured.png"
  }
  ```

### 14. Increment View Count
* **Endpoint**: `PATCH /api/v1/blogs/:id/view`
* **Auth Required**: None
* **Action**: Increments read count atomically by 1.
* **Success Response (200)**:
  ```json
  {
    "success": true,
    "views": 43
  }
  ```

### 15. Toggle Like Status
* **Endpoint**: `PATCH /api/v1/blogs/:id/like`
* **Auth Required**: Yes (Valid `accessToken` Cookie)
* **Action**: Adds/removes User ID from likes array.
* **Success Response (200)**:
  ```json
  {
    "success": true,
    "likes": 5,
    "liked": true
  }
  ```
