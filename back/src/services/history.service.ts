// Who, Category는 프론트에서 구현

import prisma from "../prisma";

export const getHistories = (userId: number) =>
  prisma.history.findMany({
    where: { userId },
    include: { category: true, who: true },
  });

export const getHistoryById = (id: number) =>
  prisma.history.findUnique({
    where: { id },
    include: { category: true, who: true },
  });

export const getHistoriesByDateRange = (
  userId: number,
  startDate: Date,
  endDate: Date,
  order: "asc" | "desc",
) =>
  prisma.history.findMany({
    where: {
      userId,
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: { category: true, who: true },
    orderBy: {
      transactionDate: order,
    },
  });

export const createHistory = (data: {
  userId: number;
  categoryId?: number;
  whoId?: number;
  type: "income" | "expense";
  history: string;
  amount: number;
  description?: string;
  transactionDate: Date;
}) => prisma.history.create({ data });

export const updateHistory = (
  id: number,
  data: Partial<{
    categoryId?: number;
    whoId?: number;
    type: "income" | "expense";
    history: string;
    amount: number;
    description?: string;
    transactionDate: Date;
  }>,
) => prisma.history.update({ where: { id }, data });

export const deleteHistory = (id: number) =>
  prisma.history.delete({ where: { id } });
