import * as express from "express";
import controllerError from "../../middleware/controllerError";
import { contactRateLimiter } from "../../middleware/rateLimit";
import { create } from "./controller";

const router = express.Router();

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

router.post("/", contactRateLimiter, async (req, res) => {
  try {
    sendStore(res, await create(req.body));
  } catch (e) {
    console.log(e);
    res.status(500).send("Unexpected Error");
  }
});

export default router;
