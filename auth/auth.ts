import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../prisma/prisma-client";
import { admin, createAuthMiddleware } from "better-auth/plugins";
import {
  accessControl,
  admin as adminRole,
  user as userRole,
} from "./permisssions";
import prisma from "@/lib/prisma";

// Emails permitidos para login con Google (separados por comas en .env)
// Ejemplo: ALLOWED_EMAILS="user1@example.com,user2@example.com"
const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS
  ? process.env.ALLOWED_EMAILS.split(",").map((email: string) => email.trim())
  : [];

// Función para validar si un email está permitido
export const isEmailAllowed = (email: string): boolean => {
  // Si no hay emails configurados, permitir todos
  console.log("ALLOWED_EMAILS", ALLOWED_EMAILS);
  if (ALLOWED_EMAILS.length === 0) {
    return true;
  }
  const allowed = ALLOWED_EMAILS.includes(email);
  console.log("allowed", allowed);
  return allowed;
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    admin({
      ac: accessControl,
      roles: { admin: adminRole, user: userRole },
      adminUserIds: [process.env.ADMIN_USER_ID as string],
    }),
  ],
  hooks: {
    after: createAuthMiddleware(async (context) => {
      const email = context.context?.session?.user.email;

      if (email !== undefined) {
        if (!isEmailAllowed(email)) {
          throw new Error("Email not allowed");
        }
      }
    }),
  },
});
