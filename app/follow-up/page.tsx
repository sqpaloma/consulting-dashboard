"use client";

import { useState } from "react";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Search, MoreHorizontal } from "lucide-react";
import {
  useDashboardItemsByCliente,
  useUniqueClientes,
} from "@/lib/convex-dashboard-client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as XLSX from "xlsx";
import {
  DashboardItemLike,
  extractDeadline,
  extractOrcamento,
  extractOS,
  categorizeItem,
  ItemFilter,
} from "./utils";
import { StatusSummaryCards } from "@/components/follow-up/StatusSummaryCards";
import { ClientItemsTable } from "@/components/follow-up/ClientItemsTable";
import { ClientChartsSection } from "@/components/follow-up/ClientChartsSection";
import { ClientSearchInput } from "@/components/follow-up/ClientSearchInput";
import { ClientTabs } from "@/components/follow-up/ClientTabs";
import { useClientTabs } from "@/hooks/useClientTabs";
import { useClientSearch } from "@/hooks/useClientSearch";
import { useClientItems } from "@/hooks/useClientItems";


export default function FollowUpPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [filter, setFilter] = useState<ItemFilter>(null);
  const [draggingName, setDraggingName] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const uniqueClientes = useUniqueClientes() || [];
  
  const {
    tabs,
    activeTab,
    setActiveTab,
    addClienteTab,
    removeClienteTab,
    reorderTabs,
  } = useClientTabs(user?.userId);

  const {
    query,
    setQuery,
    suggestions,
    isSuggestionsOpen,
    setIsSuggestionsOpen,
    highlightedIndex,
    setHighlightedIndex,
    handleSelectSuggestion,
    handleAddCliente,
    handleKeyDown,
  } = useClientSearch(uniqueClientes, tabs, addClienteTab);

  // Items for active client
  const rawItems = useDashboardItemsByCliente(activeTab || "");
  const items: DashboardItemLike[] = rawItems || [];
  const isLoadingItems = rawItems === undefined;

  const {
    onTime,
    overdue,
    dueSoon,
    filteredSortedItems,
    filterMeta,
  } = useClientItems(items, filter);


  // quick filters removed by user request

  const copyToClipboard = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: `${label} copiado`, description: value });
    } catch {
      toast({ title: `Não foi possível copiar ${label}` });
    }
  };

  const handleExportCSV = () => {
    if (!filteredSortedItems.length) {
      toast({ title: "Nada para exportar" });
      return;
    }
    const rows = filteredSortedItems.map((it) => {
      const dl = extractDeadline(it);
      return {
        responsavel: it.responsavel || "",
        os: extractOS(it) || "",
        orcamento: extractOrcamento(it) || "",
        status: it.status || "",
        prazo: dl ? dl.toISOString().slice(0, 10) : "",
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FollowUp");
    const filename = `followup_${(activeTab || "cliente").replace(/\s+/g, "_")}.csv`;
    XLSX.writeFile(wb, filename, { bookType: "csv" as any });
    toast({ title: "CSV gerado", description: filename });
  };

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "l" });
      doc.setFontSize(12);
      doc.text(`Follow-up - ${activeTab}`, 10, 10);
      let y = 20;
      doc.setFontSize(9);
      doc.text("Responsável", 10, y);
      doc.text("OS", 60, y);
      doc.text("Orçamento", 90, y);
      doc.text("Status", 130, y);
      doc.text("Prazo", 200, y);
      y += 6;
      filteredSortedItems.slice(0, 300).forEach((it) => {
        const dl = extractDeadline(it);
        doc.text((it.responsavel || "").toString(), 10, y);
        doc.text((extractOS(it) || "").toString(), 60, y);
        doc.text((extractOrcamento(it) || "").toString(), 90, y);
        doc.text((it.status || "").toString().slice(0, 60), 130, y);
        doc.text(dl ? dl.toLocaleDateString("pt-BR") : "", 200, y);
        y += 6;
        if (y > 190) {
          doc.addPage();
          y = 20;
        }
      });
      const filename = `followup_${(activeTab || "cliente").replace(/\s+/g, "_")}.pdf`;
      doc.save(filename);
      toast({ title: "PDF gerado", description: filename });
    } catch (e) {
      toast({ title: "Falha ao gerar PDF" });
    }
  };


  return (
    <ResponsiveLayout
      title="Follow-up"
      subtitle=""
      fullWidth={true}
      titleRight={
        <div className="hidden xl:flex items-center gap-2">
          <ClientSearchInput
            query={query}
            onQueryChange={setQuery}
            suggestions={suggestions}
            isSuggestionsOpen={isSuggestionsOpen}
            onSuggestionsOpenChange={setIsSuggestionsOpen}
            highlightedIndex={highlightedIndex}
            onHighlightedIndexChange={setHighlightedIndex}
            onSelectSuggestion={handleSelectSuggestion}
            onAddCliente={handleAddCliente}
            onKeyDown={handleKeyDown}
            className="flex-row"
            placeholder="Buscar Cliente"
          />
        </div>
      }
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" /> Acompanhar por cliente
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Mais opções"
                  className="h-8 w-8 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>
                  Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  Exportar PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca (mobile/tablet) */}
          <div className="xl:hidden">
            <ClientSearchInput
              query={query}
              onQueryChange={setQuery}
              suggestions={suggestions}
              isSuggestionsOpen={isSuggestionsOpen}
              onSuggestionsOpenChange={setIsSuggestionsOpen}
              highlightedIndex={highlightedIndex}
              onHighlightedIndexChange={setHighlightedIndex}
              onSelectSuggestion={handleSelectSuggestion}
              onAddCliente={handleAddCliente}
              onKeyDown={handleKeyDown}
              placeholder="Digite o nome do cliente"
            />
          </div>

          {/* Abas de clientes */}
          <ClientTabs
            tabs={tabs}
            activeTab={activeTab}
            onActiveTabChange={setActiveTab}
            onRemoveTab={removeClienteTab}
            onReorderTabs={reorderTabs}
            draggingName={draggingName}
            onDraggingNameChange={setDraggingName}
          >

            {tabs.map((name) => (
              <TabsContent key={name} value={name} className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Coluna esquerda: contadores + tabela */}
                  <div className="space-y-4">
                    {/* Resumo de status */}
                    <StatusSummaryCards
                      onTime={onTime}
                      overdue={overdue}
                      dueSoon={dueSoon}
                      filter={filter}
                      onFilterChange={setFilter}
                    />

                    {/* filtros rápidos removidos */}

                    {/* Filtro ativo */}
                    {filterMeta && (
                      <div
                        className="flex items-center justify-between rounded-md border-2 px-3 py-2 text-sm bg-white"
                        style={{ borderColor: filterMeta.color }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Filtro ativo:</span>
                          <span>{filterMeta.label}</span>
                        </div>
                        <button
                          onClick={() => setFilter(null)}
                          className="text-xs text-gray-600 hover:underline"
                        >
                          Limpar
                        </button>
                      </div>
                    )}

                    {/* Lista de itens */}
                    <ClientItemsTable
                      items={filteredSortedItems}
                      isLoading={isLoadingItems}
                      onCopyToClipboard={copyToClipboard}
                    />

                    {/* Autosave ativado: botão removido */}
                  </div>

                  {/* Coluna direita: gráficos */}
                  <ClientChartsSection items={items} />
                </div>
              </TabsContent>
            ))}
          </ClientTabs>
        </CardContent>
      </Card>
      <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <SheetContent side="right" className="w-[360px] sm:w-[420px]">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3 text-sm">
            <div className="text-muted-foreground">
              Opções futuras de filtros podem vir aqui (Status, Responsável,
              Prazo, etc.).
            </div>
            <div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFilter(null)}
              >
                Limpar filtro de prazo
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </ResponsiveLayout>
  );
}
