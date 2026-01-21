"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  createdAt: string;
  _count: {
    vibes: number;
  };
}

export function TagsManager() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/tags");
      if (!response.ok) throw new Error("Ошибка загрузки тегов");
      const data = await response.json();
      setTags(data);
    } catch (error) {
      toast.error("Не удалось загрузить теги");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTagName.trim()) {
      toast.error("Введите название тега");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка при создании тега");
      }

      toast.success("Тег создан");
      setNewTagName("");
      setIsDialogOpen(false);
      fetchTags();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Произошла ошибка");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTag = async (id: string, name: string) => {
    if (!confirm(`Вы уверены, что хотите удалить тег "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tags/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка при удалении тега");
      }

      toast.success("Тег удален");
      fetchTags();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Произошла ошибка");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Теги</h2>
          <p className="text-muted-foreground">Управление тегами для вайбов</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Создать тег
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать новый тег</DialogTitle>
              <DialogDescription>
                Введите название тега. Теги используются для категоризации вайбов.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTag} className="space-y-4 mt-4">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Название тега"
                maxLength={50}
                autoFocus
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Создание..." : "Создать"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setNewTagName("");
                  }}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Загрузка тегов...</p>
        </div>
      ) : tags.length > 0 ? (
        <div className="grid gap-4">
          {tags.map((tag) => (
            <Card key={tag.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {tag.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Используется в {tag._count.vibes} вайбах
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTag(tag.id, tag.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Теги не найдены</p>
              <p className="text-sm text-muted-foreground mt-2">
                Создайте первый тег, нажав на кнопку выше
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
