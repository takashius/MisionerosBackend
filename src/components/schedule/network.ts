import * as express from "express";
import auth from "../../middleware/auth";
import controllerError from "../../middleware/controllerError";
import {
  IGetUserAuthInfoRequest,
  AuthenticatedRequest,
} from "../../types/general";
import { STAFF_ROLES } from "../../config/roles";
import { publicList, manageList, create, update, remove } from "./controller";

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
  if (result.status >= 500) {
    controllerError(result.detail, {} as any, res);
    return;
  }
  res.status(result.status).send(
    typeof result.message === "string" ? { message: result.message } : result.message
  );
}

router.get("/", async (req, res) => {
  try {
    sendStore(res, await publicList(req.query.fecha as string | undefined));
  } catch (e) {
    console.log(e);
    res.status(500).send("Unexpected Error");
  }
});

router.get("/manage", auth(STAFF_ROLES), async (req: IGetUserAuthInfoRequest, res) => {
  if (!denyUnlessAuthenticated(req, res)) return;
  try {
    sendStore(res, await manageList(req.query.fecha as string | undefined));
  } catch (e) {
    console.log(e);
    res.status(500).send("Unexpected Error");
  }
});

router.post("/", auth(STAFF_ROLES), async (req: IGetUserAuthInfoRequest, res) => {
  if (!denyUnlessAuthenticated(req, res)) return;
  try {
    sendStore(res, await create(req.body));
  } catch (e) {
    console.log(e);
    res.status(500).send("Unexpected Error");
  }
});

router.patch("/:id", auth(STAFF_ROLES), async (req: IGetUserAuthInfoRequest, res) => {
  if (!denyUnlessAuthenticated(req, res)) return;
  try {
    sendStore(res, await update(req.params.id, req.body));
  } catch (e) {
    console.log(e);
    res.status(500).send("Unexpected Error");
  }
});

router.delete("/:id", auth(STAFF_ROLES), async (req: IGetUserAuthInfoRequest, res) => {
  if (!denyUnlessAuthenticated(req, res)) return;
  try {
    sendStore(res, await remove(req.params.id));
  } catch (e) {
    console.log(e);
    res.status(500).send("Unexpected Error");
  }
});

export default router;
