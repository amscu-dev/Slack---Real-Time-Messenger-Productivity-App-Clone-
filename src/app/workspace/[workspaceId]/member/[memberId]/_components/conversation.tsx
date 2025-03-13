import MessageList from "@/components/message-list";
import { useGetMember } from "@/features/members/api/use-get-member";
import { UseGetMessages } from "@/features/messages/api/use-get-messages";
import { useMemberId } from "@/hooks/use-member-id";
import { usePanel } from "@/hooks/use-panel";
import { Loader } from "lucide-react";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import ChatInput from "./chat-input";
import Header from "./header";

interface ConversationProps {
  id: Id<"conversations">;
}

function Conversation({ id }: ConversationProps) {
  const memberId = useMemberId();
  const { onOpenProfile } = usePanel();

  // Obține datele despre membru
  const { data: member, isLoading: memberLoading } = useGetMember({
    id: memberId,
  });

  // Obține mesajele conversației
  const { results, status, loadMore } = UseGetMessages({ conversationId: id });

  // Verifică dacă datele despre membru sau mesajele sunt încărcate
  if (memberLoading || status === "LoadingFirstPage") {
    return (
      <div className="h-full  flex items-center justify-center">
        <Loader className="!size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full">
      {/* Header-ul conversației cu informații despre membru și opțiunea de a deschide profilul */}
      <Header
        memberName={member?.user.name}
        memberImage={member?.user.image}
        onClick={() => onOpenProfile(memberId)}
      />
      {/* Lista de mesaje ale conversației */}
      <MessageList
        data={results}
        variant="conversation"
        memberImage={member?.user.image}
        memberName={member?.user.name}
        loadMore={loadMore}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
      />
      {/* Input-ul pentru trimiterea unui mesaj în conversație */}
      <ChatInput
        placeholder={`Message ${member?.user.name}`}
        conversationId={id}
      />
    </div>
  );
}

export default Conversation;
