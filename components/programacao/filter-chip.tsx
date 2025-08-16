interface FilterChipProps {
  id: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

export function FilterChip({ id, label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded-md text-xs border transition-colors ${
        active
          ? "bg-indigo-600 text-white border-indigo-600"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}