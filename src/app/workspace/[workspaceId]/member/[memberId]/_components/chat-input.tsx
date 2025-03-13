/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Id } from "../../../../../../../convex/_generated/dataModel";

// Încarcă dinamic editorul Quill, fără SSR (server-side rendering)
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface ChatInputProps {
  placeholder: string;
  conversationId: Id<"conversations">;
}

type CreateMessageValues = {
  conversationId: Id<"conversations">;
  workspaceId: Id<"workspaces">;
  body: string;
  image?: Id<"_storage"> | undefined;
};

function ChatInput({ placeholder, conversationId }: ChatInputProps) {
  // State pentru controlul re-randării editorului
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false); // State pentru a urmări starea încărcării (pending)

  const editorRef = useRef<Quill | null>(null); // Referință pentru editorul Quill
  const isToolbarVisibleRef = useRef<boolean>(true); // Referință pentru vizibilitatea toolbar-ului

  const workspaceId = useWorkspaceId(); // Obține ID-ul workspace-ului curent din URL

  const { mutate: generateUploadUrl } = useGenerateUploadUrl(); // Funcția de generare a URL-ului de încărcare
  const { mutate: createMessage } = useCreateMessage(); // Funcția de creare a unui mesaj

  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    try {
      setIsPending(true);
      editorRef?.current?.enable(false);

      const values: CreateMessageValues = {
        conversationId,
        workspaceId,
        body,
        image: undefined,
      };

      // Dacă există o imagine, o încărcăm pe server
      if (image) {
        const url = await generateUploadUrl({}, { throwError: true }); // Generează URL-ul de încărcare
        if (!url) {
          throw new Error("Url not found");
        }
        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });

        if (!result.ok) {
          throw new Error("Failed to upload image");
        }

        const { storageId } = await result.json(); // Obține storageId după încărcarea imaginii
        values.image = storageId; // Atribuie storageId valorii image
      }
      await createMessage(values, { throwError: true }); // Creează mesajul
      setEditorKey((prevKey) => prevKey + 1); // Rerandează editorul pentru a reseta input-ul
    } catch (error) {
      toast.error("Failed to send message!");
    } finally {
      setIsPending(false);
      editorRef?.current?.enable(true);
    }
  };

  return (
    <div className="px-5 w-full">
      {/* Editorul Quill, cu parametrii specifici */}
      <Editor
        key={editorKey} // Cheia pentru a reseta editorul la fiecare re-randare
        variant="create" // Setează varianta editorului
        placeholder={placeholder} // Setează placeholder-ul
        onSubmit={handleSubmit} // Funcția de submit pentru editor
        disabled={isPending} // Dezactivează editorul când este în starea de încărcare
        innerRef={editorRef} // Referința editorului
        isToolbarVisibleRef={isToolbarVisibleRef} // Referința vizibilității toolbar-ului
      />
    </div>
  );
}

export default ChatInput;
