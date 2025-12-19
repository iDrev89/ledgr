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
  // Configuración de sesión para extender la duración
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 días en segundos
    updateAge: 60 * 60 * 24, // Actualizar la sesión cada 24 horas
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 30, // 30 días
    },
  },
  // Secret para firmar las sesiones (importante para seguridad)
  secret: process.env.BETTER_AUTH_SECRET,
  // URL base de la aplicación
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL,
  // Configuración avanzada para cookies
  advanced: {
    cookiePrefix: "ledgr-auth",
    crossSubDomainCookies: {
      enabled: false,
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
