import { useEffect } from "react";
import { fetchCategories } from "../service/categoryService";
import type { Category, Option } from "../Types";
import { buildCategoryTree } from "../utils/buildCategoryTree";

type IndentedCategory = Category & { depth: number };
const toSelectOptions = (tree: IndentedCategory[]): Option[] =>
  tree.map((c) => ({
    label: `${"  ".repeat(c.depth)}${c.name}`,
    value: String(c.id),
    disabled: c.parentId === null || tree.some((x) => x.parentId === c.id),
    depth: c.depth,
  }));

export const useCategoryOptions = (
  setOptions: React.Dispatch<React.SetStateAction<Option[]>>
) => {
  useEffect(() => {
    const loadCategories = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id) return;

      const data = await fetchCategories(user.id);
      const formatted = toSelectOptions(buildCategoryTree(data));

      setOptions(formatted);
    };

    loadCategories();
  }, []);
};
