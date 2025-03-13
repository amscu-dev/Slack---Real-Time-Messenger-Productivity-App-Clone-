"use client";

import useGetChannel from "@/features/channels/api/use-get-channel";
import { useChannelId } from "@/hooks/use-channel-id";
import { Loader, TriangleAlert } from "lucide-react";
import Header from "./_components/header";
import ChatInput from "./_components/chat-input";
import { UseGetMessages } from "@/features/messages/api/use-get-messages";
import MessageList from "@/components/message-list";

function ChannelIdPage() {
  const channelId = useChannelId(); // Obține ID-ul canalului din URL
  const { results, status, loadMore } = UseGetMessages({ channelId }); // Obține mesajele pentru canalul respectiv
  const { data: channel, isLoading: channelLoading } = useGetChannel({
    id: channelId,
  });

  // Dacă datele canalului sau mesajele sunt încărcate, afișează loader-ul
  if (channelLoading || status === "LoadingFirstPage") {
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <Loader className="!size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Dacă canalul nu este găsit, afișează un mesaj de eroare
  if (!channel) {
    return (
      <div className="h-full flex-1 flex flex-col gap-y-2 items-center justify-center">
        <TriangleAlert className="!size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Channel not found</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header-ul canalului, afișează numele canalului */}
      <Header channelName={channel.name} />

      {/* Lista mesajelor, cu informații suplimentare despre canal și opțiuni de încărcare a mesajelor */}
      <MessageList
        channelName={channel.name}
        channelCreationTime={channel._creationTime}
        data={results}
        loadMore={loadMore}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
      />

      {/* Input pentru a trimite mesaje, cu un placeholder dinamic */}
      <ChatInput placeholder={`Message # ${channel.name}`} />
    </div>
  );
}

export default ChannelIdPage;
