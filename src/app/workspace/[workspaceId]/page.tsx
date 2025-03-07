// interface WorkspaceIdPageProps {
//   params: Promise<{ workspaceId: string }>;
// }
// async function WorkspaceIdPage({ params }: WorkspaceIdPageProps) {
//   const { workspaceId } = await params;
//   return <div>ID:{workspaceId}</div>;
// }
// export default WorkspaceIdPage;
"use client";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

function WorkspaceIdPage() {
  const workspaceId = useWorkspaceId();
  console.log(workspaceId);
  const { data, isLoading } = useGetWorkspace({ id: workspaceId });
  return <div>ID:{JSON.stringify(data)}</div>;
}

export default WorkspaceIdPage;
