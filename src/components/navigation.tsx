"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Home, Play, Sparkles, Plus, LogOut, User, MenuIcon, Heart, Shield, Tags, Users, Settings, Wand2, X } from "lucide-react";
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
    name: "Вайбы",
    href: "/vibes",
    icon: Sparkles,
  },
  {
    name: "Избранное",
    href: "/favorites",
    icon: Heart,
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

const adminNavigation: NavigationItem[] = [
  {
    name: "Вайбы",
    href: "/admin?section=vibes",
    icon: Sparkles,
  },
  {
    name: "Генерация AI",
    href: "/admin?section=vibes-generator",
    icon: Wand2,
  },
  {
    name: "Теги",
    href: "/admin?section=tags",
    icon: Tags,
  },
  {
    name: "Пользователи",
    href: "/admin?section=users",
    icon: Users,
  },
  {
    name: "Настройки",
    href: "/admin?section=settings",
    icon: Settings,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { openUpload, closeUpload } = useUpload();
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = React.useState(false);

  const isAdminPage = pathname === "/admin";
  const showAdminNav = isAdminPage && user?.role === "ADMIN";
  const currentNav = showAdminNav ? adminNavigation : navigation;

  // Закрываем upload sheet когда открывается мобильное меню
  React.useEffect(() => {
    if (open) {
      closeUpload();
    }
  }, [open, closeUpload]);

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
        "sticky top-6 z-[100]",
        "mx-auto w-full max-w-6xl rounded-2xl border border-border/40 shadow-sm",
        "bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur-xl",
      )}
    >
      <nav className="mx-auto flex items-center justify-between px-4 py-2">
        {/* Логотип */}
        <Link href="/" className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 duration-200">
          <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 10L16 24L23 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight">vibeo.fun</span>
        </Link>

        {/* Desktop навигация */}
        <div className="hidden items-center gap-1 lg:flex">
          {currentNav.filter(item => !item.hidden).map((item) => {
            const Icon = item.icon;
            let isActive = false;
            
            if (showAdminNav) {
              // Для админских ссылок проверяем searchParams
              const section = searchParams.get("section") || "vibes";
              isActive = item.href.includes(`section=${section}`);
            } else {
              // Для обычных ссылок проверяем pathname
              isActive = pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
            }
            
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
          <Button
            size="icon"
            variant="outline"
            onClick={() => setOpen(!open)}
            className="lg:hidden"
          >
            <MenuIcon className="size-4" />
          </Button>

          {/* Полноэкранное мобильное меню */}
          {open && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md lg:hidden animate-in fade-in duration-200"
                onClick={() => setOpen(false)}
              />

              {/* Menu Content */}
              <div className="fixed inset-0 z-[10000] lg:hidden">
                <div className="h-full flex flex-col p-6 bg-white dark:bg-gray-950 animate-in slide-in-from-bottom duration-300">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                        <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 10L16 24L23 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="font-bold text-2xl tracking-tight text-foreground">vibeo.fun</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setOpen(false)}
                      className="h-10 w-10 rounded-full hover:bg-muted"
                    >
                      <X className="size-5 text-foreground" />
                    </Button>
                  </div>

                  {/* User Info */}
                  {isAuthenticated && user && (
                    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/5 border border-primary/30">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-primary/30">
                          <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                          <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                            {getUserInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base truncate text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {currentNav.filter(item => !item.hidden).map((item) => {
                      const Icon = item.icon;
                      let isActive = false;
                      
                      if (showAdminNav) {
                        const section = searchParams.get("section") || "vibes";
                        isActive = item.href.includes(`section=${section}`);
                      } else {
                        isActive = pathname === item.href ||
                          (item.href !== "/" && pathname.startsWith(item.href));
                      }

                      if (item.name === "Создать видео") {
                        return (
                          <button
                            key={item.name}
                            onClick={(e) => {
                              e.preventDefault();
                              openUpload();
                              setOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200",
                              isActive
                                ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/25"
                                : "bg-muted/50 hover:bg-muted border border-border"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              isActive ? "bg-white/20" : "bg-primary/20"
                            )}>
                              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-primary")} />
                            </div>
                            <span className={cn("font-medium text-base", isActive ? "text-white" : "text-foreground")}>{item.name}</span>
                          </button>
                        );
                      }

                      return (
                        <Link key={item.name} href={item.href} onClick={() => setOpen(false)}>
                          <button
                            className={cn(
                              "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200",
                              isActive
                                ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/25"
                                : "bg-muted/50 hover:bg-muted border border-border"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              isActive ? "bg-white/20" : "bg-primary/20"
                            )}>
                              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-primary")} />
                            </div>
                            <span className={cn("font-medium text-base", isActive ? "text-white" : "text-foreground")}>{item.name}</span>
                          </button>
                        </Link>
                      );
                    })}

                    {/* Admin Panel Link для обычных юзеров-админов */}
                    {!showAdminNav && user?.role === "ADMIN" && (
                      <Link href="/admin" onClick={() => setOpen(false)}>
                        <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500/50">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500/20">
                            <Shield className="w-5 h-5 text-purple-500" />
                          </div>
                          <span className="font-medium text-base text-foreground">Админ-панель</span>
                        </button>
                      </Link>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-6 space-y-2 pt-4 border-t border-border">
                    {isAuthenticated && user ? (
                      <>
                        <Link href={`/profile/${user.id}`} onClick={() => setOpen(false)} className="block">
                          <Button variant="outline" className="w-full h-12 justify-start gap-3 bg-muted/50 border-border hover:bg-muted">
                            <User className="w-5 h-5" />
                            <span className="text-base">Профиль</span>
                          </Button>
                        </Link>
                        <Button 
                          variant="default" 
                          className="w-full h-12 justify-start gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                          onClick={() => {
                            handleSignOut();
                            setOpen(false);
                          }}
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="text-base">Выйти</span>
                        </Button>
                      </>
                    ) : (
                      <Link href="/login" onClick={() => setOpen(false)} className="block">
                        <Button className="w-full h-12 text-base bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white">
                          Войти
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
