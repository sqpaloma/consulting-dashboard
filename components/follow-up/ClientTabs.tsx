import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { getFirstName } from "../../app/follow-up/utils";

interface ClientTabsProps {
  tabs: string[];
  activeTab: string;
  onActiveTabChange: (tab: string) => void;
  onRemoveTab: (name: string) => void;
  onReorderTabs: (sourceName: string, targetName: string) => void;
  draggingName: string | null;
  onDraggingNameChange: (name: string | null) => void;
  children: React.ReactNode;
}

export function ClientTabs({
  tabs,
  activeTab,
  onActiveTabChange,
  onRemoveTab,
  onReorderTabs,
  draggingName,
  onDraggingNameChange,
  children,
}: ClientTabsProps) {
  if (tabs.length === 0) {
    return (
      <Tabs value={activeTab} onValueChange={onActiveTabChange}>
        <TabsList className="w-full overflow-x-auto">
          <div className="text-sm text-muted-foreground px-2 py-1">
            Nenhum cliente adicionado. Use a busca acima para adicionar.
          </div>
        </TabsList>
      </Tabs>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={onActiveTabChange}>
      <TabsList className="w-full overflow-x-auto">
        {tabs.map((name) => (
          <TabsTrigger
            key={name}
            value={name}
            className={`group relative max-w-[200px] pr-6 truncate rounded-full transition-colors bg-white text-blue-600 hover:bg-blue-50 data-[state=active]:bg-[#2563EB] data-[state=active]:text-white data-[state=active]:shadow ${
              draggingName === name ? "opacity-60" : ""
            }`}
            title={name}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "move";
              onDraggingNameChange(name);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggingName) onReorderTabs(draggingName, name);
              onDraggingNameChange(null);
            }}
            onDragEnd={() => onDraggingNameChange(null)}
          >
            {getFirstName(name)}
            <span
              role="button"
              aria-label={`Fechar ${name}`}
              tabIndex={0}
              className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:block rounded-sm p-0 hover:bg-muted cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemoveTab(name);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemoveTab(name);
                }
              }}
            >
              <X className="h-2 w-2" />
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}