
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
                  <div className="w-10 h-10 glass-card rounded-lg flex items-center justify-center overflow-hidden">
                    {event.logo ? (
                      <img src={event.logo} alt={event.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 bg-teal-500/30 rounded-lg flex items-center justify-center">
                        <span className="text-teal-300 font-bold text-xs">
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

                <div className="space-y-1">
                  {demands.map((demand) => (
                    <div key={demand.id} className="glass-card rounded-md p-2 hover:bg-white/10 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full flex-shrink-0"></div>
                          
                          <div className="flex-1 min-w-0">
                            <span className="text-white font-medium text-sm truncate block">{demand.title}</span>
                          </div>
                          
                          <div className="hidden sm:block flex-shrink-0">
                            <span className="text-blue-200/70 text-xs truncate block max-w-[200px]">{demand.subject}</span>
                          </div>
                          
                          <div className="flex-shrink-0">
                            <span className="text-teal-300 text-xs whitespace-nowrap">
                              {demand.date.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-3 flex-shrink-0">
                          <button
                            onClick={() => handleRestore(demand.id)}
                            className="p-1.5 hover:bg-teal-500/40 rounded transition-all duration-200"
                            title="Restaurar demanda"
                          >
                            <RotateCcw size={12} className="text-teal-300" />
                          </button>
                          
                          <button
                            onClick={() => handlePermanentDelete(demand.id)}
                            className="p-1.5 hover:bg-red-500/30 rounded transition-all duration-200"
                            title="Excluir permanentemente"
                          >
                            <Trash2 size={12} className="text-red-300" />
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
