"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBranches } from "@/hooks/use-branches";

interface BranchSelectorProps {
  value?: string | null;
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
  allowNone?: boolean;
  placeholder?: string;
}

export const BranchSelector = ({
  value,
  onValueChange,
  disabled,
  allowNone = true,
  placeholder,
}: BranchSelectorProps) => {
  const t = useTranslations("Branches");
  const { data, isLoading } = useBranches({ activeOnly: true });
  const branches = data?.branches ?? [];

  return (
    <Select
      value={value || "__none__"}
      onValueChange={(val) => onValueChange(val === "__none__" ? null : val)}
      disabled={disabled || isLoading}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder || t("selectBranch")} />
      </SelectTrigger>
      <SelectContent>
        {allowNone && (
          <SelectItem value="__none__">{t("noBranch")}</SelectItem>
        )}
        {branches.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
