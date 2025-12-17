/**
 * Application-wide constants and enums
 */

// User roles enum
export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

// Helper type for role values
export type UserRoleType = `${UserRole}`;

// Helper to check if a value is a valid role
export const isValidRole = (role: string): role is UserRoleType => {
  return Object.values(UserRole).includes(role as UserRole);
};

// Helper to get all role values
export const getAllRoles = (): UserRoleType[] => {
  return Object.values(UserRole) as UserRoleType[];
};
