"use client";

import useGetChannels from "@/features/channels/api/use-get-channels";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks/redux-store-hooks";
import { onOpenChannelModal } from "@/store/slices/channelModalSlice";
import { Loader, TriangleAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

function WorkspaceIdPage() {
  const { isOpen } = useAppSelector((state) => state.channelModal);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const workspaceId = useWorkspaceId(); // Obține ID-ul workspace-ului din URL

  // Obține informațiile despre membru, workspace și canale
  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });
  const { data: channels, isLoading: channelsLoading } = useGetChannels({
    workspaceId,
  });

  const channelId = useMemo(() => channels?.[0]?._id, [channels]); // Memorizează ID-ul primului canal
  const isAdmin = useMemo(() => member?.role === "admin", [member?.role]); // Verifică dacă membrul este admin

  // Dacă datele sunt încărcate și nu sunt disponibile workspace-ul, membrul sau canalele, oprește execuția
  // Dacă există un canal, redirecționează către canalul respectiv, altfel deschide modalul de canal dacă este admin
  useEffect(() => {
    if (
      workspaceLoading ||
      channelsLoading ||
      memberLoading ||
      !member ||
      !workspace
    )
      return; // Nu face nimic dacă datele nu sunt încărcate

    if (channelId) {
      router.push(`/workspace/${workspaceId}/channel/${channelId}`); // Redirecționează către canalul selectat
    } else if (!isOpen && isAdmin) {
      dispatch(onOpenChannelModal()); // Deschide modalul de canal dacă nu sunt canale și utilizatorul este admin
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

  // Returnează un loader dacă datele sunt încărcate
  if (workspaceLoading || channelsLoading || memberLoading) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-y-2">
        <Loader className="!size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Afișează un mesaj de alertă dacă workspace-ul nu este găsit
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

  // Afișează un mesaj de alertă dacă nu există canale
  return (
    <div className="h-full flex-1 flex items-center justify-center flex-col gap-y-2">
      <TriangleAlertIcon className="!size-6 animate-ping text-muted-foreground" />
      <span className="text-sm text-muted-foreground">No channel found</span>
    </div>
  );
}

export default WorkspaceIdPage;
