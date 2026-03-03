"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBusinessLines } from "@/hooks/use-business-lines";

interface BusinessLineSelectorProps {
  value?: string | null;
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
  allowNone?: boolean;
  placeholder?: string;
}

export const BusinessLineSelector = ({
  value,
  onValueChange,
  disabled,
  allowNone = true,
  placeholder,
}: BusinessLineSelectorProps) => {
  const t = useTranslations("BusinessLines");
  const { data, isLoading } = useBusinessLines({ activeOnly: true });
  const businessLines = data?.businessLines ?? [];

  return (
    <Select
      value={value || "__none__"}
      onValueChange={(val) => onValueChange(val === "__none__" ? null : val)}
      disabled={disabled || isLoading}
    >
      <SelectTrigger>
        <SelectValue
          placeholder={placeholder || t("selectBusinessLine")}
        />
      </SelectTrigger>
      <SelectContent>
        {allowNone && (
          <SelectItem value="__none__">{t("noBusinessLine")}</SelectItem>
        )}
        {businessLines.map((bl) => (
          <SelectItem key={bl.id} value={bl.id}>
            <span className="flex items-center gap-2">
              {bl.color && (
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: bl.color }}
                />
              )}
              {bl.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
