"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Search, User, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useUsers } from "@/hooks/use-users";

interface UserSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function UserSelector({
  value,
  onValueChange,
  disabled,
  placeholder,
}: UserSelectorProps) {
  const t = useTranslations("Sales");
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [lastUserName, setLastUserName] = useState<string>("");

  const { data } = useUsers({ limit: 200 });
  const users = data?.users || [];

  const selectedUser = users.find((u) => u.id === value);

  useEffect(() => {
    if (selectedUser?.name) {
      setLastUserName(selectedUser.name);
    }
  }, [selectedUser?.name]);

  const filteredUsers = searchInput
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          (u.email || "").toLowerCase().includes(searchInput.toLowerCase()),
      )
    : users;

  const handleSelect = (userId: string) => {
    onValueChange(userId);
    setOpen(false);
    setSearchInput("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange("");
  };

  const displayName = value
    ? selectedUser?.name || lastUserName || placeholder || t("selectSeller")
    : null;

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent/50 active:bg-accent disabled:opacity-50 disabled:pointer-events-none min-h-[2.5rem]",
          !value && "text-muted-foreground",
        )}
      >
        <span className="flex items-center gap-2.5 flex-1 min-w-0">
          <User
            className={cn(
              "h-4 w-4 shrink-0",
              value ? "text-primary" : "opacity-50",
            )}
          />
          <span className="truncate font-medium">
            {displayName ?? (placeholder || t("selectSeller"))}
          </span>
        </span>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onValueChange("");
                }
              }}
              className="rounded-sm opacity-60 hover:opacity-100 transition-opacity cursor-pointer inline-flex p-1"
            >
              <X className="h-4 w-4" />
            </span>
          )}
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </button>

      {/* Picker drawer — vaul, swipe-to-dismiss */}
      <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
        <DrawerContent
          className="h-[80vh] flex flex-col"
          onOpenAutoFocus={(e: Event) => e.preventDefault()}
        >
          <div className="shrink-0 px-4 pb-3">
            <DrawerHeader className="p-0 pt-1 text-left">
              <DrawerTitle>{placeholder || t("selectSeller")}</DrawerTitle>
            </DrawerHeader>
          </div>

          <div className="px-4 pb-4 flex flex-col gap-3 flex-1 min-h-0">
            {/* Search */}
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={t("searchSeller")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-11 pl-9 pr-9"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* List — native scroll so iOS arrows work */}
            <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
              <div className="rounded-md border overflow-hidden">
                {filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                    <Search className="h-7 w-7 opacity-40" />
                    <p className="text-sm">{t("noUsersFound")}</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = user.id === value;
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelect(user.id)}
                        className={cn(
                          "flex items-center gap-3 w-full px-4 py-3.5 border-b border-border/40 last:border-0 text-left hover:bg-accent/50 active:bg-accent transition-colors",
                          isSelected && "bg-accent/40",
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm font-medium truncate",
                              isSelected && "text-primary",
                            )}
                          >
                            {user.name}
                          </p>
                          {user.email && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {user.email}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
