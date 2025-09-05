import prisma from "../prisma";

export const getCategories = (userId: number) =>
  prisma.category.findMany({ where: { userId }, include: { children: true } });

export const getCategoriesById = (id: number) =>
  prisma.category.findMany({ where: { id }, include: { children: true } });

export const createCategory = (
  userId: number,
  name: string,
  parentId?: number,
) => prisma.category.create({ data: { userId, name, parentId } });

export const updateCategory = (
  id: number,
  data: { name?: string; parentId?: number },
) => prisma.category.update({ where: { id }, data });

export const deleteCategory = (id: number) =>
  prisma.category.delete({ where: { id } });
