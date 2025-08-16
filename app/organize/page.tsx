import { ResponsiveLayout } from "@/components/responsive-layout";

import { ChatEmbedded } from "@/components/chat";
import { NotesSection } from "@/components/kanban/notes-section";
import { KanbanMain } from "@/components/kanban/kanban-main";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export function CalendarCombined() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Query com userId do usuário logado - use "skip" if not logged in
  const notes = useQuery(
    api.notes.getNotes,
    user?.userId ? { userId: user.userId } : "skip"
  );
  const createNote = useMutation(api.notes.createNote);
  const updateNote = useMutation(api.notes.updateNote);
  const deleteNote = useMutation(api.notes.deleteNote);

  const initialTab =
    (searchParams?.get("tab") as "kanban" | "chat" | "notes") || "kanban";
  const [tab, setTab] = React.useState<"kanban" | "chat" | "notes">(initialTab);

  React.useEffect(() => {
    const urlTab = (searchParams?.get("tab") as any) || "kanban";
    setTab(urlTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Se não está logado, não renderizar
  if (!user || !user.userId) {
    return <div>Carregando...</div>;
  }

  const onTabChange = (value: string) => {
    const next = (value as any) || "kanban";
    setTab(next);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", next);
      router.push(url.pathname + "?" + url.searchParams.toString());
    } catch {}
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Tabs value={tab} onValueChange={onTabChange} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="notes">Notas</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="kanban" className="mt-2">
          <KanbanMain showNotes={false} />
        </TabsContent>

        <TabsContent value="chat" className="mt-2">
          <div className="xl:min-h-[75vh] 2xl:min-h-[80vh]">
            <ChatEmbedded />
          </div>
        </TabsContent>

        <TabsContent value="notes" className="mt-2">
          <NotesSection
            notes={notes || []}
            onCreateNote={(data) =>
              createNote({ ...data, userId: user.userId })
            }
            onUpdateNote={(id, data) =>
              updateNote({ id: id as any, ...data, userId: user.userId })
            }
            onDeleteNote={(id) =>
              deleteNote({ id: id as any, userId: user.userId })
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <ResponsiveLayout
      title="Organize-se"
      subtitle="Converse, anote e organize suas tarefas em um só lugar"
    >
      <CalendarCombined />
    </ResponsiveLayout>
  );
}
