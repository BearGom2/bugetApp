import bcrypt from "bcrypt";
import prisma from "../prisma";

export const getAllUsers = () => prisma.user.findMany();

export const getUser = (id: number) =>
  prisma.user.findUnique({ where: { id } });

export const createUser = async (username: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.create({ data: { username, password: hashedPassword } });
};

export const loginUser = async (username: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  return isMatch ? user : null;
};

export const updateUser = (
  id: number,
  data: { username?: string; password?: string },
) => prisma.user.update({ where: { id }, data });

export const deleteUser = (id: number) => prisma.user.delete({ where: { id } });
