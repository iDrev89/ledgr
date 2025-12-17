"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronsUpDown, Plus, Search } from "lucide-react";
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
  // Store the last known customer name to prevent flickering
  const [lastCustomerName, setLastCustomerName] = useState<string>("");

  // Fetch all active customers (we'll filter on the client side with Command)
  const { data } = useCustomers({ limit: 200 });
  const customers = data?.customers || [];

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

  return (
    <>
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
          <Command shouldFilter={true}>
            <CommandInput placeholder={t("searchCustomer")} />
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

              {/* Filterable Customers List */}
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
                    value={customer.name}
                    keywords={[
                      customer.email || "",
                      customer.phone || "",
                      customer.docId || "",
                    ]}
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
