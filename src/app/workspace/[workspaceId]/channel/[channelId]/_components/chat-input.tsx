/* eslint-disable @typescript-eslint/no-unused-vars */

import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Id } from "../../../../../../../convex/_generated/dataModel";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface ChatInputProps {
  placeholder: string;
}

type CreateMessageValues = {
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  body: string;
  image?: Id<"_storage"> | undefined;
};

function ChatInput({ placeholder }: ChatInputProps) {
  // Inițializăm stările pentru a urmări editorul și procesul de trimitere
  const [editorKey, setEditorKey] = useState(0); // Folosit pentru a forța rerandarea editorului (resetarea input-ului)
  const [isPending, setIsPending] = useState(false); // Starea care indică dacă mesajul este în proces de trimitere
  const isToolbarVisibleRef = useRef<boolean>(true); // Referința pentru a urmări dacă bara de unelte este vizibilă
  const editorRef = useRef<Quill | null>(null); // Referința pentru a manipula editorul Quill

  const workspaceId = useWorkspaceId(); // Obține ID-ul workspace-ului curent din URL
  const channelId = useChannelId(); // Obține ID-ul canalului curent din URL

  const { mutate: generateUploadUrl } = useGenerateUploadUrl(); // Funcția pentru a genera URL-ul de încărcare a fișierului
  const { mutate: createMessage } = useCreateMessage(); // Funcția pentru a crea un mesaj în canalul curent

  // Funcția care se execută la trimiterea unui mesaj
  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    try {
      setIsPending(true); // Activează starea de încărcare
      editorRef?.current?.enable(false); // Dezactivează editorul pentru a preveni modificările în timpul încărcării

      const values: CreateMessageValues = {
        channelId,
        workspaceId,
        body,
        image: undefined,
      };

      // Dacă există o imagine, o încărcăm pe server
      if (image) {
        const url = await generateUploadUrl({}, { throwError: true }); // Obținem URL-ul pentru încărcare
        if (!url) {
          throw new Error("Url not found");
        }
        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image, // Trimitem imaginea
        });

        if (!result.ok) {
          throw new Error("Failed to upload image");
        }

        const { storageId } = await result.json(); // Obținem ID-ul imaginii din răspunsul serverului
        values.image = storageId; // Setăm ID-ul imaginii în obiectul de date
      }

      await createMessage(values, { throwError: true });
      setEditorKey((prevKey) => prevKey + 1);
    } catch (error) {
      toast.error("Failed to send message!");
    } finally {
      setIsPending(false);
      editorRef?.current?.enable(true);
    }
  };
  return (
    <div className="px-5 w-full">
      <Editor
        // Pentru fiecare state schimba editor ul se va reranda, deci vom reseta si input ul pentru editor
        key={editorKey}
        variant="create"
        placeholder={placeholder}
        onSubmit={handleSubmit}
        disabled={isPending}
        innerRef={editorRef}
        isToolbarVisibleRef={isToolbarVisibleRef}
      />
    </div>
  );
}

export default ChatInput;
