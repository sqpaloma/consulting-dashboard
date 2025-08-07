"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle } from "lucide-react";

export function OverdueItemsCard({
  overdueItems = [],
  onOverdueClick,
}: {
  overdueItems?: any[];
  onOverdueClick?: (items: any[]) => void;
}) {
  const overdueCount = overdueItems.length;

  const handleClick = () => {
    if (onOverdueClick && overdueItems.length > 0) {
      onOverdueClick(overdueItems);
    }
  };

  return (
    <Card
      className={`bg-white ${overdueCount > 0 ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}`}
      onClick={handleClick}
    >
      <CardContent className="p-2">
        <div className="text-xs text-gray-500">Atrasados</div>
        <div className="text-lg font-bold text-gray-800">{overdueCount}</div>
        <div
          className={`flex items-center text-xs ${overdueCount > 0 ? "text-red-600" : "text-green-600"}`}
        >
          {overdueCount > 0 ? (
            <AlertTriangle className="h-3 w-3 mr-1" />
          ) : (
            <CheckCircle className="h-3 w-3 mr-1" />
          )}
          {overdueCount > 0 ? "Itens em atraso" : "Todos os itens em dia!"}
        </div>
      </CardContent>
    </Card>
  );
}
