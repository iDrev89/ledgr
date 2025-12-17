"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useExpenseCategories } from "@/hooks/use-expense-categories";
import { CategoryDialog } from "@/components/expense-categories/category-dialog";

interface CategorySelectorProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
}

export function CategorySelector({
  value,
  onChange,
  disabled,
}: CategorySelectorProps) {
  const t = useTranslations("Expenses");
  const tCategories = useTranslations("ExpenseCategories");
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lastCategoryName, setLastCategoryName] = useState<string>("");

  const { data: categories = [], isLoading } = useExpenseCategories({
    activeOnly: true,
  });

  const selectedCategory = categories.find((cat) => cat.id === value);

  // Store last known category name to prevent flickering
  useEffect(() => {
    if (selectedCategory?.name) {
      setLastCategoryName(selectedCategory.name);
    }
  }, [selectedCategory]);

  const handleCreateCategory = () => {
    setOpen(false);
    setDialogOpen(true);
  };

  const handleCategoryCreated = (newCategory: any) => {
    // Automatically select the newly created category
    onChange(newCategory.id);
    setLastCategoryName(newCategory.name);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || isLoading}
          >
            <span className="truncate">
              {isLoading
                ? t("loading")
                : selectedCategory
                  ? selectedCategory.name
                  : lastCategoryName || t("selectCategory")}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command shouldFilter={true}>
            <CommandInput placeholder={t("searchCategory")} />
            <CommandList>
              {/* Fixed Create Button - Always visible at the top */}
              <CommandGroup>
                <CommandItem
                  onSelect={handleCreateCategory}
                  className="text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="font-medium">
                    {tCategories("createCategory")}
                  </span>
                </CommandItem>
              </CommandGroup>

              {/* Separator */}
              <div className="border-b" />

              {/* Filterable Categories List */}
              <CommandEmpty>
                <div className="py-6 text-center text-sm">
                  <p className="text-muted-foreground">
                    {t("noCategoriesFound")}
                  </p>
                </div>
              </CommandEmpty>
              <CommandGroup
                heading={categories.length > 0 ? t("categories") : undefined}
              >
                {categories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => {
                      onChange(category.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === category.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span>{category.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <CategoryDialog open={dialogOpen} onOpenChange={handleDialogClose} />
    </>
  );
}
