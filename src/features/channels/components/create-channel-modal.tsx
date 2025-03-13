"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useWorkspaceId } from "@/hooks/use-workspace-id";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks/redux-store-hooks";
import { onCloseChannelModal } from "@/store/slices/channelModalSlice";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateChannel } from "../api/use-create-channel";

function CreateChannelModal() {
  const router = useRouter();
  const { isOpen } = useAppSelector((state) => state.channelModal);
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const { mutate, isPending } = useCreateChannel();
  const workspaceId = useWorkspaceId();
  const handleClose = () => {
    dispatch(onCloseChannelModal());
    setName("");
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
    setName(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(
      { name, workspaceId },
      {
        onSuccess(id) {
          handleClose();
          router.push(`/workspace/${workspaceId}/channel/${id}`);
          toast.success("Channel created");
        },
        onError: () => {
          toast.error("Failed to create a channel");
        },
      }
    );
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={name}
            onChange={handleChange}
            disabled={isPending}
            required
            autoFocus
            minLength={3}
            maxLength={80}
            placeholder="e.g. plan-budget"
          />
          <div className="flex justify-end">
            <Button disabled={isPending}>Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateChannelModal;
