import { Router } from "express";
import * as userController from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/", userController.getUsers);
userRouter.get("/:id", userController.getUser);
userRouter.post("/", userController.postUser);
userRouter.post("/login", userController.loginUser);
userRouter.put("/:id", userController.putUser);
userRouter.delete("/:id", userController.deleteUser);

export default userRouter;
