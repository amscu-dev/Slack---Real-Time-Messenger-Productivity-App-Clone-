"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Doc } from "../../../../../convex/_generated/dataModel";
import {
  ChevronDown,
  ListFilter,
  Settings,
  SquarePen,
  Users,
} from "lucide-react";
import Hint from "@/components/hint";

interface WorkspaceHeaderProps {
  workspace: Doc<"workspaces">;
  isAdmin: boolean;
}
function WorkspaceHeader({ workspace, isAdmin }: WorkspaceHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 h-[49px] gap-0.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="transparent"
            className="font-semibold text-lg w-auto p-1.5 overflow-hidden"
            size="sm"
          >
            <span className="truncate">{workspace.name}</span>
            <ChevronDown className="size-4 ml-1 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="start" className="w-64">
          <DropdownMenuItem
            key={workspace._id}
            className="cursor-pointer capitalize"
          >
            <div className="size-9 relative overflow-hidden bg-customWorkspacesBgDropdownItem text-white font-semibold text-xl rounded-md flex items-center justify-center mr-2">
              {workspace.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col items-start">
              <p className="font-bold">{workspace.name}</p>
              <p className="text-xs text-muted-foreground">Active workspace</p>
            </div>
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer py-2"
                onClick={() => {}}
              >
                <div className="flex items-center justify-center">
                  <Users className="!size-3 mr-2 font-normal" />
                  <p>Invite people to {workspace.name}</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer py-2"
                onClick={() => {}}
              >
                <div className="flex items-center justify-center">
                  <Settings className="!size-3 mr-2 font-normal" />
                  <p>Preferences</p>
                </div>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex items-center gap-0.5">
        <Hint label="Filter conversations" side="bottom">
          <Button size="iconSm" variant="transparent">
            <ListFilter className="!size-4" />
          </Button>
        </Hint>
        <Hint label="New Message" side="bottom">
          <Button size="iconSm" variant="transparent">
            <SquarePen className="!size-4" />
          </Button>
        </Hint>
      </div>
    </div>
  );
}

export default WorkspaceHeader;
