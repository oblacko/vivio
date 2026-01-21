"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Power } from "lucide-react";
import type { Vibe } from "@/lib/queries/vibes";

interface VibesTableProps {
  vibes: Vibe[];
  onEdit: (vibe: Vibe) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

const categoryLabels: Record<string, string> = {
  MONUMENTS: "Монументы",
  PETS: "Питомцы",
  FACES: "Лица",
  SEASONAL: "Сезонные",
};

export function VibesTable({
  vibes,
  onEdit,
  onToggleActive,
  onDelete,
}: VibesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Название</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-right">Участников</TableHead>
            <TableHead>Описание</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vibes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Вайбы не найдены
              </TableCell>
            </TableRow>
          ) : (
            vibes.map((vibe) => (
              <TableRow key={vibe.id}>
                <TableCell className="font-medium">{vibe.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {categoryLabels[vibe.category] || vibe.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={vibe.isActive ? "default" : "secondary"}>
                    {vibe.isActive ? "Активен" : "Неактивен"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{vibe.participantCount}</TableCell>
                <TableCell className="max-w-md">
                  <p className="truncate text-sm text-muted-foreground">
                    {vibe.description || "-"}
                  </p>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant={vibe.isActive ? "outline" : "default"}
                      size="sm"
                      onClick={() => onToggleActive(vibe.id, vibe.isActive)}
                      title={vibe.isActive ? "Деактивировать" : "Активировать"}
                    >
                      <Power className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(vibe)}
                      title="Редактировать"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(vibe.id)}
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
