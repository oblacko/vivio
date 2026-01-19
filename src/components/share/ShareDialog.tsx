"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Twitter,
  MessageCircle,
  Send,
  Copy,
  Share2,
  Smartphone
} from "lucide-react";
import { useState, useEffect } from "react";

interface ShareDialogProps {
  videoId: string;
  title: string;
  children: React.ReactNode;
}

interface Platform {
  name: string;
  icon: any;
  url: (url: string, title: string) => string;
  color: string;
  source: string;
}

const socialPlatforms: Platform[] = [
  {
    name: "VK",
    icon: MessageCircle,
    url: (url: string, title: string) =>
      `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    color: "hover:bg-blue-500 hover:text-white",
    source: "vk",
  },
  {
    name: "Telegram",
    icon: Send,
    url: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    color: "hover:bg-blue-400 hover:text-white",
    source: "telegram",
  },
  {
    name: "Twitter",
    icon: Twitter,
    url: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    color: "hover:bg-blue-400 hover:text-white",
    source: "twitter",
  },
  {
    name: "Facebook",
    icon: Facebook,
    url: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    color: "hover:bg-blue-600 hover:text-white",
    source: "facebook",
  },
];

export function ShareDialog({ videoId, title, children }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [supportsWebShare, setSupportsWebShare] = useState(false);

  // Генерируем короткую ссылку для шеринга
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/v/${videoId}`
    : '';

  useEffect(() => {
    // Проверяем поддержку Web Share API
    setSupportsWebShare(
      typeof navigator !== 'undefined' && 
      navigator.share !== undefined
    );
  }, []);

  const recordShare = async (source: string) => {
    try {
      await fetch(`/api/videos/${videoId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source,
          referrer: typeof window !== 'undefined' ? window.location.href : null,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        }),
      });
    } catch (error) {
      console.error('Failed to record share:', error);
    }
  };

  const handleShare = (platform: Platform) => {
    recordShare(platform.source);
    window.open(platform.url(shareUrl, title), "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;

    try {
      await navigator.share({
        title: title,
        text: `Смотрите это видео на Vivio: ${title}`,
        url: shareUrl,
      });
      recordShare('native');
      setIsOpen(false);
    } catch (error) {
      // Пользователь отменил шеринг или произошла ошибка
      console.error('Share failed:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      recordShare('copy');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Поделиться видео
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Выберите платформу для поделиться этим видео
          </p>

          {/* Web Share API для мобильных устройств */}
          {supportsWebShare && (
            <Button
              variant="default"
              onClick={handleNativeShare}
              className="w-full flex items-center gap-2 h-12"
            >
              <Smartphone className="w-4 h-4" />
              Поделиться через систему
            </Button>
          )}

          <div className="grid grid-cols-2 gap-3">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <Button
                  key={platform.name}
                  variant="outline"
                  className={`flex items-center gap-2 h-12 ${platform.color} transition-colors`}
                  onClick={() => handleShare(platform)}
                >
                  <Icon className="w-4 h-4" />
                  {platform.name}
                </Button>
              );
            })}
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Или скопируйте короткую ссылку
            </p>
            <div className="flex flex-col gap-2">
              <div className="p-2 bg-muted rounded text-xs text-center break-all">
                {shareUrl}
              </div>
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="w-full flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {copied ? "Скопировано!" : "Копировать ссылку"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}