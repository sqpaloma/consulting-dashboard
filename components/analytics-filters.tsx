import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AnalyticsFiltersProps {
  uploadedData: any[];
  selectedDepartment: string;
  setSelectedDepartment: (value: string) => void;
  selectedEngineer: string;
  setSelectedEngineer: (value: string) => void;
  selectedYear: string;
  setSelectedYear: (value: string) => void;
  selectedMonth: string;
  setSelectedMonth: (value: string) => void;
  topEngineersFilter: string;
  setTopEngineersFilter: (value: string) => void;
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

export function AnalyticsFilters({
  uploadedData,
  selectedDepartment,
  setSelectedDepartment,
  selectedEngineer,
  setSelectedEngineer,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  topEngineersFilter,
  setTopEngineersFilter,
}: AnalyticsFiltersProps) {
  // Remover os useState dos filtros, pois agora são controlados por props
  // Dropdown states
  const [engineerDropdownOpen, setEngineerDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  // Novo estado para dropdown de departamento
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);

  // Opções de departamento
  const departments = [
    { value: "todos", label: "Departamento" },
    { value: "vendas", label: "Departamento de Vendas" },
    { value: "servicos", label: "Departamento de Serviços" },
    {
      value: "engenhariaeassistencia",
      label: "Departamento de Engenharia e Assistência",
    },
    { value: "outros", label: "Outros" },
  ];

  // Mapeamento dos departamentos e colaboradores
  const departmentMap: Record<
    string,
    { gerente: string; colaboradores: string[] }
  > = {
    vendas: {
      gerente: "Sobrinho",
      colaboradores: [
        "Sobrinho",
        "Mamede",
        "Giovana",
        "Rafael Massa",
        "LENILTON",
      ],
    },
    servicos: {
      gerente: "Giovanni",
      colaboradores: ["Giovanni", "Paloma", "Lucas", "Marcelo M", "Raquel"],
    },
    engenhariaeassistencia: {
      gerente: "Carlinhos",
      colaboradores: ["Carlinhos", "Claudio", "Anderson"],
    },
  };

  // Função para normalizar nomes (case insensitive, sem espaços extras)
  function normalizeName(name: string) {
    return name?.toLowerCase().replace(/\s+/g, "").trim();
  }

  // Lista de engenheiros filtrada pelo departamento
  let filteredEngineers: { value: string; label: string }[] = [];
  // Lista de engenheiros únicos presentes na planilha
  const engineersInSheet = Array.from(
    new Set(uploadedData.map((row) => row.engenheiro))
  ).filter((eng) => eng && eng.trim() !== "");

  if (selectedDepartment === "todos") {
    filteredEngineers = [
      { value: "todos", label: "Engenheiro" },
      ...engineersInSheet.map((eng) => ({
        value: normalizeName(eng),
        label: eng,
      })),
    ];
  } else if (
    selectedDepartment === "vendas" ||
    selectedDepartment === "servicos" ||
    selectedDepartment === "engenhariaeassistencia"
  ) {
    const { colaboradores } = departmentMap[selectedDepartment];
    // Só mostra os colaboradores do departamento que estão na planilha
    filteredEngineers = [
      { value: "todos", label: "Engenheiro" },
      ...colaboradores
        .filter((eng) =>
          engineersInSheet.some(
            (sheetEng) => normalizeName(sheetEng) === normalizeName(eng)
          )
        )
        .map((eng) => ({
          value: normalizeName(eng),
          label: eng,
        })),
    ];
  } else if (selectedDepartment === "outros") {
    // Pega todos os engenheiros que não estão nos outros departamentos
    const allColabs = [
      ...departmentMap.vendas.colaboradores,
      ...departmentMap.servicos.colaboradores,
      ...departmentMap.engenhariaeassistencia.colaboradores,
    ].map(normalizeName);
    filteredEngineers = [
      { value: "todos", label: "Engenheiro" },
      ...engineersInSheet
        .filter((eng) => !allColabs.includes(normalizeName(eng)))
        .map((eng) => ({
          value: normalizeName(eng),
          label: eng,
        })),
    ];
  }

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
      <div className="w-48">
        <CustomDropdown
          value={selectedDepartment}
          options={departments}
          onChange={setSelectedDepartment}
          placeholder="Departamento"
          isOpen={departmentDropdownOpen}
          setIsOpen={setDepartmentDropdownOpen}
        />
      </div>
      <div className="w-64">
        <CustomDropdown
          value={selectedEngineer}
          options={filteredEngineers}
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
