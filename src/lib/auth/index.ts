import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Схема валидации для credentials
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true, // Разрешаем связывание аккаунтов по email
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Валидация входных данных
          const { email, password } = loginSchema.parse(credentials);

          // Поиск пользователя по email
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) {
            return null;
          }

          // Проверка пароля
          const isPasswordValid = await bcrypt.compare(password, user.password);
          
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Для Google OAuth
      if (account?.provider === "google") {
        try {
          // Проверяем, существует ли пользователь
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (existingUser) {
            return true;
          }

          // Создаем нового пользователя с дефолтными значениями
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              emailVerified: new Date(),
              isPublic: true,
              balance: 0,
            },
          });

          return true;
        } catch (error) {
          console.error("Sign in error:", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // Добавляем дополнительные данные в JWT
      if (user && user.id) {
        token.id = user.id;
        
        // Получаем полные данные пользователя из БД
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            balance: true,
            isPublic: true,
            socialLinks: true,
            role: true,
            bio: true,
          },
        });

        if (dbUser) {
          token.balance = dbUser.balance;
          token.isPublic = dbUser.isPublic;
          token.socialLinks = dbUser.socialLinks;
          token.role = dbUser.role ? dbUser.role as "USER" | "ADMIN" : undefined;
          token.bio = dbUser.bio ?? undefined;
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Передаем данные из JWT в сессию
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.balance = token.balance as number;
        session.user.isPublic = token.isPublic as boolean;
        session.user.socialLinks = token.socialLinks as any;
        session.user.role = token.role as "USER" | "ADMIN" | undefined;
        session.user.bio = token.bio as string | undefined;
      }

      return session;
    },
  },
  events: {
    async linkAccount({ user }) {
      // При связывании аккаунта обновляем emailVerified
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
});
