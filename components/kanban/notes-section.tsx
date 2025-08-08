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
    <Card className="bg-white/10 border-white/20 text-white">
      <CardHeader className="pb-3 border-b border-white/10">
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

      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes?.map((note) => (
            <Card key={note._id} className="h-fit">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{note.title}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditNote(note)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteNote(note._id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {note.content}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(note.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

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
      </CardContent>
    </Card>
  );
}
