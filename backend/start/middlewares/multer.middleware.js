// ============================================================================
// middlewares/multer.middleware.js — FILE UPLOAD HANDLER
// ----------------------------------------------------------------------------
// Configures Multer, the Express multipart form-data parser, to accept file
// uploads (blog cover images, avatar photos, etc.).
//
// KEY DECISION — Memory Storage (not disk storage):
//   In production the server runs inside a Docker container on EC2. Docker
//   containers have an ephemeral filesystem — files written to disk disappear
//   on container restart. We use memoryStorage() so files arrive in Node as a
//   raw Buffer (req.file.buffer) which is immediately handed to Cloudinary's
//   upload_stream helper (utilities/cloudinary.js) without ever touching disk.
//
// USED BY (user.routes.js + blog.routes.js):
//   POST /api/v1/users/update-avatar  → upload.single("avatar")
//   POST /api/v1/blogs                → upload.single("featuredImage")
//   PUT  /api/v1/blogs/:id            → upload.single("featuredImage")
//
// After Multer runs, the controller reads:
//   req.file.buffer   — the raw binary file data
//   req.file.mimetype — the MIME type (e.g. "image/jpeg")
//   req.file.size     — size in bytes (rejected if > 5 MB by the limit below)
// ============================================================================

import multer from "multer";

// Use memory storage — files are held in RAM as Buffer objects, never written
// to the container filesystem, making this Docker/serverless-safe.
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // reject files larger than 5 MB (5 * 1024 * 1024 bytes)
});

