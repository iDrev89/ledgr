"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plus, Search, Loader2, Cake, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CustomerDialog } from "@/components/customers/customer-dialog";
import { useCustomers } from "@/hooks/use-customers";
import { useDebounce } from "@/hooks/use-debounce";
import type { Customer } from "@/lib/types/customer";

interface CustomerSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const isBirthdayToday = (date: Date | string | null | undefined) => {
  if (!date) return false;
  const birthDate = new Date(date);
  const today = new Date();
  return (
    birthDate.getUTCDate() === today.getDate() &&
    birthDate.getUTCMonth() === today.getMonth()
  );
};

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
  const [lastCustomerName, setLastCustomerName] = useState<string>("");
  const [lastCustomerPhone, setLastCustomerPhone] = useState<string>("");
  const [lastCustomerBirthdate, setLastCustomerBirthdate] = useState<
    Date | string | null
  >(null);

  const debouncedSearch = useDebounce(searchInput, 300);

  const queryParams = debouncedSearch
    ? { search: debouncedSearch }
    : { limit: 100 };

  const { data, isLoading } = useCustomers(queryParams);
  const customers = data?.customers || [];

  const selectedCustomer = customers.find((c) => c.id === value);
  const isSelectedBirthday = isBirthdayToday(
    selectedCustomer?.birthdate || lastCustomerBirthdate,
  );

  useEffect(() => {
    if (selectedCustomer) {
      setLastCustomerName(selectedCustomer.name);
      setLastCustomerBirthdate(selectedCustomer.birthdate);
      setLastCustomerPhone(selectedCustomer.phone || selectedCustomer.email || "");
    }
  }, [selectedCustomer]);

  const handleSelect = (customerId: string) => {
    onValueChange(customerId);
    setOpen(false);
    setSearchInput("");
  };

  const handleCreateCustomer = () => {
    setOpen(false);
    setSearchInput("");
    setDialogOpen(true);
  };

  const handleCustomerCreated = (newCustomer: Customer) => {
    onValueChange(newCustomer.id);
    setLastCustomerName(newCustomer.name);
    setLastCustomerPhone(newCustomer.phone || newCustomer.email || "");
  };

  const handleSheetOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) setSearchInput("");
  };

  const displayName = value
    ? (selectedCustomer?.name || lastCustomerName || t("selectCustomer"))
    : null;

  const displayPhone = value
    ? (selectedCustomer?.phone || selectedCustomer?.email || lastCustomerPhone || null)
    : null;

  return (
    <>
      {/* Trigger — ledger-style, shows name + phone once selected */}
      <button
        type="button"
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent/50 active:bg-accent disabled:opacity-50 disabled:pointer-events-none min-h-[2.5rem]",
          !value && "text-muted-foreground",
        )}
      >
        {value ? (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{displayName}</span>
              {isSelectedBirthday && (
                <span className="inline-flex h-5 items-center gap-1 rounded-full bg-pink-100 px-2 text-[10px] font-medium text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 shrink-0">
                  <Cake className="size-3" />
                  <span className="hidden sm:inline">Cumpleaños</span>
                </span>
              )}
            </div>
            {displayPhone && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {displayPhone}
              </p>
            )}
          </div>
        ) : (
          <span>{t("selectCustomer")}</span>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
      </button>

      {/* Customer picker drawer — vaul, swipe-to-dismiss */}
      <Drawer open={open} onOpenChange={handleSheetOpenChange} shouldScaleBackground={false}>
        <DrawerContent
          className="h-[85vh] flex flex-col"
          onOpenAutoFocus={(e: Event) => e.preventDefault()}
        >
          <div className="shrink-0 px-4 pb-3">
            <DrawerHeader className="p-0 pt-1 text-left">
              <DrawerTitle>{t("selectCustomer")}</DrawerTitle>
            </DrawerHeader>
          </div>

          <div className="px-4 flex flex-col gap-3 flex-1 min-h-0 pb-4">
            {/* Search input */}
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={t("searchCustomer")}
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

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              <div className="rounded-md border overflow-hidden">
                {/* Create customer — pinned at top, always visible */}
                <button
                  type="button"
                  onClick={handleCreateCustomer}
                  className="flex items-center gap-3 w-full px-4 py-3.5 border-b border-border text-left hover:bg-accent/50 active:bg-accent transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/8 flex items-center justify-center shrink-0">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-sm text-primary">
                    {tCustomers("createCustomer")}
                  </span>
                </button>

                {/* Loading */}
                {isLoading && (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}

                {/* Empty */}
                {!isLoading && customers.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                    <Search className="h-7 w-7 opacity-40" />
                    <p className="text-sm">{t("noCustomersFound")}</p>
                  </div>
                )}

                {/* Customer rows */}
                {!isLoading &&
                  customers.map((customer) => {
                    const isBirthday = isBirthdayToday(customer.birthdate);
                    const isSelected = customer.id === value;
                    return (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => handleSelect(customer.id)}
                        className={cn(
                          "flex items-center gap-3 w-full px-4 py-3.5 border-b border-border/40 last:border-0 text-left hover:bg-accent/50 active:bg-accent transition-colors",
                          isSelected && "bg-accent/40",
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className={cn(
                                "text-sm font-medium truncate",
                                isSelected && "text-primary",
                              )}
                            >
                              {customer.name}
                            </p>
                            {isBirthday && (
                              <span className="inline-flex h-5 items-center gap-1 rounded-full bg-pink-100 px-2 text-[10px] font-medium text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 shrink-0">
                                <Cake className="size-3" />
                                Hoy
                              </span>
                            )}
                          </div>
                          {(customer.phone || customer.email) && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {customer.phone || customer.email}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleCustomerCreated}
      />
    </>
  );
}
