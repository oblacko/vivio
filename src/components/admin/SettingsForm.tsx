"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const settingsSchema = z.object({
  generationCost: z.number().positive("Стоимость должна быть положительной"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export function SettingsForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      generationCost: 20,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        if (!response.ok) throw new Error("Ошибка загрузки настроек");

        const data = await response.json();
        reset({ generationCost: data.generationCost });
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Не удалось загрузить настройки");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [reset]);

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка при сохранении настроек");
      }

      toast.success("Настройки сохранены");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Произошла ошибка");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки приложения</CardTitle>
        <CardDescription>
          Управление параметрами системы кредитов
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="generationCost">Стоимость генерации видео (кредиты)</Label>
            <Input
              id="generationCost"
              type="number"
              step="0.01"
              min="0.01"
              {...register("generationCost", { valueAsNumber: true })}
              placeholder="20"
            />
            {errors.generationCost && (
              <p className="text-sm text-destructive mt-1">
                {errors.generationCost.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Количество кредитов, которое будет списываться за каждую успешную генерацию видео
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              "Сохранить настройки"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
