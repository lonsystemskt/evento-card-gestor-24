import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Header from '@/components/Header';
import SummaryIndicators from '@/components/SummaryIndicators';
import EventRow from '@/components/EventRow';
import EventForm from '@/components/EventForm';
import DemandForm from '@/components/DemandForm';
import { useEventManager } from '@/hooks/useEventManager';
import { Event, Demand, EventFormData, DemandFormData } from '@/types';

const Dashboard = () => {
  const {
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEventPriority,
    addDemand,
    updateDemand,
    deleteDemand,
    getActiveEvents,
    getActiveDemands,
    getCompletedDemands
  } = useEventManager();

  const [showEventForm, setShowEventForm] = useState(false);
  const [showDemandForm, setShowDemandForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingDemand, setEditingDemand] = useState<Demand | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const activeEvents = getActiveEvents();
  const activeDemands = getActiveDemands();
  const completedDemands = getCompletedDemands();
  const archivedEvents = 0; // Will implement later

  // Ordenar eventos por data (mais recentes primeiro)
  const sortedEvents = [...activeEvents].sort((a, b) => b.date.getTime() - a.date.getTime());

  const handleEventSubmit = (data: EventFormData) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, {
        name: data.name,
        date: data.date,
        logo: data.logo ? URL.createObjectURL(data.logo) : editingEvent.logo
      });
      setEditingEvent(null);
    } else {
      addEvent({
        name: data.name,
        date: data.date,
        logo: data.logo ? URL.createObjectURL(data.logo) : undefined,
        isArchived: false,
        isPriority: false
      });
    }
  };

  const handleDemandSubmit = (data: DemandFormData) => {
    if (editingDemand) {
      updateDemand(editingDemand.id, data);
      setEditingDemand(null);
    } else {
      addDemand({
        ...data,
        eventId: selectedEventId,
        isCompleted: false,
        isArchived: false
      });
    }
  };

  const handleAddDemand = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowDemandForm(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleEditDemand = (demand: Demand) => {
    setEditingDemand(demand);
    setShowDemandForm(true);
  };

  const handleArchiveEvent = (id: string) => {
    updateEvent(id, { isArchived: true });
  };

  const handleCompleteDemand = (id: string) => {
    updateDemand(id, { isCompleted: true });
  };

  const closeEventForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const closeDemandForm = () => {
    setShowDemandForm(false);
    setEditingDemand(null);
    setSelectedEventId('');
  };

  return (
    <div className="min-h-screen w-full relative">
      <Header />
      
      <SummaryIndicators
        totalEvents={activeEvents.length}
        pendingDemands={activeDemands.length}
        completedDemands={completedDemands.length}
        archivedEvents={archivedEvents}
      />
      
      <div className="pt-24">
        <div className="px-4 mt-8">
          <div className="flex items-center justify-between mb-6">
            <div></div>
            <button
              onClick={() => setShowEventForm(true)}
              className="glass-button px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-500/30 transition-all"
            >
              <Plus size={16} className="text-blue-300" />
              <span className="text-white">Novo Evento</span>
            </button>
          </div>

          <div className="space-y-4">
            {activeEvents.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                demands={getActiveDemands(event.id)}
                onAddDemand={handleAddDemand}
                onEditEvent={handleEditEvent}
                onArchiveEvent={handleArchiveEvent}
                onDeleteEvent={deleteEvent}
                onTogglePriority={toggleEventPriority}
                onEditDemand={handleEditDemand}
                onCompleteDemand={handleCompleteDemand}
                onDeleteDemand={deleteDemand}
              />
            ))}

            {activeEvents.length === 0 && (
              <div className="glass rounded-xl p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Plus size={32} className="text-blue-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Nenhum evento cadastrado</h3>
                  <p className="text-blue-200/70 mb-6">
                    Comece criando seu primeiro evento para organizar suas demandas
                  </p>
                  <button
                    onClick={() => setShowEventForm(true)}
                    className="glass-button px-6 py-3 rounded-lg hover:bg-blue-500/30 transition-all"
                  >
                    <span className="text-white font-medium">Criar Primeiro Evento</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <EventForm
        isOpen={showEventForm}
        onClose={closeEventForm}
        onSubmit={handleEventSubmit}
        initialData={editingEvent || undefined}
      />

      {showDemandForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingDemand ? 'Editar Demanda' : 'Nova Demanda'}
            </h2>
            <DemandForm
              eventId={selectedEventId}
              onSubmit={handleDemandSubmit}
              onCancel={closeDemandForm}
              initialData={editingDemand ? {
                title: editingDemand.title,
                subject: editingDemand.subject,
                date: editingDemand.date
              } : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
