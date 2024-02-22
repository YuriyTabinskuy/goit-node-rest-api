import express from "express";
import userController from "../../controllers/auth-controller.js";
import authenticate from "../../middlewares/authenticate.js";
import upload from "../../middlewares/upload.js";

const authRouter = express.Router();

authRouter.post("/register", userController.signup);
authRouter.get("/verify/:verificationToken", userController.verifyUser);
authRouter.post("/verify", userController.resendVerify);
authRouter.post("/login", userController.login);
authRouter.get("/current", authenticate, userController.getCurrent);
authRouter.post("/logout", authenticate, userController.logout);
authRouter.patch("/", authenticate, userController.updateSubscription);
authRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  userController.updateAvatar
);

export default authRouter;