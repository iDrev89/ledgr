"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Loader2,
  ChevronDownIcon,
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
import { Input } from "@/components/ui/input";
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

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedFortnight, setSelectedFortnight] = useState<
    "first" | "second"
  >("first");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingData, setPendingData] = useState<CreatePayrollRunInput | null>(
    null,
  );

  const { data: usersData } = useUsers();
  // Filtrar solo usuarios con rol "user" (empleados)
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
      setSelectedMonth(new Date());
      setSelectedFortnight("first");
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
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();

      let startDate: Date;
      let endDate: Date;

      if (selectedFortnight === "first") {
        startDate = new Date(year, month, 1, 0, 0, 0, 0);
        endDate = new Date(year, month, 15, 23, 59, 59, 999);
      } else {
        startDate = new Date(year, month, 16, 0, 0, 0, 0);
        endDate = new Date(year, month + 1, 0, 23, 59, 59, 999); // Last day of month
      }

      const monthName = format(selectedMonth, "MMMM yyyy", { locale: es });
      const fortnightLabel =
        selectedFortnight === "first" ? "Primera Quincena" : "Segunda Quincena";

      form.setValue("startDate", startDate.toISOString());
      form.setValue("endDate", endDate.toISOString());
      form.setValue("periodLabel", `${fortnightLabel} ${monthName}`);
    }
  }, [periodType, selectedDate, selectedMonth, selectedFortnight, form]);

  const handleSubmit = async (data: CreatePayrollRunInput) => {
    // Guardar datos y mostrar confirmación
    setPendingData(data);
    setConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!pendingData) return;

    try {
      // Incluir userIds solo si se seleccionaron usuarios específicos
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("createRun")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
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
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DAILY: Solo mostrar selector de fecha única */}
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

            {/* BIWEEKLY: Selector de mes y quincena */}
            {periodType === PayrollPeriodType.BIWEEKLY && (
              <>
                <FormItem className="flex flex-col">
                  <FormLabel>{t("selectMonth")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between font-normal"
                        disabled={isLoading}
                      >
                        {format(selectedMonth, "MMMM yyyy", { locale: es })}
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={selectedMonth}
                        onSelect={(date) => date && setSelectedMonth(date)}
                        captionLayout="dropdown"
                        disabled={(date) =>
                          date < new Date("2020-01-01") ||
                          date > new Date("2100-01-01")
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>

                <FormItem>
                  <FormLabel>{t("selectFortnight")}</FormLabel>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={
                        selectedFortnight === "first" ? "default" : "outline"
                      }
                      className="flex-1"
                      onClick={() => setSelectedFortnight("first")}
                      disabled={isLoading}
                    >
                      {t("firstFortnight")} (1-15)
                    </Button>
                    <Button
                      type="button"
                      variant={
                        selectedFortnight === "second" ? "default" : "outline"
                      }
                      className="flex-1"
                      onClick={() => setSelectedFortnight("second")}
                      disabled={isLoading}
                    >
                      {t("secondFortnight")} (16-fin)
                    </Button>
                  </div>
                </FormItem>
              </>
            )}

            {/* Selector de Empleados */}
            <FormItem className="flex flex-col">
              <FormLabel>{t("employees")}</FormLabel>
              <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between font-normal",
                      selectedUserIds.length === 0 && "text-muted-foreground",
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
                        onSelect={() => {
                          setSelectedUserIds([]);
                        }}
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
                <div className="flex flex-wrap gap-1 mt-2">
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmTitle")}</AlertDialogTitle>
            <div className="text-sm text-muted-foreground">
              {pendingData && (
                <div className="space-y-3">
                  <div className="font-medium">{t("confirmDescription")}</div>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      <strong>{t("confirmPeriodLabel")}</strong>{" "}
                      {pendingData.periodLabel}
                    </li>
                    <li>
                      <strong>{t("confirmTypeLabel")}</strong>{" "}
                      {pendingData.periodType === PayrollPeriodType.DAILY
                        ? t("periodTypeDaily")
                        : t("periodTypeBiweekly")}
                    </li>
                    <li>
                      <strong>{t("confirmEmployeesLabel")}</strong>{" "}
                      {getSelectedUsersLabel()}
                    </li>
                  </ul>
                  <div className="text-xs">{t("confirmAutoCalculate")}</div>
                </div>
              )}
            </div>
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
