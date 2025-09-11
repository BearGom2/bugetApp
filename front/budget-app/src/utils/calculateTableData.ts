import type { History } from "../Types";

export const calculateTableData = (histories: History[]) => {
  return histories
    .sort(
      (a, b) =>
        new Date(a.transactionDate).getTime() -
        new Date(b.transactionDate).getTime()
    )
    .reduce<{ rows: (string | number)[][]; balance: number; total: number }>(
      (acc, history) => {
        const amount = Number(history.amount);
        const isExpense = history.type === "expense";
        const newBalance = isExpense ? acc.balance - amount : acc.balance + amount;
        const newTotal = acc.total + (isExpense ? amount : 0);

        acc.rows.push([
          history.id,
          new Date(history.transactionDate).toISOString().split("T")[0],
          isExpense ? "지출" : "소득",
          history.history,
          history.category?.name || "",
          amount.toLocaleString(),
          newBalance.toLocaleString(),
          newTotal.toLocaleString(),
          history.description || "",
          history.who?.name || "",
        ]);

        return { rows: acc.rows, balance: newBalance, total: newTotal };
      },
      { rows: [], balance: 0, total: 0 }
    )
    .rows.reverse();
};
