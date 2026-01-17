"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Twitter,
  MessageCircle,
  Send,
  Copy,
  Share2
} from "lucide-react";
import { useState } from "react";

interface ShareDialogProps {
  url: string;
  title: string;
  children: React.ReactNode;
}

const socialPlatforms = [
  {
    name: "VK",
    icon: MessageCircle,
    url: (url: string, title: string) =>
      `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    color: "hover:bg-blue-500 hover:text-white",
  },
  {
    name: "Telegram",
    icon: Send,
    url: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    color: "hover:bg-blue-400 hover:text-white",
  },
  {
    name: "Twitter",
    icon: Twitter,
    url: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    color: "hover:bg-blue-400 hover:text-white",
  },
  {
    name: "Facebook",
    icon: Facebook,
    url: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    color: "hover:bg-blue-600 hover:text-white",
  },
];

export function ShareDialog({ url, title, children }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = (platformUrl: string) => {
    window.open(platformUrl, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
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

          <div className="grid grid-cols-2 gap-3">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <Button
                  key={platform.name}
                  variant="outline"
                  className={`flex items-center gap-2 h-12 ${platform.color} transition-colors`}
                  onClick={() => handleShare(platform.url(url, title))}
                >
                  <Icon className="w-4 h-4" />
                  {platform.name}
                </Button>
              );
            })}
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Или скопируйте ссылку
            </p>
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
      </DialogContent>
    </Dialog>
  );
}