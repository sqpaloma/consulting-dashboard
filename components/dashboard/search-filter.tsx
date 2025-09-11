"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

interface SearchItem {
  id: string;
  os?: string;
  orcamento?: string;
  cliente?: string;
  [key: string]: any;
}

interface SearchFilterProps {
  onItemSelect: (item: SearchItem) => void;
  processedItems: SearchItem[];
  placeholder?: string;
  className?: string;
}

export function SearchFilter({
  onItemSelect,
  processedItems,
  placeholder = "Buscar por OS, orçamento ou cliente...",
  className = "",
}: SearchFilterProps) {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (search.trim().length >= 2) {
      const searchLower = search.toLowerCase();
      const filtered = processedItems.filter((item) => {
        const os = (item.os || "").toString().toLowerCase();
        const orcamento = (item.orcamento || "").toString().toLowerCase();
        const cliente = (item.cliente || "").toString().toLowerCase();
        
        return os.includes(searchLower) || 
               orcamento.includes(searchLower) || 
               cliente.includes(searchLower);
      }).slice(0, 10); // Limitar a 10 sugestões
      
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }, [search, processedItems]);

  const handleClear = () => {
    setSearch("");
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleSelectItem = (item: SearchItem) => {
    setSearch("");
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    onItemSelect(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        if (isOpen) {
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        if (isOpen) {
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && selectedIndex >= 0) {
          // Se há uma sugestão selecionada, usa ela
          handleSelectItem(suggestions[selectedIndex]);
        } else if (search.trim().length >= 2 && suggestions.length > 0) {
          // Se não há seleção mas há sugestões, usa a primeira
          handleSelectItem(suggestions[0]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <span key={index} className="bg-blue-100 text-blue-700 font-semibold">{part}</span> : 
        part
    );
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 bg-white border-neutral-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dropdown com sugestões */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {suggestions.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleSelectItem(item)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-200 last:border-b-0 hover:bg-gray-50 ${
                index === selectedIndex ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm">
                  {item.os && (
                    <span className="text-blue-600">
                      OS: {highlightMatch(item.os.toString(), search)}
                    </span>
                  )}
                  {item.orcamento && (
                    <span className="text-green-600">
                      Orç: {highlightMatch(item.orcamento.toString(), search)}
                    </span>
                  )}
                </div>
                <div className="text-gray-900 text-sm font-medium">
                  {highlightMatch(item.cliente || "Cliente não informado", search)}
                </div>
                {item.titulo && (
                  <div className="text-gray-600 text-xs truncate">
                    {item.titulo}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}