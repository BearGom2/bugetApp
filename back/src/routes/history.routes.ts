import { Router } from "express";
import * as historyController from "../controllers/history.controller";

const historyRouter = Router();

historyRouter.get("/:userId", historyController.getHistories);
historyRouter.get("/detail/:id", historyController.getHistory);
historyRouter.get("range/:userId/", historyController.getHistoriesByDate);
historyRouter.post("/", historyController.postHistory);
historyRouter.put("/:id", historyController.putHistory);
historyRouter.delete("/:id", historyController.deleteHistory);

export default historyRouter;
