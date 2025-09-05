import { Request, Response } from "express";
import * as whoService from "../services/who.service";

export const getWhos = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const whos = await whoService.getWhos(userId);
  res.json(whos);
};

export const getWhosById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const whos = await whoService.getWhosById(id);
  res.json(whos);
};

export const postWho = async (req: Request, res: Response) => {
  const { userId, name } = req.body;
  const who = await whoService.createWho(userId, name);
  res.status(201).json(who);
};

export const putWho = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;
  const who = await whoService.updateWho(id, name);
  res.json(who);
};

export const deleteWho = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await whoService.deleteWho(id);
  res.status(204).send();
};
