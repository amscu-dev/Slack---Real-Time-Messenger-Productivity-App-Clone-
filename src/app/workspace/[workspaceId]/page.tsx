"use client";

import useGetChannels from "@/features/channels/api/use-get-channels";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks/redux-store-hooks";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { onOpenChannelModal } from "@/store/slices/channelModalSlice";
import { Loader, TriangleAlertIcon } from "lucide-react";
import { useCurrentMember } from "@/features/members/api/use-current-member";

function WorkspaceIdPage() {
  const { isOpen } = useAppSelector((state) => state.channelModal);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });
  const { data: channels, isLoading: channelsLoading } = useGetChannels({
    workspaceId,
  });
  const channelId = useMemo(() => channels?.[0]?._id, [channels]);
  const isAdmin = useMemo(() => member?.role === "admin", [member?.role]);
  useEffect(() => {
    if (
      workspaceLoading ||
      channelsLoading ||
      memberLoading ||
      !member ||
      !workspace
    )
      return;
    if (channelId) {
      router.push(`/workspace/${workspaceId}/channel/${channelId}`);
    } else if (!isOpen && isAdmin) {
      dispatch(onOpenChannelModal());
    }
  }, [
    member,
    memberLoading,
    workspaceLoading,
    channelsLoading,
    workspace,
    router,
    dispatch,
    isOpen,
    channelId,
    workspaceId,
    isAdmin,
  ]);
  if (workspaceLoading || channelsLoading || memberLoading) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-y-2">
        <Loader className="!size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!workspace || !member) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-y-2">
        <TriangleAlertIcon className="!size-6 animate-ping text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Workspace not found
        </span>
      </div>
    );
  }
  return (
    <div className="h-full flex-1 flex items-center justify-center flex-col gap-y-2">
      <TriangleAlertIcon className="!size-6 animate-ping text-muted-foreground" />
      <span className="text-sm text-muted-foreground">No channel found</span>
    </div>
  );
}

export default WorkspaceIdPage;
