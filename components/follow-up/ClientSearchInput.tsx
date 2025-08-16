import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

interface ClientSearchInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  suggestions: string[];
  isSuggestionsOpen: boolean;
  onSuggestionsOpenChange: (open: boolean) => void;
  highlightedIndex: number;
  onHighlightedIndexChange: (index: number) => void;
  onSelectSuggestion: (name: string) => void;
  onAddCliente: () => void;
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
  className?: string;
  placeholder?: string;
}

export function ClientSearchInput({
  query,
  onQueryChange,
  suggestions,
  isSuggestionsOpen,
  onSuggestionsOpenChange,
  highlightedIndex,
  onHighlightedIndexChange,
  onSelectSuggestion,
  onAddCliente,
  onKeyDown,
  className = "",
  placeholder = "Buscar Cliente",
}: ClientSearchInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (highlightedIndex < 0) return;
    const child = list.querySelectorAll('[role="option"]')[
      highlightedIndex
    ] as HTMLElement;
    if (child && typeof child.scrollIntoView === "function") {
      child.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const node = e.target as Node;
      const insideBox = boxRef.current?.contains(node) ?? false;
      if (!insideBox) {
        onSuggestionsOpenChange(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onSuggestionsOpenChange]);

  return (
    <div className={`flex gap-2 items-center ${className}`}>
      <div className="relative flex-1" ref={boxRef}>
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-3 pr-3 bg-white/80"
          ref={inputRef}
          onFocus={() => onSuggestionsOpenChange(true)}
          onKeyDown={onKeyDown}
        />
        {isSuggestionsOpen && suggestions.length > 0 && (
          <div
            ref={listRef}
            role="listbox"
            className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow max-h-64 overflow-y-auto"
          >
            {suggestions.map((name, idx) => (
              <div
                key={name}
                role="option"
                aria-selected={highlightedIndex === idx}
                className={`w-full text-left px-3 py-2 text-sm cursor-pointer ${
                  highlightedIndex === idx ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
                onMouseEnter={() => onHighlightedIndexChange(idx)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelectSuggestion(name)}
              >
                {name}
              </div>
            ))}
          </div>
        )}
      </div>
      <Button
        onClick={onAddCliente}
        disabled={!query.trim()}
        variant="outline"
        className="bg-white text-blue-600 hover:bg-blue-50"
      >
        Adicionar cliente
      </Button>
    </div>
  );
}