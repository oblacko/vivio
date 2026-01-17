"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Share2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface ChallengeCardProps {
  id: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  participantCount: number;
  category: string;
  user?: {
    id: string;
    name?: string | null;
    image?: string | null;
  } | null;
  likesCount?: number;
  viewsCount?: number;
  isLiked?: boolean;
  onLike?: () => void;
  onShare?: () => void;
  className?: string;
}

export function ChallengeCard({
  id,
  title,
  description,
  thumbnailUrl,
  participantCount,
  category,
  user,
  likesCount = 0,
  viewsCount = 0,
  isLiked = false,
  onLike,
  onShare,
  className,
}: ChallengeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className={cn("w-full", className)}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <Link href={`/challenges/${id}`}>
          <div className="relative aspect-[9/16] w-full bg-muted">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No preview
              </div>
            )}

            {/* Badge "6 сек" */}
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 bg-black/50 text-white backdrop-blur-sm"
            >
              6 сек
            </Badge>

            {/* User Avatar */}
            {user && (
              <Link
                href={`/profile/${user.id}`}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-2 right-2"
              >
                <Avatar className="w-8 h-8 border-2 border-white">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback>
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}

            {/* Stats overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between text-white text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{viewsCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{likesCount}</span>
                  </div>
                </div>
                <Badge variant="outline" className="bg-black/50 text-white">
                  {participantCount} участников
                </Badge>
              </div>
            </div>
          </div>
        </Link>

        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
                {description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {category && <Badge variant="outline">{category}</Badge>}

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    onLike?.();
                  }}
                  className={cn(
                    "h-8 w-8",
                    isLiked && "text-red-500 hover:text-red-600"
                  )}
                >
                  <Heart
                    className={cn(
                      "w-4 h-4",
                      isLiked && "fill-current"
                    )}
                  />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    onShare?.();
                  }}
                  className="h-8 w-8"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
