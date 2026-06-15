import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  secure: true
});

/**
 * Uploads a file buffer directly to Cloudinary using upload_stream.
 * This is 100% safe for containerized/Docker environments as it does not read/write to local disk.
 */
export const uploadOnCloudinary = async (fileBuffer) => {
  try {
    if (!fileBuffer) return null;
    
    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "quillforge",
          resource_type: "auto"
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary stream upload failed:", error);
            resolve(null);
          } else {
            console.log("Cloudinary stream upload successful:", result.secure_url);
            resolve(result);
          }
        }
      );
      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error("Cloudinary helper crash:", error);
    return null;
  }
};
