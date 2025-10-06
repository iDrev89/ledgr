import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import {
  accessControl,
  admin as adminRole,
  user as userRole,
} from "@/auth/permisssions";

const authClient = createAuthClient({
  plugins: [
    adminClient({
      ac: accessControl,
      role: { admin: adminRole, user: userRole },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession, admin } = authClient;

export { authClient };
