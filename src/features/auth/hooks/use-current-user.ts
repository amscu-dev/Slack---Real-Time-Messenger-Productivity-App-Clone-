import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export const useCurrentUser = () => {
  const data = useQuery(api.users.current);
  // Cream propriul isLoading;
  // In Convex in momentul in care data este undefined, consideram ca este loading.
  // In cazul in care datele nu exista se va returna null.
  const isLoading = data === undefined;
  return { data, isLoading };
};
