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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CircleCheckBig, Copy, CopyIcon, RefreshCcw } from "lucide-react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { toast } from "sonner";
import { useState } from "react";
import { useNewJoinCode } from "@/features/workspaces/api/use-new-join-code";
import { cn } from "@/lib/utils";
import useConfirm from "@/hooks/use-confirm";

interface InviteModalProps {
  name: string;
  joinCode: string;
}
function InviteModal({ name, joinCode }: InviteModalProps) {
  const { mutate, isPending } = useNewJoinCode();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "This will deactivate the current invite code and generate a new one."
  );
  const [copied, setCopied] = useState(false);
  const { isOpen } = useAppSelector((state) => state.inviteModal);
  const dispatch = useAppDispatch();
  const workspaceId = useWorkspaceId();

  const handleNewCode = async () => {
    const ok = await confirm();
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
  const handleCopy = () => {
    const inviteLink = `${window.location.origin}/join/${workspaceId}`;
    // ✔ navigator.clipboard.writeText(inviteLink) – copiază string-ul în clipboard-ul utilizatorului.
    // ✔ Utilizatorul poate acum lipi (paste) link-ul oriunde dorește.
    // Este async
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      toast.success("Invite link copied to  clipboard");
    });

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };
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
