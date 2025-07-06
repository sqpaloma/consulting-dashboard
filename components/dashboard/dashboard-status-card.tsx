"use client";

import { useState } from "react";
import { CheckCircle, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type DashboardUpload } from "@/lib/dashboard-supabase-client";

interface DashboardStatusCardProps {
  uploadHistory: DashboardUpload[];
}

export function DashboardStatusCard({
  uploadHistory,
}: DashboardStatusCardProps) {
  const [historyDropdownOpen, setHistoryDropdownOpen] = useState(false);

  return (
    <Card className="bg-white border-l-4 border-l-green-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-gray-800">
                Dados compartilhados disponíveis
              </p>
              <p className="text-sm text-gray-600">
                Último upload: {uploadHistory[0]?.file_name} por{" "}
                {uploadHistory[0]?.uploaded_by}
              </p>
            </div>
          </div>
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setHistoryDropdownOpen(!historyDropdownOpen)}
              className="bg-transparent"
              title="Histórico"
            >
              <History className="h-4 w-4" />
            </Button>
            {historyDropdownOpen && (
              <div className="absolute right-0 mt-1 w-80 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
                {uploadHistory.map((upload, index) => (
                  <div
                    key={upload.id}
                    className="p-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-sm text-gray-800">
                      {upload.file_name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {upload.uploaded_by} • {upload.total_records} registros
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(upload.upload_date || "").toLocaleString(
                        "pt-BR"
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
