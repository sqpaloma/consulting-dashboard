import { getDueDate, formatDueLabel, getCardStyle } from "@/lib/programacao-utils";

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
              {activity.data ? new Date(activity.data).toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
              }) : activity.prazo ? new Date(activity.prazo).toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
              }) : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}