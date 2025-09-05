import { Router } from "express";
import * as categoryController from "../controllers/category.controller";

const categoryRouter = Router();

categoryRouter.get("/:id", categoryController.getCategoriesById);
categoryRouter.get("/all/:userId", categoryController.getCategories);
categoryRouter.post("/", categoryController.postCategory);
categoryRouter.put("/:id", categoryController.putCategory);
categoryRouter.delete("/:id", categoryController.deleteCategory);

export default categoryRouter;
