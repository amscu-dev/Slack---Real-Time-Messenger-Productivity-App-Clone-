interface WorkspaceIdPageProps {
  params: Promise<{ workspaceId: string }>;
}
async function WorkspaceIdPage({ params }: WorkspaceIdPageProps) {
  const { workspaceId } = await params;
  return <div>ID:{workspaceId}</div>;
}

export default WorkspaceIdPage;
