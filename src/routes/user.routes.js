import { Router } from "express";
import {
  loginuser,
  logoutuser,
  registeruser,
} from "../controllers/user.controller.js";

import { upload } from "../middleware/multer.middleware.js";
import { verifyjwt } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverimage",
      maxCount: 1,
    },
  ]),
  registeruser
);

//secure routes
router.route("/login").post(loginuser);
router.route("/logout").post(verifyjwt, logoutuser);

export default router;
