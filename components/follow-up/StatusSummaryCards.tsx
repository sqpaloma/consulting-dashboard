import { ItemFilter } from "../../app/follow-up/utils";

interface StatusSummaryCardsProps {
  onTime: number;
  overdue: number;
  dueSoon: number;
  filter: ItemFilter;
  onFilterChange: (filter: ItemFilter) => void;
}

export function StatusSummaryCards({
  onTime,
  overdue,
  dueSoon,
  filter,
  onFilterChange,
}: StatusSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div
        className={`rounded-md border-2 p-4 bg-white cursor-pointer transition ring-offset-2 ${
          filter === "onTime" ? "ring-2 ring-[#BBDEFB]" : ""
        }`}
        style={{ borderColor: "#BBDEFB" }}
        onClick={() => onFilterChange(filter === "onTime" ? null : "onTime")}
        role="button"
        aria-pressed={filter === "onTime"}
        tabIndex={0}
      >
        <div className="text-xs uppercase tracking-wide text-gray-700">
          No prazo
        </div>
        <div className="text-2xl font-semibold">{onTime}</div>
      </div>
      <div
        className={`rounded-md border-2 p-4 bg-white cursor-pointer transition ring-offset-2 ${
          filter === "overdue" ? "ring-2 ring-[#FFCDD2]" : ""
        }`}
        style={{ borderColor: "#FFCDD2" }}
        onClick={() => onFilterChange(filter === "overdue" ? null : "overdue")}
        role="button"
        aria-pressed={filter === "overdue"}
        tabIndex={0}
      >
        <div className="text-xs uppercase tracking-wide text-gray-700">
          Atrasados
        </div>
        <div className="text-2xl font-semibold">{overdue}</div>
      </div>
      <div
        className={`rounded-md border-2 p-4 bg-white cursor-pointer transition ring-offset-2 ${
          filter === "dueSoon" ? "ring-2 ring-[#FFF9C4]" : ""
        }`}
        style={{ borderColor: "#FFF9C4" }}
        onClick={() => onFilterChange(filter === "dueSoon" ? null : "dueSoon")}
        role="button"
        aria-pressed={filter === "dueSoon"}
        tabIndex={0}
      >
        <div className="text-xs uppercase tracking-wide text-gray-700">
          Essa semana (≤ 5 dias)
        </div>
        <div className="text-2xl font-semibold">{dueSoon}</div>
      </div>
    </div>
  );
}