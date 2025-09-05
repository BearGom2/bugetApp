import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { fetchHistories } from "../service/historyService";
import type { History } from "../Types";

export const useHistories = (): UseQueryResult<History[], Error> => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const queryResult = useQuery({
    queryKey: ["histories", user.id],
    queryFn: () => fetchHistories(user.id),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    if (!queryResult.isLoading && queryResult.error) {
      toast.error("거래 내역을 불러오지 못했습니다.");
    }
  }, [queryResult.isLoading, queryResult.error]);

  return queryResult;
};
