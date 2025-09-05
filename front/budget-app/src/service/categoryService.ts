import axios from "axios";
import type { Category } from "../Types";

export const fetchCategories = async (userId: number): Promise<Category[]> => {
  const res = await axios.get(`/api/categories/all/${userId}`);
  return res.data;
};

export const createCategory = async (data: {
  userId: number;
  name: string;
  parentId: number | null;
}) => {
  const res = await axios.post("/api/categories", data);
  return res.data;
};

export const getCategoryById = async (
  id: number
): Promise<Category & { children?: Category[] }> => {
  const res = await axios.get(`/api/categories/${id}`);
  return res.data[0];
};

export const updateCategory = async (id: number, data: { name: string }) => {
  const res = await axios.put(`/api/categories/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id: number) => {
  const res = await axios.delete(`/api/categories/${id}`);
  return res.data;
};
