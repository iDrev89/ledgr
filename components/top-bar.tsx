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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import Image from "next/image";
import user from "@/public/user11.png";
import { signOut, useSession } from "@/lib/auth-client";
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
        <div className="hidden sm:block md:w-[350px]">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search records, users, reports..."
              className="w-full bg-background pl-8 "
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 relative p-2 bg-primary/10 hover:bg-primary/5 rounded-full cursor-pointer">
              <Bell className="h-4 w-4 text-primary" />

              {notificationCount > 0 && (
                <Badge
                  className="absolute -right-1 -top-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                  variant="destructive"
                >
                  {notificationCount}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>New record created</DropdownMenuItem>
            <DropdownMenuItem>Report generation completed</DropdownMenuItem>
            <DropdownMenuItem>
              System backup completed
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-muted-foreground">
              View all
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <LanguageSelector />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <Avatar className="h-8 w-8">
                {!isPending && session?.user?.image ? (
                  <AvatarImage src={session.user.image} alt={session.user.name || "User"} />
                ) : !isPending && !session?.user?.image ? (
                  <Image src={user} alt="User" />
                ) : null}
                <AvatarFallback>
                  {isPending ? "" : getUserInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {isPending ? "Loading..." : (session?.user?.name || session?.user?.email || "My Account")}
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
