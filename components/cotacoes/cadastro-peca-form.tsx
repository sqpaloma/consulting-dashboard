"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CadastroPecaFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CadastroPecaForm({ isOpen, onClose }: CadastroPecaFormProps) {
  const [formData, setFormData] = useState({
    codigo: "",
    descricao: "",
    marca: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cadastrarPeca = useMutation(api.cotacoes.cadastrarPeca);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.codigo.trim() || !formData.descricao.trim()) {
      toast.error("Código e descrição são obrigatórios");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await cadastrarPeca({
        codigo: formData.codigo.trim(),
        descricao: formData.descricao.trim(),
        marca: formData.marca.trim() || undefined,
      });

      toast.success("Peça cadastrada com sucesso!");
      setFormData({ codigo: "", descricao: "", marca: "" });
      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar peça:", error);
      toast.error("Erro ao cadastrar peça. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ codigo: "", descricao: "", marca: "" });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cadastro de Peça</DialogTitle>
          <DialogDescription>
            Cadastre uma nova peça no sistema. Apenas código e descrição são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="codigo">
              Código da Peça <span className="text-red-500">*</span>
            </Label>
            <Input
              id="codigo"
              value={formData.codigo}
              onChange={(e) =>
                setFormData({ ...formData, codigo: e.target.value })
              }
              placeholder="Ex: ABC123"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">
              Descrição <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              placeholder="Descrição detalhada da peça"
              disabled={isSubmitting}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="marca">Marca</Label>
            <Input
              id="marca"
              value={formData.marca}
              onChange={(e) =>
                setFormData({ ...formData, marca: e.target.value })
              }
              placeholder="Ex: Bosch, SKF, etc."
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar Peça"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}