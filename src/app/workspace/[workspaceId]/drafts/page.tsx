"use client";
import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { CloudCog } from "lucide-react";
import { useRouter } from "next/navigation";

function WorkspaceDraftsPage() {
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const onBack = () => {
    router.push(`/workspace/${workspaceId}`);
  };
  return (
    <div className="h-full flex flex-col items-center justify-center gap-y-4">
      <CloudCog className="!size-20 text-muted-foreground" />
      <span className="text-md text-muted-foreground">
        This feature its under development.
      </span>
      <Button
        variant="link"
        size="sm"
        className="text-muted-foreground hover:text-[#b27cb3]"
        onClick={() => onBack()}
      >
        Go to main channel
      </Button>
    </div>
  );
}

export default WorkspaceDraftsPage;
