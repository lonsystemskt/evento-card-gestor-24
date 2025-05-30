
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

  const loadNotes = useCallback(async (skipLoading = false) => {
    if (loadingRef.current && !skipLoading) return;
    if (!skipLoading) loadingRef.current = true;

    try {
      console.log('Loading notes from Supabase...');
      
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

      console.log('Notes loaded:', transformedNotes.length);
      setNotes(transformedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast({
        title: "Erro ao carregar anotações",
        description: "Ocorreu um erro ao carregar as anotações do banco de dados.",
        variant: "destructive"
      });
    } finally {
      if (!skipLoading) {
        setIsLoading(false);
        loadingRef.current = false;
      }
    }
  }, [toast]);

  useEffect(() => {
    console.log('Setting up notes real-time subscription...');
    
    loadNotes();

    const handleRealtimeChange = (payload: any) => {
      console.log('Notes real-time change detected:', payload);
      loadNotes(true);
    };

    const channel = supabase
      .channel('notes-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notes'
      }, handleRealtimeChange)
      .subscribe();

    channelRef.current = channel;

    console.log('Notes real-time channel subscribed');

    return () => {
      console.log('Cleaning up notes real-time subscription...');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [loadNotes]);

  const addNote = async (noteData: Omit<Note, 'id' | 'createdAt'>) => {
    try {
      console.log('Adding note:', noteData);
      
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

      console.log('Note added successfully:', data);

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
      console.log('Updating note:', id, updates);
      
      const updateData: any = {};
      
      if (updates.subject !== undefined) updateData.subject = updates.subject;
      if (updates.priorityDate !== undefined) updateData.priority_date = updates.priorityDate.toISOString().split('T')[0];
      if (updates.owner !== undefined) updateData.owner = updates.owner;

      const { error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      console.log('Note updated successfully');

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
      console.log('Deleting note:', id);
      
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('Note deleted successfully');

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
