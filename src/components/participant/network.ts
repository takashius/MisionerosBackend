import * as express from "express";
import auth from "../../middleware/auth";
import controllerError from "../../middleware/controllerError";
import {
  IGetUserAuthInfoRequest,
  AuthenticatedRequest,
} from "../../types/general";
import { PAYMENT_ROLES, SCAN_ROLES, STAFF_ROLES } from "../../config/roles";
import {
  register,
  list,
  stats,
  byToken,
  byDocument,
  confirm,
  typo,
  status,
  lodging,
} from "./controller";

const router = express.Router();

function denyUnlessAuthenticated(
  req: IGetUserAuthInfoRequest,
  res: express.Response
): req is AuthenticatedRequest {
  if (!req.user) {
    res.status(401).send("Unauthorized");
    return false;
  }
  return true;
}

function sendStore(res: express.Response, result: { status: number; message: any; detail?: any }) {
  if (result.status >= 200 && result.status < 300) {
    res.status(result.status).send(result.message);
    return;
  }
  if (result.detail && typeof result.detail === "object") {
    res.status(result.status).send({ message: result.message, ...result.detail });
    return;
  }
  if (result.status >= 500) {
    controllerError(result.detail, {} as any, res);
    return;
  }
  res.status(result.status).send(
    typeof result.message === "string" ? { message: result.message } : result.message
  );
}

router.post("/register", async (req, res) => {
  try {
    sendStore(res, await register(req.body));
  } catch (e) {
    console.log(e);
    res.status(500).send("Unexpected Error");
  }
});

router.get("/", auth(STAFF_ROLES), async (req: IGetUserAuthInfoRequest, res) => {
  if (!denyUnlessAuthenticated(req, res)) return;
  try {
    sendStore(res, await list(req.query as any));
  } catch (e) {
    console.log(e);
    res.status(500).send("Unexpected Error");
  }
});

router.get("/stats", auth(STAFF_ROLES), async (req: IGetUserAuthInfoRequest, res) => {
  if (!denyUnlessAuthenticated(req, res)) return;
  try {
    sendStore(res, await stats());
  } catch (e) {
    console.log(e);
    res.status(500).send("Unexpected Error");
  }
});

router.get("/by-token/:publicToken", async (req, res) => {
  try {
    sendStore(res, await byToken(req.params.publicToken));
  } catch (e) {
    console.log(e);
    res.status(500).send("Unexpected Error");
  }
});

router.get("/lookup/:documentoId", async (req, res) => {
  try {
    sendStore(res, await byDocument(req.params.documentoId, true));
  } catch (e) {
    console.log(e);
    res.status(500).send("Unexpected Error");
  }
});

router.get(
  "/by-document/:documentoId",
  auth(SCAN_ROLES),
  async (req: IGetUserAuthInfoRequest, res) => {
    if (!denyUnlessAuthenticated(req, res)) return;
    try {
      sendStore(res, await byDocument(req.params.documentoId, false));
    } catch (e) {
      console.log(e);
      res.status(500).send("Unexpected Error");
    }
  }
);

router.patch(
  "/:id/confirm-payment",
  auth(PAYMENT_ROLES),
  async (req: IGetUserAuthInfoRequest, res) => {
    if (!denyUnlessAuthenticated(req, res)) return;
    try {
      sendStore(
        res,
        await confirm(req.params.id, req.user._id.toString(), req.body?.referenciaComprobante)
      );
    } catch (e) {
      console.log(e);
      res.status(500).send("Unexpected Error");
    }
  }
);

router.patch(
  "/:id/fix-typo",
  auth(SCAN_ROLES),
  async (req: IGetUserAuthInfoRequest, res) => {
    if (!denyUnlessAuthenticated(req, res)) return;
    try {
      sendStore(res, await typo(req.params.id, req.body));
    } catch (e) {
      console.log(e);
      res.status(500).send("Unexpected Error");
    }
  }
);

router.patch(
  "/:id/status",
  auth(PAYMENT_ROLES),
  async (req: IGetUserAuthInfoRequest, res) => {
    if (!denyUnlessAuthenticated(req, res)) return;
    try {
      sendStore(res, await status(req.params.id, req.body?.estado));
    } catch (e) {
      console.log(e);
      res.status(500).send("Unexpected Error");
    }
  }
);

router.patch(
  "/:id/lodging",
  auth(STAFF_ROLES),
  async (req: IGetUserAuthInfoRequest, res) => {
    if (!denyUnlessAuthenticated(req, res)) return;
    try {
      sendStore(res, await lodging(req.params.id, req.body?.habitacionAsignada ?? null));
    } catch (e) {
      console.log(e);
      res.status(500).send("Unexpected Error");
    }
  }
);

export default router;
