import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet } from "lucide-react";
import { StepByStepInstructions } from "./step-by-step-instructions";

interface StepByStepModalProps {
  modalType: string;
  onClose: () => void;
  stepImages: File[];
  onImageUpload: (files: FileList | null) => void;
  onRemoveImage: (index: number) => void;
  onImagePreview: (file: File) => void;
}

export function StepByStepModal({
  modalType,
  onClose,
  stepImages,
  onImageUpload,
  onRemoveImage,
  onImagePreview,
}: StepByStepModalProps) {
  const getModalTitle = () => {
    switch (modalType) {
      case "orcamento-registro":
        return "Passo-a-Passo 1: Registrar Orçamento no Sankhya";
      case "aprovacao-registro":
        return "Passo-a-Passo 2: Registrar Aprovação no Sankhya";
      case "devolucao-processo":
        return "Passo-a-Passo 3: Processo de Devolução";
      case "faturamento-processo":
        return "Passo-a-Passo 3: Processo de Faturamento";
      case "devolucao-pecas":
        return "Passo-a-Passo 4: Devolução de Peças";
      case "baixa-pecas":
        return "Passo-a-Passo 5: Baixa de Peças";
      case "auditoria-processo":
        return "Passo-a-Passo: Processo de Auditoria";
      default:
        return "Passo-a-Passo";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {getModalTitle()}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Instructions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Instruções
              </h3>
              <StepByStepInstructions modalType={modalType} />
            </div>

            {/* Images Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Capturas de Tela do Sistema
                </h3>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => onImageUpload(e.target.files)}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 bg-transparent"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Adicionar Fotos</span>
                  </Button>
                </label>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {stepImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                      alt={`Passo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onImagePreview(file)}
                    />
                    <button
                      onClick={() => onRemoveImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      Etapa {index + 1}
                    </div>
                  </div>
                ))}

                {stepImages.length === 0 && (
                  <div className="col-span-2 flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <FileSpreadsheet className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center">
                      Nenhuma imagem adicionada ainda.
                      <br />
                      Clique em "Adicionar Fotos" para incluir capturas de tela
                      do sistema Sankhya.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {stepImages.length} imagem(ns) adicionada(s)
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Salvar Alterações
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
