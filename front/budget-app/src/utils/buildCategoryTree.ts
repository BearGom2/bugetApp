import type { Category } from "../Types";

type IndentedCategory = Category & { depth: number };

export const buildCategoryTree = (
  categories: Category[],
  parentId: number | null = null,
  depth: number = 0
): IndentedCategory[] => {
  return categories
    .filter((c) => c.parentId === parentId)
    .flatMap((cat) => [
      { ...cat, depth },
      ...buildCategoryTree(categories, cat.id, depth + 1),
    ]);
};
