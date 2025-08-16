import { useMemo } from "react";
import {
  DashboardItemLike,
  extractDeadline,
  categorizeItem,
  ItemFilter,
} from "../app/follow-up/utils";

export function useClientItems(items: DashboardItemLike[], filter: ItemFilter) {
  const { onTime, overdue, dueSoon } = useMemo(() => {
    let onTime = 0;
    let overdue = 0;
    let dueSoon = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;

    for (const it of items) {
      const deadline = extractDeadline(it);
      if (!deadline || isNaN(deadline.getTime())) {
        onTime++;
        continue;
      }
      const d = new Date(deadline);
      d.setHours(0, 0, 0, 0);
      if (d < today) {
        overdue++;
      } else {
        const diff = +d - +today;
        if (diff <= fiveDaysMs) dueSoon++;
        else onTime++;
      }
    }
    return { onTime, overdue, dueSoon };
  }, [items]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const da = extractDeadline(a);
      const db = extractDeadline(b);
      const ta =
        da && !isNaN(da.getTime()) ? da.getTime() : Number.POSITIVE_INFINITY;
      const tb =
        db && !isNaN(db.getTime()) ? db.getTime() : Number.POSITIVE_INFINITY;
      if (ta === tb) {
        const aos = String(a.os || "");
        const bos = String(b.os || "");
        return aos.localeCompare(bos, "pt-BR");
      }
      return ta - tb;
    });
  }, [items]);

  const filteredSortedItems = useMemo(() => {
    let arr = sortedItems;
    if (filter) return arr.filter((it) => categorizeItem(it) === filter);
    return arr;
  }, [sortedItems, filter]);

  const filterMeta = useMemo(() => {
    if (filter === "onTime") return { label: "No prazo", color: "#BBDEFB" };
    if (filter === "overdue") return { label: "Atrasados", color: "#FFCDD2" };
    if (filter === "dueSoon")
      return { label: " Essa semana (≤ 5 dias)", color: "#FFF9C4" };
    return null;
  }, [filter]);

  return {
    onTime,
    overdue,
    dueSoon,
    sortedItems,
    filteredSortedItems,
    filterMeta,
  };
}