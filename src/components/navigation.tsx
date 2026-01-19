"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Home, Play, Sparkles, Plus, LogOut, User, MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpload } from "@/lib/contexts/upload-context";
import { useAuth } from "@/lib/hooks/useAuth";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetFooter } from "@/components/ui/sheet";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  hidden?: boolean;
}

const navigation: NavigationItem[] = [
  {
    name: "Главная",
    href: "/",
    icon: Home,
    hidden: true, // Скрыто из меню
  },
  {
    name: "Тренды",
    href: "/challenges",
    icon: Sparkles,
  },
  {
    name: "Видео",
    href: "/videos",
    icon: Play,
    hidden: true, // Скрыто из меню
  },
  {
    name: "Создать видео",
    href: "/create",
    icon: Plus,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const { openUpload } = useUpload();
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header
      className={cn(
        "sticky top-5 z-50",
        "mx-auto w-full max-w-5xl rounded-lg border shadow",
        "bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-lg",
      )}
    >
      <nav className="mx-auto flex items-center justify-between p-1.5">
        {/* Логотип */}
        <Link href="/" className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 duration-100">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <span className="text-primary-foreground font-bold text-sm">V</span>
          </div>
          <span className="font-bold text-xl">Vivio</span>
        </Link>

        {/* Desktop навигация */}
        <div className="hidden items-center gap-1 lg:flex">
          {navigation.filter(item => !item.hidden).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            
            // Для кнопки "Создать видео" используем onClick вместо Link
            if (item.name === "Создать видео") {
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    openUpload();
                  }}
                  className={cn(
                    "flex items-center gap-2",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Button>
              );
            }

            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "flex items-center gap-2",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Правая часть: авторизация и мобильное меню */}
        <div className="flex items-center gap-2">
          {/* Desktop авторизация */}
          <div className="hidden lg:flex items-center gap-2">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                      <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href={`/profile/${user.id}`}>
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Профиль</span>
                    </DropdownMenuItem>
                  </Link>
                  {user.role === "ADMIN" && (
                    <Link href="/admin">
                      <DropdownMenuItem className="cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                        </svg>
                        <span>Админ-панель</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Выйти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm">
                  Войти
                </Button>
              </Link>
            )}
          </div>

          {/* Мобильное меню */}
          <Sheet open={open} onOpenChange={setOpen}>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setOpen(!open)}
              className="lg:hidden"
            >
              <MenuIcon className="size-4" />
            </Button>
            <SheetContent
              className="bg-background/95 supports-[backdrop-filter]:bg-background/80 gap-0 backdrop-blur-lg"
              side="left"
            >
              <div className="grid gap-y-2 overflow-y-auto px-4 pt-12 pb-5">
                {navigation.filter(item => !item.hidden).map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));

                  // Для кнопки "Создать видео" используем onClick вместо Link
                  if (item.name === "Создать видео") {
                    return (
                      <Button
                        key={item.name}
                        variant={isActive ? "default" : "ghost"}
                        onClick={(e) => {
                          e.preventDefault();
                          openUpload();
                          setOpen(false);
                        }}
                        className="justify-start gap-2"
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Button>
                    );
                  }

                  return (
                    <Link key={item.name} href={item.href} onClick={() => setOpen(false)}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className="w-full justify-start gap-2"
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
              <SheetFooter className="flex flex-col gap-2">
                {isAuthenticated && user ? (
                  <>
                    <Link href={`/profile/${user.id}`} onClick={() => setOpen(false)} className="w-full">
                      <Button variant="outline" className="w-full">
                        <User className="mr-2 h-4 w-4" />
                        Профиль
                      </Button>
                    </Link>
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => {
                        handleSignOut();
                        setOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Выйти
                    </Button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setOpen(false)} className="w-full">
                    <Button variant="default" className="w-full">
                      Войти
                    </Button>
                  </Link>
                )}
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
