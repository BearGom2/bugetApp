import { Request, Response } from "express";
import * as historyService from "../services/history.service";

export const getHistories = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const histories = await historyService.getHistories(userId);
  res.json(histories);
};

export const getHistory = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const history = await historyService.getHistoryById(id);
  history
    ? res.json(history)
    : res.status(404).json({ error: "History not found" });
};

export const getHistoriesByDate = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const { start, end, asc } = req.query;

  if (!start || !end) {
    res.status(400).json({ error: "start and end query params are required" });
    return;
  }

  const startDate = new Date(start as string);
  const endDate = new Date(end as string);
  const order = asc === "true" ? "asc" : "desc";

  const histories = await historyService.getHistoriesByDateRange(
    userId,
    startDate,
    endDate,
    order,
  );
  res.json(histories);
};

export const postHistory = async (req: Request, res: Response) => {
  const data = req.body;
  const originalDate = new Date(data.transactionDate);
  const kstDate = new Date(originalDate.getTime() + 9 * 60 * 60 * 1000);
  const history = await historyService.createHistory({
    ...data,
    transactionDate: kstDate,
  });
  res.status(201).json(history);
};

export const putHistory = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const history = await historyService.updateHistory(id, req.body);
  res.json(history);
};

export const deleteHistory = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await historyService.deleteHistory(id);
  res.status(204).send();
};
