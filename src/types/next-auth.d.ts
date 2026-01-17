import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      balance: number;
      isPublic: boolean;
      socialLinks?: any;
      role?: "USER" | "ADMIN";
      bio?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    balance?: number;
    isPublic?: boolean;
    socialLinks?: any;
    role?: "USER" | "ADMIN";
    bio?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    balance: number;
    isPublic: boolean;
    socialLinks?: any;
    role?: "USER" | "ADMIN";
    bio?: string;
  }
}
