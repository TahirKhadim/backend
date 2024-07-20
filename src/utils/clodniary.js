import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
cloudinary.config({
  cloud_name: process.env.CLOUS_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const uploadOnCloudinary = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return null;
    }
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    console.log(`File uploaded successfully: ${result.secure_url}`);
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
};
