"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { VideoCard } from "@/components/video/VideoCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Heart, Video, Calendar, Globe, Lock, ExternalLink } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  bio: string | null;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  } | null;
  isPublic: boolean;
  createdAt: string;
  videos: any[];
  totalLikes: number;
  videosCount: number;
}

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Ошибка загрузки профиля");
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Произошла ошибка");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-start gap-6">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-[9/16] w-full rounded-lg" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lock className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {error || "Профиль не найден"}
            </h2>
            <p className="text-muted-foreground text-center mb-4">
              Этот профиль может быть приватным или удаленным
            </p>
            <Link href="/">
              <Button>На главную</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const socialLinks = profile.socialLinks || {};
  const hasSocialLinks = Object.values(socialLinks).some(link => link);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start gap-6">
          <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
            <AvatarImage src={profile.image || undefined} />
            <AvatarFallback className="text-4xl">
              {profile.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{profile.name || "Пользователь"}</h1>
                  <Badge variant={profile.isPublic ? "default" : "secondary"}>
                    {profile.isPublic ? (
                      <>
                        <Globe className="w-3 h-3 mr-1" />
                        Публичный
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 mr-1" />
                        Приватный
                      </>
                    )}
                  </Badge>
                </div>
                {profile.bio && (
                  <p className="text-muted-foreground max-w-2xl">{profile.bio}</p>
                )}
              </div>

              {isOwnProfile && (
                <Link href="/profile/settings">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Редактировать
                  </Button>
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">{profile.videosCount}</span>
                <span className="text-muted-foreground text-sm">видео</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">{profile.totalLikes}</span>
                <span className="text-muted-foreground text-sm">лайков</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">
                  С {new Date(profile.createdAt).toLocaleDateString("ru-RU", { 
                    month: "long", 
                    year: "numeric" 
                  })}
                </span>
              </div>
            </div>

            {/* Social Links */}
            {hasSocialLinks && (
              <div className="flex items-center gap-3 pt-2">
                {socialLinks.twitter && (
                  <a 
                    href={socialLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}
                {socialLinks.instagram && (
                  <a 
                    href={socialLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {socialLinks.tiktok && (
                  <a 
                    href={socialLinks.tiktok} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                    </svg>
                  </a>
                )}
                {socialLinks.youtube && (
                  <a 
                    href={socialLinks.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Videos Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {isOwnProfile ? "Мои видео" : "Видео пользователя"}
          </h2>

          {profile.videos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profile.videos.map((video) => (
                <Link key={video.id} href={`/videos/${video.id}`}>
                  <VideoCard
                    id={video.id}
                    videoUrl={video.videoUrl}
                    thumbnailUrl={video.thumbnailUrl}
                    aspectRatio="vertical"
                    autoPlayOnHover={true}
                  />
                  <div className="mt-2 space-y-1">
                    {video.vibe && (
                      <Badge variant="outline" className="text-xs">
                        {video.vibe.category}
                      </Badge>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>❤️ {video.likesCount}</span>
                      <span>👁 {video.viewsCount}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Video className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  {isOwnProfile 
                    ? "Вы еще не создали ни одного видео" 
                    : "У пользователя пока нет видео"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
