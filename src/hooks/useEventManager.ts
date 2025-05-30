
import { useState, useEffect } from 'react';
import { Event, Demand } from '@/types';

export const useEventManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [demands, setDemands] = useState<Demand[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('lon-events');
    const savedDemands = localStorage.getItem('lon-demands');
    
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
        ...event,
        date: new Date(event.date),
        createdAt: new Date(event.createdAt)
      }));
      setEvents(parsedEvents);
    }
    
    if (savedDemands) {
      const parsedDemands = JSON.parse(savedDemands).map((demand: any) => ({
        ...demand,
        date: new Date(demand.date),
        createdAt: new Date(demand.createdAt)
      }));
      setDemands(parsedDemands);
    }
  }, []);

  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem('lon-events', JSON.stringify(events));
  }, [events]);

  // Save demands to localStorage
  useEffect(() => {
    localStorage.setItem('lon-demands', JSON.stringify(demands));
  }, [demands]);

  const addEvent = (eventData: Omit<Event, 'id' | 'createdAt'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
      createdAt: new Date(),
      isPriority: false
    };
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<Event>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  };

  const toggleEventPriority = (id: string) => {
    setEvents(prev => prev.map(event => {
      if (event.id === id) {
        if (event.isPriority) {
          // Remove priority
          return { ...event, isPriority: false, priorityOrder: undefined };
        } else {
          // Add priority with current timestamp as order
          const maxPriorityOrder = Math.max(
            ...prev.filter(e => e.isPriority).map(e => e.priorityOrder || 0),
            0
          );
          return { 
            ...event, 
            isPriority: true, 
            priorityOrder: maxPriorityOrder + 1 
          };
        }
      }
      return event;
    }));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
    setDemands(prev => prev.filter(demand => demand.eventId !== id));
  };

  const addDemand = (demandData: Omit<Demand, 'id' | 'createdAt'>) => {
    const newDemand: Demand = {
      ...demandData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setDemands(prev => [...prev, newDemand]);
    return newDemand;
  };

  const updateDemand = (id: string, updates: Partial<Demand>) => {
    setDemands(prev => prev.map(demand => {
      if (demand.id === id) {
        // Se está marcando como concluída, atualizar a data para agora
        if (updates.isCompleted === true && !demand.isCompleted) {
          return { 
            ...demand, 
            ...updates, 
            date: new Date() // Atualiza para data/hora atual
          };
        }
        return { ...demand, ...updates };
      }
      return demand;
    }));
  };

  const deleteDemand = (id: string) => {
    setDemands(prev => prev.filter(demand => demand.id !== id));
  };

  const getActiveEvents = () => {
    const activeEvents = events.filter(event => !event.isArchived);
    
    // Separate priority and non-priority events
    const priorityEvents = activeEvents
      .filter(event => event.isPriority)
      .sort((a, b) => (a.priorityOrder || 0) - (b.priorityOrder || 0));
    
    const normalEvents = activeEvents
      .filter(event => !event.isPriority)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return [...priorityEvents, ...normalEvents];
  };

  const getArchivedEvents = () => events.filter(event => event.isArchived);
  
  const getActiveDemands = (eventId?: string) => {
    const activeDemands = demands.filter(demand => 
      !demand.isCompleted && 
      !demand.isArchived && 
      (eventId ? demand.eventId === eventId : true)
    );

    // Sort by urgency: overdue first, then current, then upcoming
    return activeDemands.sort((a, b) => {
      const getUrgencyScore = (demand: Demand) => {
        const today = new Date();
        const demandDate = new Date(demand.date);
        const diffDays = Math.ceil((demandDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        
        if (diffDays < 0) return 3; // overdue - highest priority
        if (diffDays <= 3) return 2; // current - medium priority
        return 1; // upcoming - lowest priority
      };

      const scoreA = getUrgencyScore(a);
      const scoreB = getUrgencyScore(b);
      
      if (scoreA !== scoreB) {
        return scoreB - scoreA; // Higher score first
      }
      
      // If same urgency, sort by date (earliest first)
      return a.date.getTime() - b.date.getTime();
    });
  };
    
  const getCompletedDemands = (eventId?: string) => 
    demands.filter(demand => 
      demand.isCompleted && 
      (eventId ? demand.eventId === eventId : true)
    );

  return {
    events,
    demands,
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
    getCompletedDemands
  };
};
