"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationModalProps {
  confirmation: {
    type: "message" | "conversation";
    id: string;
    show: boolean;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationModal({
  confirmation,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0">
            <Trash2 className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {confirmation.type === "message"
                ? "Deletar mensagem"
                : "Deletar conversa"}
            </h3>
            <p className="text-sm text-gray-500">
              {confirmation.type === "message"
                ? "Esta ação não pode ser desfeita. A mensagem será removida para todos os participantes."
                : "Esta ação não pode ser desfeita. Toda a conversa e suas mensagens serão removidas."}
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            {confirmation.type === "message"
              ? "Deletar mensagem"
              : "Deletar conversa"}
          </Button>
        </div>
      </div>
    </div>
  );
}
