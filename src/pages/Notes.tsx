
import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import NoteForm from '@/components/NoteForm';
import { useSupabaseNotesManager } from '@/hooks/useSupabaseNotesManager';
import { Note } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Notes = () => {
  const { notes, isLoading, addNote, updateNote, deleteNote } = useSupabaseNotesManager();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const handleAddNote = async (noteData: any) => {
    try {
      await addNote(noteData);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
  };

  const handleUpdateNote = async (noteData: any) => {
    try {
      if (editingNote) {
        await updateNote(editingNote.id, noteData);
        setEditingNote(null);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setDeletingNoteId(null);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const getOwnerColor = (owner: string) => {
    return owner === 'Thiago' ? 'text-blue-300' : 'text-purple-300';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full relative">
        <Header />
        <main className="pt-24 px-4 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-white">Carregando...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      <Header />
      
      <main className="pt-24 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Anotações
                </h2>
                <p className="text-blue-200/70">
                  Organize suas anotações e lembretes importantes
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(true)}
                className="glass-button px-6 py-3 rounded-lg hover:bg-blue-500/30 transition-all duration-200 flex items-center space-x-2"
              >
                <Plus size={18} className="text-blue-300" />
                <span className="text-white font-medium">Nova Anotação</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="glass rounded-xl p-4 animate-fade-in">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="mb-3">
                      <span className="text-white font-medium text-sm leading-relaxed break-words">
                        {note.subject}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-blue-300 text-sm">
                          {note.priorityDate.toLocaleDateString('pt-BR')}
                        </span>
                        <span className={`text-sm font-medium ${getOwnerColor(note.owner)}`}>
                          {note.owner}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="glass-button p-2 rounded-lg hover:bg-blue-500/30 transition-all duration-200"
                      title="Editar anotação"
                    >
                      <Edit size={14} className="text-blue-300" />
                    </button>
                    <button
                      onClick={() => setDeletingNoteId(note.id)}
                      className="glass-button p-2 rounded-lg hover:bg-red-500/30 transition-all duration-200"
                      title="Excluir anotação"
                    >
                      <Trash2 size={14} className="text-red-300" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {notes.length === 0 && (
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-blue-200/70">Nenhuma anotação cadastrada</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="glass-popup border-blue-400/40">
          <DialogHeader>
            <DialogTitle className="text-white">Nova Anotação</DialogTitle>
          </DialogHeader>
          <NoteForm
            onSubmit={handleAddNote}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent className="glass-popup border-blue-400/40">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Anotação</DialogTitle>
          </DialogHeader>
          {editingNote && (
            <NoteForm
              onSubmit={handleUpdateNote}
              onCancel={() => setEditingNote(null)}
              initialData={{
                subject: editingNote.subject,
                priorityDate: editingNote.priorityDate,
                owner: editingNote.owner
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingNoteId} onOpenChange={() => setDeletingNoteId(null)}>
        <AlertDialogContent className="glass-popup border-blue-400/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-blue-200/70">
              Tem certeza que deseja excluir esta anotação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass-button">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingNoteId && handleDeleteNote(deletingNoteId)}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Notes;
