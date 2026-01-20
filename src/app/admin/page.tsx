"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useChallenges } from "@/lib/queries/challenges";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/AppSidebar";
import { SiteHeader } from "@/components/admin/SiteHeader";
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
import { SettingsForm } from "@/components/admin/SettingsForm";
import { toast } from "sonner";
import { Plus, Edit, Trash2, AlertCircle, Loader2 } from "lucide-react";

interface ChallengeFormData {
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

const initialFormData: ChallengeFormData = {
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
  const { data: challenges, isLoading: challengesLoading, refetch: refetchChallenges } = useChallenges();
  
  const [activeSection, setActiveSection] = useState("challenges");
  const [formData, setFormData] = useState<ChallengeFormData>(initialFormData);
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
        ? `/api/admin/challenges/${editingId}`
        : "/api/admin/challenges";
      
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка при сохранении челленджа");
      }

      toast.success(editingId ? "Челлендж обновлен" : "Челлендж создан");
      setFormData(initialFormData);
      setEditingId(null);
      setIsDialogOpen(false);
      refetchChallenges();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Произошла ошибка");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (challenge: any) => {
    setFormData({
      title: challenge.title,
      description: challenge.description || "",
      category: challenge.category,
      thumbnailUrl: challenge.thumbnailUrl || "",
      promptTemplate: challenge.promptTemplate,
      isActive: challenge.isActive,
    });
    setEditingId(challenge.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите деактивировать этот челлендж?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/challenges/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка при удалении челленджа");
      }

      toast.success("Челлендж деактивирован");
      refetchChallenges();
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
      case "challenges":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Челленджи</h2>
                <p className="text-muted-foreground">Управление челленджами приложения</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setFormData(initialFormData); setEditingId(null); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Создать челлендж
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingId ? "Редактировать челлендж" : "Создать новый челлендж"}
                    </DialogTitle>
                    <DialogDescription>
                      Заполните информацию о челлендже. Все поля обязательны, кроме описания и миниатюры.
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

            {challengesLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Загрузка челленджей...</p>
              </div>
            ) : challenges && challenges.length > 0 ? (
              <div className="grid gap-4">
                {challenges.map((challenge) => (
                  <Card key={challenge.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle>{challenge.title}</CardTitle>
                            <Badge variant={challenge.isActive ? "default" : "secondary"}>
                              {challenge.isActive ? "Активен" : "Неактивен"}
                            </Badge>
                            <Badge variant="outline">{challenge.category}</Badge>
                          </div>
                          <CardDescription>{challenge.description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(challenge)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(challenge.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <span className="font-medium">Участников:</span>{" "}
                        {challenge.participantCount}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Челленджи не найдены</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Создайте первый челлендж, нажав на кнопку выше
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

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
    challenges: "Челленджи",
    users: "Пользователи",
    settings: "Настройки",
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--header-height": "4rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <SidebarInset>
        <SiteHeader title={sectionTitles[activeSection] || "Админ-панель"} />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          {renderContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
