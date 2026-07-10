// ============================================================================
// utilities/cloudinary.js — IMAGE UPLOAD HELPER (CLOUDINARY)
// ----------------------------------------------------------------------------
// Provides a single helper function that uploads a raw file buffer to the
// Cloudinary media hosting service and returns the secure URL of the uploaded
// asset.
//
// WHY CLOUDINARY?
//   Cloudinary handles resizing, format conversion, and CDN delivery. Blog
//   cover photos uploaded here get a permanent, fast CDN-backed URL that is
//   stored in the blog document's `featuredImage` field (blog.model.js).
//
// CONFIGURATION:
//   Cloudinary reads credentials from the CLOUDINARY_URL environment variable
//   automatically when cloudinary.config({ secure: true }) is called.
//   CLOUDINARY_URL format: cloudinary://<api_key>:<api_secret>@<cloud_name>
//   This is set in .env locally and in GitHub Secrets for production.
//
// USED BY (blog.controller.js):
//   POST /api/v1/blogs     → createBlog  — upload.single("featuredImage") → uploadOnCloudinary(req.file.buffer)
//   PUT  /api/v1/blogs/:id → updateBlog  — same pattern if a new image is provided
//
// WHY upload_stream INSTEAD OF upload?
//   The standard cloudinary.uploader.upload() requires a file path on disk.
//   We use memoryStorage (multer.middleware.js) so there is no file on disk —
//   only a Buffer in memory. upload_stream accepts that Buffer directly and
//   pipes it to Cloudinary without any temporary file I/O.
// ============================================================================

import { v2 as cloudinary } from "cloudinary";

// Initialise Cloudinary SDK. Reads CLOUDINARY_URL from process.env automatically.
cloudinary.config({
  secure: true  // always use HTTPS for the generated asset URLs
});

/**
 * Uploads a file buffer directly to Cloudinary using upload_stream.
 * This is 100% safe for containerized/Docker environments as it does not read/write to local disk.
 *
 * @param {Buffer} fileBuffer — raw binary data from req.file.buffer (set by multer memoryStorage)
 * @returns {Promise<object|null>} Cloudinary result object (contains .secure_url) or null on failure
 */
export const uploadOnCloudinary = async (fileBuffer) => {
  try {
    if (!fileBuffer) return null;

    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "quillforge",    // all uploads go into a "quillforge" folder in Cloudinary
          resource_type: "auto"    // auto-detect image/video/raw type from the buffer
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary stream upload failed:", error);
            resolve(null); // return null so the controller can fall back gracefully
          } else {
            console.log("Cloudinary stream upload successful:", result.secure_url);
            resolve(result); // caller uses result.secure_url as the featuredImage value
          }
        }
      );
      uploadStream.end(fileBuffer); // push the buffer into the stream to trigger upload
    });
  } catch (error) {
    console.error("Cloudinary helper crash:", error);
    return null;
  }
};

