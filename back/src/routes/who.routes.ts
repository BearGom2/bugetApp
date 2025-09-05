import { Router } from "express";
import * as whoController from "../controllers/who.controller";

const whoRouter = Router();

whoRouter.get("/:id", whoController.getWhosById);
whoRouter.get("/all/:userId", whoController.getWhos);
whoRouter.post("/", whoController.postWho);
whoRouter.put("/:id", whoController.putWho);
whoRouter.delete("/:id", whoController.deleteWho);

export default whoRouter;
