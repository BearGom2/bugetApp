import { Request, Response } from "express";
import * as userService from "../services/user.service";

export const getUsers = async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  res.json(users);
};

export const getUser = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const user = await userService.getUser(id);
  user ? res.json(user) : res.status(404).json({ error: "User not found" });
};

export const postUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await userService.createUser(username, password);
  res.status(201).json(user);
};

export const putUser = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const user = await userService.updateUser(id, req.body);
  res.json(user);
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await userService.deleteUser(id);
  res.status(204).send();
};

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = await userService.loginUser(username, password);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  res.json({
    message: "Login successful",
    user: { id: user.id, username: user.username },
  });
};
