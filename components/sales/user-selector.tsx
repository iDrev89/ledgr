"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronsUpDown, Search, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  // Store the last known user name to prevent flickering
  const [lastUserName, setLastUserName] = useState<string>("");

  // Fetch all users
  const { data } = useUsers({ limit: 200 });
  const users = data?.users || [];

  const selectedUser = users.find((u) => u.id === value);

  // Update last known name when user is found
  useEffect(() => {
    if (selectedUser?.name) {
      setLastUserName(selectedUser.name);
    }
  }, [selectedUser?.name]);

  const handleSelect = (userId: string) => {
    onValueChange(userId);
    setOpen(false);
  };

  const handleClear = () => {
    onValueChange("");
    setOpen(false);
  };

  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClear();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value ? (
            <span className="truncate flex items-center gap-2.5">
              <User className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">
                {selectedUser?.name ||
                  lastUserName ||
                  placeholder ||
                  t("selectSeller")}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground flex items-center gap-2.5">
              <User className="h-4 w-4 shrink-0 opacity-60" />
              {placeholder || t("selectSeller")}
            </span>
          )}
          <div className="flex items-center gap-1">
            {value && (
              <span
                onClick={handleClearClick}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer inline-flex"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClearClick(e as any);
                  }
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">{t("clearSelection")}</span>
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={true}>
          <CommandInput placeholder={t("searchSeller")} />
          <CommandList>
            {/* Clear selection option */}
            {value && (
              <>
                <CommandGroup>
                  <CommandItem
                    onSelect={handleClear}
                    className="text-muted-foreground"
                  >
                    <span className="font-medium">
                      {t("clearSelection") || "Limpiar selección"}
                    </span>
                  </CommandItem>
                </CommandGroup>
                <div className="border-b" />
              </>
            )}

            {/* Filterable Users List */}
            <CommandEmpty>
              <div className="flex flex-col items-center justify-center gap-2 py-6">
                <Search className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t("noUsersFound")}
                </p>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name}
                  keywords={[user.email || ""]}
                  onSelect={() => handleSelect(user.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === user.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    {user.email && (
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
