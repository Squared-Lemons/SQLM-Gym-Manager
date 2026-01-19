import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { db } from "@app/database";
import * as schema from "@app/database/schema";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },

  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      schema: {
        organization: {
          modelName: "organization",
        },
        member: {
          modelName: "member",
        },
      },
    }),
  ],

  trustedOrigins: [
    process.env.NEXT_PUBLIC_OWNER_APP_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_MEMBER_APP_URL || "http://localhost:3001",
  ],
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
