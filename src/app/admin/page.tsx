"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { UsersTable } from "@/components/admin/UsersTable";
import { VibesTable } from "@/components/admin/VibesTable";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { TagsManager } from "@/components/admin/TagsManager";
import { VibeGenerator } from "@/components/admin/VibeGenerator";
import { toast } from "sonner";
import { Plus, Edit, Trash2, AlertCircle, Loader2, Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Vibe } from "@/lib/queries/vibes";

interface VibeFormData {
  title: string;
  description: string;
  tagIds: string[];
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
  tagIds: [],
  thumbnailUrl: "",
  promptTemplate: "",
  isActive: true,
};

function AdminPageContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Состояние для фильтров и пагинации
  const [vibeFilters, setVibeFilters] = useState<any>({
    page: 1,
    limit: 20,
    isActive: "all",
    sortBy: "createdAt",
    tagId: "all",
    search: ""
  });

  const { data: vibesData, isLoading: vibesLoading, refetch: refetchVibes } = useVibes({ 
    isAdmin: true,
    filters: vibeFilters
  });

  const [allTags, setAllTags] = useState<any[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [tags, setTags] = useState<any[]>([]);
  
  useEffect(() => {
    // Загружаем теги для фильтрации
    fetch("/api/admin/tags")
      .then(res => res.json())
      .then(data => {
        setTags(data);
      })
      .catch(err => {
        console.error("Error loading tags for filter:", err);
        setTags([]);
      });
    
    // Загружаем теги для формы
    setIsLoadingTags(true);
    fetch("/api/tags")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch tags");
        return res.json();
      })
      .then(data => {
        setAllTags(data || []);
        setIsLoadingTags(false);
      })
      .catch(err => {
        console.error("Error loading tags:", err);
        setAllTags([]);
        setIsLoadingTags(false);
      });
  }, []);

  const vibes = vibesData?.vibes || [];
  const pagination = vibesData?.pagination;

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

  const fetchUsers = useCallback(async () => {
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
  }, [usersPage]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN" && activeSection === "users") {
      fetchUsers();
    }
  }, [usersPage, isAuthenticated, user, activeSection, fetchUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingId 
        ? `/api/admin/vibes/${editingId}`
        : "/api/admin/vibes";
      
      const method = editingId ? "PATCH" : "POST";

      // Создаем/обновляем вайб без тегов
      const { tagIds = [], ...vibeData } = formData;
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vibeData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка при сохранении вайба");
      }

      const savedVibe = await response.json();
      const vibeId = savedVibe.id || editingId;

      // Обновляем теги вайба
      if (vibeId && Array.isArray(tagIds)) {
        // Получаем текущие теги вайба
        const currentVibe = vibes.find((v: any) => v.id === vibeId);
        const currentTagIds = currentVibe?.tags?.map((t: any) => t.id) || [];

        // Удаляем теги, которых нет в новом списке
        for (const tagId of currentTagIds) {
          if (!tagIds.includes(tagId)) {
            await fetch(`/api/admin/vibes/${vibeId}/tags`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tagId }),
            });
          }
        }

        // Добавляем новые теги
        for (const tagId of tagIds) {
          if (!currentTagIds.includes(tagId)) {
            await fetch(`/api/admin/vibes/${vibeId}/tags`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tagId }),
            });
          }
        }
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
      title: vibe.title || "",
      description: vibe.description || "",
      tagIds: Array.isArray(vibe.tags) ? vibe.tags.map((t: any) => t.id) : [],
      thumbnailUrl: vibe.thumbnailUrl || "",
      promptTemplate: vibe.promptTemplate || "",
      isActive: vibe.isActive ?? true,
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
            <div className="flex flex-col gap-4">
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
                        <Label>Теги</Label>
                        <div className="border rounded-md p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
                          {isLoadingTags ? (
                            <div className="text-sm text-muted-foreground">Загрузка тегов...</div>
                          ) : allTags.length === 0 ? (
                            <div className="text-sm text-muted-foreground">Нет доступных тегов</div>
                          ) : (
                            <div className="space-y-2">
                              {allTags.map((tag) => (
                                <div key={tag.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`tag-${tag.id}`}
                                    checked={formData.tagIds?.includes(tag.id) || false}
                                    onCheckedChange={(checked) => {
                                      const currentTagIds = formData.tagIds || [];
                                      if (checked) {
                                        setFormData({
                                          ...formData,
                                          tagIds: [...currentTagIds, tag.id],
                                        });
                                      } else {
                                        setFormData({
                                          ...formData,
                                          tagIds: currentTagIds.filter((id) => id !== tag.id),
                                        });
                                      }
                                    }}
                                  />
                                  <Label
                                    htmlFor={`tag-${tag.id}`}
                                    className="text-sm font-normal cursor-pointer flex-1"
                                  >
                                    {tag.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {formData.tagIds && formData.tagIds.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.tagIds.map((tagId) => {
                              const tag = allTags.find((t) => t.id === tagId);
                              if (!tag) return null;
                              return (
                                <Badge
                                  key={tagId}
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  {tag.name}
                                  <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        tagIds: formData.tagIds.filter((id) => id !== tagId),
                                      });
                                    }}
                                  />
                                </Badge>
                              );
                            })}
                          </div>
                        )}
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
                        rows={8}
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

              {/* Фильтры */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Поиск</Label>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Название или описание..."
                          className="pl-8"
                          value={vibeFilters.search}
                          onChange={(e) => setVibeFilters({ ...vibeFilters, search: e.target.value, page: 1 })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Статус</Label>
                      <Select
                        value={vibeFilters.isActive}
                        onValueChange={(val) => setVibeFilters({ ...vibeFilters, isActive: val, page: 1 })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Все" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все</SelectItem>
                          <SelectItem value="true">Активные</SelectItem>
                          <SelectItem value="false">Неактивные</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Тег</Label>
                      <Select
                        value={vibeFilters.tagId}
                        onValueChange={(val) => setVibeFilters({ ...vibeFilters, tagId: val, page: 1 })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Любой тег" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Любой тег</SelectItem>
                          {tags.map((tag: any) => (
                            <SelectItem key={tag.id} value={tag.id}>
                              {tag.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Сортировка</Label>
                      <Select
                        value={vibeFilters.sortBy}
                        onValueChange={(val) => setVibeFilters({ ...vibeFilters, sortBy: val, page: 1 })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="createdAt">По дате</SelectItem>
                          <SelectItem value="participantCount">По просмотрам</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {vibesLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Загрузка вайбов...</p>
              </div>
            ) : vibes && vibes.length > 0 ? (
              <div className="space-y-4">
                <VibesTable
                  vibes={vibes}
                  onEdit={handleEdit}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                />
                
                {/* Пагинация */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setVibeFilters({ ...vibeFilters, page: vibeFilters.page - 1 })}
                      disabled={vibeFilters.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Страница {pagination.currentPage} из {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setVibeFilters({ ...vibeFilters, page: vibeFilters.page + 1 })}
                      disabled={vibeFilters.page === pagination.pages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Вайбы не найдены</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Попробуйте изменить параметры фильтрации или создать новый вайб
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

  return (
    <div className="min-h-screen bg-white light">
      <div className="container mx-auto max-w-7xl py-6 px-4">
        <div className="flex flex-1 flex-col gap-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </main>
    }>
      <AdminPageContent />
    </Suspense>
  );
}
