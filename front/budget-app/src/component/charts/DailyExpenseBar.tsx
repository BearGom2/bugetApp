import { useMemo } from "react";
import { ResponsiveBar } from "@nivo/bar";
import type { History } from "../../Types";

interface Props {
  filteredHistories: History[];
}

const DailyExpenseBar = ({ filteredHistories }: Props) => {
  const barData = useMemo(() => {
    const dailyExpense = filteredHistories
      .filter((h) => h.type === "expense")
      .reduce<Record<string, number>>((acc, cur) => {
        const date = new Date(cur.transactionDate).toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + Number(-cur.amount);
        return acc;
      }, {});

    return Object.entries(dailyExpense).map(([date, amount]) => ({
      date,
      amount,
    }));
  }, [filteredHistories]);

  return (
    <ResponsiveBar
      data={barData}
      keys={["amount"]}
      indexBy="date"
      margin={{ top: 20, right: 50, bottom: 70, left: 100 }}
      padding={0.3}
      colors="#ff3535"
      labelPosition="end"
      labelOffset={10}
      axisLeft={{
        format: (value) => Number(value).toLocaleString() + "원",
      }}
      labelTextColor="#000"
      animate={true}
      valueFormat={(value) => Number(value).toLocaleString() + "원"}
    />
  );
};

export default DailyExpenseBar;
