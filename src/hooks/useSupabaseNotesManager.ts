
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseNotesManager = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const loadingRef = useRef(false);
  const channelRef = useRef<any>(null);

  const loadNotes = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('priority_date', { ascending: true });

      if (error) throw error;

      const transformedNotes: Note[] = data.map(note => ({
        id: note.id,
        subject: note.subject,
        priorityDate: new Date(note.priority_date),
        owner: note.owner as 'Thiago' | 'Kalil',
        createdAt: new Date(note.created_at)
      }));

      setNotes(transformedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast({
        title: "Erro ao carregar anotações",
        description: "Ocorreu um erro ao carregar as anotações do banco de dados.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [toast]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    loadNotes();

    const debouncedReload = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!loadingRef.current) {
          loadNotes();
        }
      }, 500);
    };

    const channel = supabase
      .channel('notes-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notes'
      }, debouncedReload)
      .subscribe();

    channelRef.current = channel;

    return () => {
      clearTimeout(timeoutId);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [loadNotes]);

  const addNote = async (noteData: Omit<Note, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          subject: noteData.subject,
          priority_date: noteData.priorityDate.toISOString().split('T')[0],
          owner: noteData.owner
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Anotação criada",
        description: "A anotação foi criada com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Erro ao criar anotação",
        description: "Ocorreu um erro ao criar a anotação.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const updateData: any = {};
      
      if (updates.subject !== undefined) updateData.subject = updates.subject;
      if (updates.priorityDate !== undefined) updateData.priority_date = updates.priorityDate.toISOString().split('T')[0];
      if (updates.owner !== undefined) updateData.owner = updates.owner;

      const { error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Anotação atualizada",
        description: "A anotação foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Erro ao atualizar anotação",
        description: "Ocorreu um erro ao atualizar a anotação.",
        variant: "destructive"
      });
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Anotação excluída",
        description: "A anotação foi excluída com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Erro ao excluir anotação",
        description: "Ocorreu um erro ao excluir a anotação.",
        variant: "destructive"
      });
    }
  };

  return {
    notes,
    isLoading,
    addNote,
    updateNote,
    deleteNote
  };
};
