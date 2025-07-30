"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TodoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (todoData: {
    title: string;
    description: string;
    responsible: string;
    scheduledDate: string;
  }) => void;
  initialData?: {
    title: string;
    description: string;
    responsible: string;
    scheduledDate: string;
  };
  title: string;
}

export function TodoForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}: TodoFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    responsible: "",
    scheduledDate: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: "",
        description: "",
        responsible: "",
        scheduledDate: "",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    if (!formData.responsible.trim()) {
      alert("Por favor, preencha o responsável");
      return;
    }
    if (!formData.scheduledDate) {
      alert("Por favor, selecione uma data agendada");
      return;
    }

    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Digite o título da tarefa"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Digite uma descrição"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsible">Responsável *</Label>
              <Input
                id="responsible"
                value={formData.responsible}
                onChange={(e) =>
                  setFormData({ ...formData, responsible: e.target.value })
                }
                placeholder="Nome do responsável"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Data Agendada *</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scheduledDate: e.target.value,
                  })
                }
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? "Salvar" : "Criar Tarefa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
