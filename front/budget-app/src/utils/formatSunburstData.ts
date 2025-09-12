import type { Category, History } from "../Types";

export const formatSunburstData = (
  histories: History[],
  categories: Category[]
) => {
  const expenseHistories = histories.filter(
    (h) => h.type === "expense" && h.category
  );

  const parentCategories = categories.filter((c) => c.parentId === null);
  const childCategories = categories.filter((c) => c.parentId !== null);

  const parentMap = Object.fromEntries(
    parentCategories.map((p) => [p.id, p.name])
  );
  const childMap = Object.fromEntries(
    childCategories.map((c) => [c.id, { name: c.name, parentId: c.parentId }])
  );

  const result: Record<
    string,
    Record<string, { name: string; amount: number }[]>
  > = {};
  let uncategorized = 0;

  for (const h of expenseHistories) {
    const category = h.category;
    const amount = Number(-h.amount);
    const historyName = `${h.history} ${new Date(
      h.transactionDate
    ).getMonth()}월 ${new Date(h.transactionDate).getDate()}일`;

    if (!category || category.id === undefined || category.id === null) {
      uncategorized += amount;
      continue;
    }

    const child = childMap[category.id];

    if (child) {
      if (!child.parentId) continue;
      const parentName = parentMap[child.parentId];
      if (!parentName) continue;

      result[parentName] = result[parentName] || {};
      result[parentName][child.name] = result[parentName][child.name] || [];
      result[parentName][child.name].push({ name: historyName, amount });
    } else if (parentMap[category.id]) {
      const parentName = parentMap[category.id];
      result[parentName] = result[parentName] || {};
      result[parentName]["(미지정)"] = result[parentName]["(미지정)"] || [];
      result[parentName]["(미지정)"].push({ name: historyName, amount });
    } else {
      uncategorized += amount;
    }
  }

  type SunburstEntry = {
    name: string;
    loc?: number;
    children?: SunburstEntry[];
  };

  const chartData: SunburstEntry = {
    name: "총지출",
    children: Object.entries(result).map(([parent, children]) => ({
      name: parent,
      children: Object.entries(children).map(([child, entries]) => ({
        name: child,
        children: entries.map((entry) => ({
          name: entry.name,
          loc: entry.amount,
        })),
      })),
    })),
  };

  if (uncategorized > 0) {
    chartData.children = chartData.children || [];
    chartData.children.push({
      name: "미분류",
      loc: uncategorized,
    });
  }

  return chartData;
};
