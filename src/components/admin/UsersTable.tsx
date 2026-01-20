"use client";

import { useState } from "react";
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
import { EditBalanceDialog } from "./EditBalanceDialog";
import { TransactionsModal } from "./TransactionsModal";
import { Edit, History } from "lucide-react";

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

interface UsersTableProps {
  users: User[];
  onUpdate: () => void;
}

export function UsersTable({ users, onUpdate }: UsersTableProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);

  const handleEditBalance = (userId: string) => {
    setSelectedUserId(userId);
    setIsBalanceDialogOpen(true);
  };

  const handleViewTransactions = (userId: string) => {
    setSelectedUserId(userId);
    setIsTransactionsModalOpen(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead className="text-right">Баланс кредитов</TableHead>
              <TableHead className="text-right">Видео</TableHead>
              <TableHead className="text-right">Генерации</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Пользователи не найдены
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || "Без имени"}
                  </TableCell>
                  <TableCell>{user.email || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {user.role === "ADMIN" ? "Админ" : "Пользователь"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {user.balance.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">{user._count.videos}</TableCell>
                  <TableCell className="text-right">{user._count.generationJobs}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditBalance(user.id)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Баланс
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTransactions(user.id)}
                      >
                        <History className="w-4 h-4 mr-1" />
                        История
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedUserId && (
        <>
          <EditBalanceDialog
            userId={selectedUserId}
            open={isBalanceDialogOpen}
            onOpenChange={setIsBalanceDialogOpen}
            onSuccess={onUpdate}
          />
          <TransactionsModal
            userId={selectedUserId}
            open={isTransactionsModalOpen}
            onOpenChange={setIsTransactionsModalOpen}
          />
        </>
      )}
    </>
  );
}
