interface ProgramacaoFiltersProps {
  departments: { key: string; label: string }[];
  selectedDepartment: string | null;
  onDepartmentChange: (dept: string | null) => void;
  statusFilter: string;
  onStatusFilterChange: (filter: string) => void;
  kpis: { analise: number; execucao: number; atrasados: number };
  totalItems: number;
  showDepartmentFilter: boolean;
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
}: ProgramacaoFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 justify-between">
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
      
      <div className="flex items-center gap-2">
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
          <option value="all">Todos ({totalItems})</option>
          <option value="analise">Análise ({kpis.analise})</option>
          <option value="execucao">Em execução ({kpis.execucao})</option>
          <option value="atrasados">Atrasados ({kpis.atrasados})</option>
        </select>
        <button
          type="button"
          onClick={() => onStatusFilterChange("all")}
          className="px-2 py-1 rounded-md text-xs border bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
        >
          Limpar
        </button>
      </div>
    </div>
  );
}