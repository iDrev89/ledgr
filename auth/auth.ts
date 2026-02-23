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

// Función para validar si un email tiene acceso permitido en la DB
export const isEmailAllowed = async (email: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { allowedAccess: true },
  });
  return user?.allowedAccess ?? false;
};

const trustedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins,
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
      adminUserIds: process.env.ADMIN_USER_ID?.split(",") as unknown as string[],
    }),
  ],
  hooks: {
    after: createAuthMiddleware(async (context: any) => {
      const email = context.context?.session?.user.email;

      if (email !== undefined) {
        const allowed = await isEmailAllowed(email);
        if (!allowed) {
          throw new Error("Email not allowed");
        }
      }
    }),
  },
});
