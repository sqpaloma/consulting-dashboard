import { FileDown } from "lucide-react";
import { usePdfGenerator } from "@/hooks/use-pdf-generator";

interface PdfButtonProps {
  consultant: string;
  mechanics: Array<{
    name: string;
    items: Array<{
      titulo?: string;
      os?: string;
      cliente: string;
      data?: string;
      prazo?: string;
      status: string;
    }>;
  }>;
  statusFilter: string;
  dateFilter: string | null;
  department: string | null;
  disabled?: boolean;
}

export function PdfButton({
  consultant,
  mechanics,
  statusFilter,
  dateFilter,
  department,
  disabled = false
}: PdfButtonProps) {
  const { generateProgramacaoPdf } = usePdfGenerator();

  const handleGeneratePdf = () => {
    if (disabled || !consultant) return;

    generateProgramacaoPdf({
      consultant,
      mechanics,
      statusFilter,
      dateFilter,
      department
    });
  };

  return (
    <button
      onClick={handleGeneratePdf}
      disabled={disabled || !consultant}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      title="Gerar PDF da programação atual"
    >
      <FileDown className="w-3.5 h-3.5" />
      PDF
    </button>
  );
} 