"use client";

import { useSession } from "next-auth/react";

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  balance?: number;
  isPublic?: boolean;
  socialLinks?: any;
  role?: "USER" | "ADMIN";
  bio?: string;
}

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user as User | undefined,
    isAuthenticated: !!session?.user,
    isLoading: status === "loading",
    session,
  };
}