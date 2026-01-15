"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronsUpDown, Plus, Search, Loader2 } from "lucide-react";
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
import { CustomerDialog } from "@/components/customers/customer-dialog";
import { useCustomers } from "@/hooks/use-customers";
import { useDebounce } from "@/hooks/use-debounce";
import type { Customer } from "@/lib/types/customer";

interface CustomerSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function CustomerSelector({
  value,
  onValueChange,
  disabled,
}: CustomerSelectorProps) {
  const t = useTranslations("Sales");
  const tCustomers = useTranslations("Customers");
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  // Store the last known customer name to prevent flickering
  const [lastCustomerName, setLastCustomerName] = useState<string>("");

  // Debounce search query to avoid too many server requests
  const debouncedSearch = useDebounce(searchInput, 300);

  // Fetch customers with server-side search
  // When searching: no limit (find any customer)
  // When not searching: limit to 100 for initial load performance
  const queryParams = debouncedSearch 
    ? { search: debouncedSearch } 
    : { limit: 100 };
    
  const { data, isLoading } = useCustomers(queryParams);
  const customers = data?.customers || [];

  // Debug: Log search queries
  useEffect(() => {
    if (debouncedSearch) {
      console.log("🔍 Searching customers:", debouncedSearch, queryParams);
    }
  }, [debouncedSearch, queryParams]);

  const selectedCustomer = customers.find((c) => c.id === value);

  // Update last known name when customer is found
  useEffect(() => {
    if (selectedCustomer?.name) {
      setLastCustomerName(selectedCustomer.name);
    }
  }, [selectedCustomer?.name]);

  const handleSelect = (customerId: string) => {
    onValueChange(customerId);
    setOpen(false);
  };

  const handleCreateCustomer = () => {
    setOpen(false);
    setDialogOpen(true);
  };

  const handleCustomerCreated = (newCustomer: Customer) => {
    // Automatically select the newly created customer
    onValueChange(newCustomer.id);
    setLastCustomerName(newCustomer.name);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
  };

  const handlePopoverOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    // Reset search when closing
    if (!isOpen) {
      setSearchInput("");
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={handlePopoverOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {value ? (
              <span className="truncate">
                {selectedCustomer?.name ||
                  lastCustomerName ||
                  t("selectCustomer")}
              </span>
            ) : (
              <span className="text-muted-foreground">
                {t("selectCustomer")}
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={t("searchCustomer")}
              value={searchInput}
              onValueChange={setSearchInput}
            />
            <CommandList>
              {/* Fixed Create Button - Always visible at the top */}
              <CommandGroup>
                <CommandItem
                  onSelect={handleCreateCustomer}
                  className="text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="font-medium">
                    {tCustomers("createCustomer")}
                  </span>
                </CommandItem>
              </CommandGroup>

              {/* Separator */}
              <div className="border-b" />

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* Customers List */}
              {!isLoading && (
                <>
                  <CommandEmpty>
                    <div className="flex flex-col items-center justify-center gap-2 py-6">
                      <Search className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {t("noCustomersFound")}
                      </p>
                    </div>
                  </CommandEmpty>
                  <CommandGroup
                    heading={customers.length > 0 ? t("customers") : undefined}
                  >
                    {customers.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        value={customer.id}
                        onSelect={() => handleSelect(customer.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === customer.id ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{customer.name}</span>
                          {(customer.email || customer.phone) && (
                            <span className="text-xs text-muted-foreground">
                              {customer.email || customer.phone}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={handleCustomerCreated}
      />
    </>
  );
}
