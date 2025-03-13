/* eslint-disable @typescript-eslint/no-unused-vars */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useRemoveMember } from "@/features/members/api/use-remove-member";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import useConfirm from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import {
  AlertTriangle,
  ChevronDownIcon,
  Loader,
  MailIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Id } from "../../../../convex/_generated/dataModel";
import { useCurrentMember } from "../api/use-current-member";
import { useGetMember } from "../api/use-get-member";

interface ProfileProps {
  memberId: Id<"members">;
  onClose: () => void;
}

function Profile({ memberId, onClose }: ProfileProps) {
  const router = useRouter();

  const [LeaveDialog, confirmLeave] = useConfirm(
    "Leave workspace",
    "Are you sure you want to leave workspace?"
  );
  const [RemoveDialog, confirmRemove] = useConfirm(
    "Remove member from workspace",
    "Are you sure you want to remove this member from workspace?"
  );
  const [UpdateDialog, confirmUpdate] = useConfirm(
    "Change member role",
    "Are you sure you want to change this member`s role?"
  );

  const workspaceId = useWorkspaceId();

  const { data: currentMember, isLoading: isLoadingCurrentMember } =
    useCurrentMember({ workspaceId });

  const { data: member, isLoading: isLoadingMember } = useGetMember({
    id: memberId,
  });

  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();

  const { mutate: removeMember, isPending: isRemovingMember } =
    useRemoveMember();

  const avatarFallback = member?.user.name?.charAt(0).toUpperCase();

  const onRemove = async () => {
    const ok = await confirmRemove();
    if (!ok) return;
    removeMember(
      { id: memberId },
      {
        onSuccess: () => {
          toast.success("Member Removed");
          onClose();
        },
        onError: () => {
          toast.error("Failed to remove member");
        },
      }
    );
  };

  const onLeave = async () => {
    const ok = await confirmLeave();
    if (!ok) return;
    removeMember(
      { id: memberId },
      {
        onSuccess: () => {
          router.replace("/");
          toast.success("You left the workspace");
          onClose();
        },
        onError: () => {
          toast.error("Failed to leave the workspace");
        },
      }
    );
  };

  const onUpdate = async (role: "admin" | "member") => {
    const ok = await confirmUpdate();
    if (!ok) return;
    updateMember(
      { id: memberId, role },
      {
        onSuccess: () => {
          toast.success("Role changed");
          onClose();
        },
        onError: () => {
          toast.error("Failed to change role");
        },
      }
    );
  };

  if (isLoadingMember || isLoadingCurrentMember) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center px-4 h-[50px] border-b">
          <p className="text-lg font-bold">Profile</p>
          <Button onClick={onClose} size="iconSm" variant="ghost">
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="h-full flex flex-col gap-y-2 items-center justify-center">
          <Loader className="!size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }
  if (!member) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center px-4 h-[50px] border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button onClick={onClose} size="iconSm" variant="ghost">
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="h-full flex flex-col gap-y-2 items-center justify-center">
          <AlertTriangle className="!size-5 animate-ping text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Member not found</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <RemoveDialog />
      <LeaveDialog />
      <UpdateDialog />
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center px-4 h-[50px] border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button onClick={onClose} size="iconSm" variant="ghost">
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className=" flex flex-col items-center justify-center p-4">
          <Avatar className="max-w-[256px] max-h-[256px] size-full">
            <AvatarImage src={member.user.image} />
            <AvatarFallback className="aspect-square text-6xl">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col p-4">
          <p className="text-xl font-bold">{member.user.name}</p>
          {/* 1: SCENARIUL IN CARE UN ADMIN DESCHIDE USER PROFILE PENTRU UN MEMBRU */}
          {currentMember?.role === "admin" &&
          currentMember?._id !== memberId ? (
            <div className="flex items-center gap-2 mt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full capitalize">
                    {member.role} <ChevronDownIcon className="!size-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuRadioGroup
                    value={member.role}
                    onValueChange={(role) =>
                      onUpdate(role as "admin" | "member")
                    }
                  >
                    <DropdownMenuRadioItem value="admin">
                      Admin
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="member">
                      Member
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" className="w-full" onClick={onRemove}>
                Remove
              </Button>
            </div>
          ) : // 2: SCENARIUL IN CARE UN MEMBRU CE NU ESTE ADMIN IS DESCHIDE PROFILUL
          currentMember?._id === memberId && currentMember.role !== "admin" ? (
            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={onLeave}>
                Leave
              </Button>
            </div>
          ) : null}
        </div>
        <Separator />
        <div className="flex flex-col p-4">
          <p className="text-sm font-bold mb-4">Contact information</p>
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-md bg-muted flex items-center justify-center">
              <MailIcon className="!size-4" />
            </div>
            <div className="flex flex-col">
              <p className="text-[13px] font-semibold text-muted-foreground">
                Email Address
              </p>
              <Link
                href={`mailto:${member.user.email}`}
                className="text-sm hover:underline text-[#1264a3]"
              >
                {member.user.email}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
