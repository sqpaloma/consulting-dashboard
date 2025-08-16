import { getDueDate, startOfDay, isAnaliseStatus, isExecucaoStatus, formatPersonName } from "@/lib/programacao-utils";
import { ActivityCard } from "./activity-card";

interface MechanicColumnProps {
  mechanic: string;
  items: any[];
}

export function MechanicColumn({ mechanic, items }: MechanicColumnProps) {
  const sortedItems = [...items].sort((a, b) => {
    const da = getDueDate(a);
    const db = getDueDate(b);
    const ta = da ? startOfDay(da).getTime() : Infinity;
    const tb = db ? startOfDay(db).getTime() : Infinity;
    if (ta !== tb) return ta - tb;
    const sa = a.status || "";
    const sb = b.status || "";
    const saScore = isAnaliseStatus(sa)
      ? 0
      : isExecucaoStatus(sa)
        ? 1
        : 2;
    const sbScore = isAnaliseStatus(sb)
      ? 0
      : isExecucaoStatus(sb)
        ? 1
        : 2;
    return saScore - sbScore;
  });

  return (
    <div className="flex flex-col bg-gray-50 rounded-md p-2 h-full overflow-hidden">
      <div className="text-xs font-semibold mb-4 flex items-center justify-between text-gray-700 sticky top-0 z-10 bg-gray-50">
        <div
          className="flex-1 text-center"
          title={formatPersonName(mechanic)}
        >
          {formatPersonName(mechanic)}
        </div>
        <div className="bg-gray-200 text-gray-600 rounded-full px-2 py-1 text-xs min-w-[20px] text-center">
          {sortedItems.length}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        {sortedItems.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-6">
            Sem atividades
          </div>
        ) : (
          <div className="space-y-2">
            {sortedItems.map((activity, idx) => (
              <ActivityCard key={idx} activity={activity} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}