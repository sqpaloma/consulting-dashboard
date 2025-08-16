import { getDueDate, formatDueLabel, getCardStyle } from "@/lib/programacao-utils";
import { StatusChip } from "./status-chip";

interface ActivityCardProps {
  activity: any;
  index: number;
}

export function ActivityCard({ activity, index }: ActivityCardProps) {
  const due = getDueDate(activity);
  const { label: dueLabel, isOverdue } = formatDueLabel(due);
  const titleFull = activity.titulo || activity.os;
  const clientFull = activity.cliente;
  const cardStyle = isOverdue
    ? "bg-red-50 border border-red-200 border-l-4 border-l-red-500"
    : getCardStyle(activity.status);

  return (
    <div key={index} className="px-1">
      <div className={`p-2 rounded-md text-xs ${cardStyle}`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span
              className="font-medium text-gray-800 truncate"
              title={titleFull}
            >
              {activity.titulo || activity.os}
            </span>
            <StatusChip value={activity.status} />
          </div>
          <div
            className="mt-1 text-[11px] text-gray-600 truncate"
            title={clientFull}
          >
            {activity.cliente}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-gray-600">
            <span
              className={
                isOverdue
                  ? "text-red-600 font-medium"
                  : ""
              }
            >
              {dueLabel}
            </span>
            <span>
              {activity.data ||
                activity.prazo ||
                ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}