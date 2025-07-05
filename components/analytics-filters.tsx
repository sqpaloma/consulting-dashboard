import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyticsFiltersProps {
  uploadedData: any[];
}

// Custom dropdown component
const CustomDropdown = ({
  value,
  options,
  onChange,
  placeholder,
  isOpen,
  setIsOpen,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <span className="text-sm">{selectedOption?.label || placeholder}</span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export function AnalyticsFilters({ uploadedData }: AnalyticsFiltersProps) {
  const [selectedEngineer, setSelectedEngineer] = useState("todos");
  const [selectedYear, setSelectedYear] = useState("todos");
  const [selectedMonth, setSelectedMonth] = useState("todos");
  const [topEngineersFilter, setTopEngineersFilter] = useState("orcamento");

  // Dropdown states
  const [engineerDropdownOpen, setEngineerDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Replace the static engineers array with dynamic one
  const engineers = [
    { value: "todos", label: "Engenheiro" },
    ...Array.from(new Set(uploadedData.map((row) => row.engenheiro)))
      .filter((eng) => eng && eng.trim() !== "")
      .map((eng) => ({
        value: eng.toLowerCase().replace(/\s+/g, ""),
        label: eng,
      })),
  ];

  // Replace the static years array with dynamic one
  const availableYears = Array.from(
    new Set(uploadedData.map((row) => row.ano.toString()))
  ).sort((a, b) => Number.parseInt(b) - Number.parseInt(a));

  const years = [
    { value: "todos", label: "Ano" },
    ...availableYears.map((year) => ({ value: year, label: year })),
  ];

  // Se não houver dados, usar anos padrão
  if (years.length === 1) {
    // Agora só adiciona se houver apenas a opção "todos"
    years.push(
      { value: "2025", label: "2025" },
      { value: "2024", label: "2024" },
      { value: "2023", label: "2023" }
    );
  }

  // Replace the static months array with dynamic one based on uploaded data
  const availableMonths = Array.from(
    new Set(uploadedData.map((row) => row.mes.toString().padStart(2, "0")))
  ).sort();

  const months = [
    { value: "todos", label: "Mês" },
    ...availableMonths.map((month) => {
      const monthNames = [
        "",
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ];
      return {
        value: month,
        label: monthNames[Number.parseInt(month)],
      };
    }),
  ];

  // Se não houver dados, usar meses padrão
  if (months.length === 1) {
    months.push(
      { value: "01", label: "Janeiro" },
      { value: "02", label: "Fevereiro" },
      { value: "03", label: "Março" },
      { value: "04", label: "Abril" },
      { value: "05", label: "Maio" },
      { value: "06", label: "Junho" },
      { value: "07", label: "Julho" },
      { value: "08", label: "Agosto" },
      { value: "09", label: "Setembro" },
      { value: "10", label: "Outubro" },
      { value: "11", label: "Novembro" },
      { value: "12", label: "Dezembro" }
    );
  }

  return (
    <>
      <div className="w-64">
        <CustomDropdown
          value={selectedEngineer}
          options={engineers}
          onChange={setSelectedEngineer}
          placeholder="Selecionar engenheiro"
          isOpen={engineerDropdownOpen}
          setIsOpen={setEngineerDropdownOpen}
        />
      </div>

      <div className="w-32">
        <CustomDropdown
          value={selectedYear}
          options={years}
          onChange={setSelectedYear}
          placeholder="Ano"
          isOpen={yearDropdownOpen}
          setIsOpen={setYearDropdownOpen}
        />
      </div>

      <div className="w-48">
        <CustomDropdown
          value={selectedMonth}
          options={months}
          onChange={setSelectedMonth}
          placeholder="Mês"
          isOpen={monthDropdownOpen}
          setIsOpen={setMonthDropdownOpen}
        />
      </div>

      <div className="w-40">
        <CustomDropdown
          value={topEngineersFilter}
          options={[
            { value: "orcamento", label: "Orçamento" },
            { value: "faturamento", label: "Faturamento" },
          ]}
          onChange={setTopEngineersFilter}
          placeholder="Filtro"
          isOpen={filterDropdownOpen}
          setIsOpen={setFilterDropdownOpen}
        />
      </div>
    </>
  );
}
