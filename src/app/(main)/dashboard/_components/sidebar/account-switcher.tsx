"use client";

import { useEffect, useState } from "react";

import { BadgeCheck, Bell, CreditCard, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";
import { getSession, signOut } from "next-auth/react";

export function AccountSwitcher() {
  const [activeUser, setActiveUser] = useState<{ id?: string; name: string; email: string; avatar: string; role?: string } | null>(null);

  useEffect(() => {
    void getSession().then((session) => {
      const roles = Array.isArray((session as any)?.user?.roles) ? (session as any).user.roles : [];
      setActiveUser({
        id: (session as any)?.user?.id,
        name: (session as any)?.user?.name ?? (session as any)?.user?.email ?? "User",
        email: (session as any)?.user?.email ?? "",
        avatar: (session as any)?.user?.image ?? "",
        role: roles?.[0],
      });
    });
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-9 rounded-lg">
          <AvatarImage src={activeUser?.avatar || undefined} alt={activeUser?.name || "User"} />
          <AvatarFallback className="rounded-lg">{getInitials(activeUser?.name || "U")}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 space-y-1 rounded-lg" side="bottom" align="end" sideOffset={4}>
        <DropdownMenuItem className={cn("p-0", "bg-accent/50 border-l-primary border-l-2")}> 
          <div className="flex w-full items-center justify-between gap-2 px-1 py-1.5">
            <Avatar className="size-9 rounded-lg">
              <AvatarImage src={activeUser?.avatar || undefined} alt={activeUser?.name || "User"} />
              <AvatarFallback className="rounded-lg">{getInitials(activeUser?.name || "U")}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{activeUser?.name || "User"}</span>
              <span className="truncate text-xs capitalize">{activeUser?.role ?? ""}</span>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login-v2" })}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
