"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Произошла ошибка
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error?.message || "Неизвестная ошибка"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => reset()}
            >
              Попробовать снова
            </Button>
            <Button
              variant="default"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              На главную
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}