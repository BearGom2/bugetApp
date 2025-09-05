export type Option = {
  label: string;
  value: string;
  disabled?: boolean;
  depth?: number;
};

export type Category = {
  id: number;
  name: string;
  parentId: number | null;
};

export type Who = {
  id: number;
  name: string;
};

export type History = {
  id: number;
  transactionDate: Date;
  type: "income" | "expense";
  history: string;
  category: Category;
  amount: number;
  balance: number;
  total: number;
  description: string;
  who: Who;
};
