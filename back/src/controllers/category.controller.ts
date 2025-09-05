import { Request, Response } from "express";
import * as categoryService from "../services/category.service";

export const getCategories = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const categories = await categoryService.getCategories(userId);
  res.json(categories);
};

export const getCategoriesById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const categories = await categoryService.getCategoriesById(id);
  res.json(categories);
};

export const postCategory = async (req: Request, res: Response) => {
  const { userId, name, parentId } = req.body;
  const category = await categoryService.createCategory(userId, name, parentId);
  res.status(201).json(category);
};

export const putCategory = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const category = await categoryService.updateCategory(id, req.body);
  res.json(category);
};

export const deleteCategory = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await categoryService.deleteCategory(id);
  res.status(204).send();
};
