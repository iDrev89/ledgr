import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../prisma/prisma-client";
import { admin } from "better-auth/plugins";
import {
  accessControl,
  admin as adminRole,
  user as userRole,
} from "./permisssions";

const prisma = new PrismaClient();

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
});
