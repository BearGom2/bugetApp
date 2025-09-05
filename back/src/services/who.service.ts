import prisma from "../prisma";

export const getWhosById = (id: number) =>
  prisma.who.findUnique({ where: { id } });

export const getWhos = (userId: number) =>
  prisma.who.findMany({ where: { userId } });

export const createWho = (userId: number, name: string) =>
  prisma.who.create({ data: { userId, name } });

export const updateWho = (id: number, name: string) =>
  prisma.who.update({ where: { id }, data: { name } });

export const deleteWho = (id: number) => prisma.who.delete({ where: { id } });
