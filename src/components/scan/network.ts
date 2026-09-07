import * as express from "express";
import auth from "../../middleware/auth";
import { SCAN_ROLES } from "../../config/roles";
import {
  IGetUserAuthInfoRequest,
  AuthenticatedRequest,
} from "../../types/general";
import { validateScan } from "./store";

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

router.post("/validate", auth(SCAN_ROLES), async (req: IGetUserAuthInfoRequest, res) => {
  if (!denyUnlessAuthenticated(req, res)) return;
  try {
    const { publicToken, accion } = req.body || {};
    if (!publicToken || (accion !== "checkin" && accion !== "checkout")) {
      res.status(400).send({ message: "publicToken y accion (checkin|checkout) son requeridos" });
      return;
    }
    const result = await validateScan({
      publicToken,
      accion,
      operadorId: req.user._id.toString(),
    });
    if (result.status >= 200 && result.status < 300) {
      res.status(result.status).send(result.message);
      return;
    }
    if (result.detail && typeof result.detail === "object") {
      res.status(result.status).send({ message: result.message, ...result.detail });
      return;
    }
    res.status(result.status).send({ message: result.message });
  } catch (e) {
    console.log(e);
    res.status(500).send("Unexpected Error");
  }
});

export default router;
