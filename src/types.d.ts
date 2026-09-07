import { Multer } from "multer";
import type { AuthenticatedRequestUser } from "./types/general";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedRequestUser;
      token?: string;
      file?: Multer.File;
      uploadedImageFile?: Multer.File;
    }
  }
}

export {};
