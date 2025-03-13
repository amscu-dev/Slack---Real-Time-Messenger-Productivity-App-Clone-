"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Profile from "@/features/members/components/profile";
import Thread from "@/features/messages/components/thread";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { usePanel } from "@/hooks/use-panel";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import Sidebar from "./_components/sidebar";
import Toolbar from "./_components/toolbar";
import WorkspaceSidebar from "./_components/workspace-sidebar";

interface WorkspaceIdLayoutProps {
  children: React.ReactNode;
}

function WorkspaceIdLayout({ children }: WorkspaceIdLayoutProps) {
  const { parentMessageId, profileMemberId, onClose } = usePanel();
  const showPanel = !!parentMessageId || !!profileMemberId;
  const router = useRouter();
  const { data, isLoading } = useGetWorkspaces(); // Obține workspace-urile și starea lor de încărcare
  const workspaceId = useMemo(() => data?.[0]?._id, [data]); // Memorizează ID-ul primului workspace

  // Verifică dacă workspace-ul există și redirecționează dacă nu este găsit
  useEffect(() => {
    if (isLoading) return; // Așteaptă până când datele sunt încărcate
    if (!workspaceId) {
      router.replace(`/`); // Redirecționează către pagina principală dacă nu există workspace
    }
  }, [workspaceId, isLoading, router]);

  // Afișează loader-ul dacă datele sunt încărcate
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-customBgNav">
        <Loader className="!size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full">
      <Toolbar />
      <div className="flex h-[calc(100vh-40px)]">
        {/* Sidebar-ul principal */}
        <Sidebar />
        <ResizablePanelGroup
          direction="horizontal"
          // Asta va merge in localhost si va pastra dimensiunea panourilor intre reimprospatarile paginii
          autoSaveId="asmcu-dev-workspace-layout"
        >
          <ResizablePanel
            defaultSize={20}
            minSize={11}
            className="bg-customChannelsSidebar"
          >
            {/* Sidebar-ul workspace-ului */}
            <WorkspaceSidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={20} defaultSize={80}>
            {children}
          </ResizablePanel>
          {/* Panoul suplimentar pentru thread sau profil */}
          {showPanel && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel minSize={20} defaultSize={29}>
                {parentMessageId ? (
                  <Thread
                    messageId={parentMessageId as Id<"messages">}
                    onClose={onClose}
                  />
                ) : profileMemberId ? (
                  <Profile
                    memberId={profileMemberId as Id<"members">}
                    onClose={onClose}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Loader className="!size-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

export default WorkspaceIdLayout;
