"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, UserX, UserCheck, Edit, Trash2, ShieldCheck, ShieldOff } from "lucide-react";
import { User, useDeleteUser, useToggleUserBan, useToggleAllowedAccess } from "@/hooks/use-users";
import { toast } from "sonner";
import { EditUser } from "./edit-user";
import { useTranslations } from "next-intl";

interface UsersListProps {
  users: User[];
  isLoading: boolean;
}

export function UsersList({ users, isLoading }: UsersListProps) {
  const t = useTranslations("Users");
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);

  const deleteUserMutation = useDeleteUser();
  const toggleBanMutation = useToggleUserBan();
  const toggleAccessMutation = useToggleAllowedAccess();

  const handleDeleteUser = async () => {
    if (!deleteUser) return;

    try {
      await deleteUserMutation.mutateAsync(deleteUser.id);
      toast.success(t("userDeletedSuccess"));
      setDeleteUser(null);
    } catch (error: any) {
      toast.error(error.message || t("deleteUserError"));
    }
  };

  const handleToggleBan = async (user: User) => {
    try {
      await toggleBanMutation.mutateAsync({
        id: user.id,
        banned: !user.banned,
      });
      toast.success(
        user.banned ? t("userUnbannedSuccess") : t("userBannedSuccess"),
      );
    } catch (error: any) {
      toast.error(error.message || t("updateUserStatusError"));
    }
  };

  const handleToggleAccess = async (user: User) => {
    const currentAccess = user.allowedAccess ?? false;
    try {
      await toggleAccessMutation.mutateAsync({
        id: user.id,
        allowedAccess: !currentAccess,
      });
      toast.success(
        currentAccess ? t("accessDisabledSuccess") : t("accessEnabledSuccess"),
      );
    } catch (error: any) {
      toast.error(error.message || t("updateUserStatusError"));
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t("noUsersFound")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("user")}</TableHead>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("role")}</TableHead>
              <TableHead>{t("access")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("created")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    {user.image && (
                      <AvatarImage src={user.image} alt={user.name} />
                    )}
                    <AvatarFallback>
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ID: {user.id.slice(-8)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>{user.email}</div>
                  {user.emailVerified ? (
                    <Badge variant="secondary" className="text-xs">
                      {t("verified")}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      {t("unverified")}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role || "user"}</Badge>
                </TableCell>
                <TableCell>
                  {user.allowedAccess ? (
                    <Badge variant="default">{t("accessEnabled")}</Badge>
                  ) : (
                    <Badge variant="secondary">{t("accessDisabled")}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.banned ? (
                    <Badge variant="destructive">{t("banned")}</Badge>
                  ) : (
                    <Badge variant="default">{t("active")}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setEditUser(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t("editUserAction")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleBan(user)}
                        disabled={toggleBanMutation.isPending}
                      >
                        {user.banned ? (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            {t("unban")}
                          </>
                        ) : (
                          <>
                            <UserX className="mr-2 h-4 w-4" />
                            {t("ban")}
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleAccess(user)}
                        disabled={toggleAccessMutation.isPending}
                      >
                        {user.allowedAccess ? (
                          <>
                            <ShieldOff className="mr-2 h-4 w-4" />
                            {t("disableAccess")}
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            {t("enableAccess")}
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteUser(user)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("deleteUserAction")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete User Dialog */}
      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirmDescription", {
                name: (deleteUser?.name ?? "") as string,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? t("deleting") : t("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit User Dialog */}
      {editUser && (
        <EditUser
          user={editUser}
          open={!!editUser}
          onOpenChange={() => setEditUser(null)}
        />
      )}
    </>
  );
}
