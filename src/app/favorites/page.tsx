"use client";

import { VibeCard } from "@/components/vibe/VibeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useFavorites, useToggleFavorite } from "@/lib/queries/favorites";
import { useAuth } from "@/lib/hooks/useAuth";
import { Heart, Lock, LogIn } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

function FavoritesList() {
  const { data: favorites, isLoading, error } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="aspect-[9/16] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Ошибка загрузки избранного</p>
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Нет избранных вайбов</h2>
          <p className="text-muted-foreground mb-6">
            Добавляйте вайбы в избранное, чтобы быстро к ним возвращаться
          </p>
          <Link href="/vibes">
            <Button>
              Посмотреть вайбы
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleToggleFavorite = async (vibeId: string) => {
    try {
      await toggleFavorite.mutateAsync({ vibeId, isFavorite: true });
      toast.success("Удалено из избранного");
    } catch (error) {
      toast.error("Не удалось удалить из избранного");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {favorites.map((favorite) => (
        <VibeCard
          key={favorite.id}
          id={favorite.vibe.id}
          title={favorite.vibe.title}
          description={favorite.vibe.description}
          thumbnailUrl={favorite.vibe.thumbnailUrl}
          participantCount={favorite.vibe.participantCount}
          category={favorite.vibe.category}
          tags={favorite.vibe.tags}
          isFavorite={true}
          onToggleFavorite={() => handleToggleFavorite(favorite.vibe.id)}
        />
      ))}
    </div>
  );
}

export default function FavoritesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto mt-12">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Требуется авторизация</CardTitle>
              <CardDescription>
                Чтобы просматривать избранное, необходимо войти в систему
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/login?callbackUrl=${encodeURIComponent("/favorites")}`}>
                <Button className="w-full" size="lg">
                  <LogIn className="w-4 h-4 mr-2" />
                  Войти
                </Button>
              </Link>
              <Link href={`/signup?callbackUrl=${encodeURIComponent("/favorites")}`}>
                <Button variant="outline" className="w-full" size="lg">
                  Создать аккаунт
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Heart className="w-10 h-10 text-red-500" />
          Избранное
        </h1>
        <p className="text-muted-foreground text-lg">
          Ваши любимые вайбы в одном месте
        </p>
      </div>

      <FavoritesList />
    </main>
  );
}
