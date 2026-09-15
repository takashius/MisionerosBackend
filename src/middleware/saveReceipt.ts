import { randomUUID } from "crypto";
import multer from "multer";
import type { Request, Response, NextFunction } from "express";
import config from "../config/commons";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: config.cloudinary.CLOUD_NAME,
  api_key: config.cloudinary.CLOUDINARY_KEY,
  api_secret: config.cloudinary.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: config.cloudinary.FOLDER_NAME + "/receipts",
    allowedFormats: ["jpeg", "jpg", "png", "webp", "pdf"],
    resource_type: "auto",
    public_id: () => `comprobante-${randomUUID()}`,
  } as any,
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
});

export function handleReceiptUpload(req: Request, res: Response, next: NextFunction) {
  upload.single("comprobante")(req, res, (err: any) => {
    if (err) {
      const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      res.status(status).send({
        message:
          err.code === "LIMIT_FILE_SIZE"
            ? "El comprobante no puede superar 8 MB"
            : err.message || "Error al subir el comprobante",
      });
      return;
    }
    (req as any).uploadedReceiptFile = req.file;
    next();
  });
}
