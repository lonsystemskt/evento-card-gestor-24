
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event, Demand } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseEventManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [demands, setDemands] = useState<Demand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const loadingRef = useRef(false);
  const channelsRef = useRef<any[]>([]);

  // Função de carregamento otimizada com debounce
  const loadData = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      // Carregar dados em paralelo
      const [eventsResponse, demandsResponse] = await Promise.all([
        supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('demands')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (eventsResponse.error) throw eventsResponse.error;
      if (demandsResponse.error) throw demandsResponse.error;

      const transformedEvents: Event[] = eventsResponse.data.map(event => ({
        id: event.id,
        name: event.name,
        logo: event.logo || undefined,
        date: new Date(event.date),
        isArchived: event.is_archived,
        isPriority: event.is_priority,
        priorityOrder: event.priority_order || undefined,
        createdAt: new Date(event.created_at)
      }));

      const transformedDemands: Demand[] = demandsResponse.data.map(demand => ({
        id: demand.id,
        eventId: demand.event_id,
        title: demand.title,
        subject: demand.subject,
        date: new Date(demand.date),
        isCompleted: demand.is_completed,
        isArchived: demand.is_archived,
        createdAt: new Date(demand.created_at)
      }));

      setEvents(transformedEvents);
      setDemands(transformedDemands);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro ao carregar os dados.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [toast]);

  // Configurar real-time otimizado
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Carregar dados iniciais
    loadData();

    // Real-time com debounce
    const debouncedReload = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!loadingRef.current) {
          loadData();
        }
      }, 500);
    };

    // Canal único para eventos
    const eventsChannel = supabase
      .channel('events-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'events'
      }, debouncedReload)
      .subscribe();

    // Canal único para demandas
    const demandsChannel = supabase
      .channel('demands-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'demands'
      }, debouncedReload)
      .subscribe();

    channelsRef.current = [eventsChannel, demandsChannel];

    return () => {
      clearTimeout(timeoutId);
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    };
  }, [loadData]);

  const uploadEventLogo = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('event-logos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Erro ao fazer upload",
        description: "Ocorreu um erro ao fazer upload da logo.",
        variant: "destructive"
      });
      return null;
    }
  };

  const addEvent = async (eventData: Omit<Event, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          name: eventData.name,
          logo: eventData.logo || null,
          date: eventData.date.toISOString().split('T')[0],
          is_archived: eventData.isArchived,
          is_priority: eventData.isPriority,
          priority_order: eventData.priorityOrder
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Evento criado",
        description: "O evento foi criado com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Erro ao criar evento",
        description: "Ocorreu um erro ao criar o evento.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.logo !== undefined) updateData.logo = updates.logo;
      if (updates.date !== undefined) updateData.date = updates.date.toISOString().split('T')[0];
      if (updates.isArchived !== undefined) updateData.is_archived = updates.isArchived;
      if (updates.isPriority !== undefined) updateData.is_priority = updates.isPriority;
      if (updates.priorityOrder !== undefined) updateData.priority_order = updates.priorityOrder;

      const { error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Evento atualizado",
        description: "O evento foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Erro ao atualizar evento",
        description: "Ocorreu um erro ao atualizar o evento.",
        variant: "destructive"
      });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Evento excluído",
        description: "O evento foi excluído com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Erro ao excluir evento",
        description: "Ocorreu um erro ao excluir o evento.",
        variant: "destructive"
      });
    }
  };

  const toggleEventPriority = async (id: string) => {
    try {
      const event = events.find(e => e.id === id);
      if (!event) return;

      let updateData: any = {};

      if (event.isPriority) {
        updateData = {
          is_priority: false,
          priority_order: null
        };
      } else {
        const maxPriorityOrder = Math.max(
          ...events.filter(e => e.isPriority).map(e => e.priorityOrder || 0),
          0
        );
        updateData = {
          is_priority: true,
          priority_order: maxPriorityOrder + 1
        };
      }

      const { error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling event priority:', error);
      toast({
        title: "Erro ao alterar prioridade",
        description: "Ocorreu um erro ao alterar a prioridade do evento.",
        variant: "destructive"
      });
    }
  };

  const addDemand = async (demandData: Omit<Demand, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('demands')
        .insert({
          event_id: demandData.eventId,
          title: demandData.title,
          subject: demandData.subject,
          date: demandData.date.toISOString().split('T')[0],
          is_completed: demandData.isCompleted,
          is_archived: demandData.isArchived
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Demanda criada",
        description: "A demanda foi criada com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error adding demand:', error);
      toast({
        title: "Erro ao criar demanda",
        description: "Ocorreu um erro ao criar a demanda.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateDemand = async (id: string, updates: Partial<Demand>) => {
    try {
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.subject !== undefined) updateData.subject = updates.subject;
      if (updates.date !== undefined) updateData.date = updates.date.toISOString().split('T')[0];
      if (updates.isCompleted !== undefined) updateData.is_completed = updates.isCompleted;
      if (updates.isArchived !== undefined) updateData.is_archived = updates.isArchived;

      const { error } = await supabase
        .from('demands')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Demanda atualizada",
        description: "A demanda foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Error updating demand:', error);
      toast({
        title: "Erro ao atualizar demanda",
        description: "Ocorreu um erro ao atualizar a demanda.",
        variant: "destructive"
      });
    }
  };

  const deleteDemand = async (id: string) => {
    try {
      const { error } = await supabase
        .from('demands')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Demanda excluída",
        description: "A demanda foi excluída com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting demand:', error);
      toast({
        title: "Erro ao excluir demanda",
        description: "Ocorreu um erro ao excluir a demanda.",
        variant: "destructive"
      });
    }
  };

  const getActiveEvents = useCallback(() => {
    const activeEvents = events.filter(event => !event.isArchived);
    
    const priorityEvents = activeEvents
      .filter(event => event.isPriority)
      .sort((a, b) => (a.priorityOrder || 0) - (b.priorityOrder || 0));
    
    const normalEvents = activeEvents
      .filter(event => !event.isPriority)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return [...priorityEvents, ...normalEvents];
  }, [events]);

  const getArchivedEvents = useCallback(() => 
    events.filter(event => event.isArchived), [events]);
  
  const getActiveDemands = useCallback((eventId?: string) => {
    const activeDemands = demands.filter(demand => 
      !demand.isCompleted && 
      !demand.isArchived && 
      (eventId ? demand.eventId === eventId : true)
    );

    return activeDemands.sort((a, b) => {
      const getUrgencyScore = (demand: Demand) => {
        const today = new Date();
        const demandDate = new Date(demand.date);
        const diffDays = Math.ceil((demandDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        
        if (diffDays < 0) return 3;
        if (diffDays <= 3) return 2;
        return 1;
      };

      const scoreA = getUrgencyScore(a);
      const scoreB = getUrgencyScore(b);
      
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      
      return a.date.getTime() - b.date.getTime();
    });
  }, [demands]);
    
  const getCompletedDemands = useCallback((eventId?: string) => 
    demands.filter(demand => 
      demand.isCompleted && 
      (eventId ? demand.eventId === eventId : true)
    ), [demands]);

  return {
    events,
    demands,
    isLoading,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEventPriority,
    addDemand,
    updateDemand,
    deleteDemand,
    getActiveEvents,
    getArchivedEvents,
    getActiveDemands,
    getCompletedDemands,
    uploadEventLogo
  };
};
