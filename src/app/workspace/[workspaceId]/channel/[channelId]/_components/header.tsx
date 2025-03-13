/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRemoveChannel } from "@/features/channels/api/use-remove-channel";
import { useUpdateChannel } from "@/features/channels/api/use-update-channel";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useChannelId } from "@/hooks/use-channel-id";
import useConfirm from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { DialogClose } from "@radix-ui/react-dialog";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { toast } from "sonner";

interface HeaderProps {
  channelName: string;
}

function Header({ channelName }: HeaderProps) {
  // Obține ID-ul workspace-ului din contextul curent
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId(); // Obține ID-ul canalului
  const [editOpen, setEditOpen] = useState(false); // Starea pentru a gestiona vizibilitatea dialogului de editare
  const [value, setValue] = useState(channelName); // Starea pentru a păstra numele canalului curent
  const { data: member } = useCurrentMember({ workspaceId }); // Obține datele membrului curent
  const [ConfirmDialog, confirm] = useConfirm(
    "Șterge acest canal?",
    "Veți șterge acest canal. Această acțiune este ireversibilă!"
  );

  const router = useRouter();

  // Mutation pentru actualizarea și ștergerea canalelor
  const { mutate: updateChannel, isPending: isUpdatingChannel } =
    useUpdateChannel();
  const { mutate: removeChannel, isPending: isRemovingChannel } =
    useRemoveChannel();

  // Deschide dialogul de editare doar dacă utilizatorul curent este admin
  const handleEditOpen = (value: boolean) => {
    if (member?.role !== "admin") return;
    setEditOpen(true);
  };

  // Manevrarea ștergerii canalului după confirmarea utilizatorului
  const handleDelete = async () => {
    const ok = await confirm();
    if (!ok) {
      return;
    }

    // Efectuează acțiunea de ștergere și gestionează succesul / eroarea
    removeChannel(
      { id: channelId },
      {
        onSuccess: () => {
          toast.success("Canal șters!");
          router.push(`/workspace/${workspaceId}`);
        },
        onError: () => {
          toast.error("Eșec la ștergerea canalului!");
        },
      }
    );
  };

  // Manevrarea schimbării numelui canalului în câmpul de input
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = e.target.value.replace(/\s+/g, "-").toLowerCase(); // Normalizează inputul
    setValue(value);
  };

  // Trimiterea numelui actualizat al canalului către API
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateChannel(
      { id: channelId, name: value },
      {
        onSuccess: () => {
          toast.success("Canal actualizat!");
          setEditOpen(false);
        },
        onError: () => {
          toast.error("Eșec la actualizarea canalului!");
        },
      }
    );
  };

  return (
    <>
      <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
        <ConfirmDialog />
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="text-lg font-semibold px-2 overflow-hidden w-auto"
              size="sm"
            >
              <span className="truncate"># {channelName}</span>
              <FaChevronDown className="!size-2.5 ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 bg-gray-50 overflow-hidden">
            <DialogHeader className="p-4 border-b bg-white">
              <DialogTitle># {channelName}</DialogTitle>
            </DialogHeader>
            <div className="px-4 pb-4 flex flex-col gap-y-2">
              <Dialog open={editOpen} onOpenChange={handleEditOpen}>
                {/* onOpenChange={setEditOpen} este echivalent cu: (open) => setEditOpen(open) */}
                <DialogTrigger asChild>
                  <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Channel name</p>
                      {member?.role === "admin" && (
                        <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                          Edit
                        </p>
                      )}
                    </div>
                    <p className="text-sm"># {channelName}</p>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rename this channel</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      value={value}
                      disabled={isUpdatingChannel}
                      onChange={handleChange}
                      required
                      autoFocus
                      minLength={3}
                      maxLength={18}
                      placeholder="e.g. plan-budget"
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" disabled={isUpdatingChannel}>
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button disabled={isUpdatingChannel}>Save</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              {member?.role === "admin" && (
                <button
                  onClick={handleDelete}
                  disabled={isRemovingChannel}
                  className="flex items-center gap-x-2 px-2 py-4 bg-white rounded-lg cursor-pointer border hover:bg-green-50 text-rose-600"
                >
                  <TrashIcon className="!size-4" />
                  <p className="text-sm font-semibold">Delete channel</p>
                </button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

export default Header;
