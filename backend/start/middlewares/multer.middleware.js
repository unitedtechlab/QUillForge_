import multer from "multer";

// Use memory storage to be fully compatible with serverless/containerized deployments (Docker)
// This avoids filesystem write permission issues in production
const storage = multer.memoryStorage();

export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
