import { Calendar, CalendarDays } from "lucide-react";
import { PdfButton } from "./pdf-button";

interface ProgramacaoFiltersProps {
  departments: { key: string; label: string }[];
  selectedDepartment: string | null;
  onDepartmentChange: (dept: string | null) => void;
  statusFilter: string;
  onStatusFilterChange: (filter: string) => void;
  kpis: { analise: number; execucao: number; atrasados: number };
  totalItems: number;
  showDepartmentFilter: boolean;
  dateFilter: string | null;
  onDateFilterChange: (filter: string | null) => void;
  todayCount: number;
  weekCount: number;
  // Props para PDF
  consultant?: string;
  mechanics?: Array<{
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
}

export function ProgramacaoFilters({
  departments,
  selectedDepartment,
  onDepartmentChange,
  statusFilter,
  onStatusFilterChange,
  kpis,
  totalItems,
  showDepartmentFilter,
  dateFilter,
  onDateFilterChange,
  todayCount,
  weekCount,
  consultant,
  mechanics = [],
}: ProgramacaoFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 justify-between">
      <div className="flex flex-col gap-2">
        {showDepartmentFilter && departments.length > 1 && (
          <div className="flex items-center">
            <label
              className="text-xs text-gray-600 mr-2"
              htmlFor="deptSelect"
            >
              Departamento:
            </label>
            <select
              id="deptSelect"
              className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700"
              value={selectedDepartment || ""}
              onChange={(e) => onDepartmentChange(e.target.value || null)}
            >
              <option value="">Todos</option>
              {departments.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <label
            className="text-xs text-gray-600"
            htmlFor="statusSelect"
          >
            Status:
          </label>
          <select
            id="statusSelect"
            className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="execucao">Em execução ({kpis.execucao})</option>
            <option value="atrasados">Atrasados ({kpis.atrasados})</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-600">Data:</span>
        <button
          type="button"
          onClick={() => onDateFilterChange(dateFilter === "today" ? null : "today")}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-colors ${
            dateFilter === "today"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
          }`}
        >
          <Calendar className="w-3 h-3" />
          Hoje ({todayCount})
        </button>
        <button
          type="button"
          onClick={() => onDateFilterChange(dateFilter === "week" ? null : "week")}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-colors ${
            dateFilter === "week"
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
          }`}
        >
          <CalendarDays className="w-3 h-3" />
          Esta Semana ({weekCount})
        </button>
        
        {consultant && (
          <PdfButton
            consultant={consultant}
            mechanics={mechanics}
            statusFilter={statusFilter}
            dateFilter={dateFilter}
            department={selectedDepartment ? 
              departments.find(d => d.key === selectedDepartment)?.label || null : null
            }
          />
        )}
      </div>
    </div>
  );
}