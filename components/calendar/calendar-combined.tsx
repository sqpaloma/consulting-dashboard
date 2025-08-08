"use client";

import { ChatEmbedded } from "@/components/chat";
import { NotesSection } from "@/components/kanban/notes-section";
import { KanbanMain } from "@/components/kanban/kanban-main";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function CalendarCombined() {
  const notes = useQuery(api.notes.getNotes);
  const createNote = useMutation(api.notes.createNote);
  const updateNote = useMutation(api.notes.updateNote);
  const deleteNote = useMutation(api.notes.deleteNote);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-2 items-start">
        {/* Chat com mais altura para caber completo (apenas em telas xl+) */}
        <div className="xl:min-h-[75vh] 2xl:min-h-[80vh] xl:col-span-2">
          <ChatEmbedded />
        </div>
        {/* Notas sem min-height em telas menores para evitar espaço vazio */}
        <div className="xl:col-span-1">
          <NotesSection
            notes={notes || []}
            onCreateNote={(data) => createNote(data)}
            onUpdateNote={(id, data) => updateNote({ id: id as any, ...data })}
            onDeleteNote={(id) => deleteNote({ id: id as any })}
          />
        </div>
      </div>

      <KanbanMain showNotes={false} />
    </div>
  );
}
