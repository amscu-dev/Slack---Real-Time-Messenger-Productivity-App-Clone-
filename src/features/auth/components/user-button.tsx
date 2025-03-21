"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthActions } from "@convex-dev/auth/react";
import { Loader, LogOutIcon } from "lucide-react";
import { useCurrentUser } from "../api/use-current-user";

function UserButton() {
  const { signOut } = useAuthActions();
  const { data, isLoading } = useCurrentUser();
  if (isLoading) {
    return <Loader className="!size-4 animate-spin text-muted-foreground" />;
  }
  if (!data) {
    return null;
  }
  const { image, name } = data;

  const avatarFallback = name!.charAt(0).toUpperCase();
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative">
        <Avatar className="!size-10 hover:opacity-75 transition">
          <AvatarImage alt={name} src={image} />
          <AvatarFallback className="bg-slate-600 text-white">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="center" side="right">
        <DropdownMenuItem
          onClick={() => {
            signOut();
          }}
          className="h-10"
        >
          <LogOutIcon className="!size-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserButton;
