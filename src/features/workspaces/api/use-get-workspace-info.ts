import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface useGetWorkspaceInfoProp {
  id: Id<"workspaces">;
}

export const useGetWorkspaceInfo = ({ id }: useGetWorkspaceInfoProp) => {
  const data = useQuery(api.workspace.getInfoByID, { id });
  const isLoading = data === undefined;
  return { data, isLoading };
};
