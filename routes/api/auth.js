import express from "express";
import userController from "../../controllers/auth-controller.js";
import authenticate from "../../middlewares/authenticate.js";

const authRouter = express.Router();

authRouter.post("/register", userController.signup);
authRouter.post("/login", userController.login);
authRouter.get("/current", authenticate, userController.getCurrent);
authRouter.post("/logout", authenticate, userController.logout);
authRouter.patch("/", authenticate, userController.updateSubscription);

export default authRouter;