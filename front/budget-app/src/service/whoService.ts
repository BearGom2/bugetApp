import axios from "axios";
import type { Who } from "../Types";

export const fetchWhos = async (userId: number): Promise<Who[]> => {
  const res = await axios.get(`/api/whos/all/${userId}`);
  return res.data;
};

export const getWhoById = async (id: number) => {
  const res = await axios.get(`/api/whos/${id}`);
  return res.data;
};

export const createWho = async (userId: number, name: string) => {
  const res = await axios.post("/api/whos", { userId, name });
  return res.data;
};

export const updateWho = async (id: number, name: string) => {
  const res = await axios.put(`/api/whos/${id}`, { name });
  return res.data;
};

export const deleteWho = async (id: number) => {
  const res = await axios.delete(`/api/whos/${id}`);
  return res.data;
};
