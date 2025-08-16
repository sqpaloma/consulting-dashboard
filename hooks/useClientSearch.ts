import { useMemo, useState } from "react";

export function useClientSearch(
  uniqueClientes: string[],
  tabs: string[],
  onAddClient: (name: string) => void
) {
  const [query, setQuery] = useState("");
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const suggestions = useMemo(() => {
    const q = query.toLowerCase().trim();
    const remaining = uniqueClientes.filter((c) => !tabs.includes(c));
    const list = !q
      ? remaining
      : remaining.filter((c) => c.toLowerCase().includes(q));
    return list.slice(0, 100);
  }, [query, uniqueClientes, tabs]);

  const handleSelectSuggestion = (name: string) => {
    onAddClient(name);
    setQuery("");
    setIsSuggestionsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleAddCliente = () => {
    const val = query.trim();
    if (!val) return;
    onAddClient(val);
    setQuery("");
    setIsSuggestionsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!isSuggestionsOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsSuggestionsOpen(true);
        e.preventDefault();
      } else if (e.key === "Escape") {
        setIsSuggestionsOpen(false);
        setHighlightedIndex(-1);
        return;
      }
    }
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev + 1;
        return next >= suggestions.length ? 0 : next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? suggestions.length - 1 : next;
      });
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsSuggestionsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return {
    query,
    setQuery,
    suggestions,
    isSuggestionsOpen,
    setIsSuggestionsOpen,
    highlightedIndex,
    setHighlightedIndex,
    handleSelectSuggestion,
    handleAddCliente,
    handleKeyDown,
  };
}