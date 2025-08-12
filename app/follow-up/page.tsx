"use client";

import { useEffect, useMemo, useState } from "react";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Clock8 } from "lucide-react";
import {
  useDashboardItemsByCliente,
  useUniqueClientes,
} from "@/lib/convex-dashboard-client";
import { useClientSummary } from "@/lib/convex-analytics-client";

export default function FollowUpPage() {
  const [query, setQuery] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<string>("");

  // Auto-complete
  const uniqueClientes = useUniqueClientes() || [];
  const suggestions = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return uniqueClientes.slice(0, 10);
    return uniqueClientes
      .filter((c) => c.toLowerCase().includes(q))
      .slice(0, 10);
  }, [query, uniqueClientes]);

  // Dados por cliente (itens do dashboard)
  const items = useDashboardItemsByCliente(selectedCliente || query) || [];

  // Resumo de analytics por cliente (agregado no servidor)
  const clientSummary = useClientSummary({ limit: 2000 }) || [];
  const analyticsForCliente = useMemo(() => {
    const target = (selectedCliente || query).toLowerCase().trim();
    if (!target) return null;
    return clientSummary.find(
      (c: any) => c.cliente?.toLowerCase().trim() === target
    );
  }, [clientSummary, query, selectedCliente]);

  const handleSearch = (name: string) => {
    setSelectedCliente(name);
    setQuery(name);
  };

  const pending = useMemo(
    () =>
      items.filter((it: any) => {
        const s = (it.status || "").toLowerCase();
        return (
          s.includes("aguardando") ||
          s.includes("pendente") ||
          s.includes("aprovação") ||
          s.includes("aprovacao") ||
          s.includes("orçamento") ||
          s.includes("orcamento") ||
          s.includes("cotação") ||
          s.includes("cotacao")
        );
      }),
    [items]
  );

  return (
    <ResponsiveLayout
      title="Follow-up"
      subtitle="Acompanhe por cliente"
      titleRight={
        <div className="hidden xl:flex items-center gap-2">
          <div className="relative">
            <Input
              placeholder="Buscar Cliente"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 w-64 text-sm pl-3 pr-3"
            />
            {query && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow">
                {suggestions.map((name) => (
                  <button
                    key={name}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    onClick={() => handleSearch(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => handleSearch(query)}
            disabled={!query.trim()}
            className="h-8"
          >
            Buscar
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Busca (exibida apenas no mobile/tablet) */}
        <Card className="xl:hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" /> Buscar Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Input
                  placeholder="Digite o nome do cliente"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-3 pr-3"
                />
                {query && suggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow">
                    {suggestions.map((name) => (
                      <button
                        key={name}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50"
                        onClick={() => handleSearch(name)}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                onClick={() => handleSearch(query)}
                disabled={!query.trim()}
              >
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resumo */}
        {analyticsForCliente && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Faturamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {analyticsForCliente.faturamentos}
                </div>
                <div className="text-muted-foreground">
                  Valor total:{" "}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(analyticsForCliente.valorFaturamentos || 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Orçamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {analyticsForCliente.orcamentos}
                </div>
                <div className="text-muted-foreground">
                  Valor total:{" "}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(analyticsForCliente.valorOrcamentos || 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl">{analyticsForCliente.cliente}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pendentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <Clock8 className="h-5 w-5" /> Pendentes / Em Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Nada pendente para este cliente.
              </div>
            ) : (
              <ul className="space-y-3">
                {pending.map((it: any) => (
                  <li
                    key={it._id}
                    className="border rounded p-3 bg-amber-50/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {it.titulo || `Item ${it.os}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        OS {it.os}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{it.status}</div>
                    {it.dataRegistro && (
                      <div className="text-xs text-gray-500">
                        Registro: {it.dataRegistro}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
}
