import { isAnaliseStatus, isExecucaoStatus } from "@/lib/programacao-utils";

interface StatusChipProps {
  value: string;
}

export function StatusChip({ value }: StatusChipProps) {
  const analise = isAnaliseStatus(value);
  const exec = isExecucaoStatus(value);
  const color = analise
    ? "bg-yellow-100 text-yellow-800"
    : exec
      ? "bg-emerald-100 text-emerald-800"
      : "bg-gray-100 text-gray-700";
  const dot = analise
    ? "bg-yellow-500"
    : exec
      ? "bg-emerald-500"
      : "bg-gray-400";
  
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${color}`}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot}`} />
      {value}
    </span>
  );
}