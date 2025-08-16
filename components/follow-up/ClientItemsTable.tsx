import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DashboardItemLike,
  extractDeadline,
  extractOrcamento,
  extractOS,
  categorizeItem,
} from "../../app/follow-up/utils";

interface ClientItemsTableProps {
  items: DashboardItemLike[];
  isLoading: boolean;
  onCopyToClipboard: (label: string, value: string) => void;
}

export function ClientItemsTable({
  items,
  isLoading,
  onCopyToClipboard,
}: ClientItemsTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm" aria-live="polite">
          <thead>
            <tr className="text-left text-xs text-gray-600 border-b">
              <th className="py-2 pr-4">Responsável</th>
              <th className="py-2 pr-4">OS / Orçamento</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Prazo</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="border-b animate-pulse">
                <td className="py-3 pr-4">
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </td>
                <td className="py-3 pr-4">
                  <div className="h-3 w-40 bg-gray-200 rounded" />
                </td>
                <td className="py-3 pr-4">
                  <div className="h-3 w-28 bg-gray-200 rounded" />
                </td>
                <td className="py-3 pr-4">
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm" aria-live="polite">
          <thead>
            <tr className="text-left text-xs text-gray-600 border-b">
              <th className="py-2 pr-4">Responsável</th>
              <th className="py-2 pr-4">OS / Orçamento</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Prazo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="py-4 text-muted-foreground">
                Nenhum item encontrado para este cliente.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm" aria-live="polite">
        <thead>
          <tr className="text-left text-xs text-gray-600 border-b">
            <th className="py-2 pr-4">Responsável</th>
            <th className="py-2 pr-4">OS / Orçamento</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Prazo</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => {
            const dl = extractDeadline(it);
            const prazoDisplay = dl ? dl.toLocaleDateString("pt-BR") : "";
            const orc = extractOrcamento(it) || "";
            const osStr = extractOS(it) || "-";
            const cat = categorizeItem(it);
            
            return (
              <tr
                key={String(it._id) + String(it.os)}
                className={`border-b hover:bg-muted/40 ${
                  cat === "overdue" ? "bg-red-50" : ""
                }`}
              >
                <td className="py-2 pr-4">{it.responsavel || "-"}</td>
                <td className="py-2 pr-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className="cursor-pointer hover:underline"
                          onClick={() => onCopyToClipboard("OS", osStr)}
                        >
                          {osStr}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Copiar OS</TooltipContent>
                    </Tooltip>
                    {orc && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="text-xs text-muted-foreground ml-2 cursor-pointer hover:underline"
                            onClick={() => onCopyToClipboard("Orçamento", orc)}
                          >
                            • {orc}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Copiar Orçamento</TooltipContent>
                      </Tooltip>
                    )}
                  </TooltipProvider>
                </td>
                <td className="py-2 pr-4">{it.status || "-"}</td>
                <td className="py-2 pr-4">{prazoDisplay}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}