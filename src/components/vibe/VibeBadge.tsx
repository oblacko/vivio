"use client";

import { Heart, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Tag } from "@/store/useVibeStore";

interface VibeBadgeProps {
  vibeId: string;
  vibeName: string;
  tags?: Tag[];
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onQuickCreate?: () => void;
  showQuickCreate?: boolean;
  className?: string;
}

export function VibeBadge({
  vibeId,
  vibeName,
  tags,
  isFavorite = false,
  onToggleFavorite,
  onQuickCreate,
  showQuickCreate = true,
  className,
}: VibeBadgeProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 shrink-0",
            isFavorite && "text-red-500 hover:text-red-600"
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite?.();
          }}
        >
          <Heart
            className={cn("w-4 h-4", isFavorite && "fill-current")}
          />
        </Button>
        
        <Link 
          href={`/vibes/${vibeId}`}
          className="flex-1 min-w-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium truncate hover:underline text-slate-200">
              {vibeName}
            </p>
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 2).map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
                {tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Link>
      </div>

      {showQuickCreate && (
        <Link href={`/create?vibeId=${vibeId}`} onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span className="text-xs">Создать</span>
          </Button>
        </Link>
      )}
    </div>
  );
}
