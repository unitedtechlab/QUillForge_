# 🚢 Deployment Guide

This document describes the containerized deployment process for the QuillForge application using Docker, AWS EC2 (for the backend API), and AWS Amplify (for the frontend SPA).

---

## 🏗️ 1. Backend Deployment (AWS EC2 + Docker)

The backend is packaged inside a Docker container and deployed to an EC2 instance.

### A. Dockerizing the Backend

1. Build the production Docker image locally:
   ```bash
   docker build -t quillforge-backend:latest ./quillforge/backend
   ```

2. Export the Docker image as a compressed tarball:
   ```bash
   docker save quillforge-backend:latest | gzip > quillforge-backend.tar.gz
   ```

### B. Uploading to EC2 via SCP

Transfer the tarball to your EC2 instance:
```bash
scp -i ~/.ssh/your-key.pem quillforge-backend.tar.gz ec2-user@your-ec2-ip:~/
```

### C. running on EC2 via SSH

1. SSH into the instance:
   ```bash
   ssh -i ~/.ssh/your-key.pem ec2-user@your-ec2-ip
   ```

2. Load the image from the uploaded tarball:
   ```bash
   docker load < quillforge-backend.tar.gz
   ```

3. Spin up the container, feeding environment variables:
   ```bash
   docker run -d \
     -p 8102:8102 \
     --name quillforge-api \
     -e PORT=8102 \
     -e MONGODB_URI="your-mongodb-connection-string" \
     -e JWT_SECRET="your-jwt-secret" \
     -e JWT_EXPIRES_IN=7d \
     -e GOOGLE_CLIENT_ID="your-google-client-id" \
     -e GOOGLE_CLIENT_SECRET="your-google-client-secret" \
     -e CLOUDINARY_URL="your-cloudinary-url" \
     quillforge-backend:latest
   ```

---

## 🎨 2. Frontend Deployment (AWS Amplify)

The React SPA frontend is deployed using AWS Amplify for instant continuous integration and global CDN delivery.

### A. Build Configuration

1. In the AWS Amplify console, connect your GitHub repository and point to the `quillforge/Frontend` folder.
2. Use the following build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

### B. Environment Variables

Configure the following environment variable inside the Amplify console:
- `VITE_API_URL`: `https://api.quillforge.unitedtechlab.com/api/v1` (or your EC2 API server endpoint).
