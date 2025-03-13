"use client";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks/redux-store-hooks";
import { onCloseInviteModal } from "@/store/slices/inviteModalSlice";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNewJoinCode } from "@/features/workspaces/api/use-new-join-code";
import useConfirm from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import { CircleCheckBig, CopyIcon, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface InviteModalProps {
  name: string;
  joinCode: string;
}
function InviteModal({ name, joinCode }: InviteModalProps) {
  // Hook-ul pentru a genera un nou cod de invitație
  const { mutate, isPending } = useNewJoinCode();
  // Hook-ul pentru confirmare (arată un dialog de confirmare înainte de a regenera codul)
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "This will deactivate the current invite code and generate a new one."
  );
  const [copied, setCopied] = useState(false); // Starea care urmărește dacă link-ul a fost copiat în clipboard
  const { isOpen } = useAppSelector((state) => state.inviteModal);
  const dispatch = useAppDispatch(); // Folosit pentru a trimite acțiuni către Redux store
  const workspaceId = useWorkspaceId(); // Obține ID-ul workspace-ului curent

  // Funcția care se execută când se regenerează un cod de invitație
  const handleNewCode = async () => {
    const ok = await confirm(); // Așteaptă confirmarea utilizatorului
    if (!ok) return;
    mutate(
      { workspaceId },
      {
        onSuccess() {
          toast.success("Invite code regenerated");
        },
        onError: () => {
          toast.error("Failed to regenerate invite code");
        },
      }
    );
  };

  // Funcția care se execută la copierea link-ului
  const handleCopy = () => {
    const inviteLink = `${window.location.origin}/join/${workspaceId}`; // Construiește link-ul de invitație
    // Copiază link-ul în clipboard-ul utilizatorului
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true); // Schimbă starea la "copiat"
      toast.success("Invite link copied to clipboard");
    });

    // Resetează starea "copiat" după 1.5 secunde
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  // Funcția care închide modalul
  const handleClose = () => {
    dispatch(onCloseInviteModal());
  };

  return (
    <>
      <ConfirmDialog />
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite people to {name}</DialogTitle>
            <DialogDescription>
              Use code below to invite people to your workspace
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-y-4 items-center justify-center py-10">
            <p className="text-4xl font-bold tracking-widest uppercase">
              {joinCode}
            </p>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              Copy Link
              <div className="relative w-4 h-4">
                {copied ? (
                  <CircleCheckBig className="size-4 ml-2 !text-green-500 transition-all duration-300 scale-100 opacity-100" />
                ) : (
                  <CopyIcon className="size-4 ml-2 transition-all duration-300 scale-100 opacity-100" />
                )}
              </div>
            </Button>
          </div>
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              onClick={handleNewCode}
              disabled={isPending}
            >
              New Code
              <RefreshCcw
                className={cn("!size-4 ml-2", isPending && "animate-spin")}
              />
            </Button>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default InviteModal;
