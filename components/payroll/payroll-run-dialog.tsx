"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import { es } from "date-fns/locale";
import {
  Loader2,
  CalendarIcon,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getPayrollSchemas,
  type CreatePayrollRunInput,
} from "@/lib/validations/payroll";
import { PayrollPeriodType } from "@/prisma/prisma-client";
import { useUsers } from "@/hooks/use-users";

interface PayrollRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    data: CreatePayrollRunInput & { userIds?: string[] },
  ) => Promise<void>;
  isLoading?: boolean;
}

export function PayrollRunDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: PayrollRunDialogProps) {
  const t = useTranslations("Payroll");
  const { createPayrollRunSchema } = getPayrollSchemas(t);

  // DAILY state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // BIWEEKLY state
  const [selectedFortnight, setSelectedFortnight] = useState<
    "first" | "second"
  >("first");

  // CUSTOM state
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();

  // Shared state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingData, setPendingData] = useState<CreatePayrollRunInput | null>(
    null,
  );

  const { data: usersData } = useUsers();
  const users = (usersData?.users || []).filter(
    (user: any) => user.role === "user",
  );

  const form = useForm<CreatePayrollRunInput>({
    resolver: zodResolver(createPayrollRunSchema),
    defaultValues: {
      periodType: PayrollPeriodType.BIWEEKLY,
      periodLabel: "",
      startDate: "",
      endDate: "",
    },
  });

  const periodType = form.watch("periodType");

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setSelectedDate(undefined);
      setSelectedFortnight("first");
      setCustomDateRange(undefined);
      setSelectedUserIds([]);
      setUserSearchOpen(false);
      setConfirmDialogOpen(false);
      setPendingData(null);
    }
  }, [open, form]);

  // Auto-generate dates and labels based on period type
  useEffect(() => {
    if (periodType === PayrollPeriodType.DAILY && selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      form.setValue("startDate", startOfDay.toISOString());
      form.setValue("endDate", endOfDay.toISOString());
      form.setValue(
        "periodLabel",
        format(selectedDate, "dd MMMM yyyy", { locale: es }),
      );
    } else if (periodType === PayrollPeriodType.BIWEEKLY) {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();

      let startDate: Date;
      let endDate: Date;

      if (selectedFortnight === "first") {
        startDate = new Date(year, month, 1, 0, 0, 0, 0);
        endDate = new Date(year, month, 15, 23, 59, 59, 999);
      } else {
        startDate = new Date(year, month, 16, 0, 0, 0, 0);
        endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
      }

      const monthName = format(today, "MMMM yyyy", { locale: es });
      const fortnightLabel =
        selectedFortnight === "first" ? "Primera Quincena" : "Segunda Quincena";

      form.setValue("startDate", startDate.toISOString());
      form.setValue("endDate", endDate.toISOString());
      form.setValue("periodLabel", `${fortnightLabel} ${monthName}`);
    } else if (periodType === PayrollPeriodType.CUSTOM) {
      if (customDateRange?.from && customDateRange?.to) {
        const startDate = new Date(customDateRange.from);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(customDateRange.to);
        endDate.setHours(23, 59, 59, 999);

        form.setValue("startDate", startDate.toISOString());
        form.setValue("endDate", endDate.toISOString());
        form.setValue(
          "periodLabel",
          `Personalizado ${format(customDateRange.from, "dd/MM/yyyy", { locale: es })} - ${format(customDateRange.to, "dd/MM/yyyy", { locale: es })}`,
        );
      }
    }
  }, [
    periodType,
    selectedDate,
    selectedFortnight,
    customDateRange,
    form,
  ]);

  const handleSubmit = async (data: CreatePayrollRunInput) => {
    setPendingData(data);
    setConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!pendingData) return;

    try {
      const submitData = {
        ...pendingData,
        userIds: selectedUserIds.length > 0 ? selectedUserIds : undefined,
      };
      await onSubmit(submitData);
      form.reset();
      setConfirmDialogOpen(false);
      setPendingData(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      setConfirmDialogOpen(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const getSelectedUsersLabel = () => {
    if (selectedUserIds.length === 0) {
      return t("confirmAllEmployees");
    }
    if (selectedUserIds.length === 1) {
      const user = users.find((u: any) => u.id === selectedUserIds[0]);
      return user?.name || t("selectedEmployees", { count: 1 });
    }
    return t("selectedEmployees", { count: selectedUserIds.length });
  };

  const getPeriodTypeLabel = (type: PayrollPeriodType) => {
    if (type === PayrollPeriodType.DAILY) return t("periodTypeDaily");
    if (type === PayrollPeriodType.BIWEEKLY) return t("periodTypeBiweekly");
    return t("periodTypeCustom");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] p-0 gap-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle>{t("createRun")}</DialogTitle>
            <DialogDescription>{t("createDescription")}</DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="px-6 pb-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4 pt-4"
              >
                {/* Period Type */}
                <FormField
                  control={form.control}
                  name="periodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("periodType")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={PayrollPeriodType.DAILY}>
                            {t("periodTypeDaily")}
                          </SelectItem>
                          <SelectItem value={PayrollPeriodType.BIWEEKLY}>
                            {t("periodTypeBiweekly")}
                          </SelectItem>
                          <SelectItem value={PayrollPeriodType.CUSTOM}>
                            {t("periodTypeCustom")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* DAILY: date picker */}
                {periodType === PayrollPeriodType.DAILY && (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("startDate")}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between font-normal",
                            !selectedDate && "text-muted-foreground",
                          )}
                          disabled={isLoading}
                        >
                          {selectedDate ? (
                            format(selectedDate, "dd/MM/yyyy", { locale: es })
                          ) : (
                            <span>{t("selectDate")}</span>
                          )}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          captionLayout="dropdown"
                          disabled={(date) =>
                            date < new Date("2020-01-01") ||
                            date > new Date("2100-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}

                {/* BIWEEKLY: fortnight */}
                {periodType === PayrollPeriodType.BIWEEKLY && (
                  <>
                    <FormItem>
                      <FormLabel>{t("selectFortnight")}</FormLabel>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant={
                            selectedFortnight === "first" ? "default" : "outline"
                          }
                          className="flex-1"
                          onClick={() => setSelectedFortnight("first")}
                          disabled={isLoading}
                        >
                          {t("firstFortnight")} (1–15)
                        </Button>
                        <Button
                          type="button"
                          variant={
                            selectedFortnight === "second"
                              ? "default"
                              : "outline"
                          }
                          className="flex-1"
                          onClick={() => setSelectedFortnight("second")}
                          disabled={isLoading}
                        >
                          {t("secondFortnight")} (16–fin)
                        </Button>
                      </div>
                    </FormItem>
                  </>
                )}

                {/* CUSTOM: date range picker */}
                {periodType === PayrollPeriodType.CUSTOM && (
                  <>
                    <FormItem className="flex flex-col">
                      <FormLabel>{t("selectCustomDateRange")}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-between font-normal",
                              !customDateRange?.from && "text-muted-foreground",
                            )}
                            disabled={isLoading}
                          >
                            {customDateRange?.from && customDateRange?.to ? (
                              `${format(customDateRange.from, "dd/MM/yyyy", { locale: es })} — ${format(customDateRange.to, "dd/MM/yyyy", { locale: es })}`
                            ) : customDateRange?.from ? (
                              format(customDateRange.from, "dd/MM/yyyy", { locale: es })
                            ) : (
                              <span>{t("selectDateRange")}</span>
                            )}
                            <CalendarIcon className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="start"
                        >
                          <Calendar
                            mode="range"
                            selected={customDateRange}
                            onSelect={setCustomDateRange}
                            captionLayout="dropdown"
                            disabled={(date) =>
                              date < new Date("2020-01-01") ||
                              date > new Date("2100-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>

                    {/* Preview of generated label */}
                    {customDateRange?.from && customDateRange?.to && (
                      <div className="rounded-md border border-border/60 px-3 py-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
                          {t("periodLabel")}
                        </p>
                        <p className="text-sm font-medium">
                          {`Personalizado ${format(customDateRange.from, "dd/MM/yyyy", { locale: es })} - ${format(customDateRange.to, "dd/MM/yyyy", { locale: es })}`}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Employee selector */}
                <FormItem className="flex flex-col">
                  <FormLabel>{t("employees")}</FormLabel>
                  <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between font-normal",
                          selectedUserIds.length === 0 &&
                            "text-muted-foreground",
                        )}
                        disabled={isLoading}
                      >
                        {getSelectedUsersLabel()}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder={t("searchUsers")} />
                        <CommandEmpty>{t("noUsersFound")}</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          <CommandItem
                            onSelect={() => setSelectedUserIds([])}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedUserIds.length === 0
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {t("allUsers")}
                          </CommandItem>
                          {users.map((user) => (
                            <CommandItem
                              key={user.id}
                              onSelect={() => handleUserToggle(user.id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedUserIds.includes(user.id)
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{user.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {user.email}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedUserIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {selectedUserIds.map((userId) => {
                        const user = users.find((u) => u.id === userId);
                        return (
                          <Badge
                            key={userId}
                            variant="secondary"
                            className="text-xs"
                          >
                            {user?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t("employeesHelpText")}
                  </p>
                </FormItem>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                  >
                    {t("cancel")}
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t("create")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </DialogContent>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                {pendingData && (
                  <div className="space-y-3 mt-2">
                    <p className="text-sm text-muted-foreground">
                      {t("confirmDescription")}
                    </p>
                    <div className="rounded-md border overflow-hidden divide-y divide-border">
                      <div className="flex justify-between items-center text-sm px-3 py-2">
                        <span className="text-muted-foreground">
                          {t("confirmPeriodLabel")}
                        </span>
                        <span className="font-medium">
                          {pendingData.periodLabel}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm px-3 py-2">
                        <span className="text-muted-foreground">
                          {t("confirmTypeLabel")}
                        </span>
                        <span className="font-medium">
                          {getPeriodTypeLabel(pendingData.periodType)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm px-3 py-2">
                        <span className="text-muted-foreground">
                          {t("confirmEmployeesLabel")}
                        </span>
                        <span className="font-medium">
                          {getSelectedUsersLabel()}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("confirmAutoCalculate")}
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              {t("confirmCancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("confirmCreate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
