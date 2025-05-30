
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
  const archivedEvents = 0;

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
    setSelectedEventId(demand.eventId);
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
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div></div>
            <button
              onClick={() => setShowEventForm(true)}
              className="glass-button px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center space-x-2 text-white text-sm sm:text-base"
            >
              <Plus size={14} className="sm:size-4 text-teal-300" />
              <span>Novo Evento</span>
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
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
              <div className="glass rounded-xl p-8 sm:p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Plus size={24} className="sm:size-8 text-teal-300" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Nenhum evento cadastrado</h3>
                  <p className="text-sm sm:text-base text-blue-200/70 mb-6">
                    Comece criando seu primeiro evento para organizar suas demandas
                  </p>
                  <button
                    onClick={() => setShowEventForm(true)}
                    className="glass-button px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base"
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
        <DemandForm
          eventId={selectedEventId}
          onSubmit={handleDemandSubmit}
          onCancel={closeDemandForm}
          initialData={editingDemand ? {
            title: editingDemand.title,
            subject: editingDemand.subject,
            date: editingDemand.date
          } : undefined}
          isModal={true}
        />
      )}
    </div>
  );
};

export default Dashboard;
