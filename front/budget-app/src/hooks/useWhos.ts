import { useQuery } from "@tanstack/react-query";
import { fetchWhos } from "../service/whoService";
import type { Who } from "../Types";

export const useWhos = (userId: number) => {
  return useQuery<Who[]>({
    queryKey: ["whos", userId],
    queryFn: () => fetchWhos(userId),
    enabled: !!userId,
  });
};
