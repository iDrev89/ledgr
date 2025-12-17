"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Globe,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./theme-toggle";
import { signOut, useSession } from "@/auth/auth-client";
import { LanguageSelector } from "./language-selector";

interface TopBarProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function TopBar({ toggleSidebar, sidebarOpen }: TopBarProps) {
  const [notificationCount, setNotificationCount] = useState(3);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="block lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <ThemeToggle />

        <LanguageSelector />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {isPending
                    ? "..."
                    : getUserInitials(session?.user?.name || "User")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {isPending
                ? "Loading..."
                : session?.user?.name || session?.user?.email || "My Account"}
            </DropdownMenuLabel>
            {!isPending && session?.user?.email && (
              <div className="px-2 py-1 text-sm text-muted-foreground">
                {session.user.email}
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
