import { v2 as cloudinary } from "cloudinary";

const url = process.env.CLOUDINARY_URL ?? "";
const match = url.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
if (match) {
  cloudinary.config({ api_key: match[1], api_secret: match[2], cloud_name: match[3] });
}

export async function uploadImage(base64: string): Promise<string> {
  const result = await cloudinary.uploader.upload(base64, {
    folder: "sales-manager",
    resource_type: "image",
    transformation: [{ width: 800, height: 800, crop: "limit", quality: 70, format: "jpg" }],
  });
  return result.secure_url;
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
