import * as express from "express";
import {
  getUsers,
  getUser,
  addUser,
  deleteUser,
  updateUser,
  updateProfile,
  loginUser,
  logoutUser,
  logoutAll,
  changePassword,
  changePasswordByUserId,
  recoveryStepOne,
  recoveryStepTwo,
  uploadImage,
  updateUserRoles,
  getRoles,
} from "./controller";
import auth from "../../middleware/auth";
import controllerError from "../../middleware/controllerError";
import { upload, handleUserImageUpload } from "../../middleware/saveFile";
import {
  IGetUserAuthInfoRequest,
  AuthenticatedRequest,
} from "../../types/general";
import {
  loginRateLimiter,
  recoveryRequestRateLimiter,
  recoverySubmitRateLimiter,
} from "../../middleware/rateLimit";
import { ADMIN_ROLES } from "../../config/roles";

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

router.get("/simple", auth(ADMIN_ROLES), function (req: IGetUserAuthInfoRequest, res) {
  if (!denyUnlessAuthenticated(req, res)) return;
  getUsers(null, null, true)
    .then((list) => {
      switch (list.status) {
        case 200:
          res.status(200).send(list.message);
          break;
        default:
          res.status(list.status).send(list.message);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.get("/roles", auth(ADMIN_ROLES), function (req: IGetUserAuthInfoRequest, res) {
  getRoles(req.user)
    .then((list) => {
      switch (list.status) {
        case 200:
          res.status(200).send(list.message);
          break;
        default:
          res.status(list.status).send(list.message);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.get(
  "/list/:page?/:pattern?",
  auth(ADMIN_ROLES),
  function (req: IGetUserAuthInfoRequest, res) {
    getUsers(req.params.pattern, parseInt(req.params.page), false)
      .then((list) => {
        switch (list.status) {
          case 200:
            res.status(200).send(list.message);
            break;
          default:
            res.status(list.status).send(list.message);
            break;
        }
      })
      .catch((e) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  }
);

router.get("/account", auth(), function (req: IGetUserAuthInfoRequest, res) {
  if (!denyUnlessAuthenticated(req, res)) return;
  getUser(req.user._id.toString())
    .then((userList) => {
      switch (userList.status) {
        case 200:
          res.status(200).send(userList.message);
          break;
        default:
          res.status(userList.status).send(userList.message);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected network Error");
    });
});

router.get("/recovery/:email", recoveryRequestRateLimiter, function (req, res) {
  recoveryStepOne(req.params.email)
    .then((result) => {
      switch (result.status) {
        case 200:
          res.status(200).send(result.message);
          break;
        default:
          res.status(result.status).send(result.message);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected network Error");
    });
});

router.get("/:id", auth(ADMIN_ROLES), function (req: IGetUserAuthInfoRequest, res) {
  getUser(req.params.id)
    .then((userList) => {
      switch (userList.status) {
        case 200:
          res.status(200).send(userList.message);
          break;
        default:
          res.status(userList.status).send(userList.message);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.post(
  "/",
  auth(ADMIN_ROLES),
  upload.single("photo"),
  function (req: IGetUserAuthInfoRequest, res) {
    if (!denyUnlessAuthenticated(req, res)) return;
    addUser(req.body, req.file, req.user.role)
      .then((user) => {
        switch (user.status) {
          case 201:
            res.status(201).send(user.message);
            break;
          case 400:
          case 403:
            res.status(user.status).send(user.message);
            break;
          default:
            controllerError(user.detail, req, res);
            break;
        }
      })
      .catch((e) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  }
);

router.post("/recovery", recoverySubmitRateLimiter, function (req, res) {
  recoveryStepTwo(req.body)
    .then((user) => {
      switch (user.status) {
        case 200:
          res.status(200).send(user.message);
          break;
        case 400:
          res.status(400).send(user.message);
          break;
        default:
          controllerError(user.detail, req, res);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.post(
  "/upload",
  auth(),
  handleUserImageUpload,
  function (req: IGetUserAuthInfoRequest, res) {
    if (!denyUnlessAuthenticated(req, res)) return;
    uploadImage(req.user._id.toString(), (req as any).uploadedImageFile, "photo")
      .then((data) => {
        switch (data.status) {
          case 200:
            res.status(200).send(data.message);
            break;
          case 400:
          case 401:
          case 404:
            res.status(data.status).send(data.message);
            break;
          default:
            controllerError(data.detail, req, res);
        }
      })
      .catch((e) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  }
);

router.post(
  "/uploadBanner",
  upload.single("image"),
  auth(),
  function (req: IGetUserAuthInfoRequest, res) {
    if (!denyUnlessAuthenticated(req, res)) return;
    uploadImage(req.user._id.toString(), req.file, "banner")
      .then((data) => {
        switch (data.status) {
          case 200:
            res.status(200).send(data.message);
            break;
          case 400:
          case 401:
          case 404:
            res.status(data.status).send(data.message);
            break;
          default:
            controllerError(data.detail, req, res);
        }
      })
      .catch((e) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  }
);

router.post(
  "/uploadUserImage",
  upload.single("image"),
  auth(ADMIN_ROLES),
  function (req: IGetUserAuthInfoRequest, res) {
    if (!denyUnlessAuthenticated(req, res)) return;
    uploadImage(req.body.userId, req.file, "photo")
      .then((data) => {
        switch (data.status) {
          case 200:
            res.status(200).send(data.message);
            break;
          case 400:
          case 401:
          case 404:
            res.status(data.status).send(data.message);
            break;
          default:
            controllerError(data.detail, req, res);
        }
      })
      .catch((e) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  }
);

router.delete("/:id", auth(ADMIN_ROLES), function (req, res) {
  deleteUser(req.params.id)
    .then((resp) => {
      switch (resp.status) {
        case 200:
          res.status(200).send(`Usuario ${req.params.id} eliminado`);
          break;
        case 400:
        case 403:
          res.status(resp.status).send(resp.message);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.patch(
  "/",
  auth(ADMIN_ROLES),
  upload.single("photo"),
  function (req: IGetUserAuthInfoRequest, res) {
    if (!denyUnlessAuthenticated(req, res)) return;
    updateUser(req.body, req.file, req.user.role)
      .then((user) => {
        switch (user.status) {
          case 200:
            res.status(200).send(user.message);
            break;
          case 400:
          case 403:
            res.status(user.status).send(user.message);
            break;
          default:
            controllerError(user.detail, req, res);
        }
      })
      .catch((e) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  }
);

router.patch(
  "/profile",
  auth(),
  handleUserImageUpload,
  function (req: IGetUserAuthInfoRequest, res) {
    if (!denyUnlessAuthenticated(req, res)) return;
    updateProfile(
      req.user._id.toString(),
      req.body,
      (req as any).uploadedImageFile
    )
      .then((user) => {
        switch (user.status) {
          case 200:
            res.status(200).send(user.message);
            break;
          case 400:
          case 403:
            res.status(user.status).send(user.message);
            break;
          default:
            controllerError(user.detail, req, res);
        }
      })
      .catch((e) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  }
);

router.patch(
  "/updateRoles",
  auth(ADMIN_ROLES),
  function (req: IGetUserAuthInfoRequest, res) {
    if (!denyUnlessAuthenticated(req, res)) return;
    updateUserRoles(req.body.userId, req.body.role ?? req.body.roles, req.user.role)
      .then((user) => {
        switch (user.status) {
          case 200:
            res.status(200).send(user.message);
            break;
          case 400:
          case 403:
            res.status(user.status).send(user.message);
            break;
          default:
            controllerError(user.detail, req, res);
        }
      })
      .catch((e) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  }
);

router.post("/login", loginRateLimiter, async (req, res) => {
  loginUser(req.body)
    .then((user) => {
      switch (user.status) {
        case 200:
          res.status(200).send(user.message);
          break;
        default:
          res.status(user.status).send(user.message);
          break;
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Unexpected Error");
    });
});

router.post("/logout", auth(), async (req: IGetUserAuthInfoRequest, res) => {
  if (!denyUnlessAuthenticated(req, res)) return;
  logoutUser(req.user._id.toString(), req.token ?? "")
    .then(() => {
      res.status(200).send("Logout successful");
    })
    .catch(() => {
      res.status(400).send("Invalid user data");
    });
});

router.post("/logoutall", auth(), async (req: IGetUserAuthInfoRequest, res) => {
  if (!denyUnlessAuthenticated(req, res)) return;
  logoutAll(req.user._id.toString())
    .then(() => {
      res.status(200).send("Logout successful");
    })
    .catch(() => {
      res.status(400).send("Invalid user data");
    });
});

router.post(
  "/change_password",
  auth(),
  function (req: IGetUserAuthInfoRequest, res) {
    if (!denyUnlessAuthenticated(req, res)) return;
    changePassword(req.user, req.body.password)
      .then((resp) => {
        switch (resp.status) {
          case 200:
            res.status(resp.status).send(resp.message);
            break;
          case 400:
            res.status(resp.status).send(resp.message);
            break;
          default:
            controllerError(resp.detail, req, res);
            break;
        }
      })
      .catch((e) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  }
);

router.post(
  "/change_password/:userId",
  auth(ADMIN_ROLES),
  function (req: IGetUserAuthInfoRequest, res) {
    if (!denyUnlessAuthenticated(req, res)) return;
    const { userId } = req.params;
    const { password } = req.body;

    changePasswordByUserId(userId, password)
      .then((resp) => {
        switch (resp.status) {
          case 200:
            res.status(resp.status).send(resp.message);
            break;
          case 400:
          case 404:
            res.status(resp.status).send(resp.message);
            break;
          default:
            controllerError(resp.detail, req, res);
            break;
        }
      })
      .catch((e) => {
        console.log(e);
        res.status(500).send("Unexpected Error");
      });
  }
);

export default router;
