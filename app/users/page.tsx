"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, UserPlus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UsersList } from "@/components/users/users-list";
import { CreateUser } from "@/components/users/create-user";
import { useUsers } from "@/hooks/use-users";
import { useTranslations } from "next-intl";

export default function UsersPage() {
  const t = useTranslations("Users");
  const tCommon = useTranslations("Common");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: usersData, isLoading } = useUsers({
    searchValue: searchQuery || undefined,
    searchField: "name",
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t("createUser")}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {usersData
            ? t("totalUsers", { count: usersData.total })
            : tCommon("loading")}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("allUsers")}</CardTitle>
          <CardDescription>{t("allUsersDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <UsersList users={usersData?.users || []} isLoading={isLoading} />
        </CardContent>
      </Card>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {t("createNewUser")}
            </DialogTitle>
            <DialogDescription>{t("addNewUser")}</DialogDescription>
          </DialogHeader>
          <CreateUser onSuccess={() => setShowCreateModal(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
