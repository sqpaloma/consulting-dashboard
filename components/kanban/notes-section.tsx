"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { NoteForm } from "./note-form";

interface NotesSectionProps {
  notes: any[];
  onCreateNote: (noteData: { title: string; content: string }) => void;
  onUpdateNote: (
    id: string,
    noteData: { title: string; content: string }
  ) => void;
  onDeleteNote: (id: string) => void;
}

export function NotesSection({
  notes,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
}: NotesSectionProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);

  const handleEditNote = (note: any) => {
    setEditingNote(note);
  };

  const handleUpdateNote = (noteData: { title: string; content: string }) => {
    if (editingNote) {
      onUpdateNote(editingNote._id, noteData);
      setEditingNote(null);
    }
  };

  return (
    <Card className="bg-white/10 border-white/20 text-white h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-white">Bloco de Notas</CardTitle>
          <Button
            variant="outline"
            onClick={() => setIsAddingNote(true)}
            className="bg-white text-gray-800 hover:bg-white/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Nota
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto pr-1">
          {notes?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {notes.map((note) => (
                <Card key={note._id} className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base text-white break-words">
                        {note.title}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditNote(note)}
                          className="h-6 w-6 p-0 text-white hover:bg-white/10"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteNote(note._id)}
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-white/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-white/80 whitespace-pre-wrap break-words">
                      {note.content}
                    </p>
                    <p className="text-xs text-white/50 mt-2">
                      {new Date(note.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/50">Nenhuma nota encontrada</p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Formulário para criar nota */}
      <NoteForm
        isOpen={isAddingNote}
        onClose={() => setIsAddingNote(false)}
        onSubmit={onCreateNote}
        title="Criar Nova Nota"
      />

      {/* Formulário para editar nota */}
      <NoteForm
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
        onSubmit={handleUpdateNote}
        initialData={
          editingNote
            ? { title: editingNote.title, content: editingNote.content }
            : undefined
        }
        title="Editar Nota"
      />
    </Card>
  );
}
