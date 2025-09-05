import axios from "axios";
import type { History } from "../Types";

export const fetchHistories = async (userId: number): Promise<History[]> => {
  const res = await axios.get(`/api/histories/${userId}`);
  return res.data;
};

export const createHistory = async (data: {
  userId: number;
  type: "income" | "expense";
  transactionDate: string;
  history: string;
  categoryId: number | null;
  amount: number;
  description: string | null;
  whoId: number | null;
}) => {
  return axios.post("/api/histories", data);
};

export const getHistoryById = async (id: number) => {
  const res = await axios.get(`/api/histories/detail/${id}`);
  return res.data;
};

export const updateHistory = async (
  id: number,
  data: {
    type: "income" | "expense";
    transactionDate: string;
    history: string;
    categoryId: number | null;
    amount: number;
    description: string | null;
    whoId: number | null;
  }
) => {
  return axios.put(`/api/histories/${id}`, data);
};

export const deleteHistory = async (id: number) => {
  return axios.delete(`/api/histories/${id}`);
};
