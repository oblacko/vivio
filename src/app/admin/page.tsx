"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { useVibes } from "@/lib/queries/vibes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UsersTable } from "@/components/admin/UsersTable";
import { VibesTable } from "@/components/admin/VibesTable";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { TagsManager } from "@/components/admin/TagsManager";
import { VibeGenerator } from "@/components/admin/VibeGenerator";
import { toast } from "sonner";
import { Plus, Edit, Trash2, AlertCircle, Loader2 } from "lucide-react";
import type { Vibe } from "@/lib/queries/vibes";

interface VibeFormData {
  title: string;
  description: string;
  category: "MONUMENTS" | "PETS" | "FACES" | "SEASONAL";
  thumbnailUrl: string;
  promptTemplate: string;
  isActive: boolean;
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: "USER" | "ADMIN";
  balance: number;
  createdAt: string;
  _count: {
    videos: number;
    generationJobs: number;
  };
}

const initialFormData: VibeFormData = {
  title: "",
  description: "",
  category: "MONUMENTS",
  thumbnailUrl: "",
  promptTemplate: "",
  isActive: true,
};

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: vibes, isLoading: vibesLoading, refetch: refetchVibes } = useVibes();
  
  const activeSection = searchParams.get("section") || "vibes";
  const [formData, setFormData] = useState<VibeFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersPage, setUsersPage] = useState(1);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "ADMIN")) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, user, router]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch(`/api/admin/users?page=${usersPage}&limit=20`);
      if (!response.ok) throw new Error("Ошибка загрузки пользователей");
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      toast.error("Не удалось загрузить пользователей");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN" && activeSection === "users") {
      fetchUsers();
    }
  }, [usersPage, isAuthenticated, user, activeSection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingId 
        ? `/api/admin/vibes/${editingId}`
        : "/api/admin/vibes";
      
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка при сохранении вайба");
      }

      toast.success(editingId ? "Вайб обновлен" : "Вайб создан");
      setFormData(initialFormData);
      setEditingId(null);
      setIsDialogOpen(false);
      refetchVibes();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Произошла ошибка");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (vibe: any) => {
    setFormData({
      title: vibe.title,
      description: vibe.description || "",
      category: vibe.category,
      thumbnailUrl: vibe.thumbnailUrl || "",
      promptTemplate: vibe.promptTemplate,
      isActive: vibe.isActive,
    });
    setEditingId(vibe.id);
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? "деактивировать" : "активировать";
    if (!confirm(`Вы уверены, что хотите ${action} этот вайб?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/vibes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Ошибка при ${action} вайба`);
      }

      toast.success(currentStatus ? "Вайб деактивирован" : "Вайб активирован");
      refetchVibes();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Произошла ошибка");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот вайб?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/vibes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка при удалении вайба");
      }

      toast.success("Вайб удален");
      refetchVibes();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Произошла ошибка");
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setFormData(initialFormData);
    setEditingId(null);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "vibes":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Вайбы</h2>
                <p className="text-muted-foreground">Управление вайбами приложения</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setFormData(initialFormData); setEditingId(null); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Создать вайб
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingId ? "Редактировать вайб" : "Создать новый вайб"}
                    </DialogTitle>
                    <DialogDescription>
                      Заполните информацию о вайбе. Все поля обязательны, кроме описания и миниатюры.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="title">Название</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Описание</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Категория</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MONUMENTS">Монументы</SelectItem>
                          <SelectItem value="PETS">Питомцы</SelectItem>
                          <SelectItem value="FACES">Лица</SelectItem>
                          <SelectItem value="SEASONAL">Сезонные</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="thumbnailUrl">URL миниатюры</Label>
                      <Input
                        id="thumbnailUrl"
                        type="url"
                        value={formData.thumbnailUrl}
                        onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div>
                      <Label htmlFor="promptTemplate">Шаблон промпта</Label>
                      <Textarea
                        id="promptTemplate"
                        value={formData.promptTemplate}
                        onChange={(e) => setFormData({ ...formData, promptTemplate: e.target.value })}
                        rows={4}
                        required
                        placeholder="Transform this image into..."
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                      <Label htmlFor="isActive">Активен</Label>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Сохранение..." : editingId ? "Обновить" : "Создать"}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleDialogClose}>
                        Отмена
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {vibesLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Загрузка вайбов...</p>
              </div>
            ) : vibes && vibes.length > 0 ? (
              <VibesTable
                vibes={vibes}
                onEdit={handleEdit}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
              />
            ) : (
              <div className="rounded-md border">
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Вайбы не найдены</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Создайте первый вайб, нажав на кнопку выше
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "vibes-generator":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Генерация вайбов через AI</h2>
              <p className="text-muted-foreground">Автоматическая генерация вайбов с помощью DeepSeek AI</p>
            </div>
            <VibeGenerator />
          </div>
        );

      case "tags":
        return <TagsManager />;

      case "users":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Пользователи</h2>
              <p className="text-muted-foreground">Управление пользователями и их балансом кредитов</p>
            </div>
            {isLoadingUsers ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Загрузка пользователей...</p>
              </div>
            ) : (
              <UsersTable users={users} onUpdate={fetchUsers} />
            )}
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Настройки</h2>
              <p className="text-muted-foreground">Управление параметрами системы кредитов</p>
            </div>
            <SettingsForm />
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  const sectionTitles: Record<string, string> = {
    vibes: "Вайбы",
    "vibes-generator": "Генерация вайбов",
    tags: "Теги",
    users: "Пользователи",
    settings: "Настройки",
  };

  return (
    <div className="container mx-auto max-w-7xl py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {sectionTitles[activeSection] || "Админ-панель"}
        </h1>
        <p className="text-muted-foreground mt-2">
          Управление системой
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-4">
        {renderContent()}
      </div>
    </div>
  );
}
