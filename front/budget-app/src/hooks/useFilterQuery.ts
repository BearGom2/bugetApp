import { useSearchParams, useNavigate } from "react-router-dom";

export const useFilterQuery = () => {
  const [params,] = useSearchParams();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const startMonth = new Date(currentYear, currentMonth, 1);

  const updateFilterQuery = (
    key: "type" | "category" | "who" | "date" | "keyword",
    value: string[] | Date[] | string
  ) => {
    const newParams = new URLSearchParams(params.toString());

    if (key === "type") {
      newParams.delete("type");
      (value as string[]).forEach((v: string) => newParams.append("type", v));
    } else if (key === "category") {
      newParams.delete("category");
      (value as string[]).forEach((v: string) => newParams.append("category", v));
    } else if (key === "who") {
      newParams.delete("who");
      (value as string[]).forEach((v: string) => newParams.append("who", v));
    } else if (key === "date") {
      if (value?.[0]) newParams.set("start", new Date((value[0] as Date).getTime() + 9 * 60 * 60 * 1000).toISOString());
      else newParams.delete("start");
      if (value?.[1]) newParams.set("end", new Date((value[1] as Date).getTime() + 9 * 60 * 60 * 1000).toISOString());
      else newParams.delete("end");
    } else if (key === "keyword") {
      if (typeof value === "string") newParams.set("keyword", value);
      else newParams.delete("keyword");
    }

    // ✅ URL만 바꾸되 히스토리엔 남기지 않음
    navigate({ search: newParams.toString() }, { replace: true });
  };

  const query = {
    selectedTypes: params.getAll("type"),
    selectedCategories: params.getAll("category"),
    selectedWho: params.getAll("who"),
    startDate: params.get("start")
      ? new Date(params.get("start")!)
      : startMonth,
    endDate: params.get("end") ? new Date(params.get("end")!) : null,
    searchKeyword: params.get("keyword") || "",
    raw: Object.fromEntries(params.entries()),
  };

  return { query, updateFilterQuery };
};
