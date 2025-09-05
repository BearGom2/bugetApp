import { useEffect } from "react";
import { fetchWhos } from "../service/whoService";
import type { Option } from "../Types";

export const useWhoOptions = (
  setOptions: React.Dispatch<React.SetStateAction<Option[]>>
) => {
  useEffect(() => {
    const loadWhos = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id) return;

      const data = await fetchWhos(user.id);
      const formatted = data.map((w) => ({
        label: w.name,
        value: String(w.id),
      }));
      setOptions(formatted);
    };

    loadWhos();
  }, []);
};
