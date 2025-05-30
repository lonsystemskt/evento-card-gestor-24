
import React from 'react';
import { RotateCcw, Trash2, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import { useEventManager } from '@/hooks/useEventManager';

const CompletedDemands = () => {
  const { 
    getActiveEvents, 
    getCompletedDemands, 
    updateDemand, 
    deleteDemand 
  } = useEventManager();
  
  const activeEvents = getActiveEvents();
  const completedDemands = getCompletedDemands();

  const handleRestore = (id: string) => {
    updateDemand(id, { isCompleted: false });
  };

  const handlePermanentDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir permanentemente esta demanda? Esta ação não pode ser desfeita.')) {
      deleteDemand(id);
    }
  };

  const getEventName = (eventId: string) => {
    const event = activeEvents.find(e => e.id === eventId);
    return event?.name || 'Evento não encontrado';
  };

  const groupedDemands = activeEvents.reduce((acc, event) => {
    const eventDemands = completedDemands.filter(demand => demand.eventId === event.id);
    if (eventDemands.length > 0) {
      acc[event.id] = {
        event,
        demands: eventDemands
      };
    }
    return acc;
  }, {} as Record<string, { event: any, demands: any[] }>);

  return (
    <div className="min-h-screen w-full">
      <Header />
      
      <div className="pt-24 px-4">
        <div className="glass rounded-xl p-6 mb-6 text-left">
          <h2 className="text-2xl font-bold text-white mb-4 text-left">
            Demandas Concluídas
          </h2>
          <p className="text-blue-200/70 text-left">
            Gerencie suas demandas concluídas organizadas por evento
          </p>
        </div>

        {Object.keys(groupedDemands).length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-teal-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Nenhuma demanda concluída</h3>
              <p className="text-blue-200/70">
                As demandas concluídas aparecerão aqui organizadas por evento
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(groupedDemands).map(({ event, demands }) => (
              <div key={event.id} className="glass rounded-xl p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 glass-card rounded-lg flex items-center justify-center overflow-hidden">
                    {event.logo ? (
                      <img src={event.logo} alt={event.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-teal-500/30 rounded-lg flex items-center justify-center">
                        <span className="text-teal-300 font-bold text-sm">
                          {event.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-white font-medium text-lg">{event.name}</h3>
                    <p className="text-blue-200/70 text-sm">
                      {demands.length} demanda{demands.length !== 1 ? 's' : ''} concluída{demands.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  {demands.map((demand) => (
                    <div key={demand.id} className="glass-card rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                            <h4 className="text-white font-medium">{demand.title}</h4>
                          </div>
                          <p className="text-blue-200/70 text-sm mb-2">{demand.subject}</p>
                          <p className="text-teal-300 text-xs">
                            Concluída em: {demand.date.toLocaleDateString('pt-BR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleRestore(demand.id)}
                            className="glass-button p-2 rounded-lg hover:bg-teal-500/40 transition-all duration-200"
                            title="Restaurar demanda"
                          >
                            <RotateCcw size={14} className="text-teal-300" />
                          </button>
                          
                          <button
                            onClick={() => handlePermanentDelete(demand.id)}
                            className="glass-button p-2 rounded-lg hover:bg-red-500/30 transition-all duration-200"
                            title="Excluir permanentemente"
                          >
                            <Trash2 size={14} className="text-red-300" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedDemands;
