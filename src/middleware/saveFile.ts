import multer from "multer";
import type { Request, Response, NextFunction } from "express";
import config from "../config/commons";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

interface CloudinaryStorageParams {
  folder: string;
  allowedFormats: any;
  public_id: (req: Express.Request, file: Express.Multer.File) => string;
}

cloudinary.config({
  cloud_name: config.cloudinary.CLOUD_NAME,
  api_key: config.cloudinary.CLOUDINARY_KEY,
  api_secret: config.cloudinary.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: config.cloudinary.FOLDER_NAME,
    allowedFormats: ["jpeg", "png", "jpg", "gif"],
    public_id: (req, file) => file.filename,
  } as CloudinaryStorageParams,
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

function pickUploadedImageFile(req: Request): Express.Multer.File | undefined {
  if (req.file) return req.file;
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  if (!files) return undefined;
  return files.image?.[0] || files.photo?.[0];
}

/** Acepta campo `image` o `photo` (multipart). Responde 400/413 en error de multer. */
function handleUserImageUpload(
  req: Request,
  res: Response,
  next: NextFunction
) {
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "photo", maxCount: 1 },
  ])(req, res, (err: any) => {
    if (err) {
      const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      res.status(status).send({
        message: err.message || "Error al subir la imagen",
      });
      return;
    }
    (req as any).uploadedImageFile = pickUploadedImageFile(req);
    next();
  });
}

const removeImage = (urlImage: string) => {
  if (urlImage) {
    const url = urlImage.split("/");
    const image = url[url.length - 1].split(".");
    cloudinary.uploader
      .destroy(config.cloudinary.FOLDER_NAME + "/" + image[0])
      .then(() => true)
      .catch(() => false);
  }
};

export { upload, removeImage, handleUserImageUpload, pickUploadedImageFile };
