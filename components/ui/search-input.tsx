"use client";

import * as React from "react";
import { Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
  showClear?: boolean;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  isLoading = false,
  className,
  showClear = true,
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 pr-8"
      />
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : showClear && value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            <span className="sr-only">Clear search</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
