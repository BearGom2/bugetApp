import type { History } from "../Types";

interface FilterParams {
  histories: History[];
  startDate: Date | null;
  endDate: Date | null;
  selectedTypes: string[];
  selectedCategories: string[];
  selectedWho: string[];
  searchKeyword: string;
}

export const filterHistories = ({
  histories,
  startDate,
  endDate,
  selectedTypes,
  selectedCategories,
  selectedWho,
  searchKeyword,
}: FilterParams): History[] => {
  return histories.filter((h) => {
    const matchDate =
      (!startDate || new Date(h.transactionDate) >= startDate) &&
      (!endDate || new Date(h.transactionDate) <= endDate);

    const matchType =
      selectedTypes.length === 0 || selectedTypes.includes(h.type);

    const matchCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(String(h.category?.id));

    const matchWho =
      selectedWho.length === 0 || selectedWho.includes(String(h.who?.id));

    const matchKeyword =
      !searchKeyword ||
      h.history.includes(searchKeyword) ||
      h.description?.includes(searchKeyword);

    return matchDate && matchType && matchCategory && matchWho && matchKeyword;
  });
};
