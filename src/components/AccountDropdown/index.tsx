"use client";

import React from "react";
import {
  ChevronDown,
  CreditCard,
  Users,
  ArrowUpRight,
  UserPlus,
} from "lucide-react";
import { useSession } from "next-auth/react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const AccountDropdown = () => {
  const { data: session } = useSession();
  const user = session?.user;

  // const userdemo = {
  //   name: "Simi Ade",
  //   avatarUrl:
  //     "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&q=80&auto=format&fit=crop",
  //   plan: "Pro",
  // };

  return (
    <div className="mx-auto mb-5 dark:bg-black">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="px-2 py-1 rounded-md flex items-center gap-3 "
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.image ?? undefined}
                  alt={user?.name ?? "User"}
                />
                <AvatarFallback>
                  {user?.name?.split(" ")[0]?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-sm font-medium">
                  {user?.name ?? "Guest"}
                </span>
                <span className="text-xs text-muted-foreground">free plan</span>
              </div>
            </div>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56 " align="end">
          <DropdownMenuItem className="justify-start gap-3">
            <CreditCard className="h-4 w-4" />
            <div className="flex flex-col text-left">
              <span className="text-sm">Plans & Billing</span>
              <span className="text-xs text-muted-foreground">
                Manage payment methods
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem className="justify-start gap-3">
            <UserPlus className="h-4 w-4" />
            <div className="flex flex-col text-left">
              <span className="text-sm">Invite members</span>
              <span className="text-xs text-muted-foreground">
                Add teammates to your workspace
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="justify-start gap-3">
            <Users className="h-4 w-4" />
            <div className="flex flex-col text-left">
              <span className="text-sm">Members</span>
              <span className="text-xs text-muted-foreground">
                View or remove members
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="justify-start gap-3"
            onSelect={e => e.preventDefault()}
          >
            <ArrowUpRight className="h-4 w-4" />
            <div className="flex flex-col text-left">
              <span className="text-sm">Upgrade plan</span>
              <span className="text-xs text-muted-foreground">
                Get more seats and features
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
